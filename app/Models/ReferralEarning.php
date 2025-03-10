<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralEarning extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'referral_id',
        'amount',
        'status',
    ];

    /**
     * Get the user who earned the commission.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the referral associated with this earning.
     */
    public function referral()
    {
        return $this->belongsTo(Referral::class);
    }
}
