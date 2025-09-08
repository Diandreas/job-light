<?php

namespace App\Http\Controllers;

use App\Services\PaymentGatewayService;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class UnifiedPaymentController extends Controller
{
    protected $paymentGateway;

    public function __construct(PaymentGatewayService $paymentGateway)
    {
        $this->paymentGateway = $paymentGateway;
    }

    /**
     * Initie un paiement selon le fournisseur choisi
     * @param Request $request
     * @return JsonResponse
     */
    public function initiatePayment(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string|in:cinetpay,pluto,fapshi',
            'amount' => 'required|numeric|min:100',
            'currency' => 'string|in:XAF,XOF,CDF,GNF',
            'description' => 'string|max:255',
            'customer_email' => 'email',
            'customer_phone' => 'nullable|string|regex:/^6[0-9]{8}$/',
            'customer_name' => 'string|max:100',
            'payment_type' => 'string|in:web,mobile'
        ]);

        try {
            $provider = $request->input('provider');
            $amount = $request->input('amount');
            $currency = $request->input('currency', 'XAF');
            
            // Générer un ID de transaction unique
            $transactionId = $this->paymentGateway->generateTransactionId($provider);
            
            // Préparer les données de paiement
            $paymentData = [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'currency' => $currency,
                'description' => $request->input('description', 'Paiement'),
                'customer_email' => $request->input('customer_email'),
                'customer_phone' => $request->input('customer_phone'),
                'customer_name' => $request->input('customer_name', 'Client'),
                'customer_surname' => $request->input('customer_surname', ''),
                'phone' => $request->input('customer_phone'),
                'email' => $request->input('customer_email'),
                'external_id' => $transactionId,
                'user_id' => auth()->id() ?? 'guest',
                'notify_url' => route('payments.notify'),
                'return_url' => route('payments.return'),
                'callback_url' => route('payments.notify')
            ];

            // Enregistrer le paiement en base
            $payment = Payment::create([
                'transaction_id' => $transactionId,
                'provider' => $provider,
                'amount' => $amount,
                'currency' => $currency,
                'status' => 'pending',
                'customer_email' => $request->input('customer_email'),
                'customer_phone' => $request->input('customer_phone'),
                'description' => $request->input('description', 'Paiement'),
                'user_id' => auth()->id(),
                'metadata' => json_encode([
                    'payment_type' => $request->input('payment_type', 'web'),
                    'customer_name' => $request->input('customer_name'),
                    'ip_address' => $request->ip()
                ])
            ]);

            // Initier le paiement
            $result = $this->paymentGateway->initiatePayment($provider, $paymentData);

            if (isset($result['success']) && $result['success']) {
                // Mettre à jour avec les données de retour
                $payment->update([
                    'gateway_response' => json_encode($result)
                ]);

                Log::info('Payment initiated successfully', [
                    'transaction_id' => $transactionId,
                    'provider' => $provider,
                    'amount' => $amount
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement initié avec succès',
                    'transaction_id' => $transactionId,
                    'payment_url' => $result['data']['payment_url'] ?? null,
                    'provider' => $provider,
                    'data' => $result
                ]);
            } else {
                $payment->update(['status' => 'failed']);
                
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Erreur lors de l\'initiation du paiement',
                    'error' => $result
                ], 400);
            }

        } catch (Exception $e) {
            Log::error('Payment initiation error', [
                'error' => $e->getMessage(),
                'provider' => $request->input('provider'),
                'amount' => $request->input('amount')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Paiement direct mobile
     * @param Request $request
     * @return JsonResponse
     */
    public function directMobilePayment(Request $request): JsonResponse
    {
        $request->validate([
            'provider' => 'required|string|in:pluto,fapshi',
            'amount' => 'required|numeric|min:100',
            'phone' => 'required|string|regex:/^6[0-9]{8}$/',
            'description' => 'string|max:255'
        ]);

        try {
            $provider = $request->input('provider');
            $amount = $request->input('amount');
            $phone = $request->input('phone');
            
            // Générer un ID de transaction unique
            $transactionId = $this->paymentGateway->generateTransactionId($provider);
            
            // Préparer les données
            $paymentData = [
                'amount' => (int)$amount,
                'phone' => $phone,
                'external_id' => $transactionId,
                'description' => $request->input('description', 'Paiement direct mobile'),
                'callback_url' => route('payments.notify')
            ];

            // Enregistrer le paiement
            $payment = Payment::create([
                'transaction_id' => $transactionId,
                'provider' => $provider,
                'amount' => $amount,
                'currency' => 'XAF',
                'status' => 'pending',
                'customer_phone' => $phone,
                'description' => $paymentData['description'],
                'user_id' => auth()->id(),
                'metadata' => json_encode([
                    'payment_type' => 'mobile_direct',
                    'ip_address' => $request->ip()
                ])
            ]);

            // Initier le paiement direct
            $result = $this->paymentGateway->directMobilePayment($provider, $paymentData);

            if (isset($result['statusCode']) && $result['statusCode'] == 200) {
                $payment->update([
                    'gateway_response' => json_encode($result)
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Paiement direct initié avec succès',
                    'transaction_id' => $transactionId,
                    'provider' => $provider,
                    'status' => $result['status'] ?? 'pending',
                    'data' => $result
                ]);
            } else {
                $payment->update(['status' => 'failed']);
                
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Erreur lors du paiement direct',
                    'error' => $result
                ], 400);
            }

        } catch (Exception $e) {
            Log::error('Direct mobile payment error', [
                'error' => $e->getMessage(),
                'provider' => $request->input('provider'),
                'phone' => $request->input('phone')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du paiement direct: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifie le statut d'un paiement
     * @param string $transactionId
     * @return JsonResponse
     */
    public function checkPaymentStatus(string $transactionId): JsonResponse
    {
        try {
            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction non trouvée'
                ], 404);
            }

            // Vérifier le statut via l'API du fournisseur
            $result = $this->paymentGateway->checkPaymentStatus($payment->provider, $transactionId);

            // Mettre à jour le statut local selon la réponse
            $newStatus = $this->mapGatewayStatus($payment->provider, $result);
            
            if ($newStatus !== $payment->status) {
                $payment->update([
                    'status' => $newStatus,
                    'gateway_response' => json_encode($result)
                ]);
            }

            return response()->json([
                'success' => true,
                'transaction_id' => $transactionId,
                'status' => $newStatus,
                'provider' => $payment->provider,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'data' => $result
            ]);

        } catch (Exception $e) {
            Log::error('Payment status check error', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtient la liste des fournisseurs disponibles
     * @return JsonResponse
     */
    public function getProviders(): JsonResponse
    {
        try {
            $providers = $this->paymentGateway->getAvailableProviders();
            
            return response()->json([
                'success' => true,
                'providers' => $providers
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des fournisseurs'
            ], 500);
        }
    }

    /**
     * Recommande un fournisseur selon le type de paiement
     * @param Request $request
     * @return JsonResponse
     */
    public function recommendProvider(Request $request): JsonResponse
    {
        $request->validate([
            'payment_type' => 'required|string|in:web,mobile',
            'phone' => 'string|regex:/^6[0-9]{8}$/',
            'amount' => 'numeric|min:100'
        ]);

        try {
            $paymentType = $request->input('payment_type');
            $data = $request->only(['phone', 'amount']);
            
            $recommendedProvider = $this->paymentGateway->recommendProvider($paymentType, $data);
            
            return response()->json([
                'success' => true,
                'recommended_provider' => $recommendedProvider,
                'payment_type' => $paymentType
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recommandation'
            ], 500);
        }
    }

    /**
     * Récupère le solde (pour Pluto et Fapshi)
     * @param string $provider
     * @return JsonResponse
     */
    public function getBalance(string $provider): JsonResponse
    {
        try {
            $result = $this->paymentGateway->getBalance($provider);
            
            return response()->json([
                'success' => true,
                'provider' => $provider,
                'balance' => $result
            ]);

        } catch (Exception $e) {
            Log::error('Balance check error', [
                'error' => $e->getMessage(),
                'provider' => $provider
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du solde: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook/Notification handler
     * @param Request $request
     * @return JsonResponse
     */
    public function handleNotification(Request $request): JsonResponse
    {
        try {
            Log::info('Payment notification received', $request->all());

            // Identifier le fournisseur selon les données reçues
            $provider = $this->identifyProvider($request);
            
            if (!$provider) {
                Log::warning('Unable to identify payment provider from notification');
                return response()->json(['status' => 'error', 'message' => 'Provider not identified'], 400);
            }

            // Traiter selon le fournisseur
            switch ($provider) {
                case 'cinetpay':
                    return $this->handleCinetpayNotification($request);
                case 'fapshi':
                    return $this->handleFapshiNotification($request);
                case 'pluto':
                    return $this->handlePlutoNotification($request);
                default:
                    return response()->json(['status' => 'error', 'message' => 'Unknown provider'], 400);
            }

        } catch (Exception $e) {
            Log::error('Notification handling error', [
                'error' => $e->getMessage(),
                'data' => $request->all()
            ]);

            return response()->json(['status' => 'error', 'message' => 'Processing failed'], 500);
        }
    }

    /**
     * Page de retour après paiement
     * @param Request $request
     * @return \Illuminate\View\View
     */
    public function returnPage(Request $request)
    {
        Log::info('Payment return page accessed', $request->all());

        $transactionId = $request->input('transaction_id') 
                        ?? $request->input('trans_id')
                        ?? $request->input('transId')
                        ?? $request->input('externalId');
        
        $fapshiTransId = $request->input('transId');
        $paymentStatus = $request->input('status');
        
        $finalTransactionId = $transactionId ?: $fapshiTransId;

        if ($finalTransactionId) {
            $payment = Payment::where('transaction_id', $finalTransactionId)->first();
            
            if ($payment) {
                if ($paymentStatus && $payment->provider === 'fapshi') {
                    $newStatus = $this->mapFapshiStatus($paymentStatus);
                    if ($newStatus !== $payment->status) {
                        $payment->update([
                            'status' => $newStatus,
                            'gateway_response' => json_encode($request->all())
                        ]);
                        Log::info('Payment status updated from return URL', [
                            'transaction_id' => $finalTransactionId,
                            'new_status' => $newStatus
                        ]);
                    }
                } else {
                    try {
                        $this->checkPaymentStatus($payment->transaction_id);
                        $payment->refresh();
                    } catch (Exception $e) {
                        Log::warning('Status check failed on return page', [
                            'transaction_id' => $finalTransactionId,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
        } else {
            Log::warning('Return page accessed without transaction ID', $request->all());
        }

        if ($finalTransactionId) {
            return redirect()->route('payment.index', ['transaction_id' => $finalTransactionId]);
        }
        
        return redirect()->route('payment.index');
    }

    /**
     * Mappe les statuts Fapshi vers nos statuts internes
     */
    private function mapFapshiStatus(string $fapshiStatus): string
    {
        return match(strtoupper($fapshiStatus)) {
            'SUCCESSFUL' => 'completed',
            'FAILED' => 'failed',
            'EXPIRED' => 'expired',
            'PENDING' => 'pending',
            default => 'pending'
        };
    }

    /**
     * Mappe les statuts des fournisseurs vers un statut unifié
     * @param string $provider
     * @param array $gatewayResponse
     * @return string
     */
    private function mapGatewayStatus(string $provider, array $gatewayResponse): string
    {
        switch ($provider) {
            case 'cinetpay':
                if (isset($gatewayResponse['data']['status'])) {
                    return match($gatewayResponse['data']['status']) {
                        'ACCEPTED' => 'completed',
                        'REFUSED' => 'failed',
                        'CANCELLED' => 'cancelled',
                        default => 'pending'
                    };
                }
                break;
                
            case 'fapshi':
                if (isset($gatewayResponse['status'])) {
                    return match($gatewayResponse['status']) {
                        'SUCCESSFUL' => 'completed',
                        'FAILED' => 'failed',
                        'EXPIRED' => 'expired',
                        default => 'pending'
                    };
                }
                break;
                
            case 'pluto':
                if (isset($gatewayResponse['status'])) {
                    return match($gatewayResponse['status']) {
                        'success', 'completed' => 'completed',
                        'failed' => 'failed',
                        'cancelled' => 'cancelled',
                        default => 'pending'
                    };
                }
                break;
        }
        
        return 'pending';
    }

    /**
     * Identifie le fournisseur à partir des données de notification
     * @param Request $request
     * @return string|null
     */
    private function identifyProvider(Request $request): ?string
    {
        // CinetPay utilise 'cpm_trans_id' ou 'transaction_id'
        if ($request->has('cpm_trans_id') || ($request->has('transaction_id') && str_starts_with($request->input('transaction_id'), 'CP_'))) {
            return 'cinetpay';
        }
        
        // Fapshi utilise 'transId'
        if ($request->has('transId') || str_starts_with($request->input('transaction_id', ''), 'FAPSHI_')) {
            return 'fapshi';
        }
        
        // Pluto
        if (str_starts_with($request->input('transaction_id', ''), 'PLUTO_')) {
            return 'pluto';
        }
        
        return null;
    }

    /**
     * Traite les notifications CinetPay
     */
    private function handleCinetpayNotification(Request $request): JsonResponse
    {
        $transactionId = $request->input('cpm_trans_id') ?? $request->input('transaction_id');
        
        if ($transactionId) {
            $payment = Payment::where('transaction_id', $transactionId)->first();
            if ($payment) {
                $this->checkPaymentStatus($transactionId);
            }
        }
        
        return response()->json(['status' => 'ok']);
    }

    /**
     * Traite les notifications Fapshi
     */
    private function handleFapshiNotification(Request $request): JsonResponse
    {
        $transactionId = $request->input('transId');
        
        if ($transactionId) {
            // Vérifier via l'API Fapshi pour confirmer
            try {
                $result = $this->paymentGateway->checkPaymentStatus('fapshi', $transactionId);
                $payment = Payment::where('transaction_id', $transactionId)->first();
                
                if ($payment) {
                    $status = $this->mapGatewayStatus('fapshi', $result);
                    $payment->update([
                        'status' => $status,
                        'gateway_response' => json_encode($result)
                    ]);
                }
            } catch (Exception $e) {
                Log::error('Fapshi notification verification failed', [
                    'transaction_id' => $transactionId,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        return response()->json(['status' => 'ok']);
    }

    /**
     * Traite les notifications Pluto
     */
    private function handlePlutoNotification(Request $request): JsonResponse
    {
        $transactionId = $request->input('transaction_id');
        
        if ($transactionId) {
            $payment = Payment::where('transaction_id', $transactionId)->first();
            if ($payment) {
                $this->checkPaymentStatus($transactionId);
            }
        }
        
        return response()->json(['status' => 'ok']);
    }
}