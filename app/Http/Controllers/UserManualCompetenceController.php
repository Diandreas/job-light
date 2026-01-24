<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserManualCompetenceController extends Controller
{
    /**
     * Ajoute une compétence manuelle à l'utilisateur
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'competence' => 'required|array',
            'competence.id' => 'required|string',
            'competence.name' => 'required|string|max:255',
            'competence.name_en' => 'nullable|string|max:255',
            'competence.description' => 'nullable|string',
            'competence.level' => 'nullable|string|max:100',
        ]);

        // Vérification que l'utilisateur modifie son propre profil
        if (Auth::id() != $request->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($request->user_id);
        $manualCompetences = $user->manual_competences ?? [];
        
        // Ajouter la nouvelle compétence
        $manualCompetences[] = [
            'id' => $request->competence['id'],
            'name' => $request->competence['name'],
            'name_en' => $request->competence['name_en'] ?? $request->competence['name'],
            'description' => $request->competence['description'] ?? '',
            'level' => $request->competence['level'] ?? 'Intermédiaire',
            'is_manual' => true
        ];
        
        // Mettre à jour l'utilisateur
        $user->manual_competences = $manualCompetences;
        $user->save();
        
        return response()->json(['message' => 'Compétence manuelle ajoutée avec succès']);
    }

    /**
     * Supprime une compétence manuelle de l'utilisateur
     */
    public function destroy($userId, $competenceId)
    {
        // Vérification que l'utilisateur modifie son propre profil
        if (Auth::id() != $userId) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($userId);
        $manualCompetences = $user->manual_competences ?? [];
        
        // Filtrer pour retirer la compétence avec l'ID spécifié
        $manualCompetences = array_filter($manualCompetences, function($competence) use ($competenceId) {
            return $competence['id'] !== $competenceId;
        });
        
        // Remettre les indices du tableau
        $manualCompetences = array_values($manualCompetences);
        
        // Mettre à jour l'utilisateur
        $user->manual_competences = $manualCompetences;
        $user->save();
        
        return response()->json(['message' => 'Compétence manuelle supprimée avec succès']);
    }

    /**
     * Met à jour toutes les compétences manuelles de l'utilisateur
     */
    public function updateAll(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'manual_competences' => 'required|array',
        ]);

        // Vérification que l'utilisateur modifie son propre profil
        if (Auth::id() != $request->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($request->user_id);
        
        // Mettre à jour les compétences manuelles
        $user->manual_competences = $request->manual_competences;
        $user->save();
        
        return response()->json(['message' => 'Compétences manuelles mises à jour avec succès']);
    }
}
