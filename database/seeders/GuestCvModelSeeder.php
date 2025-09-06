<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CvModel;

class GuestCvModelSeeder extends Seeder
{
    /**
     * Run the database seeders.
     * Seed CV models with varied pricing for guest CV functionality
     */
    public function run(): void
    {
        // Modèles gratuits
        $freeModels = [
            [
                'name' => 'Classique',
                'description' => 'Modèle traditionnel et professionnel, parfait pour tous secteurs',
                'viewPath' => 'classique',
                'price' => 0,
                'previewImagePath' => '/images/cv-previews/classique.png'
            ],
            [
                'name' => 'Moderne',
                'description' => 'Design contemporain avec une mise en page claire et aérée',
                'viewPath' => 'moderne', 
                'price' => 0,
                'previewImagePath' => '/images/cv-previews/moderne.png'
            ],
            [
                'name' => 'Minimaliste',
                'description' => 'Épuré et élégant, idéal pour un style sobre et professionnel',
                'viewPath' => 'minimaliste',
                'price' => 0,
                'previewImagePath' => '/images/cv-previews/minimaliste.png'
            ]
        ];

        // Modèles premium
        $premiumModels = [
            [
                'name' => 'Créatif',
                'description' => 'Design artistique avec éléments graphiques, parfait pour les métiers créatifs',
                'viewPath' => 'creatif',
                'price' => 8,
                'previewImagePath' => '/images/cv-previews/creatif.png'
            ],
            [
                'name' => 'Luxe',
                'description' => 'Modèle haut de gamme avec finitions premium et typographie raffinée',
                'viewPath' => 'luxe',
                'price' => 12,
                'previewImagePath' => '/images/cv-previews/luxe.png'
            ],
            [
                'name' => 'Digital',
                'description' => 'Template moderne orienté tech avec sections spécialisées',
                'viewPath' => 'digital',
                'price' => 10,
                'previewImagePath' => '/images/cv-previews/digital.png'
            ],
            [
                'name' => 'International',
                'description' => 'Format international avec standards européens et américains',
                'viewPath' => 'international',
                'price' => 7,
                'previewImagePath' => '/images/cv-previews/international.png'
            ],
            [
                'name' => 'Technique',
                'description' => 'Spécialisé pour les profils techniques avec sections projets et certifications',
                'viewPath' => 'technique',
                'price' => 9,
                'previewImagePath' => '/images/cv-previews/technique.png'
            ],
            [
                'name' => 'Élégant',
                'description' => 'Sophistiqué avec une approche raffinée de la mise en page',
                'viewPath' => 'elegant',
                'price' => 11,
                'previewImagePath' => '/images/cv-previews/elegant.png'
            ],
            [
                'name' => 'Corporate',
                'description' => 'Style corporate pour grandes entreprises et postes de direction',
                'viewPath' => 'corporatif',
                'price' => 15,
                'previewImagePath' => '/images/cv-previews/corporatif.png'
            ]
        ];

        // Créer les modèles gratuits
        foreach ($freeModels as $model) {
            CvModel::updateOrCreate(
                ['viewPath' => $model['viewPath']],
                $model
            );
        }

        // Créer les modèles premium
        foreach ($premiumModels as $model) {
            CvModel::updateOrCreate(
                ['viewPath' => $model['viewPath']],
                $model
            );
        }

        $this->command->info('CV Models seeded successfully!');
        $this->command->line('- ' . count($freeModels) . ' modèles gratuits créés');
        $this->command->line('- ' . count($premiumModels) . ' modèles premium créés (prix de 7€ à 15€)');
    }
}