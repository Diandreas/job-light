<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CvInfo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class CvColorController extends Controller
{
    /**
     * Met à jour la couleur primaire du CV de l'utilisateur
     */
    public function updateColor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'primary_color' => 'required|string|regex:/^#([A-Fa-f0-9]{6})$/', // Valider format hexadécimal
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Couleur invalide. Veuillez fournir une couleur hexadécimale valide.',
                'errors' => $validator->errors()
            ], 400);
        }

        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        // Mettre à jour la couleur primaire directement sur l'utilisateur
        $user->primary_color = $request->primary_color;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Couleur du CV mise à jour avec succès',
            'data' => [
                'primary_color' => $user->primary_color
            ]
        ]);
    }

    /**
     * Réinitialise la couleur du CV à la valeur par défaut
     */
    public function resetColor()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        // Réinitialiser à null pour utiliser la couleur par défaut
        $user->primary_color = null;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Couleur du CV réinitialisée à la valeur par défaut',
            'data' => [
                'primary_color' => '#3498db' // Couleur par défaut
            ]
        ]);
    }

    /**
     * Récupère la couleur actuelle de l'utilisateur
     */
    public function getCurrentColor()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'primary_color' => $user->primary_color ?? '#3498db',
                'has_custom_color' => !is_null($user->primary_color)
            ]
        ]);
    }
}
