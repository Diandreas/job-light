<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCvInfoRequest;
use App\Http\Requests\UpdateCvInfoRequest;
use App\Models\CvInfo;
use App\Models\Address;
use App\Models\CvModel;
use App\Models\ExperienceCategory;
use App\Models\Profession;
use App\Models\Competence;
use App\Models\Hobby;
use App\Models\Summary;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CvInfosController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $availableCompetences = Competence::all();
        $myProfession=  $user->profession;
        $availableHobbies = Hobby::all();
        $availableProfessions = Profession::all();
        $availableSummaries = $user->summary()->get();
        $experienceCategories = ExperienceCategory::all();

        $cvInformation = [
            'hobbies' => $user->hobbies()->get()->toArray(),
            'competences' => $user->competences()->get()->toArray(),
            'experiences' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->leftJoin('attachments', 'experiences.attachment_id', '=', 'attachments.id') // Changed to leftJoin
                ->select([
                    'experiences.*',
                    'experience_categories.name as category_name',
                    // Attachment fields with COALESCE to handle NULL values
                    DB::raw('COALESCE(attachments.name, NULL) as attachment_name'),
                    DB::raw('CASE
                WHEN attachments.path IS NOT NULL
                THEN CONCAT("/storage/", attachments.path)
                ELSE NULL
            END as attachment_path'),
                    DB::raw('COALESCE(attachments.format, NULL) as attachment_format'),
                    DB::raw('COALESCE(attachments.size, NULL) as attachment_size')
                ])
                ->orderBy('experience_categories.ranking', 'asc')
                ->get()
                ->toArray(),
            'professions' => $user->profession()->take(2)->get()->toArray(),
            'summaries' => $user->selected_summary ? [$user->selected_summary->toArray()] : [],
            'allsummaries' => $user->summaries()->get()->toArray(),
            'personalInformation' => [
                'id' => $user->id,
                'firstName' => $user->name,
                'email' => $user->email,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'address' => $user->address,
                'phone' => $user->phone_number,
            ],
            'availableCompetences' => $availableCompetences->toArray(),
            'availableHobbies' => $availableHobbies->toArray(),
            'availableProfessions' => $availableProfessions->toArray(),
            'availableSummaries' => $availableSummaries->toArray(),
            'myProfession' => $myProfession?->toArray() ?? null,
            'experienceCategories' => $experienceCategories->toArray(),


        ];
//        dd($cvInformation);

        return Inertia::render('CvInfos/Index', [
            'cvInformation' => $cvInformation,
            'translations' => trans('*'),
        ]);
    }
    public function previewCv($id)
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $cvModel = CvModel::findOrFail($id);
        if ($user->selected_cv_model_id !== $cvModel->id) {
            abort(403, 'Unauthorized');
        }

        $cvInformation = $this->prepareCvInformation($user);
        $experiencesByCategory = $this->groupExperiencesByCategory($cvInformation['experiences']);

        // Correction du chemin de la vue
        return view("cv-templates." . $cvModel->viewPath, [
            'cvInformation' => $cvInformation,
            'experiencesByCategory' => $experiencesByCategory
        ]);
    }

    public function downloadPdf($id)
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $cvModel = CvModel::findOrFail($id);
        if ($user->selected_cv_model_id !== $cvModel->id) {
            abort(403, 'Unauthorized');
        }

        $cvInformation = $this->prepareCvInformation($user);
        $experiencesByCategory = $this->groupExperiencesByCategory($cvInformation['experiences']);

        $pdf = PDF::loadView("cv-templates." . $cvModel->viewPath, [
            'cvInformation' => $cvInformation,
            'experiencesByCategory' => $experiencesByCategory
        ]);

        return $pdf->download('cv.pdf');
    }
    public function show()
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $cvInformation = $this->prepareCvInformation($user);
        $selectedCvModel = $user->selected_cv_model;

        // Retourner la vue Inertia principale
        return Inertia::render('CvInfos/Show', [
            'cvInformation' => $cvInformation,
            'selectedCvModel' => $selectedCvModel,
        ]);
    }


    public function export()
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $cvInformation = $this->getCvInformation($user);
        $selectedCvModel = $user->selected_cv_model;

        if (!$selectedCvModel) {
            return back()->with('error', 'Veuillez sélectionner un modèle de CV');
        }

        $pdf = PDF::loadView($selectedCvModel->viewPath, [
            'cvInformation' => $cvInformation,
            'experiencesByCategory' => $this->groupExperiencesByCategory($cvInformation['experiences'])
        ]);

        return $pdf->download('cv.pdf');
    }

    private function getCvInformation($user)
    {
        return [
            'hobbies' => $user->hobbies()->take(3)->get()->toArray(),
            'competences' => $user->competences()->take(3)->get()->toArray(),
            'experiences' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->select('experiences.*', 'experience_categories.name as category_name')
                ->orderBy('experience_categories.ranking', 'asc')
                ->get()
                ->toArray(),
            'professions' => $user->profession()->take(2)->get()->toArray(),
            'summaries' => $user->selected_summary ? [$user->selected_summary->toArray()] : [],
            'personalInformation' => [
                'id' => $user->id,
                'firstName' => $user->name,
                'email' => $user->email,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'address' => $user->address,
                'phone' => $user->phone_number,
            ],
        ];
    }

    private function prepareCvInformation($user)
    {
        return [
            'hobbies' => $user->hobbies()->take(3)->get()->toArray(),
            'competences' => $user->competences()->take(3)->get()->toArray(),
            'experiences' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->select('experiences.*', 'experience_categories.name as category_name')
                ->orderBy('experience_categories.ranking', 'asc')
                ->get()
                ->toArray(),
            'professions' => $user->profession()->take(2)->get()->toArray(),
            'summaries' => $user->selected_summary ? [$user->selected_summary->toArray()] : [],
            'personalInformation' => [
                'id' => $user->id,
                'firstName' => $user->name,
                'email' => $user->email,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'address' => $user->address,
                'phone' => $user->phone_number,
            ],
        ];
    }

    private function groupExperiencesByCategory($experiences)
    {
        return collect($experiences)->groupBy('category_name')->toArray();
    }

    public function preview($id)
    {
        // Récupérer l'utilisateur connecté
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        // Récupérer le modèle de CV spécifique à partir de l'ID
        $cvModel = CvModel::findOrFail($id);

        // Vérifier si l'utilisateur a accès à ce modèle
        if (!$user->cvModels->contains($cvModel)) {
            abort(403, 'Vous n\'avez pas accès à ce modèle de CV');
        }

        // Préparer les données pour la vue
        $data = [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'linkedin' => $user->linkedin,
                'github' => $user->github,
            ],
            'experiences' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->select(
                    'experiences.*',
                    'experience_categories.name as category_name',
                    'experiences.name as title',
                    'experiences.InstitutionName'
                )
                ->orderBy('experience_categories.ranking', 'asc')
                ->get(),

            'experiencesByCategory' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->select(
                    'experiences.*',
                    'experience_categories.name as category_name',
                    'experiences.name as title',
                    'experiences.InstitutionName'
                )
                ->orderBy('date_start', 'desc')
                ->get()
                ->groupBy('category_name'),

            'competences' => $user->competences()
                ->select('competences.id', 'competences.name', 'competences.description')
                ->get(),

            'hobbies' => $user->hobbies()
                ->select('hobbies.id', 'hobbies.name')
                ->get(),

            'summaries' => $user->summaries()
                ->select('summaries.id', 'summaries.name', 'summaries.description')
                ->get(),

            'professions' => $user->profession()
                ->select('professions.id', 'professions.name', 'professions.description')
                ->get(),
        ];

        // Retourner la vue avec le modèle spécifique et les données
        try {
            return view('cv-models.' . Str::slug($cvModel->name), $data);
        } catch (\Exception $e) {
            // Log l'erreur pour le débogage
            \Log::error('Erreur lors du rendu du CV: ' . $e->getMessage());

            // Retourner une réponse d'erreur appropriée
            abort(500, 'Erreur lors de la génération du CV');
        }
    }

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . Auth::id(),
            'github' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone_number' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        $user->update($validatedData);

        // Fetch updated CV information
        $cvInformation = [
            'hobbies' => $user->hobbies()->take(3)->get()->toArray(),
            'competences' => $user->competences()->take(3)->get()->toArray(),
            'experiences' => $user->experiences()
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->select('experiences.*', 'experience_categories.name as category_name')
                ->orderBy('experience_categories.ranking', 'asc')
                ->get()
                ->toArray(),
            'professions' => $user->profession()->take(2)->get()->toArray(),
            'summaries' => $user->selected_summary ? [$user->selected_summary->toArray()] : [],
            'personalInformation' => [
                'id' => $user->id,
                'firstName' => $user->name,
                'email' => $user->email,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'address' => $user->address,
                'phone' => $user->phone_number,
            ],
        ];

        return Inertia::render('CvInfos/Index', [
            'message' => 'Personal information updated successfully',
            'editMode' => false,
            'cvInformation' => $cvInformation, // Include all CV information
        ])->with([
            'message' => 'Personal information updated successfully',
            'editMode' => false
        ]);}

}

