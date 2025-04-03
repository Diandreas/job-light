@extends('layouts.cv')

@section('content')
    <!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page {
            margin: 10mm;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            line-height: 1.3;
            font-size: 11pt;
            color: #2c3e50;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            vertical-align: top;
            padding: 0;
        }

        .cv-container {
            width: 190mm;
            padding: 0;
        }

        /* Header Section */
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 5mm;
            page-break-after: avoid;
        }

        .header-table {
            /* width: 100%; */
        }

        .profile-photo {
            width: 28mm;
            height: 28mm;
            overflow: hidden;
            border-radius: 50%;
            border: 0.5mm solid #ffffff;
            margin-bottom: 2mm;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-left {
            padding-right: 3mm;
        }

        .header-right {
            text-align: right;
            padding-left: 3mm;
        }

        .name {
            font-size: 18pt;
            font-weight: bold;
            letter-spacing: 0.5mm;
            margin-bottom: 1mm;
        }

        .profession {
            font-size: 12pt;
            color: #ecf0f1;
            margin-bottom: 2mm;
        }

        .contact-info {
            font-size: 10pt;
            color: #bdc3c7;
        }

        .contact-item {
            margin-bottom: 0.8mm;
        }

        /* Language Section */
        .language-section {
            margin-top: 3mm;
            padding: 2.5mm;
            background-color: #ecf0f1;
            border-radius: 1mm;
        }
        
        .language-title {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 1.5mm;
            text-transform: uppercase;
            letter-spacing: 0.2mm;
        }
        
        .language-items {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
        }
        
        .language-item {
            background-color: #ffffff;
            border-radius: 0.5mm;
            padding: 1mm 2mm;
            font-size: 10pt;
            color: #2c3e50;
            box-shadow: 0 0.2mm 0.5mm rgba(0,0,0,0.1);
        }
        
        .language-level {
            color: #7f8c8d;
            margin-left: 1mm;
            font-style: italic;
        }

        /* Main Content */
        .main-content {
            padding: 5mm;
            page-break-before: avoid;
        }

        .two-columns {
            width: 100%;
            page-break-inside: auto;
        }

        .left-column {
            width: 68%;
            padding-right: 4mm;
            border-right: 0.2mm solid #ecf0f1;
            page-break-inside: auto;
        }

        .right-column {
            width: 32%;
            padding-left: 4mm;
            page-break-inside: auto;
        }

        .section {
            margin-bottom: 3mm;
            page-break-inside: auto;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 2mm;
            padding-bottom: 0.5mm;
            border-bottom: 0.3mm solid #3498db;
            page-break-after: avoid;
        }

        .experience-block {
            margin-bottom: 2.5mm;
            page-break-inside: auto;
        }

        .experience-header {
            margin-bottom: 0.8mm;
            page-break-after: avoid;
        }

        .experience-title {
            font-weight: bold;
            color: #2c3e50;
            font-size: 11pt;
        }

        .company {
            font-style: italic;
            color: #7f8c8d;
            font-size: 10.5pt;
        }

        .date {
            float: right;
            color: #7f8c8d;
            font-size: 10pt;
        }

        .description {
            font-size: 10.5pt;
            line-height: 1.3;
            color: #34495e;
            text-align: justify;
        }

        .skill-category {
            margin-bottom: 2mm;
        }

        .skill-category-title {
            font-weight: bold;
            color: #3498db;
            font-size: 10.5pt;
            margin-bottom: 0.8mm;
        }

        .skill-list {
            margin-bottom: 1.5mm;
            padding-left: 2mm;
        }

        .skill-item {
            font-size: 10pt;
            color: #34495e;
            margin-bottom: 0.8mm;
            position: relative;
            padding-left: 2mm;
        }

        .skill-item:before {
            content: "•";
            position: absolute;
            left: -2mm;
            color: #3498db;
        }

        .summary {
            padding: 2.5mm;
            background-color: #f8f9fa;
            border-left: 0.3mm solid #3498db;
            margin-bottom: 3mm;
            font-size: 11pt;
            line-height: 1.3;
            color: #34495e;
            text-align: justify;
            page-break-after: avoid;
        }
        
        /* Fix pour éviter les sauts de page indésirables */
        .summary-and-columns {
            page-break-inside: auto;
            display: block;
        }
        
        @media print {
            @page {
                margin: 10mm;
                size: A4;
            }
            
            body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }
            
            .cv-container {
                width: 100%;
                box-shadow: none;
            }
            
            .header {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                page-break-after: avoid !important;
            }
            
            .main-content {
                page-break-before: avoid !important;
            }
            
            .section-title {
                page-break-after: avoid !important;
            }
            
            .experience-header {
                page-break-after: avoid !important;
            }
            
            /* Permettre des sauts de page au sein des sections */
            .left-column, 
            .right-column, 
            .section, 
            .experience-block {
                page-break-inside: auto !important;
            }
            
            /* Éviter les sauts de page juste après les titres */
            h1, h2, h3, 
            .section-title + .experience-block, 
            .experience-header + .description {
                page-break-after: avoid !important;
            }
            
            /* Empêcher les éléments orphelins */
            p, .description {
                orphans: 3;
                widows: 3;
            }
            
            /* Contrôle supplémentaire pour les tables */
            table.two-columns {
                page-break-inside: auto !important;
            }
            
            tr, td {
                page-break-inside: auto !important;
            }
            
            /* Forcer la suite du contenu après le header */
            .header + .main-content {
                page-break-before: avoid !important;
            }
        }
    </style>
