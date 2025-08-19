<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'layout',
        'show_experiences',
        'show_competences',
        'show_hobbies',
        'visibility',
    ];

    protected $casts = [
        'show_experiences' => 'boolean',
        'show_competences' => 'boolean',
        'show_hobbies' => 'boolean',
        'visibility' => \App\Enums\ProfileVisibility::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
