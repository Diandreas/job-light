<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\ErrorLoggingMiddleware::class,
        ]);
        $middleware->alias([
            'check.portfolio.subscription' => \App\Http\Middleware\CheckPortfolioSubscription::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, $request) {
            $response = null;
            
            // Vérifier si c'est une exception HTTP
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                $statusCode = $e->getStatusCode();
            } else {
                $statusCode = 500;
            }

            // Uniquement pour les requêtes web (pas API)
            if ($request->expectsJson() || $request->is('api/*')) {
                return null; // Laisser Laravel gérer
            }

            // Codes d'erreur que nous voulons gérer avec nos pages personnalisées
            $errorCodes = [404, 500, 503, 403];
            
            if (in_array($statusCode, $errorCodes)) {
                // Données de base pour toutes les erreurs
                $errorData = [
                    'status' => $statusCode,
                    'message' => $e->getMessage() ?: "Erreur $statusCode",
                ];

                // Déterminer quelle page utiliser
                $pageName = match ($statusCode) {
                    404 => '404',
                    500 => '500',
                    403 => '403',
                    503 => '503',
                    default => 'Error',
                };

                return \Inertia\Inertia::render($pageName, $errorData)
                    ->toResponse($request)
                    ->setStatusCode($statusCode);
            }

            return null; // Laisser Laravel gérer les autres erreurs
        });
    })->create();
