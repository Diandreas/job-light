<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReferralLevel;
use Inertia\Inertia;

class ReferralLevelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $levels = ReferralLevel::orderBy('min_referrals', 'asc')->get();
        
        return Inertia::render('Admin/ReferralLevels/Index', [
            'levels' => $levels
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/ReferralLevels/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:referral_levels',
            'min_referrals' => 'required|integer|min:0',
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);
        
        ReferralLevel::create($validated);
        
        return redirect()->route('admin.referral-levels.index')
            ->with('success', 'Niveau de parrainage créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $level = ReferralLevel::findOrFail($id);
        
        return Inertia::render('Admin/ReferralLevels/Show', [
            'level' => $level
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $level = ReferralLevel::findOrFail($id);
        
        return Inertia::render('Admin/ReferralLevels/Edit', [
            'level' => $level
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $level = ReferralLevel::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:referral_levels,name,' . $id,
            'min_referrals' => 'required|integer|min:0',
            'commission_rate' => 'required|numeric|min:0|max:100',
        ]);
        
        $level->update($validated);
        
        return redirect()->route('admin.referral-levels.index')
            ->with('success', 'Niveau de parrainage mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $level = ReferralLevel::findOrFail($id);
        
        // Vérifier si c'est le dernier niveau
        if (ReferralLevel::count() <= 1) {
            return redirect()->route('admin.referral-levels.index')
                ->with('error', 'Impossible de supprimer le dernier niveau de parrainage.');
        }
        
        $level->delete();
        
        return redirect()->route('admin.referral-levels.index')
            ->with('success', 'Niveau de parrainage supprimé avec succès.');
    }

    /**
     * Initialize default referral levels.
     */
    public function initialize()
    {
        // Vérifier si des niveaux existent déjà
        $existingLevels = ReferralLevel::count();
        
        if ($existingLevels > 0) {
            // Supprimer les niveaux existants
            ReferralLevel::truncate();
        }

        // Définir les niveaux par défaut
        $levels = [
            [
                'name' => 'ARGENT',
                'min_referrals' => 0,
                'commission_rate' => 10.00,
            ],
            [
                'name' => 'OR',
                'min_referrals' => 10,
                'commission_rate' => 15.00,
            ],
            [
                'name' => 'DIAMANT',
                'min_referrals' => 20,
                'commission_rate' => 20.00,
            ],
        ];

        // Insérer les niveaux
        foreach ($levels as $level) {
            ReferralLevel::create($level);
        }

        return redirect()->route('admin.referral-levels.index')
            ->with('success', 'Niveaux de parrainage initialisés avec succès.');
    }
}
