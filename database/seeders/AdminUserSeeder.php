<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'username' => 'admin',

            'name' => 'admin',
            'email' => 'admin@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('admin'),
            'UserType' => 1, // 1 pour administrateur
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Optionnel : Créerv quelques utilisateurs de test avec différents types
        User::create([
            'username' => 'ines',
            'name' => 'ines',
            'email' => 'ines@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('ines'),
            'UserType' => 2, // 2 pour utilisateur normal
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
