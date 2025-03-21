<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('abbr', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->string('town', 45)->nullable();
            $table->string('street', 45)->nullable();
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('profession_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('profession_categories')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('professions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->constrained('profession_categories')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('surname', 45)->nullable();
//            $table->foreignId('address_id')->constrained()->onDelete('cascade');
            $table->foreignId('profession_id')->nullable();;
            $table->integer('numberOfChild')->nullable();
            $table->string('maritalStatus', 1)->nullable();

            // Nouveaux champs
            $table->string('github')->nullable();
//            $table->string('email')->unique()->nullable();
            $table->string('linkedin')->nullable();
            $table->string('address')->nullable();
            $table->string('phone_number')->nullable();
            $table->unsignedBigInteger('selected_summary_id')->nullable();
            $table->foreign('selected_summary_id')->references('id')->on('summaries')->onDelete('set null');
            $table->unsignedBigInteger('selected_cv_model_id')->nullable();
            $table->foreign('selected_cv_model_id')->references('id')->on('cv_models')->onDelete('set null');
        });

        Schema::create('cv_models', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191)->nullable();
            $table->string('description', 255)->nullable();
            $table->string('viewPath', 191)->nullable();
            $table->integer('price')->nullable();
            $table->string('previewImagePath', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('competences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('description', 255)->nullable();
            $table->timestamps();
        });

        Schema::create('hobbies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 191)->nullable();
            $table->timestamps();
        });

        Schema::create('user_cv_model', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('cv_model_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'cv_model_id']);
            $table->timestamps();
        });

        Schema::create('user_competence', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('competence_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'competence_id']);
            $table->timestamps();
        });

        Schema::create('user_hobby', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('hobby_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'hobby_id']);
            $table->timestamps();
        });

        Schema::create('experience_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('description', 45)->nullable();
            $table->integer('ranking')->nullable();
            $table->timestamps();
        });

        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 45)->nullable();
            $table->string('path', 250)->nullable();
            $table->string('format', 10)->nullable();
            $table->string('size', 100)->nullable();
            $table->timestamps();
        });

        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255)->nullable();
            $table->string('description', 255)->nullable();
            $table->date('date_start')->nullable();
            $table->date('date_end')->nullable();
            $table->string('output', 255)->nullable();
            $table->foreignId('experience_categories_id')->constrained('experience_categories')->onDelete('cascade');
            $table->text('comment')->nullable();
            $table->string('InstitutionName')->nullable();
            $table->foreignId('attachment_id')->nullable()->constrained('attachments')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('user_experience', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('experience_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'experience_id']);
            $table->timestamps();
        });

        Schema::create('references', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->nullable();
            $table->string('function', 50)->nullable();
            $table->string('email', 250)->nullable();
            $table->string('telephone', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('professionMissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->text('description')->nullable();
            $table->foreignId('profession_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('summaries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('user_summary', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('summary_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'summary_id']);
            $table->timestamps();
        });

        Schema::create('ExperienceReferences', function (Blueprint $table) {
            $table->foreignId('experiences_id')->constrained()->onDelete('cascade');
            $table->foreignId('references_id')->constrained()->onDelete('cascade');
            $table->primary(['experiences_id', 'references_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('ExperienceReferences');
        Schema::dropIfExists('user_summary');
        Schema::dropIfExists('summaries');
        Schema::dropIfExists('user_experience');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('experience_categories');
        Schema::dropIfExists('user_hobby');
        Schema::dropIfExists('hobbies');
        Schema::dropIfExists('user_competence');
        Schema::dropIfExists('competences');
        Schema::dropIfExists('user_cv_model');
        Schema::dropIfExists('cv_models');
        Schema::dropIfExists('professionMissions');
        Schema::dropIfExists('references');
        Schema::dropIfExists('users');
        Schema::dropIfExists('professions');
        Schema::dropIfExists('profession_categories');
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('countries');
    }
};
