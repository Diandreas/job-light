<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatHistory extends Model
{
    protected $fillable = [
        'user_id',
        'context_id',
        'context',
        'messages',
        'service_id',
        'tokens_used'
    ];

    protected $casts = [
        'messages' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documentExports()
    {
        return $this->hasMany(DocumentExport::class);
    }
}
