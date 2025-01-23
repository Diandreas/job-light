<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferralLevel extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'min_referrals', 'commission_rate'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public static function getUserLevel($referralCount)
    {
        return self::where('min_referrals', '<=', $referralCount)
            ->orderBy('min_referrals', 'desc')
            ->first();
    }
}
