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
            $primaryColor = $cvInformation['primary_color'] ?? '#e74c3c';
        @endphp

        @page { margin: 0; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Montserrat', sans-serif; font-size: 9.2pt; line-height: 1.4; color: #333; background: #fff; }

        .banner { background: {{ $primaryColor }}; width: 100%; padding: 15mm 10mm 15mm 80mm; min-height: 50mm; position: relative; }
        .name { font-size: 32pt; font-weight: 900; color: #fff; line-height: 1.1; text-transform: uppercase; }
        .job-title { font-size: 14pt; color: #fff; font-weight: 600; letter-spacing: 1px; opacity: 0.9; margin-top: 2mm; }

        .cv-grid { display: table; width: 210mm; min-height: 247mm; table-layout: fixed; }
        
        .sidebar { display: table-cell; width: 75mm; padding: 5mm 10mm; vertical-align: top; background: #fdfdfd; border-right: 1px solid #f0f0f0; }
        .main { display: table-cell; width: 135mm; padding: 10mm; vertical-align: top; background: #fff; }

        .photo-container { margin-top: -35mm; position: relative; z-index: 10; margin-bottom: 8mm; }
        .photo-blob { width: 55mm; height: 55mm; background: #fff; padding: 2mm; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .photo-blob img { width: 100%; height: 100%; object-fit: cover; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }

        .side-title { font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4mm; color: {{ $primaryColor }}; border-bottom: 2px solid #eee; padding-bottom: 1mm; margin-top: 6mm; }
        
        .contact-item { margin-bottom: 3mm; font-size: 8.5pt; display: flex; align-items: start; }
        .contact-icon { width: 6mm; margin-right: 2mm; color: {{ $primaryColor }}; flex-shrink: 0; }
        .contact-icon svg { width: 3.5mm; height: 3.5mm; fill: none; stroke: currentColor; stroke-width: 2.5; }

        /* TIMELINE SIDEBAR */
        .side-timeline { border-left: 2px solid {{ $primaryColor }}; margin-left: 3mm; padding-left: 5mm; margin-top: 2mm; }
        .side-time-box { position: relative; margin-bottom: 5mm; }
        .side-time-dot { position: absolute; left: -7.1mm; top: 1mm; width: 4mm; height: 4mm; background: #fff; border: 2px solid {{ $primaryColor }}; border-radius: 50%; }
        .side-time-title { font-weight: 800; font-size: 9.5pt; color: #111; line-height: 1.2; }
        .side-time-meta { font-size: 8pt; color: #666; font-style: italic; margin-bottom: 1mm; }
        .side-time-desc { font-size: 8.5pt; color: #555; line-height: 1.4; margin-top: 1mm; }

        /* SKILL DOTS */
        .skill-item { margin-bottom: 4mm; }
        .skill-name { font-weight: 700; font-size: 9pt; color: #333; margin-bottom: 1.5mm; display: block; }
        .skill-dots { display: flex; gap: 1.5mm; }
        .dot { width: 2.5mm; height: 2.5mm; background: #e5e7eb; border-radius: 50%; border: 1px solid #d1d5db; }
        .dot.filled { background: {{ $primaryColor }}; border-color: {{ $primaryColor }}; }

        .section-head { display: flex; align-items: center; margin-bottom: 6mm; margin-top: 4mm; }
        .section-num { font-size: 28pt; font-weight: 900; color: #f0f0f0; line-height: 0.8; margin-right: 3mm; }
        .section-text { font-size: 13pt; font-weight: 800; text-transform: uppercase; color: #2c3e50; border-left: 4px solid {{ $primaryColor }}; padding-left: 3mm; }

        /* CATEGORY LABELS */
        .cat-label { font-size: 10.5pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; margin-bottom: 4mm; margin-top: 2mm; display: flex; align-items: center; }
        .cat-label::after { content: ''; flex: 1; height: 1px; background: #eee; margin-left: 3mm; }

        .exp-box { margin-bottom: 6mm; position: relative; padding-left: 4mm; border-left: 2px solid #f3f4f6; }
        .exp-box::before { content: ''; position: absolute; left: -5px; top: 0; width: 8px; height: 8px; background: {{ $primaryColor }}; border-radius: 50%; }
        
        .exp-role { font-weight: 800; font-size: 11pt; color: #1e1b4b; margin-bottom: 1mm; }
        .exp-meta { font-weight: 600; color: #666; font-size: 9.5pt; margin-bottom: 2mm; display: flex; justify-content: space-between; align-items: baseline; }
        .exp-inst { color: {{ $primaryColor }}; font-weight: 700; font-style: italic; }
        
        .rich-text { text-align: justify; color: #4b5563; font-size: 9.5pt; line-height: 1.5; }
        .rich-text ul { list-style: disc; padding-left: 5mm; margin-top: 1.5mm; margin-left: 1mm; }
        .rich-text li { margin-bottom: 1mm; }
        
        .lang-item { display: flex; justify-content: space-between; font-size: 9pt; margin-bottom: 1.5mm; padding-bottom: 1mm; border-bottom: 1px dotted #e5e7eb; }

        svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>

<div class="banner">
    <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
    <div class="job-title">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
</div>

<div class="cv-grid">
    <div class="sidebar">
        <div class="photo-container">
            @if($cvInformation['personalInformation']['photo'])
            <div class="photo-blob">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
            </div>
            @else
            <div style="height: 35mm;"></div>
            @endif
        </div>

        <div class="side-title">{{ $currentLocale === 'fr' ? 'Contact' : 'Contact' }}</div>
        @if($cvInformation['personalInformation']['phone'])
        <div class="contact-item">
            <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg></div>
            <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
        </div>
        @endif
        @if($cvInformation['personalInformation']['email'])
        <div class="contact-item">
             <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
             <span>{{ $cvInformation['personalInformation']['email'] }}</span>
        </div>
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

        @if(!empty($educations))
        <div class="side-title">{{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}</div>
        <div class="side-timeline">
            @foreach($educations as $edu)
            <div class="side-time-box">
                <div class="side-time-dot"></div>
                <div class="side-time-title">{{ $edu['name'] }}</div>
                <div class="side-time-meta">{{ $edu['InstitutionName'] }} | {{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</div>
                @if(!empty($edu['description']))
                <div class="rich-text side-time-desc">{!! $edu['description'] !!}</div>
                @endif
            </div>
            @endforeach
        </div>
        @endif

        @if(!empty($cvInformation['competences']))
        <div class="side-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
        @foreach($cvInformation['competences'] as $comp)
        @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 5, 'Avancé' => 4, 'Intermédiaire' => 3, 'Débutant' => 2, default => 3 }; @endphp
        <div class="skill-item">
            <span class="skill-name">{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
            <div class="skill-dots">
                @for($i=1; $i<=5; $i++)
                <div class="dot {{ $i <= $lvl ? 'filled' : '' }}"></div>
                @endfor
            </div>
        </div>
        @endforeach
        @endif

        @if(!empty($cvInformation['certifications']))
        <div class="side-title">{{ $currentLocale === 'fr' ? 'Certifications' : 'Certifications' }}</div>
        @foreach($cvInformation['certifications'] as $cert)
        <div style="margin-bottom: 3mm; font-size: 8.5pt; border-left: 2px solid {{ $primaryColor }}; padding-left: 2.5mm;">
            <div style="font-weight: 700;">{{ $cert['name'] }}</div>
            @if(!empty($cert['institution'])) <div style="font-size: 8pt; color: #777;">{{ $cert['institution'] }}</div> @endif
        </div>
        @endforeach
        @endif

        @if(!empty($cvInformation['languages']))
        <div class="side-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
        @foreach($cvInformation['languages'] as $lang)
        <div class="lang-item">
            <span style="font-weight: 700;">{{ $lang['name'] }}</span>
            <span style="color: #666;">{{ $lang['level'] }}</span>
        </div>
        @endforeach
        @endif

        @if(!empty($cvInformation['hobbies']))
        <div class="side-title">{{ $currentLocale === 'fr' ? 'Loisirs' : 'Interests' }}</div>
        <div style="font-size: 8.5pt; color: #555; line-height: 1.6;">
             {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(' • ') }}
        </div>
        @endif
    </div>

    <div class="main">
        @if(!empty($cvInformation['summaries']))
        <div class="section-head">
            <div class="section-num">01</div>
            <div class="section-text">{{ $currentLocale === 'fr' ? 'À propos' : 'Profile' }}</div>
        </div>
        <div class="rich-text content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
        @endif

        <div class="section-head">
            <div class="section-num">02</div>
            <div class="section-text">{{ $currentLocale === 'fr' ? 'Expérience' : 'Experience' }}</div>
        </div>

        @foreach($prof_experiences as $category => $experiences)
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
            <div class="cat-label">{{ $translatedCategory }}</div>
            @foreach($experiences as $exp)
            <div class="exp-box">
                <div class="exp-role">{{ $exp['name'] }}</div>
                <div class="exp-meta">
                    <span class="exp-inst">{{ $exp['InstitutionName'] }}</span>
                    <span>{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($currentLocale === 'fr' ? 'Présent' : 'Present') }}</span>
                </div>
                @if(!empty($exp['description']))
                <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                @endif
            </div>
            @endforeach
        @endforeach
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
