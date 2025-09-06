<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Models\User;

class CinetPayWebhookController extends Controller
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
     * Handle CinetPay callback (webhook)
     * Cette méthode gère les retours POST de CinetPay sans middleware CSRF
     */
    public function handleCallback(Request $request)
    {
        try {
            Log::info('CinetPay webhook callback received', [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'data' => $request->all(),
                'headers' => $request->headers->all()
            ]);

            // Pour les requêtes GET, on vérifie juste que l'URL est disponible
            if ($request->isMethod('GET')) {
                return response()->json([
                    'status' => 'available',
                    'message' => 'CinetPay callback URL is available',
                    'timestamp' => now()->toISOString()
                ], 200);
            }

            // Pour les requêtes POST (retour après paiement)
            $transactionId = $request->transaction_id ?? $request->cpm_trans_id;
            
            if (!$transactionId) {
                Log::warning('CinetPay callback: Transaction ID manquant');
                return response()->json(['error' => 'Transaction ID manquant'], 400);
            }

            Log::info('CinetPay callback: Processing transaction', ['transaction_id' => $transactionId]);

            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                Log::warning('CinetPay callback: Paiement non trouvé', ['transaction_id' => $transactionId]);
                return response()->json(['error' => 'Paiement non trouvé'], 404);
            }

            // Vérifier le statut du paiement auprès de CinetPay
            $statusResponse = Http::post($this->baseUrl . '/payment/check', [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId
            ]);

            if ($statusResponse->successful()) {
                $statusResult = $statusResponse->json();
                
                if ($statusResult['code'] === '00' && $statusResult['data']['status'] === 'ACCEPTED') {
                    // Paiement réussi
                    Log::info('CinetPay callback: Paiement confirmé réussi', [
                        'transaction_id' => $transactionId,
                        'amount' => $statusResult['data']['amount']
                    ]);
                    
                    // Rediriger vers la page de succès
                    return redirect()->route('payment.success')->with([
                        'success' => 'Paiement effectué avec succès',
                        'transaction_id' => $transactionId,
                        'amount' => $statusResult['data']['amount']
                    ]);
                } else {
                    // Paiement échoué ou en attente
                    Log::warning('CinetPay callback: Paiement non confirmé', [
                        'transaction_id' => $transactionId,
                        'status' => $statusResult['data']['status'] ?? 'Unknown',
                        'code' => $statusResult['code']
                    ]);
                    
                    return redirect()->route('payment.failed')->with('error', 'Le paiement n\'a pas pu être confirmé');
                }
            } else {
                Log::error('CinetPay callback: Erreur vérification statut', [
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
            Log::error('CinetPay webhook callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Erreur lors du traitement du callback'], 500);
        }
    }
}
