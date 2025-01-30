<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
        }
        .date {
            text-align: right;
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        .message {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .message.user {
            background: #fff5e6;
        }
        .role {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .content {
            line-height: 1.6;
        }
        .timestamp {
            font-size: 0.8em;
            color: #666;
            margin-top: 5px;
        }
    </style>
</head>
<body>
<div class="header">
    <h1>{{ $title }}</h1>
</div>

<div class="date">
    {{ $date }}
</div>

@foreach($content as $message)
    <div class="message {{ $message['role'] === 'user' ? 'user' : '' }}">
        <div class="role">
            {{ $message['role'] === 'user' ? 'Question:' : 'Réponse:' }}
        </div>
        <div class="content">
            {!! nl2br(e($message['content'])) !!}
        </div>
        <div class="timestamp">
            {{ \Carbon\Carbon::parse($message['timestamp'])->format('d/m/Y H:i') }}
        </div>
    </div>
@endforeach
</body>
</html>
