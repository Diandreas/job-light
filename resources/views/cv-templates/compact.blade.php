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
            $primaryColor = $cvInformation['primary_color'] ?? '#2c3e50';
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Trebuchet MS', sans-serif; font-size: 9pt; line-height: 1.3; color: #333; }

        .cv-grid { display: grid; grid-template-columns: 65% 1fr; gap: 5mm; }
        .header-full { grid-column: 1 / -1; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 3mm; margin-bottom: 4mm; display: flex; justify-content: space-between; }
        .name { font-size: 16pt; font-weight: bold; color: {{ $primaryColor }}; }
        .role { font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; }
        .contact { font-size: 8pt; text-align: right; }

        .col { vertical-align: top; }
        .section-title { font-size: 10pt; font-weight: bold; color: {{ $primaryColor }}; border-bottom: 1px solid #ccc; margin-bottom: 2mm; text-transform: uppercase; }

        .entry { margin-bottom: 3mm; page-break-inside: avoid; }
        .entry-title { font-weight: bold; font-size: 9.5pt; }
        .entry-meta { font-size: 8pt; color: #666; margin-bottom: 1mm; }
        
        .content-text { font-size: 8.5pt; text-align: justify; }
        .content-text ul { list-style: disc; padding-left: 4mm; margin-top: 1mm; margin-left: 1mm; }
        .content-text li { margin-bottom: 0.5mm; }
    </style>
</head>
<body>
    <div class="header-full">
        <div>
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="role">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
        </div>
        <div class="contact">
            {{ $cvInformation['personalInformation']['email'] }}<br>
            {{ $cvInformation['personalInformation']['phone'] }}<br>
            {{ $cvInformation['personalInformation']['address'] }}
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

    <div class="cv-grid">
        <div class="col" style="grid-column: 1 / 2; padding-right: 3mm;">
             @if(!empty($cvInformation['summaries']))
            <div class="section-title">{{ $currentLocale === 'fr' ? 'PROFIL' : 'PROFILE' }}</div>
            <div class="content-text" style="margin-bottom: 4mm;">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
            @endif

            <div class="section-title">{{ $currentLocale === 'fr' ? 'EXPERIENCE' : 'EXPERIENCE' }}</div>
            @foreach($prof_experiences as $category => $experiences)
                @foreach($experiences as $exp)
                <div class="entry">
                    <div class="entry-title">{{ $exp['name'] }}</div>
                    <div class="entry-meta">
                        {{ $exp['InstitutionName'] }} | 
                        {{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('Y') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('Y') : ($currentLocale === 'fr' ? 'Présent' : 'Present') }} 
                        @if(!empty($exp['category_name']))
                            <span style="font-weight: 600; color: {{ $primaryColor }}; margin-left: 2mm;">• {{ $currentLocale === 'fr' ? $exp['category_name'] : ($exp['category_name_en'] ?? $exp['category_name']) }}</span>
                        @endif
                    </div>
                    <div class="content-text">{!! $exp['description'] !!}</div>
                </div>
                @endforeach
            @endforeach
        </div>

        <div class="col" style="grid-column: 2 / 3; padding-left: 3mm; border-left: 1px solid #eee;">
             @if(!empty($cvInformation['competences']))
            <div class="section-title">{{ $currentLocale === 'fr' ? 'COMPETENCES' : 'SKILLS' }}</div>
             <div class="content-text" style="margin-bottom: 4mm;">
                <ul style="padding-left: 4mm;">
                @foreach($cvInformation['competences'] as $comp)
                    <li>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</li>
                @endforeach
                </ul>
            </div>
            @endif

            @if(!empty($educations))
            <div class="section-title">{{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}</div>
            <div class="content-text" style="margin-bottom: 4mm;">
                @foreach($educations as $edu)
                <div class="entry">
                    <div class="entry-title">{{ $edu['name'] }}</div>
                    <div class="entry-meta">{{ $edu['InstitutionName'] }} | {{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</div>
                    @if(!empty($edu['description']))
                    <div class="content-text" style="font-size: 8pt; color: #666; margin-top: 1mm;">{!! $edu['description'] !!}</div>
                    @endif
                </div>
                @endforeach
            </div>
            @endif
            
            @if(!empty($cvInformation['certifications']))
            <div class="section-title">{{ $currentLocale === 'fr' ? 'CERTIFICATIONS' : 'CERTIFICATIONS' }}</div>
            <div class="content-text" style="margin-bottom: 4mm;">
                @foreach($cvInformation['certifications'] as $cert)
                <div style="margin-bottom: 2mm;">
                    <strong>{{ $cert['name'] }}</strong><br>
                    @if(!empty($cert['institution'])) <span style="color: #666; font-size: 8pt;">{{ $cert['institution'] }}</span> @endif
                </div>
                @endforeach
            </div>
            @endif
            
            @if(!empty($cvInformation['languages']))
            <div class="section-title">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</div>
            <div class="content-text" style="margin-bottom: 4mm;">
                @foreach($cvInformation['languages'] as $lang)
                <div><strong>{{ $lang['name'] }}</strong>: {{ $lang['level'] }}</div>
                @endforeach
            </div>
            @endif
        </div>
    </div>
</body>
<x-cv-editable-scripts />
</html>
@endsection