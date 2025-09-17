<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('portfolio_settings', function (Blueprint $table) {
            // Changer la colonne design d'enum vers string pour supporter les nouveaux designs
            $table->string('design', 50)->default('professional')->change();
        });

        // Mettre à jour les valeurs existantes si nécessaire
        DB::table('portfolio_settings')->where('design', 'intuitive')->update(['design' => 'professional']);
        DB::table('portfolio_settings')->where('design', 'user-friendly')->update(['design' => 'creative']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_settings', function (Blueprint $table) {
            // Remettre l'enum original si nécessaire
            $table->enum('design', ['intuitive', 'professional', 'user-friendly', 'modern'])->default('professional')->change();
        });
    }
};