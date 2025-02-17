<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('competences', function (Blueprint $table) {
            $table->string('name_en')->nullable()->after('name');
        });

        Schema::table('hobbies', function (Blueprint $table) {
            $table->string('name_en')->nullable()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('competences', function (Blueprint $table) {
            $table->dropColumn('name_en');
        });

        Schema::table('hobbies', function (Blueprint $table) {
            $table->dropColumn('name_en');
        });
    }
};
