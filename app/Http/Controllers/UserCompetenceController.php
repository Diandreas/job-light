<?php

namespace App\Http\Controllers;

use App\Models\Competence;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserCompetenceController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $availableCompetences = Competence::all();
        $userCompetences = $user->competences;

        return Inertia::render('CvInfos/Competences/Index', [
            'auth' => [
                'user' => [
                    'id' => $user->id
                ]
            ],
            'availableCompetences' => $availableCompetences,
            'initialUserCompetences' => $userCompetences,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'competence_id' => 'required|exists:competences,id',
        ]);

        $user = auth()->user();

        // Vérifier si la compétence n'est pas déjà attachée
        if (!$user->competences()->where('competence_id', $request->competence_id)->exists()) {
            $competence = Competence::findOrFail($request->competence_id);
            $user->competences()->attach($competence);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Competence ajoutée avec succès',
                    'competence' => $competence
                ]);
            }

            return redirect()->route('user-competences.index')
                ->with('success', 'Compétence ajoutée avec succès!');
        }

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Cette compétence est déjà attribuée'
            ], 422);
        }

        return redirect()->route('user-competences.index')
            ->with('error', 'Cette compétence est déjà attribuée');
    }

    public function destroy($userId, $competenceId)
    {
        $user = auth()->user();

        // Vérifier si l'utilisateur essaie de modifier ses propres compétences
        if ($user->id != $userId) {
            return response()->json([
                'message' => 'Action non autorisée'
            ], 403);
        }

        $competence = Competence::findOrFail($competenceId);
        $user->competences()->detach($competence);

        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Compétence supprimée avec succès'
            ]);
        }

        return redirect()->route('user-competences.index')
            ->with('success', 'Compétence supprimée avec succès!');
    }
}
