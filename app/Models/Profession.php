<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class Profession extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'name_en'
    ];

    public function category()
    {
        return $this->belongsTo(ProfessionCategory::class);
    }
    public static function rules($id = null)
    {
        return [
            'name' => [
                'required',
                Rule::unique('professions')->ignore($id),
            ],
            'description' => 'nullable',
            'category_id' => 'required',
        ];
    }

    public function users() // Plural form for one-to-many
    {
        return $this->hasMany(User::class);
    }

}
