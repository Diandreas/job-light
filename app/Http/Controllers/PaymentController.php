<?php

namespace App\Http\Controllers;

use App\Models\Competence;
use App\Models\ExperienceCategory;
use App\Models\Hobby;
use App\Models\Profession;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
// PaymentController.php
    public function updateWallet(Request $request)
    {
        Log::info('Début updateWallet', [
            'request_data' => $request->all(),
            'user_id' => $request->user_id ?? 'non défini'
        ]);

        try {
            DB::beginTransaction();
            Log::info('Transaction DB démarrée');

            // Validation des données
            try {
                $validated = $request->validate([
                    'user_id' => 'required|exists:users,id',
                    'amount' => 'required|integer|min:1',
                    'payment_data' => 'required|array',
                    'payment_data.order_id' => 'required|string',
                    'payment_data.amount' => 'required',
                    'payment_data.currency' => 'required|string',
                    'payment_data.status' => 'required|string'
                ]);
                Log::info('Validation des données réussie', $validated);
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error('Erreur de validation', [
                    'errors' => $e->errors(),
                    'request_data' => $request->all()
                ]);
                throw $e;
            }

            // Récupération de l'utilisateur
            $user = User::lockForUpdate()->find($request->user_id);
            if (!$user) {
                Log::error('Utilisateur non trouvé', ['user_id' => $request->user_id]);
                throw new \Exception('User not found');
            }
            Log::info('Utilisateur trouvé', [
                'user_id' => $user->id,
                'current_balance' => $user->wallet_balance
            ]);

            // Vérification du paiement existant
            $existingPayment = Payment::where('transaction_id', $request->payment_data['order_id'])->first();
            if ($existingPayment) {
                Log::warning('Tentative de paiement en double détectée', [
                    'transaction_id' => $request->payment_data['order_id'],
                    'existing_payment' => $existingPayment
                ]);
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Payment already processed'
                ], 400);
            }
            Log::info('Aucun paiement existant trouvé pour cette transaction');

            // Création du paiement
            try {
                $payment = Payment::create([
                    'user_id' => $user->id,
                    'amount' => $request->payment_data['amount'],
                    'transaction_id' => $request->payment_data['order_id'],
                    'status' => 'completed',
                    'payment_method' => 'paypal',
                    'metadata' => json_encode($request->payment_data)
                ]);
                Log::info('Paiement créé avec succès', [
                    'payment_id' => $payment->id,
                    'transaction_id' => $payment->transaction_id
                ]);
            } catch (\Exception $e) {
                Log::error('Erreur lors de la création du paiement', [
                    'error' => $e->getMessage(),
                    'payment_data' => $request->payment_data
                ]);
                throw $e;
            }

            // Mise à jour du solde
            $oldBalance = $user->wallet_balance;
            $user->wallet_balance += $request->amount;
            $user->save();

            Log::info('Solde mis à jour avec succès', [
                'user_id' => $user->id,
                'old_balance' => $oldBalance,
                'new_balance' => $user->wallet_balance,
                'added_amount' => $request->amount
            ]);

            DB::commit();
            Log::info('Transaction DB validée avec succès');

            return response()->json([
                'success' => true,
                'new_balance' => $user->wallet_balance,
                'payment_id' => $payment->id,
                'transaction_id' => $payment->transaction_id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur critique dans updateWallet', [
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'error_file' => $e->getFile(),
                'error_line' => $e->getLine(),
                'error_trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => $request->user_id ?? null
            ]);

            $errorMessage = config('app.debug')
                ? $e->getMessage()
                : 'Une erreur est survenue lors du traitement du paiement.';

            return response()->json([
                'success' => false,
                'message' => $errorMessage,
                'debug_info' => config('app.debug') ? [
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
    }

    public function logPaymentError(Request $request)
    {
        Log::error('Erreur de paiement client', [
            'error' => $request->error ?? 'Non spécifié',
            'user_id' => $request->userId ?? 'Non spécifié',
            'pack_id' => $request->packId ?? 'Non spécifié',
            'timestamp' => $request->timestamp ?? now(),
            'paypal_order_id' => $request->paypalOrderId ?? 'Non spécifié',
            'paypal_order_data' => $request->paypalOrderData ?? 'Non spécifié',
            'client_info' => [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referrer' => $request->header('referer')
            ]
        ]);

        return response()->json(['status' => 'logged']);
    }

    public function index()
    {
       return Inertia::render('Payment/Index');
    }


    public function processQuestionCost(Request $request)
    {
        $user = User::findOrFail($request->user_id);

        if ($user->wallet_balance < $request->cost) {
            return response()->json(['error' => 'Solde insuffisant'], 400);
        }

        $user->wallet_balance -= $request->cost;
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
