<?php

namespace App\Models\Portfolio;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioSettings extends Model
{
    use HasFactory;
    
    protected $table = 'portfolio_settings';

    protected $fillable = [
        'user_id',
        'design',
        'primary_color',
        'secondary_color',
        'show_experiences',
        'show_competences',
        'show_hobbies',
        'show_summary',
        'show_contact_info',
        'banner_image',
        'banner_position',
        'social_links',
    ];

    protected $casts = [
        'show_experiences' => 'boolean',
        'show_competences' => 'boolean',
        'show_hobbies' => 'boolean',
        'show_summary' => 'boolean',
        'show_contact_info' => 'boolean',
        'social_links' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Templates disponibles
     */
    public static function getAvailableDesigns(): array
    {
        return [
            'professional' => 'Professionnel',
            'creative' => 'Créatif',
            'minimal' => 'Minimaliste',
            'modern' => 'Moderne',
        ];
    }

    /**
     * Positions de bannière disponibles
     */
    public static function getBannerPositions(): array
    {
        return [
            'top' => 'En haut',
            'behind_text' => 'Arrière-plan',
            'overlay' => 'Superposition',
        ];
    }

    /**
     * Couleurs par défaut pour chaque design
     */
    public function getDefaultColors(): array
    {
        $defaultColors = [
            'professional' => ['#3b82f6', '#64748b'],
            'creative' => ['#f59e0b', '#8b5cf6'], 
            'minimal' => ['#6b7280', '#1f2937'],
            'modern' => ['#06b6d4', '#3b82f6'],
        ];

        return $defaultColors[$this->design] ?? $defaultColors['professional'];
    }

    /**
     * Vérifier si le portfolio a des personnalisations
     */
    public function hasCustomizations(): bool
    {
        return !empty($this->banner_image) || 
               !empty($this->social_links) ||
               $this->primary_color !== '#3b82f6';
    }
}