<?php

namespace App\Http\Controllers;

use App\Models\PortfolioSubscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function create()
    {
        return Inertia::render('Subscription/Create');
    }

    public function store(Request $request)
    {
        // Logique de paiement ici

        $user = $request->user();
        $user->portfolioSubscription()->create([
            'start_date' => now(),
            'end_date' => now()->addMonths(3), // Abonnement de 3 mois par exemple
            'status' => 'active',
            'plan' => 'standard',
        ]);

        return redirect()->route('portfolio.index')->with('success', 'Abonnement souscrit avec succès !');
    }

    public function manage()
    {
        $subscription = auth()->user()->portfolioSubscription;
        return Inertia::render('Subscription/Manage', [
            'subscription' => $subscription,
        ]);
    }

    public function cancel(Request $request)
    {
        $subscription = $request->user()->portfolioSubscription;
        $subscription->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Abonnement annulé avec succès.');
    }
}
