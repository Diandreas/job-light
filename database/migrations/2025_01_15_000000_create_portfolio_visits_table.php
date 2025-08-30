<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('portfolio_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamp('visited_at');
            $table->string('ip_address', 45)->nullable(); // Support IPv6
            $table->text('user_agent')->nullable();
            $table->string('referrer', 500)->nullable();
            $table->json('metadata')->nullable(); // Pour stocker des données supplémentaires
            $table->timestamps();

            // Index pour les performances
            $table->index(['user_id', 'visited_at']);
            $table->index(['visited_at']);
            $table->index(['ip_address']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolio_visits');
    }
};