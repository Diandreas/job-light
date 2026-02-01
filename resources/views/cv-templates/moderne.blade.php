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
            $primaryColor = $cvInformation['primary_color'] ?? '#c0a062';
            $dark = "#1c1c1c";
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
            
            // Layout Logic
            $leftHasContent = !empty($cvInformation['competences']);
            $rightHasContent = !empty($cvInformation['certifications']) || !empty($cvInformation['languages']);
            
            // Default 48% split
            $leftWidth = '48%';
            $rightWidth = '48%';
            
            if (!$leftHasContent && $rightHasContent) {
                // Only Right -> Full width
                $rightWidth = '100%';
            } elseif ($leftHasContent && !$rightHasContent) {
                 // Only Left -> Full width
                $leftWidth = '100%';
            }
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Didot', 'Times New Roman', serif; font-size: 9.2pt; line-height: 1.45; color: {{ $dark }}; background: #fff; }
        .cv { width: 194mm; border: 1mm solid {{ $primaryColor }}; padding: 6mm; min-height: 280mm; position: relative; }
        .cv::before { content: ''; position: absolute; top: 1mm; left: 1mm; right: 1mm; bottom: 1mm; border: 0.3mm solid {{ $primaryColor }}; pointer-events: none; }

        .header { text-align: center; margin-bottom: 8mm; position: relative; }
        .photo-wrapper { width: 35mm; height: 35mm; margin: 0 auto 4mm; border-radius: 50%; padding: 1mm; border: 1px solid {{ $primaryColor }}; }
        .photo-inner { width: 100%; height: 100%; border-radius: 50%; overflow: hidden; }
        .photo-inner img { width: 100%; height: 100%; object-fit: cover; }
        
        .initials { font-size: 20pt; font-weight: 700; color: {{ $primaryColor }}; margin-bottom: 2mm; display: inline-block; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 1mm; width: 12mm; height: 12mm; line-height: 12mm; text-align: center; }

        .name { font-size: 16pt; text-transform: uppercase; letter-spacing: 1.5mm; margin-bottom: 2mm; font-weight: 400; color: #000; }
        .job-title { font-size: 9pt; font-style: italic; color: #555; letter-spacing: 0.5px; margin-bottom: 3mm; }
        
        /* Flexbox Contact */
        .contact { display: flex; justify-content: center; flex-wrap: wrap; gap: 4mm; font-family: 'Segoe UI', sans-serif; font-size: 8.5pt; color: #666; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 2mm 0; }
        .contact-item { display: flex; align-items: center; white-space: nowrap; }
        .contact-item svg { width: 3.2mm; height: 3.2mm; margin-right: 1.5mm; fill: {{ $primaryColor }}; flex-shrink: 0; }

        .section-title { text-align: center; margin-bottom: 6mm; margin-top: 4mm; position: relative; }
        .section-title span { background: #fff; padding: 0 5mm; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 2px; color: {{ $primaryColor }}; font-weight: 700; position: relative; z-index: 1; }
        .section-title::after { content: ''; position: absolute; top: 50%; left: 0%; right: 0%; height: 1px; background: {{ $primaryColor }}; opacity: 0.4; z-index: 0; }

        /* EXPERIENCE ENTRIES */
        .exp { margin-bottom: 5mm; position: relative; padding-left: 8mm; page-break-inside: avoid; }
        .exp-border { position: absolute; left: -1px; top: 1mm; bottom: 0; width: 0.5mm; background: {{ $primaryColor }}; opacity: 0.3; }
        .exp::before { content: ''; position: absolute; left: -2.5mm; top: 1mm; width: 4mm; height: 4mm; background: #fff; border: 0.8mm solid {{ $primaryColor }}; transform: rotate(45deg); z-index: 2; }

        .cat-label { text-align: center; font-family: 'Segoe UI', sans-serif; font-size: 9pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4mm; opacity: 0.8; }

        .exp-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
        .exp-role { font-size: 9pt; font-weight: 700; text-transform: uppercase; color: #111; }
        .exp-date { font-family: 'Segoe UI', sans-serif; font-size: 8pt; font-weight: 600; color: {{ $primaryColor }}; }
        .exp-inst { font-family: 'Segoe UI', sans-serif; font-size: 8.5pt; color: #666; font-style: italic; margin-bottom: 2mm; display: block; }
        
        .rich-text { text-align: justify; color: #333; }
        .rich-text ul { list-style: square; padding-left: 4mm; margin-top: 1.5mm; }
        .rich-text li { margin-bottom: 1.2mm; }

        /* FOOTER FLEX */
        .row { display: flex; width: 100%; margin-top: 6mm; justify-content: space-between; flex-wrap: wrap; }
        .col { display: block; vertical-align: top; }
        /* .spacer replaced by justify-content: space-between */

        .skill { margin-bottom: 3mm; font-family: 'Segoe UI', sans-serif; }
        .skill-name { display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 1mm; color: #444; }
        .skill-line { height: 1.5px; background: #f0f0f0; position: relative; }
        .skill-fill { height: 100%; background: {{ $primaryColor }}; position: absolute; top: 0; left: 0; }
        
        .cert-item { margin-bottom: 2.5mm; font-size: 9pt; color: #444; display: flex; align-items: start; }
        .cert-dot { color: {{ $primaryColor }}; margin-right: 2mm; }

        svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv">
    <div class="header">
        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-wrapper">
            <div class="photo-inner">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
            </div>
        </div>
        @else
        <div class="initials">{{ substr($cvInformation['personalInformation']['firstName'], 0, 1) }}{{ substr($cvInformation['personalInformation']['lastName'], 0, 1) }}</div>
        @endif

        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div class="job-title">{{ $currentLocale === 'en' ? ($cvInformation['professions'][0]['name_en'] ?? $cvInformation['professions'][0]['name']) : $cvInformation['professions'][0]['name'] }}</div>
        
        <div class="contact">
            @if($cvInformation['personalInformation']['email'])
            <div class="contact-item"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{{ $cvInformation['personalInformation']['email'] }}</div>
            @endif
            @if($cvInformation['personalInformation']['phone'])
            <div class="contact-item"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>{{ $cvInformation['personalInformation']['phone'] }}</div>
            @endif
            @if($cvInformation['personalInformation']['address'])
            <div class="contact-item"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ $cvInformation['personalInformation']['address'] }}</div>
            @endif
            @if(!empty($cvInformation['personalInformation']['linkedin']))
            <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" class="contact-item" style="text-decoration: none; color: #666;" target="_blank">
                <svg viewBox="0 0 24 24" width="12" height="12"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> 
                {{ $cvInformation['personalInformation']['linkedin'] }}
            </a>
            @endif
            @if(!empty($cvInformation['personalInformation']['github']))
            <a href="{{ $cvInformation['personalInformation']['github'] }}" class="contact-item" style="text-decoration: none; color: #666;" target="_blank">
                <svg viewBox="0 0 24 24" width="12" height="12"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> 
                {{ $cvInformation['personalInformation']['github'] }}
            </a>
            @endif
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
    <div style="text-align: justify; font-style: italic; color: #555; margin-bottom: 8mm; padding: 0 10mm;">{!! $cvInformation['summaries'][0]['description'] !!}</div>
    @endif

    <div class="section-title"><span>{{ __('cv.experience') }}</span></div>

    @foreach($experiencesByCategory as $category => $experiences)
        @php
            $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
            if($isEnglish && $translatedCategory === $category) {
                $normCat = strtolower($category);
                if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'work')) $translatedCategory = 'Work Experience';
                elseif(str_contains($normCat, 'recherche')) $translatedCategory = 'Research';
                elseif(str_contains($normCat, 'format') || str_contains($normCat, 'académ')) $translatedCategory = 'Academic Path';
            }
        @endphp
        <div class="cat-label">{{ $translatedCategory }}</div>
        @foreach($experiences as $exp)
        <div class="exp">
            <div class="exp-border"></div>
            <div class="exp-head">
                <div class="exp-role">{{ $exp['name'] }}</div>
                <div class="exp-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</div>
            </div>
            <span class="exp-inst">{{ $exp['InstitutionName'] }}</span>
            @if(!empty($exp['description']))
            <div class="rich-text content-text">{!! $exp['description'] !!}</div>
            @endif
        </div>
        @endforeach
    @endforeach

    <div class="row">
        @if($leftHasContent)
        <div class="col" style="width: {{ $leftWidth }}">
            <div class="section-title"><span>{{ __('cv.skills') }}</span></div>
            @if(!empty($cvInformation['competences']))
            @foreach($cvInformation['competences'] as $comp)
            @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 80, 'Intermédiaire' => 60, 'Débutant' => 40, default => 60 }; @endphp
            <div class="skill">
                <div class="skill-name"><span>{{ $currentLocale === 'en' ? ($comp['name_en'] ?? $comp['name']) : $comp['name'] }}</span></div>
                <div class="skill-line"><div class="skill-fill" style="width: {{ $lvl }}%"></div></div>
            </div>
            @endforeach
            @endif
        </div>
        @endif
        
        @if($rightHasContent)
        <div class="col" style="width: {{ $rightWidth }}">
             @if(!empty($cvInformation['certifications']))
            <div class="section-title"><span>{{ __('cv.certifications') }}</span></div>
            @foreach($cvInformation['certifications'] as $cert)
            <div class="cert-item">
                 <span class="cert-dot">◆</span>
                 <span><strong>{{ $cert['name'] }}</strong><br><small style="color: #888;">{{ $cert['institution'] }}</small></span>
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['languages']))
            <div class="section-title" style="margin-top: 5mm;"><span>{{ __('cv.languages') }}</span></div>
            @foreach($cvInformation['languages'] as $lang)
            <div class="skill">
                <div class="skill-name"><span>{{ $currentLocale === 'en' ? ($lang['name_en'] ?? $lang['name']) : $lang['name'] }}</span> <small style="color: #888;">{{ trans()->has("cv.levels." . $lang['level']) ? __("cv.levels." . $lang['level']) : $lang['level'] }}</small></div>
            </div>
            @endforeach
            @endif
        </div>
        @endif
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
