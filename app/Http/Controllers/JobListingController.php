<?php

namespace App\Http\Controllers;

use App\Models\Competence;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class JobListingController extends Controller
{
    /**
     * Affiche la liste des annonces d'emploi
     */
    public function index(Request $request)
    {
        $query = JobListing::with(['requiredSkills', 'recruiter'])
            ->where('status', 'open');
            
        // Recherche par titre
        if ($request->has('search') && !empty($request->search)) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }
            
        // Filtres
        if ($request->has('skills') && !empty($request->skills)) {
            $skills = explode(',', $request->skills);
            $query->whereHas('requiredSkills', function($q) use ($skills) {
                $q->whereIn('competence_id', $skills);
            });
        }
        
        if ($request->has('experience_level') && !empty($request->experience_level)) {
            $query->where('experience_level', $request->experience_level);
        }
        
        if ($request->has('budget_min') && !empty($request->budget_min)) {
            $query->where('budget_min', '>=', $request->budget_min);
        }
        
        if ($request->has('budget_max') && !empty($request->budget_max)) {
            $query->where('budget_max', '<=', $request->budget_max);
        }
        
        // Les annonces en vedette en premier
        $query->orderBy('is_featured', 'desc')
              ->orderBy('created_at', 'desc');
              
        $jobListings = $query->withCount('applications')
                             ->paginate(10);
        
        return inertia('JobListings/Index', [
            'jobListings' => $jobListings,
            'skills' => Competence::all(),
            'filters' => $request->only(['search', 'skills', 'experience_level', 'budget_min', 'budget_max']),
        ]);
    }
    
    /**
     * Affiche le formulaire de création d'une annonce
     */
    public function create()
    {
        // Vérifie si l'utilisateur est autorisé à créer des annonces
        $user = Auth::user();
        if (!$this->canCreateJobListing($user)) {
            return redirect()->route('payment.index')->with('error', 'Votre compte ne vous permet pas de créer des annonces. Veuillez acheter des jetons.');
        }
        
        return inertia('JobListings/Create', [
            'skills' => Competence::all()
        ]);
    }
    
    /**
     * Enregistre une nouvelle annonce
     */
    public function store(Request $request)
    {
        // Vérifie si l'utilisateur est autorisé à créer des annonces
        $user = Auth::user();
        if (!$this->canCreateJobListing($user)) {
            return redirect()->route('payment.index')->with('error', 'Votre compte ne vous permet pas de créer des annonces. Veuillez acheter des jetons.');
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'is_remote' => 'nullable|boolean',
            'budget_type' => 'required|in:hourly,fixed',
            'currency' => 'required|string|in:EUR,XAF',
            'budget_min' => 'required|numeric|min:0',
            'budget_max' => 'required|numeric|gte:budget_min',
            'budget_negotiable' => 'nullable|boolean',
            'duration' => 'nullable|string|max:50',
            'level' => 'required|in:beginner,intermediate,expert',
            'competences' => 'nullable|array',
            'competences.*' => 'exists:competences,id',
            'deadline' => 'nullable|date|after:today',
            'tokens_required' => 'required|integer|min:1|max:100',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Créer l'annonce
            $jobListing = JobListing::create([
                'user_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'company_name' => $validated['company_name'],
                'location' => $validated['location'],
                'is_remote' => $validated['is_remote'],
                'budget_type' => $validated['budget_type'],
                'currency' => $validated['currency'],
                'budget_min' => $validated['budget_min'],
                'budget_max' => $validated['budget_max'],
                'budget_negotiable' => $validated['budget_negotiable'],
                'duration' => $validated['duration'],
                'experience_level' => $validated['level'],
                'status' => $request->has('publish') ? 'open' : 'draft',
                'deadline' => $validated['deadline'] ?? null,
                'tokens_required' => $validated['tokens_required'],
            ]);
            
            // Associer les compétences requises
            if (isset($validated['competences'])) {
                foreach ($validated['competences'] as $skill) {
                    $jobListing->requiredSkills()->attach($skill['id'], [
                        'importance' => $skill['importance']
                    ]);
                }
            }
            
            DB::commit();
            
            return redirect()->route('job-listings.show', $jobListing)
                ->with('success', 'Votre annonce a été créée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Une erreur est survenue lors de la création de l\'annonce: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    /**
     * Affiche une annonce d'emploi spécifique
     */
    public function show(JobListing $jobListing)
    {
        // Incrémenter le compteur de vues
        $jobListing->increment('views_count');
        
        // Récupérer les informations sur les candidatures si l'utilisateur est le créateur
        $applications = null;
        if (Auth::id() === $jobListing->user_id) {
            $applications = $jobListing->applications()
                ->with([
                    'applicant',
                    'applicant.experiences',
                    'applicant.competences',
                    'applicant.hobbies',
                    'attachments'
                ])
                ->get();
        }
        
        // Vérifier si l'utilisateur actuel a déjà postulé
        $hasApplied = false;
        if (Auth::check()) {
            $hasApplied = $jobListing->hasApplied(Auth::id());
        }
        
        // Récupérer les jetons disponibles pour l'utilisateur
        $userTokens = Auth::check() ? Auth::user()->wallet_balance : 0;
        
        return inertia('JobListings/Show', [
            'jobListing' => $jobListing->load(['requiredSkills', 'recruiter']),
            'applications' => $applications,
            'hasApplied' => $hasApplied,
            'userTokens' => $userTokens
        ]);
    }
    
    /**
     * Affiche le formulaire d'édition d'une annonce
     */
    public function edit(JobListing $jobListing)
    {
        // Vérifier que l'utilisateur est le propriétaire de l'annonce
        if (Auth::id() !== $jobListing->user_id) {
            return redirect()->route('job-listings.index')
                ->with('error', 'Vous n\'êtes pas autorisé à modifier cette annonce.');
        }
        
        return inertia('JobListings/Edit', [
            'jobListing' => $jobListing->load('requiredSkills'),
            'skills' => Competence::all()
        ]);
    }
    
    /**
     * Met à jour une annonce existante
     */
    public function update(Request $request, JobListing $jobListing)
    {
        // Vérifier que l'utilisateur est le propriétaire de l'annonce
        if (Auth::id() !== $jobListing->user_id) {
            return redirect()->route('job-listings.index')
                ->with('error', 'Vous n\'êtes pas autorisé à modifier cette annonce.');
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'is_remote' => 'nullable|boolean',
            'budget_type' => 'required|in:hourly,fixed',
            'currency' => 'required|string|in:EUR,XAF',
            'budget_min' => 'required|numeric|min:0',
            'budget_max' => 'required|numeric|gte:budget_min',
            'budget_negotiable' => 'nullable|boolean',
            'duration' => 'nullable|string|max:50',
            'level' => 'required|in:beginner,intermediate,expert',
            'competences' => 'nullable|array',
            'competences.*' => 'exists:competences,id',
            'deadline' => 'nullable|date|after:today',
            'tokens_required' => 'required|integer|min:1|max:100',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Mettre à jour l'annonce
            $jobListing->update([
                'title' => $validated['title'],
                'description' => $validated['description'],
                'company_name' => $validated['company_name'],
                'location' => $validated['location'],
                'is_remote' => $validated['is_remote'],
                'budget_type' => $validated['budget_type'],
                'currency' => $validated['currency'],
                'budget_min' => $validated['budget_min'],
                'budget_max' => $validated['budget_max'],
                'budget_negotiable' => $validated['budget_negotiable'],
                'duration' => $validated['duration'],
                'experience_level' => $validated['level'],
                'status' => $request->has('publish') ? 'open' : $jobListing->status,
                'deadline' => $validated['deadline'] ?? null,
                'tokens_required' => $validated['tokens_required'],
            ]);
            
            // Mettre à jour les compétences requises
            if (isset($validated['competences'])) {
                // Supprimer les anciennes relations
                $jobListing->requiredSkills()->detach();
                
                // Ajouter les nouvelles
                foreach ($validated['competences'] as $skill) {
                    $jobListing->requiredSkills()->attach($skill['id'], [
                        'importance' => $skill['importance']
                    ]);
                }
            }
            
            DB::commit();
            
            return redirect()->route('job-listings.show', $jobListing)
                ->with('success', 'Votre annonce a été mise à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Une erreur est survenue lors de la mise à jour de l\'annonce: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    /**
     * Supprime une annonce
     */
    public function destroy(JobListing $jobListing)
    {
        // Vérifier que l'utilisateur est le propriétaire de l'annonce
        if (Auth::id() !== $jobListing->user_id) {
            return redirect()->route('job-listings.index')
                ->with('error', 'Vous n\'êtes pas autorisé à supprimer cette annonce.');
        }
        
        try {
            DB::beginTransaction();
            
            // Supprimer les compétences associées
            $jobListing->requiredSkills()->detach();
            
            // Supprimer l'annonce
            $jobListing->delete();
            
            DB::commit();
            
            return redirect()->route('job-listings.index')
                ->with('success', 'Votre annonce a été supprimée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Une erreur est survenue lors de la suppression de l\'annonce: ' . $e->getMessage());
        }
    }
    
    /**
     * Clôture une annonce
     */
    public function close(JobListing $jobListing)
    {
        // Vérifier que l'utilisateur est le propriétaire de l'annonce
        if (Auth::id() !== $jobListing->user_id) {
            return redirect()->route('job-listings.index')
                ->with('error', 'Vous n\'êtes pas autorisé à clôturer cette annonce.');
        }
        
        $jobListing->update(['status' => 'closed']);
        
        return redirect()->route('job-listings.show', $jobListing)
            ->with('success', 'Votre annonce a été clôturée avec succès.');
    }
    
    /**
     * Affiche les annonces créées par l'utilisateur
     */
    public function myListings()
    {
        $jobListings = JobListing::where('user_id', Auth::id())
            ->with('requiredSkills')
            ->withCount('applications')
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return inertia('JobListings/MyListings', [
            'jobListings' => $jobListings
        ]);
    }
    
    /**
     * Vérifie si l'utilisateur peut créer une annonce
     */
    private function canCreateJobListing(User $user)
    {
        // Implémentez votre propre logique d'autorisation ici
        // Par exemple, vérifier si l'utilisateur a un abonnement premium
        return true;
    }
}
