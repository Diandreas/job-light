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
        // Table des paiements
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('model_id')->nullable()->constrained('cv_models');
            $table->string('transaction_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XAF');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'initiated', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('payment_method')->default('cinetpay');
            $table->string('external_id')->nullable(); // ID externe de CinetPay
            $table->json('external_data')->nullable(); // Réponse complète de CinetPay
            $table->string('reference')->nullable(); // Référence de paiement
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable(); // Données supplémentaires
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['transaction_id']);
            $table->index(['status', 'created_at']);
        });

        // Table pour stocker les codes de parrainage
        Schema::create('referral_codes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('code')->unique();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Table pour stocker les relations de parrainage
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('referrer_id');
            $table->unsignedBigInteger('referred_id');
            $table->timestamp('referred_at');
            $table->timestamps();

            $table->foreign('referrer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('referred_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Table pour stocker les gains de parrainage
        Schema::create('referral_earnings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('referral_id');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('referral_id')->references('id')->on('referrals')->onDelete('cascade');
        });

        // Table pour stocker les niveaux de parrainage
        Schema::create('referral_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('min_referrals');
            $table->decimal('commission_rate', 5, 2);
            $table->timestamps();
        });

        // Table pour les abonnements portfolio
        Schema::create('portfolio_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('status');
            $table->string('plan');
            $table->timestamps();
        });

        // Table pour l'historique des chats
        Schema::create('chat_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('context_id')->unique();
            $table->text('context')->nullable();
            $table->json('messages');
            $table->string('service_id');
            $table->integer('tokens_used')->default(0);
            $table->timestamps();
            $table->index(['user_id', 'context_id']);
        });

        // Table pour les exports de documents
        Schema::create('document_exports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('chat_history_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('format');
            $table->timestamps();
            $table->index(['user_id', 'chat_history_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_exports');
        Schema::dropIfExists('chat_histories');
        Schema::dropIfExists('portfolio_subscriptions');
        Schema::dropIfExists('referral_earnings');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('referral_codes');
        Schema::dropIfExists('referral_levels');
        Schema::dropIfExists('payments');
    }
};
