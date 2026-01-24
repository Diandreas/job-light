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
            $primaryColor = $cvInformation['primary_color'] ?? '#d93025'; /* Canadian Redish? or just standard black */
        @endphp

        @page { margin: 25.4mm; size: Letter; /* US Letter / Canadian standard */ }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #000; }

        .header { margin-bottom: 6mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
        .name { font-size: 18pt; font-weight: bold; text-transform: uppercase; }
        .info { font-size: 10pt; margin-top: 1mm; }

        .section-title { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-top: 5mm; margin-bottom: 3mm; }
        
        .exp-item { margin-bottom: 4mm; }
        .exp-line1 { font-weight: bold; display: flex; justify-content: space-between; }
        .exp-line2 { font-style: italic; margin-bottom: 1mm; }

        .content-text ul { padding-left: 5mm; margin: 0; }
        .content-text li { margin-bottom: 1mm; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div class="info">
            {{ $cvInformation['personalInformation']['address'] }} • {{ $cvInformation['personalInformation']['phone'] }} • {{ $cvInformation['personalInformation']['email'] }}
            @if($cvInformation['personalInformation']['linkedin']) • LinkedIn @endif
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="section-title">{{ $currentLocale === 'fr' ? 'Sommaire' : 'Summary' }}</div>
    <div class="content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section-title">{{ $currentLocale === 'fr' ? 'Expérience Professionnelle' : 'Professional Experience' }}</div>
    @foreach($experiencesByCategory as $category => $experiences)
        @foreach($experiences as $exp)
        <div class="exp-item">
            <div class="exp-line1">
                <span>{{ $exp['name'] }}</span>
                <span>{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} – {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : 'Present' }}</span>
            </div>
            <div class="exp-line2">{{ $exp['InstitutionName'] }}, {{ $cvInformation['personalInformation']['city'] ?? '' }}</div>
            <div class="content-text">{!! $exp['description'] !!}</div>
        </div>
        @endforeach
    @endforeach
    
    @if(!empty($cvInformation['certifications']))
    <div class="section-title">{{ $currentLocale === 'fr' ? 'Certifications' : 'Certifications' }}</div>
    <ul style="padding-left: 5mm; margin: 0;">
        @foreach($cvInformation['certifications'] as $cert)
        <li style="margin-bottom: 1mm;">
            <strong>{{ $cert['name'] }}</strong> 
            @if(!empty($cert['institution'])) - {{ $cert['institution'] }} @endif 
            @if(!empty($cert['date'])) ({{ $cert['date'] }}) @endif
        </li>
        @endforeach
    </ul>
    @endif

    <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences & Langues' : 'Skills & Languages' }}</div>
    <div class="content-text">
        <ul style="display: flex; flex-wrap: wrap; list-style: none; padding: 0; gap: 10px;">
        @foreach($cvInformation['competences'] as $comp)
            <li>• {{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</li>
        @endforeach
        </ul>
        <div style="margin-top: 2mm;">
            @if(!empty($cvInformation['languages']))
            <strong>{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}:</strong> 
            @foreach($cvInformation['languages'] as $lang)
            {{ $lang['name'] }} ({{ $lang['level'] }})@if(!$loop->last), @endif
            @endforeach
            @endif
        </div>
        <div style="margin-top: 2mm;">
            @if(!empty($cvInformation['hobbies']))
            <strong>{{ $currentLocale === 'fr' ? 'Intérêts' : 'Interests' }}:</strong> 
            {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(', ') }}
            @endif
        </div>
    </div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
