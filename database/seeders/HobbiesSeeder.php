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
                    ['name' => 'Judo', 'name_en' => 'Judo'],
                    ['name' => 'Karaté', 'name_en' => 'Karate'],
                    ['name' => 'Taekwondo', 'name_en' => 'Taekwondo'],
                    ['name' => 'Kung-fu', 'name_en' => 'Kung Fu'],
                    ['name' => 'Aïkido', 'name_en' => 'Aikido'],
                    ['name' => 'Viet Vo Dao', 'name_en' => 'Viet Vo Dao'],
                    ['name' => 'Boxe anglaise', 'name_en' => 'Boxing'],
                    ['name' => 'Boxe chinoise (Wushu)', 'name_en' => 'Chinese Boxing (Wushu)'],
                    ['name' => 'Kick-boxing', 'name_en' => 'Kickboxing'],
                    ['name' => 'Full contact', 'name_en' => 'Full Contact'],
                    ['name' => 'MMA (Mixed Martial Arts)', 'name_en' => 'MMA (Mixed Martial Arts)'],
                    ['name' => 'Nanbudo', 'name_en' => 'Nanbudo'],
                    ['name' => 'Yoseikan Budo', 'name_en' => 'Yoseikan Budo']
                ],
                'Sports collectifs' => [
                    ['name' => 'Football', 'name_en' => 'Soccer'],
                    ['name' => 'Basketball', 'name_en' => 'Basketball'],
                    ['name' => 'Volleyball', 'name_en' => 'Volleyball'],
                    ['name' => 'Rugby', 'name_en' => 'Rugby'],
                    ['name' => 'Handball', 'name_en' => 'Handball']
                ],
                'Sports individuels' => [
                    ['name' => 'Athlétisme', 'name_en' => 'Athletics'],
                    ['name' => 'Natation', 'name_en' => 'Swimming'],
                    ['name' => 'Tennis', 'name_en' => 'Tennis'],
                    ['name' => 'Gymnastique', 'name_en' => 'Gymnastics'],
                    ['name' => 'Arts martiaux', 'name_en' => 'Martial Arts'],
                    ['name' => 'Boxe', 'name_en' => 'Boxing'],
                    ['name' => 'Musculation', 'name_en' => 'Weightlifting'],
                    ['name' => 'Course à pied', 'name_en' => 'Running'],
                    ['name' => 'Yoga', 'name_en' => 'Yoga'],
                    ['name' => 'Cyclisme', 'name_en' => 'Cycling']
                ],
                'Sports traditionnels' => [
                    ['name' => 'Lutte traditionnelle', 'name_en' => 'Traditional Wrestling'],
                    ['name' => 'Course de pirogues', 'name_en' => 'Canoe Racing'],
                    ['name' => 'Jeux traditionnels africains', 'name_en' => 'Traditional African Games']
                ]
            ],
            'Arts et Culture' => [
                'Musique' => [
                    ['name' => 'Jouer d\'un instrument', 'name_en' => 'Playing an Instrument'],
                    ['name' => 'Chant', 'name_en' => 'Singing'],
                    ['name' => 'Composition musicale', 'name_en' => 'Music Composition'],
                    ['name' => 'DJ-ing', 'name_en' => 'DJing'],
                    ['name' => 'Production musicale', 'name_en' => 'Music Production'],
                    ['name' => 'Chorale', 'name_en' => 'Choir'],
                    ['name' => 'Percussion traditionnelle', 'name_en' => 'Traditional Percussion']
                ],
                'Danse' => [
                    ['name' => 'Danse moderne', 'name_en' => 'Modern Dance'],
                    ['name' => 'Danse traditionnelle', 'name_en' => 'Traditional Dance'],
                    ['name' => 'Ballet', 'name_en' => 'Ballet'],
                    ['name' => 'Danse contemporaine', 'name_en' => 'Contemporary Dance'],
                    ['name' => 'Danses urbaines', 'name_en' => 'Urban Dances']
                ],
                'Arts visuels' => [
                    ['name' => 'Peinture', 'name_en' => 'Painting'],
                    ['name' => 'Dessin', 'name_en' => 'Drawing'],
                    ['name' => 'Sculpture', 'name_en' => 'Sculpture'],
                    ['name' => 'Photographie', 'name_en' => 'Photography'],
                    ['name' => 'Art numérique', 'name_en' => 'Digital Art'],
                    ['name' => 'Artisanat traditionnel', 'name_en' => 'Traditional Crafts'],
                    ['name' => 'Poterie', 'name_en' => 'Pottery']
                ],
                'Écriture et lecture' => [
                    ['name' => 'Lecture', 'name_en' => 'Reading'],
                    ['name' => 'Écriture créative', 'name_en' => 'Creative Writing'],
                    ['name' => 'Poésie', 'name_en' => 'Poetry'],
                    ['name' => 'Blog', 'name_en' => 'Blogging'],
                    ['name' => 'Journal intime', 'name_en' => 'Journaling'],
                    ['name' => 'Storytelling', 'name_en' => 'Storytelling']
                ]
            ],
            'Technologie' => [
                'Informatique' => [
                    ['name' => 'Programmation', 'name_en' => 'Programming'],
                    ['name' => 'Développement de jeux', 'name_en' => 'Game Development'],
                    ['name' => 'Intelligence artificielle', 'name_en' => 'Artificial Intelligence'],
                    ['name' => 'Robotique', 'name_en' => 'Robotics'],
                    ['name' => 'Impression 3D', 'name_en' => '3D Printing'],
                    ['name' => 'Domotique', 'name_en' => 'Home Automation']
                ],
                'Médias numériques' => [
                    ['name' => 'Création de contenu YouTube', 'name_en' => 'YouTube Content Creation'],
                    ['name' => 'Streaming', 'name_en' => 'Streaming'],
                    ['name' => 'Podcast', 'name_en' => 'Podcasting'],
                    ['name' => 'Montage vidéo', 'name_en' => 'Video Editing'],
                    ['name' => 'Animation', 'name_en' => 'Animation'],
                    ['name' => 'Blogging', 'name_en' => 'Blogging']
                ],
                'Gaming' => [
                    ['name' => 'Jeux vidéo', 'name_en' => 'Video Games'],
                    ['name' => 'E-sport', 'name_en' => 'E-sports'],
                    ['name' => 'Jeux de rôle', 'name_en' => 'Role-Playing Games'],
                    ['name' => 'Jeux de stratégie', 'name_en' => 'Strategy Games'],
                    ['name' => 'Simulation', 'name_en' => 'Simulation Games']
                ]
            ],
            'Nature et Plein air' => [
                'Jardinage' => [
                    ['name' => 'Jardinage urbain', 'name_en' => 'Urban Gardening'],
                    ['name' => 'Horticulture', 'name_en' => 'Horticulture'],
                    ['name' => 'Permaculture', 'name_en' => 'Permaculture'],
                    ['name' => 'Jardinage d\'intérieur', 'name_en' => 'Indoor Gardening'],
                    ['name' => 'Culture potagère', 'name_en' => 'Vegetable Gardening']
                ],
                'Activités de plein air' => [
                    ['name' => 'Randonnée', 'name_en' => 'Hiking'],
                    ['name' => 'Camping', 'name_en' => 'Camping'],
                    ['name' => 'Observation des oiseaux', 'name_en' => 'Birdwatching'],
                    ['name' => 'Pêche', 'name_en' => 'Fishing'],
                    ['name' => 'Chasse traditionnelle', 'name_en' => 'Traditional Hunting'],
                    ['name' => 'Photographie nature', 'name_en' => 'Nature Photography']
                ],
                'Écologie' => [
                    ['name' => 'Protection de l\'environnement', 'name_en' => 'Environmental Protection'],
                    ['name' => 'Recyclage créatif', 'name_en' => 'Creative Recycling'],
                    ['name' => 'Conservation de la nature', 'name_en' => 'Nature Conservation'],
                    ['name' => 'Apiculture', 'name_en' => 'Beekeeping']
                ]
            ],
            'Cuisine et Gastronomie' => [
                'Cuisine' => [
                    ['name' => 'Cuisine traditionnelle', 'name_en' => 'Traditional Cooking'],
                    ['name' => 'Cuisine internationale', 'name_en' => 'International Cuisine'],
                    ['name' => 'Pâtisserie', 'name_en' => 'Pastry Making'],
                    ['name' => 'Boulangerie', 'name_en' => 'Baking'],
                    ['name' => 'Cuisine végétarienne', 'name_en' => 'Vegetarian Cooking'],
                    ['name' => 'Mixologie', 'name_en' => 'Mixology']
                ],
                'Boissons' => [
                    ['name' => 'Dégustation de vin', 'name_en' => 'Wine Tasting'],
                    ['name' => 'Dégustation de café', 'name_en' => 'Coffee Tasting'],
                    ['name' => 'Préparation de thé', 'name_en' => 'Tea Making'],
                    ['name' => 'Brassage artisanal', 'name_en' => 'Home Brewing']
                ]
            ],
            'Artisanat et DIY' => [
                'Textile' => [
                    ['name' => 'Couture', 'name_en' => 'Sewing'],
                    ['name' => 'Tricot', 'name_en' => 'Knitting'],
                    ['name' => 'Crochet', 'name_en' => 'Crocheting'],
                    ['name' => 'Broderie', 'name_en' => 'Embroidery'],
                    ['name' => 'Tissage traditionnel', 'name_en' => 'Traditional Weaving']
                ],
                'Travail manuel' => [
                    ['name' => 'Menuiserie', 'name_en' => 'Woodworking'],
                    ['name' => 'Bijouterie', 'name_en' => 'Jewelry Making'],
                    ['name' => 'Vannerie', 'name_en' => 'Basket Weaving'],
                    ['name' => 'Maroquinerie', 'name_en' => 'Leatherworking'],
                    ['name' => 'Création de masques traditionnels', 'name_en' => 'Traditional Mask Making']
                ],
                'DIY' => [
                    ['name' => 'Upcycling', 'name_en' => 'Upcycling'],
                    ['name' => 'Décoration d\'intérieur', 'name_en' => 'Home Decor'],
                    ['name' => 'Rénovation', 'name_en' => 'Renovation'],
                    ['name' => 'Création de bijoux', 'name_en' => 'Jewelry Making']
                ]
            ],
            'Collection et Jeux' => [
                'Collections' => [
                    ['name' => 'Philatélie', 'name_en' => 'Stamp Collecting'],
                    ['name' => 'Numismatique', 'name_en' => 'Coin Collecting'],
                    ['name' => 'Collection d\'art', 'name_en' => 'Art Collecting'],
                    ['name' => 'Collection de livres', 'name_en' => 'Book Collecting'],
                    ['name' => 'Collection d\'objets traditionnels', 'name_en' => 'Traditional Objects Collecting']
                ],
                'Jeux de société' => [
                    ['name' => 'Échecs', 'name_en' => 'Chess'],
                    ['name' => 'Scrabble', 'name_en' => 'Scrabble'],
                    ['name' => 'Jeux de cartes traditionnels', 'name_en' => 'Traditional Card Games'],
                    ['name' => 'Awale', 'name_en' => 'Awale'],
                    ['name' => 'Jeux de stratégie africains', 'name_en' => 'African Strategy Games']
                ]
            ],
            'Développement personnel' => [
                'Bien-être' => [
                    ['name' => 'Méditation', 'name_en' => 'Meditation'],
                    ['name' => 'Relaxation', 'name_en' => 'Relaxation'],
                    ['name' => 'Sophrologie', 'name_en' => 'Sophrology'],
                    ['name' => 'Pratiques spirituelles traditionnelles', 'name_en' => 'Traditional Spiritual Practices']
                ],
                'Apprentissage' => [
                    ['name' => 'Apprentissage des langues', 'name_en' => 'Language Learning'],
                    ['name' => 'Étude d\'instruments traditionnels', 'name_en' => 'Traditional Instrument Study'],
                    ['name' => 'Histoire locale', 'name_en' => 'Local History'],
                    ['name' => 'Généalogie', 'name_en' => 'Genealogy']
                ]
            ],
            'Social et Communautaire' => [
                'Bénévolat' => [
                    ['name' => 'Aide communautaire', 'name_en' => 'Community Service'],
                    ['name' => 'Soutien scolaire', 'name_en' => 'Tutoring'],
                    ['name' => 'Protection animale', 'name_en' => 'Animal Welfare'],
                    ['name' => 'Actions environnementales', 'name_en' => 'Environmental Actions']
                ],
                'Animation' => [
                    ['name' => 'Animation jeunesse', 'name_en' => 'Youth Activities'],
                    ['name' => 'Organisation d\'événements', 'name_en' => 'Event Planning'],
                    ['name' => 'Animation culturelle', 'name_en' => 'Cultural Activities'],
                    ['name' => 'Théâtre communautaire', 'name_en' => 'Community Theater']
                ]
            ],
            'Mode et Style de vie' => [
                'Mode' => [
                    ['name' => 'Stylisme', 'name_en' => 'Fashion Design'],
                    ['name' => 'Mode traditionnelle', 'name_en' => 'Traditional Fashion'],
                    ['name' => 'Design de mode', 'name_en' => 'Fashion Design'],
                    ['name' => 'Création de pagnes', 'name_en' => 'Traditional Cloth Making']
                ],
                'Beauté' => [
                    ['name' => 'Coiffure traditionnelle', 'name_en' => 'Traditional Hairstyling'],
                    ['name' => 'Soins naturels', 'name_en' => 'Natural Beauty Care'],
                    ['name' => 'Maquillage', 'name_en' => 'Makeup'],
                    ['name' => 'Art corporel traditionnel', 'name_en' => 'Traditional Body Art']
                ]
            ]
        ];

        foreach ($hobbies as $categorie => $sousCategories) {
            foreach ($sousCategories as $sousCategorie => $hobbyList) {
                foreach ($hobbyList as $hobby) {
                    DB::table('hobbies')->insert([
                        'name' => $hobby['name'],
                        'name_en' => $hobby['name_en'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
        }
    }
}
