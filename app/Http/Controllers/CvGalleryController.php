<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Model; // Assurez-vous d'avoir le modèle Model correspondant

class CvGalleryController extends Controller
{
    public function index()
    {
        // Logique pour récupérer les modèles de CV disponibles (par exemple, depuis la base de données)
        $models = Model::all();

        return Inertia::render('CvGallery/Index', [
            'models' => $models,
        ]);
    }

    public function show($modelViewPath) // Utilisation du viewPath comme paramètre
    {
        // Vérification si le modèle existe (optionnel, mais recommandé)
        $model = Model::where('viewPath', $modelViewPath)->firstOrFail();

        // Passer les données nécessaires à la vue (par exemple, le contenu du modèle, les informations de l'utilisateur, etc.)
        return Inertia::render("CvGallery/{$modelViewPath}", [
            'model' => $model,
            // ... autres données
        ]);
    }
}
