<?php

use App\Http\Controllers\CinetPayController;
use Inertia\Inertia;

/**
 * Routes CinetPay simplifiées et fonctionnelles
 * IMPORTANT: Ces routes sont exemptées du CSRF dans VerifyCsrfToken.php
 */

// === ROUTES PRINCIPALES CINETPAY ===

// Routes PUBLIQUES (appelées par CinetPay) - PAS d'authentification
Route::post('/api/cinetpay/notify', [CinetPayController::class, 'notify'])
    ->name('cinetpay.notify')
    ->withoutMiddleware(['auth']);

Route::match(['get', 'post'], '/api/cinetpay/return', [CinetPayController::class, 'return'])
    ->name('cinetpay.return')
    ->withoutMiddleware(['auth']);

// Routes AUTHENTIFIÉES (pour l'application web)
Route::middleware(['auth', 'verified'])->group(function () {
    // Initialisation paiement
    Route::post('/api/cinetpay/initialize', [CinetPayController::class, 'initialize'])
        ->name('cinetpay.initialize');
    
    // Pages de résultat
    Route::get('/payment/success', function(\Illuminate\Http\Request $request) {
        return Inertia::render('Payment/Success', [
            'success' => $request->get('success', 'Paiement effectué avec succès'),
            'transaction_id' => $request->get('transaction_id'),
            'amount' => $request->get('amount', 0)
        ]);
    })->name('payment.success');
    
    Route::get('/payment/failed', function(\Illuminate\Http\Request $request) {
        return Inertia::render('Payment/Failed', [
            'error' => $request->get('error', 'Une erreur est survenue lors du paiement')
        ]);
    })->name('payment.failed');
});

// === ROUTES DE COMPATIBILITÉ (aliases) ===
// Maintenues pour compatibilité avec les configurations CinetPay existantes

Route::post('/payment/notify', [CinetPayController::class, 'notify'])
    ->name('payment.notify.alias')
    ->withoutMiddleware(['auth']);
    
Route::match(['get', 'post'], '/payment/return', [CinetPayController::class, 'return'])
    ->name('payment.return.alias') 
    ->withoutMiddleware(['auth']);

Route::match(['get', 'post'], '/webhook/cinetpay/callback', [CinetPayController::class, 'return'])
    ->name('webhook.cinetpay.callback')
    ->withoutMiddleware(['auth']);