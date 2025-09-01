<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CompanySubscriptionController extends Controller
{
    /**
     * Plans d'abonnement pour entreprises
     */
    private $subscriptionPlans = [
        'basic' => [
            'name' => 'Basic',
            'price' => 49,
            'currency' => 'EUR',
            'duration' => 30, // jours
            'features' => [
                'job_posting_limit' => 5,
                'can_access_profiles' => false,
                'featured_jobs' => 0,
                'applicant_tracking' => true,
                'email_notifications' => true,
                'analytics' => false
            ]
        ],
        'professional' => [
            'name' => 'Professional',
            'price' => 99,
            'currency' => 'EUR',
            'duration' => 30,
            'features' => [
                'job_posting_limit' => 20,
                'can_access_profiles' => true,
                'featured_jobs' => 3,
                'applicant_tracking' => true,
                'email_notifications' => true,
                'analytics' => true,
                'priority_support' => true
            ]
        ],
        'enterprise' => [
            'name' => 'Enterprise',
            'price' => 199,
            'currency' => 'EUR',
            'duration' => 30,
            'features' => [
                'job_posting_limit' => -1, // illimité
                'can_access_profiles' => true,
                'featured_jobs' => 10,
                'applicant_tracking' => true,
                'email_notifications' => true,
                'analytics' => true,
                'priority_support' => true,
                'custom_branding' => true,
                'api_access' => true
            ]
        ]
    ];

    /**
     * Page des plans d'abonnement
     */
    public function plans()
    {
        return Inertia::render('Company/SubscriptionPlans', [
            'plans' => $this->subscriptionPlans,
            'currentPlan' => $this->getCurrentCompanyPlan()
        ]);
    }

    /**
     * Initier un abonnement
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:basic,professional,enterprise',
            'company_name' => 'required_without:company_id|string|max:255',
            'company_email' => 'required_without:company_id|email',
            'company_id' => 'nullable|exists:companies,id'
        ]);

        $user = Auth::user();
        $plan = $this->subscriptionPlans[$request->plan];

        // Créer ou récupérer l'entreprise
        if ($request->company_id) {
            $company = Company::findOrFail($request->company_id);
            
            // Vérifier les permissions
            if (!$user->companies()->where('company_id', $company->id)->exists()) {
                return response()->json(['error' => 'Permissions insuffisantes'], 403);
            }
        } else {
            $company = Company::create([
                'name' => $request->company_name,
                'email' => $request->company_email,
                'type' => 'client',
                'status' => 'active',
                'contact_person' => $user->name,
                'contact_email' => $user->email,
                'subscription_type' => 'free'
            ]);

            // Associer l'utilisateur comme admin
            $company->users()->attach($user->id, [
                'role' => 'admin',
                'receive_notifications' => true,
                'joined_at' => now()
            ]);
        }

        // Créer le paiement
        $transactionId = 'company_sub_' . Str::random(16);
        
        $payment = Payment::create([
            'user_id' => $user->id,
            'transaction_id' => $transactionId,
            'amount' => $plan['price'],
            'currency' => $plan['currency'],
            'description' => "Abonnement {$plan['name']} - {$company->name}",
            'status' => 'pending',
            'payment_method' => 'cinetpay',
            'metadata' => json_encode([
                'type' => 'company_subscription',
                'plan' => $request->plan,
                'company_id' => $company->id,
                'duration' => $plan['duration']
            ])
        ]);

        return response()->json([
            'success' => true,
            'payment_id' => $payment->id,
            'transaction_id' => $transactionId,
            'amount' => $plan['price'],
            'plan' => $plan['name']
        ]);
    }

    /**
     * Confirmer le paiement et activer l'abonnement
     */
    public function confirmSubscription(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|string',
            'payment_status' => 'required|string'
        ]);

        $payment = Payment::where('transaction_id', $request->transaction_id)->firstOrFail();
        
        if ($request->payment_status === 'completed') {
            $metadata = json_decode($payment->metadata, true);
            $company = Company::findOrFail($metadata['company_id']);
            $plan = $this->subscriptionPlans[$metadata['plan']];

            // Activer l'abonnement
            $company->update([
                'subscription_type' => $metadata['plan'],
                'subscription_expires_at' => now()->addDays($plan['duration']),
                'can_post_jobs' => true,
                'can_access_profiles' => $plan['features']['can_access_profiles'],
                'job_posting_limit' => $plan['features']['job_posting_limit']
            ]);

            $payment->update([
                'status' => 'completed',
                'completed_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Abonnement activé avec succès !'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Paiement non confirmé'
        ], 400);
    }

    /**
     * Obtenir le plan actuel de l'entreprise
     */
    private function getCurrentCompanyPlan()
    {
        $user = Auth::user();
        $company = $user->companies()->first();
        
        if (!$company) return null;
        
        return [
            'company' => $company,
            'current_plan' => $company->subscription_type,
            'expires_at' => $company->subscription_expires_at,
            'is_active' => $company->hasActiveSubscription()
        ];
    }

    /**
     * Statistiques d'utilisation de l'entreprise
     */
    public function usage()
    {
        $user = Auth::user();
        $company = $user->companies()->first();
        
        if (!$company) {
            return response()->json(['error' => 'Aucune entreprise associée'], 404);
        }

        $currentPlan = $this->subscriptionPlans[$company->subscription_type] ?? null;
        
        $usage = [
            'jobs_posted' => $company->jobPostings()->count(),
            'jobs_active' => $company->jobPostings()->active()->count(),
            'total_applications' => $company->jobPostings()->withSum('applications', 'id')->get()->sum('applications_sum_id'),
            'jobs_limit' => $currentPlan ? $currentPlan['features']['job_posting_limit'] : 0,
            'can_post_more' => $company->job_posting_limit === -1 || 
                              $company->jobPostings()->active()->count() < $company->job_posting_limit
        ];

        return response()->json($usage);
    }
}