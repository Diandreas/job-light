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
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_listing_id');
            $table->unsignedBigInteger('user_id');
            $table->text('cover_letter');
            $table->decimal('proposed_rate', 10, 2)->nullable();
            $table->enum('status', ['pending', 'shortlisted', 'rejected', 'hired'])->default('pending');
            $table->unsignedInteger('tokens_spent');
            $table->dateTime('viewed_at')->nullable();
            $table->timestamps();
            
            $table->foreign('job_listing_id')->references('id')->on('job_listings')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Un utilisateur ne peut postuler qu'une seule fois à une annonce
            $table->unique(['job_listing_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
