<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'date_start',
        'date_end',
        'output',
        'experience_categories_id',
        'comment',
        'InstitutionName',
        'attachment_id'
    ];


    public function attachment()
    {
        return $this->belongsTo(Attachment::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
    public function category()
    {
        return $this->belongsTo(ExperienceCategory::class);
    }
}
