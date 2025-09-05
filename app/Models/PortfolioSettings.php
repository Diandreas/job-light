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
        'show_experiences',
        'show_competences',
        'show_hobbies',
        'show_summary',
        'show_contact_info',
        'show_services',
        'section_order',
    ];

    protected $casts = [
        'show_experiences' => 'boolean',
        'show_competences' => 'boolean',
        'show_hobbies' => 'boolean',
        'show_summary' => 'boolean',
        'show_contact_info' => 'boolean',
        'show_services' => 'boolean',
        'section_order' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Méthodes utilitaires
    public static function getAvailableDesigns()
    {
        return [
            'professional' => 'Professionnel',
            'creative' => 'Créatif',
            'minimal' => 'Minimal',
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
