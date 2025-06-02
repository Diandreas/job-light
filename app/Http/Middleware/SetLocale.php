<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $locale = session('locale', config('app.locale'));
        
        // Normaliser la locale pour qu'elle soit toujours 'fr' ou 'en'
        // Si c'est français, garder 'fr', sinon rediriger vers 'en'
        if (strpos($locale, 'fr') === 0) {
            $locale = 'fr';
        } else {
            // Pour toute autre langue (y compris en-US, en-GB, es, de, etc.), utiliser 'en'
            $locale = 'en';
        }
        
        // Mettre à jour la session avec la valeur normalisée
        session()->put('locale', $locale);
        App::setLocale($locale);
        
        return $next($request);
    }
}
