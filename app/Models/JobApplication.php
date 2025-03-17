<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    protected $fillable = [
        'job_listing_id',
        'user_id',
        'cover_letter',
        'proposed_rate',
        'status', // 'pending', 'shortlisted', 'rejected', 'hired'
        'tokens_spent',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
        'tokens_spent' => 'integer',
    ];

    /**
     * Obtenir l'annonce d'emploi associée
     */
    public function jobListing(): BelongsTo
    {
        return $this->belongsTo(JobListing::class);
    }

    /**
     * Obtenir le candidat
     */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Obtenir les pièces jointes de la candidature
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(JobApplicationAttachment::class);
    }

    /**
     * Marquer la candidature comme vue
     */
    public function markAsViewed()
    {
        if (!$this->viewed_at) {
            $this->update(['viewed_at' => now()]);
        }
    }
} 