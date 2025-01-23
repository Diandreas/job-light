<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Summary extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_summary'); // Vérifiez le nom de la table pivot si nécessaire
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
