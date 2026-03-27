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
        // Portfolio settings table
        Schema::create('portfolio_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('subtitle', 255)->nullable();
            $table->string('profile_image', 500)->nullable();
            $table->string('cover_image', 500)->nullable();
            $table->string('primary_color', 7)->default('#3B82F6');
            $table->string('secondary_color', 7)->default('#1E40AF');
            $table->string('accent_color', 7)->default('#F59E0B');
            $table->string('font_family', 100)->default('Inter');
            $table->string('layout_style', 50)->default('modern');
            $table->boolean('show_services')->default(true);
            $table->boolean('show_experience')->default(true);
            $table->boolean('show_skills')->default(true);
            $table->boolean('show_education')->default(true);
            $table->boolean('show_contact')->default(true);
            $table->boolean('show_social_links')->default(true);
            $table->string('custom_domain', 255)->nullable();
            $table->boolean('is_public')->default(true);
            $table->string('seo_title', 255)->nullable();
            $table->text('seo_description')->nullable();
            $table->json('custom_css')->nullable();
            $table->json('custom_js')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->unique('user_id');
        });

        // Portfolio sections table
        Schema::create('portfolio_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title', 255);
            $table->text('content')->nullable();
            $table->string('section_type', 50)->default('custom');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'sort_order']);
        });

        // Services table
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title', 255);
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->string('main_image', 500)->nullable();
            $table->string('icon', 100)->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->string('price_type', 20)->default('fixed');
            $table->string('currency', 3)->default('XAF');
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('settings')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'sort_order']);
        });

        // Service images table
        Schema::create('service_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('image_path', 500);
            $table->string('alt_text', 255)->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            
            $table->index(['service_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_images');
        Schema::dropIfExists('services');
        Schema::dropIfExists('portfolio_sections');
        Schema::dropIfExists('portfolio_settings');
    }
};