<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExperienceCategoriesSeeder extends Seeder
{
    public function run()
    {
        // Supprimer d'abord toutes les données existantes
        DB::table('experience_categories')->truncate();
        
        $categories = [
            // Ordre standard d'un CV professionnel
            [
                'name' => 'Professionnel',
                'name_en' => 'Professional',
                'description' => 'Expériences professionnelles',
                'ranking' => 2  // Affiché en premier dans le CV
            ],
            [
                'name' => 'Académique',
                'name_en' => 'Academic',
                'description' => 'Parcours académique',
                'ranking' => 1  // Affiché en deuxième
            ],
            [
                'name' => 'Recherche',
                'name_en' => 'Research',
                'description' => 'Expériences en recherche',
                'ranking' => 3  // Affiché en troisième
            ],
            [
                'name' => 'Projet personnel',
                'name_en' => 'Personal Project',
                'description' => 'Projets personnels',
                'ranking' => 4
            ],
            [
                'name' => 'Certification',
                'name_en' => 'Certification',
                'description' => 'Certifications obtenues',
                'ranking' => 5
            ],
           
        ];

        foreach ($categories as $category) {
            DB::table('experience_categories')->insert([
                'name' => $category['name'],
                'name_en' => $category['name_en'],
                'description' => $category['description'],
                'ranking' => $category['ranking'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
