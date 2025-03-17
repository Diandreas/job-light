<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplicationAttachment extends Model
{
    protected $fillable = [
        'job_application_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
        'description',
    ];

    /**
     * Obtenir la candidature associée
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }
} 