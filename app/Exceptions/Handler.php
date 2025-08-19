<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        $response = parent::render($request, $exception);

        // Vérifier si c'est une requête Inertia et que nous sommes en production ou voulons afficher les pages d'erreur personnalisées
        if ($this->shouldRenderInertiaErrorPage($request, $response)) {
            return $this->renderInertiaErrorPage($request, $response, $exception);
        }

        return $response;
    }

    /**
     * Détermine si nous devons rendre une page d'erreur Inertia
     */
    protected function shouldRenderInertiaErrorPage(Request $request, Response $response): bool
    {
        // Uniquement pour les requêtes web (pas API)
        if ($request->expectsJson() || $request->is('api/*')) {
            return false;
        }

        // Codes d'erreur que nous voulons gérer avec nos pages personnalisées
        $errorCodes = [404, 500, 503, 403];
        
        return in_array($response->getStatusCode(), $errorCodes);
    }

    /**
     * Rend une page d'erreur Inertia personnalisée
     */
    protected function renderInertiaErrorPage(Request $request, Response $response, Throwable $exception)
    {
        $statusCode = $response->getStatusCode();
        
        // Données de base pour toutes les erreurs
        $errorData = [
            'status' => $statusCode,
            'message' => $this->getErrorMessage($statusCode, $exception),
        ];

        // Ajouter des données spécifiques selon le type d'erreur
        switch ($statusCode) {
            case 404:
                return Inertia::render('404', $errorData)
                    ->toResponse($request)
                    ->setStatusCode(404);
                
            case 500:
                return Inertia::render('500', $errorData)
                    ->toResponse($request)
                    ->setStatusCode(500);
                
            case 503:
                return Inertia::render('Error', array_merge($errorData, [
                    'title' => 'Service Unavailable',
                    'description' => 'The service is temporarily unavailable. Please try again later.',
                ]))
                ->toResponse($request)
                ->setStatusCode(503);
                
            case 403:
                return Inertia::render('Error', array_merge($errorData, [
                    'title' => 'Forbidden',
                    'description' => 'You don\'t have permission to access this resource.',
                ]))
                ->toResponse($request)
                ->setStatusCode(403);
                
            default:
                return Inertia::render('Error', $errorData)
                    ->toResponse($request)
                    ->setStatusCode($statusCode);
        }
    }

    /**
     * Obtient un message d'erreur approprié
     */
    protected function getErrorMessage(int $statusCode, Throwable $exception): string
    {
        // En production, on ne montre pas les détails de l'exception
        if (app()->environment('production')) {
            return match ($statusCode) {
                404 => 'Page not found',
                500 => 'Internal server error',
                503 => 'Service unavailable',
                403 => 'Forbidden',
                default => 'An error occurred',
            };
        }

        // En développement, on peut montrer plus de détails
        if ($exception instanceof HttpException) {
            return $exception->getMessage() ?: $this->getDefaultMessage($statusCode);
        }

        return $exception->getMessage() ?: $this->getDefaultMessage($statusCode);
    }

    /**
     * Obtient le message par défaut pour un code d'erreur
     */
    protected function getDefaultMessage(int $statusCode): string
    {
        return match ($statusCode) {
            404 => 'Page not found',
            500 => 'Internal server error',
            503 => 'Service unavailable',
            403 => 'Forbidden',
            default => 'An error occurred',
        };
    }
}
