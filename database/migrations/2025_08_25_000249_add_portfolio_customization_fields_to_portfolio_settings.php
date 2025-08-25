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
        Schema::table('portfolio_settings', function (Blueprint $table) {
            $table->string('design')->default('professional')->after('user_id');
            $table->string('primary_color')->default('#f59e0b')->after('design');
            $table->string('secondary_color')->default('#8b5cf6')->after('primary_color');
            $table->string('background_color')->default('#ffffff')->after('secondary_color');
            $table->string('text_color')->default('#1f2937')->after('background_color');
            $table->string('font_family')->default('Inter')->after('text_color');
            $table->integer('border_radius')->default(8)->after('font_family');
            $table->boolean('show_animations')->default(true)->after('border_radius');
            $table->string('header_style')->default('default')->after('show_animations'); // default, minimal, centered
            $table->boolean('show_social_links')->default(true)->after('header_style');
            $table->json('section_order')->nullable()->after('show_social_links');
            $table->boolean('show_summary')->default(true)->after('section_order');
            $table->boolean('show_contact_info')->default(true)->after('show_summary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_settings', function (Blueprint $table) {
            $table->dropColumn([
                'design',
                'primary_color',
                'secondary_color', 
                'background_color',
                'text_color',
                'font_family',
                'border_radius',
                'show_animations',
                'header_style',
                'show_social_links',
                'section_order',
                'show_summary',
                'show_contact_info'
            ]);
        });
    }
};
