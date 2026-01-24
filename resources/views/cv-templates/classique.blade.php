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
            $primaryColor = $cvInformation['primary_color'] ?? '#333333';
        @endphp

        @page { margin: 15mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Garamond', 'Cambria', serif; font-size: 11pt; line-height: 1.3; color: #000; background: #fff; }

        .cv-main { width: 100%; max-width: 180mm; margin: 0 auto; }

        /* HEADER CENTRÉ CLASSIQUE */
        .header { text-align: center; margin-bottom: 8mm; border-bottom: 1px solid #000; padding-bottom: 5mm; }
        
        .name { font-size: 20pt; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 2mm; }
        .title { font-size: 12pt; font-style: italic; margin-bottom: 2mm; }
        
        .contact-info { font-size: 10pt; font-family: 'Arial', sans-serif; }
        .contact-separator { margin: 0 1mm; }

        /* PHOTO CLASSIQUE */
        .photo-container { width: 30mm; height: 40mm; margin: 0 auto 3mm; border: 1px solid #ccc; padding: 1mm; }
        .photo-container img { width: 100%; height: 100%; object-fit: cover; }

        /* SECTIONS */
        .section-header { text-align: center; margin: 6mm 0 4mm; }
        .section-title { font-size: 12pt; font-weight: 700; text-transform: uppercase; display: inline-block; border-bottom: 1px solid #000; padding-bottom: 1mm; letter-spacing: 1px; }

        /* EXPERIENCES */
        .exp-item { margin-bottom: 4mm; }
        .exp-head { display: flex; justify-content: space-between; font-weight: 700; font-family: 'Arial', sans-serif; font-size: 10pt; margin-bottom: 1mm; }
        .exp-company { font-style: italic; }
        
        .content-text { text-align: justify; font-size: 10.5pt; }
        .content-text ul { list-style: disc; margin: 1mm 0 1mm 5mm; padding-left: 0; margin-left: 4mm; }
        .content-text li { margin-bottom: 0.5mm; }

        /* COMPÉTENCES */
        .skills-container { text-align: center; margin-bottom: 4mm; }
        .skill-tag { display: inline-block; padding: 1mm 2mm; margin: 1mm; border: 1px solid #ccc; font-size: 10pt; }
        
        .info-row { text-align: center; font-size: 10.5pt; margin-bottom: 1mm; }
    </style>
</head>
<body>
<div class="cv-main">
    <div class="header">
        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-container">
            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
        </div>
        @endif
        
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div class="title">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
        
        <div class="contact-info">
            <span>{{ $cvInformation['personalInformation']['address'] }}</span>
            @if($cvInformation['personalInformation']['phone']) <span class="contact-separator">•</span> {{ $cvInformation['personalInformation']['phone'] }} @endif
            @if($cvInformation['personalInformation']['email']) <span class="contact-separator">•</span> {{ $cvInformation['personalInformation']['email'] }} @endif
            @if($cvInformation['personalInformation']['linkedin']) <span class="contact-separator">•</span> LinkedIn @endif
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="section-header"><span class="section-title">{{ $currentLocale === 'fr' ? 'Profil Professionnel' : 'Professional Summary' }}</span></div>
    <div class="content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section-header"><span class="section-title">{{ $currentLocale === 'fr' ? 'Expérience' : 'Experience' }}</span></div>
    @foreach($experiencesByCategory as $category => $experiences)
        @foreach($experiences as $exp)
        <div class="exp-item">
            <div class="exp-head">
                <span>{{ $exp['name'] }} @ {{ $exp['InstitutionName'] }}</span>
                <span>{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('Y') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('Y') : 'Present' }}</span>
            </div>
            <div class="content-text">{!! $exp['description'] !!}</div>
        </div>
        @endforeach
    @endforeach
    
    @if(!empty($cvInformation['certifications']))
    <div class="section-header"><span class="section-title">{{ $currentLocale === 'fr' ? 'Certifications' : 'Certifications' }}</span></div>
    <div class="content-text" style="text-align: center;">
        @foreach($cvInformation['certifications'] as $cert)
        <div style="margin-bottom: 2px;">
            <strong>{{ $cert['name'] }}</strong>
            @if(!empty($cert['institution'])) | {{ $cert['institution'] }} @endif
            @if(!empty($cert['date'])) ({{ $cert['date'] }}) @endif
        </div>
        @endforeach
    </div>
    @endif

    @if(!empty($cvInformation['competences']))
    <div class="section-header"><span class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</span></div>
    <div class="skills-container">
        @foreach($cvInformation['competences'] as $comp)
        <span class="skill-tag">{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
        @endforeach
    </div>
    @endif
    
    @if(!empty($cvInformation['languages']) || !empty($cvInformation['hobbies']))
    <div class="section-header"><span class="section-title">{{ $currentLocale === 'fr' ? 'Informations Complémentaires' : 'Additional Information' }}</span></div>
    
    @if(!empty($cvInformation['languages']))
    <div class="info-row">
        <strong>{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}:</strong> 
        @foreach($cvInformation['languages'] as $lang)
        {{ $lang['name'] }} ({{ $lang['level'] }})@if(!$loop->last), @endif
        @endforeach
    </div>
    @endif
    
    @if(!empty($cvInformation['hobbies']))
    <div class="info-row">
        <strong>{{ $currentLocale === 'fr' ? 'Loisirs' : 'Hobbies' }}:</strong>
        {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(', ') }}
    </div>
    @endif
    
    @endif
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
