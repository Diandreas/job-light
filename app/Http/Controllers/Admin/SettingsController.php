<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:access-admin');
    }

    public function index()
    {
        $settings = SystemSettings::all()->keyBy('key');

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($validated['settings'] as $setting) {
            SystemSettings::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']]
            );
        }

        return back()->with('success', 'Paramètres mis à jour avec succès.');
    }
}