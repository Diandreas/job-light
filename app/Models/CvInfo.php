<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CvInfo extends Model
{
    protected $fillable = [
        'user_id',
        'surname',
        'address_id',
        'profession_id',
        'primary_color',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function profession(): BelongsTo
    {
        return $this->belongsTo(Profession::class);
    }

    public function competences(): BelongsToMany
    {
        return $this->belongsToMany(Competence::class);
    }

    public function hobbies(): BelongsToMany
    {
        return $this->belongsToMany(Hobby::class);
    }

    public function summaries(): HasMany
    {
        return $this->hasMany(Summary::class);
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class);
    }
}
