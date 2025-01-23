<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Table pour stocker les codes de parrainage
        Schema::create('referral_codes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('code')->unique();
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
    }

    public function down()
    {
        Schema::dropIfExists('referral_earnings');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('referral_codes');
        Schema::dropIfExists('referral_levels');
    }
};
