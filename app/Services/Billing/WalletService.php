<?php

namespace App\Services\Billing;

use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletService
{
    /**
     * Check if user has enough balance for a service.
     */
    public function canAfford(User $user, int $cost): bool
    {
        return $user->wallet_balance >= $cost;
    }

    /**
     * Debit user wallet atomically AFTER a successful AI call.
     * Uses lockForUpdate to prevent race conditions.
     *
     * @throws \RuntimeException if insufficient balance
     */
    public function debit(User $user, string $serviceId, int $amount, ?string $contextId = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $serviceId, $amount, $contextId) {
            // Lock the user row to prevent concurrent debits
            $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();

            if ($lockedUser->wallet_balance < $amount) {
                throw new \RuntimeException('Insufficient wallet balance');
            }

            $lockedUser->decrement('wallet_balance', $amount);

            $transaction = WalletTransaction::create([
                'user_id' => $lockedUser->id,
                'amount' => -$amount,
                'service_id' => $serviceId,
                'type' => 'debit',
                'context_id' => $contextId,
            ]);

            Log::info('Wallet debited', [
                'user_id' => $lockedUser->id,
                'amount' => $amount,
                'service_id' => $serviceId,
                'new_balance' => $lockedUser->wallet_balance,
            ]);

            return $transaction;
        });
    }

    /**
     * Credit user wallet (for token pack purchases, refunds, etc.)
     */
    public function credit(User $user, int $amount, string $serviceId = 'credit', ?string $contextId = null): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amount, $serviceId, $contextId) {
            $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();
            $lockedUser->increment('wallet_balance', $amount);

            return WalletTransaction::create([
                'user_id' => $lockedUser->id,
                'amount' => $amount,
                'service_id' => $serviceId,
                'type' => 'credit',
                'context_id' => $contextId,
            ]);
        });
    }

    /**
     * Get current balance (fresh from DB).
     */
    public function getBalance(User $user): float
    {
        return User::where('id', $user->id)->value('wallet_balance') ?? 0;
    }
}
