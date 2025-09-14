<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobPosting;
use App\Models\JobApplication;
use App\Models\PushNotification;
use App\Models\UserDeviceToken;
use App\Models\PlatformStatistic;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    /**
     * Envoyer une notification push à un utilisateur
     */
    public function sendPushNotification(User $user, $title, $body, $type, $data = [])
    {
        // Enregistrer la notification en base
        $notification = PushNotification::create([
            'user_id' => $user->id,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'data' => $data,
            'sent_at' => now()
        ]);

        // Envoyer aux devices de l'utilisateur
        $deviceTokens = $user->deviceTokens()->active()->get();
        
        foreach ($deviceTokens as $deviceToken) {
            try {
                $this->sendToDevice($deviceToken, $title, $body, $data);
                $deviceToken->updateLastUsed();
            } catch (\Exception $e) {
                Log::error("Failed to send push notification to device {$deviceToken->id}: " . $e->getMessage());
                
                // Si le token est invalide, le désactiver
                if (str_contains($e->getMessage(), 'invalid') || str_contains($e->getMessage(), 'expired')) {
                    $deviceToken->deactivate();
                }
            }
        }

        return $notification;
    }

    /**
     * Envoyer notification à un device spécifique
     */
    private function sendToDevice(UserDeviceToken $deviceToken, $title, $body, $data = [])
    {
        $payload = [
            'to' => $deviceToken->device_token,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'sound' => 'default'
            ],
            'data' => $data
        ];

        // Adapter le payload selon la plateforme
        if ($deviceToken->platform === 'ios') {
            $payload['notification']['badge'] = 1;
        }

        // Envoyer via Firebase Cloud Messaging (FCM)
        $response = Http::withHeaders([
            'Authorization' => 'key=' . config('services.fcm.server_key'),
            'Content-Type' => 'application/json'
        ])->post('https://fcm.googleapis.com/fcm/send', $payload);

        if (!$response->successful()) {
            throw new \Exception("FCM request failed: " . $response->body());
        }

        $result = $response->json();
        if (isset($result['failure']) && $result['failure'] > 0) {
            throw new \Exception("FCM delivery failed: " . json_encode($result));
        }
    }

    /**
     * Notifier les utilisateurs des nouvelles offres qui correspondent à leurs critères
     */
    public function notifyJobMatches(JobPosting $job)
    {
        // Récupérer les utilisateurs avec des préférences de notification activées
        $users = User::whereHas('notificationPreferences', function($query) {
            $query->where('email_job_matches', true)
                  ->orWhere('push_job_matches', true);
        })->get();

        foreach ($users as $user) {
            if ($this->jobMatchesUserPreferences($job, $user)) {
                $preferences = $user->getNotificationPreferences();
                
                // Email
                if ($preferences->email_job_matches) {
                    try {
                        Mail::send('emails.job-match', [
                            'user' => $user,
                            'job' => $job,
                            'company' => $job->company
                        ], function ($message) use ($user, $job) {
                            $message->to($user->email, $user->name)
                                    ->subject("Nouvelle offre qui pourrait vous intéresser : {$job->title}");
                        });
                    } catch (\Exception $e) {
                        Log::error("Failed to send job match email to user {$user->id}: " . $e->getMessage());
                    }
                }

                // Push notification
                if ($preferences->push_job_matches) {
                    $this->sendPushNotification(
                        $user,
                        "Nouvelle offre d'emploi",
                        "📢 {$job->title} chez {$job->company->name}",
                        'job_match',
                        [
                            'job_id' => $job->id,
                            'company_name' => $job->company->name,
                            'action_url' => route('job-portal.show', $job->id)
                        ]
                    );
                }
            }
        }

        // Enregistrer statistique
        PlatformStatistic::incrementMetric(now()->toDateString(), 'job_matches_sent');
    }

    /**
     * Vérifier si une offre correspond aux préférences d'un utilisateur
     */
    private function jobMatchesUserPreferences(JobPosting $job, User $user)
    {
        $preferences = $user->getNotificationPreferences();

        // Vérifier les mots-clés
        if ($preferences->job_alert_keywords) {
            $keywords = $preferences->job_alert_keywords;
            $jobText = strtolower($job->title . ' ' . $job->description . ' ' . $job->industry);
            
            $hasKeywordMatch = false;
            foreach ($keywords as $keyword) {
                if (str_contains($jobText, strtolower($keyword))) {
                    $hasKeywordMatch = true;
                    break;
                }
            }
            
            if (!$hasKeywordMatch) {
                return false;
            }
        }

        // Vérifier les localisations préférées
        if ($preferences->preferred_locations && $job->location) {
            $locations = $preferences->preferred_locations;
            $hasLocationMatch = false;
            
            foreach ($locations as $location) {
                if (str_contains(strtolower($job->location), strtolower($location))) {
                    $hasLocationMatch = true;
                    break;
                }
            }
            
            if (!$hasLocationMatch) {
                return false;
            }
        }

        // Vérifier les types d'emploi préférés
        if ($preferences->preferred_employment_types) {
            if (!in_array($job->employment_type, $preferences->preferred_employment_types)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Notifier un utilisateur du changement de statut de sa candidature
     */
    public function notifyApplicationStatusChange(JobApplication $application)
    {
        $user = $application->user;
        $job = $application->jobPosting;
        $preferences = $user->getNotificationPreferences();

        $statusMessages = [
            'reviewed' => [
                'title' => 'Candidature examinée',
                'body' => "Votre candidature pour {$job->title} a été examinée",
                'email_subject' => 'Votre candidature a été examinée'
            ],
            'shortlisted' => [
                'title' => 'Félicitations ! 🎉',
                'body' => "Vous êtes présélectionné(e) pour {$job->title}",
                'email_subject' => 'Vous êtes présélectionné(e) !'
            ],
            'rejected' => [
                'title' => 'Candidature non retenue',
                'body' => "Votre candidature pour {$job->title} n'a pas été retenue cette fois",
                'email_subject' => 'Mise à jour de votre candidature'
            ],
            'hired' => [
                'title' => 'Félicitations ! 🎊',
                'body' => "Vous avez été sélectionné(e) pour {$job->title} !",
                'email_subject' => 'Félicitations ! Vous avez été sélectionné(e)'
            ]
        ];

        if (!isset($statusMessages[$application->status])) {
            return;
        }

        $message = $statusMessages[$application->status];

        // Email
        if ($preferences->email_application_updates) {
            try {
                Mail::send('emails.application-status-update', [
                    'user' => $user,
                    'application' => $application,
                    'job' => $job,
                    'company' => $job->company,
                    'statusMessage' => $message
                ], function ($mailMessage) use ($user, $message) {
                    $mailMessage->to($user->email, $user->name)
                               ->subject($message['email_subject']);
                });
            } catch (\Exception $e) {
                Log::error("Failed to send application status email to user {$user->id}: " . $e->getMessage());
            }
        }

        // Push notification
        if ($preferences->push_application_updates) {
            $this->sendPushNotification(
                $user,
                $message['title'],
                $message['body'],
                'application_status',
                [
                    'application_id' => $application->id,
                    'job_id' => $job->id,
                    'status' => $application->status,
                    'action_url' => route('job-portal.my-applications')
                ]
            );
        }

        // Enregistrer statistique
        PlatformStatistic::incrementMetric(now()->toDateString(), 'application_status_notifications');
    }

    /**
     * Notifier un employeur d'une nouvelle candidature
     */
    public function notifyEmployerNewApplication(JobApplication $application)
    {
        $job = $application->jobPosting;
        $company = $job->company;
        $applicant = $application->user;
        $employer = $job->postedBy;

        if (!$employer) {
            return;
        }

        $preferences = $employer->getNotificationPreferences();

        // Email
        if ($preferences->email_new_messages) {
            try {
                Mail::send('emails.new-application-employer', [
                    'employer' => $employer,
                    'application' => $application,
                    'job' => $job,
                    'company' => $company,
                    'applicant' => $applicant
                ], function ($message) use ($employer, $job) {
                    $message->to($employer->email, $employer->name)
                           ->subject("Nouvelle candidature : {$job->title}");
                });
            } catch (\Exception $e) {
                Log::error("Failed to send new application email to employer {$employer->id}: " . $e->getMessage());
            }
        }

        // Push notification
        if ($preferences->push_new_messages) {
            $this->sendPushNotification(
                $employer,
                "Nouvelle candidature",
                "📝 {$applicant->name} a postulé pour {$job->title}",
                'new_application',
                [
                    'application_id' => $application->id,
                    'job_id' => $job->id,
                    'applicant_name' => $applicant->name,
                    'action_url' => route('job-portal.applications', $job->id)
                ]
            );
        }

        // Enregistrer statistique
        PlatformStatistic::incrementMetric(now()->toDateString(), 'new_application_notifications');
    }

    /**
     * Enregistrer un token de device pour les notifications push
     */
    public function registerDeviceToken(User $user, $deviceToken, $platform, $deviceName = null)
    {
        return UserDeviceToken::updateOrCreate([
            'user_id' => $user->id,
            'device_token' => $deviceToken
        ], [
            'platform' => $platform,
            'device_name' => $deviceName,
            'active' => true,
            'last_used_at' => now()
        ]);
    }

    /**
     * Désactiver un token de device
     */
    public function unregisterDeviceToken(User $user, $deviceToken)
    {
        return UserDeviceToken::where('user_id', $user->id)
            ->where('device_token', $deviceToken)
            ->update(['active' => false]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllNotificationsAsRead(User $user)
    {
        return $user->pushNotifications()
            ->unread()
            ->update(['read' => true]);
    }

    /**
     * Obtenir les notifications non lues d'un utilisateur
     */
    public function getUnreadNotifications(User $user, $limit = 20)
    {
        return $user->pushNotifications()
            ->unread()
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}