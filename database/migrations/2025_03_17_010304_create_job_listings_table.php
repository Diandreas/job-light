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
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); // ID du recruteur
            $table->string('title');
            $table->text('description');
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();
            $table->enum('budget_type', ['hourly', 'fixed'])->default('fixed');
            $table->string('duration')->nullable(); // ex: "2 weeks", "3 months"
            $table->enum('status', ['draft', 'open', 'closed'])->default('open');
            $table->unsignedInteger('tokens_required')->default(1);
            $table->enum('experience_level', ['beginner', 'intermediate', 'expert'])->nullable();
            $table->dateTime('deadline')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
};
