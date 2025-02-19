<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Competence extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_en',
        'description'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class,'user_competence', 'user_id', 'competence_id');
    }
}
