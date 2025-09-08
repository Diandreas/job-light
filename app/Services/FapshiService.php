<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class FapshiService
{
    protected $apiUser;
    protected $apiKey;
    protected $baseUrl;

    const ERRORS = [
        'invalid type, string expected',
        'invalid type, array expected',
        'amount required',
        'amount must be of type integer',
        'amount cannot be less than 100 XAF',
    ];

    public function __construct()
    {
        $this->apiUser = config('fapshi.api_user');
        $this->apiKey = config('fapshi.api_key');
        
        // Utiliser l'URL sandbox ou live selon la configuration
        $isSandbox = config('fapshi.sandbox', false);
        $this->baseUrl = $isSandbox 
            ? config('fapshi.sandbox_url', 'https://sandbox.fapshi.com')
            : config('fapshi.base_url', 'https://live.fapshi.com');

        if (empty($this->apiUser) || empty($this->apiKey)) {
            throw new Exception('Configuration Fapshi manquante. Vérifiez vos variables d\'environnement FAPSHI_API_USER et FAPSHI_API_KEY.');
        }
    }

    /**
     * Initialise un paiement
     * @param array $data
     * @return array
     * @throws Exception
     */
    public function initiatePay(array $data): array
    {
        if (!is_array($data)) {
            return $this->errorResponse(self::ERRORS[1], 400);
        }

        if (!array_key_exists('amount', $data)) {
            return $this->errorResponse(self::ERRORS[2], 400);
        }

        if (!is_numeric($data['amount'])) {
            return $this->errorResponse(self::ERRORS[3], 400);
        }

        // Convertir en entier pour Fapshi
        $data['amount'] = (int) $data['amount'];

        if ($data['amount'] < 100) {
            return $this->errorResponse(self::ERRORS[4], 400);
        }

        try {
            Log::info('Fapshi payment initiation request', [
                'amount' => $data['amount'],
                'external_id' => $data['externalId'] ?? null
            ]);

            // Ajouter l'URL de redirection si pas déjà présente
            if (!isset($data['redirectUrl']) && !isset($data['redirect_url'])) {
                $data['redirectUrl'] = route('payments.return');
            }

            Log::info('Fapshi payment data sent', $data);

            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->post($this->baseUrl . '/initiate-pay', $data);

            $result = $response->json();
            $result['statusCode'] = $response->status();

            Log::info('Fapshi payment initiation response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi payment initiation error', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            
            throw $e;
        }
    }

    /**
     * Paiement direct avec numéro de téléphone
     * @param array $data
     * @return array
     * @throws Exception
     */
    public function directPay(array $data): array
    {
        if (!is_array($data)) {
            return $this->errorResponse(self::ERRORS[0], 400);
        }

        if (!array_key_exists('amount', $data)) {
            return $this->errorResponse(self::ERRORS[2], 400);
        }

        if (!is_int($data['amount'])) {
            return $this->errorResponse(self::ERRORS[3], 400);
        }

        if ($data['amount'] < 100) {
            return $this->errorResponse(self::ERRORS[4], 400);
        }

        if (!array_key_exists('phone', $data)) {
            return $this->errorResponse('phone number required', 400);
        }

        if (!is_string($data['phone'])) {
            return $this->errorResponse('phone must be of type string', 400);
        }

        if (!preg_match('/^6[0-9]{8}$/', $data['phone'])) {
            return $this->errorResponse('invalid phone number', 400);
        }

        try {
            Log::info('Fapshi direct payment request', [
                'amount' => $data['amount'],
                'phone' => $data['phone']
            ]);

            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->post($this->baseUrl . '/direct-pay', $data);

            $result = $response->json();
            $result['statusCode'] = $response->status();

            Log::info('Fapshi direct payment response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi direct payment error', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            
            throw $e;
        }
    }

    /**
     * Vérifie le statut d'un paiement
     * @param string $transId
     * @return array
     * @throws Exception
     */
    public function paymentStatus(string $transId): array
    {
        if (!is_string($transId) || empty($transId)) {
            return $this->errorResponse(self::ERRORS[0], 400);
        }

        if (!preg_match('/^[a-zA-Z0-9]{8,10}$/', $transId)) {
            return $this->errorResponse('invalid transaction id', 400);
        }

        try {
            Log::info('Fapshi payment status check', ['transaction_id' => $transId]);

            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->get($this->baseUrl . '/payment-status/' . $transId);

            $result = $response->json();
            $result['statusCode'] = $response->status();

            Log::info('Fapshi payment status response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi payment status error', [
                'error' => $e->getMessage(),
                'transaction_id' => $transId
            ]);
            
            throw $e;
        }
    }

    /**
     * Expire un paiement
     * @param string $transId
     * @return array
     * @throws Exception
     */
    public function expirePay(string $transId): array
    {
        if (!is_string($transId) || empty($transId)) {
            return $this->errorResponse(self::ERRORS[0], 400);
        }

        if (!preg_match('/^[a-zA-Z0-9]{8,10}$/', $transId)) {
            return $this->errorResponse('invalid transaction id', 400);
        }

        try {
            $data = ['transId' => $transId];

            Log::info('Fapshi expire payment request', ['transaction_id' => $transId]);

            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->post($this->baseUrl . '/expire-pay', $data);

            $result = $response->json();
            $result['statusCode'] = $response->status();

            Log::info('Fapshi expire payment response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi expire payment error', [
                'error' => $e->getMessage(),
                'transaction_id' => $transId
            ]);
            
            throw $e;
        }
    }

    /**
     * Récupère les transactions d'un utilisateur
     * @param string $userId
     * @return array
     * @throws Exception
     */
    public function getUserTransactions(string $userId): array
    {
        if (!is_string($userId) || empty($userId)) {
            return $this->errorResponse(self::ERRORS[0], 400);
        }

        if (!preg_match('/^[a-zA-Z0-9-_]{1,100}$/', $userId)) {
            return $this->errorResponse('invalid user id', 400);
        }

        try {
            Log::info('Fapshi user transactions request', ['user_id' => $userId]);

            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->get($this->baseUrl . '/transaction/' . $userId);

            $result = $response->json();

            Log::info('Fapshi user transactions response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi user transactions error', [
                'error' => $e->getMessage(),
                'user_id' => $userId
            ]);
            
            throw $e;
        }
    }

    /**
     * Récupère le solde du compte
     * @return array
     * @throws Exception
     */
    public function balance(): array
    {
        try {
            Log::info('Fapshi balance check');

            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->get($this->baseUrl . '/balance');

            $result = $response->json();
            $result['statusCode'] = $response->status();

            Log::info('Fapshi balance response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi balance error', [
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Effectue un payout (retrait)
     * @param array $data
     * @return array
     * @throws Exception
     */
    public function payout(array $data): array
    {
        if (!is_array($data)) {
            return $this->errorResponse(self::ERRORS[0], 400);
        }

        if (!array_key_exists('amount', $data)) {
            return $this->errorResponse(self::ERRORS[2], 400);
        }

        if (!is_int($data['amount'])) {
            return $this->errorResponse(self::ERRORS[3], 400);
        }

        if ($data['amount'] < 100) {
            return $this->errorResponse(self::ERRORS[4], 400);
        }

        if (!array_key_exists('phone', $data)) {
            return $this->errorResponse('phone number required', 400);
        }

        if (!is_string($data['phone'])) {
            return $this->errorResponse('phone must be of type string', 400);
        }

        if (!preg_match('/^6[0-9]{8}$/', $data['phone'])) {
            return $this->errorResponse('invalid phone number', 400);
        }

        try {
            Log::info('Fapshi payout request', [
                'amount' => $data['amount'],
                'phone' => $data['phone']
            ]);

            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->post($this->baseUrl . '/payout', $data);

            $result = $response->json();
            $result['statusCode'] = $response->status();

            Log::info('Fapshi payout response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi payout error', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            
            throw $e;
        }
    }

    /**
     * Recherche et filtre les transactions
     * @param array $params
     * @return array
     * @throws Exception
     */
    public function search(array $params): array
    {
        try {
            Log::info('Fapshi search request', $params);

            $queryString = http_build_query($params);
            $response = Http::withHeaders([
                'apiuser' => $this->apiUser,
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->get($this->baseUrl . '/search?' . $queryString);

            $result = $response->json();

            Log::info('Fapshi search response', $result);

            return $result;

        } catch (Exception $e) {
            Log::error('Fapshi search error', [
                'error' => $e->getMessage(),
                'params' => $params
            ]);
            
            throw $e;
        }
    }

    /**
     * Génère un ID de transaction unique
     * @return string
     */
    public function generateTransactionId(): string
    {
        return 'FAPSHI_' . time() . '_' . uniqid();
    }

    /**
     * Génère une réponse d'erreur formatée
     * @param string $message
     * @param int $statusCode
     * @return array
     */
    private function errorResponse(string $message, int $statusCode): array
    {
        return [
            'message' => $message,
            'statusCode' => $statusCode
        ];
    }
}