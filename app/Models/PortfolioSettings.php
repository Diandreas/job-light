<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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
        'show_experiences',
        'show_competences',
        'show_hobbies',
        'show_summary',
        'show_contact_info',
        // Nouveaux champs
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
        'og_image',
    ];

    protected $casts = [
        'show_experiences' => 'boolean',
        'show_competences' => 'boolean',
        'show_hobbies' => 'boolean',
        'show_summary' => 'boolean',
        'show_contact_info' => 'boolean',
        'show_contact_form' => 'boolean',
        'show_animations' => 'boolean',
        'show_social_links' => 'boolean',
        'section_order' => 'array',
        'social_links' => 'array',
        'border_radius' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Méthodes utilitaires
    public static function getAvailableFonts()
    {
        return [
            'Inter' => 'Inter',
            'Roboto' => 'Roboto',
            'Open Sans' => 'Open Sans',
            'Poppins' => 'Poppins',
            'Montserrat' => 'Montserrat',
            'Lato' => 'Lato',
            'Nunito' => 'Nunito',
            'Source Sans Pro' => 'Source Sans Pro',
        ];
    }

    public static function getAvailableHeaderStyles()
    {
        return [
            'default' => 'Classique',
            'minimal' => 'Minimal',
            'centered' => 'Centré',
            'modern' => 'Moderne',
        ];
    }

    public function getDefaultSectionOrder()
    {
        return [
            'about' => 0,
            'experiences' => 1,
            'competences' => 2,
            'projects' => 3,
            'education' => 4,
            'hobbies' => 5,
        ];
    }
}
