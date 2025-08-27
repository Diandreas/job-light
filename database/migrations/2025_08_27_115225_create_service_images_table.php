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
        Schema::create('service_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('original_name'); // Nom original du fichier
            $table->string('path'); // Chemin vers l'image
            $table->string('compressed_path')->nullable(); // Chemin vers l'image compressée
            $table->string('thumbnail_path')->nullable(); // Chemin vers la miniature
            $table->integer('file_size'); // Taille du fichier en bytes
            $table->integer('compressed_size')->nullable(); // Taille compressée
            $table->string('mime_type'); // Type MIME
            $table->integer('width')->nullable(); // Largeur en pixels
            $table->integer('height')->nullable(); // Hauteur en pixels
            $table->string('alt_text')->nullable(); // Texte alternatif
            $table->text('caption')->nullable(); // Légende de l'image
            $table->integer('order_index')->default(0); // Ordre dans la galerie
            $table->boolean('is_main')->default(false); // Image principale du service
            $table->timestamps();
            
            $table->index(['service_id', 'order_index']);
            $table->index(['service_id', 'is_main']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_images');
    }
};
