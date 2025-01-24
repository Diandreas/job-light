<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function updateWallet(Request $request)
    {
        $user = User::findOrFail($request->user_id);
        $user->wallet_balance += $request->amount;
        $user->save();

        return response()->json(['success' => true, 'balance' => $user->wallet_balance]);
    }

    public function processDownload(Request $request)
    {
        $user = User::findOrFail($request->user_id);

        if ($user->wallet_balance < $request->price) {
            return response()->json(['error' => 'Solde insuffisant'], 400);
        }

        $user->wallet_balance -= $request->price;
        $user->save();

        return response()->json(['success' => true, 'balance' => $user->wallet_balance]);
    }

    public function handleCallback(Request $request)
    {
        Log::info('NotchPay callback received:', $request->all());

        if ($request->status === 'completed') {
            $reference = $request->transaction['merchant_reference'];
            list($prefix, $modelId, $userId) = explode('_', $reference);

            $payment = Payment::create([
                'user_id' => $userId,
                'model_id' => $modelId,
                'amount' => $request->transaction['amount'],
                'reference' => $request->transaction['reference'],
                'status' => 'success',
                'payment_method' => 'notchpay',
                'transaction_id' => $request->transaction['reference']
            ]);

            $user = User::find($userId);
            $user->increment('wallet_balance', $request->transaction['amount']);

            return redirect()->route('cv-infos.show')->with('success', 'Paiement réussi');
        }

        return redirect()->route('cv-infos.show')->with('error', 'Paiement échoué');
    }
    public function webhook(Request $request)
    {
        $signature = $request->header('x-notchpay-signature');
        if (!$this->verifySignature($signature, $request->all())) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $payment = Payment::where('reference', $request->reference)->first();
        if ($request->status === 'completed') {
            $payment->status = 'success';
            $payment->save();

            // Mettre à jour le solde
            $user = $payment->user;
            $user->wallet_balance += $payment->amount;
            $user->save();
        }

        return response()->json(['status' => 'success']);
    }
    public function checkDownloadStatus($modelId)
    {
        $user = auth()->user();
        $hasDownloaded = Payment::where('user_id', $user->id)
            ->where('model_id', $modelId)
            ->where('status', 'downloaded')
            ->exists();

        return response()->json(['hasDownloaded' => $hasDownloaded]);
    }
    private function verifySignature($signature, $payload)
    {
        $secret = config('services.notchpay.secret_key');
        $computed = hash_hmac('sha256', json_encode($payload), $secret);
        return hash_equals($computed, $signature);
    }
    public function getBalance(Request $request)
    {
        return response()->json([
            'balance' => $request->user()->wallet_balance
        ]);
    }
}
