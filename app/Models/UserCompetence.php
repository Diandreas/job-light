<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCompetence extends Model
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
        'level',
    ];

    // Relation avec CvInfos
    public function cvInfos()
    {
        return $this->belongsTo(CvInfo::class, 'cv_infos_id');
    }
}
