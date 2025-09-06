<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CinetpayService;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $cinetpayService;

    public function __construct(CinetpayService $cinetpayService)
    {
        $this->cinetpayService = $cinetpayService;
    }

    /**
     * Initialiser un paiement
     */
    public function initiatePayment(Request $request)
    {
        try {
            $request->validate([
                'amount' => 'required|numeric|min:100',
                'currency' => 'required|string|in:XAF,XOF,CDF,GNF',
                'description' => 'required|string|max:255',
                'customer_name' => 'required|string|max:255',
                'customer_email' => 'required|email|max:255',
                'customer_phone_number' => 'nullable|string|max:20',
            ]);

            $transactionId = $this->cinetpayService->generateTransactionId();
            $amount = $request->input('amount');
            $currency = $request->input('currency', 'XAF');
            $description = $request->input('description');

            // Créer l'enregistrement de paiement dans la base de données
            $payment = Payment::create([
                'user_id' => auth()->id(),
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'currency' => $currency,
                'description' => $description,
                'status' => 'pending',
                'payment_method' => 'cinetpay',
                'metadata' => json_encode([
                    'customer_name' => $request->customer_name,
                    'customer_email' => $request->customer_email,
                    'customer_phone_number' => $request->customer_phone_number,
                    'request_data' => $request->all()
                ])
            ]);

            // Préparer les paramètres pour CinetPay
            $additionalParams = [
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone_number' => $request->customer_phone_number,
                'notify_url' => route('payment.notify'),
                'return_url' => route('payment.return'),
                'channels' => 'ALL',
                'lang' => 'fr',
                'metadata' => json_encode(['payment_id' => $payment->id])
            ];

            $response = $this->cinetpayService->generatePayment(
                $transactionId, 
                $amount, 
                $currency, 
                $description, 
                $additionalParams
            );

            if ($response['success']) {
                // Mettre à jour le paiement avec l'ID externe
                $payment->update([
                    'external_id' => $response['data']['payment_token'] ?? null,
                    'status' => 'initiated'
                ]);

                return response()->json([
                    'success' => true,
                    'payment_url' => $response['data']['payment_url'],
                    'transaction_id' => $transactionId
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $response['message'] ?? 'Erreur lors de l\'initialisation du paiement'
                ], 400);
            }

        } catch (\Exception $e) {
            Log::error('Payment initiation error', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur interne du serveur'
            ], 500);
        }
    }

    /**
     * Traiter la notification de paiement (IPN)
     */
    public function notify(Request $request)
    {
        try {
            Log::info('CinetPay notification received', $request->all());

            if ($request->has('cpm_trans_id')) {
                $transactionId = $request->input('cpm_trans_id');

                // Chercher le paiement dans notre base
                $payment = Payment::where('transaction_id', $transactionId)->first();
                
                if (!$payment) {
                    Log::warning('Payment not found for transaction', ['transaction_id' => $transactionId]);
                    return response()->json(['error' => 'Paiement non trouvé'], 404);
                }

                // Si le paiement est déjà traité avec succès, ne rien faire
                if ($payment->status === 'completed') {
                    Log::info('Payment already processed', ['transaction_id' => $transactionId]);
                    return response()->json(['success' => 'Paiement déjà traité'], 200);
                }

                // Vérifier le statut du paiement auprès de CinetPay
                $response = $this->cinetpayService->checkPaymentStatus($transactionId);

                if ($response['success']) {
                    $statusData = $response['data'];
                    
                    if ($response['code'] === '00' && $statusData['status'] === 'ACCEPTED') {
                        // Paiement réussi
                        DB::beginTransaction();
                        
                        try {
                            $payment->update([
                                'status' => 'completed',
                                'completed_at' => now(),
                                'external_data' => json_encode($response)
                            ]);

                            // Mettre à jour le solde de l'utilisateur
                            $this->updateUserBalance($payment);

                            DB::commit();

                            Log::info('Payment completed successfully', [
                                'transaction_id' => $transactionId,
                                'payment_id' => $payment->id,
                                'amount' => $statusData['amount']
                            ]);

                            return response()->json(['success' => 'Paiement effectué avec succès'], 200);
                            
                        } catch (\Exception $e) {
                            DB::rollBack();
                            Log::error('Error updating payment status', [
                                'error' => $e->getMessage(),
                                'transaction_id' => $transactionId
                            ]);
                            throw $e;
                        }
                    } else {
                        // Paiement échoué ou refusé
                        $payment->update([
                            'status' => 'failed',
                            'external_data' => json_encode($response)
                        ]);

                        Log::warning('Payment failed', [
                            'transaction_id' => $transactionId,
                            'code' => $response['code'],
                            'message' => $response['message']
                        ]);

                        return response()->json(['error' => 'Paiement échoué: ' . $response['message']], 400);
                    }
                } else {
                    Log::error('Failed to check payment status', [
                        'transaction_id' => $transactionId,
                        'response' => $response
                    ]);
                    
                    return response()->json(['error' => 'Erreur lors de la vérification du paiement'], 500);
                }
            } else {
                return response()->json(['error' => 'cpm_trans_id non fourni'], 400);
            }

        } catch (\Exception $e) {
            Log::error('CinetPay notification error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json(['error' => 'Erreur interne du serveur'], 500);
        }
    }

    /**
     * Page de retour après paiement
     */
    public function return(Request $request)
    {
        try {
            Log::info('CinetPay return page accessed', [
                'method' => $request->method(),
                'data' => $request->all()
            ]);

            $transactionId = $request->input('transaction_id') ?? $request->input('cpm_trans_id');
            
            if (!$transactionId) {
                Log::warning('CinetPay return: Transaction ID manquant');
                return redirect()->route('payment.failed')->with('error', 'Transaction ID manquant');
            }

            $payment = Payment::where('transaction_id', $transactionId)->first();
            
            if (!$payment) {
                Log::warning('CinetPay return: Paiement non trouvé', ['transaction_id' => $transactionId]);
                return redirect()->route('payment.failed')->with('error', 'Paiement non trouvé');
            }

            // Vérifier le statut du paiement auprès de CinetPay
            $response = $this->cinetpayService->checkPaymentStatus($transactionId);

            if ($response['success'] && $response['code'] === '00' && $response['data']['status'] === 'ACCEPTED') {
                // Paiement réussi
                Log::info('CinetPay return: Paiement confirmé réussi', [
                    'transaction_id' => $transactionId,
                    'amount' => $response['data']['amount']
                ]);
                
                return redirect()->route('payment.success')->with([
                    'success' => 'Paiement effectué avec succès',
                    'transaction_id' => $transactionId,
                    'amount' => $response['data']['amount']
                ]);
            } else {
                // Paiement échoué ou en attente
                Log::warning('CinetPay return: Paiement non confirmé', [
                    'transaction_id' => $transactionId,
                    'status' => $response['data']['status'] ?? 'Unknown',
                    'code' => $response['code']
                ]);
                
                return redirect()->route('payment.failed')->with('error', 'Le paiement n\'a pas pu être confirmé');
            }

        } catch (\Exception $e) {
            Log::error('CinetPay return page error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('payment.failed')->with('error', 'Erreur lors du traitement du retour');
        }
    }

    /**
     * Mettre à jour le solde de l'utilisateur après un paiement réussi
     */
    private function updateUserBalance(Payment $payment)
    {
        try {
            $user = $payment->user;
            $metadata = json_decode($payment->metadata, true);
            
            // Calculer les tokens à ajouter (exemple: 1 token = 60 FCFA)
            $tokensToAdd = floor($payment->amount / 60);
            
            // Mettre à jour le solde de l'utilisateur
            $oldBalance = $user->wallet_balance;
            $user->increment('wallet_balance', $tokensToAdd);
            
            Log::info('User balance updated', [
                'user_id' => $user->id,
                'tokens_added' => $tokensToAdd,
                'old_balance' => $oldBalance,
                'new_balance' => $user->wallet_balance,
                'payment_amount' => $payment->amount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update user balance', [
                'payment_id' => $payment->id,
                'user_id' => $payment->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Page d'accueil des paiements
     */
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

    /**
     * Mettre à jour le solde du portefeuille
     */
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

    /**
     * Mettre à jour le portefeuille après paiement externe
     */
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
            Log::error('Wallet update error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update wallet'
            ], 500);
        }
    }

    /**
     * Traiter le coût d'une question
     */
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

    /**
     * Traiter le téléchargement
     */
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
}