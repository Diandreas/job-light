<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class GuestPaymentController extends Controller
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
     * Initialiser un paiement guest CinetPay
     */
    public function initializeGuestPayment(Request $request)
    {
        try {
            $request->validate([
                'paymentToken' => 'required|string',
                'currency' => 'required|string|in:XAF,XOF,EUR',
                'customerName' => 'required|string',
                'customerEmail' => 'required|email'
            ]);

            // Récupérer les données de paiement guest
            $guestPaymentData = Cache::get("guest_payment_{$request->paymentToken}");
            
            if (!$guestPaymentData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session de paiement expirée'
                ], 400);
            }

            $transactionId = 'guest_cv_' . $request->paymentToken;
            $amount = $guestPaymentData['price'] * 100; // CinetPay attend les montants en centimes

            // Convertir le montant selon la devise
            if ($request->currency === 'XAF') {
                $amount = $guestPaymentData['price'] * 655.957; // Conversion EUR -> XAF
            } elseif ($request->currency === 'XOF') {
                $amount = $guestPaymentData['price'] * 655.957; // Conversion EUR -> XOF
            }

            // Préparer les données pour CinetPay
            $paymentData = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId,
                'amount' => round($amount),
                'currency' => $request->currency,
                'description' => 'Téléchargement CV Guidy - Mode invité',
                'customer_name' => $request->customerName,
                'customer_surname' => '',
                'customer_email' => $request->customerEmail,
                'customer_phone_number' => '',
                'notify_url' => route('guest-payment.cinetpay.notify'),
                'return_url' => route('guest-cv.index') . '?payment=success&token=' . $request->paymentToken,
                'channels' => 'ALL',
                'lang' => 'fr',
                'metadata' => json_encode([
                    'payment_token' => $request->paymentToken,
                    'type' => 'guest_cv_download',
                    'original_amount_eur' => $guestPaymentData['price']
                ])
            ];

            // Appel à l'API CinetPay
            $response = Http::post($this->baseUrl . '/payment', $paymentData);

            if ($response->successful()) {
                $result = $response->json();
                
                if ($result['code'] === '201') {
                    // Mettre à jour les données guest avec les infos de paiement
                    $guestPaymentData['cinetpay_transaction_id'] = $transactionId;
                    $guestPaymentData['cinetpay_payment_token'] = $result['data']['payment_token'] ?? null;
                    $guestPaymentData['payment_status'] = 'initiated';
                    
                    Cache::put("guest_payment_{$request->paymentToken}", $guestPaymentData, 3600);

                    return response()->json([
                        'success' => true,
                        'payment_url' => $result['data']['payment_url'],
                        'transaction_id' => $transactionId
                    ]);
                } else {
                    Log::error('CinetPay API error for guest payment', [
                        'code' => $result['code'],
                        'message' => $result['message'] ?? 'Unknown error',
                        'payment_token' => $request->paymentToken
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Erreur lors de l\'initialisation du paiement: ' . ($result['message'] ?? 'Erreur inconnue')
                    ], 400);
                }
            } else {
                Log::error('CinetPay HTTP error for guest payment', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'payment_token' => $request->paymentToken
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de communication avec le service de paiement'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Guest CinetPay initialization error: ' . $e->getMessage(), [
                'payment_token' => $request->paymentToken ?? null,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initialisation du paiement'
            ], 500);
        }
    }

    /**
     * Webhook de notification CinetPay pour paiements guest
     */
    public function notifyGuest(Request $request)
    {
        try {
            Log::info('Guest CinetPay webhook received', $request->all());

            $transactionId = $request->cpm_trans_id;
            $status = $request->cpm_result;
            $amount = $request->cpm_amount;
            $currency = $request->cpm_currency;
            
            // Extraire le token de paiement depuis transaction_id
            $paymentToken = str_replace('guest_cv_', '', $transactionId);
            
            // Récupérer les données guest
            $guestPaymentData = Cache::get("guest_payment_{$paymentToken}");
            
            if (!$guestPaymentData) {
                Log::warning('Guest payment data not found for webhook', [
                    'transaction_id' => $transactionId,
                    'payment_token' => $paymentToken
                ]);
                return response('Payment data not found', 404);
            }

            if ($status === '00') {
                // Paiement réussi
                $guestPaymentData['status'] = 'completed';
                $guestPaymentData['cinetpay_transaction_id'] = $transactionId;
                $guestPaymentData['completed_at'] = now();
                
                Cache::put("guest_payment_{$paymentToken}", $guestPaymentData, 1800); // 30 min pour télécharger

                Log::info('Guest payment completed successfully', [
                    'payment_token' => $paymentToken,
                    'transaction_id' => $transactionId,
                    'amount' => $amount,
                    'email' => $guestPaymentData['email']
                ]);

                return response('SUCCES');
            } else {
                // Paiement échoué
                $guestPaymentData['status'] = 'failed';
                $guestPaymentData['failure_reason'] = $request->cpm_error_message ?? 'Paiement échoué';
                
                Cache::put("guest_payment_{$paymentToken}", $guestPaymentData, 600); // 10 min pour retry

                Log::warning('Guest payment failed', [
                    'payment_token' => $paymentToken,
                    'transaction_id' => $transactionId,
                    'error' => $request->cpm_error_message
                ]);

                return response('ECHEC');
            }

        } catch (\Exception $e) {
            Log::error('Guest CinetPay webhook error: ' . $e->getMessage(), [
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response('ERROR', 500);
        }
    }

    /**
     * Retour après paiement guest
     */
    public function returnGuest(Request $request)
    {
        $paymentToken = $request->get('token');
        $status = $request->get('payment');

        if (!$paymentToken) {
            return redirect()->route('guest-cv.index')->with('error', 'Token de paiement manquant');
        }

        $guestPaymentData = Cache::get("guest_payment_{$paymentToken}");

        if (!$guestPaymentData) {
            return redirect()->route('guest-cv.index')->with('error', 'Session de paiement expirée');
        }

        if ($status === 'success' && $guestPaymentData['status'] === 'completed') {
            return redirect()->route('guest-cv.index')->with([
                'success' => 'Paiement confirmé ! Vous pouvez maintenant télécharger votre CV.',
                'payment_token' => $paymentToken,
                'can_download' => true
            ]);
        }

        return redirect()->route('guest-cv.index')->with('error', 'Paiement non confirmé');
    }
}