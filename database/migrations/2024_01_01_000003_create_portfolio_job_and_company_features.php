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
        // Table des entreprises
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->string('industry')->nullable();
            $table->text('description')->nullable();
            $table->string('logo_path')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->enum('type', ['partner', 'client', 'organization'])->default('client');
            $table->string('partner_code')->nullable()->unique(); // Pour APIDCA, etc.
            
            // Contacts
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('billing_email')->nullable();
            
            // Abonnements et permissions
            $table->enum('subscription_type', ['free', 'basic', 'premium', 'professional'])->default('free');
            $table->timestamp('subscription_expires_at')->nullable();
            $table->boolean('can_post_jobs')->default(false);
            $table->boolean('can_access_profiles')->default(false);
            $table->integer('job_posting_limit')->default(0);
            $table->boolean('notifications_enabled')->default(true);
            $table->boolean('auto_notify_members')->default(false);
            
            $table->timestamps();
        });

        // Table pour les membres d'organisations (comme APIDCA)
        Schema::create('company_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['member', 'admin', 'moderator'])->default('member');
            $table->boolean('receive_notifications')->default(true);
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['company_id', 'user_id']);
        });

        // Table des offres d'emploi
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->longText('description');
            $table->longText('requirements')->nullable();
            $table->string('location')->nullable();
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'internship', 'freelance'])->default('full-time');
            
            // Salaire
            $table->decimal('salary_min', 10, 2)->nullable();
            $table->decimal('salary_max', 10, 2)->nullable();
            $table->string('salary_currency', 3)->default('EUR');
            
            // Modalités
            $table->boolean('remote_work')->default(false);
            $table->enum('experience_level', ['entry', 'mid', 'senior', 'executive'])->default('mid');
            $table->string('industry')->nullable();
            $table->json('skills_required')->nullable();
            
            // Application
            $table->timestamp('application_deadline')->nullable();
            $table->string('application_email')->nullable();
            $table->string('application_url')->nullable();
            
            // Status et features
            $table->enum('status', ['draft', 'published', 'closed', 'expired'])->default('draft');
            $table->boolean('featured')->default(false);
            
            // Notifications spéciales (pour APIDCA)
            $table->boolean('auto_notify_members')->default(false);
            $table->json('target_associations')->nullable(); // ['apidca', 'autre_asso']
            
            // Tracking
            $table->foreignId('posted_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('views_count')->default(0);
            $table->integer('applications_count')->default(0);
            
            // Fonctionnalités d'annonces simples
            $table->enum('posting_type', ['standard', 'simple_ad'])->default('standard');
            $table->json('contact_info')->nullable();
            $table->boolean('contact_via_platform')->default(true);
            $table->text('additional_instructions')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour performance
            $table->index(['status', 'application_deadline']);
            $table->index(['industry', 'status']);
            $table->index(['company_id', 'status']);
        });

        // Table pour les candidatures
        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('cover_letter')->nullable();
            $table->string('cv_path')->nullable(); // Chemin vers le CV utilisé
            $table->enum('status', ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'])->default('pending');
            $table->timestamp('applied_at')->useCurrent();
            $table->timestamps();
            
            $table->unique(['job_posting_id', 'user_id']); // Une candidature par utilisateur par offre
        });

        // Table des articles de blog
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('content');
            $table->string('featured_image')->nullable();
            
            // SEO fields
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            
            // Publishing
            $table->enum('status', ['draft', 'published', 'scheduled'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            
            // Categorization
            $table->string('category')->default('general');
            $table->json('tags')->nullable();
            
            // Analytics
            $table->integer('reading_time')->nullable(); // en minutes
            $table->integer('views_count')->default(0);
            $table->boolean('featured')->default(false);
            $table->integer('seo_score')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour performance
            $table->index(['status', 'published_at']);
            $table->index(['category', 'status']);
            $table->index(['featured', 'status']);
            $table->index('slug');
        });

        // Table des paramètres portfolio
        Schema::create('portfolio_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('design', ['intuitive', 'professional', 'user-friendly', 'modern'])->default('professional');
            $table->string('primary_color')->default('#f59e0b');
            $table->string('secondary_color')->default('#8b5cf6');
            $table->string('background_color')->default('#ffffff');
            $table->string('text_color')->default('#1f2937');
            $table->string('font_family')->default('Inter');
            $table->integer('border_radius')->default(8);
            $table->boolean('show_animations')->default(true);
            $table->string('header_style')->default('default'); // default, minimal, centered
            $table->boolean('show_social_links')->default(true);
            $table->json('section_order')->nullable();
            $table->boolean('show_summary')->default(true);
            $table->boolean('show_contact_info')->default(true);
            $table->boolean('show_experiences')->default(true);
            $table->boolean('show_competences')->default(true);
            $table->boolean('show_hobbies')->default(true);
            $table->boolean('show_services')->default(false);
            $table->string('currency', 10)->default('EUR');
            
            // Champs avancés
            $table->string('profile_photo')->nullable();
            $table->string('banner_image')->nullable();
            $table->enum('banner_position', ['top', 'behind_text', 'overlay'])->default('top');
            $table->json('social_links')->nullable();
            $table->text('bio')->nullable();
            $table->string('tagline')->nullable();
            $table->boolean('show_contact_form')->default(false);
            $table->text('custom_css')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('og_image')->nullable();
            $table->json('section_groups')->nullable();
            
            $table->timestamps();
        });

        // Table des sections portfolio
        Schema::create('portfolio_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('type')->default('custom'); // custom, experiences, competences, hobbies, etc.
            $table->text('content')->nullable();
            $table->json('settings')->nullable(); // Pour stocker les paramètres spécifiques à chaque section
            $table->integer('order_index')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('icon')->nullable();
            $table->string('background_color')->nullable();
            $table->string('text_color')->nullable();
            $table->timestamps();
        });

        // Table des services
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->string('main_image')->nullable(); // Image principale du service
            $table->string('icon')->nullable(); // Icône pour l'affichage
            $table->decimal('price', 10, 2)->nullable(); // Prix optionnel
            $table->string('price_type')->default('fixed'); // fixed, hourly, project
            $table->json('tags')->nullable(); // Tags/mots-clés
            $table->boolean('is_featured')->default(false); // Service mis en avant
            $table->boolean('is_active')->default(true);
            $table->integer('order_index')->default(0); // Pour l'ordre d'affichage
            $table->json('settings')->nullable(); // Paramètres supplémentaires
            $table->timestamps();
            
            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'order_index']);
        });

        // Table des images de services
        Schema::create('service_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('original_name'); // Nom original du fichier
            $table->string('path'); // Chemin vers l'image
            $table->string('compressed_path')->nullable(); // Chemin vers l'image compressée
            $table->string('thumbnail_path')->nullable(); // Chemin vers la miniature
            $table->integer('file_size'); // Taille du fichier en bytes
            $table->integer('compressed_size')->nullable(); // Taille compressée
            $table->string('mime_type'); // Type MIME
            $table->integer('width')->nullable(); // Largeur en pixels
            $table->integer('height')->nullable(); // Hauteur en pixels
            $table->string('alt_text')->nullable(); // Texte alternatif
            $table->text('caption')->nullable(); // Légende de l'image
            $table->integer('order_index')->default(0); // Ordre dans la galerie
            $table->boolean('is_main')->default(false); // Image principale du service
            $table->timestamps();
            
            $table->index(['service_id', 'order_index']);
            $table->index(['service_id', 'is_main']);
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
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_postings');
        Schema::dropIfExists('company_members');
        Schema::dropIfExists('companies');
    }
};
