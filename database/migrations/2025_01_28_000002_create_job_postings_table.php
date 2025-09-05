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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_postings');
    }
};