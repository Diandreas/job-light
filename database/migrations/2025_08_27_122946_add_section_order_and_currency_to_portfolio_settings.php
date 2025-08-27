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
        Schema::table('portfolio_settings', function (Blueprint $table) {
            $table->json('section_order')->nullable(); // Ordre des sections CV
            $table->string('currency', 10)->default('€'); // Devise pour les prix
            $table->boolean('show_services')->default(false); // Afficher la section services
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_settings', function (Blueprint $table) {
            $table->dropColumn(['section_order', 'currency', 'show_services']);
        });
    }
};
