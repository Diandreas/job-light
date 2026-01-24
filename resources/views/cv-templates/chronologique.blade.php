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
            $primaryColor = $cvInformation['primary_color'] ?? '#d35400';
            $bgSide = "#fef9f3"; /* Soft orange tint to match primary */
            $textDark = "#2c3e50";
        @endphp

        @page { margin: 0; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Verdana', sans-serif; font-size: 9pt; line-height: 1.4; color: {{ $textDark }}; background: #fff; }

        .cv-grid { display: table; width: 210mm; min-height: 297mm; table-layout: fixed; }
        
        .sidebar { display: table-cell; width: 70mm; background: {{ $bgSide }}; padding: 10mm 6mm; vertical-align: top; border-right: 1px solid #eee; }
        
        .photo-container { text-align: center; margin-bottom: 8mm; }
        .photo-circle { width: 35mm; height: 35mm; border-radius: 50%; overflow: hidden; margin: 0 auto; border: 4px solid {{ $primaryColor }}; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .photo-circle img { width: 100%; height: 100%; object-fit: cover; }

        .side-section { margin-bottom: 8mm; }
        .side-title { font-size: 10pt; font-weight: bold; color: {{ $primaryColor }}; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 1mm; margin-bottom: 4mm; text-transform: uppercase; }
        
        .contact-item { margin-bottom: 3mm; font-size: 8.5pt; display: flex; align-items: start; }
        .contact-icon { width: 5mm; margin-right: 2mm; color: {{ $primaryColor }}; flex-shrink: 0; }
        
        .skill-item { margin-bottom: 3mm; }
        .skill-name { font-weight: bold; font-size: 8.5pt; margin-bottom: 1mm; }
        .skill-bar-bg { height: 1.5mm; background: #eee; width: 100%; border-radius: 1mm; }
        .skill-bar-fill { height: 100%; background: {{ $primaryColor }}; border-radius: 1mm; }

        .edu-item { margin-bottom: 4mm; }
        .edu-title { font-weight: bold; font-size: 9pt; color: {{ $textDark }}; }
        .edu-meta { font-size: 8pt; color: #7f8c8d; font-style: italic; }
        
        .main { display: table-cell; width: 140mm; background: #fff; padding: 12mm 10mm; vertical-align: top; }

        .name { font-size: 18pt; font-weight: 900; color: {{ $primaryColor }}; text-transform: uppercase; line-height: 1; margin-bottom: 2mm; }
        .job-title { font-size: 10pt; font-weight: 700; color: {{ $textDark }}; margin-bottom: 8mm; border-left: 5px solid {{ $primaryColor }}; padding-left: 4mm; }

        .section-title { font-size: 12pt; font-weight: 900; color: {{ $primaryColor }}; margin-bottom: 6mm; margin-top: 4mm; text-transform: uppercase; letter-spacing: 1px; }

        .timeline { border-left: 2px solid {{ $primaryColor }}; margin-left: 5mm; padding-left: 6mm; margin-bottom: 8mm; }
        
        .time-box { position: relative; margin-bottom: 8mm; page-break-inside: avoid; }
        .time-dot { position: absolute; left: -8.1mm; top: 1mm; width: 4mm; height: 4mm; background: #fff; border: 2px solid {{ $primaryColor }}; border-radius: 50%; z-index: 2; }
        
        .time-range { font-weight: bold; color: {{ $primaryColor }}; font-size: 9pt; margin-bottom: 1.5mm; background: #fff; display: inline-block; }
        .time-role { font-weight: 800; font-size: 11pt; color: {{ $textDark }}; margin-bottom: 0.5mm; }
        .time-place { font-style: italic; font-size: 9.5pt; color: #7f8c8d; margin-bottom: 2mm; }

        .rich-text { text-align: justify; color: #444; }
        .rich-text ul { list-style: disc; padding-left: 4mm; margin-top: 2mm; margin-left: 1mm; }
        .rich-text li { margin-bottom: 0.5mm; }

        svg { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-grid">
    <div class="sidebar">
        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-container">
            <div class="photo-circle">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
            </div>
        </div>
        @endif

        <div class="side-section">
            <div class="side-title">Contact</div>
            @if($cvInformation['personalInformation']['phone'])
            <div class="contact-item">
                <div class="contact-icon"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg></div>
                <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
            </div>
            @endif
            @if($cvInformation['personalInformation']['email'])
            <div class="contact-item">
                <div class="contact-icon"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                <span>{{ $cvInformation['personalInformation']['email'] }}</span>
            </div>
            @endif
        </div>

        @if(!empty($cvInformation['competences']))
        <div class="side-section">
            <div class="side-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
            @foreach($cvInformation['competences'] as $comp)
            @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 80, 'Intermédiaire' => 60, 'Débutant' => 40, default => 60 }; @endphp
            <div class="skill-item">
                <div class="skill-name">{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</div>
                <div class="skill-bar-bg"><div class="skill-bar-fill" style="width: {{ $lvl }}%"></div></div>
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
            <div class="side-title">{{ $currentLocale === 'fr' ? 'Formation' : 'Education' }}</div>
            @foreach($educations as $edu)
            <div class="edu-item">
                <div class="edu-title">{{ $edu['name'] }}</div>
                <div class="edu-meta">{{ $edu['InstitutionName'] }} | {{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</div>
                @if(!empty($edu['description']))
                <div class="rich-text content-text" style="font-size: 8pt; color: #555; margin-top: 1mm;">{!! $edu['description'] !!}</div>
                @endif
            </div>
            @endforeach
        </div>
        @endif

        @if(!empty($cvInformation['certifications']))
        <div class="side-section">
            <div class="side-title">{{ $currentLocale === 'fr' ? 'Certifications' : 'Certifications' }}</div>
            @foreach($cvInformation['certifications'] as $cert)
            <div style="margin-bottom: 2mm; font-size: 8.5pt;">
                <strong>{{ $cert['name'] }}</strong>
                @if(!empty($cert['institution'])) <div style="font-size: 8pt; color: #555;">{{ $cert['institution'] }}</div> @endif
            </div>
            @endforeach
        </div>
        @endif

        @if(!empty($cvInformation['languages']))
        <div class="side-section">
            <div class="side-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
            @foreach($cvInformation['languages'] as $lang)
            <div style="margin-bottom: 1.5mm; font-size: 8.5pt;">
                <strong>{{ $lang['name'] }}</strong>: {{ $lang['level'] }}
            </div>
            @endforeach
        </div>
        @endif
    </div>

    <div class="main">
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div class="job-title">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>

        @if(!empty($cvInformation['summaries']))
        <div class="section-title">{{ $currentLocale === 'fr' ? 'À propos' : 'Profile' }}</div>
        <div class="rich-text content-text" style="margin-bottom: 10mm;">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
        @endif

        <div class="section-title">{{ $currentLocale === 'fr' ? 'Expériences' : 'Experience' }}</div>
        <div class="timeline">
            @foreach($prof_experiences as $category => $experiences)
                @foreach($experiences as $exp)
                <div class="time-box">
                    <div class="time-dot"></div>
                    <div class="time-range">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : 'Present' }}</div>
                    <div class="time-role">{{ $exp['name'] }}</div>
                    <div class="time-place">{{ $exp['InstitutionName'] }}</div>
                    <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                </div>
                @endforeach
            @endforeach
        </div>
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
