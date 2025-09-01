<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BlogPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'status', // 'draft', 'published', 'scheduled'
        'published_at',
        'author_id',
        'category',
        'tags',
        'reading_time',
        'views_count',
        'featured',
        'seo_score'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'tags' => 'array',
        'featured' => 'boolean',
        'views_count' => 'integer',
        'reading_time' => 'integer',
        'seo_score' => 'integer'
    ];

    // Relations
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    // Mutators
    public function setTitleAttribute($value)
    {
        $this->attributes['title'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    // Accessors
    public function getUrlAttribute()
    {
        return route('blog.show', $this->slug);
    }

    public function getReadingTimeAttribute($value)
    {
        if ($value) return $value;
        
        // Calculer le temps de lecture (250 mots/minute)
        $wordCount = str_word_count(strip_tags($this->content));
        return max(1, ceil($wordCount / 250));
    }

    // Méthodes utilitaires
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function isPublished()
    {
        return $this->status === 'published' && $this->published_at <= now();
    }

    public function calculateSeoScore()
    {
        $score = 0;
        
        // Titre (20 points)
        if ($this->title && strlen($this->title) >= 30 && strlen($this->title) <= 60) {
            $score += 20;
        } elseif ($this->title && strlen($this->title) >= 20) {
            $score += 10;
        }
        
        // Meta description (20 points)
        if ($this->meta_description && strlen($this->meta_description) >= 120 && strlen($this->meta_description) <= 160) {
            $score += 20;
        } elseif ($this->meta_description && strlen($this->meta_description) >= 80) {
            $score += 10;
        }
        
        // Contenu (30 points)
        if ($this->content && strlen($this->content) >= 1000) {
            $score += 30;
        } elseif ($this->content && strlen($this->content) >= 500) {
            $score += 15;
        }
        
        // Image featured (10 points)
        if ($this->featured_image) {
            $score += 10;
        }
        
        // Tags (10 points)
        if ($this->tags && count($this->tags) >= 3) {
            $score += 10;
        } elseif ($this->tags && count($this->tags) >= 1) {
            $score += 5;
        }
        
        // Mots-clés (10 points)
        if ($this->meta_keywords) {
            $score += 10;
        }
        
        $this->seo_score = $score;
        $this->save();
        
        return $score;
    }
}