<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class PlutoService
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('pluto.api_key');
        $this->baseUrl = config('pluto.base_url', 'https://api.pluto.com');

        if (empty($this->apiKey)) {
            throw new Exception('Configuration Pluto manquante. Vérifiez votre variable d\'environnement PLUTO_API_KEY.');
        }
    }

    /**
     * Initialise un paiement mobile
     * @param array $data
     * @return array
     * @throws Exception
     */
    public function initiatePay(array $data): array
    {
        $this->validatePaymentData($data);

        try {
            $payload = [
                'amount' => $data['amount'],
                'phone' => $data['phone'],
                'email' => $data['email'] ?? '',
                'external_id' => $data['external_id'] ?? $this->generateTransactionId(),
                'user_id' => $data['user_id'] ?? '',
                'description' => $data['description'] ?? 'Paiement mobile',
                'callback_url' => $data['callback_url'] ?? route('payment.notify'),
                'return_url' => $data['return_url'] ?? route('payment.return'),
            ];

            Log::info('Pluto payment initiation request', [
                'external_id' => $payload['external_id'],
                'amount' => $payload['amount'],
                'phone' => $payload['phone']
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->post($this->baseUrl . '/payments/initiate', $payload);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('Pluto payment initiation response', $result);

                return [
                    'success' => true,
                    'transaction_id' => $result['transaction_id'] ?? $payload['external_id'],
                    'status' => $result['status'] ?? 'pending',
                    'message' => $result['message'] ?? 'Paiement initié avec succès',
                    'data' => $result
                ];
            } else {
                $error = $response->json();
                throw new Exception('Erreur Pluto: ' . ($error['message'] ?? 'Erreur inconnue'));
            }

        } catch (Exception $e) {
            Log::error('Pluto payment initiation error', [
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
        $this->validateDirectPayData($data);

        try {
            $payload = [
                'amount' => $data['amount'],
                'phone' => $data['phone'],
                'external_id' => $data['external_id'] ?? $this->generateTransactionId(),
                'description' => $data['description'] ?? 'Paiement direct mobile',
                'callback_url' => $data['callback_url'] ?? route('payment.notify'),
            ];

            Log::info('Pluto direct payment request', [
                'external_id' => $payload['external_id'],
                'amount' => $payload['amount'],
                'phone' => $payload['phone']
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->post($this->baseUrl . '/payments/direct', $payload);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('Pluto direct payment response', $result);

                return [
                    'success' => true,
                    'transaction_id' => $result['transaction_id'] ?? $payload['external_id'],
                    'status' => $result['status'] ?? 'pending',
                    'message' => $result['message'] ?? 'Paiement direct initié',
                    'data' => $result
                ];
            } else {
                $error = $response->json();
                throw new Exception('Erreur Pluto Direct Pay: ' . ($error['message'] ?? 'Erreur inconnue'));
            }

        } catch (Exception $e) {
            Log::error('Pluto direct payment error', [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            
            throw $e;
        }
    }

    /**
     * Vérifie le statut d'un paiement
     * @param string $transactionId
     * @return array
     * @throws Exception
     */
    public function checkPaymentStatus(string $transactionId): array
    {
        try {
            Log::info('Pluto payment status check', ['transaction_id' => $transactionId]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->get($this->baseUrl . '/payments/status/' . $transactionId);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('Pluto payment status response', $result);

                return [
                    'success' => true,
                    'transaction_id' => $transactionId,
                    'status' => $result['status'] ?? 'unknown',
                    'data' => $result
                ];
            } else {
                $error = $response->json();
                throw new Exception('Erreur lors de la vérification du statut: ' . ($error['message'] ?? 'Erreur inconnue'));
            }

        } catch (Exception $e) {
            Log::error('Pluto payment status check error', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId
            ]);
            
            throw $e;
        }
    }

    /**
     * Récupère le solde du compte
     * @return array
     * @throws Exception
     */
    public function getBalance(): array
    {
        try {
            Log::info('Pluto balance check');

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json'
            ])->timeout(30)->get($this->baseUrl . '/account/balance');

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('Pluto balance response', $result);

                return [
                    'success' => true,
                    'balance' => $result['balance'] ?? 0,
                    'currency' => $result['currency'] ?? 'XAF',
                    'data' => $result
                ];
            } else {
                $error = $response->json();
                throw new Exception('Erreur lors de la récupération du solde: ' . ($error['message'] ?? 'Erreur inconnue'));
            }

        } catch (Exception $e) {
            Log::error('Pluto balance check error', [
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Valide les données de paiement
     * @param array $data
     * @throws Exception
     */
    private function validatePaymentData(array $data): void
    {
        if (!isset($data['amount']) || !is_numeric($data['amount'])) {
            throw new Exception('Le montant est requis et doit être numérique.');
        }

        if ($data['amount'] < 100) {
            throw new Exception('Le montant minimum est de 100 XAF.');
        }

        if (!isset($data['phone']) || empty($data['phone'])) {
            throw new Exception('Le numéro de téléphone est requis.');
        }

        if (!preg_match('/^6[0-9]{8}$/', $data['phone'])) {
            throw new Exception('Format de numéro de téléphone invalide. Format attendu: 6XXXXXXXX');
        }
    }

    /**
     * Valide les données de paiement direct
     * @param array $data
     * @throws Exception
     */
    private function validateDirectPayData(array $data): void
    {
        $this->validatePaymentData($data);
        // Validations supplémentaires spécifiques au paiement direct si nécessaire
    }

    /**
     * Génère un ID de transaction unique
     * @return string
     */
    public function generateTransactionId(): string
    {
        return 'PLUTO_' . time() . '_' . uniqid();
    }
}