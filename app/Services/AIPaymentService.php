<?php

namespace App\Services;

use App\Models\User;
use App\Models\Payment;
use App\Services\CinetpayService;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class AIPaymentService
{
    protected $cinetpayService;
    
    // Tarifs des services IA
    const AI_SERVICE_PRICES = [
        'resume-review' => [
            'basic' => ['tokens' => 5, 'price' => 300, 'name' => 'Analyse CV Basique'],
            'advanced' => ['tokens' => 12, 'price' => 720, 'name' => 'Analyse CV Avancée'],
            'premium' => ['tokens' => 20, 'price' => 1200, 'name' => 'Analyse CV Premium']
        ],
        'interview-prep' => [
            'basic' => ['tokens' => 8, 'price' => 480, 'name' => 'Préparation Entretien Standard'],
            'advanced' => ['tokens' => 15, 'price' => 900, 'name' => 'Simulation Entretien Complète'],
            'premium' => ['tokens' => 25, 'price' => 1500, 'name' => 'Coaching Entretien Personnel']
        ],
        'salary-negotiation' => [
            'basic' => ['tokens' => 10, 'price' => 600, 'name' => 'Conseil Négociation Basique'],
            'advanced' => ['tokens' => 18, 'price' => 1080, 'name' => 'Stratégie Négociation Avancée'],
            'premium' => ['tokens' => 30, 'price' => 1800, 'name' => 'Accompagnement Négociation VIP']
        ],
        'career-advice' => [
            'basic' => ['tokens' => 6, 'price' => 360, 'name' => 'Conseil Carrière Express'],
            'advanced' => ['tokens' => 14, 'price' => 840, 'name' => 'Plan Carrière Détaillé'],
            'premium' => ['tokens' => 22, 'price' => 1320, 'name' => 'Mentoring Carrière Personnalisé']
        ],
        'cover-letter' => [
            'basic' => ['tokens' => 4, 'price' => 240, 'name' => 'Révision Lettre Standard'],
            'advanced' => ['tokens' => 9, 'price' => 540, 'name' => 'Optimisation Lettre ATS'],
            'premium' => ['tokens' => 16, 'price' => 960, 'name' => 'Lettre Personnalisée Premium']
        ]
    ];

    // Packs de tokens
    const TOKEN_PACKS = [
        'starter' => ['tokens' => 10, 'price' => 600, 'bonus' => 0, 'name' => 'Pack Starter'],
        'plus' => ['tokens' => 20, 'price' => 1200, 'bonus' => 5, 'name' => 'Pack Plus'],
        'pro' => ['tokens' => 50, 'price' => 3000, 'bonus' => 10, 'name' => 'Pack Pro'],
        'ultimate' => ['tokens' => 100, 'price' => 6000, 'bonus' => 30, 'name' => 'Pack Ultimate']
    ];

    public function __construct(CinetpayService $cinetpayService)
    {
        $this->cinetpayService = $cinetpayService;
    }

    /**
     * Créer un paiement pour un service IA
     */
    public function createAIServicePayment(User $user, string $serviceId, string $plan = 'basic', array $metadata = []): array
    {
        try {
            if (!isset(self::AI_SERVICE_PRICES[$serviceId])) {
                throw new Exception("Service IA '$serviceId' non reconnu");
            }

            if (!isset(self::AI_SERVICE_PRICES[$serviceId][$plan])) {
                throw new Exception("Plan '$plan' non disponible pour le service '$serviceId'");
            }

            $serviceData = self::AI_SERVICE_PRICES[$serviceId][$plan];
            $transactionId = $this->generateTransactionId('AI_SERVICE');

            // Vérifier le solde utilisateur
            $hasEnoughTokens = $this->checkUserBalance($user, $serviceData['tokens']);

            if ($hasEnoughTokens) {
                // L'utilisateur a assez de tokens, débiter directement
                return $this->processTokenPayment($user, $serviceId, $plan, $serviceData, $metadata);
            } else {
                // Créer un paiement CinetPay
                return $this->createCinetPayPayment(
                    $user, 
                    $transactionId, 
                    $serviceData['price'], 
                    $serviceData['name'],
                    $serviceId,
                    $plan,
                    array_merge($metadata, [
                        'service_type' => 'ai_service',
                        'service_id' => $serviceId,
                        'plan' => $plan,
                        'tokens_required' => $serviceData['tokens']
                    ])
                );
            }

        } catch (Exception $e) {
            Log::error('Erreur création paiement service IA', [
                'user_id' => $user->id,
                'service_id' => $serviceId,
                'plan' => $plan,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Créer un paiement pour un pack de tokens
     */
    public function createTokenPackPayment(User $user, string $packId, array $metadata = []): array
    {
        try {
            if (!isset(self::TOKEN_PACKS[$packId])) {
                throw new Exception("Pack de tokens '$packId' non reconnu");
            }

            $packData = self::TOKEN_PACKS[$packId];
            $transactionId = $this->generateTransactionId('TOKEN_PACK');
            $totalTokens = $packData['tokens'] + $packData['bonus'];

            return $this->createCinetPayPayment(
                $user,
                $transactionId,
                $packData['price'],
                $packData['name'] . " ({$totalTokens} tokens)",
                'token-pack',
                $packId,
                array_merge($metadata, [
                    'service_type' => 'token_pack',
                    'pack_id' => $packId,
                    'base_tokens' => $packData['tokens'],
                    'bonus_tokens' => $packData['bonus'],
                    'total_tokens' => $totalTokens
                ])
            );

        } catch (Exception $e) {
            Log::error('Erreur création paiement pack tokens', [
                'user_id' => $user->id,
                'pack_id' => $packId,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Traiter un paiement avec les tokens de l'utilisateur
     */
    protected function processTokenPayment(User $user, string $serviceId, string $plan, array $serviceData, array $metadata): array
    {
        try {
            DB::beginTransaction();

            // Débiter les tokens
            $user->decrement('wallet_balance', $serviceData['tokens']);

            // Créer un enregistrement de paiement local
            $payment = Payment::create([
                'user_id' => $user->id,
                'transaction_id' => $this->generateTransactionId('TOKEN_DIRECT'),
                'amount' => 0, // Paiement en tokens
                'currency' => 'TOKENS',
                'description' => "Paiement tokens: " . $serviceData['name'],
                'status' => 'completed',
                'payment_method' => 'wallet',
                'completed_at' => now(),
                'metadata' => array_merge($metadata, [
                    'service_type' => 'ai_service',
                    'service_id' => $serviceId,
                    'plan' => $plan,
                    'tokens_used' => $serviceData['tokens'],
                    'payment_type' => 'token_wallet'
                ])
            ]);

            DB::commit();

            Log::info('Paiement tokens traité avec succès', [
                'user_id' => $user->id,
                'payment_id' => $payment->id,
                'tokens_used' => $serviceData['tokens'],
                'new_balance' => $user->wallet_balance
            ]);

            return [
                'success' => true,
                'payment_method' => 'tokens',
                'payment_id' => $payment->id,
                'tokens_used' => $serviceData['tokens'],
                'remaining_balance' => $user->wallet_balance,
                'service_unlocked' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Créer un paiement CinetPay
     */
    protected function createCinetPayPayment(
        User $user,
        string $transactionId,
        int $amount,
        string $description,
        string $serviceId,
        string $plan,
        array $metadata
    ): array {
        try {
            // Créer l'enregistrement de paiement en base
            $payment = Payment::create([
                'user_id' => $user->id,
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'currency' => 'XAF',
                'description' => $description,
                'status' => 'pending',
                'payment_method' => 'cinetpay',
                'metadata' => $metadata
            ]);

            // Préparer les données client
            $customerData = [
                'customer_name' => $user->name,
                'customer_surname' => $user->name,
                'customer_email' => $user->email,
                'customer_phone_number' => $user->phone_number ?? '',
                'customer_country' => 'CM',
                'notify_url' => route('cinetpay.notify'),
                'return_url' => route('cinetpay.return'),
                'metadata' => json_encode($metadata)
            ];

            // Générer le lien de paiement CinetPay
            $paymentResponse = $this->cinetpayService->generatePayment(
                $transactionId,
                $amount,
                'XAF',
                $description,
                $customerData
            );

            if ($paymentResponse['success']) {
                // Mettre à jour le paiement avec les données CinetPay
                $payment->update([
                    'external_id' => $paymentResponse['data']['payment_token'] ?? null,
                    'status' => 'initiated'
                ]);

                Log::info('Paiement CinetPay créé avec succès', [
                    'user_id' => $user->id,
                    'transaction_id' => $transactionId,
                    'payment_id' => $payment->id,
                    'amount' => $amount
                ]);

                return [
                    'success' => true,
                    'payment_method' => 'cinetpay',
                    'payment_url' => $paymentResponse['data']['payment_url'],
                    'transaction_id' => $transactionId,
                    'payment_id' => $payment->id
                ];
            } else {
                throw new Exception('Erreur génération paiement CinetPay: ' . ($paymentResponse['message'] ?? 'Erreur inconnue'));
            }

        } catch (Exception $e) {
            Log::error('Erreur création paiement CinetPay', [
                'user_id' => $user->id,
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Vérifier si l'utilisateur a assez de tokens
     */
    public function checkUserBalance(User $user, int $tokensRequired): bool
    {
        return $user->wallet_balance >= $tokensRequired;
    }

    /**
     * Obtenir les prix des services IA
     */
    public function getServicePrices(string $serviceId = null): array
    {
        if ($serviceId) {
            return self::AI_SERVICE_PRICES[$serviceId] ?? [];
        }
        
        return self::AI_SERVICE_PRICES;
    }

    /**
     * Obtenir les packs de tokens
     */
    public function getTokenPacks(): array
    {
        return self::TOKEN_PACKS;
    }

    /**
     * Calculer le coût en tokens pour un service
     */
    public function calculateServiceCost(string $serviceId, string $plan = 'basic'): int
    {
        return self::AI_SERVICE_PRICES[$serviceId][$plan]['tokens'] ?? 0;
    }

    /**
     * Vérifier si un utilisateur peut accéder à un service IA
     */
    public function canAccessService(User $user, string $serviceId, string $plan = 'basic'): array
    {
        $tokensRequired = $this->calculateServiceCost($serviceId, $plan);
        $hasAccess = $this->checkUserBalance($user, $tokensRequired);
        
        return [
            'can_access' => $hasAccess,
            'tokens_required' => $tokensRequired,
            'current_balance' => $user->wallet_balance,
            'tokens_needed' => max(0, $tokensRequired - $user->wallet_balance)
        ];
    }

    /**
     * Traiter le succès d'un paiement (appelé depuis le webhook)
     */
    public function processSuccessfulPayment(Payment $payment): void
    {
        try {
            if ($payment->status === 'completed') {
                return; // Déjà traité
            }

            DB::beginTransaction();

            $metadata = $payment->metadata;
            
            if ($metadata['service_type'] === 'token_pack') {
                // Ajouter les tokens à l'utilisateur
                $totalTokens = $metadata['total_tokens'];
                $payment->user->increment('wallet_balance', $totalTokens);
                
                Log::info('Tokens ajoutés au compte utilisateur', [
                    'user_id' => $payment->user_id,
                    'tokens_added' => $totalTokens,
                    'new_balance' => $payment->user->wallet_balance
                ]);
                
            } elseif ($metadata['service_type'] === 'ai_service') {
                // Pour les services IA payés directement, on peut déclencher l'accès
                Log::info('Accès service IA débloqué', [
                    'user_id' => $payment->user_id,
                    'service_id' => $metadata['service_id'],
                    'plan' => $metadata['plan']
                ]);
            }

            $payment->update([
                'status' => 'completed',
                'completed_at' => now()
            ]);

            DB::commit();

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Erreur traitement paiement réussi', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Générer un ID de transaction unique
     */
    protected function generateTransactionId(string $prefix = 'AI'): string
    {
        return $prefix . '_' . time() . '_' . uniqid();
    }

    /**
     * Obtenir l'historique des paiements IA d'un utilisateur
     */
    public function getUserPaymentHistory(User $user, int $limit = 10): array
    {
        $payments = Payment::where('user_id', $user->id)
            ->whereIn('payment_method', ['cinetpay', 'wallet'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return $payments->map(function ($payment) {
            $metadata = $payment->metadata;
            return [
                'id' => $payment->id,
                'transaction_id' => $payment->transaction_id,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'description' => $payment->description,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'service_type' => $metadata['service_type'] ?? null,
                'service_id' => $metadata['service_id'] ?? null,
                'plan' => $metadata['plan'] ?? null,
                'tokens_involved' => $metadata['tokens_used'] ?? $metadata['total_tokens'] ?? 0,
                'created_at' => $payment->created_at,
                'completed_at' => $payment->completed_at
            ];
        })->toArray();
    }

    /**
     * Obtenir les statistiques de paiement pour un utilisateur
     */
    public function getUserPaymentStats(User $user): array
    {
        $totalSpent = Payment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('payment_method', 'cinetpay')
            ->sum('amount');

        $tokensEarned = Payment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->get()
            ->sum(function ($payment) {
                $metadata = $payment->metadata;
                return $metadata['total_tokens'] ?? 0;
            });

        $tokensUsed = Payment::where('user_id', $user->id)
            ->where('status', 'completed')
            ->where('payment_method', 'wallet')
            ->get()
            ->sum(function ($payment) {
                $metadata = $payment->metadata;
                return $metadata['tokens_used'] ?? 0;
            });

        return [
            'total_spent_fcfa' => $totalSpent,
            'total_tokens_earned' => $tokensEarned,
            'total_tokens_used' => $tokensUsed,
            'current_balance' => $user->wallet_balance,
            'total_payments' => Payment::where('user_id', $user->id)->count(),
            'successful_payments' => Payment::where('user_id', $user->id)->where('status', 'completed')->count()
        ];
    }
}