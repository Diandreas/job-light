<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserManualHobbyController extends Controller
{
    /**
     * Ajoute un hobby manuel à l'utilisateur
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'hobby' => 'required|array',
            'hobby.id' => 'required|string',
            'hobby.name' => 'required|string|max:255',
            'hobby.name_en' => 'nullable|string|max:255',
        ]);

        // Vérification que l'utilisateur modifie son propre profil
        if (Auth::id() != $request->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($request->user_id);
        $manualHobbies = $user->manual_hobbies ?? [];
        
        // Ajouter le nouveau hobby
        $manualHobbies[] = [
            'id' => $request->hobby['id'],
            'name' => $request->hobby['name'],
            'name_en' => $request->hobby['name_en'] ?? $request->hobby['name'],
            'is_manual' => true
        ];
        
        // Mettre à jour l'utilisateur
        $user->manual_hobbies = $manualHobbies;
        $user->save();
        
        return response()->json(['message' => 'Hobby manuel ajouté avec succès']);
    }

    /**
     * Supprime un hobby manuel de l'utilisateur
     */
    public function destroy($userId, $hobbyId)
    {
        // Vérification que l'utilisateur modifie son propre profil
        if (Auth::id() != $userId) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($userId);
        $manualHobbies = $user->manual_hobbies ?? [];
        
        // Filtrer pour retirer le hobby avec l'ID spécifié
        $manualHobbies = array_filter($manualHobbies, function($hobby) use ($hobbyId) {
            return $hobby['id'] !== $hobbyId;
        });
        
        // Remettre les indices du tableau
        $manualHobbies = array_values($manualHobbies);
        
        // Mettre à jour l'utilisateur
        $user->manual_hobbies = $manualHobbies;
        $user->save();
        
        return response()->json(['message' => 'Hobby manuel supprimé avec succès']);
    }
}
