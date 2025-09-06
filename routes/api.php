<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CinetPayWebhookController;

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

// Route webhook CinetPay (sans middleware CSRF)
Route::match(['get', 'post'], '/cinetpay/callback', [CinetPayWebhookController::class, 'handleCallback'])
    ->name('api.cinetpay.webhook');
