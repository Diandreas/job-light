<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certification extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'institution',
        'date_obtained',
        'description',
        'user_id'
    ];
    
    protected $casts = [
        'date_obtained' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
