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
            $primaryColor = $cvInformation['primary_color'] ?? '#0f172a';
            $accentColor = '#64748b';
            $bgHeader = "#f8fafc";
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 0; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Calibri', 'Carlito', sans-serif; font-size: 10pt; line-height: 1.4; color: #1e293b; background: #fff; }

        .cv-container { width: 210mm; min-height: 297mm; position: relative; }
        
        /* PROFESSIONNAL HEADER */
        .header { background: {{ $bgHeader }}; padding: 10mm 15mm; border-bottom: 1.5mm solid {{ $primaryColor }}; display: flex; align-items: center; justify-content: space-between; }
        .header-content { flex: 1; padding-right: 5mm; }
        .name { font-size: 18pt; font-weight: 700; color: {{ $primaryColor }}; text-transform: uppercase; margin-bottom: 2mm; line-height: 1; }
        .role-header { font-size: 10pt; font-weight: 600; color: {{ $accentColor }}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4mm; }
        
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; font-size: 9pt; color: #475569; }
        .contact-item { display: flex; align-items: center; }
        .contact-item svg { width: 4mm; height: 4mm; margin-right: 2.5mm; stroke: {{ $primaryColor }}; fill: none; stroke-width: 2; }

        .photo-box { width: 35mm; height: 45mm; border: 1px solid #e2e8f0; background: #fff; padding: 1.5mm; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .photo-img { width: 100%; height: 100%; object-fit: cover; }

        .main-body { padding: 10mm 15mm; display: table; width: 100%; table-layout: fixed; }
        .col-left { display: table-cell; width: 68%; padding-right: 12mm; vertical-align: top; border-right: 0.5px solid #e2e8f0; }
        .col-right { display: table-cell; width: 32%; padding-left: 12mm; vertical-align: top; }

        /* SECTIONS */
        .section-title { font-size: 10pt; font-weight: 800; color: {{ $primaryColor }}; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 1mm; margin-bottom: 5mm; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; }
        .section-title svg { margin-right: 3mm; width: 5mm; height: 5mm; stroke: {{ $primaryColor }}; }

        .summary { font-size: 10pt; color: #334155; text-align: justify; line-height: 1.6; margin-bottom: 8mm; background: #fcfcfc; padding: 3mm 4mm; border-left: 3px solid #e2e8f0; }

        /* CATEGORY DIFFERENTIATION */
        .cat-tag { font-size: 9pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 6mm; margin-bottom: 4mm; display: block; border-bottom: 1px solid #f1f5f9; padding-bottom: 1mm; }

        /* WORK EXPERIENCE REDESIGN */
        .job-item { margin-bottom: 8mm; page-break-inside: avoid; }
        .job-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2mm; }
        .job-left { flex: 1; }
        .job-company { font-size: 10pt; font-weight: 700; color: #0f172a; text-transform: uppercase; margin-bottom: 0.5mm; }
        .job-role { font-size: 9pt; font-weight: 600; color: {{ $primaryColor }}; font-style: italic; }
        .job-date { font-size: 8pt; font-weight: 600; color: {{ $accentColor }}; background: #f8fafc; padding: 1mm 3mm; border: 1px solid #e2e8f0; border-radius: 3px; white-space: nowrap; margin-left: 3mm; }
        
        .rich-text { text-align: justify; color: #334155; font-size: 9pt; line-height: 1.5; }
        .rich-text ul { list-style: disc; padding-left: 5mm; margin-top: 2.5mm; }
        .rich-text li { margin-bottom: 1.5mm; }

        /* SIDEBAR ITEMS */
        .side-sec-title { font-size: 9.5pt; font-weight: 800; color: {{ $primaryColor }}; text-transform: uppercase; margin-bottom: 4mm; border-bottom: 1px solid {{ $primaryColor }}; padding-bottom: 1mm; display: block; }
        
        .skill-group { margin-bottom: 4mm; }
        .skill-name { font-weight: 600; font-size: 9.5pt; margin-bottom: 1.5mm; display: flex; justify-content: space-between; color: #0f172a; }
        .skill-bar { height: 1.8mm; background: #f1f5f9; width: 100%; border-radius: 1mm; overflow: hidden; }
        .skill-fill { height: 100%; background: {{ $primaryColor }}; border-radius: 1mm; }

        .lang-item { margin-bottom: 2.5mm; display: flex; justify-content: space-between; font-size: 9.5pt; color: #334155; }
        .lang-lvl { font-weight: 700; color: {{ $primaryColor }}; font-size: 8.5pt; }

        .edu-item { margin-bottom: 5mm; }
        .edu-name { font-weight: 700; color: #0f172a; font-size: 10pt; line-height: 1.3; }
        .edu-meta { font-size: 8.5pt; color: {{ $accentColor }}; font-style: italic; margin-top: 1mm; }

        .cert-item { font-size: 9.5pt; margin-bottom: 3.5mm; border-left: 2.5px solid {{ $primaryColor }}; padding-left: 3.5mm; }

        svg { stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-container">
    <div class="header">
        <div class="header-content">
            <h1 class="name">{{ $cvInformation['personalInformation']['firstName'] ?? '' }} {{ $cvInformation['personalInformation']['lastName'] ?? '' }}</h1>
            <div class="role-header">{{ $currentLocale === 'fr' ? ($cvInformation['professions'][0]['name'] ?? '') : ($cvInformation['professions'][0]['name_en'] ?? '') }}</div>
            
            <div class="contact-grid">
                @if($cvInformation['personalInformation']['email'] ?? null)
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> {{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'] ?? null)
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg> {{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'] ?? null)
                <div class="contact-item"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
            </div>
        </div>
        
        @if($cvInformation['personalInformation']['photo'] ?? null)
        <div class="photo-box">
            <img class="photo-img" src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
        </div>
        @endif
    </div>

    <div class="main-body">
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

        <div class="col-left">
            @if(!empty($cvInformation['summaries']))
            <div class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <span>{{ $currentLocale === 'fr' ? 'Profil Professionnel' : 'Professional Profile' }}</span>
            </div>
            <div class="summary content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
            @endif

            <div class="section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <span>{{ $isEnglish ? 'Experience Ledger' : 'Parcours Professionnel' }}</span>
            </div>

            @foreach($prof_experiences as $category => $experiences)
                @php
                    $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                    if($isEnglish && $translatedCategory === $category) {
                        $normCat = strtolower($category);
                        if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'work')) $translatedCategory = 'Core Experience';
                        elseif(str_contains($normCat, 'recherche')) $translatedCategory = 'Research & innovation';
                        elseif(str_contains($normCat, 'enseign') || str_contains($normCat, 'teach')) $translatedCategory = 'Teaching';
                    }
                @endphp
                <div class="cat-tag">{{ $translatedCategory }}</div>
                @foreach($experiences as $exp)
                <div class="job-item">
                    <div class="job-header">
                        <div class="job-left">
                            <div class="job-company">{{ $exp['InstitutionName'] ?? '' }}</div>
                            <div class="job-role">{{ $exp['name'] ?? '' }}</div>
                        </div>
                        <div class="job-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} — {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</div>
                    </div>
                    @if(!empty($exp['description']))
                    <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                    @endif
                </div>
                @endforeach
            @endforeach
        </div>

        <div class="col-right">
            @if(!empty($cvInformation['competences']))
            <span class="side-sec-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Key Expertise' }}</span>
            @foreach($cvInformation['competences'] as $comp)
            @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 85, 'Intermédiaire' => 65, 'Débutant' => 45, default => 65 }; @endphp
            <div class="skill-group">
                <div class="skill-name">
                    <span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                </div>
                <div class="skill-bar"><div class="skill-fill" style="width: {{ $lvl }}%"></div></div>
            </div>
            @endforeach
            @endif
            
            @if(!empty($educations))
            <span class="side-sec-title" style="margin-top: 8mm;">{{ $currentLocale === 'fr' ? 'Formation' : 'Academic Path' }}</span>
            @foreach($educations as $edu)
            <div class="edu-item">
                <div class="edu-name">{{ $edu['name'] }}</div>
                <div class="edu-meta">{{ $edu['InstitutionName'] }} | {{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</div>
                @if(!empty($edu['description']))
                <div class="rich-text content-text" style="font-size: 8.5pt; margin-top: 1.5mm; color: #64748b;">{!! $edu['description'] !!}</div>
                @endif
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['certifications']))
            <span class="side-sec-title" style="margin-top: 8mm;">Certifications</span>
            @foreach($cvInformation['certifications'] as $cert)
            <div class="cert-item">
                <div style="font-weight: 700; font-size: 9.5pt; color: #1e293b;">{{ $cert['name'] }}</div>
                @if(!empty($cert['institution'])) <div style="font-style: italic; color: #64748b; font-size: 8.5pt; margin-top: 0.5mm;">{{ $cert['institution'] }}</div> @endif
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['languages']))
            <span class="side-sec-title" style="margin-top: 8mm;">{{ $currentLocale === 'fr' ? 'Langues' : 'Linguistics' }}</span>
            @foreach($cvInformation['languages'] as $lang)
            <div class="lang-item">
                <span style="font-weight: 600;">{{ $lang['name'] }}</span>
                <span class="lang-lvl">{{ $lang['level'] }}</span>
            </div>
            @endforeach
            @endif
            
            @if(!empty($cvInformation['hobbies']))
            <span class="side-sec-title" style="margin-top: 8mm;">{{ $currentLocale === 'fr' ? 'Intérêts' : 'Interests' }}</span>
            <div style="font-size: 9pt; color: #64748b; font-style: italic; line-height: 1.4;">
                {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(' • ') }}
            </div>
            @endif
        </div>
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection