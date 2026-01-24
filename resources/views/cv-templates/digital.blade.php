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
            $primaryColor = $cvInformation['primary_color'] ?? '#06b6d4';
            $bgSide = "#f1f5f9";
            $textMain = "#334155";
        @endphp

        @page { margin: 0; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', 'Roboto', sans-serif; font-size: 9pt; line-height: 1.35; color: {{ $textMain }}; background: #fff; }

        .cv-page { display: table; width: 210mm; min-height: 297mm; table-layout: fixed; }
        
        .side { display: table-cell; width: 65mm; background: {{ $bgSide }}; padding: 6mm; vertical-align: top; border-right: 1px solid #e2e8f0; }
        .main { display: table-cell; width: 145mm; background: #fff; padding: 6mm 8mm; vertical-align: top; }

        .photo-container { width: 100%; display: flex; justify-content: center; margin-bottom: 5mm; }
        .photo { width: 35mm; height: 35mm; border-radius: 6mm; overflow: hidden; border: 2px solid {{ $primaryColor }}; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .photo img { width: 100%; height: 100%; object-fit: cover; }

        .side-header { margin-bottom: 6mm; text-align: left; }
        .name { font-size: 22pt; font-weight: 800; color: {{ $primaryColor }}; line-height: 1; margin-bottom: 2mm; text-transform: uppercase; letter-spacing: -0.5px; }
        .title { font-size: 10pt; font-weight: 600; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }

        .contact-group { margin-bottom: 6mm; }
        .contact-item { display: flex; align-items: center; margin-bottom: 2mm; font-size: 8pt; color: {{ $textMain }}; word-break: break-all; }
        .contact-icon { width: 7mm; height: 7mm; background: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 3mm; box-shadow: 0 1px 2px rgba(0,0,0,0.05); color: {{ $primaryColor }}; flex-shrink: 0; }
        .contact-icon svg { width: 4mm; height: 4mm; stroke-width: 2; }

        .side-section { margin-bottom: 5mm; }
        .side-title { font-size: 9pt; font-weight: 700; color: #0f172a; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 1mm; margin-bottom: 3mm; display: inline-block; }

        .skill-item { margin-bottom: 2.5mm; }
        .skill-header { display: flex; justify-content: space-between; font-size: 8pt; margin-bottom: 0.5mm; font-weight: 500; }
        .skill-bar-bg { width: 100%; height: 2mm; background: #cbd5e1; border-radius: 1mm; overflow: hidden; }
        .skill-bar-fill { height: 100%; background: {{ $primaryColor }}; border-radius: 1mm; }

        .edu-item { margin-bottom: 3mm; font-size: 8.5pt; }
        .edu-name { font-weight: 700; color: #0f172a; }
        .edu-meta { font-size: 8pt; color: #64748b; font-style: italic; }
        
        .rich-text { color: #475569; text-align: justify; }
        .rich-text ul { list-style: disc; padding-left: 4mm; margin-top: 1mm; margin-left: 1mm; }
        .rich-text li { margin-bottom: 0.5mm; }

        .lang-item { margin-bottom: 1.5mm; display: flex; justify-content: space-between; font-size: 8.5pt; border-bottom: 1px dotted #cbd5e1; padding-bottom: 0.5mm; }
        .hobby-tag { display: inline-block; background: #fff; border: 1px solid #e2e8f0; padding: 1mm 2mm; border-radius: 3px; font-size: 8pt; margin-bottom: 1mm; margin-right: 1mm; color: #475569; }

        .section { margin-bottom: 6mm; }
        .section-header { display: flex; align-items: center; margin-bottom: 3mm; }
        .section-icon { width: 8mm; height: 8mm; background: {{ $primaryColor }}; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 3mm; }
        .section-icon svg { width: 4.5mm; height: 4.5mm; stroke-width: 2; }
        .section-title { font-size: 11pt; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }

        .exp-item { position: relative; padding-left: 5mm; margin-bottom: 4mm; border-left: 1px dashed #cbd5e1; }
        .exp-item:last-child { border-left: none; }
        .exp-item::before { content: ''; position: absolute; left: -2.5px; top: 0; width: 5px; height: 5px; background: {{ $primaryColor }}; border-radius: 50%; }
        
        .exp-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
        .exp-role { font-size: 10pt; font-weight: 700; color: {{ $primaryColor }}; }
        .exp-date { font-size: 8pt; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; }
        .exp-company { font-size: 9pt; font-weight: 600; color: #0f172a; margin-bottom: 1mm; }

        .cert-item { margin-bottom: 2mm; font-size: 8.5pt; border-left: 2px solid {{ $primaryColor }}; padding-left: 2mm; }
        
        svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-page">
    <div class="side">
        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-container">
            <div class="photo">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
            </div>
        </div>
        @endif

        <div class="side-header">
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}<br>{{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="title">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
        </div>

        <div class="contact-group">
            @if($cvInformation['personalInformation']['address'])
            <div class="contact-item">
                <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <span>{{ $cvInformation['personalInformation']['address'] }}</span>
            </div>
            @endif
            @if($cvInformation['personalInformation']['email'])
            <div class="contact-item">
                <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                <span>{{ $cvInformation['personalInformation']['email'] }}</span>
            </div>
            @endif
            @if($cvInformation['personalInformation']['phone'])
            <div class="contact-item">
                <div class="contact-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg></div>
                <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
            </div>
            @endif
        </div>

        @if(!empty($cvInformation['competences']))
        <div class="side-section">
            <div class="side-title">{{ $currentLocale === 'fr' ? 'COMPÉTENCES' : 'SKILLS' }}</div>
            @foreach($cvInformation['competences'] as $comp)
            @php $level = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 80, 'Intermédiaire' => 60, 'Débutant' => 40, default => 60 }; @endphp
            <div class="skill-item">
                <div class="skill-header"><span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span><span>{{ $level }}%</span></div>
                <div class="skill-bar-bg"><div class="skill-bar-fill" style="width: {{ $level }}%"></div></div>
            </div>
            @endforeach
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
        <div class="side-section">
            <div class="side-title">{{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}</div>
            @foreach($educations as $edu)
            <div class="edu-item">
                <div class="edu-name">{{ $edu['name'] }}</div>
                <div class="edu-meta">{{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }} - {{ $edu['date_end'] ? \Carbon\Carbon::parse($edu['date_end'])->format('Y') : 'Pres.' }} | {{ $edu['InstitutionName'] }}</div>
                @if(!empty($edu['description']))
                <div class="rich-text content-text" style="font-size: 8pt; margin-top: 1mm;">{!! $edu['description'] !!}</div>
                @endif
            </div>
            @endforeach
        </div>
        @endif

        @if(!empty($cvInformation['certifications']))
        <div class="side-section">
            <div class="side-title">{{ $currentLocale === 'fr' ? 'CERTIFICATIONS' : 'CERTIFICATIONS' }}</div>
            @foreach($cvInformation['certifications'] as $cert)
            <div class="cert-item">
                <div style="font-weight: 600;">{{ $cert['name'] }}</div>
                @if(!empty($cert['institution'])) <div style="font-style: italic;">{{ $cert['institution'] }}</div> @endif 
            </div>
            @endforeach
        </div>
        @endif

        @if(!empty($cvInformation['languages']))
        <div class="side-section">
            <div class="side-title">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</div>
            @foreach($cvInformation['languages'] as $lang)
            <div class="lang-item">
                <span style="font-weight: 500;">{{ $lang['name'] }}</span>
                <span style="color: #64748b; font-size: 8pt;">{{ $lang['level'] }}</span>
            </div>
            @endforeach
        </div>
        @endif
    </div>

    <div class="main">
        @if(!empty($cvInformation['summaries']))
        <div class="section">
            <div class="section-header">
                <div class="section-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
                <div class="section-title">{{ $currentLocale === 'fr' ? 'À PROPOS' : 'ABOUT' }}</div>
            </div>
            <div class="rich-text content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
        </div>
        @endif

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
        <div class="section">
            <div class="section-header">
                <div class="section-icon"><svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                <div class="section-title">{{ $translatedCategory }}</div>
            </div>
            @foreach($experiences as $exp)
            <div class="exp-item">
                <div class="exp-head">
                    <span class="exp-role">{{ $exp['name'] }}</span>
                    <span class="exp-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YY') : ($isEnglish ? 'Present' : 'Présent') }}</span>
                </div>
                <div class="exp-company">{{ $exp['InstitutionName'] }}</div>
                <div class="rich-text content-text">{!! $exp['description'] !!}</div>
            </div>
            @endforeach
        </div>
        @endforeach
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
