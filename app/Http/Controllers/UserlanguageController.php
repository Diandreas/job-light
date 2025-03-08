<?php
// app/Http/Controllers/UserlanguageController.php

namespace App\Http\Controllers;

use App\Models\language;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserlanguageController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $availablelanguages = language::all();
        $user_languages = $user->languages;

        return Inertia::render('CvInfos/languages/Index', [
            'user_languages' => $user_languages,
            'availablelanguages' => $availablelanguages,
        ]);
    }

    public function create()
    {
        $availablelanguages = language::all();
        return Inertia::render('CvInfos/languages/Create', [
            'availablelanguages' => $availablelanguages,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'language_id' => 'required|exists:languages,id',
        ]);

        $user = auth()->user();
        $language = language::find($request->language_id);

        $user->languages()->attach($language);

        return redirect()->route('user-languages.index')->with('success', 'language assigned successfully!');
    }

    public function destroy($user_id, $language_id)
    {
        $user = User::findOrFail($user_id);
        $language = language::findOrFail($language_id);

        if ($user->id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $user->languages()->detach($language);

        return response()->json(['message' => 'language de-assigned successfully!']);
    }
}
