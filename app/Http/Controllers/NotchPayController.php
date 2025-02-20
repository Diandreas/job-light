<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use Exception;

class NotchPayController extends Controller
{
    public function handleCallback(Request $request)
    {
        Log::info('NotchPay callback received', [
            'parameters' => $request->all(),
            'reference' => $request->reference,
            'trxref' => $request->trxref,
            'notchpay_trxref' => $request->notchpay_trxref,
            'status' => $request->status
        ]);

        try {
            // Verify the payment status
            if ($request->status !== 'complete') {
                Log::warning('Payment not complete', ['status' => $request->status]);
                throw new Exception('Payment was not completed');
            }

            DB::beginTransaction();

            // Try to find the payment using both reference and trxref
            $payment = Payment::where(function($query) use ($request) {
                $query->where('transaction_id', $request->notchpay_trxref)
                    ->orWhere('transaction_id', $request->reference)
                    ->orWhere('transaction_id', $request->trxref);
            })
                ->where('status', 'pending')
                ->first();

            Log::info('Found payment record', [
                'payment' => $payment ? $payment->toArray() : 'Not found',
                'searched_refs' => [
                    'notchpay_trxref' => $request->notchpay_trxref,
                    'reference' => $request->reference,
                    'trxref' => $request->trxref
                ]
            ]);

            if (!$payment) {
                throw new Exception('Payment not found or already processed');
            }

            $metadata = json_decode($payment->metadata, true);
            $tokens = $metadata['tokens'];

            // Update user balance
            $user = $payment->user;
            $oldBalance = $user->wallet_balance;
            $user->wallet_balance += $tokens;
            $user->save();

            // Update payment status
            $payment->status = 'completed';
            $payment->save();

            Log::info('Payment completed successfully', [
                'payment_id' => $payment->id,
                'user_id' => $user->id,
                'old_balance' => $oldBalance,
                'new_balance' => $user->wallet_balance,
                'tokens_added' => $tokens
            ]);

            DB::commit();

            // Redirect to success page with success message
            return redirect()->route('payment.index')
                ->with('success', 'Paiement réussi ! ' . $tokens . ' jetons ont été ajoutés à votre compte.');

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error processing payment callback', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            // Redirect to payment page with error message
            return redirect()->route('payment.index')
                ->with('error', 'Erreur lors du traitement du paiement : ' . $e->getMessage());
        }
    }
    public function initializePayment(Request $request)
    {
        Log::info('Starting NotchPay payment initialization', [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);

        try {
            // 1. Validate request
            $validated = $request->validate([
                'tokens' => 'required|integer|min:1',
//                'email' => 'required|email',
            ]);

            $user = auth()->user();
            if (!$user) {
                throw new Exception('User not authenticated');
            }

            // 2. Calculate amount based on token pack
            $amount = $this->calculateAmount($validated['tokens']);

            // 3. Initialize payment with NotchPay API
            $fields = [
                'email' => 'guidy@gmail',
                'amount' => (string)$amount,
                'currency' => 'XAF',
                'description' => $validated['tokens'] . ' tokens purchase',
                'reference' => 'tok_' . uniqid(),
                'callback' => route('payment.callback'),
                'sandbox' => config('services.notchpay.sandbox', true) // Enable sandbox mode by default
            ];

            Log::info('Initiating NotchPay API request', [
                'fields' => $fields,
                'endpoint' => 'payments/initialize'
            ]);

            $response = $this->makeNotchPayRequest('payments/initialize', $fields);

            if (!isset($response['authorization_url'])) {
                throw new Exception('Invalid response from NotchPay');
            }

            Log::info('Creating payment record', [
                'user_id' => $user->id,
                'amount' => $amount,
                'response' => $response
            ]);

            // 4. Create pending payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'transaction_id' => $response['transaction']['reference'],
                'status' => 'pending',
                'payment_method' => 'notchpay',
                'metadata' => json_encode([
                    'tokens' => $validated['tokens'],
                    'authorization_url' => $response['authorization_url'],
                    'notchpay_reference' => $response['transaction']['reference']
                ])
            ]);

            Log::info('NotchPay payment initialized', [
                'payment_id' => $payment->id,
                'transaction_id' => $payment->transaction_id
            ]);

            return response()->json([
                'success' => true,
                'authorization_url' => $response['authorization_url']
            ]);

        } catch (Exception $e) {
            Log::error('NotchPay payment initialization failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initialization failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        Log::info('Received NotchPay webhook', [
            'payload' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        try {
            // 1. Verify webhook signature
            $signature = $request->header('x-notch-signature');
            $hash = hash('sha256', config('services.notchpay.webhook_secret'));

            if (!hash_equals($hash, $signature)) {
                throw new Exception('Invalid webhook signature');
            }

            // 2. Process webhook data
            $payload = $request->all();

            if ($payload['event'] !== 'payment.complete') {
                return response()->json(['status' => 'ignored']);
            }

            DB::beginTransaction();

            try {
                // 3. Update payment record
                $payment = Payment::where('transaction_id', $payload['data']['reference'])
                    ->where('status', 'pending')
                    ->firstOrFail();

                $metadata = json_decode($payment->metadata, true);
                $tokens = $metadata['tokens'];

                // 4. Update user balance
                $user = $payment->user;
                $oldBalance = $user->wallet_balance;
                $user->wallet_balance += $tokens;
                $user->save();

                // 5. Update payment status
                $payment->status = 'completed';
                $payment->save();

                DB::commit();

                Log::info('NotchPay payment completed successfully', [
                    'payment_id' => $payment->id,
                    'user_id' => $user->id,
                    'old_balance' => $oldBalance,
                    'new_balance' => $user->wallet_balance
                ]);

                return response()->json(['status' => 'success']);

            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (Exception $e) {
            Log::error('NotchPay webhook processing failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function makeNotchPayRequest($endpoint, $data)
    {
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://api.notchpay.co/' . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . config('services.notchpay.public_key'),
                'Content-Type: application/json',
                'Accept: application/json',
                'Cache-Control: no-cache',
            ]
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            throw new Exception('Failed to connect to NotchPay: ' . $err);
        }

        $decodedResponse = json_decode($response, true);

        if ($httpCode >= 400) {
            Log::error('NotchPay API error', [
                'status_code' => $httpCode,
                'response' => $decodedResponse,
                'request_data' => $data
            ]);
            throw new Exception('NotchPay API error: ' . ($decodedResponse['message'] ?? 'Unknown error'));
        }

        return $decodedResponse;
    }

    private function calculateAmount($tokens)
    {
        // This should match your frontend TOKEN_PACKS logic
        $tokenPacks = [
            10 => 655,
            50 => 3275,
            100 => 6550,
            300 => 19650
        ];

        return $tokenPacks[$tokens] ?? ($tokens * 100); // Default to 100 XAF per token
    }
}
