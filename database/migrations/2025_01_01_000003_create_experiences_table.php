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
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->string('company_name', 255)->nullable();
            $table->string('location', 255)->nullable();
            $table->string('position', 255)->nullable();
            $table->text('achievements')->nullable();
            $table->foreignId('category_id')->constrained('experience_categories')->onDelete('cascade');
            $table->foreignId('attachment_id')->nullable()->constrained('attachments')->onDelete('set null');
            $table->timestamps();
            
            // Indexes
            $table->index(['start_date', 'end_date']);
            $table->index(['category_id']);
        });

        // User experiences pivot table
        Schema::create('user_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('experience_id')->constrained()->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->unique(['user_id', 'experience_id']);
            $table->index(['user_id', 'sort_order']);
        });

        // Experience references pivot table
        Schema::create('experience_references', function (Blueprint $table) {
            $table->id();
            $table->foreignId('experience_id')->constrained()->onDelete('cascade');
            $table->foreignId('reference_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['experience_id', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experience_references');
        Schema::dropIfExists('user_experiences');
        Schema::dropIfExists('experiences');
    }
};