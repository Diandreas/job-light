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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->string('main_image')->nullable(); // Image principale du service
            $table->string('icon')->nullable(); // Icône pour l'affichage
            $table->decimal('price', 10, 2)->nullable(); // Prix optionnel
            $table->string('price_type')->default('fixed'); // fixed, hourly, project
            $table->json('tags')->nullable(); // Tags/mots-clés
            $table->boolean('is_featured')->default(false); // Service mis en avant
            $table->boolean('is_active')->default(true);
            $table->integer('order_index')->default(0); // Pour l'ordre d'affichage
            $table->json('settings')->nullable(); // Paramètres supplémentaires
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'order_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
