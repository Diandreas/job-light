<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfessionCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
        'parent_id',
    ];

    public function parent()
    {
        return $this->belongsTo(ProfessionCategory::class);
    }

    public function children()
    {
        return $this->hasMany(ProfessionCategory::class, 'parent_id');
    }

    public static function rules($id = null)
    {
        return [
            'name' => [
                'required',
                Rule::unique('profession_categories')->ignore($id),
            ],
            'description' => 'nullable',
            'parent_id' => 'nullable',
        ];
    }
}
