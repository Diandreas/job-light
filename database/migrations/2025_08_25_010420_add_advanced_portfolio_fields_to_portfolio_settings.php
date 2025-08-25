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
            if (!Schema::hasColumn('portfolio_settings', 'profile_photo')) {
                $table->string('profile_photo')->nullable()->after('secondary_color');
            }
            if (!Schema::hasColumn('portfolio_settings', 'banner_image')) {
                $table->string('banner_image')->nullable()->after('profile_photo');
            }
            if (!Schema::hasColumn('portfolio_settings', 'banner_position')) {
                $table->enum('banner_position', ['top', 'behind_text', 'overlay'])->default('top')->after('banner_image');
            }
            if (!Schema::hasColumn('portfolio_settings', 'social_links')) {
                $table->json('social_links')->nullable()->after('banner_position');
            }
            if (!Schema::hasColumn('portfolio_settings', 'bio')) {
                $table->text('bio')->nullable()->after('social_links');
            }
            if (!Schema::hasColumn('portfolio_settings', 'tagline')) {
                $table->string('tagline')->nullable()->after('bio');
            }
            if (!Schema::hasColumn('portfolio_settings', 'show_contact_form')) {
                $table->boolean('show_contact_form')->default(false)->after('tagline');
            }
            if (!Schema::hasColumn('portfolio_settings', 'custom_css')) {
                $table->text('custom_css')->nullable()->after('show_contact_form');
            }
            if (!Schema::hasColumn('portfolio_settings', 'seo_title')) {
                $table->string('seo_title')->nullable()->after('custom_css');
            }
            if (!Schema::hasColumn('portfolio_settings', 'seo_description')) {
                $table->text('seo_description')->nullable()->after('seo_title');
            }
            if (!Schema::hasColumn('portfolio_settings', 'og_image')) {
                $table->string('og_image')->nullable()->after('seo_description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_settings', function (Blueprint $table) {
            $table->dropColumn([
                'profile_photo',
                'banner_image', 
                'banner_position',
                'social_links',
                'bio',
                'tagline',
                'show_contact_form',
                'custom_css',
                'seo_title',
                'seo_description',
                'og_image'
            ]);
        });
    }
};
