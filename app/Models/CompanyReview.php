<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'rating',
        'review',
        'anonymous',
        'approved'
    ];

    protected $casts = [
        'rating' => 'integer',
        'anonymous' => 'boolean',
        'approved' => 'boolean'
    ];

    // Relations
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('approved', true);
    }

    public function scopeByRating($query, $rating)
    {
        return $query->where('rating', $rating);
    }

    // Méthodes
    public function approve()
    {
        $this->update(['approved' => true]);
        
        // Recalculer la note moyenne de l'entreprise
        $this->company->updateRating();
    }
}
