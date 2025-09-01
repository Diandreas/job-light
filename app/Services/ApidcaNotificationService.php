<?php

namespace App\Services;

use App\Models\Company;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ApidcaNotificationService
{
    /**
     * Notifier les membres APIDCA d'une nouvelle offre d'emploi archives
     */
    public function notifyApidcaMembers(JobPosting $jobPosting)
    {
        try {
            // Vérifier si c'est une offre liée aux archives
            if (!$this->isArchivesRelated($jobPosting)) {
                return false;
            }

            // Récupérer l'organisation APIDCA
            $apidca = Company::where('partner_code', 'APIDCA')->first();
            
            if (!$apidca || !$apidca->auto_notify_members) {
                return false;
            }

            // Récupérer tous les membres APIDCA qui veulent recevoir des notifications
            $members = $apidca->users()
                ->whereHas('companyMembers', function($query) {
                    $query->where('receive_notifications', true);
                })
                ->get();

            $notifiedCount = 0;

            foreach ($members as $member) {
                try {
                    Mail::send('emails.apidca-job-notification', [
                        'member' => $member,
                        'job' => $jobPosting,
                        'company' => $jobPosting->company,
                        'apidca' => $apidca
                    ], function ($message) use ($member, $jobPosting) {
                        $message->to($member->email, $member->name)
                                ->subject("Nouvelle opportunité archives : {$jobPosting->title}");
                    });
                    
                    $notifiedCount++;
                    
                } catch (\Exception $e) {
                    Log::error("Erreur notification APIDCA pour {$member->email}: " . $e->getMessage());
                }
            }

            // Logger le succès
            Log::info("Notification APIDCA envoyée", [
                'job_id' => $jobPosting->id,
                'job_title' => $jobPosting->title,
                'members_notified' => $notifiedCount
            ]);

            return $notifiedCount;

        } catch (\Exception $e) {
            Log::error("Erreur service notification APIDCA: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Vérifier si une offre est liée aux archives
     */
    private function isArchivesRelated(JobPosting $jobPosting)
    {
        $archivesKeywords = [
            'archiv', 'document', 'biblioth', 'conservat', 'patrimoine', 
            'musée', 'médiath', 'record', 'gestion documentaire', 'numérisation'
        ];
        
        $searchText = strtolower($jobPosting->title . ' ' . $jobPosting->description . ' ' . $jobPosting->industry);
        
        foreach ($archivesKeywords as $keyword) {
            if (strpos($searchText, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Inscrire un utilisateur comme membre APIDCA
     */
    public function registerApidcaMember(User $user, string $membershipNumber = null)
    {
        $apidca = Company::where('partner_code', 'APIDCA')->first();
        
        if (!$apidca) {
            throw new \Exception('Organisation APIDCA non trouvée');
        }

        // Vérifier si déjà membre
        $existingMembership = $apidca->users()->where('user_id', $user->id)->first();
        
        if ($existingMembership) {
            return false; // Déjà membre
        }

        // Ajouter comme membre
        $apidca->users()->attach($user->id, [
            'role' => 'member',
            'receive_notifications' => true,
            'joined_at' => now()
        ]);

        // Donner accès aux templates APIDCA gratuits
        $apidcaTemplates = \App\Models\CvModel::where('name', 'like', '%APIDCA%')->get();
        
        foreach ($apidcaTemplates as $template) {
            $user->cvModels()->syncWithoutDetaching([$template->id]);
        }

        Log::info("Nouveau membre APIDCA inscrit", [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'membership_number' => $membershipNumber
        ]);

        return true;
    }

    /**
     * Obtenir les statistiques APIDCA
     */
    public function getApidcaStats()
    {
        $apidca = Company::where('partner_code', 'APIDCA')->first();
        
        if (!$apidca) {
            return null;
        }

        return [
            'total_members' => $apidca->users()->count(),
            'active_members' => $apidca->users()
                ->whereHas('companyMembers', function($query) {
                    $query->where('receive_notifications', true);
                })->count(),
            'jobs_posted_this_month' => JobPosting::where('company_id', $apidca->id)
                ->where('created_at', '>=', now()->startOfMonth())
                ->count(),
            'total_jobs_posted' => JobPosting::where('company_id', $apidca->id)->count(),
            'cv_templates_used' => \App\Models\CvModel::where('name', 'like', '%APIDCA%')
                ->withCount('users')
                ->get()
                ->sum('users_count')
        ];
    }
}