</head>
<body>
<div class="cv-container">
    <div class="header">
        <table class="header-table">
            <tr>
                <td style="width: 32mm; padding-right: 3mm;">
                    @if($cvInformation['personalInformation']['photo'])
                        <div class="profile-photo">
                            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                                 alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                        </div>
                    @endif
                </td>
                <td class="header-left">
                    <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                    <div class="profession">
                        {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                    </div>
                </td>
                <td class="header-right">
                    <div class="contact-info">
                        @if($cvInformation['personalInformation']['email'])
                            <div class="contact-item">✉ {{ $cvInformation['personalInformation']['email'] }}</div>
                        @endif
                        @if($cvInformation['personalInformation']['phone'])
                            <div class="contact-item">☎ {{ $cvInformation['personalInformation']['phone'] }}</div>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <div class="contact-item">⌂ {{ $cvInformation['personalInformation']['address'] }}</div>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <div class="contact-item">∞ {{ $cvInformation['personalInformation']['linkedin'] }}</div>
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <div class="main-content">
        {{-- Summary Section --}}
        @if(!empty($cvInformation['summaries']))
            <div class="summary">
                {{ $cvInformation['summaries'][0]['description'] ?? '' }}
            </div>
        @endif

        <table class="two-columns">
            <tr>
                <td class="left-column">
                    {{-- Experience Sections --}}
                    @foreach($experiencesByCategory as $category => $experiences)
                        <div class="section">
                            <div class="section-title">
                                @if($currentLocale === 'fr')
                                    {{ $category }}
                                @else
                                    {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                                @endif
                            </div>
                            @foreach($experiences as $experience)
                                <div class="experience-block">
                                    <div class="experience-header">
                                        <span class="date">
                                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                            @if($experience['date_end'])
                                                {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                            @else
                                                {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                            @endif
                                        </span>
                                        <div class="experience-title">{{ $experience['name'] }}</div>
                                        <div class="company">{{ $experience['InstitutionName'] }}</div>
                                    </div>
                                    <div class="description">
                                        {{ $experience['description'] }}
                                        @if($experience['output'])
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endforeach
                </td>
                <td class="right-column">
                    {{-- Skills Section --}}
                    @if(!empty($cvInformation['competences']))
                        <div class="section">
                            <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                            @foreach(array_chunk($cvInformation['competences'], 3) as $skillGroup)
                                <div class="skill-list">
                                    @foreach($skillGroup as $competence)
                                        <div class="skill-item">
                                            {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                        </div>
                                    @endforeach
                                </div>
                            @endforeach
                        </div>
                    @endif

                    {{-- Hobbies Section --}}
                    @if(!empty($cvInformation['hobbies']))
                        <div class="section">
                            <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                            <div class="skill-list">
                                @foreach($cvInformation['hobbies'] as $hobby)
                                    <div class="skill-item">
                                        {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif
                    
                    @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                        <div class="language-section">
                            <div class="language-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                            <div class="language-items">
                                @foreach($cvInformation['languages'] ?? [] as $language)
                                    <div class="language-item">
                                        {{ $language['name'] ?? '' }}
                                        @if(isset($language['level']))
                                            <span class="language-level">- {{ $language['level'] ?? '' }}</span>
                                        @endif
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endif
                </td>
            </tr>
        </table>
    </div>
</div>
</body>
</html>
@endsection