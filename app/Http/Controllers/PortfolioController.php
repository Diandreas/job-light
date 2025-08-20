<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PortfolioSettings;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortfolioController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        return Inertia::render('Portfolio/Index', [
            'auth' => [
                'user' => $user
            ]
        ]);
    }

    public function show($identifier)
    {
        $user = User::where('username', $identifier)
            ->orWhere('email', $identifier)
            ->firstOrFail();

        $portfolioSettings = $user->portfolioSettings;
        $currentUser = auth()->user();
        $isCompany = auth()->guard('company')->check();

        if ($portfolioSettings) {
            $visibility = $portfolioSettings->visibility;

            if ($visibility === \App\Enums\ProfileVisibility::PRIVATE) {
                if (!$currentUser || $currentUser->id !== $user->id) {
                    abort(403, 'Ce profil est privé.');
                }
            } elseif ($visibility === \App\Enums\ProfileVisibility::COMPANY_PORTAL) {
                if (!$isCompany && (!$currentUser || $currentUser->id !== $user->id)) {
                    abort(403, 'Ce profil est accessible uniquement aux entreprises.');
                }
            } elseif ($visibility === \App\Enums\ProfileVisibility::COMMUNITY) {
                if (!$currentUser && !$isCompany) {
                    abort(403, 'Ce profil est accessible uniquement aux membres de la communauté.');
                }
            }
        }

        $portfolio = $this->getPortfolioData($user);

        return Inertia::render('Portfolio/Show', [
            'portfolio' => $portfolio,
            'identifier' => $user->username ?? $user->email,
        ]);
    }

    public function edit()
    {
        $user = auth()->user();
        $portfolio = $this->getPortfolioData($user);
        $settings = $user->portfolioSettings ?? new PortfolioSettings();

        return Inertia::render('Portfolio/Edit', [
            'portfolio' => $portfolio,
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        // Validation...
        $request->validate([
            'layout' => 'required|in:intuitive,professional,user-friendly,creative,modern',
            'show_experiences' => 'boolean',
            'show_competences' => 'boolean',
            'show_hobbies' => 'boolean',
            'visibility' => 'required|in:private,company_portal,community,public',
            'profile_picture' => 'nullable|image|max:1024', // 1MB Max
        ]);

        // Update portfolio settings
        $user->portfolioSettings()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only([
                'layout',
                'show_experiences',
                'show_competences',
                'show_hobbies',
                'visibility',
            ])
        );

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->update(['photo' => $path]);
        }

        return redirect()->route('portfolio.edit')->with('success', 'Portfolio mis à jour avec succès.');
    }


    private function createDefaultSettings($user)
    {
        return $user->portfolioSettings()->create([
            'layout' => 'professional',
            'show_experiences' => true,
            'show_competences' => true,
            'show_hobbies' => true,
            'visibility' => 'private',
        ]);
    }

    public function getPortfolioData($user)
    {
        $settings = $user->portfolioSettings ?? $this->createDefaultSettings($user);

        return [
            'personalInfo' => [
                'id' => $user->id,
                'name' => $user->name,
                'title' => $user->full_profession ?? 'Professionnel',
                'email' => $user->email,
                'username' => $user->username,
                'phone' => $user->phone_number,
                'address' => $user->address,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'profile_picture' => $user->photo ? Storage::url($user->photo) : null,
            ],
            'experiences' => $settings->show_experiences ? $user->experiences()
                ->leftJoin('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->leftJoin('attachments', 'experiences.attachment_id', '=', 'attachments.id')
                ->select('experiences.*',
                    'experience_categories.name as category_name',
                    'experience_categories.ranking as category_ranking',
                    'attachments.name as attachment_name',
                    'attachments.path as attachment_path',
                    'attachments.format as attachment_format',
                    'attachments.size as attachment_size')
                ->orderBy('experience_categories.ranking', 'asc')
                ->orderBy('experiences.created_at', 'desc')
                ->get()
                ->map(function ($experience) {
                    $experience->attachment_path = $experience->attachment_path ? Storage::url($experience->attachment_path) : null;
                    $experience->category_name = $experience->category_name ?? 'Expérience';
                    return $experience;
                })
                ->toArray() : [],
            'competences' => $settings->show_competences ? $user->competences()->take(3)->get()->toArray() : [],
            'hobbies' => $settings->show_hobbies ? $user->hobbies()->take(3)->get()->toArray() : [],
            'summary' => [
                'description' => 'Passionné par mon domaine, je mets mes compétences au service de projets innovants et challengeants.'
            ],
            'professions' => $user->profession()->take(2)->get()->toArray(),
            'design' => $settings->layout ?? 'professional',
            'show_contact_info' => true,
            'show_experiences' => $settings->show_experiences,
            'show_competences' => $settings->show_competences,
            'show_hobbies' => $settings->show_hobbies,
            'show_summary' => true,
            'visibility' => $settings->visibility,
        ];
    }
}
