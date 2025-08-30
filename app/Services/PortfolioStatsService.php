<?php

namespace App\Services;

use App\Models\User;
use App\Models\PortfolioVisit;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PortfolioStatsService
{
    /**
     * Enregistrer une visite de portfolio
     */
    public function recordVisit(User $user, array $metadata = [])
    {
        try {
            PortfolioVisit::create([
                'user_id' => $user->id,
                'visited_at' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'referrer' => request()->header('referer'),
                'metadata' => json_encode($metadata)
            ]);

            // Invalider le cache des statistiques
            Cache::forget("portfolio_stats_{$user->id}");
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'enregistrement de la visite du portfolio', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Enregistrer un partage de portfolio
     */
    public function recordShare(User $user, string $platform, array $metadata = [])
    {
        try {
            // Enregistrer dans les visites avec un type spécial
            PortfolioVisit::create([
                'user_id' => $user->id,
                'visited_at' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'referrer' => $platform,
                'metadata' => json_encode(array_merge($metadata, [
                    'type' => 'share',
                    'platform' => $platform
                ]))
            ]);

            // Invalider le cache des statistiques
            Cache::forget("portfolio_stats_{$user->id}");
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'enregistrement du partage du portfolio', [
                'user_id' => $user->id,
                'platform' => $platform,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Obtenir les statistiques du portfolio
     */
    public function getStats(User $user): array
    {
        return Cache::remember("portfolio_stats_{$user->id}", 300, function () use ($user) {
            $visits = PortfolioVisit::where('user_id', $user->id);
            
            // Statistiques de base
            $totalVisits = $visits->count();
            $uniqueVisits = $visits->distinct('ip_address')->count();
            
            // Partages (visites avec type 'share')
            $shares = $visits->whereJsonContains('metadata->type', 'share')->count();
            
            // Dernière visite
            $lastVisit = $visits->latest('visited_at')->first();
            
            // Visites par plateforme de partage
            $sharesByPlatform = $visits
                ->whereJsonContains('metadata->type', 'share')
                ->select(DB::raw('JSON_EXTRACT(metadata, "$.platform") as platform'), DB::raw('count(*) as count'))
                ->groupBy('platform')
                ->pluck('count', 'platform')
                ->toArray();

            // Visites des 30 derniers jours
            $recentVisits = $visits
                ->where('visited_at', '>=', Carbon::now()->subDays(30))
                ->selectRaw('DATE(visited_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->pluck('count', 'date')
                ->toArray();

            // Taux d'engagement
            $engagementRate = $totalVisits > 0 ? ($shares / $totalVisits) * 100 : 0;

            return [
                'views' => $totalVisits,
                'unique_views' => $uniqueVisits,
                'shares' => $shares,
                'engagement_rate' => round($engagementRate, 1),
                'last_viewed' => $lastVisit ? $lastVisit->visited_at->format('d/m/Y H:i') : null,
                'last_viewed_human' => $lastVisit ? $lastVisit->visited_at->diffForHumans() : null,
                'is_public' => $user->portfolioSettings?->is_public ?? true,
                'shares_by_platform' => $sharesByPlatform,
                'recent_visits' => $recentVisits,
                'portfolio_url' => url("/portfolio/{$user->username}"),
                'created_at' => $user->portfolioSettings?->created_at?->format('d/m/Y') ?? $user->created_at->format('d/m/Y')
            ];
        });
    }

    /**
     * Obtenir les statistiques de partage par plateforme
     */
    public function getShareStats(User $user): array
    {
        return Cache::remember("portfolio_share_stats_{$user->id}", 600, function () use ($user) {
            $shares = PortfolioVisit::where('user_id', $user->id)
                ->whereJsonContains('metadata->type', 'share')
                ->selectRaw('JSON_EXTRACT(metadata, "$.platform") as platform, COUNT(*) as count')
                ->groupBy('platform')
                ->pluck('count', 'platform')
                ->toArray();

            return [
                'linkedin' => $shares['linkedin'] ?? 0,
                'twitter' => $shares['twitter'] ?? 0,
                'facebook' => $shares['facebook'] ?? 0,
                'whatsapp' => $shares['whatsapp'] ?? 0,
                'email' => $shares['email'] ?? 0,
                'qr_code' => $shares['qr_code'] ?? 0,
                'total' => array_sum($shares)
            ];
        });
    }

    /**
     * Obtenir les tendances de visite
     */
    public function getVisitTrends(User $user, int $days = 30): array
    {
        $visits = PortfolioVisit::where('user_id', $user->id)
            ->where('visited_at', '>=', Carbon::now()->subDays($days))
            ->selectRaw('DATE(visited_at) as date, COUNT(*) as visits')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Remplir les jours manquants avec 0
        $trends = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $trends[$date] = $visits->where('date', $date)->first()?->visits ?? 0;
        }

        return $trends;
    }

    /**
     * Générer un QR code personnalisé avec le branding Guidy
     */
    public function generateCustomQRCode(string $url, array $options = []): string
    {
        $defaultOptions = [
            'size' => '300x300',
            'format' => 'png',
            'color' => 'F59E0B', // Couleur principale Guidy (sans #)
            'bgcolor' => 'ffffff',
            'margin' => '15',
            'qzone' => '3',
            'ecc' => 'M' // Correction d'erreur moyenne
        ];

        $options = array_merge($defaultOptions, $options);
        
        $params = http_build_query([
            'size' => $options['size'],
            'data' => $url,
            'format' => $options['format'],
            'color' => $options['color'],
            'bgcolor' => $options['bgcolor'],
            'margin' => $options['margin'],
            'qzone' => $options['qzone'],
            'ecc' => $options['ecc']
        ]);

        return "https://api.qrserver.com/v1/create-qr-code/?{$params}";
    }

    /**
     * Nettoyer les anciennes statistiques
     */
    public function cleanOldStats(int $daysToKeep = 90): int
    {
        $cutoffDate = Carbon::now()->subDays($daysToKeep);
        
        return PortfolioVisit::where('visited_at', '<', $cutoffDate)->delete();
    }

    /**
     * Obtenir le classement des portfolios les plus visités
     */
    public function getTopPortfolios(int $limit = 10): array
    {
        return PortfolioVisit::select('user_id', DB::raw('COUNT(*) as visit_count'))
            ->with('user:id,name,username,email')
            ->where('visited_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('user_id')
            ->orderByDesc('visit_count')
            ->limit($limit)
            ->get()
            ->toArray();
    }
}