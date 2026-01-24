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
            $primaryColor = $cvInformation['primary_color'] ?? '#3f3d56';
            $textDark = "#1e1e1e";
            $textLight = "#6c757d";
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 9.5pt; line-height: 1.5; color: {{ $textDark }}; background: #fff; }
        .cv { width: 190mm; margin: 0 auto; }

        /* ELEGANT HEADER */
        .header { border-bottom: 3px double {{ $primaryColor }}; padding-bottom: 6mm; margin-bottom: 8mm; display: flex; align-items: flex-end; justify-content: space-between; }
        .header-text { flex: 1; padding-right: 5mm; }
        .name { font-size: 18pt; color: {{ $textDark }}; text-transform: uppercase; letter-spacing: 2px; font-weight: 400; margin-bottom: 2mm; line-height: 1; }
        .title { font-size: 10pt; color: {{ $primaryColor }}; font-style: italic; font-weight: 600; margin-bottom: 4mm; letter-spacing: 0.5px; }
        
        .photo-frame { width: 32mm; height: 32mm; border: 1px solid #eee; padding: 1mm; background: #fff; border-radius: 2px; }
        .photo-inner { width: 100%; height: 100%; overflow: hidden; }
        .photo-inner img { width: 100%; height: 100%; object-fit: cover; }

        .contact-line { display: flex; gap: 5mm; flex-wrap: wrap; font-size: 8.5pt; color: {{ $textLight }}; font-family: 'Segoe UI', sans-serif; margin-top: 2mm; }
        .contact-item { display: flex; align-items: center; }
        .contact-item svg { width: 3.5mm; height: 3.5mm; margin-right: 1.5mm; stroke: {{ $primaryColor }}; stroke-width: 1.8; fill: none; }

        /* SECTION STYLING */
        .section { margin-bottom: 7mm; }
        .section-title { font-family: 'Segoe UI', sans-serif; font-size: 11pt; font-weight: 700; color: {{ $textDark }}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4mm; display: flex; align-items: center; }
        .section-title::after { content: ''; flex: 1; height: 1px; background: #e5e5e5; margin-left: 4mm; }

        .summary { font-style: italic; color: #444; text-align: justify; margin-bottom: 8mm; padding: 3mm 5mm; background: #fcfcfc; border-left: 3px solid {{ $primaryColor }}; line-height: 1.6; }

        /* CATEGORY LABELS */
        .cat-label { font-family: 'Segoe UI', sans-serif; font-size: 10pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; margin-top: 5mm; margin-bottom: 3mm; border-bottom: 1px solid #f0f0f0; display: inline-block; padding-bottom: 1mm; }

        /* EXPERIENCE ENTRIES */
        .exp { margin-bottom: 5mm; page-break-inside: avoid; }
        .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
        .exp-role { font-weight: 700; font-size: 10.5pt; color: {{ $textDark }}; }
        .exp-date { font-size: 9pt; color: {{ $primaryColor }}; font-weight: 600; font-family: 'Segoe UI', sans-serif; }
        .exp-company { font-size: 10pt; color: {{ $textLight }}; margin-bottom: 2mm; font-style: italic; display: block; }
        
        .rich-text { text-align: justify; color: #333; font-size: 9.5pt; }
        .rich-text ul { list-style: square; padding-left: 5mm; margin-top: 2mm; margin-left: 1mm; }
        .rich-text li { margin-bottom: 1mm; }

        /* FOOTER GRID */
        .footer-grid { display: table; width: 100%; table-layout: fixed; margin-top: 8mm; border-top: 1px solid #eee; padding-top: 6mm; }
        .footer-col { display: table-cell; vertical-align: top; padding-right: 8mm; }
        .footer-col:last-child { padding-right: 0; }

        .item-list { margin-bottom: 4mm; }
        .item-name { font-weight: 600; font-size: 9pt; display: flex; justify-content: space-between; margin-bottom: 1mm; border-bottom: 1px dotted #eee; padding-bottom: 0.5mm; }
        
        .skill-dots { display: flex; gap: 1mm; }
        .dot { width: 1.8mm; height: 1.8mm; background: #eee; border-radius: 50%; }
        .dot.active { background: {{ $primaryColor }}; }

        svg { stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv">
    <div class="header">
        <div class="header-text">
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="title">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
            
            <div class="contact-line">
                @if($cvInformation['personalInformation']['email'])
                <div class="contact-item"><svg viewBox="0 0 24 24" width="14" height="14"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                <div class="contact-item"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg>{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                <div class="contact-item"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
            </div>
        </div>

        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-frame">
            <div class="photo-inner">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
            </div>
        </div>
        @endif
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="summary content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section">
        <div class="section-title"><span>{{ str_starts_with(strtolower($currentLocale), 'en') ? 'Professional Path' : 'Parcours Professionnel' }}</span></div>
        
        @foreach($experiencesByCategory as $category => $experiences)
            @php
                $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
                $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                
                if($isEnglish && $translatedCategory === $category) {
                    $normCat = strtolower($category);
                    if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'professional') || str_contains($normCat, 'travail') || str_contains($normCat, 'work')) {
                        $translatedCategory = 'Work Experience';
                    } elseif(str_contains($normCat, 'recherche') || str_contains($normCat, 'research')) {
                        $translatedCategory = 'Research & Innovation';
                    } elseif(str_contains($normCat, 'enseign') || str_contains($normCat, 'teach')) {
                        $translatedCategory = 'Teaching';
                    } elseif(str_contains($normCat, 'format') || str_contains($normCat, 'académ') || str_contains($normCat, 'education')) {
                        $translatedCategory = 'Academic Path';
                    }
                }
            @endphp
            <div class="cat-label">{{ $translatedCategory }}</div>
            @foreach($experiences as $exp)
            <div class="exp">
                <div class="exp-header">
                    <span class="exp-role">{{ $exp['name'] }}</span>
                    <span class="exp-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</span>
                </div>
                <div class="exp-company">{{ $exp['InstitutionName'] }}</div>
                @if(!empty($exp['description']))
                <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                @endif
            </div>
            @endforeach
        @endforeach
    </div>

    <div class="footer-grid">
        <div class="footer-col">
            <div class="section-title"><span>{{ $currentLocale === 'fr' ? 'Compétences' : 'Expertise' }}</span></div>
            @if(!empty($cvInformation['competences']))
                @foreach($cvInformation['competences'] as $comp)
                @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 5, 'Avancé' => 4, 'Intermédiaire' => 3, 'Débutant' => 2, default => 3 }; @endphp
                <div class="item-list">
                    <div class="item-name">
                        <span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                        <div class="skill-dots">
                             @for($i=0; $i<5; $i++)<div class="dot {{ $i < $lvl ? 'active' : '' }}"></div>@endfor
                        </div>
                    </div>
                </div>
                @endforeach
            @endif
        </div>

        <div class="footer-col">
            @if(!empty($cvInformation['certifications']))
            <div class="section-title"><span>Certifications</span></div>
            @foreach($cvInformation['certifications'] as $cert)
            <div style="margin-bottom: 2mm; font-size: 9pt;">
                <strong>{{ $cert['name'] }}</strong><br>
                <small style="color: {{ $textLight }}; font-style: italic;">{{ $cert['institution'] }}</small>
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['languages']))
            <div class="section-title" style="margin-top: 4mm;"><span>{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</span></div>
            @foreach($cvInformation['languages'] as $lang)
            <div class="item-name"><span>{{ $lang['name'] }}</span> <span style="font-weight: 400; color: {{ $textLight }}; font-size: 8pt;">{{ $lang['level'] }}</span></div>
            @endforeach
            @endif
        </div>
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
