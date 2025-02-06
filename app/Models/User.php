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
     * Obtenir le code de parrainage de l'utilisateur.
     */
    public function referralCode()
    {
        return $this->hasOne(ReferralCode::class);
    }

    /**
     * Obtenir les utilisateurs parrainés par cet utilisateur.
     */
    public function referrals()
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    /**
     * Obtenir les gains de parrainage de l'utilisateur.
     */
    public function referralEarnings()
    {
        return $this->hasMany(ReferralEarning::class);
    }

    /**
     * Obtenir le niveau de parrainage actuel de l'utilisateur.
     */
    public function referralLevel()
    {
        $referralCount = $this->referrals()->count();
        return ReferralLevel::where('min_referrals', '<=', $referralCount)
            ->orderBy('min_referrals', 'desc')
            ->first();
    }

    /**
     * Obtenir le prochain niveau de parrainage.
     */
    public function nextReferralLevel()
    {
        $currentLevel = $this->referralLevel();
        return ReferralLevel::where('min_referrals', '>', $currentLevel->min_referrals)
            ->orderBy('min_referrals', 'asc')
            ->first();
    }

    /**
     * Calculer la progression vers le prochain niveau de parrainage.
     */
    public function referralProgress()
    {
        $currentLevel = $this->referralLevel();
        $nextLevel = $this->nextReferralLevel();

        if (!$nextLevel) {
            return 100; // L'utilisateur est au niveau maximum
        }

        $currentReferrals = $this->referrals()->count();
        $referralsNeeded = $nextLevel->min_referrals - $currentLevel->min_referrals;
        $referralsProgress = $currentReferrals - $currentLevel->min_referrals;

        return min(($referralsProgress / $referralsNeeded) * 100, 100);
    }

    /**
     * Générer ou récupérer le code de parrainage de l'utilisateur.
     */
    public function getOrCreateReferralCode()
    {
        if (!$this->referralCode) {
            $this->referralCode()->create([
                'code' => $this->generateUniqueReferralCode(),
            ]);
        }

        return $this->referralCode->code;
    }

    /**
     * Générer un code de parrainage unique.
     */
    protected function generateUniqueReferralCode()
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (ReferralCode::where('code', $code)->exists());

        return $code;
    }

    /**
     * Ajouter un gain de parrainage pour l'utilisateur.
     */
    public function addReferralEarning($amount, $referralId)
    {
        return $this->referralEarnings()->create([
            'amount' => $amount,
            'referral_id' => $referralId,
            'status' => 'pending',
        ]);
    }

    /**
     * Obtenir le total des gains de parrainage de l'utilisateur.
     */
    public function totalReferralEarnings()
    {
        return $this->referralEarnings()->where('status', 'paid')->sum('amount');
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
