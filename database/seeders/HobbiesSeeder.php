<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HobbiesSeeder extends Seeder
{
    public function run()
    {
        $hobbies = [


            'Sports' => [

                'Arts Martiaux et Sports de Combat' => [
                    // Arts Martiaux avec fédérations au Cameroun
                    'Judo',
                    'Karaté',
                    'Taekwondo',
                    'Kung-fu',
                    'Aïkido',
                    'Viet Vo Dao',
                    'Boxe anglaise',
                    'Boxe chinoise (Wushu)',
                    'Kick-boxing',
                    'Full contact',
                    'MMA (Mixed Martial Arts)',
                    'Nanbudo',
                    'Yoseikan Budo'
                ],
                'Sports collectifs' => [
                    'Football',
                    'Basketball',
                    'Volleyball',
                    'Rugby',
                    'Handball'
                ],
                'Sports individuels' => [
                    'Athlétisme',
                    'Natation',
                    'Tennis',
                    'Gymnastique',
                    'Arts martiaux',
                    'Boxe',
                    'Musculation',
                    'Course à pied',
                    'Yoga',
                    'Cyclisme'
                ],
                'Sports traditionnels' => [
                    'Lutte traditionnelle',
                    'Course de pirogues',
                    'Jeux traditionnels africains'
                ]
            ],

            'Arts et Culture' => [
                'Musique' => [
                    'Jouer d\'un instrument',
                    'Chant',
                    'Composition musicale',
                    'DJ-ing',
                    'Production musicale',
                    'Chorale',
                    'Percussion traditionnelle'
                ],
                'Danse' => [
                    'Danse moderne',
                    'Danse traditionnelle',
                    'Ballet',
                    'Danse contemporaine',
                    'Danses urbaines'
                ],
                'Arts visuels' => [
                    'Peinture',
                    'Dessin',
                    'Sculpture',
                    'Photographie',
                    'Art numérique',
                    'Artisanat traditionnel',
                    'Poterie'
                ],
                'Écriture et lecture' => [
                    'Lecture',
                    'Écriture créative',
                    'Poésie',
                    'Blog',
                    'Journal intime',
                    'Storytelling'
                ]
            ],

            'Technologie' => [
                'Informatique' => [
                    'Programmation',
                    'Développement de jeux',
                    'Intelligence artificielle',
                    'Robotique',
                    'Impression 3D',
                    'Domotique'
                ],
                'Médias numériques' => [
                    'Création de contenu YouTube',
                    'Streaming',
                    'Podcast',
                    'Montage vidéo',
                    'Animation',
                    'Blogging'
                ],
                'Gaming' => [
                    'Jeux vidéo',
                    'E-sport',
                    'Jeux de rôle',
                    'Jeux de stratégie',
                    'Simulation'
                ]
            ],

            'Nature et Plein air' => [
                'Jardinage' => [
                    'Jardinage urbain',
                    'Horticulture',
                    'Permaculture',
                    'Jardinage d\'intérieur',
                    'Culture potagère'
                ],
                'Activités de plein air' => [
                    'Randonnée',
                    'Camping',
                    'Observation des oiseaux',
                    'Pêche',
                    'Chasse traditionnelle',
                    'Photographie nature'
                ],
                'Écologie' => [
                    'Protection de l\'environnement',
                    'Recyclage créatif',
                    'Conservation de la nature',
                    'Apiculture'
                ]
            ],

            'Cuisine et Gastronomie' => [
                'Cuisine' => [
                    'Cuisine traditionnelle',
                    'Cuisine internationale',
                    'Pâtisserie',
                    'Boulangerie',
                    'Cuisine végétarienne',
                    'Mixologie'
                ],
                'Boissons' => [
                    'Dégustation de vin',
                    'Dégustation de café',
                    'Préparation de thé',
                    'Brassage artisanal'
                ]
            ],

            'Artisanat et DIY' => [
                'Textile' => [
                    'Couture',
                    'Tricot',
                    'Crochet',
                    'Broderie',
                    'Tissage traditionnel'
                ],
                'Travail manuel' => [
                    'Menuiserie',
                    'Bijouterie',
                    'Vannerie',
                    'Maroquinerie',
                    'Création de masques traditionnels'
                ],
                'DIY' => [
                    'Upcycling',
                    'Décoration d\'intérieur',
                    'Rénovation',
                    'Création de bijoux'
                ]
            ],

            'Collection et Jeux' => [
                'Collections' => [
                    'Philatélie',
                    'Numismatique',
                    'Collection d\'art',
                    'Collection de livres',
                    'Collection d\'objets traditionnels'
                ],
                'Jeux de société' => [
                    'Échecs',
                    'Scrabble',
                    'Jeux de cartes traditionnels',
                    'Awale',
                    'Jeux de stratégie africains'
                ]
            ],

            'Développement personnel' => [
                'Bien-être' => [
                    'Méditation',
                    'Relaxation',
                    'Sophrologie',
                    'Pratiques spirituelles traditionnelles'
                ],
                'Apprentissage' => [
                    'Apprentissage des langues',
                    'Étude d\'instruments traditionnels',
                    'Histoire locale',
                    'Généalogie'
                ]
            ],

            'Social et Communautaire' => [
                'Bénévolat' => [
                    'Aide communautaire',
                    'Soutien scolaire',
                    'Protection animale',
                    'Actions environnementales'
                ],
                'Animation' => [
                    'Animation jeunesse',
                    'Organisation d\'événements',
                    'Animation culturelle',
                    'Théâtre communautaire'
                ]
            ],

            'Mode et Style de vie' => [
                'Mode' => [
                    'Stylisme',
                    'Mode traditionnelle',
                    'Design de mode',
                    'Création de pagnes'
                ],
                'Beauté' => [
                    'Coiffure traditionnelle',
                    'Soins naturels',
                    'Maquillage',
                    'Art corporel traditionnel'
                ]
            ]
        ];

        foreach ($hobbies as $categorie => $sousCategories) {
            foreach ($sousCategories as $sousCategorie => $hobbyList) {
                foreach ($hobbyList as $hobby) {
                    DB::table('hobbies')->insert([
                        'name' => $hobby,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
        }
    }
}
