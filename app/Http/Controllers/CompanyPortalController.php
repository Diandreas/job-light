<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use App\Enums\ProfileVisibility;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyPortalController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('CompanyPortal/Index', [
            'user' => $user,
        ]);
    }

    public function profiles(Request $request)
    {
        $search = $request->get('search');
        $profession = $request->get('profession');
        
        $query = User::whereHas('portfolioSettings', function ($query) {
            $query->whereIn('visibility', [
                ProfileVisibility::COMPANY_PORTAL->value,
                ProfileVisibility::PUBLIC->value
            ]);
        })->with([
            'portfolioSettings',
            'profession',
            'competences' => function($query) {
                $query->limit(3);
            }
        ]);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('full_profession', 'like', "%{$search}%");
            });
        }

        if ($profession) {
            $query->whereHas('profession', function($q) use ($profession) {
                $q->where('name', 'like', "%{$profession}%");
            });
        }

        $profiles = $query->paginate(12);

        return Inertia::render('CompanyPortal/Profiles', [
            'profiles' => $profiles,
            'filters' => [
                'search' => $search,
                'profession' => $profession,
            ]
        ]);
    }

    public function showProfile($identifier)
    {
        $user = User::where('username', $identifier)
            ->orWhere('email', $identifier)
            ->firstOrFail();

        $portfolioSettings = $user->portfolioSettings;
        
        if (!$portfolioSettings || 
            !in_array($portfolioSettings->visibility, [
                ProfileVisibility::COMPANY_PORTAL,
                ProfileVisibility::PUBLIC
            ])) {
            abort(403, 'Ce profil n\'est pas accessible aux entreprises.');
        }

        $portfolio = app(PortfolioController::class)->getPortfolioData($user);

        return Inertia::render('CompanyPortal/ProfileDetails', [
            'portfolio' => $portfolio,
            'user' => $user,
        ]);
    }
}
