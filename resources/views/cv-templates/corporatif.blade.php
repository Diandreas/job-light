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
            $primaryColor = $cvInformation['primary_color'] ?? '#3aafa9';
            $darkColor = '#17252a';
            $lightBg = '#def2f1';
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Roboto Mono', 'Courier New', monospace; font-size: 9pt; line-height: 1.4; color: {{ $darkColor }}; background: #fff; }

        .cv-grid { width: 190mm; margin: 0 auto; }

        .header { display: flex; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 5mm; margin-bottom: 5mm; }
        .photo-area { width: 35mm; margin-right: 5mm; }
        .photo-frame { width: 35mm; height: 35mm; background: #eee; border-radius: 4px; overflow: hidden; border: 2px solid {{ $primaryColor }}; }
        .photo-frame img { width: 100%; height: 100%; object-fit: cover; }

        .header-main { flex: 1; }
        .name { font-size: 20pt; font-weight: 700; color: {{ $darkColor }}; text-transform: uppercase; margin-bottom: 1mm; }
        .job-title { background: {{ $primaryColor }}; color: #fff; display: inline-block; padding: 1mm 3mm; font-size: 10pt; font-weight: 600; border-radius: 2px; margin-bottom: 3mm; }
        
        .contact-bar { display: flex; flex-wrap: wrap; gap: 3mm; font-size: 8pt; }
        .contact-bit { display: flex; align-items: center; background: {{ $lightBg }}; padding: 1mm 2mm; border-radius: 2px; }
        .contact-bit svg { width: 3.5mm; height: 3.5mm; margin-right: 1.5mm; fill: {{ $primaryColor }}; }

        .section { margin-bottom: 6mm; }
        .sec-head { font-size: 11pt; font-weight: 700; border-left: 5px solid {{ $primaryColor }}; padding-left: 3mm; margin-bottom: 3mm; text-transform: uppercase; background: #f9f9f9; padding-top: 1.5mm; padding-bottom: 1.5mm; }
        
        .cat-title { font-size: 10pt; font-weight: 800; color: #555; text-transform: uppercase; margin-top: 4mm; margin-bottom: 2mm; display: flex; align-items: center; }
        .cat-title::before { content: '>> '; color: {{ $primaryColor }}; margin-right: 1mm; }
        .cat-title::after { content: ''; flex: 1; height: 1px; background: #eee; margin-left: 2mm; }

        .exp-item { margin-bottom: 4mm; page-break-inside: avoid; margin-left: 3mm; }
        .exp-top { display: flex; justify-content: space-between; font-weight: 700; font-size: 10pt; border-bottom: 1px dashed #ccc; padding-bottom: 1px; margin-bottom: 1mm; }
        .exp-role { color: {{ $primaryColor }}; }
        .exp-place { font-style: italic; font-size: 9pt; color: #555; }
        
        .rich-text { text-align: justify; color: #444; }
        .rich-text ul { list-style: square; padding-left: 5mm; margin: 1mm 0; margin-left: 1mm; }
        .rich-text li { margin-bottom: 0.5mm; }

        .other-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
        .tech-item { margin-bottom: 2mm; }
        .tech-name { display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 600; margin-bottom: 0.5mm; }
        .tech-bar { height: 2mm; background: #eee; border-radius: 1mm; overflow: hidden; }
        .tech-fill { height: 100%; background: {{ $primaryColor }}; }

    </style>
</head>
<body>
<div class="cv-grid">
    <div class="header">
        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-area">
            <div class="photo-frame">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
            </div>
        </div>
        @endif
        
        <div class="header-main">
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="role">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
            <div class="contact-bar">
                @if($cvInformation['personalInformation']['email'])
                <div class="contact-bit"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg> {{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                <div class="contact-bit"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> {{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
            </div>
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="section">
        <div class="sec-head">/// {{ $currentLocale === 'fr' ? 'PROFIL PROFESSIONNEL' : 'PROFESSIONAL PROFILE' }}</div>
        <div class="rich-text content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    </div>
    @endif

    <div class="section">
        <div class="sec-head">/// {{ $currentLocale === 'fr' ? 'PARCOURS & EXPÉRIENCES' : 'CAREER & EXPERIENCES' }}</div>
        
        @foreach($experiencesByCategory as $category => $experiences)
            @php
                $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
                $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                
                if($isEnglish && $translatedCategory === $category) {
                    $normCat = strtolower($category);
                    if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'professional') || str_contains($normCat, 'travail') || str_contains($normCat, 'work')) {
                        $translatedCategory = 'Professional Experience';
                    } elseif(str_contains($normCat, 'recherche') || str_contains($normCat, 'research')) {
                        $translatedCategory = 'Research';
                    } elseif(str_contains($normCat, 'enseign') || str_contains($normCat, 'teach')) {
                        $translatedCategory = 'Teaching';
                    } elseif(str_contains($normCat, 'format') || str_contains($normCat, 'académ') || str_contains($normCat, 'education')) {
                        $translatedCategory = 'Education';
                    }
                }
            @endphp
            <div class="cat-title">{{ $translatedCategory }}</div>
            @foreach($experiences as $exp)
            <div class="exp-item">
                <div class="exp-top">
                    <span class="exp-role">{{ $exp['name'] }}</span>
                    <span>{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</span>
                </div>
                <div class="exp-place">{{ $exp['InstitutionName'] }}</div>
                @if(!empty($exp['description']))
                <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                @endif
            </div>
            @endforeach
        @endforeach
    </div>
    
    <div class="section">
        <div class="sec-head">/// {{ $currentLocale === 'fr' ? 'COMPÉTENCES & INFORMATIONS' : 'SKILLS & INFORMATION' }}</div>
        <div class="other-grid">
            <div>
                <div style="font-weight: 700; margin-bottom: 3mm; border-bottom: 1px dashed #ccc; padding-bottom: 1mm;">{{ $currentLocale === 'fr' ? 'TECH & CORE' : 'TECH & CORE' }}</div>
                @if(!empty($cvInformation['competences']))
                    @foreach($cvInformation['competences'] as $comp)
                    @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 85, 'Intermédiaire' => 65, 'Débutant' => 45, default => 65 }; @endphp
                    <div class="tech-item">
                        <div class="tech-name">
                            <span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                            <span>{{ $lvl }}%</span>
                        </div>
                        <div class="tech-bar"><div class="tech-fill" style="width: {{ $lvl }}%"></div></div>
                    </div>
                    @endforeach
                @endif
            </div>
            
            <div>
                @if(!empty($cvInformation['certifications']))
                <div style="font-weight: 700; margin-bottom: 3mm; border-bottom: 1px dashed #ccc; padding-bottom: 1mm;">{{ $currentLocale === 'fr' ? 'CERTIFICATIONS' : 'CERTIFICATIONS' }}</div>
                @foreach($cvInformation['certifications'] as $cert)
                <div style="margin-bottom: 3mm; font-size: 8.5pt;">
                    <strong style="color: {{ $primaryColor }}; font-size: 9pt;">> {{ $cert['name'] }}</strong><br>
                    @if(!empty($cert['institution'])) <span style="font-style: italic; color: #666;">@ {{ $cert['institution'] }}</span> @endif
                </div>
                @endforeach
                @endif

                @if(!empty($cvInformation['languages']))
                <div style="font-weight: 700; margin-top: 4mm; margin-bottom: 2mm; border-bottom: 1px dashed #ccc;">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</div>
                @foreach($cvInformation['languages'] as $lang)
                <div style="font-size: 8.5pt;">
                    <span style="font-weight: 700;">{{ $lang['name'] }}</span>: {{ $lang['level'] }}
                </div>
                @endforeach
                @endif

                @if(!empty($cvInformation['hobbies']))
                <div style="font-weight: 700; margin-top: 4mm; margin-bottom: 2mm; border-bottom: 1px dashed #ccc;">{{ $currentLocale === 'fr' ? 'LOISIRS' : 'INTERESTS' }}</div>
                <div style="font-size: 8.5pt; color: #555;">
                    {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(', ') }}
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
