<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CvModel;

class ApidcaCvModelSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Template CV APIDCA gratuit pour les membres
        CvModel::create([
            'name' => 'Archives Professionnel APIDCA',
            'description' => 'Template CV spécialisé pour les professionnels des archives, créé en partenariat avec l\'APIDCA. Design professionnel avec logo APIDCA intégré.',
            'viewPath' => 'cv-templates.apidca-archives',
            'price' => 0, // Gratuit pour les membres APIDCA
            'previewImagePath' => '/cv/apidca-preview.png'
        ]);

        // Template CV Archives Premium (version payante avec plus de fonctionnalités)
        CvModel::create([
            'name' => 'Archives Premium APIDCA',
            'description' => 'Version premium du template archives avec sections spécialisées : projets de numérisation, certifications professionnelles, publications académiques.',
            'viewPath' => 'cv-templates.apidca-archives-premium',
            'price' => 0, // Aussi gratuit dans le cadre du partenariat
            'previewImagePath' => '/cv/apidca-premium-preview.png'
        ]);
    }
}