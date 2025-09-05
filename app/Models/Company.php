<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'website',
        'industry',
        'description',
        'logo_path',
        'status',
        'type', // 'partner', 'client', 'organization'
        'partner_code', // Code spécial pour partenaires comme APIDCA
        'contact_person',
        'contact_email',
        'contact_phone',
        'billing_email',
        'subscription_type', // 'free', 'basic', 'premium'
        'subscription_expires_at',
        'can_post_jobs',
        'can_access_profiles',
        'job_posting_limit',
        'notifications_enabled',
        'auto_notify_members'
    ];

    protected $casts = [
        'subscription_expires_at' => 'datetime',
        'can_post_jobs' => 'boolean',
        'can_access_profiles' => 'boolean',
        'notifications_enabled' => 'boolean',
        'auto_notify_members' => 'boolean'
    ];

    // Relations
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function jobPostings()
    {
        return $this->hasMany(JobPosting::class);
    }

    // Scopes
    public function scopePartners($query)
    {
        return $query->where('type', 'partner');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // Méthodes utilitaires
    public function isPartner()
    {
        return $this->type === 'partner';
    }

    public function canPostJobs()
    {
        return $this->can_post_jobs && $this->status === 'active';
    }

    public function hasActiveSubscription()
    {
        return $this->subscription_expires_at === null || 
               $this->subscription_expires_at->isFuture();
    }
}