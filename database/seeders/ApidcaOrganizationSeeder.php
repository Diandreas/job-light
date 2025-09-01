<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\CvModel;

class ApidcaOrganizationSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Créer l'organisation APIDCA
        $apidca = Company::create([
            'name' => 'APIDCA - Association Professionnelle des Archivistes',
            'email' => 'contact@apidca.org',
            'phone' => '+33 1 42 00 00 00',
            'address' => 'Paris, France',
            'website' => 'https://apidca.org',
            'industry' => 'Archives et Documentation',
            'description' => 'Association professionnelle dédiée à la promotion de l\'excellence dans les métiers des archives et de la documentation.',
            'status' => 'active',
            'type' => 'partner',
            'partner_code' => 'APIDCA',
            'contact_person' => 'Secrétariat APIDCA',
            'contact_email' => 'secretariat@apidca.org',
            'subscription_type' => 'premium',
            'subscription_expires_at' => null, // Partenariat permanent
            'can_post_jobs' => true,
            'can_access_profiles' => true,
            'job_posting_limit' => -1, // Illimité
            'notifications_enabled' => true,
            'auto_notify_members' => true
        ]);

        // Créer les templates CV APIDCA
        $templates = [
            [
                'name' => 'Archives Professionnel APIDCA',
                'description' => 'Template CV spécialisé pour les professionnels des archives. Design professionnel avec logo APIDCA intégré. Sections optimisées pour mettre en valeur l\'expérience en gestion documentaire.',
                'viewPath' => 'cv-templates.apidca-archives',
                'price' => 0, // Gratuit pour membres APIDCA
                'previewImagePath' => '/cv/apidca-archives-preview.png'
            ],
            [
                'name' => 'Conservateur APIDCA',
                'description' => 'Template élégant pour conservateurs et responsables d\'archives. Met l\'accent sur les projets de conservation et la gestion d\'équipes.',
                'viewPath' => 'cv-templates.apidca-conservateur',
                'price' => 0, // Gratuit pour membres APIDCA
                'previewImagePath' => '/cv/apidca-conservateur-preview.png'
            ],
            [
                'name' => 'Documentaliste APIDCA',
                'description' => 'Template moderne pour documentalistes et spécialistes de l\'information. Optimisé pour les compétences numériques et la recherche documentaire.',
                'viewPath' => 'cv-templates.apidca-documentaliste',
                'price' => 0, // Gratuit pour membres APIDCA
                'previewImagePath' => '/cv/apidca-documentaliste-preview.png'
            ]
        ];

        foreach ($templates as $templateData) {
            CvModel::create($templateData);
        }

        $this->command->info('Organisation APIDCA et templates créés avec succès !');
        $this->command->info('Code partenaire : APIDCA');
        $this->command->info('Templates gratuits : ' . count($templates));
    }
}