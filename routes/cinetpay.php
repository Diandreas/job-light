<?php

use App\Http\Controllers\CinetPayController;
use Inertia\Inertia;

/**
 * Routes CinetPay sans middleware web (pas de CSRF)
 */

// === GROUPE SANS MIDDLEWARE WEB POUR ÉVITER CSRF ===
Route::group(['middleware' => ['api']], function () {

    // Routes PUBLIQUES CinetPay - Callbacks externes
    Route::post('/api/cinetpay/notify', [CinetPayController::class, 'notify'])
        ->name('cinetpay.notify')
        ->middleware('cinetpay.debug');

    Route::match(['get', 'post'], '/api/cinetpay/return', [CinetPayController::class, 'return'])
        ->name('cinetpay.return')
        ->middleware('cinetpay.debug');

    Route::post('/payment/notify', [CinetPayController::class, 'notify'])
        ->name('payment.notify.alias')
        ->middleware('cinetpay.debug');
        
    Route::match(['get', 'post'], '/payment/return', [CinetPayController::class, 'return'])
        ->name('payment.return.alias') 
        ->middleware('cinetpay.debug');

    Route::match(['get', 'post'], '/webhook/cinetpay/callback', [CinetPayController::class, 'return'])
        ->name('webhook.cinetpay.callback')
        ->middleware('cinetpay.debug');
});

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

// Note: Les routes de compatibilité sont maintenant dans le groupe API ci-dessus