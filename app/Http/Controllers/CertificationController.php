<?php

namespace App\Http\Controllers;

use App\Models\Certification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CertificationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'date_obtained' => 'nullable|date',
            'description' => 'nullable|string',
            'link' => 'nullable|url|max:255',
        ]);

        $certification = new Certification($validated);
        $certification->user_id = Auth::id();
        $certification->save();

        return response()->json([
            'success' => true,
            'certification' => $certification
        ]);
    }

    public function update(Request $request, Certification $certification)
    {
        if ($certification->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'institution' => 'required|string|max:255',
            'date_obtained' => 'nullable|date',
            'description' => 'nullable|string',
            'link' => 'nullable|url|max:255',
        ]);

        $certification->update($validated);

        return response()->json([
            'success' => true,
            'certification' => $certification
        ]);
    }

    public function destroy(Certification $certification)
    {
        if ($certification->user_id !== Auth::id()) {
            abort(403);
        }

        $certification->delete();

        return response()->json(['success' => true]);
    }
}
