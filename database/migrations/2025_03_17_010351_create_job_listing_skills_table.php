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
        Schema::create('job_listing_skills', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_listing_id');
            $table->unsignedBigInteger('competence_id');
            $table->enum('importance', ['required', 'preferred', 'nice_to_have'])->default('required');
            $table->timestamps();
            
            $table->foreign('job_listing_id')->references('id')->on('job_listings')->onDelete('cascade');
            $table->foreign('competence_id')->references('id')->on('competences')->onDelete('cascade');
            
            // Une compétence ne peut être associée qu'une seule fois à une annonce
            $table->unique(['job_listing_id', 'competence_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_listing_skills');
    }
};
