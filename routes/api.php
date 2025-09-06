<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CinetPayWebhookController;
use App\Http\Controllers\CinetPayController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes webhook CinetPay (sans middleware CSRF)
Route::match(['get', 'post'], '/cinetpay/callback', [CinetPayWebhookController::class, 'handleCallback'])
    ->name('api.cinetpay.webhook');

// Routes CinetPay principales (callbacks externes)
Route::post('/cinetpay/notify', [CinetPayController::class, 'notify'])
    ->name('api.cinetpay.notify')
    ->middleware('cinetpay.debug');

Route::match(['get', 'post'], '/cinetpay/return', [CinetPayController::class, 'return'])
    ->name('api.cinetpay.return')
    ->middleware('cinetpay.debug');
