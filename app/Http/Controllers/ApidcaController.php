<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CvModel;
use App\Models\JobPosting;
use App\Models\User;
use App\Services\ApidcaNotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class ApidcaController extends Controller
{
    protected $notificationService;

    public function __construct(ApidcaNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Page d'accueil APIDCA
     */
    public function index()
    {
        $apidcaTemplates = CvModel::where('name', 'like', '%APIDCA%')
            ->where('price', 0)
            ->get();

        $recentJobs = JobPosting::whereHas('company', function($query) {
                $query->where('partner_code', 'APIDCA');
            })
            ->orWhere(function($query) {
                $query->archivesRelated();
            })
            ->published()
            ->active()
            ->latest()
            ->take(5)
            ->with('company')
            ->get();

        $stats = $this->notificationService->getApidcaStats();

        return Inertia::render('Apidca/Index', [
            'templates' => $apidcaTemplates,
            'recentJobs' => $recentJobs,
            'stats' => $stats,
            'isApidcaMember' => auth()->check() ? auth()->user()->isApidcaMember() : false
        ]);
    }

    /**
     * Inscription comme membre APIDCA
     */
    public function joinApidca(Request $request)
    {
        $request->validate([
            'membership_number' => 'nullable|string|max:50',
            'professional_status' => 'required|string|max:100'
        ]);

        $user = auth()->user();

        try {
            $result = $this->notificationService->registerApidcaMember(
                $user, 
                $request->membership_number
            );

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Inscription APIDCA réussie ! Vous avez maintenant accès aux templates gratuits.'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous êtes déjà membre APIDCA.'
                ]);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription : ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Publier une offre d'emploi APIDCA
     */
    public function postJob(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'required|in:full-time,part-time,contract,internship,freelance',
            'salary_min' => 'nullable|numeric|min:0',
            'salary_max' => 'nullable|numeric|min:0',
            'remote_work' => 'boolean',
            'experience_level' => 'required|in:entry,mid,senior,executive',
            'application_deadline' => 'nullable|date|after:today',
            'application_email' => 'nullable|email',
            'application_url' => 'nullable|url'
        ]);

        // Vérifier que l'utilisateur peut poster pour APIDCA
        $user = auth()->user();
        $apidca = Company::where('partner_code', 'APIDCA')->first();

        if (!$apidca) {
            return response()->json(['error' => 'Organisation APIDCA non trouvée'], 404);
        }

        // Vérifier les permissions (membre APIDCA ou admin)
        $canPost = $user->isApidcaMember() || 
                   $user->can('access-admin') ||
                   $user->companies()->where('company_id', $apidca->id)
                       ->wherePivot('role', 'admin')->exists();

        if (!$canPost) {
            return response()->json(['error' => 'Permissions insuffisantes'], 403);
        }

        // Créer l'offre
        $job = JobPosting::create([
            'company_id' => $apidca->id,
            'posted_by_user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'requirements' => $request->requirements,
            'location' => $request->location,
            'employment_type' => $request->employment_type,
            'salary_min' => $request->salary_min,
            'salary_max' => $request->salary_max,
            'salary_currency' => 'EUR',
            'remote_work' => $request->boolean('remote_work'),
            'experience_level' => $request->experience_level,
            'industry' => 'Archives et Documentation',
            'application_deadline' => $request->application_deadline,
            'application_email' => $request->application_email ?: $apidca->contact_email,
            'application_url' => $request->application_url,
            'status' => 'published',
            'auto_notify_members' => true,
            'target_associations' => ['apidca']
        ]);

        // Notifier automatiquement les membres
        $notifiedCount = $this->notificationService->notifyApidcaMembers($job);

        return response()->json([
            'success' => true,
            'message' => "Offre publiée avec succès ! {$notifiedCount} membres ont été notifiés.",
            'job_id' => $job->id
        ]);
    }

    /**
     * Désabonnement des notifications APIDCA
     */
    public function unsubscribe(Request $request, User $user)
    {
        $token = $request->get('token');
        $expectedToken = hash('sha256', $user->email . $user->created_at);

        if (!hash_equals($expectedToken, $token)) {
            abort(403, 'Token invalide');
        }

        // Désactiver les notifications pour ce membre
        $apidca = Company::where('partner_code', 'APIDCA')->first();
        
        if ($apidca) {
            $user->companies()->updateExistingPivot($apidca->id, [
                'receive_notifications' => false
            ]);
        }

        return view('apidca.unsubscribed', ['user' => $user]);
    }

    /**
     * Statistiques APIDCA (pour dashboard admin)
     */
    public function stats()
    {
        $this->authorize('access-admin');
        
        $stats = $this->notificationService->getApidcaStats();
        
        return response()->json($stats);
    }
}