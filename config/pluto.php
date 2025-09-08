<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pluto Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour l'API Pluto pour les paiements mobiles
    |
    */

    'api_key' => env('PLUTO_API_KEY'),
    'base_url' => env('PLUTO_BASE_URL', 'https://api.pluto.com'),
    
    /*
    |--------------------------------------------------------------------------
    | Sandbox Mode
    |--------------------------------------------------------------------------
    |
    | En mode sandbox, utilisez l'URL de test
    |
    */
    'sandbox' => env('PLUTO_SANDBOX', false),
    'sandbox_url' => env('PLUTO_SANDBOX_URL', 'https://sandbox-api.pluto.com'),
    
    /*
    |--------------------------------------------------------------------------
    | Timeout Configuration
    |--------------------------------------------------------------------------
    |
    | Timeout en secondes pour les requêtes API
    |
    */
    'timeout' => env('PLUTO_TIMEOUT', 30),
    
    /*
    |--------------------------------------------------------------------------
    | Currency Configuration
    |--------------------------------------------------------------------------
    |
    | Devise par défaut pour les paiements
    |
    */
    'default_currency' => env('PLUTO_DEFAULT_CURRENCY', 'XAF'),
    
    /*
    |--------------------------------------------------------------------------
    | Minimum Amount
    |--------------------------------------------------------------------------
    |
    | Montant minimum pour les paiements
    |
    */
    'min_amount' => env('PLUTO_MIN_AMOUNT', 100),
];