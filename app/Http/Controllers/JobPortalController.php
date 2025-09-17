<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use App\Models\JobApplication;
use App\Models\Company;
use App\Models\User;
use App\Services\ApidcaNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class JobPortalController extends Controller
{
    protected $notificationService;

    public function __construct(ApidcaNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
        $this->middleware('auth')->only(['apply', 'myApplications', 'myJobs', 'profiles', 'updateApplicationStatus', 'bulkUpdateApplications']);
    }

    /**
     * Page d'accueil du portail emploi
     */
    public function index(Request $request)
    {
        $query = JobPosting::active()
            ->with(['company', 'applications'])
            ->orderBy('featured', 'desc')
            ->orderBy('created_at', 'desc');

        // Filtres
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        if ($request->filled('employment_type') && $request->employment_type !== 'all') {
            $query->where('employment_type', $request->employment_type);
        }

        if ($request->filled('experience_level') && $request->experience_level !== 'all') {
            $query->where('experience_level', $request->experience_level);
        }

        if ($request->filled('remote')) {
            $query->where('remote_work', true);
        }

        $jobs = $query->paginate(20);

        // Statistiques pour la page
        $stats = [
            'total_jobs' => JobPosting::active()->count(),
            'companies_hiring' => Company::whereHas('jobPostings', function($q) {
                $q->active();
            })->count(),
            'remote_jobs' => JobPosting::active()->where('remote_work', true)->count(),
            'new_this_week' => JobPosting::active()->where('created_at', '>=', now()->subWeek())->count()
        ];

        // Entreprises qui recrutent
        $topCompanies = Company::whereHas('jobPostings', function($q) {
                $q->active();
            })
            ->withCount(['jobPostings' => function($q) {
                $q->active();
            }])
            ->orderBy('job_postings_count', 'desc')
            ->take(8)
            ->get(['id', 'name', 'logo_path', 'industry']);

        return Inertia::render('JobPortal/Index', [
            'jobs' => $jobs,
            'stats' => $stats,
            'topCompanies' => $topCompanies,
            'filters' => $request->only(['search', 'location', 'employment_type', 'experience_level', 'remote'])
        ]);
    }

    /**
     * Afficher une offre d'emploi spécifique
     */
    public function show(JobPosting $job)
    {
        $job->load(['company', 'applications.user']);
        
        // Incrémenter les vues
        $job->increment('views_count');

        // Vérifier si l'utilisateur a déjà postulé et récupérer son CV sélectionné
        $hasApplied = false;
        $selectedCvModel = null;
        if (Auth::check()) {
            $hasApplied = $job->applications()
                ->where('user_id', Auth::id())
                ->exists();

            // Récupérer le modèle de CV sélectionné par l'utilisateur
            $user = Auth::user();
            if ($user->selected_cv_model_id) {
                $selectedCvModel = $user->selected_cv_model;
            }
        }

        // Offres similaires
        $similarJobs = JobPosting::active()
            ->where('id', '!=', $job->id)
            ->where(function($query) use ($job) {
                $query->where('industry', $job->industry)
                      ->orWhere('employment_type', $job->employment_type)
                      ->orWhere('experience_level', $job->experience_level);
            })
            ->with('company')
            ->take(4)
            ->get();

        return Inertia::render('JobPortal/Show', [
            'job' => $job,
            'hasApplied' => $hasApplied,
            'similarJobs' => $similarJobs,
            'canApply' => Auth::check(),
            'selectedCvModel' => $selectedCvModel
        ]);
    }

    /**
     * Postuler à une offre
     */
    public function apply(Request $request, JobPosting $job)
    {

        $request->validate([
            'cover_letter' => 'required|string|min:100|max:2000',
            'cv_model_id' => 'required|exists:cv_models,id'
        ]);

        $user = Auth::user();

        // Vérifier si déjà postulé
        if ($job->applications()->where('user_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà postulé à cette offre'
            ], 400);
        }

        // Créer la candidature
        $application = JobApplication::create([
            'job_posting_id' => $job->id,
            'user_id' => $user->id,
            'cover_letter' => $request->cover_letter,
            'cv_path' => "cv-{$user->id}-{$request->cv_model_id}.pdf", // À générer
            'status' => 'pending',
            'applied_at' => now()
        ]);

        // Incrémenter le compteur de candidatures
        $job->increment('applications_count');

        // Notifier l'entreprise (optionnel)
        try {
            $this->notifyCompanyNewApplication($job, $application);
        } catch (\Exception $e) {
            Log::warning('Failed to notify company of new application: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Candidature envoyée avec succès !',
            'application_id' => $application->id
        ]);
    }

    /**
     * Recherche de profils (pour entreprises)
     */
    public function searchProfiles(Request $request)
    {
        $user = Auth::user();

        // Pour l'instant, permettre l'accès à tous les utilisateurs authentifiés
        // TODO: Implémenter un système de permissions plus sophistiqué si nécessaire

        $query = User::whereNotNull('email_verified_at')
            ->with(['profession', 'experiences', 'competences', 'languages'])
            ->where('id', '!=', $user->id);

        // Filtres de recherche
        if ($request->filled('profession')) {
            $query->where(function($q) use ($request) {
                $q->where('full_profession', 'like', "%{$request->profession}%")
                  ->orWhereHas('profession', function($subQ) use ($request) {
                      $subQ->where('name', 'like', "%{$request->profession}%");
                  });
            });
        }

        if ($request->filled('location')) {
            $query->where('address', 'like', "%{$request->location}%");
        }

        if ($request->filled('experience_years') && $request->experience_years !== 'all') {
            // Calculer l'expérience basée sur les dates d'expérience
            $minYears = (int) $request->experience_years;
            $query->whereHas('experiences', function($q) use ($minYears) {
                $q->whereRaw('DATEDIFF(COALESCE(date_end, NOW()), date_start) >= ?', [$minYears * 365]);
            });
        }

        if ($request->filled('skills')) {
            $skills = explode(',', $request->skills);
            $query->whereHas('competences', function($q) use ($skills) {
                $q->whereIn('name', $skills);
            });
        }

        $profiles = $query->paginate(20);

        return Inertia::render('JobPortal/Profiles', [
            'profiles' => $profiles,
            'filters' => $request->only(['profession', 'location', 'experience_years', 'skills']),
            'canAccessProfiles' => true
        ]);
    }

    /**
     * Afficher le formulaire de création d'annonce simple
     */
    public function createSimpleAdForm()
    {
        return Inertia::render('JobPortal/CreateSimpleAd');
    }

    /**
     * Créer une annonce simple
     */
    public function createSimpleAd(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:100',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'required|in:full-time,part-time,contract,internship,freelance',
            'experience_level' => 'nullable|in:entry,mid,senior,executive',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'remote_work' => 'boolean',
            'industry' => 'nullable|string|max:100',
            'application_deadline' => 'nullable|date|after:today',
            'contact_info' => 'required|array',
            'contact_info.method' => 'required|in:email,phone,website,message',
            'contact_info.email' => 'required_if:contact_info.method,email|email',
            'contact_info.phone' => 'required_if:contact_info.method,phone|string',
            'contact_info.website' => 'required_if:contact_info.method,website|url',
            'contact_via_platform' => 'boolean',
            'company_name' => 'nullable|string|max:255',
            'company_description' => 'nullable|string'
        ]);

        $user = Auth::user();

        // Créer ou récupérer l'entreprise
        if ($request->company_name) {
            $company = Company::firstOrCreate([
                'name' => $request->company_name,
                'email' => $user ? $user->email : $request->contact_info['email']
            ], [
                'type' => 'individual',
                'status' => 'active',
                'description' => $request->company_description,
                'can_post_jobs' => true,
                'job_posting_limit' => 10 // Limite pour annonces simples
            ]);
        } else {
            // Entreprise par défaut pour les annonces simples
            $company = Company::firstOrCreate([
                'name' => 'Annonce individuelle',
                'email' => $user ? $user->email : $request->contact_info['email']
            ], [
                'type' => 'individual',
                'status' => 'active',
                'can_post_jobs' => true,
                'job_posting_limit' => 10
            ]);
        }

        // Créer l'annonce simple
        $job = JobPosting::create([
            'company_id' => $company->id,
            'posted_by_user_id' => $user ? $user->id : null,
            'title' => $request->title,
            'description' => $request->description,
            'requirements' => $request->requirements,
            'location' => $request->location,
            'employment_type' => $request->employment_type,
            'experience_level' => $request->experience_level,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'salary_currency' => 'FCFA',
            'remote_work' => $request->boolean('remote_work'),
            'industry' => $request->industry,
            'application_deadline' => $request->application_deadline,
            'status' => 'published',
            'posting_type' => 'simple_ad',
            'contact_info' => $request->contact_info,
            'contact_via_platform' => $request->boolean('contact_via_platform'),
            'additional_instructions' => $request->contact_info['instructions'] ?? null
        ]);

        return redirect()->route('job-portal.show', $job->id)
            ->with('success', 'Votre annonce a été publiée avec succès !');
    }

    /**
     * Publier une offre d'emploi standard
     */
    public function createJob(Request $request)
    {

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|min:100',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'required|in:full-time,part-time,contract,internship,freelance',
            'experience_level' => 'required|in:entry,mid,senior,executive',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'remote_work' => 'boolean',
            'industry' => 'nullable|string|max:100',
            'skills_required' => 'nullable|array',
            'application_deadline' => 'nullable|date|after:today',
            'application_email' => 'nullable|email',
            'application_url' => 'nullable|url',
            'company_name' => 'required_without:company_id|string|max:255',
            'company_id' => 'nullable|exists:companies,id'
        ]);

        $user = Auth::user();

        // Déterminer l'entreprise
        if ($request->company_id) {
            $company = Company::findOrFail($request->company_id);
            
            // Vérifier les permissions
            if (!$company->canPostJobs() || !$user->companies()->where('company_id', $company->id)->exists()) {
                return response()->json(['error' => 'Permissions insuffisantes'], 403);
            }
        } else {
            // Créer une entreprise individuelle
            $company = Company::create([
                'name' => $request->company_name,
                'email' => $user->email,
                'type' => 'individual',
                'status' => 'active',
                'can_post_jobs' => true,
                'job_posting_limit' => 5 // Limite pour particuliers
            ]);

            // Associer l'utilisateur à cette entreprise
            $company->users()->attach($user->id, [
                'role' => 'admin',
                'receive_notifications' => true,
                'joined_at' => now()
            ]);
        }

        // Vérifier la limite de publications
        if ($company->job_posting_limit > 0) {
            $currentJobs = $company->jobPostings()->active()->count();
            if ($currentJobs >= $company->job_posting_limit) {
                return response()->json([
                    'error' => 'Limite de publications atteinte',
                    'limit' => $company->job_posting_limit
                ], 400);
            }
        }

        // Créer l'offre
        $job = JobPosting::create([
            'company_id' => $company->id,
            'posted_by_user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'requirements' => $request->requirements,
            'location' => $request->location,
            'employment_type' => $request->employment_type,
            'experience_level' => $request->experience_level,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'salary_currency' => 'FCFA',
            'remote_work' => $request->boolean('remote_work'),
            'industry' => $request->industry,
            'skills_required' => $request->skills_required,
            'application_deadline' => $request->application_deadline,
            'application_email' => $request->application_email ?: $user->email,
            'application_url' => $request->application_url,
            'status' => 'published',
            'auto_notify_members' => true
        ]);

        // Notifier les membres concernés (APIDCA, etc.)
        if ($job->shouldNotifyApidca()) {
            $this->notificationService->notifyApidcaMembers($job);
        }

        return response()->json([
            'success' => true,
            'message' => 'Offre publiée avec succès !',
            'job_id' => $job->id
        ]);
    }

    /**
     * Mes candidatures (utilisateur)
     */
    public function myApplications()
    {

        $applications = Auth::user()->jobApplications()
            ->with(['jobPosting.company'])
            ->orderBy('applied_at', 'desc')
            ->paginate(20);

        return Inertia::render('JobPortal/MyApplications', [
            'applications' => $applications
        ]);
    }

    /**
     * Mes offres publiées (entreprise)
     */
    public function myJobs()
    {

        $jobs = JobPosting::where('posted_by_user_id', Auth::id())
            ->with(['company', 'applications.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('JobPortal/MyJobs', [
            'jobs' => $jobs
        ]);
    }

    /**
     * Candidatures reçues pour une offre
     */
    public function jobApplications(JobPosting $job)
    {

        // Vérifier les permissions
        if ($job->posted_by_user_id !== Auth::id() && !Auth::user()->can('access-admin')) {
            abort(403, 'Accès non autorisé');
        }

        $applications = $job->applications()
            ->with('user')
            ->orderBy('applied_at', 'desc')
            ->paginate(20);

        return Inertia::render('JobPortal/Applications', [
            'job' => $job,
            'applications' => $applications
        ]);
    }

    /**
     * Mettre à jour le statut d'une candidature
     */
    public function updateApplicationStatus(Request $request, JobApplication $application)
    {

        $request->validate([
            'status' => 'required|in:pending,reviewed,shortlisted,rejected,hired'
        ]);

        // Vérifier les permissions
        $job = $application->jobPosting;
        if ($job->posted_by_user_id !== Auth::id() && !Auth::user()->can('access-admin')) {
            abort(403, 'Accès non autorisé');
        }

        $application->update(['status' => $request->status]);

        // Notifier le candidat du changement de statut
        try {
            $this->notifyApplicantStatusChange($application);
        } catch (\Exception $e) {
            Log::warning('Failed to notify applicant of status change: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès'
        ]);
    }

    /**
     * Notifier l'entreprise d'une nouvelle candidature
     */
    private function notifyCompanyNewApplication(JobPosting $job, JobApplication $application)
    {
        $company = $job->company;
        $applicant = $application->user;

        // Email à l'entreprise
        Mail::send('emails.new-application', [
            'job' => $job,
            'application' => $application,
            'applicant' => $applicant,
            'company' => $company
        ], function ($message) use ($job, $company) {
            $message->to($job->application_email ?: $company->contact_email)
                    ->subject("Nouvelle candidature : {$job->title}");
        });
    }

    /**
     * Notifier le candidat du changement de statut
     */
    private function notifyApplicantStatusChange(JobApplication $application)
    {
        $statusMessages = [
            'reviewed' => 'Votre candidature a été examinée',
            'shortlisted' => 'Félicitations ! Vous êtes présélectionné(e)',
            'rejected' => 'Votre candidature n\'a pas été retenue cette fois',
            'hired' => 'Félicitations ! Vous avez été sélectionné(e) pour ce poste'
        ];

        if (isset($statusMessages[$application->status])) {
            Mail::send('emails.application-status-update', [
                'application' => $application,
                'job' => $application->jobPosting,
                'company' => $application->jobPosting->company,
                'user' => $application->user,
                'statusMessage' => $statusMessages[$application->status]
            ], function ($message) use ($application) {
                $message->to($application->user->email, $application->user->name)
                        ->subject("Mise à jour de votre candidature - {$application->jobPosting->title}");
            });
        }
    }

    /**
     * API pour suggestions de recherche
     */
    public function searchSuggestions(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $suggestions = [
            'jobs' => JobPosting::active()
                ->where('title', 'like', "%{$query}%")
                ->select('title')
                ->distinct()
                ->take(5)
                ->pluck('title'),
            'locations' => JobPosting::active()
                ->where('location', 'like', "%{$query}%")
                ->select('location')
                ->distinct()
                ->take(5)
                ->pluck('location'),
            'companies' => Company::where('name', 'like', "%{$query}%")
                ->select('name')
                ->take(5)
                ->pluck('name')
        ];

        return response()->json($suggestions);
    }
}