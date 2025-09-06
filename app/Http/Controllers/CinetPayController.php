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
                'currency' => 'required|string|in:XAF,XOF,CDF,GNF',
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

            // Extraire les tokens de la description pour les stocker en métadonnées
            $tokensMatch = [];
            preg_match('/(\d+)\s+tokens/', $request->description, $tokensMatch);
            $tokens = isset($tokensMatch[1]) ? (int)$tokensMatch[1] : 0;

            // Créer l'enregistrement de paiement dans la base de données
            $payment = Payment::create([
                'user_id' => auth()->id(),
                'transaction_id' => $request->transaction_id,
                'amount' => $request->amount,
                'currency' => $request->currency,
                'description' => $request->description,
                'status' => 'pending',
                'payment_method' => 'cinetpay',
                'metadata' => json_encode([
                    'tokens' => $tokens,
                    'request_data' => $request->all()
                ])
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
            if (!$request->has('cpm_trans_id') || !$request->has('cpm_site_id')) {
                Log::warning('CinetPay notification missing required parameters');
                return response('Missing required parameters', 400);
            }

            $transactionId = $request->cpm_trans_id;
            $siteId = $request->cpm_site_id;

            // Vérifier que le site_id correspond
            if ($siteId != $this->siteId) {
                Log::warning('Invalid site_id in notification', ['received' => $siteId, 'expected' => $this->siteId]);
                return response('Invalid site_id', 400);
            }

            // Chercher le paiement dans notre base
            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                Log::warning('Payment not found for transaction', ['transaction_id' => $transactionId]);
                return response('Payment not found', 404);
            }

            // Si le paiement est déjà traité avec succès, ne rien faire
            if ($payment->status === 'completed') {
                Log::info('Payment already processed', ['transaction_id' => $transactionId]);
                return response('OK', 200);
            }

            // ÉTAPE IMPORTANTE: Vérifier le statut du paiement auprès de CinetPay
            // (Comme recommandé dans la doc: ne jamais faire confiance aux données POST)
            $statusResponse = Http::post($this->baseUrl . '/payment/check', [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId
            ]);

            if ($statusResponse->successful()) {
                $statusResult = $statusResponse->json();
                
                Log::info('CinetPay status check response', $statusResult);

                if ($statusResult['code'] === '00') {
                    // Paiement réussi (status: ACCEPTED)
                    if ($statusResult['data']['status'] === 'ACCEPTED') {
                        $payment->update([
                            'status' => 'completed',
                            'completed_at' => now(),
                            'external_data' => json_encode($statusResult)
                        ]);

                        // Mettre à jour le solde de l'utilisateur
                        $this->updateUserBalance($payment);

                        Log::info('Payment completed successfully', [
                            'transaction_id' => $transactionId,
                            'payment_id' => $payment->id,
                            'amount' => $statusResult['data']['amount'],
                            'payment_method' => $statusResult['data']['payment_method']
                        ]);
                    }
                } else if ($statusResult['code'] === '627' || $statusResult['data']['status'] === 'REFUSED') {
                    // Paiement refusé/annulé
                    $payment->update([
                        'status' => 'failed',
                        'external_data' => json_encode($statusResult)
                    ]);

                    Log::warning('Payment failed', [
                        'transaction_id' => $transactionId,
                        'code' => $statusResult['code'],
                        'message' => $statusResult['message'] ?? 'Transaction refused'
                    ]);
                } else {
                    // Statut en attente (WAITING_FOR_CUSTOMER, etc.)
                    Log::info('Payment still pending', [
                        'transaction_id' => $transactionId,
                        'status' => $statusResult['data']['status'] ?? 'Unknown'
                    ]);
                    // Ne pas mettre à jour le statut pour les paiements en attente
                }
            } else {
                Log::error('Failed to check payment status with CinetPay API', [
                    'transaction_id' => $transactionId,
                    'response' => $statusResponse->body()
                ]);
            }

            // Toujours retourner 200 OK pour confirmer la réception de la notification
            return response('OK', 200);

        } catch (\Exception $e) {
            Log::error('CinetPay notification error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response('Error', 500);
        }
    }

    /**
     * Page de retour - appelée après le paiement (GET)
     * Selon la doc CinetPay, cette URL doit être disponible en GET et POST
     */
    public function return(Request $request)
    {
        try {
            error_log("=== CINETPAY CONTROLLER RETURN START ===");
            error_log("Method: " . $request->method());
            error_log("URL: " . $request->fullUrl());
            error_log("Data: " . json_encode($request->all()));
            
            Log::info('CinetPay return page accessed', [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'data' => $request->all(),
                'headers' => $request->headers->all()
            ]);
            
            error_log("Laravel log written from controller");

            // Pour les requêtes GET, on vérifie juste que l'URL est disponible
            // CinetPay ping cette URL pour s'assurer qu'elle est accessible
            if ($request->isMethod('GET')) {
                // Retourner une page simple pour confirmer que l'URL est disponible
                return response()->view('cinetpay.return-test', [
                    'status' => 'available',
                    'message' => 'URL de retour disponible'
                ], 200);
            }

            // Pour les requêtes POST (retour après paiement)
            $transactionId = $request->transaction_id ?? $request->token;
            
            if (!$transactionId) {
                Log::warning('CinetPay return: Transaction ID manquant');
                return redirect()->route('payment.failed')->with('error', 'Transaction ID manquant');
            }

            Log::info('CinetPay return: Processing transaction', ['transaction_id' => $transactionId]);

            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                Log::warning('CinetPay return: Paiement non trouvé', ['transaction_id' => $transactionId]);
                return redirect()->route('payment.failed')->with('error', 'Paiement non trouvé');
            }

            // Vérifier le statut du paiement auprès de CinetPay (comme recommandé dans la doc)
            $statusResponse = Http::post($this->baseUrl . '/payment/check', [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId
            ]);

            if ($statusResponse->successful()) {
                $statusResult = $statusResponse->json();
                
                if ($statusResult['code'] === '00' && $statusResult['data']['status'] === 'ACCEPTED') {
                    // Paiement réussi
                    Log::info('CinetPay return: Paiement confirmé réussi', [
                        'transaction_id' => $transactionId,
                        'amount' => $statusResult['data']['amount']
                    ]);
                    
                    return redirect()->route('payment.success')->with([
                        'success' => 'Paiement effectué avec succès',
                        'transaction_id' => $transactionId,
                        'amount' => $statusResult['data']['amount']
                    ]);
                } else {
                    // Paiement échoué ou en attente
                    Log::warning('CinetPay return: Paiement non confirmé', [
                        'transaction_id' => $transactionId,
                        'status' => $statusResult['data']['status'] ?? 'Unknown',
                        'code' => $statusResult['code']
                    ]);
                    
                    return redirect()->route('payment.failed')->with('error', 'Le paiement n\'a pas pu être confirmé');
                }
            } else {
                Log::error('CinetPay return: Erreur vérification statut', [
                    'transaction_id' => $transactionId,
                    'response' => $statusResponse->body()
                ]);
                
                // En cas d'erreur de vérification, utiliser le statut local
                if ($payment->status === 'completed') {
                    return redirect()->route('payment.success')->with('success', 'Paiement effectué avec succès');
                } else {
                    return redirect()->route('payment.failed')->with('error', 'Le paiement n\'a pas pu être complété');
                }
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
            $metadata = json_decode($payment->metadata, true);
            
            // Priorité aux métadonnées du paiement initial, sinon calcul depuis le montant
            if (isset($metadata['tokens'])) {
                $tokensToAdd = $metadata['tokens'];
            } else {
                $tokensToAdd = $this->calculateTokensFromAmount($payment->amount);
            }
            
            // Mettre à jour le solde de l'utilisateur
            $oldBalance = $user->wallet_balance;
            $user->increment('wallet_balance', $tokensToAdd);
            
            Log::info('User balance updated', [
                'user_id' => $user->id,
                'tokens_added' => $tokensToAdd,
                'old_balance' => $oldBalance,
                'new_balance' => $user->wallet_balance,
                'payment_amount' => $payment->amount
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
        // Grille tarifaire basée sur les packs définis dans le frontend
        $packs = [
            600 => 10,     // Starter: 600 FCFA = 10 tokens
            1200 => 25,    // Plus: 1200 FCFA = 25 tokens (20 + 5 bonus)
            3000 => 60,    // Pro: 3000 FCFA = 60 tokens (50 + 10 bonus)
            6000 => 130    // Ultimate: 6000 FCFA = 130 tokens (100 + 30 bonus)
        ];
        
        return $packs[$amount] ?? floor($amount / 60); // Fallback: 1 token = 60 FCFA
    }
}
