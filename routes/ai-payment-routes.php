<?php

use App\Http\Controllers\AIPaymentController;

/**
 * Routes pour les paiements des services IA
 * Ces routes sont sécurisées et nécessitent une authentification
 */

Route::middleware(['auth', 'verified'])->group(function () {
    
    // === PAGES DE PAIEMENT ===
    Route::get('/payment/ai-pricing', [AIPaymentController::class, 'pricing'])->name('payment.ai.pricing');
    Route::get('/payment/dashboard', [AIPaymentController::class, 'dashboard'])->name('payment.dashboard');
    Route::get('/payment/success', [AIPaymentController::class, 'paymentSuccess'])->name('payment.success');
    Route::get('/payment/failed', [AIPaymentController::class, 'paymentFailed'])->name('payment.failed');
    
    // === API PAIEMENTS SERVICES IA ===
    Route::prefix('api/payment/ai')->name('api.payment.ai.')->group(function () {
        
        // Vérifications d'accès et prix
        Route::post('/check-access', [AIPaymentController::class, 'checkAccess'])->name('check-access');
        Route::post('/calculate-price', [AIPaymentController::class, 'calculatePrice'])->name('calculate-price');
        Route::get('/check-balance', [AIPaymentController::class, 'checkBalance'])->name('check-balance');
        
        // Initiation des paiements
        Route::post('/initiate-service', [AIPaymentController::class, 'initiateServicePayment'])->name('initiate-service');
        Route::post('/initiate-tokens', [AIPaymentController::class, 'initiateTokenPurchase'])->name('initiate-tokens');
        
        // Utilisation des services
        Route::post('/use-service', [AIPaymentController::class, 'useService'])->name('use-service');
        
        // Historique et statistiques
        Route::get('/history', [AIPaymentController::class, 'paymentHistory'])->name('history');
        
    });
});

// === ROUTES WEBHOOK CINETPAY (PUBLIQUES) ===
// Ces routes sont accessibles sans authentification car appelées par CinetPay
Route::prefix('webhook/cinetpay')->name('cinetpay.')->group(function () {
    Route::post('/notify', [App\Http\Controllers\CinetPayController::class, 'notify'])->name('notify');
    Route::match(['get', 'post'], '/return', [App\Http\Controllers\CinetPayController::class, 'return'])->name('return');
});

// === ALIAS POUR COMPATIBILITÉ ===
Route::post('/payment/notify', [App\Http\Controllers\CinetPayController::class, 'notify'])->name('payment.notify');
Route::match(['get', 'post'], '/payment/return', [App\Http\Controllers\CinetPayController::class, 'return'])->name('payment.return');