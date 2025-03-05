<?php

namespace App\Http\Controllers;

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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CvInfosController extends Controller
{
    public function previewCv($id)
    {
        $user = Auth::user();
        if (!$user) abort(403, 'Unauthorized');

        // Récupérer la langue depuis la requête
        $locale = request()->get('locale', app()->getLocale());
        app()->setLocale($locale);

        $cvModel = CvModel::findOrFail($id);
        $cvInformation = $this->getCommonCvInformation($user);
        $groupedData = $this->groupExperiencesByCategory($cvInformation['experiences']);

        return view("cv-templates." . $cvModel->viewPath, [
            'cvInformation' => $cvInformation,
            'experiencesByCategory' => $groupedData['experiences'],
            'categoryTranslations' => $groupedData['translations'],
            'showPrintButton' => request()->has('print'),
            'cvModel' => $cvModel,
            'currentLocale' => $locale // Nouvelle variable
        ]);
    }
    public function updatePhoto(Request $request)
    {
        Log::info('=== Photo Upload Started ===');
        Log::info('Request data:', $request->all());
        Log::info('Files:', $request->allFiles());

        try {
            $request->validate([
                'photo' => 'required|image|max:5120|mimes:jpeg,png,jpg'
            ]);

            Log::info('Validation passed');
            $user = Auth::user();
            Log::info('User:', ['id' => $user->id]);

            if ($request->hasFile('photo')) {
                Log::info('Photo file found');

                if ($user->photo) {
                    Log::info('Deleting old photo:', ['path' => $user->photo]);
                    Storage::disk('public')->delete($user->photo);
                }

                $path = $request->file('photo')->store('profile-photos', 'public');
                Log::info('New photo stored at:', ['path' => $path]);

                $user->photo = $path;
                $user->save();
                Log::info('User updated with new photo path');

                $url = Storage::url($path);
                Log::info('Generated URL:', ['url' => $url]);

                return response()->json([
                    'success' => true,
                    'photo_url' => $url
                ]);
            } else {
                Log::error('No photo file in request');
            }
        } catch (\Exception $e) {
            Log::error('Error during photo upload:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }

        Log::info('=== Photo Upload Ended ===');
    }

    public function downloadPdf($id)
    {
        $user = Auth::user();
        if (!$user) abort(403, 'Unauthorized');

        $cvModel = CvModel::findOrFail($id);
        $cvInformation = $this->getCommonCvInformation($user);
        $groupedData = $this->groupExperiencesByCategory($cvInformation['experiences']);
        $locale = request()->get('locale', app()->getLocale());
        // Configurer DomPDF
        $pdf = PDF::loadView("cv-templates." . $cvModel->viewPath, [
            'cvInformation' => $cvInformation,
            'experiencesByCategory' => $groupedData['experiences'],
            'categoryTranslations' => $groupedData['translations'],
            'showPrintButton' => false,
            'cvModel' => $cvModel,
            'currentLocale' => $locale // Nouvelle variable
        ]);

        // Définir les options spécifiques
        $pdf->setOption([
            'defaultFont' => 'dejavu sans',
            'dpi' => 296,
            'defaultMediaType' => 'print',
            'enableCss' => true,

        ]);

        $filename = Str::slug($user->name) . '-cv.pdf';
        return $pdf->download($filename);
    }
    private function getCommonCvInformation($user)
    {
        // Récupérer les expériences avec leurs références
        $experiences = $user->experiences()
            ->with('references')
            ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
            ->leftJoin('attachments', 'experiences.attachment_id', '=', 'attachments.id')
            ->select([
                'experiences.*',
                'experience_categories.name as category_name',
                'experience_categories.name_en as category_name_en',
                DB::raw('COALESCE(attachments.name, NULL) as attachment_name'),
                DB::raw('CASE WHEN attachments.path IS NOT NULL THEN CONCAT("/storage/", attachments.path) ELSE NULL END as attachment_path'),
                DB::raw('COALESCE(attachments.format, NULL) as attachment_format'),
                DB::raw('COALESCE(attachments.size, NULL) as attachment_size')
            ])
            ->orderBy('experience_categories.ranking', 'asc')
            ->get();

        // Transformer les expériences pour inclure les références
        $experiencesWithReferences = $experiences->map(function ($experience) {
            $experienceArray = $experience->toArray();
            $experienceArray['references'] = $experience->references->map(function ($reference) {
                return [
                    'id' => $reference->id,
                    'name' => $reference->name ?? '',
                    'function' => $reference->function ?? '',
                    'email' => $reference->email ?? '',
                    'telephone' => $reference->telephone ?? ''
                ];
            })->toArray();
            return $experienceArray;
        })->toArray();

        // Determine professions based on full_profession
        $professions = [];
        if (!empty($user->full_profession)) {
            $professions = [[
                'id' => 0,
                'name' => $user->full_profession,
                'name_en' => $user->full_profession,
                'description' => null,
                'category_id' => null
            ]];
        } else {
            $professions = $user->profession()
                ->select(['id', 'name', 'name_en', 'description', 'category_id'])
                ->take(2)
                ->get()
                ->map(function($profession) {
                    return [
                        'id' => $profession->id,
                        'name' => $profession->name ?? '',
                        'name_en' => $profession->name_en ?? '',
                        'description' => $profession->description ?? '',
                        'category_id' => $profession->category_id
                    ];
                })
                ->toArray();
        }

        $baseInfo = [
            'hobbies' => collect($user->hobbies()->select(['id', 'name', 'name_en'])->get())->map(function($hobby) {
                return [
                    'id' => $hobby->id,
                    'name' => $hobby->name ?? '',
                    'name_en' => $hobby->name_en ?? ''
                ];
            })->toArray(),

            'competences' => collect($user->competences()->select(['id', 'name', 'name_en', 'description'])->get())->map(function($competence) {
                return [
                    'id' => $competence->id,
                    'name' => $competence->name ?? '',
                    'name_en' => $competence->name_en ?? '',
                    'description' => $competence->description ?? ''
                ];
            })->toArray(),

            'experiences' => $experiencesWithReferences,
            'professions' => $professions,
            'summaries' => $user->selected_summary ? [$user->selected_summary->toArray()] : [],
            'personalInformation' => [
                'id' => $user->id,
                'firstName' => $user->name ?? '',
                'email' => $user->email ?? '',
                'github' => $user->github ?? '',
                'linkedin' => $user->linkedin ?? '',
                'address' => $user->address ?? '',
                'phone' => $user->phone_number ?? '',
                'photo' => $user->photo ? Storage::url($user->photo) : null,
                'full_profession' => $user->full_profession ?? '',
            ],
        ];

        return $baseInfo;
    }
    public function index()
    {
        $user = auth()->user();

        $cvInformation = $this->getCommonCvInformation($user);
        $cvInformation = array_merge($cvInformation, [
            'availableCompetences' => Competence::select(['id', 'name', 'name_en', 'description'])->get()->toArray(),
            'availableHobbies' => Hobby::select(['id', 'name', 'name_en'])->get()->toArray(),
            'availableProfessions' => Profession::select(['id', 'name', 'name_en', 'description', 'category_id'])->get()->toArray(),
            'availableSummaries' => $user->summary()->get()->toArray(),
            'myProfession' => $user->profession?->toArray(),
            'experienceCategories' => ExperienceCategory::all()->toArray(),
            'allsummaries' => $user->summaries()->get()->toArray(),
        ]);

        return Inertia::render('CvInfos/Index', [
            'cvInformation' => $cvInformation,
            'translations' => trans('*'),
        ]);
    }

    private function groupExperiencesByCategory($experiences)
    {
        // Grouper par catégorie avec support de traduction
        $grouped = collect($experiences)->groupBy(function ($experience) {
            return $experience['category_name']; // Utiliser le nom français comme clé
        })->toArray();

        // Modifions la structure des traductions
        $categoryTranslations = [];
        foreach ($experiences as $experience) {
            $categoryTranslations[$experience['category_name']] = [
                'name_fr' => $experience['category_name'],
                'name_en' => $experience['category_name_en']
            ];
        }

        return [
            'experiences' => $grouped,
            'translations' => $categoryTranslations
        ];
    }


    public function show()
    {
        $user = Auth::user();
        if (!$user) abort(403, 'Unauthorized');

        $cvInformation = $this->getCommonCvInformation($user);
        $selectedCvModel = $user->selected_cv_model;

        return Inertia::render('CvInfos/Show', [
            'cvInformation' => $cvInformation,
            'selectedCvModel' => $selectedCvModel,
        ]);
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

        $cvInformation = $this->getCommonCvInformation($user);

        return Inertia::render('CvInfos/Index', [
            'message' => 'Personal information updated successfully',
            'editMode' => false,
            'cvInformation' => $cvInformation,
        ])->with([
            'message' => 'Personal information updated successfully',
            'editMode' => false
        ]);
    }













}
