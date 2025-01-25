<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class DocumentExport extends Model
{
protected $fillable = [
'user_id',
'chat_history_id',
'file_path',
'format'
];

public function chatHistory()
{
return $this->belongsTo(ChatHistory::class);
}

public function user()
{
return $this->belongsTo(User::class);
}
}
