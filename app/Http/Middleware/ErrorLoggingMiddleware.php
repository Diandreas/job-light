<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ErrorLoggingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Log des erreurs 4xx et 5xx
        if ($response->getStatusCode() >= 400) {
            $this->logError($request, $response);
        }

        return $response;
    }

    /**
     * Log error information
     */
    private function logError(Request $request, Response $response): void
    {
        $statusCode = $response->getStatusCode();
        
        // Ne pas logger certaines erreurs courantes en production
        $skipLogging = [
            404, // Pages not found - trop verbeux
        ];

        if (app()->environment('production') && in_array($statusCode, $skipLogging)) {
            return;
        }

        $logData = [
            'status_code' => $statusCode,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->header('Referer'),
            'user_id' => auth()->id(),
            'session_id' => session()->getId(),
        ];

        // Ajouter les données POST pour les erreurs serveur (pas les mots de passe)
        if ($statusCode >= 500 && $request->isMethod('POST')) {
            $postData = $request->except([
                'password', 
                'password_confirmation', 
                'current_password',
                '_token'
            ]);
            $logData['post_data'] = $postData;
        }

        // Niveau de log selon le type d'erreur
        if ($statusCode >= 500) {
            Log::error("HTTP {$statusCode} Error", $logData);
        } elseif ($statusCode >= 400) {
            Log::warning("HTTP {$statusCode} Client Error", $logData);
        }
    }
}
