<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ServiceImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_id',
        'original_name',
        'path',
        'compressed_path',
        'thumbnail_path',
        'file_size',
        'compressed_size',
        'mime_type',
        'width',
        'height',
        'alt_text',
        'caption',
        'order_index',
        'is_main',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'file_size' => 'integer',
        'compressed_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
        'order_index' => 'integer',
    ];

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function getUrlAttribute()
    {
        return Storage::url($this->compressed_path ?: $this->path);
    }

    public function getThumbnailUrlAttribute()
    {
        return $this->thumbnail_path ? Storage::url($this->thumbnail_path) : $this->url;
    }

    public function getOriginalUrlAttribute()
    {
        return Storage::url($this->path);
    }

    public function getFormattedSizeAttribute()
    {
        return $this->formatBytes($this->file_size);
    }

    public function getFormattedCompressedSizeAttribute()
    {
        return $this->compressed_size ? $this->formatBytes($this->compressed_size) : null;
    }

    public function getCompressionRatioAttribute()
    {
        if (!$this->compressed_size || !$this->file_size) {
            return null;
        }
        
        return round((1 - ($this->compressed_size / $this->file_size)) * 100, 1);
    }

    public function getDimensionsAttribute()
    {
        if (!$this->width || !$this->height) {
            return null;
        }
        
        return $this->width . ' × ' . $this->height . ' px';
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }

    public function scopeMain($query)
    {
        return $query->where('is_main', true);
    }

    public function scopeGallery($query)
    {
        return $query->where('is_main', false)->orderBy('order_index');
    }
}
