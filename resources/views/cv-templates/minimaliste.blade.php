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
            $primaryColor = $cvInformation['primary_color'] ?? '#000000';
            $textMain = '#333';
            $textMuted = '#666';
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 15mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.35; color: {{ $textMain }}; background: #fff; }

        .cv-page { width: 180mm; margin: 0 auto; }

        /* HEADER - Matches Image */
        .header { text-align: center; margin-bottom: 8mm; }
        .name { font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #000; }
        .contact-line { font-size: 9pt; color: #000; display: flex; justify-content: center; gap: 3mm; flex-wrap: wrap; }
        .contact-line span:not(:last-child)::after { content: ' •'; margin-left: 3mm; color: #999; }

        /* SECTIONS - Matches Image */
        .section { margin-bottom: 6mm; }
        .sec-title { font-size: 10.5pt; font-weight: bold; text-transform: uppercase; border-bottom: 1.5px solid #333; padding-bottom: 0.5mm; margin-bottom: 4mm; display: block; color: #000; }

        /* GRID ROW (Date Gutter) - Matches Image */
        .grid-entry { display: table; width: 100%; margin-bottom: 5mm; table-layout: fixed; page-break-inside: avoid; }
        .grid-date { display: table-cell; width: 35mm; vertical-align: top; font-size: 9pt; color: #000; font-weight: normal; }
        .grid-content { display: table-cell; vertical-align: top; padding-left: 2mm; }

        .inst-name { font-weight: bold; text-transform: uppercase; display: inline-block; }
        .inst-location { float: right; font-weight: bold; }
        
        .role-title { font-style: italic; font-weight: bold; margin-top: 0.5mm; display: block; font-size: 10pt; }
        
        /* descriptions / bullets - Matches Image */
        .rich-text { margin-top: 1mm; text-align: justify; }
        .rich-text ul { list-style: disc; padding-left: 5mm; margin-top: 1mm; }
        .rich-text li { margin-bottom: 0.8mm; line-height: 1.4; }

        /* OTHER SECTION */
        .other-item { margin-bottom: 1mm; display: block; }
        .other-label { font-weight: bold; }

        .cat-luxury { font-size: 9pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: {{ $primaryColor }}; margin-bottom: 3mm; margin-top: 2mm; display: block; border-bottom: 0.5px solid #eee; }

    </style>
</head>
<body>
<div class="cv-page">
    <div class="header">
        <h1 class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</h1>
        <div class="contact-line">
            @if($cvInformation['personalInformation']['address']) <span>{{ $cvInformation['personalInformation']['address'] }}</span> @endif
            @if($cvInformation['personalInformation']['phone']) <span>{{ $cvInformation['personalInformation']['phone'] }}</span> @endif
            @if($cvInformation['personalInformation']['email']) <span>{{ $cvInformation['personalInformation']['email'] }}</span> @endif
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

    @if(!empty($cvInformation['summaries']))
    <div class="section">
        <span class="sec-title">{{ $currentLocale === 'fr' ? 'PROFIL' : 'PROFILE' }}</span>
        <div class="rich-text content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    </div>
    @endif

    <div class="section">
        <span class="sec-title">{{ $currentLocale === 'fr' ? 'EXPÉRIENCE' : 'EXPERIENCE' }}</span>
        @foreach($prof_experiences as $category => $experiences)
            @php
                $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
                $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
                if($isEnglish && $translatedCategory === $category) {
                    $normCat = strtolower($category);
                    if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'work')) $translatedCategory = 'Experience';
                    elseif(str_contains($normCat, 'recherche')) $translatedCategory = 'Research';
                }
                
                // Hide label if it's generic "Experience" to match the photo 
                $showLabel = count($prof_experiences) > 1 && !in_array(strtolower($translatedCategory), ['experience', 'expérience', 'work experience', 'expérience professionnelle']);
            @endphp
            
            @if($showLabel)
                <div class="cat-luxury">{{ $translatedCategory }}</div>
            @endif

            @foreach($experiences as $exp)
            <div class="grid-entry">
                <div class="grid-date">
                    {{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} — {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('YYYY') : ($isEnglish ? 'Present' : 'Présent') }}
                </div>
                <div class="grid-content">
                    <div style="width: 100%;">
                        <span class="inst-name">{{ $exp['InstitutionName'] }}</span>
                        <!-- Location can be added here if available in your structure, usually same field for simplicity -->
                    </div>
                    <span class="role-title">{{ $exp['name'] }}</span>
                    @if(!empty($exp['description']))
                    <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                    @endif
                </div>
            </div>
            @endforeach
        @endforeach
    </div>

    @if(!empty($educations))
    <div class="section">
        <span class="sec-title">{{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}</span>
        @foreach($educations as $edu)
        <div class="grid-entry">
            <div class="grid-date">
                {{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }} — {{ $edu['date_end'] ? \Carbon\Carbon::parse($edu['date_end'])->format('Y') : ($isEnglish ? 'Present' : 'Présent') }}
            </div>
            <div class="grid-content">
                <span class="inst-name">{{ $edu['InstitutionName'] }}</span>
                <span class="role-title">{{ $edu['name'] }}</span>
                @if(!empty($edu['description']))
                <div class="rich-text content-text">{!! $edu['description'] !!}</div>
                @endif
            </div>
        </div>
        @endforeach
    </div>
    @endif

    <div class="section">
        <span class="sec-title">{{ $currentLocale === 'fr' ? 'AUTRES' : 'OTHER' }}</span>
        <div class="rich-text">
            <ul>
                @if(!empty($cvInformation['languages']))
                <li><span class="other-label">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}:</span> 
                    {{ collect($cvInformation['languages'])->map(fn($l) => $l['name'] . ' (' . $l['level'] . ')')->join(', ') }}
                </li>
                @endif

                @if(!empty($cvInformation['competences']))
                <li><span class="other-label">{{ $currentLocale === 'fr' ? 'Compétences Techniques' : 'Technical Skills' }}:</span> 
                    {{ collect($cvInformation['competences'])->map(fn($c) => ($currentLocale === 'fr' ? $c['name'] : $c['name_en']) . ($c['level'] ? ' (' . $c['level'] . ')' : ''))->join(', ') }}
                </li>
                @endif

                @if(!empty($cvInformation['certifications']))
                <li><span class="other-label">Certifications:</span> 
                    {{ collect($cvInformation['certifications'])->map(fn($c) => $c['name'])->join(', ') }}
                </li>
                @endif

                @if(!empty($cvInformation['hobbies']))
                <li><span class="other-label">{{ $currentLocale === 'fr' ? 'Loisirs' : 'Interests' }}:</span> 
                    {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'fr' ? $h['name'] : $h['name_en'])->join(', ') }}
                </li>
                @endif
            </ul>
        </div>
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
