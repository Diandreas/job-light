<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobListing extends Model
{
    protected $fillable = [
        'title',
        'description',
        'company_name',
        'location',
        'is_remote',
        'budget_type',
        'currency',
        'budget_min',
        'budget_max',
        'budget_negotiable',
        'user_id', // ID du recruteur qui a posté l'annonce
        'uuid',
        'duration', // durée estimée du projet
        'level',
        'status', // 'open', 'closed', 'draft'
        'is_featured',
        'views_count',
    ];

    protected $casts = [
        'deadline' => 'datetime',
        'is_featured' => 'boolean',
    ];

    /**
     * Obtenir le recruteur qui a posté l'annonce
     */
    public function recruiter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Obtenir les compétences requises pour cette annonce
     */
    public function requiredSkills(): BelongsToMany
    {
        return $this->belongsToMany(Competence::class, 'job_listing_skills')
            ->withPivot('importance') // 'required', 'preferred', 'nice_to_have'
            ->withTimestamps();
    }

    /**
     * Obtenir toutes les candidatures pour cette annonce
     */
    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Vérifier si l'utilisateur a déjà postulé à cette annonce
     */
    public function hasApplied($userId): bool
    {
        return $this->applications()->where('user_id', $userId)->exists();
    }

    /**
     * Nombre de candidatures reçues
     */
    public function applicationsCount(): int
    {
        return $this->applications()->count();
    }
} 