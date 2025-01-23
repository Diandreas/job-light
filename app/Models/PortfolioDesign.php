<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioDesign extends Model
{
    use HasFactory;

    protected $fillable = [
        'layout',
        'color_scheme',
        'font',
        // Ajoutez d'autres champs selon vos besoins
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
