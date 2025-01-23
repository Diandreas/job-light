<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Country;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'town' => $this->faker->city,
            'street' => $this->faker->streetName,
            'country_id' => Country::factory(),
        ];
    }
}
