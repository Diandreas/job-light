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
            $primaryColor = $cvInformation['primary_color'] ?? '#af944d'; /* Dynamic primary color */
            $deepDark = '#1a1a1a';
            $bgCream = '#fdfcf8'; 
            $textSlate = '#4a4a4a';
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; font-size: 9.5pt; line-height: 1.5; color: {{ $textSlate }}; background: {{ $bgCream }}; }

        .cv-wrapper { border: 1mm solid {{ $primaryColor }}; padding: 1mm; min-height: 277mm; }
        .inner-border { border: 0.2mm solid {{ $primaryColor }}; padding: 10mm; min-height: 275mm; background: #fff; }

        /* LUXURY HEADER */
        .header { text-align: center; margin-bottom: 10mm; position: relative; }
        
        .monogram { width: 15mm; height: 15mm; border: 1px solid {{ $primaryColor }}; margin: 0 auto 5mm; display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 18pt; color: {{ $primaryColor }}; letter-spacing: 2px; }

        .name { font-family: 'Playfair Display', serif; font-size: 20pt; color: {{ $deepDark }}; text-transform: uppercase; letter-spacing: 3px; line-height: 1.1; margin-bottom: 2mm; }
        .role { font-family: 'Inter', sans-serif; font-size: 9pt; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; color: {{ $primaryColor }}; margin-bottom: 5mm; }

        .contact-bar { display: flex; justify-content: center; gap: 6mm; font-size: 8.5pt; color: #777; border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 2mm 0; }
        .contact-item { display: flex; align-items: center; }
        .contact-item svg { width: 3.5mm; height: 3.5mm; margin-right: 1.5mm; stroke: {{ $primaryColor }}; fill: none; stroke-width: 1.5; }

        /* LAYOUT */
        .main-grid { display: table; width: 100%; table-layout: fixed; margin-top: 8mm; }
        .side-col { display: table-cell; width: 65mm; vertical-align: top; padding-right: 8mm; border-right: 0.5px solid #eee; }
        .content-col { display: table-cell; vertical-align: top; padding-left: 8mm; }

        .photo-wrap { width: 100%; margin-bottom: 6mm; text-align: center; }
        .photo-box { width: 45mm; height: 45mm; border: 1px solid {{ $primaryColor }}; padding: 1.5mm; background: #fff; display: inline-block; box-shadow: 10px 10px 0 {{ $bgCream }}; }
        .photo-box img { width: 100%; height: 100%; object-fit: cover; }

        /* SECTIONS */
        .section { margin-bottom: 8mm; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 13pt; color: {{ $deepDark }}; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5mm; display: flex; align-items: center; }
        .section-title::after { content: ''; flex: 1; height: 0.3mm; background: {{ $primaryColor }}; margin-left: 4mm; opacity: 0.6; }

        .summary-box { font-style: italic; color: #555; line-height: 1.7; text-align: justify; margin-bottom: 6mm; border-left: 2px solid {{ $primaryColor }}; padding-left: 5mm; }

        /* CATEGORY LABELS */
        .cat-luxury { font-size: 9pt; font-weight: 700; color: {{ $primaryColor }}; text-transform: uppercase; letter-spacing: 1px; margin-top: 4mm; margin-bottom: 3mm; display: block; border-bottom: 1px double #eee; padding-bottom: 1mm; }

        .exp-item { margin-bottom: 6mm; }
        .exp-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5mm; }
        .exp-role { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 11pt; color: {{ $deepDark }}; }
        .exp-date { font-weight: 600; font-size: 8.5pt; color: {{ $primaryColor }}; letter-spacing: 0.5px; }
        .exp-inst { font-size: 9.5pt; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2mm; display: block; }

        .rich-text { text-align: justify; color: {{ $textSlate }}; font-size: 9pt; line-height: 1.6; }
        .rich-text ul { list-style: square; padding-left: 5mm; margin-top: 2mm; }
        .rich-text li { margin-bottom: 1.5mm; }

        /* SKILLS TRACKS */
        .skill-item { margin-bottom: 3mm; }
        .skill-head { display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 600; margin-bottom: 1mm; text-transform: uppercase; color: #666; }
        .skill-track { height: 1mm; background: #f0f0f0; width: 100%; border-radius: 0.5mm; overflow: hidden; }
        .skill-bar { height: 100%; background: {{ $primaryColor }}; }

        .cert-item { margin-bottom: 4mm; font-size: 8.5pt; border-left: 1px solid {{ $primaryColor }}; padding-left: 3mm; }
        
        svg { stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-wrapper">
    <div class="inner-border">
        <div class="header">
            <div class="monogram">{{ substr($cvInformation['personalInformation']['firstName'] ?? 'X', 0, 1) }}{{ substr($cvInformation['personalInformation']['lastName'] ?? 'X', 0, 1) }}</div>
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="role">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
            
            <div class="contact-bar">
                @if($cvInformation['personalInformation']['email'])
                <div class="contact-item"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg>{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
            </div>
        </div>

        @if(!empty($cvInformation['summaries']))
        <div class="summary-box content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
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

        <div class="main-grid">
            <div class="side-col">
                @if($cvInformation['personalInformation']['photo'])
                <div class="photo-wrap">
                    <div class="photo-box">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
                    </div>
                </div>
                @endif

                @if(!empty($educations))
                <div class="section-title"><span>{{ $isEnglish ? 'Academics' : 'Formation' }}</span></div>
                @foreach($educations as $edu)
                <div class="cert-item" style="margin-bottom: 5mm;">
                    <div style="font-weight: 700; color: {{ $deepDark }}; font-family: 'Playfair Display', serif;">{{ $edu['name'] }}</div>
                    <div style="font-size: 8pt; color: {{ $primaryColor }}; font-weight: 600;">{{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</div>
                    <div style="font-size: 8.5pt; color: #888; font-style: italic;">{{ $edu['InstitutionName'] }}</div>
                    @if(!empty($edu['description']))
                    <div class="rich-text content-text" style="font-size: 8.5pt; margin-top: 1.5mm; color: #666;">{!! $edu['description'] !!}</div>
                    @endif
                </div>
                @endforeach
                @endif

                <div class="section-title" style="margin-top: 5mm;"><span>Expertise</span></div>
                @foreach($cvInformation['competences'] as $comp)
                @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 85, 'Intermédiaire' => 65, 'Débutant' => 45, default => 65 }; @endphp
                <div class="skill-item">
                    <div class="skill-head"><span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span></div>
                    <div class="skill-track"><div class="skill-bar" style="width: {{ $lvl }}%"></div></div>
                </div>
                @endforeach

                @if(!empty($cvInformation['certifications']))
                <div class="section-title" style="margin-top: 10mm;"><span>Certifications</span></div>
                @foreach($cvInformation['certifications'] as $cert)
                <div class="cert-item">
                    <strong>{{ $cert['name'] }}</strong><br>
                    <small>{{ $cert['institution'] }}</small>
                </div>
                @endforeach
                @endif

                @if(!empty($cvInformation['languages']))
                <div class="section-title" style="margin-top: 10mm;"><span>Linguistics</span></div>
                @foreach($cvInformation['languages'] as $lang)
                <div class="skill-head" style="margin-bottom: 2mm;"><span>{{ $lang['name'] }}</span> <span style="color: {{ $primaryColor }};">{{ $lang['level'] }}</span></div>
                @endforeach
                @endif
            </div>

            <div class="content-col">
                <div class="section-title"><span>Professional Timeline</span></div>
                
                @foreach($prof_experiences as $category => $experiences)
                    @php
                        $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                        
                        if($isEnglish && $translatedCategory === $category) {
                            $normCat = strtolower($category);
                            if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'professional') || str_contains($normCat, 'travail') || str_contains($normCat, 'work')) {
                                $translatedCategory = 'Executive Experience';
                            } elseif(str_contains($normCat, 'recherche') || str_contains($normCat, 'research')) {
                                $translatedCategory = 'Research';
                            }
                        }
                    @endphp
                    <div class="cat-luxury">{{ $translatedCategory }}</div>
                    @foreach($experiences as $exp)
                    <div class="exp-item">
                        <div class="exp-top">
                            <span class="exp-role">{{ $exp['name'] }}</span>
                            <span class="exp-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} — {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</span>
                        </div>
                        <span class="exp-inst">{{ $exp['InstitutionName'] }}</span>
                        @if(!empty($exp['description']))
                        <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                        @endif
                    </div>
                    @endforeach
                @endforeach
            </div>
        </div>
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection