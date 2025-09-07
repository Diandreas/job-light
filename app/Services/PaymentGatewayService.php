<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Exception;

class PaymentGatewayService
{
    protected $cinetpayService;
    protected $plutoService;
    protected $fapshiService;

    const PROVIDER_CINETPAY = 'cinetpay';
    const PROVIDER_PLUTO = 'pluto';
    const PROVIDER_FAPSHI = 'fapshi';

    const PAYMENT_TYPE_WEB = 'web';
    const PAYMENT_TYPE_MOBILE = 'mobile';

    public function __construct(
        CinetpayService $cinetpayService,
        PlutoService $plutoService,
        FapshiService $fapshiService
    ) {
        $this->cinetpayService = $cinetpayService;
        $this->plutoService = $plutoService;
        $this->fapshiService = $fapshiService;
    }

    /**
     * Initie un paiement selon le fournisseur choisi
     * @param string $provider
     * @param array $data
     * @return array
     * @throws Exception
     */
    public function initiatePayment(string $provider, array $data): array
    {
        $this->validateProvider($provider);

        Log::info('Payment gateway initiation', [
            'provider' => $provider,
            'amount' => $data['amount'] ?? null,
            'type' => $data['type'] ?? null
        ]);

        switch ($provider) {
            case self::PROVIDER_CINETPAY:
                return $this->initiateCinetpayPayment($data);
            
            case self::PROVIDER_PLUTO:
                return $this->initiatePlutoPayment($data);
            
            case self::PROVIDER_FAPSHI:
                return $this->initiateFapshiPayment($data);
            
            default:
                throw new Exception("Fournisseur de paiement non supporté: {$provider}");
        }
    }

    /**
     * Paiement direct mobile (uniquement pour Pluto et Fapshi)
     * @param string $provider
     * @param array $data
     * @return array
     * @throws Exception
     */
    public function directMobilePayment(string $provider, array $data): array
    {
        if (!in_array($provider, [self::PROVIDER_PLUTO, self::PROVIDER_FAPSHI])) {
            throw new Exception("Paiement direct mobile non supporté pour: {$provider}");
        }

        Log::info('Direct mobile payment', [
            'provider' => $provider,
            'phone' => $data['phone'] ?? null,
            'amount' => $data['amount'] ?? null
        ]);

        switch ($provider) {
            case self::PROVIDER_PLUTO:
                return $this->plutoService->directPay($data);
            
            case self::PROVIDER_FAPSHI:
                return $this->fapshiService->directPay($data);
            
            default:
                throw new Exception("Fournisseur non supporté pour paiement direct: {$provider}");
        }
    }

    /**
     * Vérifie le statut d'un paiement
     * @param string $provider
     * @param string $transactionId
     * @return array
     * @throws Exception
     */
    public function checkPaymentStatus(string $provider, string $transactionId): array
    {
        $this->validateProvider($provider);

        Log::info('Payment status check', [
            'provider' => $provider,
            'transaction_id' => $transactionId
        ]);

        switch ($provider) {
            case self::PROVIDER_CINETPAY:
                return $this->cinetpayService->checkPaymentStatus($transactionId);
            
            case self::PROVIDER_PLUTO:
                return $this->plutoService->checkPaymentStatus($transactionId);
            
            case self::PROVIDER_FAPSHI:
                return $this->fapshiService->paymentStatus($transactionId);
            
            default:
                throw new Exception("Fournisseur non supporté: {$provider}");
        }
    }

    /**
     * Récupère le solde (pour Pluto et Fapshi)
     * @param string $provider
     * @return array
     * @throws Exception
     */
    public function getBalance(string $provider): array
    {
        if (!in_array($provider, [self::PROVIDER_PLUTO, self::PROVIDER_FAPSHI])) {
            throw new Exception("Consultation de solde non supportée pour: {$provider}");
        }

        Log::info('Balance check', ['provider' => $provider]);

        switch ($provider) {
            case self::PROVIDER_PLUTO:
                return $this->plutoService->getBalance();
            
            case self::PROVIDER_FAPSHI:
                return $this->fapshiService->balance();
            
            default:
                throw new Exception("Fournisseur non supporté: {$provider}");
        }
    }

    /**
     * Effectue un payout (uniquement pour Fapshi)
     * @param array $data
     * @return array
     * @throws Exception
     */
    public function payout(array $data): array
    {
        Log::info('Payout request', [
            'amount' => $data['amount'] ?? null,
            'phone' => $data['phone'] ?? null
        ]);

        return $this->fapshiService->payout($data);
    }

    /**
     * Recherche des transactions (uniquement pour Fapshi)
     * @param array $params
     * @return array
     * @throws Exception
     */
    public function searchTransactions(array $params): array
    {
        Log::info('Transaction search', $params);

        return $this->fapshiService->search($params);
    }

    /**
     * Expire un paiement (uniquement pour Fapshi)
     * @param string $transactionId
     * @return array
     * @throws Exception
     */
    public function expirePayment(string $transactionId): array
    {
        Log::info('Payment expiration', ['transaction_id' => $transactionId]);

        return $this->fapshiService->expirePay($transactionId);
    }

    /**
     * Récupère les transactions d'un utilisateur (uniquement pour Fapshi)
     * @param string $userId
     * @return array
     * @throws Exception
     */
    public function getUserTransactions(string $userId): array
    {
        Log::info('User transactions request', ['user_id' => $userId]);

        return $this->fapshiService->getUserTransactions($userId);
    }

