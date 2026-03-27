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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('surname', 100)->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone_number', 20)->nullable();
            $table->string('address', 500)->nullable();
            $table->string('photo', 500)->nullable();
            $table->string('github', 255)->nullable();
            $table->string('linkedin', 255)->nullable();
            
            // Personal information
            $table->integer('number_of_children')->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->enum('user_type', ['individual', 'company', 'organization'])->default('individual');
            $table->string('language', 10)->default('fr');
            
            // Professional information
            $table->foreignId('profession_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('address_id')->nullable()->constrained()->onDelete('set null');
            $table->unsignedBigInteger('selected_summary_id')->nullable();
            $table->unsignedBigInteger('selected_cv_model_id')->nullable();
            
            // Sponsorship system
            $table->string('sponsor_code', 20)->nullable()->unique();
            $table->foreignId('sponsored_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('sponsor_expires_at')->nullable();
            
            // Manual competences and hobbies
            $table->json('manual_competences')->nullable();
            $table->json('manual_hobbies')->nullable();
            
            // Social authentication
            $table->string('google_id', 100)->nullable()->unique();
            $table->string('facebook_id', 100)->nullable()->unique();
            $table->string('github_id', 100)->nullable()->unique();
            
            // Portfolio customization
            $table->string('primary_color', 7)->default('#3B82F6');
            
            $table->rememberToken();
            $table->timestamps();
            
            // Indexes
            $table->index(['user_type', 'is_active']);
            $table->index(['sponsored_by']);
            $table->index(['sponsor_code']);
        });

        // Foreign key constraints for selected items
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('selected_summary_id')->references('id')->on('summaries')->onDelete('set null');
            $table->foreign('selected_cv_model_id')->references('id')->on('cv_models')->onDelete('set null');
        });

        // Password reset tokens
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};