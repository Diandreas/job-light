<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UnifiedPaymentController;

/*
|--------------------------------------------------------------------------
| Unified Payment Routes
|--------------------------------------------------------------------------
|
| Routes pour gérer tous les types de paiements (CinetPay, Pluto, Fapshi)
| via un contrôleur unifié
|
*/

Route::prefix('api/payments')->group(function () {
    
    // Initiation de paiement
    Route::post('/initiate', [UnifiedPaymentController::class, 'initiatePayment'])
         ->name('payments.initiate');
    
    // Paiement direct mobile (Pluto/Fapshi seulement)
    Route::post('/direct-mobile', [UnifiedPaymentController::class, 'directMobilePayment'])
         ->name('payments.direct-mobile');
    
    // Vérification du statut d'un paiement
    Route::get('/status/{transactionId}', [UnifiedPaymentController::class, 'checkPaymentStatus'])
         ->name('payments.status');
    
    // Liste des fournisseurs disponibles
    Route::get('/providers', [UnifiedPaymentController::class, 'getProviders'])
         ->name('payments.providers');
    
    // Recommandation de fournisseur
    Route::post('/recommend-provider', [UnifiedPaymentController::class, 'recommendProvider'])
         ->name('payments.recommend-provider');
    
    // Consultation de solde (Pluto/Fapshi)
    Route::get('/balance/{provider}', [UnifiedPaymentController::class, 'getBalance'])
         ->name('payments.balance')
         ->where('provider', 'pluto|fapshi');
});

// Routes pour les webhooks et notifications
Route::post('/payments/notify', [UnifiedPaymentController::class, 'handleNotification'])
     ->name('payments.notify');

Route::get('/payments/return', [UnifiedPaymentController::class, 'returnPage'])
     ->name('payments.return');

// Routes spécifiques pour Fapshi (fonctionnalités avancées)
Route::prefix('api/fapshi')->group(function () {
    
    // Payout (retrait)
    Route::post('/payout', function(\Illuminate\Http\Request $request) {
        $gateway = app(\App\Services\PaymentGatewayService::class);
        
        try {
            $request->validate([
                'amount' => 'required|integer|min:100',
                'phone' => 'required|string|regex:/^6[0-9]{8}$/'
            ]);
            
            $result = $gateway->payout($request->all());
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    })->name('fapshi.payout');
    
    // Recherche de transactions
    Route::get('/transactions/search', function(\Illuminate\Http\Request $request) {
        $gateway = app(\App\Services\PaymentGatewayService::class);
        
        try {
            $params = $request->only(['amt', 'status', 'medium', 'limit', 'sort', 'start', 'end']);
            $result = $gateway->searchTransactions($params);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    })->name('fapshi.search');
    
    // Transactions d'un utilisateur
    Route::get('/transactions/user/{userId}', function(string $userId) {
        $gateway = app(\App\Services\PaymentGatewayService::class);
        
        try {
            $result = $gateway->getUserTransactions($userId);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    })->name('fapshi.user-transactions');
    
    // Expirer un paiement
    Route::post('/expire/{transactionId}', function(string $transactionId) {
        $gateway = app(\App\Services\PaymentGatewayService::class);
        
        try {
            $result = $gateway->expirePayment($transactionId);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    })->name('fapshi.expire');
});