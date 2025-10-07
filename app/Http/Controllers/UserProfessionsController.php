<?php

namespace App\Http\Controllers;
use App\Models\Profession;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserProfessionsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $userProfession = null;

        if ($user->profession_id) {
            $userProfession = $user->profession;
        }

        return Inertia::render('CvInfos/Professions/Index', [
            'user_profession' => $userProfession,
            'full_profession' => $user->full_profession
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $availableProfessions = Profession::all();

        return Inertia::render('CvInfos/Professions/Create', [
            'availableProfessions' => $availableProfessions,
            'user_profession' => $user->profession,
            'full_profession' => $user->full_profession,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'profession_id' => ['nullable', 'exists:professions,id'],
            'full_profession' => ['nullable', 'string', 'max:255'],
        ]);

        if (!$request->profession_id && !$request->full_profession) {
            return response()->json([
                'message' => 'Vous devez sélectionner une formation ou en saisir une manuellement.'
            ], 422);
        }

        $user = auth()->user();

        // Si une profession est sélectionnée dans la liste
        if ($request->profession_id) {
            $user->update([
                'profession_id' => $request->profession_id,
                'full_profession' => null // Reset manual profession
            ]);
        }
        // Si une profession est saisie manuellement
        else if ($request->full_profession) {
            $user->update([
                'profession_id' => null, // Reset selected profession
                'full_profession' => $request->full_profession
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profession assigned successfully!'
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->id !== auth()->id()) {
            abort(403);
        }

        $user->update([
            'profession_id' => null,
            'full_profession' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profession supprimée avec succès!'
        ]);
    }
}
