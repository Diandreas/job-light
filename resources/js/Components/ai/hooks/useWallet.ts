import { useState, useCallback } from 'react';

/**
 * Hook for managing wallet balance state.
 * The actual debit now happens server-side after AI success,
 * so this hook mainly tracks the local state for UI display.
 */
export function useWallet(initialBalance: number) {
    const [balance, setBalance] = useState(initialBalance);

    const canAfford = useCallback((cost: number) => {
        return balance >= cost;
    }, [balance]);

    /**
     * Update balance from server response (after successful AI call).
     */
    const updateBalance = useCallback((newBalance: number) => {
        setBalance(newBalance);
    }, []);

    /**
     * Optimistically subtract cost for UI feedback.
     * Use updateBalance with server value when response arrives.
     */
    const optimisticDebit = useCallback((cost: number) => {
        setBalance(prev => prev - cost);
    }, []);

    return {
        balance,
        canAfford,
        updateBalance,
        optimisticDebit,
        setBalance,
    };
}
