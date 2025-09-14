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
        // Countries table
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 3)->unique();
            $table->string('currency', 3)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Addresses table
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->string('street', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Profession categories table
        Schema::create('profession_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->foreignId('parent_id')->nullable()->constrained('profession_categories')->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Professions table
        Schema::create('professions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->foreignId('category_id')->constrained('profession_categories')->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Competences table
        Schema::create('competences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Hobbies table
        Schema::create('hobbies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Experience categories table
        Schema::create('experience_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // CV Models table
        Schema::create('cv_models', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('view_path', 255);
            $table->string('preview_image_path', 255)->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Summaries table
        Schema::create('summaries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // References table
        Schema::create('references', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('position', 100)->nullable();
            $table->string('company', 100)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('relationship')->nullable();
            $table->timestamps();
        });

        // Attachments table
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('path', 500);
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size');
            $table->string('disk', 50)->default('local');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('references');
        Schema::dropIfExists('summaries');
        Schema::dropIfExists('cv_models');
        Schema::dropIfExists('experience_categories');
        Schema::dropIfExists('hobbies');
        Schema::dropIfExists('competences');
        Schema::dropIfExists('professions');
        Schema::dropIfExists('profession_categories');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('countries');
    }
};