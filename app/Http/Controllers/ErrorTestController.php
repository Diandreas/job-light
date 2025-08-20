<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ErrorTestController extends Controller
{
    /**
     * Page de test pour les erreurs
     */
    public function index()
    {
        if (!app()->environment('local')) {
            abort(404);
        }

        return Inertia::render('ErrorTest/Index', [
            'errorCodes' => [
                [
                    'code' => 404,
                    'name' => 'Page Not Found',
                    'description' => 'Test de la page 404',
                    'url' => route('test.errors', 404)
                ],
                [
                    'code' => 500,
                    'name' => 'Server Error',
                    'description' => 'Test de la page 500',
                    'url' => route('test.errors', 500)
                ],
                [
                    'code' => 403,
                    'name' => 'Forbidden',
                    'description' => 'Test de la page 403',
                    'url' => route('test.errors', 403)
                ],
                [
                    'code' => 503,
                    'name' => 'Service Unavailable',
                    'description' => 'Test de la page 503',
                    'url' => route('test.errors', 503)
                ]
            ]
        ]);
    }

    /**
     * Déclenche une erreur spécifique pour tester
     */
    public function triggerError($code)
    {
        if (!app()->environment('local')) {
            abort(404);
        }

        $code = (int) $code;
        
        switch ($code) {
            case 404:
                abort(404, 'Test 404 Error');
                break;
                
            case 500:
                // Déclencher une vraie erreur serveur
                throw new \Exception('Test 500 Error - Something went wrong');
                break;
                
            case 403:
                abort(403, 'Test 403 Error - Access Forbidden');
                break;
                
            case 503:
                abort(503, 'Test 503 Error - Service Unavailable');
                break;
                
            default:
                abort(400, 'Invalid error code');
        }
    }
}
