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
            $table->foreignId('cv_model_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XAF');
            $table->string('reference')->unique();
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('payment_method', ['cinetpay', 'fapshi', 'paypal', 'manual'])->default('cinetpay');
            $table->string('transaction_id')->nullable();
            $table->string('gateway_reference')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            
            // CinetPay specific fields
            $table->string('cinetpay_transaction_id')->nullable();
            $table->string('cinetpay_payment_token')->nullable();
            $table->string('cinetpay_operator')->nullable();
            $table->string('cinetpay_phone')->nullable();
            $table->string('cinetpay_operator_transaction_id')->nullable();
            
            // Metadata for additional information
            $table->json('metadata')->nullable();
            $table->json('gateway_response')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
            $table->index(['payment_method', 'status']);
            $table->index(['reference']);
            $table->index(['transaction_id']);
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