<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'path',
        'format',
        'size'
    ];

    public function experiences()
    {
        return $this->hasMany(Experience::class);
    }
}

