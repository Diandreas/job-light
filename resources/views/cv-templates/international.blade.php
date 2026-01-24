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
            $primaryColor = $cvInformation['primary_color'] ?? '#2c3e50';
            $bgLight = '#f8fafc';
            $textDark = '#1e293b';
            $textMuted = '#64748b';
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 9.5pt; line-height: 1.45; color: {{ $textDark }}; background: #fff; }

        .cv-wrapper { width: 190mm; margin: 0 auto; }

        /* INTERNATIONAL TOP BAR */
        .header { display: table; width: 100%; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 6mm; margin-bottom: 8mm; table-layout: fixed; }
        
        .header-left { display: table-cell; vertical-align: middle; }
        .header-right { display: table-cell; vertical-align: middle; width: 40mm; text-align: right; }

        .name { font-size: 26pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; line-height: 1; margin-bottom: 2mm; letter-spacing: -0.5px; }
        .role { font-size: 13pt; font-weight: 600; color: {{ $textMuted }}; text-transform: uppercase; letter-spacing: 1px; }

        .contact-grid { display: flex; flex-wrap: wrap; gap: 4mm; margin-top: 4mm; font-size: 8.5pt; color: {{ $textMuted }}; }
        .contact-item { display: flex; align-items: center; }
        .contact-item svg { width: 3.5mm; height: 3.5mm; margin-right: 1.5mm; stroke: {{ $primaryColor }}; fill: none; stroke-width: 2; }

        .photo-box { width: 35mm; height: 45mm; border: 1px solid #e2e8f0; background: {{ $bgLight }}; padding: 1mm; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: inline-block; }
        .photo-box img { width: 100%; height: 100%; object-fit: cover; }

        /* SECTIONS */
        .section { margin-bottom: 8mm; }
        .section-title { font-size: 12pt; font-weight: 800; color: {{ $textDark }}; text-transform: uppercase; border-left: 5px solid {{ $primaryColor }}; padding-left: 3mm; margin-bottom: 5mm; background: {{ $bgLight }}; padding-top: 1.5mm; padding-bottom: 1.5mm; letter-spacing: 1px; }

        .summary { text-align: justify; color: #334155; line-height: 1.6; margin-bottom: 8mm; }

        /* CATEGORIZED EXPERIENCE */
        .cat-subtitle { font-size: 10pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; margin-top: 6mm; margin-bottom: 3mm; display: flex; align-items: center; }
        .cat-subtitle::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; margin-left: 3mm; }

        .exp-item { margin-bottom: 5mm; page-break-inside: avoid; }
        .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5mm; }
        .exp-role { font-weight: 800; font-size: 11pt; color: #0f172a; }
        .exp-date { font-size: 9pt; font-weight: 700; color: {{ $textMuted }}; background: #f1f5f9; padding: 1px 8px; border-radius: 4px; border: 1px solid #e2e8f0; }
        .exp-inst { font-size: 10pt; font-weight: 600; color: {{ $primaryColor }}; margin-bottom: 2mm; font-style: italic; }

        .rich-text { text-align: justify; color: #475569; font-size: 10pt; }
        .rich-text ul { list-style: disc; padding-left: 5mm; margin-top: 1.5mm; margin-left: 1mm; }
        .rich-text li { margin-bottom: 1.5mm; }

        /* FOOTER INFO GRID */
        .info-grid { display: table; width: 100%; table-layout: fixed; margin-top: 6mm; border-spacing: 10px 0; }
        .info-col { display: table-cell; vertical-align: top; background: {{ $bgLight }}; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5mm; }

        .info-title { font-size: 9pt; font-weight: 800; color: {{ $textDark }}; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 1.5mm; margin-bottom: 3mm; text-transform: uppercase; }
        
        .skill-list { list-style: none; }
        .skill-item { margin-bottom: 2mm; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dotted #cbd5e1; padding-bottom: 1mm; font-size: 9pt; }
        .skill-level { font-weight: 700; color: {{ $primaryColor }}; font-size: 8pt; text-transform: uppercase; }

        .lang-item { font-size: 9pt; margin-bottom: 1.5mm; }
        .cert-item { font-size: 9pt; margin-bottom: 3mm; }

        svg { stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-wrapper">
    <div class="header">
        <div class="header-left">
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="role">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
            
            <div class="contact-grid">
                @if($cvInformation['personalInformation']['email'])
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg>{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
            </div>
        </div>

        @if($cvInformation['personalInformation']['photo'])
        <div class="header-right">
            <div class="photo-box">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
            </div>
        </div>
        @endif
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="summary rich-text content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section">
        <div class="section-title">{{ $isEnglish ? 'Professional Background' : 'Parcours Professionnel' }}</div>
        
        @foreach($experiencesByCategory as $category => $experiences)
            @php
                $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                
                if($isEnglish && $translatedCategory === $category) {
                    $normCat = strtolower($category);
                    if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'professional') || str_contains($normCat, 'travail') || str_contains($normCat, 'work')) {
                        $translatedCategory = 'Work Experience';
                    } elseif(str_contains($normCat, 'recherche') || str_contains($normCat, 'research')) {
                        $translatedCategory = 'Research & Academic';
                    } elseif(str_contains($normCat, 'enseign') || str_contains($normCat, 'teach')) {
                        $translatedCategory = 'Teaching';
                    } elseif(str_contains($normCat, 'format') || str_contains($normCat, 'académ') || str_contains($normCat, 'education')) {
                        $translatedCategory = 'Education & Degrees';
                    }
                }
            @endphp
            <div class="cat-subtitle">{{ $translatedCategory }}</div>
            @foreach($experiences as $exp)
            <div class="exp-item">
                <div class="exp-header">
                    <span class="exp-role">{{ $exp['name'] }}</span>
                    <span class="exp-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</span>
                </div>
                <div class="exp-inst">{{ $exp['InstitutionName'] }}</div>
                @if(!empty($exp['description']))
                <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                @endif
            </div>
            @endforeach
        @endforeach
    </div>

    <div class="info-grid">
        @if(!empty($cvInformation['competences']))
        <div class="info-col">
            <div class="info-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Key Skills' }}</div>
            <div class="skill-list">
                @foreach($cvInformation['competences'] as $comp)
                <div class="skill-item">
                    <span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                    <span class="skill-level">{{ $comp['level'] }}</span>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        @if(!empty($cvInformation['languages']) || !empty($cvInformation['certifications']))
        <div class="info-col">
            @if(!empty($cvInformation['languages']))
            <div class="info-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
            @foreach($cvInformation['languages'] as $lang)
            <div class="lang-item">
                <strong>{{ $lang['name'] }}</strong>: <span style="color: {{ $textMuted }};">{{ $lang['level'] }}</span>
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['certifications']))
            <div class="info-title" style="margin-top: 5mm;">Certifications</div>
            @foreach($cvInformation['certifications'] as $cert)
            <div class="cert-item">
                <strong style="color: #0f172a;">{{ $cert['name'] }}</strong>
                @if(!empty($cert['institution'])) <div style="font-size: 8.5pt; color: {{ $textMuted }}; font-style: italic;">{{ $cert['institution'] }}</div> @endif
            </div>
            @endforeach
            @endif
        </div>
        @endif
    </div>

    @if(!empty($cvInformation['hobbies']))
    <div style="margin-top: 8mm; font-size: 9pt; color: {{ $textMuted }}; border-top: 1px solid #eee; padding-top: 4mm; font-style: italic;">
        {{ $currentLocale === 'fr' ? 'Centres d’intérêt' : 'Interests' }}: 
        {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(' • ') }}
    </div>
    @endif
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
