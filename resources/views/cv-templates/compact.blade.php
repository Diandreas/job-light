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

        .header-full { border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 3mm; margin-bottom: 4mm; display: flex; justify-content: space-between; }
        .name { font-size: 16pt; font-weight: bold; color: {{ $primaryColor }}; }
        .role { font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; }
        .contact { font-size: 8pt; text-align: right; }

        /* Float Layout to allow wrapping */
        .sidebar-col { 
            float: right; 
            width: 32%; 
            margin-left: 4mm; 
            padding-left: 3mm; 
            border-left: 1px solid #eee;
            margin-bottom: 5mm; 
            min-height: 230mm; /* Enforce 2-column layout on Page 1 */
            /* page-break-inside: avoid; Avoid this on long sidebars as it forces page break */
        }
        
        .main-col { 
            /* No specific width, flows around sidebar */
            padding-right: 2mm; 
        }

        .col-section-title { font-size: 10pt; font-weight: bold; color: {{ $primaryColor }}; border-bottom: 1px solid #ccc; margin-bottom: 2mm; text-transform: uppercase; }

        .entry { margin-bottom: 3mm; page-break-inside: avoid; }
        .entry-title { font-weight: bold; font-size: 9.5pt; }
        .entry-meta { font-size: 8pt; color: #666; margin-bottom: 1mm; }
        
        .content-text { font-size: 8.5pt; text-align: justify; }
        .content-text ul { list-style: disc; padding-left: 4mm; margin-top: 1mm; margin-left: 1mm; }
        .content-text li { margin-bottom: 0.5mm; }
        
        .social-links { margin-top: 1mm; }
        .social-link { display: inline-flex; align-items: center; margin-left: 2mm; color: #555; text-decoration: none; }
        .social-link svg { width: 10px; height: 10px; margin-right: 1px; fill: currentColor; }
        
        /* Utility to clear floats at the end */
        .clearfix::after { content: ""; display: table; clear: both; }
    </style>
</head>
<body>
    @php
        $educations = [];
        $prof_experiences = [];
        $academic_keywords = ['formation', 'académique', 'education', 'étudiant', 'diplôme', 'scolarité'];
        
        if(isset($experiencesByCategory)) {
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
        }
        
        $hasSidebar = !empty($cvInformation['competences']) || !empty($educations) || !empty($cvInformation['certifications']) || !empty($cvInformation['languages']);
    @endphp

    <div class="header-full">
        <div>
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="role">{{ $currentLocale === 'en' ? ($cvInformation['professions'][0]['name_en'] ?? $cvInformation['professions'][0]['name']) : $cvInformation['professions'][0]['name'] }}</div>
        </div>
        <div class="contact">
            {{ $cvInformation['personalInformation']['email'] }}<br>
            {{ $cvInformation['personalInformation']['phone'] }}<br>
            {{ $cvInformation['personalInformation']['address'] }}
            
            <div class="social-links">
                @if(!empty($cvInformation['personalInformation']['linkedin']))
                <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" class="social-link" target="_blank">
                    <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    {{ $cvInformation['personalInformation']['linkedin'] }}
                </a>
                @endif
                @if(!empty($cvInformation['personalInformation']['github']))
                <a href="{{ $cvInformation['personalInformation']['github'] }}" class="social-link" target="_blank">
                    <svg viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    {{ $cvInformation['personalInformation']['github'] }}
                </a>
                @endif
            </div>
        </div>
    </div>

    <!-- Container that allows floating -->
    <div>
        @if($hasSidebar)
        <div class="sidebar-col">
             @if(!empty($cvInformation['competences']))
            <div class="col-section-title">{{ __('cv.skills') }}</div>
             <div class="content-text" style="margin-bottom: 4mm;">
                <ul style="padding-left: 4mm;">
                @foreach($cvInformation['competences'] as $comp)
                    <li>{{ $currentLocale === 'en' ? ($comp['name_en'] ?? $comp['name']) : $comp['name'] }}</li>
                @endforeach
                </ul>
            </div>
            @endif

            @if(!empty($educations))
            <div class="col-section-title">{{ __('cv.education') }}</div>
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
            <div class="col-section-title">{{ $currentLocale === 'fr' ? 'CERTIFICATIONS' : 'CERTIFICATIONS' }}</div>
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
            <div class="col-section-title">{{ __('cv.languages') }}</div>
            <div class="content-text" style="margin-bottom: 4mm;">
                @foreach($cvInformation['languages'] as $lang)
                <div><strong>{{ $currentLocale === 'en' ? ($lang['name_en'] ?? $lang['name']) : $lang['name'] }}</strong>: {{ trans()->has("cv.levels." . $lang['level']) ? __("cv.levels." . $lang['level']) : $lang['level'] }}</div>
                @endforeach
            </div>
            @endif
        </div>
        @endif

        <div class="main-col">
             @if(!empty($cvInformation['summaries']))
            <div class="col-section-title">{{ __('cv.profile') }}</div>
            <div class="content-text" style="margin-bottom: 4mm;">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
            @endif

            <div class="col-section-title">{{ __('cv.experience') }}</div>
            @if(!empty($prof_experiences))
                @foreach($prof_experiences as $category => $experiences)
                    @foreach($experiences as $exp)
                    <div class="entry">
                        <div class="entry-title">{{ $exp['src_name'] ?? $exp['name'] }}</div>
                        <div class="entry-meta">
                            {{ $exp['InstitutionName'] }} | 
                            {{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('Y') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('Y') : ($currentLocale === 'fr' ? 'Présent' : 'Present') }} 
                            @if(!empty($exp['category_name']))
                                @php
                                    $catName = strtolower($exp['category_name']);
                                    $transCat = $exp['category_name'];
                                    if(str_contains($catName, 'recherche')) $transCat = __('cv.research');
                                    elseif(str_contains($catName, 'professionnel')) $transCat = __('cv.professional');
                                    elseif(str_contains($catName, 'académique') || str_contains($catName, 'academic')) $transCat = __('cv.academic');
                                @endphp
                                <span style="font-weight: 600; color: {{ $primaryColor }}; margin-left: 2mm;">• {{ $transCat }}</span>
                            @endif
                        </div>
                        <div class="content-text">{!! $exp['description'] !!}</div>
                    </div>
                    @endforeach
                @endforeach
            @endif
        </div>
        
        <div class="clearfix"></div>
    </div>
</body>
<x-cv-editable-scripts />
</html>
@endsection