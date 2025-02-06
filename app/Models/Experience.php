<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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

    /**
     * Les relations qui devraient toujours être chargées.
     *
     * @var array
     */
    protected $with = ['category', 'attachment'];

    /**
     * Obtenir la catégorie de l'expérience.
     */
    public function category()
    {
        return $this->belongsTo(ExperienceCategory::class, 'experience_categories_id');
    }

    /**
     * Obtenir la pièce jointe de l'expérience.
     */
    public function attachment()
    {
        return $this->belongsTo(Attachment::class);
    }

    /**
     * Obtenir les utilisateurs associés à cette expérience.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_experience', 'experience_id', 'user_id');
    }

    /**
     * Obtenir les références associées à cette expérience.
     */
    public function references(): BelongsToMany
    {
        return $this->belongsToMany(Reference::class, 'ExperienceReferences',
            'experiences_id',
            'references_id')
            ->withTimestamps();
    }
}
