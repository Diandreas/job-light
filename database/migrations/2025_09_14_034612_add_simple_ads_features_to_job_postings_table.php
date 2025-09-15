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
        Schema::table('job_postings', function (Blueprint $table) {
            $table->enum('posting_type', ['standard', 'simple_ad'])->default('standard')->after('applications_count');
            $table->json('contact_info')->nullable()->after('posting_type');
            $table->boolean('contact_via_platform')->default(true)->after('contact_info');
            $table->text('additional_instructions')->nullable()->after('contact_via_platform');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropColumn(['posting_type', 'contact_info', 'contact_via_platform', 'additional_instructions']);
        });
    }
};
