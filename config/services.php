<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],
    'mistral' => [
        'api_key' => env('MISTRAL_API_KEY'),
        'organization' => env('MISTRAL_ORGANIZATION'),
        'models' => [
            'default' => 'mistral-medium',
            'small' => 'mistral-small',
            'large' => 'mistral-large'
        ],
    ],

    'notchpay' => [
        'public_key' => env('NOTCHPAY_PUBLIC_KEY'),
        'private_key' => env('NOTCHPAY_PRIVATE_KEY'),
        'webhook_secret' => env('NOTCHPAY_WEBHOOK_SECRET'),
        'callback_url' => env('NOTCHPAY_CALLBACK_URL'),
        'sandbox' => env('NOTCHPAY_SANDBOX', true),
    ],

    'career_advisor' => [
        'max_history' => 3,
        'token_limit' => 2000,
        'services' => [
            'career-advice' => [
                'cost' => 100,
                'model' => 'mistral-medium',
            ],
            'cover-letter' => [
                'cost' => 200,
                'model' => 'mistral-large',
                'formats' => ['pdf', 'docx']
            ],
            'interview-prep' => [
                'cost' => 150,
                'model' => 'mistral-medium',
            ],
            'resume-review' => [
                'cost' => 180,
                'model' => 'mistral-large',
            ],
        ],
    ],
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
