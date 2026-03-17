<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 2.5cm;
        }
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
        }
        .sender {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 1.5em;
        }
        .recipient {
            margin-bottom: 0.5em;
        }
        .company {
            font-weight: bold;
        }
        .date {
            color: #555;
            font-style: italic;
            font-size: 10pt;
            margin: 1.5em 0;
        }
        .subject {
            font-weight: bold;
            margin: 1.5em 0;
            font-size: 11pt;
        }
        .content {
            text-align: justify;
        }
        .content p {
            margin: 0 0 0.8em 0;
            text-indent: 0;
        }
    </style>
</head>
<body>
    <div class="sender">{{ $userName }}</div>

    @if(!empty($recipient))
        <div class="recipient">{{ $recipient }}</div>
    @endif
    @if(!empty($company))
        <div class="company">{{ $company }}</div>
    @endif

    <div class="date">{{ $date }}</div>

    @if(!empty($jobTitle))
        <div class="subject">Objet : Candidature au poste de {{ $jobTitle }}</div>
    @endif

    <div class="content">
        {!! $content !!}
    </div>
</body>
</html>
