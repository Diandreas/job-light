<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExperienceCategoriesSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            // Ordre standard d'un CV professionnel
            [
                'name' => 'Professionnel',
                'description' => 'Expériences professionnelles',
                'ranking' => 2  // Affiché en premier dans le CV
            ],
            [
                'name' => 'Académique',
                'description' => 'Parcours académique',
                'ranking' => 1  // Affiché en deuxième
            ],
            [
                'name' => 'Recherche',
                'description' => 'Expériences en recherche',
                'ranking' => 3  // Affiché en troisième
            ]
        ];

        foreach ($categories as $category) {
            DB::table('experience_categories')->insert([
                'name' => $category['name'],
                'description' => $category['description'],
                'ranking' => $category['ranking'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
