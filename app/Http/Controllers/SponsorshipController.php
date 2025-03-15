<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ReferralCode;
use App\Models\Referral;
use App\Models\ReferralEarning;
use App\Models\ReferralLevel;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SponsorshipController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Generate a referral code if the user doesn't have one
        if (!$user->referralCode) {
            $this->createReferralCode($user);
        }

        // Get all referrals with referred user details
        $referrals = $user->referrals()->with('referred')->get();

        // Calculate total earnings
        $earnings = $user->referralEarnings()->sum('amount');

        // Check if code is expired or about to expire
        $expirationInfo = null;
        
        if ($user->referralCode && $user->referralCode->expires_at) {
            $expirationInfo = [
                'expires_at' => $user->referralCode->expires_at->format('Y-m-d'),
                'is_expired' => $user->referralCode->isExpired(),
                'days_left' => now()->diffInDays($user->referralCode->expires_at, false),
                'is_active' => $user->referralCode->is_active && !$user->referralCode->isExpired()
            ];
        }

        return Inertia::render('Sponsorship/Index', [
            'referralCode' => $user->referralCode->code ?? 'N/A',
            'referralCount' => $referrals->count(),
            'earnings' => $earnings,
            'referrals' => $referrals,
            'level' => $user->referralLevel(),
            'expirationInfo' => $expirationInfo
        ]);
    }

    public function generateInvitation(Request $request)
    {
        $user = $request->user();

        // Generate a referral code if the user doesn't have one
        if (!$user->referralCode) {
            $this->createReferralCode($user);
        }

        return response()->json(['invitationLink' => $user->referralCode->code]);
    }

    public function getProgress(Request $request)
    {
        $user = $request->user();

        // Get the referral levels from the database
        $currentLevel = $user->referralLevel();
        $nextLevel = $user->nextReferralLevel();

        // Calculate progress percentage towards next level
        $progress = $user->referralProgress();

        return response()->json([
            'currentLevel' => $currentLevel,
            'nextLevel' => $nextLevel,
            'progress' => $progress,
        ]);
    }

    public function submitSupportTicket(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        // Here you would typically save the support ticket to a database
        // For now, we'll just log it
        Log::info('Support ticket submitted', [
            'user_id' => $request->user()->id,
            'message' => $validated['message']
        ]);

        return response()->json(['message' => 'Ticket submitted successfully']);
    }

    /**
     * Process a referral when a user registers using a referral code
     */
    public function processReferral($referralCode, $newUser)
    {
        try {
            // Find the referral code
            $code = ReferralCode::where('code', $referralCode)->first();

            if (!$code) {
                Log::warning('Invalid referral code used during registration', [
                    'code' => $referralCode,
                    'new_user_id' => $newUser->id
                ]);
                return false;
            }
            
            // Vérifier si le code est actif et non expiré
            if (!$code->isValid()) {
                Log::warning('Expired or inactive referral code used during registration', [
                    'code' => $referralCode,
                    'new_user_id' => $newUser->id,
                    'is_active' => $code->is_active,
                    'expires_at' => $code->expires_at,
                ]);
                return false;
            }

            // Create a new referral record
            $referral = Referral::create([
                'referrer_id' => $code->user_id,
                'referred_id' => $newUser->id,
                'referred_at' => now(),
            ]);

            // Calculate commission based on the referrer's level
            $referrer = User::find($code->user_id);
            $level = $referrer->referralLevel();

            // Get commission rate based on level
            $commissionRate = $this->getCommissionRate($level);

            // For demonstration, let's give a fixed amount for each referral signup
            // In a real application, this might be a percentage of a purchase
            $baseAmount = 500; // FCFA
            $commissionAmount = $baseAmount * ($commissionRate / 100);

            // Create earnings record
            ReferralEarning::create([
                'user_id' => $code->user_id,
                'referral_id' => $referral->id,
                'amount' => $commissionAmount,
                'status' => 'paid', // Setting as paid directly since we're processing immediately
            ]);

            // Immediately award the commission to the referrer
            DB::transaction(function () use ($code, $commissionAmount) {
                $referrer = User::find($code->user_id);
                $referrer->wallet_balance += $commissionAmount;
                $referrer->save();
            });

            Log::info('Referral processed successfully', [
                'referrer_id' => $code->user_id,
                'referred_id' => $newUser->id,
                'commission_amount' => $commissionAmount
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error processing referral', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'referral_code' => $referralCode,
                'new_user_id' => $newUser->id
            ]);

            return false;
        }
    }

    /**
     * Award commission to a referrer when their referral makes a purchase
     */
    public function processReferralCommission($user, $amount)
    {
        try {
            // Check if the user was referred by someone
            $referral = Referral::where('referred_id', $user->id)->first();

            if (!$referral) {
                return false; // User wasn't referred
            }

            // Get the referrer
            $referrer = User::find($referral->referrer_id);

            if (!$referrer) {
                Log::error('Referrer not found', [
                    'referrer_id' => $referral->referrer_id,
                    'referred_id' => $user->id
                ]);
                return false;
            }

            // Calculate commission based on the referrer's level
            $level = $referrer->referralLevel();
            $commissionRate = $this->getCommissionRate($level);

            // Calculate commission amount based on purchase amount
            $commissionAmount = $amount * ($commissionRate / 100);

            // Create earnings record
            $earning = ReferralEarning::create([
                'user_id' => $referrer->id,
                'referral_id' => $referral->id,
                'amount' => $commissionAmount,
                'status' => 'paid', // Setting as paid directly since we're processing immediately
            ]);

            // Immediately award the commission to the referrer
            DB::transaction(function () use ($referrer, $commissionAmount) {
                $referrer->wallet_balance += $commissionAmount;
                $referrer->save();
            });

            Log::info('Referral commission processed for purchase', [
                'referrer_id' => $referrer->id,
                'referred_id' => $user->id,
                'purchase_amount' => $amount,
                'commission_amount' => $commissionAmount,
                'commission_rate' => $commissionRate
            ]);

            return $commissionAmount;
        } catch (\Exception $e) {
            Log::error('Error processing referral commission', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id,
                'purchase_amount' => $amount
            ]);

            return false;
        }
    }

    /**
     * Get the commission rate based on the referral level
     */
    private function getCommissionRate($level)
    {
        try {
            // Chercher le niveau dans la base de données
            $levelObj = ReferralLevel::where('name', $level)->first();
            
            // Si le niveau est trouvé, retourner son taux de commission
            if ($levelObj) {
                return $levelObj->commission_rate;
            }
            
            // Sinon, utiliser les valeurs par défaut
            $rates = [
                'ARGENT' => 10,
                'OR' => 15,
                'DIAMANT' => 20,
            ];
            
            return $rates[$level] ?? 10; // Default to 10% if level not found
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération du taux de commission: ' . $e->getMessage());
            return 10; // Default to 10% in case of error
        }
    }

    /**
     * Create a referral code for a user
     */
    private function createReferralCode($user)
    {
        // Generate a unique referral code
        $code = strtoupper(Str::random(8));

        // Ensure the code is unique
        while (ReferralCode::where('code', $code)->exists()) {
            $code = strtoupper(Str::random(8));
        }

        // Set expiration date to one month from now
        $expiresAt = now()->addMonth();

        // Create the referral code
        ReferralCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => $expiresAt,
            'is_active' => true
        ]);

        return $code;
    }
    
    /**
     * Renew the referral code for a user or apply a new sponsor code
     */
    public function renewReferralCode(Request $request)
    {
        $user = $request->user();
        $newSponsorCode = $request->input('new_sponsor_code');
        
        try {
            DB::transaction(function () use ($user, $newSponsorCode) {
                if ($newSponsorCode) {
                    // L'utilisateur veut utiliser un nouveau code de parrainage
                    $sponsorCode = ReferralCode::where('code', $newSponsorCode)
                        ->where('is_active', true)
                        ->where(function($query) {
                            $query->whereNull('expires_at')
                                  ->orWhere('expires_at', '>', now());
                        })
                        ->first();
                    
                    if (!$sponsorCode) {
                        throw new \Exception('Le code de parrainage saisi est invalide ou expiré.');
                    }
                    
                    if ($sponsorCode->user_id === $user->id) {
                        throw new \Exception('Vous ne pouvez pas utiliser votre propre code de parrainage.');
                    }
                    
                    // Enregistrer le nouveau sponsor
                    $user->sponsor_id = $sponsorCode->user_id;
                    $user->sponsor_code = $newSponsorCode;
                    $user->sponsor_expires_at = now()->addDays(30);
                    $user->save();
                    
                    // Créer ou mettre à jour l'enregistrement de référence
                    Referral::updateOrCreate(
                        ['referred_id' => $user->id],
                        [
                            'referrer_id' => $sponsorCode->user_id,
                            'referred_at' => now()
                        ]
                    );
                    
                } else {
                    // Renouveler le même code pour 30 jours supplémentaires
                    $user->sponsor_expires_at = now()->addDays(30);
                    $user->save();
                }
                
                // S'assurer que le code de parrainage de l'utilisateur est toujours actif
                if ($user->referralCode) {
                    $user->referralCode->update([
                        'expires_at' => now()->addMonth(),
                        'is_active' => true
                    ]);
                }
            });
            
            return response()->json([
                'success' => true,
                'message' => $newSponsorCode 
                    ? 'Nouveau code de parrainage appliqué avec succès.'
                    : 'Code de parrainage renouvelé avec succès.',
                'expires_at' => $user->sponsor_expires_at ? $user->sponsor_expires_at->format('Y-m-d H:i:s') : null,
                'sponsor_code' => $user->sponsor_code
            ]);
            
        } catch (\Exception $e) {
            Log::error('Erreur lors du renouvellement du code de parrainage', [
                'error' => $e->getMessage(),
                'user_id' => $user->id
            ]);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Une erreur est survenue lors du renouvellement du code.'
            ], 500);
        }
    }

    /**
     * Get referral code information for the current user
     */
    public function getReferralCodeInfo(Request $request)
    {
        $user = $request->user();
        
        // Vérifier si l'utilisateur a un sponsor
        $sponsorInfo = null;
        if ($user->sponsor_code && $user->sponsor_expires_at) {
            $sponsorInfo = [
                'sponsor_code' => $user->sponsor_code,
                'expires_at' => $user->sponsor_expires_at->format('Y-m-d'),
                'is_expired' => now()->gt($user->sponsor_expires_at),
                'days_left' => now()->diffInDays($user->sponsor_expires_at, false),
                'sponsor_name' => User::find($user->sponsor_id)->name ?? 'Sponsor'
            ];
        }
        
        // Vérifier si l'utilisateur a son propre code de parrainage
        $ownReferralCode = null;
        if ($user->referralCode) {
            $ownReferralCode = [
                'code' => $user->referralCode->code,
                'expires_at' => $user->referralCode->expires_at ? $user->referralCode->expires_at->format('Y-m-d') : null,
                'is_active' => $user->referralCode->is_active && 
                              ($user->referralCode->expires_at ? now()->lt($user->referralCode->expires_at) : true)
            ];
        }
        
        return response()->json([
            'success' => true,
            'sponsorInfo' => $sponsorInfo,
            'ownReferralCode' => $ownReferralCode
        ]);
    }
}
