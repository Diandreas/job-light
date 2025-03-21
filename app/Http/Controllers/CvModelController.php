<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCvModelRequest;
use App\Http\Requests\UpdateCvModelRequest;
use App\Models\CvModel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CvModelController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/CvModels/Index', [
            'cvModels' => CvModel::all(),
        ]);
    }
    public function userCvModels()
    {
        $user = auth()->user();
        $userCvModels = $user->cvModels;
        $availableCvModels = CvModel::whereNotIn('id', $userCvModels->pluck('id'))->get();

        return Inertia::render('CvInfos/CvModels/Index', [
            'userCvModels' => $userCvModels,
            'availableCvModels' => $availableCvModels,
        ]);
    }
    public function create()
    {
        return Inertia::render('Admin/CvModels/Create');
    }

    public function store(StoreCvModelRequest $request)
    {
        $cvModel = new CvModel();
        $cvModel->name = $request->name;
        $cvModel->description = $request->description;
        $cvModel->price = $request->price;

        if ($request->hasFile('previewImage')) {
            $imagePath = $request->file('previewImage')->store('cvModel_previews', 'public');
            $cvModel->previewImagePath = $imagePath;
        }

        // Créer le fichier blade avec un nom normalisé
        $viewName = Str::slug($request->name);
        $viewPath = 'cv-templates.' . $viewName; // Changement du chemin de la vue
        $bladeContent = $this->getDefaultBladeTemplate();

        // Créer le dossier s'il n'existe pas
        $directory = resource_path('views/cv-templates');
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }

        // Sauvegarder le fichier blade
        file_put_contents(
            resource_path('views/cv-templates/' . $viewName . '.blade.php'),
            $bladeContent
        );

        $cvModel->viewPath = $viewName; // Sauvegarder juste le nom de la vue
        $cvModel->save();

        return redirect()->route('cv-models.index')->with('success', 'CV Model créé avec succès.');
    }

    private function getDefaultBladeTemplate()
    {
        return <<<'BLADE'
@extends('layouts.cv')

@section('content')
<div class="cv-container">
    <header class="cv-header">
        <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
        <div class="contact-info">
            <p>Email: {{ $cvInformation['personalInformation']['email'] }}</p>
            <p>Téléphone: {{ $cvInformation['personalInformation']['phone'] }}</p>
            <p>Adresse: {{ $cvInformation['personalInformation']['address'] }}</p>
            @if($cvInformation['personalInformation']['linkedin'])
                <p>LinkedIn: {{ $cvInformation['personalInformation']['linkedin'] }}</p>
            @endif
            @if($cvInformation['personalInformation']['github'])
                <p>GitHub: {{ $cvInformation['personalInformation']['github'] }}</p>
            @endif
        </div>
    </header>

    @if(!empty($cvInformation['summaries']))
    <section class="summary">
        <h2>Résumé</h2>
        <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
    </section>
    @endif

    <div class="main-content">
        <div class="left-column">
            @foreach($experiencesByCategory as $category => $experiences)
            <section class="experiences">
                <h2>{{ $category }}</h2>
                @foreach($experiences as $experience)
                <div class="experience-item">
                    <h3>{{ $experience['title'] }}</h3>
                    <p class="company">{{ $experience['InstitutionName'] }}</p>
                    <p class="dates">{{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Present' }}</p>
                    <p class="description">{{ $experience['description'] }}</p>
                    @if($experience['output'])
                        <p class="achievements">{{ $experience['output'] }}</p>
                    @endif
                </div>
                @endforeach
            </section>
            @endforeach
        </div>

        <div class="right-column">
            @if(!empty($cvInformation['competences']))
            <section class="competences">
                <h2>Compétences</h2>
                <ul>
                    @foreach($cvInformation['competences'] as $competence)
                    <li>{{ $competence['name'] }}</li>
                    @endforeach
                </ul>
            </section>
            @endif

            @if(!empty($cvInformation['hobbies']))
            <section class="hobbies">
                <h2>Centres d'intérêt</h2>
                <ul>
                    @foreach($cvInformation['hobbies'] as $hobby)
                    <li>{{ $hobby['name'] }}</li>
                    @endforeach
                </ul>
            </section>
            @endif
        </div>
    </div>
</div>

<style>
    .cv-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm;
        font-family: Arial, sans-serif;
    }

    .cv-header {
        text-align: center;
        margin-bottom: 20px;
    }

    .main-content {
        display: flex;
        gap: 40px;
    }

    .left-column {
        flex: 2;
    }

    .right-column {
        flex: 1;
    }

    section {
        margin-bottom: 30px;
    }

    h1 {
        font-size: 24px;
        margin-bottom: 10px;
    }

    h2 {
        font-size: 18px;
        color: #2563eb;
        margin-bottom: 15px;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 5px;
    }

    .experience-item {
        margin-bottom: 20px;
    }

    .company {
        font-weight: bold;
        color: #4b5563;
    }

    .dates {
        color: #6b7280;
        font-size: 0.9em;
        margin: 5px 0;
    }

    ul {
        list-style: none;
        padding: 0;
    }

    li {
        margin-bottom: 8px;
    }

    @media print {
        .cv-container {
            padding: 0;
        }
    }
</style>
@endsection
BLADE;
    }



    public function generatePdf(Request $request)
    {
        $user = auth()->user();
        $cvModel = $user->selected_cv_model;

        if (!$cvModel) {
            return back()->with('error', 'Aucun modèle de CV sélectionné');
        }

        // Préparer les données pour la vue
        $data = $this->prepareCvData($user);

        // Générer le PDF
        $pdf = PDF::loadView('cv-models.' . str_slug($cvModel->name), $data);

        // Options PDF
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
            'isRemoteEnabled' => true,
            'defaultFont' => 'sans-serif',
        ]);

        // Télécharger le PDF
        return $pdf->download('cv.pdf');
    }

    private function prepareCvData($user)
    {
        return [
            'personalInfo' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone_number,
                'address' => $user->address,
                'linkedin' => $user->linkedin,
                'github' => $user->github,
            ],
            'summaries' => $user->summaries,
            'experiencesByCategory' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->get()
                ->groupBy('category_name'),
            'competences' => $user->competences,
            'hobbies' => $user->hobbies,
            'professions' => $user->profession,
        ];
    }
    public function show(CvModel $cvModel)
    {
        return Inertia::render('Admin/CvModels/Show', [
            'cvModel' => $cvModel,
        ]);
    }

    public function edit(CvModel $cvModel)
    {
        return Inertia::render('Admin/CvModels/Edit', [
            'cvModel' => $cvModel,
        ]);
    }

    public function update(Request $request, CvModel $cvModel)
    {
        try {
            // Validation basique
            $request->validate([
                'name' => 'required|string|max:45',
                'description' => 'required|string|max:255',
                'price' => 'required',
                'previewImage' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            // Traiter le nom du modèle
            $newName = Str::slug($request->name);
            $oldViewPath = $cvModel->viewPath;

            // Mise à jour des champs de base
            $cvModel->name = $request->name;
            $cvModel->description = $request->description;
            $cvModel->price = preg_replace('/[^0-9]/', '', $request->price);

            // Gestion de l'image
            if ($request->hasFile('previewImage')) {
                // Supprimer l'ancienne image si elle existe
                if ($cvModel->previewImagePath) {
                    Storage::disk('public')->delete($cvModel->previewImagePath);
                }

                // Stocker la nouvelle image
                $imagePath = $request->file('previewImage')
                    ->store('cvModel_previews', 'public');
                $cvModel->previewImagePath = $imagePath;
            }

            // Gérer le template Blade
            if ($oldViewPath !== $newName) {
                $oldBladePath = resource_path("views/cv-templates/{$oldViewPath}.blade.php");
                $newBladePath = resource_path("views/cv-templates/{$newName}.blade.php");

                // Renommer le fichier s'il existe, sinon créer un nouveau
                if (file_exists($oldBladePath)) {
                    rename($oldBladePath, $newBladePath);
                } else {
                    file_put_contents($newBladePath, $this->getDefaultBladeTemplate());
                }

                $cvModel->viewPath = $newName;
            }

            $cvModel->save();

            return redirect()
                ->route('cv-models.index')
                ->with('success', 'Le modèle de CV a été mis à jour avec succès.');

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la mise à jour du modèle CV: ' . $e->getMessage());

            return back()
                ->withInput()
                ->with('error', 'Une erreur est survenue lors de la mise à jour du modèle.');
        }
    }

    public function destroy(CvModel $cvModel)
    {
        // Supprimer l'image de prévisualisation
        if ($cvModel->previewImagePath) {
            Storage::disk('public')->delete($cvModel->previewImagePath);
        }

        // Supprimer le fichier dans le dossier cvgallery
        if ($cvModel->viewPath) {
            Storage::disk('public')->delete($cvModel->viewPath);
        }

        $cvModel->delete();

        return response()->json(['message' => 'CV Model deleted successfully']);
    }
    public function selectActiveModel(Request $request)
    {
        $user = auth()->user();
        $user->selected_cv_model_id = $request->cv_model_id;
        $user->save();

        return response()->json(['message' => 'Active CV model updated successfully']);
    }

    public function addCvModel(Request $request)
    {
        $user = auth()->user();
        $user->cvModels()->attach($request->cv_model_id);

        return response()->json(['message' => 'CV model added successfully']);
    }

}
