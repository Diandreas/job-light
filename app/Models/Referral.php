<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referred_id',
        'referred_at',
    ];

    protected $casts = [
        'referred_at' => 'datetime',
    ];

    /**
     * Get the user who referred someone.
     */
    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * Get the user who was referred.
     */
    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    /**
     * Get the earnings associated with this referral.
     */
    public function earnings()
    {
        return $this->hasMany(ReferralEarning::class);
    }
}
