<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{ /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        // Renommer la table 'models' en 'cv_models'
//        Schema::rename('models', 'cv_models');
//
//        // Renommer la table 'user_model' en 'user_cv_model'
//        Schema::rename('user_model', 'user_cv_model');
//
//        // Mettre à jour les contraintes de clé étrangère dans la table 'user_cv_model'
//        Schema::table('user_cv_model', function (Blueprint $table) {
//            $table->dropForeign(['model_id']);
//            $table->renameColumn('model_id', 'cv_model_id');
//            $table->foreign('cv_model_id')->references('id')->on('cv_models')->onDelete('cascade');
//        });

        // Ajouter la colonne 'selected_cv_model_id' à la table 'users'
//        Schema::table('users', function (Blueprint $table) {
//            $table->unsignedBigInteger('selected_cv_model_id')->nullable()->after('selected_summary_id');
//            $table->unsignedBigInteger('selected_cv_model_id')->nullable()->after('selected_summary_id');
//            $table->foreign('selected_cv_model_id')->references('id')->on('cv_models')->onDelete('set null');
//        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        // Supprimer la colonne 'selected_cv_model_id' de la table 'users'
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['selected_cv_model_id']);
            $table->dropColumn('selected_cv_model_id');
        });

        // Renommer la table 'user_cv_model' en 'user_model'
        Schema::rename('user_cv_model', 'user_model');

        // Mettre à jour les contraintes de clé étrangère dans la table 'user_model'
        Schema::table('user_model', function (Blueprint $table) {
            $table->dropForeign(['cv_model_id']);
            $table->renameColumn('cv_model_id', 'model_id');
            $table->foreign('model_id')->references('id')->on('models')->onDelete('cascade');
        });

        // Renommer la table 'cv_models' en 'models'
        Schema::rename('cv_models', 'models');
    }
};
