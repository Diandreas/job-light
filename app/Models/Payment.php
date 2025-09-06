<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'transaction_id',
        'amount',
        'currency',
        'description',
        'status',
        'payment_method',
        'external_id',
        'metadata',
        'external_data',
        'reference',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'external_data' => 'array',
        'completed_at' => 'datetime',
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope pour les paiements réussis
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope pour les paiements en attente
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'initiated']);
    }

    /**
     * Scope pour les paiements échoués
     */
    public function scopeFailed($query)
    {
        return $query->whereIn('status', ['failed', 'cancelled']);
    }

    /**
     * Vérifier si le paiement est réussi
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    /**
     * Vérifier si le paiement est en attente
     */
    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'initiated']);
    }

    /**
     * Vérifier si le paiement a échoué
     */
    public function isFailed(): bool
    {
        return in_array($this->status, ['failed', 'cancelled']);
    }

    /**
     * Obtenir le montant formaté
     */
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 0, ',', ' ') . ' ' . $this->currency;
    }

    /**
     * Obtenir les métadonnées décodées
     */
    public function getMetadataAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }

    /**
     * Obtenir les données externes décodées
     */
    public function getExternalDataAttribute($value)
    {
        return is_string($value) ? json_decode($value, true) : $value;
    }
}