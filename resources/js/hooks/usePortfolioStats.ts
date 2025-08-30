import { useState, useEffect, useCallback } from 'react';

interface PortfolioStats {
    views: number;
    unique_views: number;
    shares: number;
    engagement_rate: number;
    last_viewed: string | null;
    last_viewed_human: string | null;
    is_public: boolean;
    shares_by_platform: Record<string, number>;
    recent_visits: Record<string, number>;
    portfolio_url: string;
    created_at: string;
}

interface UsePortfolioStatsReturn {
    stats: PortfolioStats | null;
    loading: boolean;
    error: string | null;
    refreshStats: () => Promise<void>;
    recordShare: (platform: string, metadata?: any) => Promise<boolean>;
}

export const usePortfolioStats = (initialStats?: PortfolioStats): UsePortfolioStatsReturn => {
    const [stats, setStats] = useState<PortfolioStats | null>(initialStats || null);
    const [loading, setLoading] = useState(!initialStats);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/portfolio/stats', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des statistiques');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            console.error('Erreur lors du chargement des statistiques:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const recordShare = useCallback(async (platform: string, metadata?: any): Promise<boolean> => {
        try {
            const response = await fetch('/portfolio/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    platform,
                    metadata: {
                        ...metadata,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.stats) {
                    setStats(data.stats);
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du partage:', error);
            return false;
        }
    }, []);

    const refreshStats = useCallback(async () => {
        await fetchStats();
    }, [fetchStats]);

    // Charger les statistiques au montage si pas d'initialStats
    useEffect(() => {
        if (!initialStats) {
            fetchStats();
        }
    }, [initialStats, fetchStats]);

    return {
        stats,
        loading,
        error,
        refreshStats,
        recordShare
    };
};

export default usePortfolioStats;