<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reference extends Model
{
    use HasFactory;

    
    protected $fillable = [
        'name',
        'function',
        'email',
        'telephone',
    ];

    public function experiences()
    {
        return $this->belongsToMany(Experience::class);
    }
}
