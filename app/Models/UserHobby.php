<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserHobby extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'cv_infos_id',
        'name',
    ];

    // Relation avec CvInfos
    public function cvInfos()
    {
        return $this->belongsTo(CvInfo::class, 'cv_infos_id');
    }
}
