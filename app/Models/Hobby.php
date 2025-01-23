<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Hobby extends Model
{
    protected $fillable = [
        'name',
    ];

    public static function rules($id = null)
    {
        return [
            'name' => [
                'required',
                Rule::unique('hobbies')->ignore($id),
            ],
        ];
    }
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_hobby', 'hobby_id', 'user_id');
    }

}
