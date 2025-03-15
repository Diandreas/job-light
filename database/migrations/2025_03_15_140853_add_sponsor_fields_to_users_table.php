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
            $table->unsignedBigInteger('sponsor_id')->nullable()->after('id');
            $table->string('sponsor_code')->nullable()->after('sponsor_id');
            $table->timestamp('sponsor_expires_at')->nullable()->after('sponsor_code');
            
            $table->foreign('sponsor_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['sponsor_id']);
            $table->dropColumn(['sponsor_id', 'sponsor_code', 'sponsor_expires_at']);
        });
    }
};
