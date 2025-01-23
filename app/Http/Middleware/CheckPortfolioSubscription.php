<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPortfolioSubscription
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->portfolioSubscription || !$request->user()->portfolioSubscription->isActive()) {
            return redirect()->route('subscription.create')->with('error', 'Vous devez avoir un abonnement actif pour accéder à cette fonctionnalité.');
        }
        return $next($request);
    }
}
