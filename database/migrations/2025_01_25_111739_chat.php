
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up()
    {
        Schema::create('chat_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('context_id')->unique();
            $table->json('messages');
            $table->string('service_id');
            $table->integer('tokens_used')->default(0);
            $table->timestamps();
            $table->index(['user_id', 'context_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('chat_histories');
    }
};
