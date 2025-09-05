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
            $table->enum('subscription_type', ['free', 'basic', 'premium'])->default('free');
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_members');
        Schema::dropIfExists('companies');
    }
};