<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'model_id' => null,
            'amount' => fake()->numberBetween(1000, 10000),
            'reference' => fake()->unique()->uuid(),
            'status' => 'pending',
            'payment_method' => 'cinetpay',
            'transaction_id' => fake()->unique()->uuid(),
            'currency' => 'XOF',
            'description' => fake()->sentence(),
            'external_id' => null,
            'external_data' => null,
            'metadata' => json_encode([]),
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the payment is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the payment failed.
     */
    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
        ]);
    }
}
