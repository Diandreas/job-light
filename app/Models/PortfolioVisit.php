<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioVisit extends Model
{
    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'referer',
        'device_type',
        'country',
        'visited_at'
    ];

    protected $casts = [
        'visited_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function recordVisit($user_id)
    {
        // Détection basique du type d'appareil
        $userAgent = request()->userAgent();
        $deviceType = 'desktop';
        if (strpos(strtolower($userAgent), 'mobile') !== false) {
            $deviceType = 'mobile';
        } elseif (strpos(strtolower($userAgent), 'tablet') !== false) {
            $deviceType = 'tablet';
        }

        return self::create([
            'user_id' => $user_id,
            'ip_address' => request()->ip(),
            'user_agent' => $userAgent,
            'referer' => request()->header('referer'),
            'device_type' => $deviceType,
            'country' => geoip()->getLocation(request()->ip())->country, // Nécessite l'installation du package geoip
            'visited_at' => now()
        ]);
    }

    public static function getStats($user_id)
    {
        return [
            'total_views' => self::where('user_id', $user_id)->count(),
            'weekly_views' => self::where('user_id', $user_id)
                ->where('visited_at', '>=', now()->subWeek())
                ->count(),
            'monthly_views' => self::where('user_id', $user_id)
                ->where('visited_at', '>=', now()->subMonth())
                ->count(),
            'devices' => self::where('user_id', $user_id)
                ->selectRaw('device_type, count(*) as count')
                ->groupBy('device_type')
                ->get(),
            'countries' => self::where('user_id', $user_id)
                ->selectRaw('country, count(*) as count')
                ->groupBy('country')
                ->get(),
            'recent_visits' => self::where('user_id', $user_id)
                ->where('visited_at', '>=', now()->subDay())
                ->orderBy('visited_at', 'desc')
                ->limit(10)
                ->get()
        ];
    }
}
