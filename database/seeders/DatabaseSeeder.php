<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Création des utilisateurs de base
        $this->call(AdminUserSeeder::class);

        // Données géographiques (base)
        $this->call(CountriesSeeder::class);
        $this->call(AddressesSeeder::class);

        // Professions et compétences
        $this->call(ProfessionCategorySeeder::class);
        $this->call(ProfessionSeeder::class);
        $this->call(CompetencesSeeder::class);

        // Catégories d'expérience
        $this->call(ExperienceCategoriesSeeder::class);

        // Hobbies et intérêts
        $this->call(HobbiesSeeder::class);

        // Langues
        $this->call(LanguageSeeder::class);
    }
}
