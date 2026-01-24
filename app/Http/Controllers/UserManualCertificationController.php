<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserManualCertificationController extends Controller
{
    /**
     * Ajoute une certification manuelle à l'utilisateur
     */
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'certification' => 'required|array',
            'certification.id' => 'required|string',
            'certification.name' => 'required|string|max:255',
            'certification.institution' => 'nullable|string|max:255',
            'certification.date' => 'nullable|string',
            'certification.description' => 'nullable|string',
        ]);

        // Vérification que l'utilisateur modifie son propre profil
        if (Auth::id() != $request->user_id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($request->user_id);
        $manualCertifications = $user->manual_certifications ?? [];
        
        // Ajouter la nouvelle certification
        $manualCertifications[] = [
            'id' => $request->certification['id'],
            'name' => $request->certification['name'],
            'institution' => $request->certification['institution'] ?? '',
            'date' => $request->certification['date'] ?? '',
            'description' => $request->certification['description'] ?? '',
        ];
        
        // Mettre à jour l'utilisateur
        $user->manual_certifications = $manualCertifications;
        $user->save();
        
        return response()->json(['message' => 'Certification ajoutée avec succès']);
    }

    /**
     * Supprime une certification manuelle de l'utilisateur
     */
    public function destroy($userId, $certificationId)
    {
        // Vérification que l'utilisateur modifie son propre profil
        if (Auth::id() != $userId) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $user = User::findOrFail($userId);
        $manualCertifications = $user->manual_certifications ?? [];
        
        // Filtrer pour retirer la certification avec l'ID spécifié
        $manualCertifications = array_filter($manualCertifications, function($cert) use ($certificationId) {
            return $cert['id'] !== $certificationId;
        });
        
        // Remettre les indices du tableau
        $manualCertifications = array_values($manualCertifications);
        
        // Mettre à jour l'utilisateur
        $user->manual_certifications = $manualCertifications;
        $user->save();
        
        return response()->json(['message' => 'Certification supprimée avec succès']);
    }
}
