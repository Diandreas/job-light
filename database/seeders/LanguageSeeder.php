<?php

namespace Database\Seeders;

use App\Models\Language;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $languages = [
            ['name' => 'Français', 'name_en' => 'French'],
            ['name' => 'Anglais', 'name_en' => 'English'],
            ['name' => 'Espagnol', 'name_en' => 'Spanish'],
            ['name' => 'Allemand', 'name_en' => 'German'],
            ['name' => 'Italien', 'name_en' => 'Italian'],
            ['name' => 'Portugais', 'name_en' => 'Portuguese'],
            ['name' => 'Russe', 'name_en' => 'Russian'],
            ['name' => 'Chinois', 'name_en' => 'Chinese'],
            ['name' => 'Japonais', 'name_en' => 'Japanese'],
            ['name' => 'Arabe', 'name_en' => 'Arabic'],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(
                ['name' => $language['name']],
                $language
            );
        }
    }
}