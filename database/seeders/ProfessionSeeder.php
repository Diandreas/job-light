<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProfessionSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'Forces armées' => [
                'description' => 'Professions militaires et de défense',
                'subcategories' => [
                    'Officiers des forces armées' => [
                        'professions' => [
                            'Colonel',
                            'Commandant',
                            'Capitaine',
                            'Lieutenant',
                            'Général de brigade'
                        ]
                    ],
                    'Sous-officiers des forces armées' => [
                        'professions' => [
                            'Sergent-chef',
                            'Adjudant',
                            'Major',
                            'Sergent',
                            'Adjudant-chef'
                        ]
                    ],
                    'Autres membres des forces armées' => [
                        'professions' => [
                            'Soldat de première classe',
                            'Caporal',
                            'Caporal-chef',
                            'Militaire du rang',
                            'Agent de sécurité militaire'
                        ]
                    ]
                ]
            ],
            'Direction et Cadres' => [
                'description' => 'Dirigeants, cadres supérieurs et membres de l\'exécutif',
                'subcategories' => [
                    'Dirigeants d\'entreprise' => [
                        'professions' => [
                            'PDG',
                            'Directeur général',
                            'Gérant de société',
                            'Président du conseil d\'administration',
                            'Fondateur de startup'
                        ]
                    ],
                    'Cadres de direction' => [
                        'professions' => [
                            'Directeur financier',
                            'Directeur commercial',
                            'DRH',
                            'Directeur marketing',
                            'Directeur des opérations',
                            'Directeur technique'
                        ]
                    ],
                    'Législateurs et hauts fonctionnaires' => [
                        'professions' => [
                            'Député',
                            'Sénateur',
                            'Maire',
                            'Préfet',
                            'Ambassadeur',
                            'Consul'
                        ]
                    ]
                ]
            ],
            'Professions intellectuelles' => [
                'description' => 'Professions intellectuelles et scientifiques',
                'subcategories' => [
                    'Sciences et ingénierie' => [
                        'professions' => [
                            'Physicien',
                            'Chimiste',
                            'Biologiste',
                            'Ingénieur civil',
                            'Ingénieur mécanique',
                            'Ingénieur électrique',
                            'Mathématicien',
                            'Astronome'
                        ]
                    ],
                    'Santé' => [
                        'professions' => [
                            'Médecin généraliste',
                            'Chirurgien',
                            'Pharmacien',
                            'Dentiste',
                            'Psychiatre',
                            'Cardiologue',
                            'Pédiatre',
                            'Anesthésiste'
                        ]
                    ],
                    'Enseignement' => [
                        'professions' => [
                            'Professeur des universités',
                            'Professeur des écoles',
                            'Chercheur',
                            'Formateur professionnel',
                            'Professeur de lycée',
                            'Maître de conférences'
                        ]
                    ],
                    'Finance et gestion' => [
                        'professions' => [
                            'Analyste financier',
                            'Contrôleur de gestion',
                            'Expert-comptable',
                            'Actuaire',
                            'Gestionnaire de portefeuille',
                            'Auditeur financier'
                        ]
                    ],
                    'Technologies de l\'information' => [
                        'professions' => [
                            'Architecte système',
                            'Ingénieur DevOps',
                            'Administrateur réseau',
                            'Chef de projet IT',
                            'Architecte logiciel',
                            'Expert en sécurité informatique'
                        ]
                    ],
                    'Juridique et social' => [
                        'professions' => [
                            'Avocat',
                            'Notaire',
                            'Juge',
                            'Juriste d\'entreprise',
                            'Conseiller juridique',
                            'Huissier de justice'
                        ]
                    ],
                    'Culture et création' => [
                        'professions' => [
                            'Architecte',
                            'Conservateur de musée',
                            'Directeur artistique',
                            'Commissaire d\'exposition',
                            'Critique d\'art',
                            'Restaurateur d\'œuvres d\'art'
                        ]
                    ]
                ]
            ],
            'Professions intermédiaires' => [
                'description' => 'Techniciens et professions intermédiaires',
                'subcategories' => [
                    'Sciences et ingénierie' => [
                        'professions' => [
                            'Technicien de laboratoire',
                            'Technicien en maintenance industrielle',
                            'Dessinateur industriel',
                            'Technicien qualité',
                            'Technicien en métrologie'
                        ]
                    ],
                    'Santé' => [
                        'professions' => [
                            'Infirmier',
                            'Kinésithérapeute',
                            'Orthophoniste',
                            'Sage-femme',
                            'Podologue',
                            'Ergothérapeute'
                        ]
                    ],
                    'Affaires et administration' => [
                        'professions' => [
                            'Assistant de direction',
                            'Chargé de clientèle',
                            'Responsable administratif',
                            'Gestionnaire de paie',
                            'Assistant commercial'
                        ]
                    ],
                    'Services juridiques et sociaux' => [
                        'professions' => [
                            'Assistant juridique',
                            'Médiateur social',
                            'Conseiller en insertion',
                            'Délégué à la tutelle',
                            'Assistant social'
                        ]
                    ],
                    'Culture et communication' => [
                        'professions' => [
                            'Animateur culturel',
                            'Technicien audiovisuel',
                            'Assistant de production',
                            'Régisseur de spectacle',
                            'Documentaliste'
                        ]
                    ]
                ]
            ],
            'Employés administratifs' => [
                'description' => 'Employés de type administratif',
                'subcategories' => [
                    'Employés de bureau' => [
                        'professions' => [
                            'Secrétaire',
                            'Agent administratif',
                            'Standardiste',
                            'Employé de bureau',
                            'Assistant administratif'
                        ]
                    ],
                    'Service à la clientèle' => [
                        'professions' => [
                            'Conseiller clientèle',
                            'Chargé d\'accueil',
                            'Téléconseiller',
                            'Agent de service client',
                            'Hôte d\'accueil'
                        ]
                    ],
                    'Comptabilité et finance' => [
                        'professions' => [
                            'Aide-comptable',
                            'Agent comptable',
                            'Employé de facturation',
                            'Assistant comptable',
                            'Caissier'
                        ]
                    ],
                    'Stockage et logistique' => [
                        'professions' => [
                            'Magasinier',
                            'Gestionnaire de stock',
                            'Agent logistique',
                            'Préparateur de commandes',
                            'Agent d\'expédition'
                        ]
                    ]
                ]
            ],
            'Services et vente' => [
                'description' => 'Personnel des services et vendeurs',
                'subcategories' => [
                    'Services personnels' => [
                        'professions' => [
                            'Coiffeur',
                            'Esthéticien',
                            'Masseur',
                            'Conseiller en image',
                            'Agent de voyage'
                        ]
                    ],
                    'Vente' => [
                        'professions' => [
                            'Vendeur',
                            'Commercial',
                            'Responsable de boutique',
                            'Merchandiser',
                            'Représentant commercial'
                        ]
                    ],
                    'Soins aux personnes' => [
                        'professions' => [
                            'Aide-soignant',
                            'Auxiliaire de vie',
                            'Assistant maternel',
                            'Accompagnant éducatif',
                            'Aide à domicile'
                        ]
                    ],
                    'Protection et sécurité' => [
                        'professions' => [
                            'Agent de sécurité',
                            'Surveillant',
                            'Agent de surveillance',
                            'Gardien',
                            'Maître-chien'
                        ]
                    ]
                ]
            ],
            'Agriculture et pêche' => [
                'description' => 'Agriculteurs et ouvriers qualifiés de l\'agriculture',
                'subcategories' => [
                    'Agriculture commerciale' => [
                        'professions' => [
                            'Agriculteur',
                            'Maraîcher',
                            'Viticulteur',
                            'Horticulteur',
                            'Céréalier'
                        ]
                    ],
                    'Élevage' => [
                        'professions' => [
                            'Éleveur bovin',
                            'Éleveur ovin',
                            'Aviculteur',
                            'Apiculteur',
                            'Pisciculteur'
                        ]
                    ],
                    'Sylviculture' => [
                        'professions' => [
                            'Bûcheron',
                            'Sylviculteur',
                            'Agent forestier',
                            'Élagueur',
                            'Technicien forestier'
                        ]
                    ],
                    'Pêche et aquaculture' => [
                        'professions' => [
                            'Pêcheur',
                            'Marin-pêcheur',
                            'Aquaculteur',
                            'Conchyliculteur',
                            'Patron de pêche'
                        ]
                    ]
                ]
            ],
            'Métiers qualifiés' => [
                'description' => 'Métiers qualifiés de l\'industrie et de l\'artisanat',
                'subcategories' => [
                    'Bâtiment' => [
                        'professions' => [
                            'Maçon',
                            'Plombier',
                            'Carreleur',
                            'Couvreur',
                            'Peintre en bâtiment',
                            'Charpentier'
                        ]
                    ],
                    'Métallurgie' => [
                        'professions' => [
                            'Soudeur',
                            'Chaudronnier',
                            'Forgeron',
                            'Métallier',
                            'Ferronnier'
                        ]
                    ],
                    'Artisanat' => [
                        'professions' => [
                            'Ébéniste',
                            'Bijoutier',
                            'Céramiste',
                            'Tapissier',
                            'Relieur'
                        ]
                    ],
                    'Électricité et électronique' => [
                        'professions' => [
                            'Électricien',
                            'Électronicien',
                            'Installateur domotique',
                            'Technicien de maintenance',
                            'Bobiner'
                        ]
                    ],
                    'Alimentation' => [
                        'professions' => [
                            'Boulanger',
                            'Pâtissier',
                            'Boucher',
                            'Charcutier',
                            'Chocolatier'
                        ]
                    ],
                    'Bois' => [
                        'professions' => [
                            'Menuisier',
                            'Agenceur',
                            'Tonnelier',
                            'Sculpteur sur bois',
                            'Marqueteur'
                        ]
                    ],
                    'Textile' => [
                        'professions' => [
                            'Couturier',
                            'Tailleur',
                            'Brodeur',
                            'Tisseur',
                            'Modéliste'
                        ]
                    ]
                ]
            ],
            'Opérateurs et assembleurs' => [
                'description' => 'Conducteurs d\'installations et de machines',
                'subcategories' => [
                    'Opérateurs d\'installations fixes' => [
                        'professions' => [
                            'Opérateur de production',
                            'Conducteur de machine',
                            'Opérateur de centrale',
                            'Pilote d\'installation',
                            'Opérateur chimique'
                        ]
                    ],
                    'Assembleurs' => [
                        'professions' => [
                            'Monteur',
                            'Assembleur électronique',
                            'Assembleur automobile',
                            'Monteur en aéronautique',
                            'Assembleur de précision'
                        ]
                    ],
                    'Conducteurs de véhicules' => [
                        'professions' => [
                            'Chauffeur poids lourd',
                            'Conducteur de bus',
                            'Chauffeur-livreur',
                            'Conducteur d\'engins',
                            'Taxi'
                        ]
                    ]
                ]
            ],
            'Professions élémentaires' => [
                'description' => 'Professions élémentaires',
                'subcategories' => [
                    'Nettoyage et aide aux ménages' => [
                        'professions' => [
                            'Agent d\'entretien',
                            'Femme de ménage',
                            'Agent de propreté',
                            'Concierge',
                            'Agent de nettoyage'
                        ]
                    ],
                    'Manœuvres' => [
                        'professions' => ['Manutentionnaire',
                            'Ouvrier du bâtiment',
                            'Docker',
                            'Manœuvre agricole',
                            'Aide-maçon'
                        ]
                    ],
                    'Assistants de préparation alimentaire' => [
                        'professions' => [
                            'Commis de cuisine',
                            'Aide-cuisinier',
                            'Plongeur en restauration',
                            'Préparateur en restauration rapide',
                            'Employé polyvalent de restauration'
                        ]
                    ]
                ]
            ],
            'Économie numérique' => [
                'description' => 'Nouvelles professions de l\'économie numérique',
                'subcategories' => [
                    'Développement logiciel' => [
                        'professions' => [
                            'Développeur full-stack',
                            'Développeur mobile',
                            'Développeur front-end',
                            'Développeur back-end',
                            'Architecte logiciel',
                            'Lead développeur'
                        ]
                    ],
                    'Data et IA' => [
                        'professions' => [
                            'Data Scientist',
                            'Data Engineer',
                            'Data Analyst',
                            'Machine Learning Engineer',
                            'Ingénieur IA',
                            'Data Architect'
                        ]
                    ],
                    'Cybersécurité' => [
                        'professions' => [
                            'Expert en cybersécurité',
                            'Pentester',
                            'Analyste SOC',
                            'Ingénieur sécurité réseau',
                            'Consultant en sécurité informatique',
                            'Responsable RSSI'
                        ]
                    ],
                    'Marketing digital' => [
                        'professions' => [
                            'Community Manager',
                            'Growth Hacker',
                            'SEO Manager',
                            'Content Manager',
                            'Traffic Manager',
                            'Social Media Manager'
                        ]
                    ]
                ]
            ],
            'Économie verte' => [
                'description' => 'Métiers de la transition écologique',
                'subcategories' => [
                    'Énergies renouvelables' => [
                        'professions' => [
                            'Ingénieur en énergies renouvelables',
                            'Installateur de panneaux solaires',
                            'Technicien éolien',
                            'Chef de projet EnR',
                            'Expert en efficacité énergétique',
                            'Conseiller en énergie'
                        ]
                    ],
                    'Économie circulaire' => [
                        'professions' => [
                            'Responsable valorisation déchets',
                            'Expert en recyclage',
                            'Consultant en économie circulaire',
                            'Chargé de projet économie circulaire',
                            'Responsable développement durable',
                            'Expert en éco-conception'
                        ]
                    ],
                    'Protection de l\'environnement' => [
                        'professions' => [
                            'Ingénieur environnement',
                            'Écologue',
                            'Chargé d\'études environnementales',
                            'Garde forestier',
                            'Technicien de l\'environnement',
                            'Consultant environnemental'
                        ]
                    ]
                ]
            ],
            'Industries créatives' => [
                'description' => 'Métiers de la création et du divertissement',
                'subcategories' => [
                    'Arts et spectacles' => [
                        'professions' => [
                            'Artiste peintre',
                            'Musicien',
                            'Comédien',
                            'Danseur',
                            'Metteur en scène',
                            'Chorégraphe'
                        ]
                    ],
                    'Design' => [
                        'professions' => [
                            'Designer graphique',
                            'Designer UX/UI',
                            'Designer produit',
                            'Designer d\'intérieur',
                            'Designer industriel',
                            'Motion designer'
                        ]
                    ],
                    'Médias' => [
                        'professions' => [
                            'Journaliste',
                            'Réalisateur',
                            'Producteur',
                            'Monteur vidéo',
                            'Photographe',
                            'Rédacteur en chef'
                        ]
                    ],
                    'Jeux vidéo' => [
                        'professions' => [
                            'Game Designer',
                            'Level Designer',
                            'Character Artist',
                            'Développeur de jeux',
                            'Testeur de jeux vidéo',
                            'Sound Designer'
                        ]
                    ]
                ]
            ],
            'Recherche et innovation' => [
                'description' => 'Métiers de la recherche et développement',
                'subcategories' => [
                    'Recherche fondamentale' => [
                        'professions' => [
                            'Chercheur en physique',
                            'Chercheur en biologie',
                            'Chercheur en mathématiques',
                            'Chercheur en sciences sociales',
                            'Chercheur en neurosciences',
                            'Chercheur en chimie'
                        ]
                    ],
                    'R&D industrielle' => [
                        'professions' => [
                            'Ingénieur R&D',
                            'Chef de projet innovation',
                            'Responsable laboratoire R&D',
                            'Ingénieur développement produit',
                            'Expert en propriété intellectuelle',
                            'Ingénieur process'
                        ]
                    ],
                    'Innovation sociale' => [
                        'professions' => [
                            'Designer de services',
                            'Facilitateur d\'innovation',
                            'Expert en innovation sociale',
                            'Chargé de projet ESS',
                            'Consultant en innovation participative',
                            'Coordinateur de tiers-lieu'
                        ]
                    ]
                ]
            ]
        ];

        // Code d'insertion
        foreach ($categories as $categoryName => $categoryData) {
            $mainCategoryId = DB::table('profession_categories')->insertGetId([
                'name' => $categoryName,
                'description' => $categoryData['description'],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            foreach ($categoryData['subcategories'] as $subCategoryName => $subCategoryData) {
                $subCategoryId = DB::table('profession_categories')->insertGetId([
                    'name' => $subCategoryName,
                    'description' => "Sous-catégorie de {$categoryName}",
                    'parent_id' => $mainCategoryId,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                if (isset($subCategoryData['professions'])) {
                    foreach ($subCategoryData['professions'] as $profession) {
                        DB::table('professions')->insert([
                            'name' => $profession,
                            'description' => "Professionnel en {$subCategoryName}",
                            'category_id' => $subCategoryId,
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }
            }
        }
    }
}
