<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'design',
        'show_experiences',
        'show_competences',
        'show_hobbies',
        'show_summary',
        'show_contact_info',
    ];

    protected $casts = [
        'show_experiences' => 'boolean',
        'show_competences' => 'boolean',
        'show_hobbies' => 'boolean',
        'show_summary' => 'boolean',
        'show_contact_info' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
