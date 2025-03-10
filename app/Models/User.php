<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'address_id',
        'profession_id',
        'surname',
        'create_time',
        'numberOfChild',
        'maritalStatus',
        'github',
        'linkedin',
        'address',
        'full_profession',
        'phone_number',
        'username',
        'photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function cvInfos()
    {
        return $this->hasMany(CvInfo::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function profession()
    {
        return $this->belongsTo(Profession::class);
    }

    public function competences()
    {
        return $this->belongsToMany(Competence::class, 'user_competence', 'user_id', 'competence_id');
    }

    public function hobbies()
    {
        return $this->belongsToMany(Hobby::class, 'user_hobby', 'user_id', 'hobby_id');
    }

    public function experiences()
    {
        return $this->belongsToMany(Experience::class, 'user_experience', 'user_id', 'experience_id');
    }

    public function summary()
    {
        return $this->belongsTo(Summary::class);
    }

    public function summaries(): BelongsToMany
    {
        return $this->belongsToMany(Summary::class, 'user_summary');
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function selected_summary()
    {
        return $this->belongsTo(Summary::class, 'selected_summary_id');
    }

    public function cvModels()
    {
        return $this->belongsToMany(CvModel::class, 'user_cv_model');
    }

    public function selected_cv_model()
    {
        return $this->belongsTo(CvModel::class, 'selected_cv_model_id');
    }


    /**
     * Get the referral code for the user.
     */
    public function referralCode()
    {
        return $this->hasOne(ReferralCode::class);
    }

    /**
     * Get the referrals made by the user.
     */
    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    /**
     * Get the referrals where this user was referred.
     */
    public function referredBy()
    {
        return $this->hasMany(Referral::class, 'referred_id');
    }

    /**
     * Get the referral earnings for the user.
     */
    public function referralEarnings()
    {
        return $this->hasMany(ReferralEarning::class);
    }

    /**
     * Get the current referral level name based on number of referrals.
     */
    public function referralLevel()
    {
        $referralCount = $this->referrals()->count();

        if ($referralCount >= 20) {
            return 'DIAMANT';
        } elseif ($referralCount >= 10) {
            return 'OR';
        } else {
            return 'ARGENT';
        }
    }

    /**
     * Get the next referral level name.
     */
    public function nextReferralLevel()
    {
        $currentLevel = $this->referralLevel();

        if ($currentLevel === 'DIAMANT') {
            return null; // Already at highest level
        } elseif ($currentLevel === 'OR') {
            return 'DIAMANT';
        } else {
            return 'OR';
        }
    }

    /**
     * Calculate progress towards the next level as a percentage.
     */
    public function referralProgress()
    {
        $referralCount = $this->referrals()->count();
        $currentLevel = $this->referralLevel();

        if ($currentLevel === 'DIAMANT') {
            return 100; // Already at max level
        } elseif ($currentLevel === 'OR') {
            // Progress from 10 (OR) to 20 (DIAMANT)
            return min(100, (($referralCount - 10) / 10) * 100);
        } else {
            // Progress from 0 (ARGENT) to 10 (OR)
            return min(100, ($referralCount / 10) * 100);
        }
    }
    public function getRouteKeyName()
    {
        return 'username';
    }

    /**
     * Get the user's portfolio design.
     */
    public function portfolioDesign()
    {
        return $this->hasOne(PortfolioDesign::class);
    }
    public function getUsername()
    {
        return $this->username ?? $this->email;
    }
    public function getIdentifierAttribute()
    {
        return $this->username ?? $this->email;
    }
//    public function portfolioSubscription()
//    {
//        return $this->hasOne(PortfolioSubscription::class);
//    }

    public function portfolioSettings()
    {
        return $this->hasOne(PortfolioSettings::class);
    }
}
