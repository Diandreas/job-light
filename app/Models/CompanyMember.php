<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'role',
        'receive_notifications',
        'joined_at'
    ];

    protected $casts = [
        'receive_notifications' => 'boolean',
        'joined_at' => 'datetime'
    ];

    // Relations
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeWithNotifications($query)
    {
        return $query->where('receive_notifications', true);
    }
}