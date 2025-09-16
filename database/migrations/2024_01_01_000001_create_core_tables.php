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
        // Table des pays
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('abbr', 45)->nullable();
            $table->timestamps();
        });

        // Table des adresses
        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->string('town', 45)->nullable();
            $table->string('street', 45)->nullable();
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Table des catégories de professions
        Schema::create('profession_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('profession_categories')->onDelete('cascade');
            $table->timestamps();
        });

        // Table des professions
        Schema::create('professions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->string('name_en')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('profession_categories')->onDelete('cascade');
            $table->timestamps();
        });

        // Table des missions professionnelles
        Schema::create('professionMissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('profession_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Table des modèles CV
        Schema::create('cv_models', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191)->nullable();
            $table->string('description', 255)->nullable();
            $table->string('viewPath', 191)->nullable();
            $table->integer('price')->nullable();
            $table->string('previewImagePath', 255)->nullable();
            $table->timestamps();
        });

        // Table des compétences
        Schema::create('competences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('name_en')->nullable();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        // Table des loisirs
        Schema::create('hobbies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191)->nullable();
            $table->string('name_en')->nullable();
            $table->timestamps();
        });

        // Table des langues
        Schema::create('languages', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('name_en')->unique();
        });

        // Table des catégories d'expérience
        Schema::create('experience_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('name_en', 45)->nullable();
            $table->string('description', 45)->nullable();
            $table->integer('ranking')->nullable();
            $table->timestamps();
        });

        // Table des pièces jointes
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('path', 250)->nullable();
            $table->string('format', 10)->nullable();
            $table->string('size', 100)->nullable();
            $table->timestamps();
        });

        // Table des expériences
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable();
            $table->text('description')->nullable();
            $table->date('date_start')->nullable();
            $table->date('date_end')->nullable();
            $table->string('output', 255)->nullable();
            $table->foreignId('experience_categories_id')->constrained('experience_categories')->onDelete('cascade');
            $table->text('comment')->nullable();
            $table->string('InstitutionName')->nullable();
            $table->foreignId('attachment_id')->nullable()->constrained('attachments')->onDelete('cascade');
            $table->timestamps();
        });

        // Table des références
        Schema::create('references', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->nullable();
            $table->string('function', 50)->nullable();
            $table->string('email', 250)->nullable();
            $table->string('telephone', 20)->nullable();
            $table->timestamps();
        });

        // Table des résumés
        Schema::create('summaries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Tables Laravel par défaut
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // Créer la table users avec tous les champs
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('photo')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
            
            // Champs supplémentaires
            $table->string('surname', 45)->nullable();
            $table->foreignId('profession_id')->nullable();
            $table->string('full_profession')->nullable();
            $table->integer('numberOfChild')->nullable();
            $table->string('maritalStatus', 1)->nullable();
            $table->string('github')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('address')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('username')->nullable();
            $table->decimal('wallet_balance', 10, 2)->default(0);
            $table->string('primary_color')->nullable()->default('#3498db');
            
            // Champs de parrainage
            $table->unsignedBigInteger('sponsor_id')->nullable();
            $table->string('sponsor_code')->nullable();
            $table->timestamp('sponsor_expires_at')->nullable();
            
            // Champs sociaux
            $table->string('google_id')->nullable();
            $table->string('linkedin_id')->nullable();
            $table->string('social_avatar')->nullable();
            $table->text('social_token')->nullable();
            $table->text('social_refresh_token')->nullable();
            
            // Champs CV
            $table->unsignedBigInteger('selected_summary_id')->nullable();
            $table->unsignedBigInteger('selected_cv_model_id')->nullable();
            $table->integer('UserType')->nullable();
            
            // Compétences et loisirs manuels
            $table->json('manual_competences')->nullable();
            $table->json('manual_hobbies')->nullable();
        });

        // Tables de liaison
        Schema::create('user_cv_model', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('cv_model_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'cv_model_id']);
            $table->timestamps();
        });

        Schema::create('user_competence', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('competence_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'competence_id']);
            $table->timestamps();
        });

        Schema::create('user_hobby', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('hobby_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'hobby_id']);
            $table->timestamps();
        });

        Schema::create('user_experience', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('experience_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'experience_id']);
            $table->timestamps();
        });

        Schema::create('user_summary', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('summary_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'summary_id']);
            $table->timestamps();
        });

        Schema::create('user_languages', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('language_id')->references('id')->on('languages')->onDelete('cascade');
            $table->string('language_level')->default('Débutant');
            $table->primary(['user_id', 'language_id']);
            $table->timestamps();
        });

        Schema::create('ExperienceReferences', function (Blueprint $table) {
            $table->foreignId('experiences_id')->constrained()->onDelete('cascade');
            $table->foreignId('references_id')->constrained()->onDelete('cascade');
            $table->primary(['experiences_id', 'references_id']);
            $table->timestamps();
        });

        // Ajouter les contraintes de clés étrangères après création de toutes les tables
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('selected_summary_id')->references('id')->on('summaries')->onDelete('set null');
            $table->foreign('selected_cv_model_id')->references('id')->on('cv_models')->onDelete('set null');
            $table->foreign('sponsor_id')->references('id')->on('users')->onDelete('set null');
            
            // Index pour les performances
            $table->index(['email']);
            $table->index(['sponsor_id']);
            $table->index(['UserType']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ExperienceReferences');
        Schema::dropIfExists('user_languages');
        Schema::dropIfExists('user_summary');
        Schema::dropIfExists('user_experience');
        Schema::dropIfExists('user_hobby');
        Schema::dropIfExists('user_competence');
        Schema::dropIfExists('user_cv_model');
        Schema::dropIfExists('summaries');
        Schema::dropIfExists('references');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('experience_categories');
        Schema::dropIfExists('languages');
        Schema::dropIfExists('hobbies');
        Schema::dropIfExists('competences');
        Schema::dropIfExists('cv_models');
        Schema::dropIfExists('professionMissions');
        Schema::dropIfExists('professions');
        Schema::dropIfExists('profession_categories');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('countries');
        
        // Tables Laravel par défaut
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
