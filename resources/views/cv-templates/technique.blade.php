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
            $primaryColor = $cvInformation['primary_color'] ?? '#334155';
            $bgTech = '#f1f5f9';
            $textDark = '#1e293b';
            $textSlate = '#475569';
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9.5pt; line-height: 1.45; color: {{ $textSlate }}; background: #fff; }

        .cv-grid { width: 190mm; margin: 0 auto; }
        
        /* HEADER - SOBER & PROFESSIONAL */
        .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 5mm; margin-bottom: 8mm; }
        .header-info { flex: 1; }
        .name { font-size: 24pt; font-weight: 700; color: {{ $textDark }}; line-height: 1; margin-bottom: 2mm; text-transform: uppercase; }
        .role { font-size: 11pt; color: {{ $primaryColor }}; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        .contact-row { display: flex; flex-wrap: wrap; gap: 4mm; margin-top: 4mm; font-size: 8.5pt; color: #64748b; }
        .contact-item { display: flex; align-items: center; }
        .contact-item svg { width: 3.5mm; height: 3.5mm; margin-right: 2mm; stroke: {{ $primaryColor }}; fill: none; stroke-width: 2; }

        .photo-box { width: 32mm; height: 32mm; border: 1px solid #e2e8f0; padding: 1mm; border-radius: 4px; background: #fff; margin-left: 6mm; }
        .photo-box img { width: 100%; height: 100%; object-fit: cover; }

        /* SECTIONS */
        .section { margin-bottom: 10mm; }
        .sec-title { font-size: 11pt; font-weight: 800; color: {{ $textDark }}; text-transform: uppercase; letter-spacing: 1px; border-left: 5px solid {{ $primaryColor }}; padding-left: 4mm; margin-bottom: 6mm; }

        .summary { font-size: 10pt; color: #334155; text-align: justify; line-height: 1.6; margin-bottom: 8mm; font-style: italic; }

        /* EXPERIENCES FLOW */
        .cat-subtitle { font-size: 9.5pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; margin-top: 6mm; margin-bottom: 4mm; background: {{ $bgTech }}; padding: 1.5mm 3mm; border-radius: 2px; }

        .item { margin-bottom: 6mm; page-break-inside: avoid; }
        .item-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5mm; }
        .item-role { font-weight: 700; font-size: 10.5pt; color: {{ $textDark }}; }
        .item-date { font-size: 9pt; color: {{ $primaryColor }}; font-weight: 700; }
        .item-inst { font-size: 10pt; font-weight: 600; color: #64748b; margin-bottom: 2.5mm; display: block; }
        
        .rich-text { text-align: justify; color: {{ $textSlate }}; font-size: 10pt; }
        .rich-text ul { list-style: disc; padding-left: 5mm; margin-top: 2mm; }
        .rich-text li { margin-bottom: 1.5mm; }

        /* COMPACT FOOTER GRID */
        .info-grid { display: table; width: 100%; table-layout: fixed; margin-top: 8mm; border-top: 1px solid #e2e8f0; padding-top: 8mm; }
        .info-col { display: table-cell; vertical-align: top; padding-right: 10mm; }
        .info-col:last-child { padding-right: 0; }

        .info-label { font-size: 9pt; font-weight: 800; color: {{ $textDark }}; text-transform: uppercase; margin-bottom: 4mm; display: block; border-bottom: 2px solid {{ $primaryColor }}; width: 20mm; padding-bottom: 1mm; }
        
        .skill-list { list-style: none; }
        .skill-item { display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 2mm; border-bottom: 1px dotted #e2e8f0; padding-bottom: 1mm; }
        .skill-lvl { font-weight: 700; color: {{ $primaryColor }}; font-size: 8.5pt; }

        .cert-item { font-size: 9pt; margin-bottom: 3mm; border-left: 2px solid {{ $primaryColor }}; padding-left: 3mm; }
        
        svg { stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-grid">
    <div class="header">
        <div class="header-info">
            <h1 class="name">{{ $cvInformation['personalInformation']['firstName'] ?? '' }} {{ $cvInformation['personalInformation']['lastName'] ?? '' }}</h1>
            <div class="role">{{ $currentLocale === 'fr' ? ($cvInformation['professions'][0]['name'] ?? '') : ($cvInformation['professions'][0]['name_en'] ?? '') }}</div>
            
            <div class="contact-row">
                @if($cvInformation['personalInformation']['email'] ?? null)
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'] ?? null)
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg>{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'] ?? null)
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
            </div>
        </div>

        @if($cvInformation['personalInformation']['photo'] ?? null)
        <div class="photo-box">
            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
        </div>
        @endif
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="summary content-text">{!! $cvInformation['summaries'][0]['description'] !!}</div>
    @endif

    @php
        $educations = [];
        $prof_experiences = [];
        $academic_keywords = ['formation', 'académique', 'education', 'étudiant', 'diplôme', 'scolarité'];
        foreach($experiencesByCategory as $category => $experiences) {
            $is_academic = false;
            foreach($academic_keywords as $kw) {
                if(str_contains(strtolower($category), $kw)) {
                    $is_academic = true; break;
                }
            }
            if($is_academic) {
                $educations = array_merge($educations, $experiences);
            } else {
                $prof_experiences[$category] = $experiences;
            }
        }
    @endphp

    <div class="section">
        <div class="sec-title">{{ $currentLocale === 'fr' ? 'Expérience & Recherche' : 'Professional Path' }}</div>
        
        @foreach($prof_experiences as $category => $experiences)
            @php
                $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                if($isEnglish && $translatedCategory === $category) {
                    $normCat = strtolower($category);
                    if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'work')) $translatedCategory = 'Core Career';
                    elseif(str_contains($normCat, 'recherche')) $translatedCategory = 'Research Phase';
                }
            @endphp
            <div class="cat-subtitle">{{ $translatedCategory }}</div>
            @foreach($experiences as $exp)
            <div class="item">
                <div class="item-head">
                    <span class="item-role">{{ $exp['name'] }}</span>
                    <span class="item-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} — {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</span>
                </div>
                <span class="item-inst">{{ $exp['InstitutionName'] }}</span>
                @if(!empty($exp['description']))
                <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                @endif
            </div>
            @endforeach
        @endforeach
    </div>

    @if(!empty($educations))
    <div class="section">
        <div class="sec-title">{{ $currentLocale === 'fr' ? 'Formation' : 'Academic Background' }}</div>
        @foreach($educations as $edu)
        <div class="item">
            <div class="item-head">
                <span class="item-role">{{ $edu['name'] }}</span>
                <span class="item-date">{{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</span>
            </div>
            <div style="font-weight: 600; color: #64748b;">{{ $edu['InstitutionName'] }}</div>
            @if(!empty($edu['description']))
            <div class="rich-text content-text" style="font-size: 9pt; margin-top: 1.5mm;">{!! $edu['description'] !!}</div>
            @endif
        </div>
        @endforeach
    </div>
    @endif

    <div class="info-grid">
        <div class="info-col">
            <span class="info-label">{{ $currentLocale === 'fr' ? 'Expertise' : 'Skills' }}</span>
            <div class="skill-list">
                @foreach($cvInformation['competences'] as $comp)
                <div class="skill-item">
                    <span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                    <span class="skill-lvl">({{ $comp['level'] }})</span>
                </div>
                @endforeach
            </div>
        </div>

        <div class="info-col">
            <span class="info-label">{{ $currentLocale === 'fr' ? 'Divers' : 'Others' }}</span>
            @if(!empty($cvInformation['languages']))
                @foreach($cvInformation['languages'] as $lang)
                <div class="skill-item" style="border-bottom: none; margin-bottom: 1mm;">
                    <strong>{{ $lang['name'] }}</strong>
                    <span>{{ $lang['level'] }}</span>
                </div>
                @endforeach
            @endif

            @if(!empty($cvInformation['certifications']))
            <div style="margin-top: 4mm;">
                @foreach($cvInformation['certifications'] as $cert)
                <div class="cert-item"><strong>{{ $cert['name'] }}</strong></div>
                @endforeach
            </div>
            @endif
        </div>
    </div>

    @if(!empty($cvInformation['hobbies']))
    <div style="margin-top: 10mm; color: #94a3b8; font-size: 8.5pt; text-align: center;">
        {{ $isEnglish ? 'Interests' : 'Centres d’intérêt' }} : 
        {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(' • ') }}
    </div>
    @endif
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
