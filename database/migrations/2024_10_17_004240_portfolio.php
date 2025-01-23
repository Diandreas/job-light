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
        Schema::create('portfolio_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('status');
            $table->string('plan');
            $table->timestamps();
        });
        Schema::create('portfolio_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('show_experiences')->default(true);
            $table->boolean('show_competences')->default(true);
            $table->boolean('show_hobbies')->default(true);
            $table->string('layout')->default('default');
            $table->timestamps();
        });
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->after('email');
        });
        Schema::create('portfolio_designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('layout')->default('default');
            $table->string('color_scheme')->default('light');
            $table->string('font')->default('sans-serif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolio_designs');
    }
};