    /**
     * Recommande le meilleur fournisseur selon le type de paiement
     * @param string $paymentType
     * @param array $data
     * @return string
     */
    public function recommendProvider(string $paymentType, array $data = []): string
    {
        $hasPhone = isset($data['phone']) && !empty($data['phone']);
        
        switch ($paymentType) {
            case self::PAYMENT_TYPE_WEB:
                // CinetPay est optimal pour les paiements web avec interface
                return self::PROVIDER_CINETPAY;
            
            case self::PAYMENT_TYPE_MOBILE:
                if ($hasPhone) {
                    // Pour les paiements mobiles directs, privilégier Fapshi puis Pluto
                    return self::PROVIDER_FAPSHI;
                }
                // Si pas de numéro, utiliser CinetPay qui peut gérer mobile money
                return self::PROVIDER_CINETPAY;
            
            default:
                return self::PROVIDER_CINETPAY;
        }
    }

    /**
     * Génère un ID de transaction unifié
     * @param string $provider
     * @return string
     */
    public function generateTransactionId(string $provider): string
    {
        switch ($provider) {
            case self::PROVIDER_CINETPAY:
                return $this->cinetpayService->generateTransactionId();
            
            case self::PROVIDER_PLUTO:
                return $this->plutoService->generateTransactionId();
            
            case self::PROVIDER_FAPSHI:
                return $this->fapshiService->generateTransactionId();
            
            default:
                return 'PAYMENT_' . time() . '_' . uniqid();
        }
    }

    /**
     * Obtient les fournisseurs disponibles
     * @return array
     */
    public function getAvailableProviders(): array
    {
        return [
            self::PROVIDER_CINETPAY => [
                'name' => 'CinetPay',
                'supports_web' => true,
                'supports_mobile' => true,
                'supports_direct_mobile' => false,
                'supports_balance_check' => false,
                'supports_payout' => false
            ],
            self::PROVIDER_PLUTO => [
                'name' => 'Pluto',
                'supports_web' => false,
                'supports_mobile' => true,
                'supports_direct_mobile' => true,
                'supports_balance_check' => true,
                'supports_payout' => false
            ],
            self::PROVIDER_FAPSHI => [
                'name' => 'Fapshi',
                'supports_web' => true,
                'supports_mobile' => true,
                'supports_direct_mobile' => true,
                'supports_balance_check' => true,
                'supports_payout' => true
            ]
        ];
    }

    /**
     * Initialise un paiement CinetPay
     * @param array $data
     * @return array
     * @throws Exception
     */
    private function initiateCinetpayPayment(array $data): array
    {
        $transactionId = $data['transaction_id'] ?? $this->cinetpayService->generateTransactionId();
        $amount = $data['amount'];
        $currency = $data['currency'] ?? 'XAF';
        $description = $data['description'] ?? 'Paiement';
        
        return $this->cinetpayService->generatePayment(
            $transactionId,
            $amount,
            $currency,
            $description,
            $data
        );
    }

    /**
     * Initialise un paiement Pluto
     * @param array $data
     * @return array
     * @throws Exception
     */
    private function initiatePlutoPayment(array $data): array
    {
        if (isset($data['phone']) && !empty($data['phone'])) {
            // Si numéro de téléphone fourni, utiliser paiement direct
            return $this->plutoService->directPay($data);
        } else {
            // Sinon, initier paiement standard
            return $this->plutoService->initiatePay($data);
        }
    }

    /**
     * Initialise un paiement Fapshi
     * @param array $data
     * @return array
     * @throws Exception
     */
    private function initiateFapshiPayment(array $data): array
    {
        // Préparer les données au format Fapshi
        $fapshiData = [
            'amount' => (int) $data['amount'],
            'email' => $data['customer_email'] ?? '',
            'externalId' => $data['transaction_id'] ?? uniqid(),
            'userId' => $data['user_id'] ?? 'guest',
            'redirectUrl' => route('payments.return', ['transaction_id' => $data['transaction_id'] ?? '']),
            'message' => $data['description'] ?? 'Paiement'
        ];

        // Ajouter le téléphone si fourni pour paiement direct
        if (isset($data['customer_phone']) && !empty($data['customer_phone'])) {
            $fapshiData['phone'] = $data['customer_phone'];
            $result = $this->fapshiService->directPay($fapshiData);
        } else {
            // Paiement standard sans téléphone
            $result = $this->fapshiService->initiatePay($fapshiData);
        }

        // Transformer la réponse Fapshi pour être compatible avec notre format
        if (isset($result['statusCode']) && $result['statusCode'] == 200) {
            return [
                'success' => true,
                'message' => $result['message'] ?? 'Paiement initié avec succès',
                'data' => [
                    'trans_id' => $result['transId'] ?? null,
                    'payment_url' => $result['link'] ?? null,
                    'status' => 'pending'
                ],
                'original_response' => $result
            ];
        } else {
            return [
                'success' => false,
                'message' => $result['message'] ?? 'Erreur lors de l\'initiation du paiement',
                'data' => $result
            ];
        }
    }

    /**
     * Valide le fournisseur de paiement
     * @param string $provider
     * @throws Exception
     */
    private function validateProvider(string $provider): void
    {
        $validProviders = [self::PROVIDER_CINETPAY, self::PROVIDER_PLUTO, self::PROVIDER_FAPSHI];
        
        if (!in_array($provider, $validProviders)) {
            throw new Exception("Fournisseur de paiement invalide: {$provider}. Fournisseurs supportés: " . implode(', ', $validProviders));
        }
    }
}