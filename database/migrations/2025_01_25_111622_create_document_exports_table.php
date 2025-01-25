<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDocumentExportsTable extends Migration
{
    public function up()
    {
        Schema::create('document_exports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('chat_history_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('format');
            $table->timestamps();
            $table->index(['user_id', 'chat_history_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('document_exports');
    }
}
