@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @php
            $primaryColor = $cvInformation['primary_color'] ?? '#002060'; /* Academic Blue */
        @endphp

        @page { margin: 20mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.3; color: #000; }

        .header { text-align: center; margin-bottom: 6mm; }
        .name { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; }
        .info { font-size: 10pt; }

        .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #000; margin: 5mm 0 3mm 0; padding-bottom: 1mm; }

        .item { margin-bottom: 3mm; }
        .item-row { display: flex; justify-content: space-between; }
        .item-title { font-weight: bold; }
        .item-date { text-align: right; white-space: nowrap; font-style: italic; }
        .item-sub { font-style: italic; margin-bottom: 1mm; }

        .content-text ul { margin: 1mm 0 1mm 8mm; padding: 0; }
        .content-text li { margin-bottom: 0.5mm; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div class="info">
            {{ $cvInformation['personalInformation']['address'] }} | {{ $cvInformation['personalInformation']['phone'] }} | {{ $cvInformation['personalInformation']['email'] }}
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="section-title">{{ $currentLocale === 'fr' ? 'OBJECTIF PROFESSIONNEL' : 'PROFESSIONAL OBJECTIVE' }}</div>
    <div class="content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section-title">{{ $currentLocale === 'fr' ? 'FORMATION & EXPÉRIENCE' : 'EDUCATION & EXPERIENCE' }}</div>
    <!-- Dummy Education loop if available, otherwise just experience structure -->
    <!-- Assuming experiences are academic/research roles for this template logic or just standard exp -->
    @foreach($experiencesByCategory as $category => $experiences)
        <div style="font-weight: bold; margin-top: 2mm; text-decoration: underline;">{{ $category }}</div>
        @foreach($experiences as $exp)
        <div class="item">
            <div class="item-row">
                <div class="item-title">{{ $exp['name'] }}</div>
                <div class="item-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('Y') }} – {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('Y') : 'Present' }}</div>
            </div>
            <div class="item-sub">{{ $exp['InstitutionName'] }}</div>
            <div class="content-text">{!! $exp['description'] !!}</div>
        </div>
        @endforeach
    @endforeach
    
    @if(!empty($cvInformation['certifications']))
    <div class="section-title">{{ $currentLocale === 'fr' ? 'CERTIFICATIONS' : 'CERTIFICATIONS' }}</div>
    <ul style="list-style-type: disc; margin-left: 5mm;">
        @foreach($cvInformation['certifications'] as $cert)
        <li>
            <strong>{{ $cert['name'] }}</strong> @if(!empty($cert['institution'])) - {{ $cert['institution'] }} @endif @if(!empty($cert['date'])) ({{ $cert['date'] }}) @endif
        </li>
        @endforeach
    </ul>
    @endif

    <div class="section-title">{{ $currentLocale === 'fr' ? 'COMPÉTENCES & AUTRES' : 'SKILLS & OTHER' }}</div>
    <div class="content-text">
        <ul style="list-style-type: disc;">
            @foreach($cvInformation['competences'] as $comp)
            <li><strong>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</strong>: {{ $comp['level'] ?? 'N/A' }}</li>
            @endforeach
            @foreach($cvInformation['languages'] as $lang)
            <li><strong>Language: {{ $lang['name'] }}</strong> - {{ $lang['level'] }}</li>
            @endforeach
            @if(!empty($cvInformation['hobbies']))
            <li><strong>{{ $currentLocale === 'fr' ? 'Intérêts' : 'Interests' }}</strong>: {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(', ') }}</li>
            @endif
        </ul>
    </div>
</body>
<x-cv-editable-scripts />
</html>
@endsection