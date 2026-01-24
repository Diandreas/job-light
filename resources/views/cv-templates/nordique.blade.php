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
            $primaryColor = $cvInformation['primary_color'] ?? '#374151';
            $textDark = '#111827';
            $textMuted = '#6b7280';
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 12mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; font-size: 9.2pt; line-height: 1.45; color: #374151; background: #fff; }

        .cv-wrapper { width: 186mm; margin: 0 auto; }

        /* CENTERED NORDIC HEADER */
        .header { text-align: center; border-bottom: 2px solid #f3f4f6; padding-bottom: 8mm; margin-bottom: 8mm; position: relative; }
        
        .photo-box { width: 28mm; height: 28mm; border-radius: 50%; overflow: hidden; border: 1px solid #e5e7eb; padding: 1mm; background: #fff; margin: 0 auto 4mm; }
        .photo-box img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

        .name { font-size: 18pt; font-weight: 800; color: {{ $textDark }}; text-transform: uppercase; letter-spacing: 1px; line-height: 1.1; margin-bottom: 2mm; }
        .job-title { font-size: 10pt; font-weight: 600; color: {{ $primaryColor }}; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 4mm; }

        .contact-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 5mm; font-size: 8.5pt; color: {{ $textMuted }}; }
        .contact-item { display: flex; align-items: center; }
        .contact-item svg { width: 3.5mm; height: 3.5mm; margin-right: 1.5mm; stroke: {{ $primaryColor }}; fill: none; stroke-width: 2; }

        /* SECTIONS */
        .section { margin-bottom: 8mm; }
        .sec-title { font-size: 10pt; font-weight: 800; color: {{ $textDark }}; text-transform: uppercase; letter-spacing: 2px; text-align: center; margin-bottom: 6mm; }
        .sec-title::after { content: ''; display: block; width: 15mm; height: 2px; background: {{ $primaryColor }}; margin: 2mm auto 0; }

        .summary { font-size: 9.5pt; line-height: 1.6; color: #4b5563; text-align: center; margin-bottom: 8mm; font-style: italic; padding: 0 15mm; }

        /* CATEGORY LABELS */
        .cat-label { font-size: 9pt; font-weight: 700; color: {{ $primaryColor }}; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6mm; margin-bottom: 4mm; text-align: center; }
        .cat-label span { background: #f9fafb; padding: 1mm 4mm; border-radius: 20px; border: 1px solid #f3f4f6; }

        /* EXPERIENCES */
        .item { margin-bottom: 6mm; page-break-inside: avoid; }
        .item-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5mm; }
        .item-role { font-size: 11pt; font-weight: 700; color: {{ $textDark }}; }
        .item-date { font-size: 8.5pt; color: {{ $primaryColor }}; font-weight: 700; background: #f8fafc; padding: 1px 10px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .item-inst { font-size: 10pt; font-weight: 600; color: {{ $textMuted }}; font-style: italic; margin-bottom: 3mm; display: block; }

        .rich-text { text-align: justify; color: #4b5563; font-size: 9.5pt; }
        .rich-text ul { list-style: square; padding-left: 5mm; margin-top: 2mm; }
        .rich-text li { margin-bottom: 1.2mm; line-height: 1.5; }

        /* HORIZONTAL GRID FOR FOOTER INFO */
        .horizontal-grid { display: table; width: 100%; border-top: 1px solid #f3f4f6; padding-top: 8mm; margin-top: 2mm; table-layout: fixed; }
        .grid-col { display: table-cell; vertical-align: top; padding: 0 5mm; text-align: center; }

        .info-title { font-size: 8.5pt; font-weight: 800; color: {{ $textDark }}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4mm; display: block; }
        .tag { display: inline-block; background: #f9fafb; border: 1px solid #e5e7eb; padding: 1mm 3mm; border-radius: 4px; font-size: 8pt; margin-bottom: 1.5mm; margin-right: 1mm; color: #374151; font-weight: 500; }
        
        .kv-row { display: flex; justify-content: center; gap: 2mm; font-size: 8.5pt; margin-bottom: 1.5mm; }
        .kv-lvl { color: {{ $primaryColor }}; font-weight: 700; }

        svg { stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-wrapper">
    <div class="header">
        @if($cvInformation['personalInformation']['photo'] ?? null)
        <div class="photo-box">
            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
        </div>
        @endif

        <h1 class="name">{{ $cvInformation['personalInformation']['firstName'] ?? '' }} {{ $cvInformation['personalInformation']['lastName'] ?? '' }}</h1>
        <div class="job-title">{{ $currentLocale === 'fr' ? ($cvInformation['professions'][0]['name'] ?? '') : ($cvInformation['professions'][0]['name_en'] ?? '') }}</div>
        
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

    @if(!empty($cvInformation['summaries']))
    <div class="summary content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section">
        <span class="sec-title">{{ $isEnglish ? 'Professional Journey' : 'Parcours' }}</span>
        
        @foreach($experiencesByCategory as $category => $experiences)
            @php
                $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                if($isEnglish && $translatedCategory === $category) {
                    $normCat = strtolower($category);
                    if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'work')) $translatedCategory = 'Core Career';
                    elseif(str_contains($normCat, 'recherche')) $translatedCategory = 'Research Phase';
                    elseif(str_contains($normCat, 'format') || str_contains($normCat, 'académ') || str_contains($normCat, 'education')) $translatedCategory = 'Academic Path';
                }
            @endphp
            <div class="cat-label"><span>{{ $translatedCategory }}</span></div>
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

    <div class="horizontal-grid">
        <div class="grid-col">
            <span class="info-title">{{ $currentLocale === 'fr' ? 'Expertise' : 'Hard Skills' }}</span>
            @if(!empty($cvInformation['competences']))
                @foreach($cvInformation['competences'] as $comp)
                <span class="tag">{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                @endforeach
            @endif
        </div>

        <div class="grid-col">
            <span class="info-title">{{ $currentLocale === 'fr' ? 'Compléments' : 'Languages & Honors' }}</span>
            @if(!empty($cvInformation['languages']))
                @foreach($cvInformation['languages'] as $lang)
                <div class="kv-row">
                    <span>{{ $lang['name'] }}</span>
                    <span class="kv-lvl">({{ $lang['level'] }})</span>
                </div>
                @endforeach
            @endif

            @if(!empty($cvInformation['certifications']))
            @foreach($cvInformation['certifications'] as $cert)
            <div style="font-size: 8.5pt; margin-top: 3mm;">
                <div style="font-weight: 700;">{{ $cert['name'] }}</div>
                <div style="font-size: 8pt; color: {{ $textMuted }}; opacity: 0.8;">@ {{ $cert['institution'] }}</div>
            </div>
            @endforeach
            @endif
        </div>
    </div>

    @if(!empty($cvInformation['hobbies']))
    <div style="margin-top: 10mm; text-align: center; font-size: 8.5pt; color: {{ $textMuted }}; opacity: 0.6; font-style: italic;">
        — {{ $isEnglish ? 'Personal Interests' : 'Loisirs' }} : 
        {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(' • ') }} —
    </div>
    @endif
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
