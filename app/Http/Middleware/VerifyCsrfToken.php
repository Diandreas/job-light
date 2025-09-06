<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        'api/*', // Exclure toutes les routes API de la vérification CSRF
        'payment/*', // Exclure toutes les routes de paiement
        'webhook/*', // Exclure tous les webhooks
        // Routes CinetPay spécifiques
        'api/cinetpay/notify',
        'api/cinetpay/return', 
        'api/cinetpay/callback',
        'payment/cinetpay/callback',
        'payment/callback',
        'payment/notify',
        'payment/return',
        'webhook/cinetpay/callback',
        '*/cinetpay/*', // Pattern large pour tous les endpoints CinetPay
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, \Closure $next)
    {
        error_log("=== CSRF MIDDLEWARE CHECK ===");
        error_log("URL: " . $request->fullUrl());
        error_log("Method: " . $request->method());
        error_log("Path: " . $request->path());
        
        // Vérifier si l'URL est dans les exceptions
        $isExcluded = false;
        foreach ($this->except as $pattern) {
            if ($request->is($pattern)) {
                $isExcluded = true;
                break;
            }
        }
        
        error_log("Is excluded from CSRF: " . ($isExcluded ? 'YES' : 'NO'));
        
        if ($isExcluded) {
            error_log("CSRF check SKIPPED for: " . $request->path());
            return $next($request);
        }
        
        error_log("CSRF check PROCEEDING for: " . $request->path());
        return parent::handle($request, $next);
    }
}
