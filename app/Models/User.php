<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\ReferralLevel;
use App\Models\PushNotification;
use App\Models\UserNotificationPreference;
use App\Models\UserDeviceToken;
use App\Models\UserMessage;
use App\Models\CompanyReview;

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
        'primary_color',
        'maritalStatus',
        'github',
        'linkedin',
        'address',
        'full_profession',
        'phone_number',
        'username',
        'photo',
        'manual_competences',
        'manual_hobbies',
        'manual_certifications',
        'wallet_balance',
        'UserType',
        'sponsor_id',
        'sponsor_code',
        'sponsor_expires_at',
        'google_id',
        'linkedin_id',
        'social_avatar',
        'social_token',
        'social_refresh_token',
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
        'manual_competences' => 'array',
        'manual_hobbies' => 'array',
        'manual_certifications' => 'array',
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
        try {
            $referralCount = $this->referrals()->count();
            
            // Récupérer tous les niveaux et les trier par min_referrals décroissant
            $levels = ReferralLevel::orderBy('min_referrals', 'desc')->get();
            
            // Si aucun niveau n'est défini, utiliser des valeurs par défaut
            if ($levels->isEmpty()) {
                if ($referralCount >= 20) {
                    return 'DIAMANT';
                } elseif ($referralCount >= 10) {
                    return 'OR';
                } else {
                    return 'ARGENT';
                }
            }
            
            // Trouver le niveau approprié
            foreach ($levels as $level) {
                if ($referralCount >= $level->min_referrals) {
                    return $level->name;
                }
            }
            
            // Si aucun niveau ne correspond, utiliser le premier niveau avec le min_referrals le plus bas
            $lowestLevel = ReferralLevel::orderBy('min_referrals', 'asc')->first();
            return $lowestLevel ? $lowestLevel->name : 'ARGENT';
        } catch (\Exception $e) {
            // En cas d'erreur, utiliser les valeurs par défaut
            Log::error('Erreur lors de la détermination du niveau de parrainage: ' . $e->getMessage());
            $referralCount = $this->referrals()->count();
            
            if ($referralCount >= 20) {
                return 'DIAMANT';
            } elseif ($referralCount >= 10) {
                return 'OR';
            } else {
                return 'ARGENT';
            }
        }
    }

    /**
     * Get the next referral level name.
     */
    public function nextReferralLevel()
    {
        try {
            $currentLevel = $this->referralLevel();
            $referralCount = $this->referrals()->count();
            
            // Récupérer tous les niveaux et les trier par min_referrals
            $levels = ReferralLevel::orderBy('min_referrals', 'asc')->get();
            
            // Si aucun niveau n'est défini, utiliser des valeurs par défaut
            if ($levels->isEmpty()) {
                if ($currentLevel === 'DIAMANT') {
                    return null; // Already at highest level
                } elseif ($currentLevel === 'OR') {
                    return 'DIAMANT';
                } else {
                    return 'OR';
                }
            }
            
            // Trouver le niveau actuel et le prochain niveau
            $currentLevelObj = null;
            $nextLevelObj = null;
            
            // Trouver l'objet de niveau actuel
            foreach ($levels as $level) {
                if ($level->name === $currentLevel) {
                    $currentLevelObj = $level;
                    break;
                }
            }
            
            // S'il n'y a pas de correspondance exacte, utiliser le dernier niveau dont les referrals sont ≤ au count actuel
            if (!$currentLevelObj) {
                foreach ($levels as $level) {
                    if ($referralCount >= $level->min_referrals) {
                        $currentLevelObj = $level;
                    } else {
                        break;
                    }
                }
            }
            
            // Chercher le prochain niveau
            $foundCurrent = false;
            foreach ($levels as $level) {
                if ($foundCurrent) {
                    $nextLevelObj = $level;
                    break;
                }
                
                if ($currentLevelObj && $level->id === $currentLevelObj->id) {
                    $foundCurrent = true;
                }
            }
            
            return $nextLevelObj ? $nextLevelObj->name : null;
        } catch (\Exception $e) {
            // En cas d'erreur, utiliser les valeurs par défaut
            Log::error('Erreur lors de la détermination du prochain niveau de parrainage: ' . $e->getMessage());
            $currentLevel = $this->referralLevel();
            
            if ($currentLevel === 'DIAMANT') {
                return null; // Already at highest level
            } elseif ($currentLevel === 'OR') {
                return 'DIAMANT';
            } else {
                return 'OR';
            }
        }
    }

    /**
     * Calculate progress towards the next level as a percentage.
     */
    public function referralProgress()
    {
        try {
            $referralCount = $this->referrals()->count();
            $currentLevel = $this->referralLevel();
            $nextLevel = $this->nextReferralLevel();
            
            // Si pas de niveau suivant, c'est 100%
            if (!$nextLevel) {
                return 100;
            }
            
            // Récupérer les objets de niveau
            $currentLevelObj = ReferralLevel::where('name', $currentLevel)->first();
            $nextLevelObj = ReferralLevel::where('name', $nextLevel)->first();
            
            // Si les niveaux ne sont pas trouvés dans la base de données, utiliser la logique par défaut
            if (!$currentLevelObj || !$nextLevelObj) {
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
            
            // Calculer la progression
            $levelDifference = $nextLevelObj->min_referrals - $currentLevelObj->min_referrals;
            $userProgress = $referralCount - $currentLevelObj->min_referrals;
            
            if ($levelDifference <= 0) {
                return 100;
            }
            
            return min(100, ($userProgress / $levelDifference) * 100);
        } catch (\Exception $e) {
            // En cas d'erreur, utiliser les valeurs par défaut
            Log::error('Erreur lors du calcul de la progression de parrainage: ' . $e->getMessage());
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

    public function portfolioSections()
    {
        return $this->hasMany(PortfolioSection::class)->orderBy('order_index');
    }

    public function services()
    {
        return $this->hasMany(Service::class)->ordered();
    }

    /**
     * Get the sponsor of this user
     */
    public function sponsor()
    {
        return $this->belongsTo(User::class, 'sponsor_id');
    }

    /**
     * Get all users sponsored by this user
     */
    public function sponsored()
    {
        return $this->hasMany(User::class, 'sponsor_id');
    }

    /**
     * Checks if the user's sponsor code is still valid
     */
    public function hasSponsor()
    {
        return $this->sponsor_id 
            && $this->sponsor_expires_at 
            && now()->lt($this->sponsor_expires_at);
    }

    /**
     * Get the languages associated with the user.
     */
    public function languages()
    {
        return $this->belongsToMany(Language::class, 'user_languages', 'user_id', 'language_id')
            ->withPivot('language_level')
            ->withTimestamps();
    }

    /**
     * Get the companies/organizations this user belongs to.
     */
    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_members')
            ->withPivot('role', 'receive_notifications', 'joined_at')
            ->withTimestamps();
    }

    /**
     * Get the company memberships with pivot data.
     */
    public function companyMembers()
    {
        return $this->hasMany(CompanyMember::class);
    }

    /**
     * Check if user is APIDCA member.
     */
    public function isApidcaMember()
    {
        return $this->companies()
            ->where('partner_code', 'APIDCA')
            ->exists();
    }

    /**
     * Get job applications submitted by this user.
     */
    public function jobApplications()
    {
        return $this->hasMany(JobApplication::class);
    }

    /**
     * Get push notifications for this user.
     */
    public function pushNotifications()
    {
        return $this->hasMany(PushNotification::class);
    }

    /**
     * Get notification preferences for this user.
     */
    public function notificationPreferences()
    {
        return $this->hasOne(UserNotificationPreference::class);
    }

    /**
     * Get device tokens for push notifications.
     */
    public function deviceTokens()
    {
        return $this->hasMany(UserDeviceToken::class);
    }

    /**
     * Get messages sent by this user.
     */
    public function sentMessages()
    {
        return $this->hasMany(UserMessage::class, 'from_user_id');
    }

    /**
     * Get messages received by this user.
     */
    public function receivedMessages()
    {
        return $this->hasMany(UserMessage::class, 'to_user_id');
    }

    /**
     * Get all messages for this user (sent or received).
     */
    public function allMessages()
    {
        return UserMessage::where('from_user_id', $this->id)
            ->orWhere('to_user_id', $this->id);
    }

    /**
     * Get company reviews written by this user.
     */
    public function companyReviews()
    {
        return $this->hasMany(CompanyReview::class);
    }

    /**
     * Get or create notification preferences for this user.
     */
    public function getNotificationPreferences()
    {
        return $this->notificationPreferences()->firstOrCreate([
            'user_id' => $this->id
        ]);
    }

    /**
     * Check if user should receive job match notifications.
     */
    public function shouldReceiveJobMatches($type = 'email')
    {
        $preferences = $this->getNotificationPreferences();
        return $preferences->shouldReceiveJobMatches($type);
    }

    /**
     * Check if user should receive application update notifications.
     */
    public function shouldReceiveApplicationUpdates($type = 'email')
    {
        $preferences = $this->getNotificationPreferences();
        return $preferences->shouldReceiveApplicationUpdates($type);
    }

}
