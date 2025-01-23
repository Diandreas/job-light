<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserExperience extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'cv_infos_id',
        'company_name',
        'job_title',
        'start_date',
        'end_date',
        'description',
    ];

    // Relation avec CvInfos
    public function cvInfos()
    {
        return $this->belongsTo(CvInfo::class, 'cv_infos_id');
    }
}
