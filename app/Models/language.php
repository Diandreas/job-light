<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Language extends Model
{
    protected $table = 'languages';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'name_en'
    ];


    public function users()
    {
        return $this->belongsToMany(User::class, 'user_languages', 'language_id', 'user_id');
    }

}
