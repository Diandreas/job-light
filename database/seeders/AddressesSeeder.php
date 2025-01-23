<?php

namespace Database\Seeders;

use App\Models\Address;
use Illuminate\Database\Seeder;

class AddressesSeeder extends Seeder
{
    public function run(): void
    {
        Address::factory()->count(50)->create();
    }
}
