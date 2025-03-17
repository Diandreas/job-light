<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobApplicationAttachment;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class JobApplicationController extends Controller
{
    /**
     * Liste toutes les candidatures pour l'interface Inertia
     */
    public function index()
    {
        $applications = JobApplication::where('user_id', Auth::id())
            ->with(['jobListing', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return inertia('JobApplications/Index', [
            'applications' => $applications
        ]);
    }

    /**
     * Affiche le formulaire de candidature pour une annonce
     */
    public function create(JobListing $jobListing)
    {
        // Vérifier si l'utilisateur a déjà postulé
        if ($jobListing->hasApplied(Auth::id())) {
            return redirect()->route('job-listings.show', $jobListing)
                ->with('error', 'Vous avez déjà postulé à cette annonce.');
        }
        
        // Vérifier si l'annonce est toujours ouverte
        if ($jobListing->status !== 'open') {
            return redirect()->route('job-listings.show', $jobListing)
                ->with('error', 'Cette annonce n\'est plus ouverte aux candidatures.');
        }
        
        // Vérifier si l'utilisateur a suffisamment de jetons
        $user = Auth::user();
        if (!isset($user->wallet_balance) || $user->wallet_balance < $jobListing->tokens_required) {
            return redirect()->route('job-listings.show', $jobListing)
                ->with('error', 'Vous n\'avez pas suffisamment de jetons pour postuler à cette annonce.');
        }
        
        return inertia('JobApplications/Create', [
            'jobListing' => $jobListing->load('requiredSkills'),
            'tokensRequired' => $jobListing->tokens_required,
            'userTokens' => $user->wallet_balance
        ]);
    }
    
    /**
     * Enregistre une nouvelle candidature
     */
    public function store(Request $request, JobListing $jobListing)
    {
        // Vérifier si l'utilisateur a déjà postulé
        if ($jobListing->hasApplied(Auth::id())) {
            return redirect()->route('job-listings.show', $jobListing)
                ->with('error', 'Vous avez déjà postulé à cette annonce.');
        }
        
        // Vérifier si l'annonce est toujours ouverte
        if ($jobListing->status !== 'open') {
            return redirect()->route('job-listings.show', $jobListing)
                ->with('error', 'Cette annonce n\'est plus ouverte aux candidatures.');
        }
        
        // Vérifier si l'utilisateur a suffisamment de jetons
        $user = Auth::user();
        if (!isset($user->wallet_balance) || $user->wallet_balance < $jobListing->tokens_required) {
            return redirect()->route('job-listings.show', $jobListing)
                ->with('error', 'Vous n\'avez pas suffisamment de jetons pour postuler à cette annonce.');
        }
        
        $validated = $request->validate([
            'cover_letter' => 'required|string|min:50',
            'proposed_rate' => 'nullable|numeric|min:0',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240', // Max 10 MB par fichier
            'attachment_descriptions' => 'nullable|array',
            'attachment_descriptions.*' => 'nullable|string|max:255',
        ]);
        
        try {
            DB::beginTransaction();
            
            // Créer la candidature
            $application = JobApplication::create([
                'job_listing_id' => $jobListing->id,
                'user_id' => Auth::id(),
                'cover_letter' => $validated['cover_letter'],
                'proposed_rate' => $validated['proposed_rate'] ?? null,
                'status' => 'pending',
                'tokens_spent' => $jobListing->tokens_required,
            ]);
            
            // Débiter les jetons de l'utilisateur
            User::where('id', Auth::id())->update([
                'wallet_balance' => DB::raw('wallet_balance - ' . $jobListing->tokens_required)
            ]);
            
            // Traiter les pièces jointes
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $key => $file) {
                    $path = $file->store('job_applications/' . $application->id, 'public');
                    
                    JobApplicationAttachment::create([
                        'job_application_id' => $application->id,
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_type' => $file->getClientMimeType(),
                        'file_size' => $file->getSize(),
                        'description' => $validated['attachment_descriptions'][$key] ?? null,
                    ]);
                }
            }
            
            DB::commit();
            
            return redirect()->route('job-listings.show', $jobListing)
                ->with('success', 'Votre candidature a été envoyée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Une erreur est survenue lors de l\'envoi de votre candidature: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    /**
     * Affiche les détails d'une candidature (pour le recruteur)
     */
    public function show(JobApplication $application)
    {
        // Vérifier que l'utilisateur est autorisé à voir cette candidature
        $jobListing = $application->jobListing;
        if (Auth::id() !== $jobListing->user_id) {
            return redirect()->route('job-listings.index')
                ->with('error', 'Vous n\'êtes pas autorisé à voir cette candidature.');
        }
        
        // Marquer comme vue si ce n'est pas déjà fait
        $application->markAsViewed();
        
        return inertia('JobApplications/Show', [
            'application' => $application->load([
                'attachments', 
                'applicant', 
                'applicant.experiences',
                'applicant.competences',
                'applicant.hobbies',
                'attachments'
            ]),
            'jobListing' => $jobListing
        ]);
    }
    
    /**
     * Télécharger une pièce jointe
     */
    public function downloadAttachment(JobApplicationAttachment $attachment)
    {
        // Vérifier si l'utilisateur est autorisé à télécharger la pièce jointe
        $application = $attachment->jobApplication;
        
        if (!$application) {
            return redirect()->route('job-applications.index')
                ->with('error', 'Pièce jointe introuvable.');
        }
        
        // Un recruteur peut télécharger les pièces jointes des candidatures pour ses annonces
        // Un candidat peut télécharger ses propres pièces jointes
        if (Auth::id() !== $application->user_id && Auth::id() !== $application->jobListing->user_id) {
            return redirect()->route('job-applications.index')
                ->with('error', 'Vous n\'êtes pas autorisé à télécharger cette pièce jointe.');
        }
        
        // Récupérer le fichier depuis le stockage
        $filePath = storage_path('app/public/' . $attachment->file_path);
        
        if (!file_exists($filePath)) {
            return redirect()->route('job-applications.index')
                ->with('error', 'Le fichier demandé n\'existe pas.');
        }
        
        // Télécharger le fichier
        return Response::download($filePath, $attachment->file_name);
    }
    
    /**
     * Mettre à jour le statut d'une candidature
     */
    public function updateStatus(Request $request, JobApplication $application)
    {
        // Vérifier que l'utilisateur est autorisé à modifier cette candidature
        $jobListing = $application->jobListing;
        if (Auth::id() !== $jobListing->user_id) {
            return redirect()->route('job-listings.show', $jobListing->id)
                ->with('error', 'Vous n\'êtes pas autorisé à modifier cette candidature.');
        }
        
        $validated = $request->validate([
            'status' => 'required|in:pending,shortlisted,rejected,hired',
        ]);
        
        // Mettre à jour le statut
        $application->update([
            'status' => $validated['status']
        ]);
        
        return redirect()->route('job-applications.show', $application->id)
            ->with('success', 'Le statut de la candidature a été mis à jour.');
    }
    
    /**
     * Liste toutes les candidatures de l'utilisateur
     */
    public function myApplications()
    {
        $applications = JobApplication::where('user_id', Auth::id())
            ->with(['jobListing', 'attachments'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return inertia('JobApplications/Index', [
            'applications' => $applications
        ]);
    }

    /**
     * Supprime une candidature (retrait par le candidat)
     */
    public function destroy(JobApplication $application)
    {
        // Vérifier que l'utilisateur est autorisé à supprimer cette candidature
        if (Auth::id() !== $application->user_id) {
            return redirect()->route('job-applications.index')
                ->with('error', 'Vous n\'êtes pas autorisé à supprimer cette candidature.');
        }
        
        // Vérifier que la candidature peut être supprimée
        // On ne peut pas retirer une candidature qui a été acceptée ou rejetée
        if (in_array($application->status, ['hired', 'rejected'])) {
            return redirect()->route('job-applications.index')
                ->with('error', 'Vous ne pouvez pas retirer une candidature qui a déjà été ' . 
                    ($application->status === 'hired' ? 'acceptée' : 'rejetée') . '.');
        }
        
        try {
            DB::beginTransaction();
            
            // Supprimer les pièces jointes
            foreach ($application->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->file_path);
                $attachment->delete();
            }
            
            // Supprimer la candidature
            $application->delete();
            
            DB::commit();
            
            return redirect()->route('job-applications.index')
                ->with('success', 'Votre candidature a été retirée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->route('job-applications.index')
                ->with('error', 'Une erreur est survenue lors du retrait de votre candidature: ' . $e->getMessage());
        }
    }
}
