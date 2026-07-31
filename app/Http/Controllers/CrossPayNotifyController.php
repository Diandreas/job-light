<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Models\User;

class CrossPayNotifyController extends Controller
{
    public function handle(Request $request)
    {
        // Vérifier le secret interne
        $secret = config('services.crosspay.internal_secret');
        if ($request->header('X-Internal-Secret') !== $secret) {
            Log::warning('CrossPay notify: secret invalide', ['ip' => $request->ip()]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $trid      = $request->input('trid');
        $status    = $request->input('status');
        $errorCode = $request->input('errorCode');

        if (!$trid || !$status) {
            return response()->json(['error' => 'trid et status requis'], 400);
        }

        Log::info('CrossPay notify reçu', ['trid' => $trid, 'status' => $status, 'errorCode' => $errorCode]);

        $payment = Payment::where('transaction_id', $trid)->first();
        if (!$payment) {
            Log::warning('CrossPay notify: transaction introuvable', ['trid' => $trid]);
            return response()->json(['received' => true, 'note' => 'transaction inconnue']);
        }

        if ($payment->status === 'completed') {
            return response()->json(['received' => true, 'note' => 'déjà crédité']);
        }

        if ($status === 'SUCCESS') {
            $tokens = $payment->metadata['tokens'] ?? 0;
            $user   = User::find($payment->user_id);

            if ($user && $tokens > 0) {
                $user->increment('wallet_balance', $tokens);
                Log::info('CrossPay notify SUCCESS → tokens crédités', [
                    'user_id' => $user->id,
                    'tokens'  => $tokens,
                    'trid'    => $trid,
                ]);
            }

            $payment->update(['status' => 'completed']);

        } elseif (in_array($status, ['FAILED', 'CANCELLED'])) {
            $payment->update(['status' => 'failed']);
            Log::info('CrossPay notify FAILED', ['trid' => $trid, 'errorCode' => $errorCode]);
        }

        return response()->json(['received' => true]);
    }
}
