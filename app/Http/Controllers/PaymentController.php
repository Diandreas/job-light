<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function update(Request $request)
    {
        Log::info('Starting wallet balance update process', [
            'user_id' => $request->user()->id,
            'current_balance' => $request->user()->wallet_balance,
            'requested_balance' => $request->wallet_balance,
            'request_data' => $request->all()
        ]);

        try {
            DB::beginTransaction();
            Log::info('DB transaction started');

            $validated = $request->validate([
                'wallet_balance' => 'required|integer|min:0',
            ]);
            Log::info('Request validation passed', ['validated_data' => $validated]);

            $user = User::lockForUpdate()->find($request->user()->id);

            if (!$user) {
                Log::error('User not found during balance update', [
                    'user_id' => $request->user()->id
                ]);
                throw new \Exception('User not found');
            }

            Log::info('User found and locked for update', [
                'user_id' => $user->id,
                'current_balance' => $user->wallet_balance
            ]);

            $oldBalance = $user->wallet_balance;
            $user->wallet_balance = $validated['wallet_balance'];
            $user->save();

            Log::info('Balance updated successfully', [
                'user_id' => $user->id,
                'old_balance' => $oldBalance,
                'new_balance' => $user->wallet_balance,
                'difference' => $user->wallet_balance - $oldBalance
            ]);

            DB::commit();
            Log::info('DB transaction committed successfully');

            return response()->json([
                'success' => true,
                'new_balance' => $user->wallet_balance
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error during balance update', [
                'error_message' => $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'user_id' => $request->user()->id,
                'requested_balance' => $request->wallet_balance
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the balance'
            ], 500);
        }
    }
    public function updateWallet(Request $request)
    {
        try {
            $user = User::findOrFail($request->user_id);
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $request->amount,
                'reference' => $request->payment_reference,
                'payment_method' => $request->payment_method,
                'status' => 'completed'
            ]);

            $user->wallet_balance += $request->amount;
            $user->save();

            return response()->json([
                'success' => true,
                'balance' => $user->wallet_balance
            ]);
        } catch (\Exception $e) {
            \Log::error('Wallet update error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update wallet'
            ], 500);
        }
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

    public function index()
    {
        $clientId = config('paypal.client_id');

        Log::info('Loading payment page', [
            'user_id' => auth()->id(),
            'paypal_config' => [
                'client_id_exists' => !empty($clientId),
                'mode' => config('paypal.mode')
            ]
        ]);

        if (empty($clientId)) {
            Log::error('PayPal client ID is not configured');
        }

        return Inertia::render('Payment/Index', [
            'paypalConfig' => [
                'clientId' => $clientId,
                'mode' => config('paypal.mode'),
            ],
        ]);
    }

    public function checkDownloadStatus($modelId)
    {
        try {
            $user = auth()->user();
            
            // Vérifier si l'utilisateur a déjà téléchargé ce modèle
            $hasDownloaded = Payment::where('user_id', $user->id)
                ->where('transaction_id', 'like', "%model_{$modelId}%")
                ->where('status', 'completed')
                ->exists();

            return response()->json([
                'hasDownloaded' => $hasDownloaded,
                'modelId' => $modelId
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking download status', [
                'error' => $e->getMessage(),
                'modelId' => $modelId,
                'user_id' => auth()->id()
            ]);

            return response()->json(['error' => 'Unable to check download status'], 500);
        }
    }

    public function getBalance()
    {
        try {
            $user = auth()->user();
            return response()->json([
                'balance' => $user->wallet_balance ?? 0
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting wallet balance', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            return response()->json(['error' => 'Unable to get balance'], 500);
        }
    }
}
