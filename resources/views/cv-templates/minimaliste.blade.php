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

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 10pt; line-height: 1.35; color: {{ $textMain }}; background: #fff; }

        .cv-page { width: 100%; margin: 0 auto; }

        /* HEADER - Matches Image */
        .header { text-align: center; margin-bottom: 8mm; }
        .name { font-size: 16pt; font-weight: bold; margin-bottom: 2mm; color: #000; }
        .contact-line { font-size: 9pt; color: #000; display: flex; justify-content: center; gap: 3mm; flex-wrap: wrap; }
        .contact-item { display: inline-flex; align-items: center; white-space: nowrap; }
        .contact-item:not(:last-child)::after { content: '•'; margin-left: 3mm; color: #999; }
        .contact-item svg { width: 3mm; height: 3mm; margin-right: 1.5mm; fill: #666; }
        .contact-item a { color: inherit; text-decoration: none; }

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
            @if($cvInformation['personalInformation']['address']) 
            <span class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</span> 
            @endif
            @if($cvInformation['personalInformation']['phone']) 
            <span class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</span> 
            @endif
            @if($cvInformation['personalInformation']['email']) 
            <span class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</span> 
            @endif
            @if(!empty($cvInformation['personalInformation']['linkedin']))
            <span class="contact-item">
                <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" target="_blank">{{ $cvInformation['personalInformation']['linkedin'] }}</a>
            </span>
            @endif
            @if(!empty($cvInformation['personalInformation']['github']))
            <span class="contact-item">
                <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <a href="{{ $cvInformation['personalInformation']['github'] }}" target="_blank">{{ $cvInformation['personalInformation']['github'] }}</a>
            </span>
            @endif
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
        <span class="sec-title">{{ __('cv.profile') }}</span>
        <div class="rich-text content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    </div>
    @endif

    <div class="section">
        <span class="sec-title">{{ __('cv.experience') }}</span>
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
        <span class="sec-title">{{ __('cv.education') }}</span>
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
        <span class="sec-title">{{ __('cv.hobbies') }}</span>
        <div class="rich-text">
            <ul>
                @if(!empty($cvInformation['languages']))
                <li><span class="other-label">{{ __('cv.languages') }}:</span> 
                    {{ collect($cvInformation['languages'])->map(fn($l) => ($currentLocale === 'en' ? ($l['name_en'] ?? $l['name']) : $l['name']) . ' (' . (trans()->has('cv.levels.'.$l['level']) ? trans('cv.levels.'.$l['level']) : $l['level']) . ')')->join(', ') }}
                </li>
                @endif

                @if(!empty($cvInformation['competences']))
                <li><span class="other-label">{{ __('cv.skills') }}:</span> 
                    {{ collect($cvInformation['competences'])->map(fn($c) => ($currentLocale === 'en' ? ($c['name_en'] ?? $c['name']) : $c['name']) . ($c['level'] ? ' (' . $c['level'] . ')' : ''))->join(', ') }}
                </li>
                @endif

                @if(!empty($cvInformation['certifications']))
                <li><span class="other-label">{{ __('cv.certifications') }}:</span> 
                    {{ collect($cvInformation['certifications'])->map(fn($c) => $c['name'])->join(', ') }}
                </li>
                @endif

                @if(!empty($cvInformation['hobbies']))
                <li><span class="other-label">{{ __('cv.hobbies') }}:</span> 
                    {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'en' ? ($h['name_en'] ?? $h['name']) : $h['name'])->join(', ') }}
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
