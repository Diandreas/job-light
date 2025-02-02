<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Reference extends Model
{
    use HasFactory;

    /**
     * Les attributs qui peuvent être assignés en masse.
     *
     * @var array<string, mixed>
     */
    protected $fillable = [
        'name',
        'function',
        'email',
        'telephone'
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Les règles de validation pour les attributs.
     *
     * @var array<string, string>
     */
    public static $rules = [
        'name' => 'required|string|max:255',
        'function' => 'required|string|max:255',
        'email' => 'nullable|email|max:255',
        'telephone' => 'nullable|string|max:255'
    ];

    /**
     * Obtenir les expériences associées à cette référence.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function experiences(): BelongsToMany
    {
        return $this->belongsToMany(
            Experience::class,
            'ExperienceReferences',
            'references_id',
            'experiences_id'
        )->withTimestamps();
    }

    /**
     * Scope pour filtrer les références par expérience.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int  $experienceId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForExperience($query, $experienceId)
    {
        return $query->whereHas('experiences', function ($q) use ($experienceId) {
            $q->where('experiences.id', $experienceId);
        });
    }

    /**
     * Scope pour rechercher des références par nom ou fonction.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('function', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Obtenir le nom complet formaté de la référence avec sa fonction.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->name} - {$this->function}";
    }

    /**
     * Vérifier si la référence a des informations de contact valides.
     *
     * @return bool
     */
    public function hasValidContactInfo(): bool
    {
        return !empty($this->email) || !empty($this->telephone);
    }

    /**
     * Obtenir les informations de contact formatées.
     *
     * @return string
     */
    public function getContactInfoAttribute(): string
    {
        $contact = [];

        if (!empty($this->email)) {
            $contact[] = $this->email;
        }

        if (!empty($this->telephone)) {
            $contact[] = $this->telephone;
        }

        return implode(' | ', $contact);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Avant la suppression d'une référence
        static::deleting(function ($reference) {
            // Détacher toutes les expériences associées
            $reference->experiences()->detach();
        });
    }
}
