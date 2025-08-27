<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'type',
        'content',
        'settings',
        'order_index',
        'is_active',
        'icon',
        'background_color',
        'text_color',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scope pour récupérer les sections actives et ordonnées
    public function scopeActiveOrdered($query)
    {
        return $query->where('is_active', true)->orderBy('order_index');
    }

    // Méthode pour obtenir les types de sections disponibles
    public static function getAvailableTypes()
    {
        return [
            'custom' => 'Section personnalisée',
            'about' => 'À propos',
            'experiences' => 'Expériences',
            'competences' => 'Compétences',
            'hobbies' => 'Centres d\'intérêt',
            'projects' => 'Projets',
            'education' => 'Formation',
            'languages' => 'Langues',
            'awards' => 'Prix et distinctions',
            'testimonials' => 'Témoignages',
            'services' => 'Services',
        ];
    }

    // Méthode pour obtenir les icônes par défaut
    public static function getDefaultIcons()
    {
        return [
            'custom' => 'Edit',
            'about' => 'User',
            'experiences' => 'Briefcase',
            'competences' => 'Award',
            'hobbies' => 'Heart',
            'projects' => 'FolderOpen',
            'education' => 'GraduationCap',
            'languages' => 'Globe',
            'awards' => 'Star',
            'testimonials' => 'MessageSquare',
            'services' => 'Wrench',
        ];
    }

    // Méthode pour obtenir l'icône par défaut selon le type
    public function getDefaultIcon()
    {
        $icons = self::getDefaultIcons();
        return $icons[$this->type] ?? 'Edit';
    }
}