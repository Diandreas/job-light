<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'code',
        'expires_at',
        'is_active',
    ];
    
    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the referral code.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Scope a query to only include active codes.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                    ->where(function($query) {
                        $query->whereNull('expires_at')
                              ->orWhere('expires_at', '>=', now());
                    });
    }
    
    /**
     * Check if the referral code is expired.
     */
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
    
    /**
     * Check if the referral code is valid (active and not expired).
     */
    public function isValid()
    {
        return $this->is_active && (!$this->expires_at || !$this->isExpired());
    }
}
