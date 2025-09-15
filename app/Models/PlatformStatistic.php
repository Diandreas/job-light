<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'metric_name',
        'value',
        'breakdown'
    ];

    protected $casts = [
        'date' => 'date',
        'value' => 'integer',
        'breakdown' => 'array'
    ];

    // Scopes
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeForMetric($query, $metric)
    {
        return $query->where('metric_name', $metric);
    }

    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Méthodes statiques pour enregistrer des statistiques
    public static function recordMetric($date, $metric, $value, $breakdown = null)
    {
        return self::updateOrCreate(
            ['date' => $date, 'metric_name' => $metric],
            ['value' => $value, 'breakdown' => $breakdown]
        );
    }

    public static function incrementMetric($date, $metric, $increment = 1)
    {
        $stat = self::firstOrCreate(
            ['date' => $date, 'metric_name' => $metric],
            ['value' => 0]
        );
        
        $stat->increment('value', $increment);
        return $stat;
    }
}
