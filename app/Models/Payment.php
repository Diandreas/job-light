<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'currency',
        'description',
        'status',
        'payment_method',
        'transaction_id',
        'external_id',
        'external_data',
        'completed_at',
        'metadata'
    ];


    protected $casts = [
        'amount' => 'decimal:2',
        'completed_at' => 'datetime',
        'metadata' => 'array',
        'external_data' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function model()
    {
        return $this->belongsTo(CvModel::class, 'model_id');
    }
}
