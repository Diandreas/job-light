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
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable();
            $table->string('linkedin_id')->nullable();
            $table->string('social_avatar')->nullable();
            $table->text('social_token')->nullable();
            $table->text('social_refresh_token')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'google_id',
                'linkedin_id',
                'social_avatar',
                'social_token',
                'social_refresh_token'
            ]);
        });
    }
};
