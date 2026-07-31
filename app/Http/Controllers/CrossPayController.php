<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;

class CrossPayController extends Controller
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.crosspay.url', 'http://localhost:3000');
    }

    /**
     * Initier un CashOut Mobile Money (paiement jetons → téléphone utilisateur)
     */
    public function cashin(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'serviceId'   => 'required|string',
            'payItemId'   => 'required|string',
            'amount'      => 'required|integer|min:100',
            'phoneNumber' => 'required|string',
            'tokens'      => 'required|integer|min:1',
        ]);

        $payload = [
            'userId'           => (string) $user->id,
            'serviceId'        => $request->serviceId,
            'payItemId'        => $request->payItemId,
            'amount'           => $request->amount,
            'destinationPhone' => $request->phoneNumber,
            'customerName'     => $user->name,
            'customerEmail'    => $user->email ?? '',
        ];

        try {
            $response = Http::timeout(30)->post("{$this->baseUrl}/payments/cashout", $payload);
            $data = $response->json();

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => $data['message'] ?? 'Erreur serveur de paiement',
                ], 400);
            }

            $realStatus = $data['status'] ?? 'PENDING';
            $isSuccess = $realStatus === 'SUCCESS';

            Payment::create([
                'user_id'        => $user->id,
                'transaction_id' => $data['trid'] ?? uniqid('cp_'),
                'amount'         => $request->amount,
                'currency'       => 'XAF',
                'description'    => "Achat jetons via SmobilPay (CashOut) — {$request->tokens} jetons",
                'status'         => $isSuccess ? 'completed' : 'pending',
                'payment_method' => 'cross_payment',
                'external_id'    => $data['id'] ?? null,
                'metadata'       => ['tokens' => $request->tokens],
            ]);

            if ($isSuccess) {
                $user->increment('wallet_balance', $request->tokens);
                Log::info('CrossPay CashOut SUCCESS immédiat', [
                    'user_id' => $user->id,
                    'tokens'  => $request->tokens,
                    'trid'    => $data['trid'],
                ]);

                return response()->json([
                    'success'     => true,
                    'status'      => 'SUCCESS',
                    'trid'        => $data['trid'],
                    'new_balance' => $user->wallet_balance,
                    'tokens'      => $request->tokens,
                ]);
            }

            return response()->json([
                'success' => true,
                'status'  => 'PENDING',
                'trid'    => $data['trid'],
            ]);

        } catch (\Exception $e) {
            Log::error('CrossPay CashOut error', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Erreur de connexion au serveur de paiement'], 500);
        }
    }

    /**
     * Vérifier le statut d'une transaction PENDING et créditer si SUCCESS
     */
    public function verify(Request $request)
    {
        $user = $request->user();
        $trid = $request->query('trid');

        if (!$trid) {
            return response()->json(['success' => false, 'message' => 'trid manquant'], 400);
        }

        try {
            $response = Http::timeout(15)->get("{$this->baseUrl}/payments/verify", ['trid' => $trid]);
            $data = $response->json();

            // Le vrai statut est dans smobilpayStatus[0].status (pas transaction.status qui ne se met pas à jour)
            $smobilpayStatus = $data['smobilpayStatus'][0] ?? [];
            $rawStatus = strtoupper(trim($smobilpayStatus['status'] ?? 'PENDING'));
            $errorCode = $smobilpayStatus['errorCode'] ?? $smobilpayStatus['respCode'] ?? null;
            $hasErrorCode = $errorCode !== null && $errorCode !== '' && (string) $errorCode !== '0';

            // Mapping des statuts SmobilPay → états logiques.
            // Un errorCode présent => échec, même si le statut brut dit SUCCESS.
            if ($hasErrorCode || in_array($rawStatus, ['ERRORED', 'ERROR', 'EXPIRED', 'CANCELLED', 'FAILED'])) {
                $realStatus = 'FAILED';
            } elseif (in_array($rawStatus, ['SUCCESS', 'SUCCESSFUL'])) {
                $realStatus = 'SUCCESS';
            } else {
                $realStatus = 'PENDING';
            }

            // Créditer seulement si SUCCESS et pas encore crédité
            if ($realStatus === 'SUCCESS') {
                $payment = Payment::where('transaction_id', $trid)
                    ->where('user_id', $user->id)
                    ->where('status', '!=', 'completed')
                    ->first();

                if ($payment) {
                    $tokens = $payment->metadata['tokens'] ?? 0;
                    $user->increment('wallet_balance', $tokens);
                    $payment->update(['status' => 'completed']);

                    Log::info('CrossPay verify SUCCESS → tokens crédités', [
                        'user_id' => $user->id,
                        'tokens'  => $tokens,
                        'trid'    => $trid,
                    ]);

                    return response()->json([
                        'success'     => true,
                        'status'      => 'SUCCESS',
                        'new_balance' => $user->wallet_balance,
                        'tokens'      => $tokens,
                    ]);
                }

                // Déjà crédité
                return response()->json(['success' => true, 'status' => 'SUCCESS', 'already_credited' => true]);
            }

            if ($realStatus === 'FAILED') {
                Payment::where('transaction_id', $trid)->where('user_id', $user->id)
                    ->update(['status' => 'failed']);

                $description = $data['transaction']['description'] ?? null;
                if (!$description) {
                    $description = $errorCode
                        ? "Le paiement a échoué (Code Maviance: {$errorCode}). Aucun montant n'a été débité."
                        : "Le paiement a échoué. Aucun montant n'a été débité.";
                }

                Log::warning('CrossPay verify FAILED', [
                    'trid' => $trid, 'errorCode' => $errorCode, 'rawStatus' => $rawStatus,
                ]);

                return response()->json([
                    'success'    => true,
                    'status'     => 'FAILED',
                    'message'    => $description,
                    'error_code' => $errorCode,
                ]);
            }

            return response()->json([
                'success' => true,
                'status'  => $realStatus, // PENDING
            ]);

        } catch (\Exception $e) {
            Log::error('CrossPay verify error', ['error' => $e->getMessage(), 'trid' => $trid]);
            return response()->json(['success' => false, 'message' => 'Erreur de vérification'], 500);
        }
    }
}
