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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // maintenance_mode, max_upload_size, etc.
            $table->text('value'); // Valeur du paramètre
            $table->enum('type', ['string', 'integer', 'boolean', 'json', 'float'])->default('string');
            $table->string('group')->default('general'); // general, security, payment, etc.
            $table->text('description')->nullable(); // Description du paramètre
            $table->boolean('is_public')->default(false); // Si visible côté public
            $table->timestamps();
            
            $table->index(['group', 'is_public']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
