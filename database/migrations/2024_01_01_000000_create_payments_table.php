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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('transaction_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XAF');
            $table->string('description');
            $table->enum('status', ['pending', 'initiated', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->string('payment_method')->default('cinetpay');
            $table->string('external_id')->nullable(); // ID externe de CinetPay
            $table->json('metadata')->nullable(); // Données supplémentaires
            $table->json('external_data')->nullable(); // Réponse complète de CinetPay
            $table->string('reference')->nullable(); // Référence de paiement
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['transaction_id']);
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
