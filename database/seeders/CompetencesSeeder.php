<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompetencesSeeder extends Seeder
{
    public function run()
    {
        $competences = [
            'Compétences techniques IT' => [
                'Développement Web' => [
                    'Frameworks Frontend' => [
                        'Angular', 'React', 'Vue.js', 'Next.js', 'Nuxt.js',
                        'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS',
                        'Material UI', 'Chakra UI', 'Redux', 'Vuex',
                        'Alpine.js', 'Ember.js', 'Backbone.js'
                    ],
                    'Frameworks Backend' => [
                        'Laravel', 'Symfony', 'Django', 'Flask',
                        'Express.js', 'NestJS', 'Spring Boot', 'CodeIgniter',
                        'Ruby on Rails', 'ASP.NET Core', 'FastAPI',
                        'AdonisJS', 'Strapi', 'Fastify'
                    ],
                    'CMS' => [
                        'WordPress', 'Drupal', 'Joomla', 'PrestaShop',
                        'Shopify', 'Magento', 'WooCommerce', 'OpenCart',
                        'MODX', 'October CMS'
                    ]
                ],
                'Développement Mobile' => [
                    'React Native', 'Flutter', 'Ionic', 'Xamarin',
                    'PhoneGap', 'Cordova', 'Kotlin', 'Swift UI',
                    'Java Android', 'Expo'
                ],
                'Design et UX' => [
                    'Photoshop', 'Illustrator', 'InDesign', 'Figma',
                    'UX Design', 'UI Design', 'Sketch', 'Adobe XD',
                    'After Effects', 'Premier Pro'
                ]
            ],

            'Compétences linguistiques' => [
                'Langues internationales' => [
                    'Anglais', 'Français', 'Allemand', 'Espagnol',
                    'Italien', 'Portugais', 'Néerlandais', 'Arabe'
                ],
                'Langues nationales camerounaises' => [
                    'Fulfulde', 'Ewondo', 'Douala', 'Bamiléké',
                    'Bamoun', 'Bassa', 'Gbaya'
                ],
                'Communication professionnelle' => [
                    'Rédaction technique', 'Communication orale',
                    'Présentation publique', 'Négociation',
                    'Médiation interculturelle'
                ]
            ],

            'Compétences comportementales' => [
                'Leadership' => [
                    'Gestion d\'équipe', 'Prise de décision',
                    'Délégation', 'Motivation d\'équipe',
                    'Résolution de conflits', 'Coaching'
                ],
                'Soft Skills' => [
                    'Intelligence émotionnelle', 'Adaptabilité',
                    'Travail en équipe', 'Gestion du stress',
                    'Créativité', 'Pensée critique'
                ]
            ],

            'Compétences sectorielles' => [
                'Agriculture et Élevage' => [
                    'Culture du cacao', 'Culture du café',
                    'Maraîchage', 'Culture vivrière',
                    'Aviculture', 'Pisciculture',
                    'Élevage bovin', 'Apiculture'
                ],
                'Artisanat et Métiers' => [
                    'Couture', 'Menuiserie', 'Maçonnerie',
                    'Électricité bâtiment', 'Plomberie',
                    'Coiffure', 'Mécanique auto'
                ],
                'Commerce et Services' => [
                    'Gestion de boutique', 'Commerce en ligne',
                    'Marketing digital local', 'Mobile Money',
                    'Gestion des stocks', 'Service client'
                ]
            ],

            'Compétences numériques avancées' => [
                'Data Science' => [
                    'Machine Learning', 'Deep Learning', 'Python scientifique',
                    'R', 'TensorFlow', 'PyTorch', 'Scikit-learn',
                    'Analyse de données', 'Big Data', 'Data Mining'
                ],
                'DevOps' => [
                    'Docker', 'Kubernetes', 'Jenkins',
                    'GitLab CI', 'GitHub Actions', 'AWS',
                    'Azure', 'Google Cloud', 'Linux'
                ],
                'Cybersécurité' => [
                    'Sécurité réseau', 'Cryptographie',
                    'Pentesting', 'Sécurité web',
                    'Forensique numérique', 'OSINT'
                ]
            ],

            'Compétences managériales' => [
                'Gestion de projet' => [
                    'Méthodologie Agile', 'Scrum', 'PMP',
                    'Prince2', 'Kanban', 'Lean Management'
                ],
                'Management d\'entreprise' => [
                    'Stratégie d\'entreprise', 'Gestion financière',
                    'Ressources humaines', 'Marketing stratégique',
                    'Gestion des risques', 'Innovation'
                ]
            ],

            'Compétences commerciales' => [
                'Vente et Marketing' => [
                    'Techniques de vente', 'Marketing digital',
                    'SEO/SEA', 'Social Media Marketing',
                    'CRM', 'Analyse de marché'
                ],
                'Service Client' => [
                    'Support client', 'Gestion des réclamations',
                    'Service après-vente', 'Fidélisation client'
                ]
            ],

            'Compétences industrielles' => [
                'Production' => [
                    'Lean Manufacturing', 'Contrôle qualité',
                    'Maintenance industrielle', 'GPAO',
                    'Six Sigma', '5S'
                ],
                'Qualité et Sécurité' => [
                    'ISO 9001', 'HACCP', 'QHSE',
                    'Prévention des risques', 'Audit qualité'
                ]
            ],

            'Développement durable' => [
                'Environnement' => [
                    'Gestion des déchets', 'Énergies renouvelables',
                    'Économie circulaire', 'Protection environnementale',
                    'Audit environnemental'
                ],
                'RSE' => [
                    'Responsabilité sociale', 'Commerce équitable',
                    'Développement communautaire', 'Impact social'
                ]
            ],

            'Innovation et Recherche' => [
                'R&D' => [
                    'Innovation produit', 'Recherche appliquée',
                    'Prototypage', 'Veille technologique'
                ],
                'Méthodologie' => [
                    'Design Thinking', 'Innovation frugale',
                    'Recherche qualitative', 'Recherche quantitative'
                ]
            ]
        ];

        foreach ($competences as $categorie => $sousCategories) {
            foreach ($sousCategories as $sousCategorie => $competencesList) {
                if (is_array($competencesList)) {
                    foreach ($competencesList as $key => $value) {
                        if (is_array($value)) {
                            foreach ($value as $competence) {
                                DB::table('competences')->insert([
                                    'name' => $competence,
                                    'description' => "$key - $sousCategorie",
                                    'created_at' => now(),
                                    'updated_at' => now()
                                ]);
                            }
                        } else {
                            DB::table('competences')->insert([
                                'name' => $value,
                                'description' => "$sousCategorie - $categorie",
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                        }
                    }
                }
            }
        }
    }
}
