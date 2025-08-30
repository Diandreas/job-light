<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'visited_at',
        'ip_address',
        'user_agent',
        'referrer',
        'metadata'
    ];

    protected $casts = [
        'visited_at' => 'datetime',
        'metadata' => 'array'
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope pour les visites récentes
     */
    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('visited_at', '>=', now()->subDays($days));
    }

    /**
     * Scope pour les partages uniquement
     */
    public function scopeShares($query)
    {
        return $query->whereJsonContains('metadata->type', 'share');
    }

    /**
     * Scope pour les visites uniques par IP
     */
    public function scopeUniqueVisitors($query)
    {
        return $query->distinct('ip_address');
    }

    /**
     * Obtenir le type de visite depuis les métadonnées
     */
    public function getTypeAttribute(): string
    {
        return $this->metadata['type'] ?? 'view';
    }

    /**
     * Obtenir la plateforme de partage depuis les métadonnées
     */
    public function getPlatformAttribute(): ?string
    {
        return $this->metadata['platform'] ?? null;
    }

    /**
     * Vérifier si c'est un partage
     */
    public function getIsShareAttribute(): bool
    {
        return $this->type === 'share';
    }

    /**
     * Obtenir une description lisible de la visite
     */
    public function getDescriptionAttribute(): string
    {
        if ($this->is_share) {
            $platform = $this->platform;
            return "Partage sur {$platform}";
        }

        return 'Visite du portfolio';
    }
}