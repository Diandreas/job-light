<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Fapshi Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour l'API Fapshi pour les paiements mobiles
    |
    */

    'api_user' => env('FAPSHI_API_USER'),
    'api_key' => env('FAPSHI_API_KEY'),
    'base_url' => env('FAPSHI_BASE_URL', 'https://live.fapshi.com'),
    
    /*
    |--------------------------------------------------------------------------
    | Sandbox Mode
    |--------------------------------------------------------------------------
    |
    | En mode sandbox, utilisez l'URL de test
    |
    */
    'sandbox' => env('FAPSHI_SANDBOX', true),
    'sandbox_url' => env('FAPSHI_SANDBOX_URL', 'https://sandbox.fapshi.com'),
    
    /*
    |--------------------------------------------------------------------------
    | Timeout Configuration
    |--------------------------------------------------------------------------
    |
    | Timeout en secondes pour les requêtes API
    |
    */
    'timeout' => env('FAPSHI_TIMEOUT', 30),
    
    /*
    |--------------------------------------------------------------------------
    | Currency Configuration
    |--------------------------------------------------------------------------
    |
    | Devise par défaut pour les paiements
    |
    */
    'default_currency' => env('FAPSHI_DEFAULT_CURRENCY', 'XAF'),
    
    /*
    |--------------------------------------------------------------------------
    | Minimum Amount
    |--------------------------------------------------------------------------
    |
    | Montant minimum pour les paiements (en XAF)
    |
    */
    'min_amount' => env('FAPSHI_MIN_AMOUNT', 100),
    
    /*
    |--------------------------------------------------------------------------
    | Phone Number Validation
    |--------------------------------------------------------------------------
    |
    | Pattern de validation pour les numéros de téléphone (Cameroun)
    |
    */
    'phone_pattern' => '/^6[0-9]{8}$/',
    
    /*
    |--------------------------------------------------------------------------
    | Transaction ID Validation
    |--------------------------------------------------------------------------
    |
    | Pattern de validation pour les IDs de transaction
    |
    */
    'transaction_id_pattern' => '/^[a-zA-Z0-9]{8,10}$/',
    
    /*
    |--------------------------------------------------------------------------
    | User ID Validation
    |--------------------------------------------------------------------------
    |
    | Pattern de validation pour les IDs d'utilisateur
    |
    */
    'user_id_pattern' => '/^[a-zA-Z0-9-_]{1,100}$/',
];