<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class CinetpayService
{
    protected $apiKey;
    protected $siteId;
    protected $secretKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('cinetpay.api_key');
        $this->siteId = config('cinetpay.site_id');
        $this->secretKey = config('cinetpay.secret_key');
        $this->baseUrl = config('cinetpay.base_url', 'https://api-checkout.cinetpay.com/v2');

        if (empty($this->apiKey) || empty($this->siteId)) {
            throw new Exception('Configuration CinetPay manquante. Vérifiez vos variables d\'environnement.');
        }
    }

    /**
     * Génère un lien de paiement
     * @param string $transactionId
     * @param float $amount
     * @param string $currency
     * @param string $description
     * @param array $additionalParams
     * @return array
     * @throws Exception
     */
    public function generatePayment(string $transactionId, float $amount, string $currency = 'XAF', string $description = 'Payment description', array $additionalParams = []): array
    {
        try {
            // Préparation des paramètres pour le paiement
            $params = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'currency' => $currency,
                'description' => $description,
                'customer_name' => $additionalParams['customer_name'] ?? 'Client',
                'customer_surname' => $additionalParams['customer_surname'] ?? 'Anonyme',
                'customer_email' => $additionalParams['customer_email'] ?? '',
                'customer_phone_number' => $additionalParams['customer_phone_number'] ?? '',
                'customer_address' => $additionalParams['customer_address'] ?? '',
                'customer_city' => $additionalParams['customer_city'] ?? '',
                'customer_country' => $additionalParams['customer_country'] ?? 'CM',
                'customer_state' => $additionalParams['customer_state'] ?? '',
                'customer_zip_code' => $additionalParams['customer_zip_code'] ?? '',
                'notify_url' => $additionalParams['notify_url'] ?? route('payment.notify'),
                'return_url' => $additionalParams['return_url'] ?? route('payment.return'),
                'channels' => $additionalParams['channels'] ?? 'ALL',
                'lang' => $additionalParams['lang'] ?? 'fr',
                'metadata' => $additionalParams['metadata'] ?? '',
                'alternative_currency' => $additionalParams['alternative_currency'] ?? '',
                'invoice_data' => $additionalParams['invoice_data'] ?? []
            ];

            Log::info('CinetPay payment generation request', [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'currency' => $currency
            ]);

            // Appel à l'API CinetPay
            $response = Http::timeout(30)->post($this->baseUrl . '/payment', $params);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('CinetPay payment generation response', $result);

                if ($result['code'] === '201') {
                    return [
                        'success' => true,
                        'code' => $result['code'],
                        'message' => $result['message'],
                        'data' => $result['data']
                    ];
                } else {
                    throw new Exception('Erreur CinetPay: ' . ($result['message'] ?? 'Erreur inconnue'));
                }
            } else {
                throw new Exception('Erreur HTTP: ' . $response->status() . ' - ' . $response->body());
            }

        } catch (Exception $e) {
            Log::error('CinetPay payment generation error', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId,
                'amount' => $amount
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
            if (empty($this->siteId)) {
                throw new Exception("CINETPAY_SITE_ID est requis pour vérifier le statut du paiement.");
            }

            $params = [
                'apikey' => $this->apiKey,
                'site_id' => $this->siteId,
                'transaction_id' => $transactionId
            ];

            Log::info('CinetPay status check request', [
                'transaction_id' => $transactionId
            ]);

            $response = Http::timeout(30)->post($this->baseUrl . '/payment/check', $params);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('CinetPay status check response', $result);

                return [
                    'success' => true,
                    'code' => $result['code'],
                    'message' => $result['message'] ?? '',
                    'data' => $result['data'] ?? []
                ];
            } else {
                throw new Exception('Erreur HTTP lors de la vérification: ' . $response->status());
            }

        } catch (Exception $e) {
            Log::error('CinetPay status check error', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId
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
        return 'CP_' . time() . '_' . uniqid();
    }

    /**
     * Valide les paramètres de paiement
     * @param array $params
     * @return bool
     * @throws Exception
     */
    public function validatePaymentParams(array $params): bool
    {
        $required = ['transaction_id', 'amount', 'currency', 'description'];
        
        foreach ($required as $field) {
            if (!isset($params[$field]) || empty($params[$field])) {
                throw new Exception("Le paramètre '$field' est requis.");
            }
        }

        if ($params['amount'] < 100) {
            throw new Exception("Le montant minimum est de 100 FCFA.");
        }

        $validCurrencies = ['XAF', 'XOF', 'CDF', 'GNF'];
        if (!in_array($params['currency'], $validCurrencies)) {
            throw new Exception("Devise non supportée. Devises valides: " . implode(', ', $validCurrencies));
        }

        return true;
    }
}
