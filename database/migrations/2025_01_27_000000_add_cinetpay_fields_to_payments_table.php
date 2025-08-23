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
        Schema::table('payments', function (Blueprint $table) {
            // Colonnes pour CinetPay - vérifier si elles existent d'abord
            if (!Schema::hasColumn('payments', 'currency')) {
                $table->string('currency', 3)->default('XOF')->after('amount');
            }
            
            if (!Schema::hasColumn('payments', 'description')) {
                $table->text('description')->nullable()->after('currency');
            }
            
            if (!Schema::hasColumn('payments', 'external_id')) {
                $table->string('external_id')->nullable()->after('transaction_id');
            }
            
            if (!Schema::hasColumn('payments', 'external_data')) {
                $table->json('external_data')->nullable()->after('external_id');
            }
            
            if (!Schema::hasColumn('payments', 'completed_at')) {
                $table->timestamp('completed_at')->nullable()->after('updated_at');
            }
            
            // Rendre model_id nullable car pas tous les paiements sont liés à un modèle CV
            if (Schema::hasColumn('payments', 'model_id')) {
                $table->foreignId('model_id')->nullable()->change();
            }
            
            // Rendre reference nullable car CinetPay utilise transaction_id
            if (Schema::hasColumn('payments', 'reference')) {
                $table->string('reference')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Supprimer seulement les colonnes que nous avons ajoutées
            if (Schema::hasColumn('payments', 'currency')) {
                $table->dropColumn('currency');
            }
            
            if (Schema::hasColumn('payments', 'description')) {
                $table->dropColumn('description');
            }
            
            if (Schema::hasColumn('payments', 'external_id')) {
                $table->dropColumn('external_id');
            }
            
            if (Schema::hasColumn('payments', 'external_data')) {
                $table->dropColumn('external_data');
            }
            
            if (Schema::hasColumn('payments', 'completed_at')) {
                $table->dropColumn('completed_at');
            }
            
            // Restaurer les contraintes originales si nécessaire
            if (Schema::hasColumn('payments', 'model_id')) {
                $table->foreignId('model_id')->nullable(false)->change();
            }
            
            if (Schema::hasColumn('payments', 'reference')) {
                $table->string('reference')->nullable(false)->change();
            }
        });
    }
};
