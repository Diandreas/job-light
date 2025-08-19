<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Paramètres généraux
            [
                'key' => 'site_name',
                'value' => 'Job Light',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Nom du site',
                'is_public' => true,
            ],
            [
                'key' => 'site_description',
                'value' => 'Plateforme de création de CV et portfolio professionnel',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Description du site',
                'is_public' => true,
            ],
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'type' => 'boolean',
                'group' => 'general',
                'description' => 'Mode maintenance activé',
                'is_public' => false,
            ],
            [
                'key' => 'user_registration_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'general',
                'description' => 'Inscription utilisateurs activée',
                'is_public' => false,
            ],
            [
                'key' => 'company_registration_enabled',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'general',
                'description' => 'Inscription entreprises activée',
                'is_public' => false,
            ],

            // Paramètres de fichiers
            [
                'key' => 'max_file_upload_size',
                'value' => '10',
                'type' => 'integer',
                'group' => 'files',
                'description' => 'Taille max upload en MB',
                'is_public' => false,
            ],
            [
                'key' => 'allowed_file_types',
                'value' => 'jpg,jpeg,png,pdf,docx',
                'type' => 'string',
                'group' => 'files',
                'description' => 'Types de fichiers autorisés',
                'is_public' => false,
            ],

            // Paramètres de paiement
            [
                'key' => 'cv_download_price',
                'value' => '2.99',
                'type' => 'float',
                'group' => 'payment',
                'description' => 'Prix de téléchargement CV en €',
                'is_public' => true,
            ],
            [
                'key' => 'portfolio_subscription_price',
                'value' => '9.99',
                'type' => 'float',
                'group' => 'payment',
                'description' => 'Prix abonnement portfolio en €',
                'is_public' => true,
            ],

            // Paramètres de parrainage
            [
                'key' => 'referral_bonus_amount',
                'value' => '1.00',
                'type' => 'float',
                'group' => 'referral',
                'description' => 'Bonus parrainage en €',
                'is_public' => false,
            ],
            [
                'key' => 'referral_code_expiry_days',
                'value' => '30',
                'type' => 'integer',
                'group' => 'referral',
                'description' => 'Durée validité code parrainage en jours',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            \App\Models\SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
