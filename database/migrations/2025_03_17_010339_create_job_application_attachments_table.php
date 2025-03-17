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
        Schema::create('job_application_attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_application_id');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type');
            $table->unsignedInteger('file_size');
            $table->string('description')->nullable();
            $table->timestamps();
            
            $table->foreign('job_application_id')->references('id')->on('job_applications')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_application_attachments');
    }
};
