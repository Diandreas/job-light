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
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 10pt; line-height: 1.4; color: #111; background: #fff; }

        .container { width: 100%; }

        /* HEADER */
        .header { text-align: center; border-bottom: 1px double #ddd; padding-bottom: 5mm; margin-bottom: 8mm; }
        .name { font-size: 24pt; font-weight: normal; text-transform: uppercase; letter-spacing: 2px; color: {{ $primaryColor }}; margin-bottom: 2mm; }
        .role { font-size: 11pt; font-style: italic; color: #555; margin-bottom: 3mm; font-family: 'Verdana', sans-serif; }
        
        .contact-row { font-size: 9pt; color: #444; font-family: 'Verdana', sans-serif; display: flex; flex-wrap: wrap; justify-content: center; gap: 1mm 4mm; }
        .contact-item { display: inline-flex; align-items: center; }
        .contact-item svg { width: 3mm; height: 3mm; margin-right: 1.5mm; fill: #666; }
        .contact-item a { color: inherit; text-decoration: none; border-bottom: 1px dotted #ccc; }

        /* FLOAT LAYOUT - Right Sidebar */
        .sidebar {
            float: right;
            width: 30%;
            padding-left: 5mm;
            border-left: 1px solid #eee;
            margin-left: 5mm;
            min-height: 220mm; /* Page 1 Constraint */
        }

        .main {
            width: auto; 
            /* Flows around sidebar */
        }

        /* SECTIONS */
        .section-title { 
            font-family: 'Verdana', sans-serif; 
            font-size: 9.5pt; 
            font-weight: 700; 
            text-transform: uppercase; 
            color: {{ $primaryColor }}; 
            border-bottom: 1px solid {{ $primaryColor }}; 
            padding-bottom: 1mm; 
            margin-bottom: 4mm; 
            margin-top: 6mm;
            letter-spacing: 1px;
            border-bottom: 1px dotted {{ $primaryColor }}; /* Lighter separator to avoid visual heaviness */
        }

        /* MAIN ITEMS */
        .exp-item { margin-bottom: 5mm; page-break-inside: avoid; }
        .exp-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
        .exp-role { font-weight: 700; font-size: 10.5pt; color: #222; }
        .exp-date { font-family: 'Verdana', sans-serif; font-size: 8.5pt; color: #666; font-style: italic; }
        .exp-inst { font-style: italic; font-size: 10pt; color: #444; margin-bottom: 1.5mm; display: block; }
        
        .rich-text { text-align: justify; font-size: 10pt; color: #333; }
        .rich-text ul { list-style: circle; padding-left: 4.5mm; margin-top: 1mm; }
        .rich-text li { margin-bottom: 0.8mm; pl: 0; }

        .cat-head { font-family: 'Verdana', sans-serif; font-size: 8.5pt; font-weight: 700; color: #777; text-transform: uppercase; margin: 4mm 0 2mm 0; border-bottom: 1px dotted #ddd; display: inline-block; }

        /* SIDEBAR ITEMS */
        .side-item { margin-bottom: 4mm; }
        .side-label { font-weight: 700; font-size: 10pt; display: block; margin-bottom: 0.5mm; color: #222; }
        .side-sub { font-family: 'Verdana', sans-serif; font-size: 8.5pt; color: #555; font-style: italic; }

        .skill-list { list-style: none; padding: 0; }
        .skill-list li { margin-bottom: 1.5mm; font-size: 9.5pt; display: flex; justify-content: space-between; border-bottom: 1px dotted #f0f0f0; padding-bottom: 0.5mm; }

        svg { flex-shrink: 0; }
        .clearfix::after { content: ""; display: table; clear: both; }
    </style>
</head>
<body>

    <div class="header">
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div class="role">{{ $currentLocale === 'en' ? ($cvInformation['professions'][0]['name_en'] ?? $cvInformation['professions'][0]['name']) : $cvInformation['professions'][0]['name'] }}</div>
        <div class="contact-row">
            @if($cvInformation['personalInformation']['address'])
            <span class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</span>
            @endif
            @if($cvInformation['personalInformation']['phone'])
            <span style="color: #ccc;">|</span>
            <span class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</span>
            @endif
            @if($cvInformation['personalInformation']['email'])
            <span style="color: #ccc;">|</span>
            <span class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</span>
            @endif
        </div>
        <div class="contact-row" style="margin-top: 1.5mm;">
            @if(!empty($cvInformation['personalInformation']['linkedin']))
            <div class="contact-item">
                <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" target="_blank">{{ $cvInformation['personalInformation']['linkedin'] }}</a>
            </div>
            @endif
            @if(!empty($cvInformation['personalInformation']['github']))
            <div class="contact-item" style="margin-left: 3mm;">
                <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <a href="{{ $cvInformation['personalInformation']['github'] }}" target="_blank">{{ $cvInformation['personalInformation']['github'] }}</a>
            </div>
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

    <div class="container">
        <!-- Right Sidebar -->
        <div class="sidebar">
            <div class="section-title">{{ __('cv.skills') }}</div>
            <ul class="skill-list">
                @foreach($cvInformation['competences'] as $comp)
                <li>
                    <span>{{ $currentLocale === 'en' ? ($comp['name_en'] ?? $comp['name']) : $comp['name'] }}</span>
                </li>
                @endforeach
            </ul>

            @if(!empty($educations))
            <div class="section-title" style="margin-top: 6mm;">{{ __('cv.education') }}</div>
            @foreach($educations as $edu)
            <div class="side-item">
                <span class="side-label">{{ $edu['name'] }}</span>
                <span class="side-sub">
                    {{ $edu['InstitutionName'] }}<br>
                    {{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}
                </span>
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['certifications']))
            <div class="section-title" style="margin-top: 6mm;">Certifications</div>
            @foreach($cvInformation['certifications'] as $cert)
            <div class="side-item">
                <span class="side-label">{{ $cert['name'] }}</span>
                <span class="side-sub">{{ $cert['institution'] }}</span>
            </div>
            @endforeach
            @endif

            @if(!empty($cvInformation['languages']))
            <div class="section-title" style="margin-top: 6mm;">{{ __('cv.languages') }}</div>
            <ul class="skill-list">
                @foreach($cvInformation['languages'] as $lang)
                <li>
                    <span>{{ $currentLocale === 'en' ? ($lang['name_en'] ?? $lang['name']) : $lang['name'] }}</span>
                    <span style="color: #666; font-size: 8.5pt;">{{ trans()->has("cv.levels." . $lang['level']) ? __("cv.levels." . $lang['level']) : $lang['level'] }}</span>
                </li>
                @endforeach
            </ul>
            @endif
            
            @if(!empty($cvInformation['hobbies']))
            <div class="section-title" style="margin-top: 6mm;">{{ __('cv.hobbies') }}</div>
            <div class="rich-text" style="font-size: 9pt;">
                 {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'en' ? ($h['name_en'] ?? $h['name']) : $h['name'])->join(', ') }}
            </div>
            @endif
        </div>

        <!-- Main Content -->
        <div class="main">
            @if(!empty($cvInformation['summaries']))
            <div class="section-title">{{ __('cv.profile') }}</div>
            <div class="rich-text" style="margin-bottom: 6mm; border-left: 2px solid #eee; padding-left: 3mm;">
                {!! $cvInformation['summaries'][0]['description'] !!}
            </div>
            @endif

            <div class="section-title">{{ __('cv.experience') }}</div>
            
            @foreach($prof_experiences as $category => $experiences)
                @php
                @php
                    $translatedCategory = $category;
                    if ($isEnglish) {
                        $normCat = strtolower($category);
                        if (str_contains($normCat, 'professionnel') || str_contains($normCat, 'work')) $translatedCategory = __('cv.experience');
                        elseif (str_contains($normCat, 'recherche')) $translatedCategory = __('cv.research');
                        elseif (str_contains($normCat, 'enseign') || str_contains($normCat, 'teach')) $translatedCategory = __('cv.academic');
                        else $translatedCategory = $category;
                    }
                @endphp
                <div class="cat-head">{{ $translatedCategory }}</div>
                @foreach($experiences as $exp)
                <div class="exp-item">
                    <div class="exp-head">
                        <span class="exp-role">{{ $exp['name'] }}</span>
                        <span class="exp-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</span>
                    </div>
                    <span class="exp-inst">{{ $exp['InstitutionName'] }}</span>
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
