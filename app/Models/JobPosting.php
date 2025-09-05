<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPosting extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'title',
        'description',
        'requirements',
        'location',
        'employment_type', // 'full-time', 'part-time', 'contract', 'internship'
        'salary_min',
        'salary_max',
        'salary_currency',
        'remote_work',
        'experience_level', // 'entry', 'mid', 'senior', 'executive'
        'industry',
        'skills_required',
        'application_deadline',
        'application_email',
        'application_url',
        'status', // 'draft', 'published', 'closed', 'expired'
        'featured',
        'auto_notify_members', // Pour APIDCA
        'target_associations', // JSON array des associations à notifier
        'posted_by_user_id',
        'views_count',
        'applications_count'
    ];

    protected $casts = [
        'salary_min' => 'decimal:2',
        'salary_max' => 'decimal:2',
        'remote_work' => 'boolean',
        'featured' => 'boolean',
        'auto_notify_members' => 'boolean',
        'skills_required' => 'array',
        'target_associations' => 'array',
        'application_deadline' => 'datetime',
        'views_count' => 'integer',
        'applications_count' => 'integer'
    ];

    // Relations
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function postedBy()
    {
        return $this->belongsTo(User::class, 'posted_by_user_id');
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'published')
                    ->where(function($q) {
                        $q->whereNull('application_deadline')
                          ->orWhere('application_deadline', '>', now());
                    });
    }

    public function scopeArchivesRelated($query)
    {
        return $query->where(function($q) {
            $q->where('title', 'like', '%archiv%')
              ->orWhere('title', 'like', '%document%')
              ->orWhere('title', 'like', '%biblioth%')
              ->orWhere('description', 'like', '%archiv%')
              ->orWhere('description', 'like', '%document%')
              ->orWhere('industry', 'like', '%archiv%')
              ->orWhere('industry', 'like', '%culture%')
              ->orWhere('industry', 'like', '%patrimoine%');
        });
    }

    // Méthodes utilitaires
    public function isActive()
    {
        return $this->status === 'published' && 
               ($this->application_deadline === null || $this->application_deadline->isFuture());
    }

    public function shouldNotifyApidca()
    {
        return $this->auto_notify_members && 
               (in_array('apidca', $this->target_associations ?? []) || 
                $this->isArchivesRelated());
    }

    protected function isArchivesRelated()
    {
        $archivesKeywords = ['archiv', 'document', 'biblioth', 'conservat', 'patrimoine', 'musée'];
        
        $searchText = strtolower($this->title . ' ' . $this->description . ' ' . $this->industry);
        
        foreach ($archivesKeywords as $keyword) {
            if (strpos($searchText, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
}