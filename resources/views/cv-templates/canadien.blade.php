@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page { margin: 15mm; size: Letter; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
            font-family: 'Arial', 'Helvetica', sans-serif; 
            font-size: 10pt; 
            line-height: 1.35; 
            color: #000; 
            background: #fff;
        }

        /* ATS Friendly Layout */
        .header { 
            text-align: center; 
            border-bottom: 1px solid #000; 
            padding-bottom: 8px; 
            margin-bottom: 12px; 
        }
        
        .name { 
            font-size: 20pt; 
            font-weight: bold; 
            text-transform: uppercase; 
            margin-bottom: 4px;
            letter-spacing: 0.5px;
        }
        
        .contact-info { 
            font-size: 9.5pt; 
            margin-bottom: 2px;
        }

        .section-title { 
            font-size: 11pt; 
            font-weight: bold; 
            text-transform: uppercase; 
            border-bottom: 1px solid #000; 
            margin-top: 15px; 
            margin-bottom: 8px; 
            padding-bottom: 2px;
        }
        
        /* Category Sub-Header */
        .cat-header {
            font-size: 10pt;
            font-weight: bold;
            color: #444;
            text-transform: uppercase;
            margin-top: 10px;
            margin-bottom: 5px;
            border-bottom: 1px dashed #ccc;
            padding-bottom: 2px;
        }

        .entry { margin-bottom: 10px; page-break-inside: avoid; }
        
        .entry-header { 
            margin-bottom: 2px; 
            position: relative;
        }
        
        .entry-title { 
            font-weight: bold; 
            font-size: 10.5pt;
            display: inline-block;
        }
        
        .entry-subtitle { 
            font-weight: bold;
            display: inline-block;
        }
        
        .entry-date { 
            float: right; 
            font-weight: bold;
            font-size: 10pt;
        }
        
        /* Description text */
        .content-text {
            text-align: justify;
            font-size: 9.5pt;
        }

        .content-text ul { 
            margin-top: 2px; 
            margin-bottom: 2px; 
            padding-left: 18px; 
            list-style-type: disc;
        }
        
        .content-text li { 
            margin-bottom: 1px; 
            padding-left: 2px;
        }
        
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
        
        /* Skill grid */
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        
        .skills-list li {
            margin-right: 12px;
            margin-bottom: 3px;
        }

        /* 2 Column Layout for Bottom Section */
        .bottom-grid {
            display: table; /* Using table display for robust PDF rendering */
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-top: 15px;
        }
        
        .col-left {
            display: table-cell;
            width: 55%; /* More space for Education/Certs usually detailed */
            vertical-align: top;
            padding-right: 15px;
            border-right: 1px solid #eee;
        }
        
        .col-right {
            display: table-cell;
            width: 45%;
            vertical-align: top;
            padding-left: 15px;
        }
        
        /* Reset margins for columns */
        .col-left .section-title, .col-right .section-title {
            margin-top: 0;
        }

        a { text-decoration: none; color: #000; }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div class="contact-info">
            {{ $cvInformation['personalInformation']['address'] }}
            @if($cvInformation['personalInformation']['address'] && $cvInformation['personalInformation']['phone']) • @endif
            {{ $cvInformation['personalInformation']['phone'] }}
            @if($cvInformation['personalInformation']['phone'] && $cvInformation['personalInformation']['email']) • @endif
            {{ $cvInformation['personalInformation']['email'] }}
            @if($cvInformation['personalInformation']['linkedin']) • {{ $cvInformation['personalInformation']['linkedin'] }} @endif
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="section-title">{{ $currentLocale === 'fr' ? 'Sommaire Professionnel' : 'Professional Summary' }}</div>
    <div class="content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section-title">{{ $currentLocale === 'fr' ? 'Expérience Professionnelle' : 'Work Experience' }}</div>
    @foreach($experiencesByCategory as $category => $experiences)
        @php
            // Traduction simple des catégories si nécessaire (ou afficher tel quel)
            $displayCategory = ucfirst($category);
            // Hide "Experience Professionnelle" sub-header if it's the only one or redundant
            $showCategory = count($experiencesByCategory) > 1;
        @endphp
        
        @if($showCategory)
        <div class="cat-header">{{ $displayCategory }}</div>
        @endif

        @foreach($experiences as $exp)
        <div class="entry">
            <div class="entry-header clearfix">
                <div style="float: left; width: 75%;">
                    <span class="entry-title">{{ $exp['name'] }}</span>
                    @if(!empty($exp['InstitutionName']))
                     — <span class="entry-subtitle">{{ $exp['InstitutionName'] }}</span>
                    @endif
                    @if(!empty($cvInformation['personalInformation']['city']))
                    , {{ $cvInformation['personalInformation']['city'] }}
                    @endif
                </div>
                <div class="entry-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} – {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($currentLocale === 'fr' ? 'Présent' : 'Present') }}</div>
            </div>
            
            <div class="content-text">
                {!! $exp['description'] !!}
            </div>
        </div>
        @endforeach
    @endforeach
    
    <!-- Bottom Grid: Education/Certs Left | Skills right -->
    <div class="bottom-grid">
        <div class="col-left">
            @if(!empty($cvInformation['certifications']))
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Éducation et Certifications' : 'Education & Certifications' }}</div>
            @foreach($cvInformation['certifications'] as $cert)
            <div class="entry" style="margin-bottom: 8px;">
                <div class="clearfix">
                    <span style="font-weight: bold; display: block;">{{ $cert['name'] }}</span>
                    @if(!empty($cert['institution'])) 
                    <span style="display: block; font-size: 9.5pt;">{{ $cert['institution'] }} @if(!empty($cert['date'])) | {{ $cert['date'] }} @endif</span>
                    @endif
                </div>
            </div>
            @endforeach
            @endif
        </div>

        <div class="col-right">
            @if(!empty($cvInformation['competences']) || !empty($cvInformation['languages']))
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
            
            @if(!empty($cvInformation['competences']))
            <div style="margin-bottom: 12px;">
                <div style="font-weight: bold; font-size: 9.5pt; margin-bottom: 4px; text-decoration: underline;">{{ $currentLocale === 'fr' ? 'Techniques' : 'Technical' }}</div>
                <ul class="skills-list" style="display: block;">
                @foreach($cvInformation['competences'] as $comp)
                    <li style="display: inline-block; margin-right: 5px;">• {{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</li>
                @endforeach
                </ul>
            </div>
            @endif

            @if(!empty($cvInformation['languages']))
            <div>
                <div style="font-weight: bold; font-size: 9.5pt; margin-bottom: 4px; text-decoration: underline;">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                <ul class="skills-list" style="display: block;">
                @foreach($cvInformation['languages'] as $lang)
                    <li style="margin-bottom: 2px;">• <strong>{{ $lang['name'] }}</strong>: {{ $lang['level'] }}</li>
                @endforeach
                </ul>
            </div>
            @endif
            @endif
        </div>
    </div>

</body>
<x-cv-editable-scripts />
</html>
@endsection
