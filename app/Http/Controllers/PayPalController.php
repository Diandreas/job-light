<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PayPalController extends Controller
{
    public function index()
    {
        return Inertia::render('Payment/Index', [
            'paypalConfig' => [
                'clientId' => config('paypal.client_id'),
                'mode' => config('paypal.mode'),
            ],
        ]);
    }

    public function capturePayment(Request $request)
    {
        try {
            $validated = $request->validate([
                'orderID' => 'required|string',
                'tokens' => 'required|integer|min:1',
                'paypalDetails' => 'required|array'
            ]);

            // Mise à jour du solde de l'utilisateur
            $user = auth()->user();
            $user->wallet_balance += $validated['tokens'];
            $user->save();

            // Enregistrement du paiement
            \App\Models\Payment::create([
                'user_id' => $user->id,
                'amount' => $validated['paypalDetails']['purchase_units'][0]['amount']['value'],
                'transaction_id' => $validated['orderID'],
                'status' => 'completed',
                'payment_method' => 'paypal',
                'metadata' => json_encode($validated['paypalDetails'])
            ]);

            return response()->json([
                'success' => true,
                'new_balance' => $user->wallet_balance
            ]);
        } catch (\Exception $e) {
            Log::error('PayPal payment capture error', [
                'error' => $e->getMessage(),
                'orderID' => $request->orderID ?? null
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Une erreur est survenue lors du traitement du paiement'
            ], 500);
        }
    }
}
