<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserNotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_job_matches',
        'email_application_updates',
        'email_new_messages',
        'push_job_matches',
        'push_application_updates',
        'push_new_messages',
        'job_alert_keywords',
        'preferred_locations',
        'preferred_employment_types'
    ];

    protected $casts = [
        'email_job_matches' => 'boolean',
        'email_application_updates' => 'boolean',
        'email_new_messages' => 'boolean',
        'push_job_matches' => 'boolean',
        'push_application_updates' => 'boolean',
        'push_new_messages' => 'boolean',
        'job_alert_keywords' => 'array',
        'preferred_locations' => 'array',
        'preferred_employment_types' => 'array'
    ];

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Méthodes utilitaires
    public function shouldReceiveJobMatches($type = 'email')
    {
        return $this->{$type . '_job_matches'};
    }

    public function shouldReceiveApplicationUpdates($type = 'email')
    {
        return $this->{$type . '_application_updates'};
    }

    public function shouldReceiveMessages($type = 'email')
    {
        return $this->{$type . '_new_messages'};
    }
}