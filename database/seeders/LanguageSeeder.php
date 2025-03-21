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
            ['name' => 'Français', 'name_en' => 'French', 'code' => 'fr'],
            ['name' => 'Anglais', 'name_en' => 'English', 'code' => 'en'],
            ['name' => 'Espagnol', 'name_en' => 'Spanish', 'code' => 'es'],
            ['name' => 'Allemand', 'name_en' => 'German', 'code' => 'de'],
            ['name' => 'Italien', 'name_en' => 'Italian', 'code' => 'it'],
            ['name' => 'Portugais', 'name_en' => 'Portuguese', 'code' => 'pt'],
            ['name' => 'Russe', 'name_en' => 'Russian', 'code' => 'ru'],
            ['name' => 'Chinois', 'name_en' => 'Chinese', 'code' => 'zh'],
            ['name' => 'Japonais', 'name_en' => 'Japanese', 'code' => 'ja'],
            ['name' => 'Arabe', 'name_en' => 'Arabic', 'code' => 'ar'],
        ];

        foreach ($languages as $language) {
            Language::updateOrCreate(
                ['code' => $language['code']],
                $language
            );
        }
    }
}