<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ReferralCode;
use App\Models\Referral;
use App\Models\ReferralEarning;

class SponsorshipController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Sponsorship/Index', [
            'referralCode' => $user->referralCode->code ?? 'N/A',
            'referralCount' => $user->referrals()->count(),
            'earnings' => $user->referralEarnings()->sum('amount'),
            'referrals' => $user->referrals()->with('referred')->get(),
            'level' => $user->referralLevel(),
        ]);
    }

    public function generateInvitation(Request $request)
    {
        $user = $request->user();
        // Logique pour générer un nouveau lien d'invitation si nécessaire
        return response()->json(['invitationLink' => $user->referralCode->code]);
    }

    public function getProgress(Request $request)
    {
        $user = $request->user();
        // Logique pour calculer la progression
        return response()->json([
            'currentLevel' => $user->referralLevel(),
            'nextLevel' => $user->nextReferralLevel(),
            'progress' => $user->referralProgress(),
        ]);
    }

    public function submitSupportTicket(Request $request)
    {
        // Logique pour soumettre un ticket de support
        return response()->json(['message' => 'Ticket submitted successfully']);
    }
}
