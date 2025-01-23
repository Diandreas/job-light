<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

class ProfessionMission extends Model
{
    protected $fillable = [
        'name',
        'description',
        'profession_id',
    ];

    public function profession()
    {
        return $this->belongsTo(Profession::class);
    }

    public static function rules($id = null)
    {
        return [
            'name' => [
                'required',
                Rule::unique('professionMissions')->where(function ($query) {
                    $query->where('profession_id', request()->profession_id);
                })->ignore($id),
            ],
            'description' => 'nullable',
            'profession_id' => 'required',
        ];
    }
}
