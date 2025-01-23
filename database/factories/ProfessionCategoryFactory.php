<?php

namespace Database\Factories;

use App\Models\ProfessionCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfessionCategoryFactory extends Factory
{
    protected $model = ProfessionCategory::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word,
            'description' => $this->faker->sentence,
        ];
    }
}
