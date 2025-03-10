<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Payment;
use App\Http\Controllers\SponsorshipController;
use Exception;

class PayPalController extends Controller
{
    public function capturePayment(Request $request)
    {
        Log::info('Starting PayPal payment capture', [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);

        try {
            // 1. Validate request
            $validated = $request->validate([
                'orderID' => 'required|string',
                'tokens' => 'required|integer|min:1',
                'paypalDetails' => 'required|array'
            ]);

            Log::info('Payment validation passed', [
                'validated_data' => $validated
            ]);

            DB::beginTransaction();

            try {
                // 2. Get authenticated user
                $user = auth()->user();
                if (!$user) {
                    throw new Exception('User not authenticated');
                }

                Log::info('Processing payment for user', [
                    'user_id' => $user->id,
                    'current_balance' => $user->wallet_balance,
                    'tokens_to_add' => $validated['tokens']
                ]);

                // 3. Update user balance
                $oldBalance = $user->wallet_balance;
                $user->wallet_balance += $validated['tokens'];
                $user->save();

                Log::info('User balance updated', [
                    'user_id' => $user->id,
                    'old_balance' => $oldBalance,
                    'new_balance' => $user->wallet_balance
                ]);

                // 4. Create payment record
                $amount = $validated['paypalDetails']['purchase_units'][0]['amount']['value'];
                $payment = Payment::create([
                    'user_id' => $user->id,
                    'amount' => $amount,
                    'transaction_id' => $validated['orderID'],
                    'status' => 'completed',
                    'payment_method' => 'paypal',
                    'metadata' => json_encode([
                        'tokens' => $validated['tokens'],
                        'paypal_details' => $validated['paypalDetails']
                    ])
                ]);

                Log::info('Payment record created', [
                    'payment_id' => $payment->id,
                    'transaction_id' => $payment->transaction_id
                ]);

                // 5. Process referral commission if applicable
                $sponsorshipController = new SponsorshipController();
                // Convert EUR to FCFA for commission calculation (approximate conversion rate)
                $amountFCFA = $amount * 655; // Approximate EUR to FCFA conversion
                $commissionAmount = $sponsorshipController->processReferralCommission($user, $amountFCFA);

                DB::commit();

                Log::info('Payment process completed successfully', [
                    'user_id' => $user->id,
                    'payment_id' => $payment->id,
                    'referral_commission_processed' => $commissionAmount ? true : false,
                    'commission_amount' => $commissionAmount
                ]);

                return response()->json([
                    'success' => true,
                    'new_balance' => $user->wallet_balance
                ]);

            } catch (Exception $e) {
                DB::rollBack();
                Log::error('Error during payment transaction', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }

        } catch (Exception $e) {
            Log::error('Payment capture failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment capture failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
