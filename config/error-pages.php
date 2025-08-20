<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuration des Pages d'Erreur
    |--------------------------------------------------------------------------
    |
    | Configuration pour personnaliser l'apparence et le comportement 
    | des pages d'erreur de l'application.
    |
    */

    'show_custom_pages' => env('SHOW_CUSTOM_ERROR_PAGES', true),

    'log_errors' => env('LOG_ERROR_PAGES', true),

    /*
    |--------------------------------------------------------------------------
    | Messages d'Erreur Personnalisés
    |--------------------------------------------------------------------------
    |
    | Messages d'erreur par défaut pour chaque code de statut HTTP.
    | Ces messages peuvent être écrasés par les traductions.
    |
    */
    'messages' => [
        404 => [
            'title' => 'Page Introuvable',
            'description' => 'Désolé, la page que vous recherchez n\'existe pas.',
            'suggestion' => 'Vérifiez l\'URL ou retournez à l\'accueil.',
        ],
        500 => [
            'title' => 'Erreur Serveur',
            'description' => 'Une erreur inattendue s\'est produite sur nos serveurs.',
            'suggestion' => 'Notre équipe a été notifiée et travaille à résoudre le problème.',
        ],
        403 => [
            'title' => 'Accès Interdit',
            'description' => 'Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource.',
            'suggestion' => 'Contactez un administrateur si vous pensez qu\'il s\'agit d\'une erreur.',
        ],
        503 => [
            'title' => 'Service Indisponible',
            'description' => 'Le service est temporairement indisponible.',
            'suggestion' => 'Réessayez dans quelques minutes.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration du Support
    |--------------------------------------------------------------------------
    |
    | Informations de contact pour le support technique.
    |
    */
    'support' => [
        'email' => env('SUPPORT_EMAIL', 'support@guidy.com'),
        'enabled' => env('SUPPORT_CONTACT_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Liens Rapides
    |--------------------------------------------------------------------------
    |
    | Liens utiles à afficher sur les pages d'erreur 404.
    |
    */
    'quick_links' => [
        'dashboard' => [
            'route' => 'dashboard',
            'auth_required' => true,
        ],
        'cv' => [
            'route' => 'cv-infos.index',
            'auth_required' => true,
        ],
        'home' => [
            'route' => 'welcome',
            'auth_required' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuration des Animations
    |--------------------------------------------------------------------------
    |
    | Paramètres pour les animations des pages d'erreur.
    |
    */
    'animations' => [
        'enabled' => env('ERROR_ANIMATIONS_ENABLED', true),
        'duration' => 0.6,
        'floating_elements' => true,
    ],
];
