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
            $primaryColor = $cvInformation['primary_color'] ?? '#003366'; // Corporate Navy Blue default
            $accentColor = '#f0f4f8';
            $darkColor = '#1e293b';
            $gray = '#64748b';
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 9pt; line-height: 1.5; color: {{ $darkColor }}; background: #fff; }

        /* HEADER - Full Width Top */
        .header { background: {{ $primaryColor }}; color: #fff; padding: 10mm 8mm; margin-bottom: 8mm; display: flex; align-items: center; }
        .photo-box { width: 35mm; height: 35mm; border: 2px solid #fff; border-radius: 50%; overflow: hidden; margin-right: 8mm; flex-shrink: 0; background: #fff; }
        .photo-box img { width: 100%; height: 100%; object-fit: cover; }
        
        .header-info { flex: 1; }
        .name { font-size: 22pt; font-weight: 700; text-transform: uppercase; margin-bottom: 1mm; line-height: 1.1; letter-spacing: 0.5px; }
        .role { font-size: 11pt; font-weight: 300; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; margin-bottom: 4mm; }
        
        .header-contact { display: flex; flex-wrap: wrap; gap: 4mm; font-size: 8.5pt; font-weight: 400; opacity: 0.95; }
        .contact-bit { display: flex; align-items: center; }
        .contact-bit svg { width: 4mm; height: 4mm; margin-right: 2mm; fill: #fff; opacity: 0.8; }
        .contact-bit a { color: #fff; text-decoration: none; border-bottom: 1px dotted rgba(255,255,255,0.5); }

        /* FLOAT LAYOUT (Sidebar Left) */
        .container { width: 100%; }
        
        .sidebar {
            float: left;
            width: 30%;
            padding-right: 5mm;
            border-right: 2px solid {{ $accentColor }};
            margin-right: 5mm;
            min-height: 200mm; /* Enforce 2-column Page 1 */
        }
        
        .main {
            width: auto;
            /* Flows around sidebar */
        }

        /* TYPOGRAPHY & SECTIONS */
        .section-title { font-size: 10pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 1.5mm; margin-bottom: 4mm; letter-spacing: 1px; display: flex; align-items: center; }
        .section-title svg { margin-right: 2.5mm; width: 5mm; height: 5mm; fill: {{ $primaryColor }}; }

        /* MAIN CONTENT ITEMS */
        .job-entry { margin-bottom: 6mm; page-break-inside: avoid; }
        .job-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
        .job-role { font-size: 10.5pt; font-weight: 700; color: {{ $darkColor }}; }
        .job-date { font-size: 9pt; font-weight: 700; color: {{ $primaryColor }}; white-space: nowrap; }
        .job-company { font-size: 9.5pt; font-weight: 600; color: {{ $gray }}; margin-bottom: 2mm; text-transform: uppercase; font-size: 8.5pt; letter-spacing: 0.5px; }
        
        .rich-text { text-align: justify; color: #475569; font-size: 9.5pt; }
        .rich-text ul { list-style: disc; padding-left: 5mm; margin-top: 1mm; }
        .rich-text li { margin-bottom: 1mm; }

        /* SIDEBAR ITEMS */
        .side-group { margin-bottom: 6mm; page-break-inside: avoid; }
        .side-label { font-size: 9pt; font-weight: 700; color: {{ $darkColor }}; margin-bottom: 1mm; display: block; }
        .side-sub { font-size: 8.5pt; color: {{ $gray }}; margin-bottom: 3mm; line-height: 1.4; }
        
        .skill-bar-wrap { margin-bottom: 3mm; }
        .skill-info { display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 600; margin-bottom: 1mm; }
        .progress { height: 1.5mm; background: #e2e8f0; border-radius: 1mm; overflow: hidden; }
        .bar { height: 100%; background: {{ $primaryColor }}; }

        .cat-marker { display: inline-block; background: {{ $accentColor }}; color: {{ $primaryColor }}; padding: 1mm 3mm; font-size: 8pt; font-weight: 700; border-radius: 4px; margin-bottom: 3mm; margin-top: 3mm; text-transform: uppercase; }

        /* Icons */
        svg { flex-shrink: 0; }
        
        .clearfix::after { content: ""; display: table; clear: both; }
    </style>
</head>
<body>

    <div class="header">
        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-box">
            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
        </div>
        @endif
        
        <div class="header-info">
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="role">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
            
            <div class="header-contact">
                @if($cvInformation['personalInformation']['email'])
                <div class="contact-bit">
                    <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg> 
                    {{ $cvInformation['personalInformation']['email'] }}
                </div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                <div class="contact-bit">
                    <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> 
                    {{ $cvInformation['personalInformation']['phone'] }}
                </div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                <div class="contact-bit">
                    <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg> 
                    {{ $cvInformation['personalInformation']['address'] }}
                </div>
                @endif
                
                @if(!empty($cvInformation['personalInformation']['linkedin']))
                <div class="contact-bit">
                    <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> 
                    <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" target="_blank">{{ $cvInformation['personalInformation']['linkedin'] }}</a>
                </div>
                @endif
                @if(!empty($cvInformation['personalInformation']['github']))
                <div class="contact-bit">
                    <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> 
                    <a href="{{ $cvInformation['personalInformation']['github'] }}" target="_blank">{{ $cvInformation['personalInformation']['github'] }}</a>
                </div>
                @endif
            </div>
        </div>
    </div>

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

    <div class="container">
        <!-- Sidebar -->
        <div class="sidebar">
            @if(!empty($cvInformation['competences']))
            <div class="section-title">
                <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                {{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}
            </div>
            @foreach($cvInformation['competences'] as $comp)
            @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 85, 'Intermédiaire' => 60, 'Débutant' => 40, default => 60 }; @endphp
            <div class="skill-bar-wrap">
                <div class="skill-info">
                    <span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                </div>
                <div class="progress"><div class="bar" style="width: {{ $lvl }}%"></div></div>
            </div>
            @endforeach
            <div style="margin-bottom: 6mm;"></div>
            @endif

            @if(!empty($educations))
            <div class="section-title">
                <svg viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
                {{ $currentLocale === 'fr' ? 'Formation' : 'Education' }}
            </div>
            @foreach($educations as $edu)
            <div class="side-group">
                <span class="side-label">{{ $edu['name'] }}</span>
                <div class="side-sub">
                    {{ $edu['InstitutionName'] }} <br>
                    <span style="font-weight: 500; color: {{ $primaryColor }}">{{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</span>
                </div>
                @if(!empty($edu['description']))
                <div class="rich-text" style="font-size: 8pt; margin-top: -2mm;">{!! $edu['description'] !!}</div>
                @endif
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['certifications']))
            <div class="section-title">
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                Certifications
            </div>
            @foreach($cvInformation['certifications'] as $cert)
            <div class="side-group">
                <span class="side-label">{{ $cert['name'] }}</span>
                <div class="side-sub">
                    {{ $cert['institution'] }}
                </div>
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['languages']))
            <div class="section-title">
                <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
                {{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}
            </div>
            @foreach($cvInformation['languages'] as $lang)
            <div class="skill-info" style="margin-bottom: 2mm;">
                <span>{{ $lang['name'] }}</span>
                <span style="font-weight: 400; color: {{ $gray }}">{{ $lang['level'] }}</span>
            </div>
            @endforeach
            @endif
        </div>

        <!-- Main Content -->
        <div class="main">
            @if(!empty($cvInformation['summaries']))
            <div class="section-title">
                <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                {{ $currentLocale === 'fr' ? 'Profil' : 'Profile' }}
            </div>
            <div class="rich-text" style="margin-bottom: 6mm;">
                {!! $cvInformation['summaries'][0]['description'] !!}
            </div>
            @endif

            <div class="section-title">
                <svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
                {{ $isEnglish ? 'Work Experience' : 'Expériences' }}
            </div>

            @foreach($prof_experiences as $category => $experiences)
                @php
                    $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                    if($isEnglish && $translatedCategory === $category) {
                        $normCat = strtolower($category);
                        if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'work')) $translatedCategory = 'Core Experience';
                        elseif(str_contains($normCat, 'recherche')) $translatedCategory = 'Research & Innovation';
                        elseif(str_contains($normCat, 'enseign') || str_contains($normCat, 'teach')) $translatedCategory = 'Teaching';
                    }
                @endphp
                <div class="cat-marker">{{ $translatedCategory }}</div>
                @foreach($experiences as $exp)
                <div class="job-entry">
                    <div class="job-head">
                        <div class="job-role">{{ $exp['name'] }}</div>
                        <div class="job-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} — {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</div>
                    </div>
                    <div class="job-company">{{ $exp['InstitutionName'] }}</div>
                    @if(!empty($exp['description']))
                    <div class="rich-text">{!! $exp['description'] !!}</div>
                    @endif
                </div>
                @endforeach
            @endforeach
        </div>
        
        <div class="clearfix"></div>
    </div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
