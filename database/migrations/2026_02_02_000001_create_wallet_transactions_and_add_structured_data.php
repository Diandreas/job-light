<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('service_id');
            $table->string('type', 50); // debit, credit, refund
            $table->string('context_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index('context_id');
        });

        Schema::table('chat_histories', function (Blueprint $table) {
            $table->json('structured_data')->nullable()->after('messages');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');

        Schema::table('chat_histories', function (Blueprint $table) {
            $table->dropColumn('structured_data');
        });
    }
};
