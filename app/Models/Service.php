<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'short_description',
        'main_image',
        'icon',
        'price',
        'price_type',
        'tags',
        'is_featured',
        'is_active',
        'order_index',
        'settings',
    ];

    protected $casts = [
        'tags' => 'array',
        'settings' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(ServiceImage::class)->orderBy('order_index');
    }

    public function mainImage()
    {
        return $this->hasOne(ServiceImage::class)->where('is_main', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index')->orderBy('created_at', 'desc');
    }

    public function getMainImageUrlAttribute()
    {
        if ($this->main_image) {
            return Storage::url($this->main_image);
        }
        
        $mainImage = $this->mainImage;
        if ($mainImage) {
            return Storage::url($mainImage->compressed_path ?: $mainImage->path);
        }
        
        return null;
    }

    public function getFormattedPriceAttribute()
    {
        if (!$this->price) {
            return null;
        }

        // Récupérer la devise du portfolio de l'utilisateur
        $currency = $this->user->portfolioSettings->currency ?? '€';
        $price = number_format($this->price, 2) . ' ' . $currency;
        
        switch ($this->price_type) {
            case 'hourly':
                return $price . '/h';
            case 'daily':
                return $price . '/jour';
            case 'project':
                return 'À partir de ' . $price;
            default:
                return $price;
        }
    }

    public static function getPriceTypes()
    {
        return [
            'fixed' => 'Prix fixe',
            'hourly' => 'Tarif horaire',
            'daily' => 'Tarif journalier',
            'project' => 'Prix par projet',
        ];
    }
}
