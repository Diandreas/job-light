<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Améliorer la table job_postings pour les annonces simples
        Schema::table('job_postings', function (Blueprint $table) {
            $table->enum('posting_type', ['standard', 'simple_ad'])->default('standard')->after('status');
            $table->json('contact_info')->nullable()->after('application_url'); // Pour annonces simples
            $table->boolean('contact_via_platform')->default(true)->after('contact_info');
            $table->text('additional_instructions')->nullable()->after('contact_via_platform');
        });

        // Table pour les notifications push
        Schema::create('push_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('body');
            $table->string('type'); // 'job_match', 'application_status', 'new_message', etc.
            $table->json('data')->nullable(); // Données additionnelles
            $table->boolean('read')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });

        // Table pour les préférences de notification des utilisateurs
        Schema::create('user_notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('email_job_matches')->default(true);
            $table->boolean('email_application_updates')->default(true);
            $table->boolean('email_new_messages')->default(true);
            $table->boolean('push_job_matches')->default(true);
            $table->boolean('push_application_updates')->default(true);
            $table->boolean('push_new_messages')->default(true);
            $table->json('job_alert_keywords')->nullable(); // Mots-clés pour alertes
            $table->json('preferred_locations')->nullable();
            $table->json('preferred_employment_types')->nullable();
            $table->timestamps();
        });

        // Table pour les tokens de notification push
        Schema::create('user_device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('device_token');
            $table->string('platform'); // 'ios', 'android', 'web'
            $table->string('device_name')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'device_token']);
        });

        // Table pour les statistiques de la plateforme
        Schema::create('platform_statistics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('metric_name'); // 'total_users', 'total_jobs', 'applications_sent', etc.
            $table->integer('value');
            $table->json('breakdown')->nullable(); // Détails par catégorie
            $table->timestamps();
            
            $table->unique(['date', 'metric_name']);
        });

        // Table pour les messages entre utilisateurs/entreprises
        Schema::create('user_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('to_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('job_posting_id')->nullable()->constrained()->onDelete('set null');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        // Améliorer la table companies
        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('verified')->default(false)->after('status');
            $table->timestamp('verified_at')->nullable()->after('verified');
            $table->integer('total_hires')->default(0)->after('job_posting_limit');
            $table->decimal('rating', 3, 2)->nullable()->after('total_hires');
            $table->integer('rating_count')->default(0)->after('rating');
        });

        // Table pour les avis sur les entreprises
        Schema::create('company_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->between(1, 5);
            $table->text('review')->nullable();
            $table->boolean('anonymous')->default(false);
            $table->boolean('approved')->default(false);
            $table->timestamps();
            
            $table->unique(['company_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('company_reviews');
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['verified', 'verified_at', 'total_hires', 'rating', 'rating_count']);
        });
        Schema::dropIfExists('user_messages');
        Schema::dropIfExists('platform_statistics');
        Schema::dropIfExists('user_device_tokens');
        Schema::dropIfExists('user_notification_preferences');
        Schema::dropIfExists('push_notifications');
        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropColumn(['posting_type', 'contact_info', 'contact_via_platform', 'additional_instructions']);
        });
    }
};