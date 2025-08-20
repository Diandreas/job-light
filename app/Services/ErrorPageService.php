<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ErrorPageService
{
    /**
     * Configuration des pages d'erreur
     */
    protected array $config;

    public function __construct()
    {
        $this->config = config('error-pages', []);
    }

    /**
     * Détermine si les pages d'erreur personnalisées doivent être affichées
     */
    public function shouldShowCustomErrorPage(Request $request, int $statusCode): bool
    {
        // Vérifier si les pages personnalisées sont activées
        if (!$this->config['show_custom_pages'] ?? true) {
            return false;
        }

        // Ne pas afficher pour les requêtes API
        if ($request->expectsJson() || $request->is('api/*')) {
            return false;
        }

        // Codes d'erreur supportés
        $supportedCodes = [404, 500, 403, 503];
        
        return in_array($statusCode, $supportedCodes);
    }

    /**
     * Obtient les données pour une page d'erreur
     */
    public function getErrorPageData(int $statusCode, Request $request): array
    {
        $errorConfig = $this->config['messages'][$statusCode] ?? [];
        
        return [
            'status' => $statusCode,
            'title' => $errorConfig['title'] ?? "Erreur $statusCode",
            'description' => $errorConfig['description'] ?? 'Une erreur s\'est produite.',
            'suggestion' => $errorConfig['suggestion'] ?? '',
            'support' => $this->getSupportData(),
            'quick_links' => $this->getQuickLinks($request),
            'animations' => $this->config['animations'] ?? [],
            'timestamp' => now()->toISOString(),
            'request_id' => $request->header('X-Request-ID', uniqid()),
        ];
    }

    /**
     * Obtient les données de support
     */
    protected function getSupportData(): array
    {
        $supportConfig = $this->config['support'] ?? [];
        
        return [
            'enabled' => $supportConfig['enabled'] ?? true,
            'email' => $supportConfig['email'] ?? 'support@guidy.com',
        ];
    }

    /**
     * Obtient les liens rapides en fonction de l'utilisateur
     */
    protected function getQuickLinks(Request $request): array
    {
        $quickLinksConfig = $this->config['quick_links'] ?? [];
        $links = [];
        
        foreach ($quickLinksConfig as $key => $linkConfig) {
            // Vérifier si l'utilisateur est connecté pour les liens nécessitant une authentification
            if (($linkConfig['auth_required'] ?? false) && !$request->user()) {
                continue;
            }
            
            // Vérifier si la route existe
            $routeName = $linkConfig['route'] ?? '';
            if (empty($routeName)) {
                continue;
            }
            
            try {
                $url = route($routeName);
                $links[$key] = [
                    'url' => $url,
                    'auth_required' => $linkConfig['auth_required'] ?? false,
                ];
            } catch (\Exception $e) {
                // Route n'existe pas, on l'ignore
                continue;
            }
        }
        
        return $links;
    }

    /**
     * Log une erreur de page
     */
    public function logError(Request $request, int $statusCode, ?\Throwable $exception = null): void
    {
        if (!($this->config['log_errors'] ?? true)) {
            return;
        }

        $logData = [
            'status_code' => $statusCode,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
            'referer' => $request->header('Referer'),
            'timestamp' => now()->toISOString(),
        ];

        if ($exception) {
            $logData['exception'] = [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ];
        }

        $logLevel = $statusCode >= 500 ? 'error' : 'warning';
        
        Log::$logLevel("Error page displayed: $statusCode", $logData);
    }

    /**
     * Obtient les statistiques des erreurs
     */
    public function getErrorStats(): array
    {
        // Cette méthode pourrait être étendue pour intégrer avec un système de monitoring
        return [
            'total_errors_today' => 0,
            'most_common_error' => 404,
            'last_error_time' => null,
        ];
    }
}
