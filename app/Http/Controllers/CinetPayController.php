<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Models\User;

class CinetPayController extends Controller
{
    private $apiKey;
    private $siteId;
    private $secretKey;
    private $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('cinetpay.api_key');
        $this->siteId = config('cinetpay.site_id');
        $this->secretKey = config('cinetpay.secret_key');
        $this->baseUrl = config('cinetpay.base_url', 'https://api-checkout.cinetpay.com/v2');
    }

    /**
     * Initialiser un paiement CinetPay
     */
    public function initialize(Request $request)
    {
        try {
            $request->validate([
                'transaction_id' => 'required|string|max:255',
                'amount' => 'required|numeric|min:100',
                'currency' => 'required|string|in:XOF,XAF,CDF,GNF',
                'description' => 'required|string|max:255',
                'customer_name' => 'required|string|max:255',
                'customer_surname' => 'nullable|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone_number' => 'nullable|string|max:20',
                'notify_url' => 'required|url',
                'return_url' => 'required|url',
                'channels' => 'required|string',
                'lang' => 'required|string|in:fr,en',
                'metadata' => 'nullable|string',
                'invoice_data' => 'nullable|array'
            ]);

            // Créer l'enregistrement de paiement dans la base de données
            $payment = Payment::create([
                'user_id' => auth()->id(),
                'transaction_id' => $request->transaction_id,
                'amount' => $request->amount,
                'currency' => $request->currency,
                'description' => $request->description,
                'status' => 'pending',
                'payment_method' => 'cinetpay',
                'metadata' => json_encode($request->all())
            ]);

            // Préparer les données pour CinetPay
            $paymentData = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $request->transaction_id,
                'amount' => $request->amount,
                'currency' => $request->currency,
                'description' => $request->description,
                'customer_name' => $request->customer_name,
                'customer_surname' => $request->customer_surname,
                'customer_email' => $request->customer_email,
                'customer_phone_number' => $request->customer_phone_number,
                'notify_url' => $request->notify_url,
                'return_url' => $request->return_url,
                'channels' => $request->channels,
                'lang' => $request->lang,
                'metadata' => $request->metadata,
                'invoice_data' => $request->invoice_data
            ];

            // Appel à l'API CinetPay
            $response = Http::post($this->baseUrl . '/payment', $paymentData);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['code'] === '201') {
                    // Mettre à jour le statut du paiement
                    $payment->update([
                        'external_id' => $result['data']['payment_token'] ?? null,
                        'status' => 'initiated'
                    ]);

                    return response()->json([
                        'success' => true,
                        'payment_url' => $result['data']['payment_url'],
                        'transaction_id' => $request->transaction_id
                    ]);
                } else {
                    Log::error('CinetPay API error', [
                        'code' => $result['code'],
                        'message' => $result['message'] ?? 'Unknown error',
                        'data' => $result
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Erreur lors de l\'initialisation du paiement: ' . ($result['message'] ?? 'Erreur inconnue')
                    ], 400);
                }
            } else {
                Log::error('CinetPay HTTP error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de communication avec CinetPay'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('CinetPay initialization error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur interne du serveur'
            ], 500);
        }
    }

    /**
     * Page de notification (IPN) - appelée par CinetPay
     */
    public function notify(Request $request)
    {
        try {
            Log::info('CinetPay notification received', $request->all());

            // Vérifier que la notification contient les paramètres requis
            if (!$request->has('cpm_trans_id')) {
                Log::warning('CinetPay notification missing cpm_trans_id');
                return response('Missing transaction ID', 400);
            }

            $transactionId = $request->cpm_trans_id;
            $siteId = $request->cpm_site_id;

            // Vérifier le statut du paiement
            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                Log::warning('Payment not found for transaction', ['transaction_id' => $transactionId]);
                return response('Payment not found', 404);
            }

            // Vérifier que le paiement n'a pas déjà été traité
            if ($payment->status === 'completed') {
                Log::info('Payment already processed', ['transaction_id' => $transactionId]);
                return response('OK');
            }

            // Vérifier le statut du paiement auprès de CinetPay
            $statusResponse = Http::post($this->baseUrl . '/payment/check', [
                'apikey' => $this->apiKey,
                'site_id' => $siteId,
                'transaction_id' => $transactionId
            ]);

            if ($statusResponse->successful()) {
                $statusResult = $statusResponse->json();
                
                if ($statusResult['code'] === '00') {
                    // Paiement réussi
                    $payment->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'external_data' => json_encode($statusResult)
                    ]);

                    // Mettre à jour le solde de l'utilisateur si nécessaire
                    $this->updateUserBalance($payment);

                    Log::info('Payment completed successfully', [
                        'transaction_id' => $transactionId,
                        'payment_id' => $payment->id
                    ]);
                } else {
                    // Paiement échoué
                    $payment->update([
                        'status' => 'failed',
                        'external_data' => json_encode($statusResult)
                    ]);

                    Log::warning('Payment failed', [
                        'transaction_id' => $transactionId,
                        'code' => $statusResult['code'],
                        'message' => $statusResult['message'] ?? 'Unknown error'
                    ]);
                }
            } else {
                Log::error('Failed to check payment status', [
                    'transaction_id' => $transactionId,
                    'response' => $statusResponse->body()
                ]);
            }

            return response('OK');

        } catch (\Exception $e) {
            Log::error('CinetPay notification error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response('Error', 500);
        }
    }

    /**
     * Page de retour - appelée après le paiement
     */
    public function return(Request $request)
    {
        try {
            Log::info('CinetPay return page accessed', $request->all());

            $transactionId = $request->transaction_id ?? $request->token;
            
            if (!$transactionId) {
                return redirect()->route('payment.failed')->with('error', 'Transaction ID manquant');
            }

            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                return redirect()->route('payment.failed')->with('error', 'Paiement non trouvé');
            }

            if ($payment->status === 'completed') {
                return redirect()->route('payment.success')->with('success', 'Paiement effectué avec succès');
            } else {
                return redirect()->route('payment.failed')->with('error', 'Le paiement n\'a pas pu être complété');
            }

        } catch (\Exception $e) {
            Log::error('CinetPay return page error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('payment.failed')->with('error', 'Erreur lors du traitement du retour');
        }
    }

    /**
     * Mettre à jour le solde de l'utilisateur après un paiement réussi
     */
    private function updateUserBalance(Payment $payment)
    {
        try {
            $user = $payment->user;
            
            // Calculer les tokens à ajouter (logique métier à adapter selon vos besoins)
            $tokensToAdd = $this->calculateTokensFromAmount($payment->amount);
            
            // Mettre à jour le solde de l'utilisateur
            $user->increment('tokens', $tokensToAdd);
            
            Log::info('User balance updated', [
                'user_id' => $user->id,
                'tokens_added' => $tokensToAdd,
                'new_balance' => $user->tokens
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update user balance', [
                'payment_id' => $payment->id,
                'user_id' => $payment->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Calculer le nombre de tokens à partir du montant payé
     */
    private function calculateTokensFromAmount($amount)
    {
        // Logique à adapter selon votre grille tarifaire
        // Exemple simple : 1 token = 100 FCFA
        return floor($amount / 100);
    }
}
