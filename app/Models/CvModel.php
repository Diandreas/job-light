<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CvModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'viewPath',
        'price',
        'previewImagePath'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
