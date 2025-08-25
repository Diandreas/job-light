<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CinetPay Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour l'intégration de CinetPay
    |
    */

    // Clé API CinetPay (récupérée depuis votre compte marchand)
    'api_key' => env('CINETPAY_API_KEY', ''),

    // ID du site CinetPay
    'site_id' => env('CINETPAY_SITE_ID', ''),

    // Clé secrète pour la vérification HMAC
    'secret_key' => env('CINETPAY_SECRET_KEY', ''),

    // URL de base de l'API CinetPay
    'base_url' => env('CINETPAY_BASE_URL', 'https://api-checkout.cinetpay.com/v2'),

    // Environnement (test ou production)
    'environment' => env('CINETPAY_ENVIRONMENT', 'test'),

    // Devise par défaut
    'default_currency' => env('CINETPAY_DEFAULT_CURRENCY', 'XAF'),

    // Langue par défaut
    'default_language' => env('CINETPAY_DEFAULT_LANGUAGE', 'fr'),

    // Canaux de paiement par défaut
    'default_channels' => env('CINETPAY_DEFAULT_CHANNELS', 'ALL'),

    // URLs de notification et de retour
    'notify_url' => env('CINETPAY_NOTIFY_URL', '/api/cinetpay/notify'),
    'return_url' => env('CINETPAY_RETURN_URL', '/api/cinetpay/return'),

    // Timeout pour les appels API (en secondes)
    'timeout' => env('CINETPAY_TIMEOUT', 30),

    // Logging des transactions
    'enable_logging' => env('CINETPAY_ENABLE_LOGGING', true),

    // Vérification HMAC (recommandé en production)
    'enable_hmac_verification' => env('CINETPAY_ENABLE_HMAC', true),
];
