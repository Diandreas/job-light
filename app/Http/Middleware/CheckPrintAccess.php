<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class CheckPrintAccess
{
    protected const PREVIEW_WINDOW = 5; // secondes pour le test
    protected const PRINT_WINDOW = 10; // minutes

    public function handle($request, Closure $next)
    {
        $userId = Auth::id();
        $cvId = $request->route('id');

        // Gestion de l'impression
        if ($request->has('print')) {
            Cache::put("print_time_{$userId}_{$cvId}", now(), now()->addMinutes(self::PRINT_WINDOW));
            return $next($request);
        }

        // Clé unique pour le timer de ce CV
        $timerKey = "cv_preview_timer_{$userId}_{$cvId}";

        // Récupérer ou initialiser le timer
        $firstAccess = Cache::get($timerKey);

        if (!$firstAccess) {
            // Premier accès - démarrer le timer
            $firstAccess = now();
            Cache::put($timerKey, $firstAccess, now()->addSeconds(self::PREVIEW_WINDOW));
        }

        // Vérifier si les 5 secondes sont écoulées
        if (now()->diffInSeconds($firstAccess) > self::PREVIEW_WINDOW) {
            abort(404);
        }

        return $next($request);
    }
}
