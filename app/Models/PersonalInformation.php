<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PersonalInformation extends Model
{

    protected $table='users';
    protected $fillable = [
        'id',
        'name',
        'email',
        'phone_number',
        'address',
        'github',
        'linkedin'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
