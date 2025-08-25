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
        if (!Schema::hasTable('portfolio_settings')) {
            Schema::create('portfolio_settings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->enum('design', ['intuitive', 'professional', 'user-friendly', 'modern'])->default('professional');
                $table->boolean('show_experiences')->default(true);
                $table->boolean('show_competences')->default(true);
                $table->boolean('show_hobbies')->default(true);
                $table->boolean('show_summary')->default(true);
                $table->boolean('show_contact_info')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolio_settings');
    }
};
