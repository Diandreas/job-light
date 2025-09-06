<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AIPaymentService;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AIPaymentController extends Controller
{
    protected $aiPaymentService;

    public function __construct(AIPaymentService $aiPaymentService)
    {
        $this->aiPaymentService = $aiPaymentService;
        $this->middleware('auth');
    }

    /**
     * Afficher la page des tarifs et services IA
     */
    public function pricing()
    {
        $servicePrices = $this->aiPaymentService->getServicePrices();
        $tokenPacks = $this->aiPaymentService->getTokenPacks();
        $user = Auth::user();
        
        return Inertia::render('Payment/AIPricing', [
            'servicePrices' => $servicePrices,
            'tokenPacks' => $tokenPacks,
            'userBalance' => $user->wallet_balance,
            'paymentStats' => $this->aiPaymentService->getUserPaymentStats($user)
        ]);
    }

    /**
     * Vérifier l'accès à un service IA
     */
    public function checkAccess(Request $request)
    {
        $request->validate([
            'service_id' => 'required|string|in:resume-review,interview-prep,salary-negotiation,career-advice,cover-letter',
            'plan' => 'required|string|in:basic,advanced,premium'
        ]);

        $user = Auth::user();
        $accessInfo = $this->aiPaymentService->canAccessService(
            $user, 
            $request->service_id, 
            $request->plan
        );

        return response()->json($accessInfo);
    }

    /**
     * Initier un paiement pour un service IA
     */
    public function initiateServicePayment(Request $request)
    {
        try {
            $request->validate([
                'service_id' => 'required|string|in:resume-review,interview-prep,salary-negotiation,career-advice,cover-letter',
                'plan' => 'required|string|in:basic,advanced,premium',
                'metadata' => 'nullable|array'
            ]);

            $user = Auth::user();
            
            $paymentResult = $this->aiPaymentService->createAIServicePayment(
                $user,
                $request->service_id,
                $request->plan,
                $request->metadata ?? []
            );

            if ($paymentResult['success']) {
                if ($paymentResult['payment_method'] === 'tokens') {
                    // Paiement en tokens - service directement accessible
                    return response()->json([
                        'success' => true,
                        'payment_method' => 'tokens',
                        'service_unlocked' => true,
                        'tokens_used' => $paymentResult['tokens_used'],
                        'remaining_balance' => $paymentResult['remaining_balance'],
                        'redirect_url' => route('ai.service', ['service' => $request->service_id])
                    ]);
                } else {
                    // Paiement CinetPay - redirection vers la page de paiement
                    return response()->json([
                        'success' => true,
                        'payment_method' => 'cinetpay',
                        'payment_url' => $paymentResult['payment_url'],
                        'transaction_id' => $paymentResult['transaction_id']
                    ]);
                }
            } else {
                throw new Exception('Erreur lors de la création du paiement');
            }

        } catch (Exception $e) {
            Log::error('Erreur initiation paiement service IA', [
                'user_id' => Auth::id(),
                'service_id' => $request->service_id,
                'plan' => $request->plan,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Initier un paiement pour un pack de tokens
     */
    public function initiateTokenPurchase(Request $request)
    {
        try {
            $request->validate([
                'pack_id' => 'required|string|in:starter,plus,pro,ultimate',
                'metadata' => 'nullable|array'
            ]);

            $user = Auth::user();

            $paymentResult = $this->aiPaymentService->createTokenPackPayment(
                $user,
                $request->pack_id,
                $request->metadata ?? []
            );

            if ($paymentResult['success']) {
                return response()->json([
                    'success' => true,
                    'payment_url' => $paymentResult['payment_url'],
                    'transaction_id' => $paymentResult['transaction_id']
                ]);
            } else {
                throw new Exception('Erreur lors de la création du paiement');
            }

        } catch (Exception $e) {
            Log::error('Erreur achat pack tokens', [
                'user_id' => Auth::id(),
                'pack_id' => $request->pack_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'achat des tokens: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Utiliser un service IA (débit des tokens)
     */
    public function useService(Request $request)
    {
        try {
            $request->validate([
                'service_id' => 'required|string|in:resume-review,interview-prep,salary-negotiation,career-advice,cover-letter',
                'plan' => 'required|string|in:basic,advanced,premium',
                'usage_data' => 'nullable|array'
            ]);

            $user = Auth::user();
            
            // Vérifier l'accès
            $accessInfo = $this->aiPaymentService->canAccessService(
                $user, 
                $request->service_id, 
                $request->plan
            );

            if (!$accessInfo['can_access']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solde insuffisant',
                    'tokens_required' => $accessInfo['tokens_required'],
                    'current_balance' => $accessInfo['current_balance'],
                    'tokens_needed' => $accessInfo['tokens_needed']
                ], 402); // Payment Required
            }

            // Débiter les tokens et créer l'usage
            $serviceData = $this->aiPaymentService->getServicePrices($request->service_id)[$request->plan];
            
            $paymentResult = $this->aiPaymentService->processTokenPayment(
                $user,
                $request->service_id,
                $request->plan,
                $serviceData,
                array_merge($request->usage_data ?? [], [
                    'usage_timestamp' => now(),
                    'usage_ip' => $request->ip()
                ])
            );

            Log::info('Service IA utilisé', [
                'user_id' => $user->id,
                'service_id' => $request->service_id,
                'plan' => $request->plan,
                'tokens_used' => $serviceData['tokens']
            ]);

            return response()->json([
                'success' => true,
                'service_unlocked' => true,
                'tokens_used' => $serviceData['tokens'],
                'remaining_balance' => $user->fresh()->wallet_balance,
                'usage_id' => $paymentResult['payment_id']
            ]);

        } catch (Exception $e) {
            Log::error('Erreur utilisation service IA', [
                'user_id' => Auth::id(),
                'service_id' => $request->service_id,
                'plan' => $request->plan,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'utilisation du service: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Obtenir l'historique des paiements
     */
    public function paymentHistory(Request $request)
    {
        $limit = $request->get('limit', 20);
        $user = Auth::user();
        
        $history = $this->aiPaymentService->getUserPaymentHistory($user, $limit);
        $stats = $this->aiPaymentService->getUserPaymentStats($user);

        return response()->json([
            'history' => $history,
            'stats' => $stats,
            'current_balance' => $user->wallet_balance
        ]);
    }

    /**
     * Obtenir le tableau de bord des paiements
     */
    public function dashboard()
    {
        $user = Auth::user();
        
        return Inertia::render('Payment/Dashboard', [
            'paymentHistory' => $this->aiPaymentService->getUserPaymentHistory($user, 10),
            'paymentStats' => $this->aiPaymentService->getUserPaymentStats($user),
            'servicePrices' => $this->aiPaymentService->getServicePrices(),
            'tokenPacks' => $this->aiPaymentService->getTokenPacks(),
            'currentBalance' => $user->wallet_balance
        ]);
    }

    /**
     * API pour vérifier le solde utilisateur
     */
    public function checkBalance()
    {
        $user = Auth::user();
        
        return response()->json([
            'balance' => $user->wallet_balance,
            'stats' => $this->aiPaymentService->getUserPaymentStats($user)
        ]);
    }

    /**
     * Page de succès de paiement
     */
    public function paymentSuccess(Request $request)
    {
        $transactionId = $request->get('transaction_id');
        $amount = $request->get('amount', 0);
        
        return Inertia::render('Payment/Success', [
            'success' => $request->get('success', 'Paiement effectué avec succès'),
            'transaction_id' => $transactionId,
            'amount' => $amount,
            'user_balance' => Auth::user()->wallet_balance
        ]);
    }

    /**
     * Page d'échec de paiement
     */
    public function paymentFailed(Request $request)
    {
        $error = $request->get('error', 'Une erreur est survenue lors du paiement');
        
        return Inertia::render('Payment/Failed', [
            'error' => $error,
            'token_packs' => $this->aiPaymentService->getTokenPacks()
        ]);
    }

    /**
     * Calculer le prix d'un service spécifique
     */
    public function calculatePrice(Request $request)
    {
        $request->validate([
            'service_id' => 'required|string',
            'plan' => 'required|string'
        ]);

        try {
            $servicePrices = $this->aiPaymentService->getServicePrices($request->service_id);
            
            if (!isset($servicePrices[$request->plan])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service ou plan non trouvé'
                ], 404);
            }

            $priceInfo = $servicePrices[$request->plan];
            $user = Auth::user();
            $canPay = $user->wallet_balance >= $priceInfo['tokens'];

            return response()->json([
                'success' => true,
                'price' => [
                    'tokens' => $priceInfo['tokens'],
                    'fcfa' => $priceInfo['price'],
                    'name' => $priceInfo['name']
                ],
                'user_balance' => $user->wallet_balance,
                'can_pay_with_tokens' => $canPay,
                'tokens_needed' => $canPay ? 0 : ($priceInfo['tokens'] - $user->wallet_balance)
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul du prix'
            ], 400);
        }
    }
}