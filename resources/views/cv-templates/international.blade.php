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
            margin: 5mm;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 9pt;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .cv-container {
            width: 180mm;
            background-color: #FFFFFF;
            padding: 0;
            margin: 0;
        }

        /* Tables Reset */
        table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
        }

        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }

        td {
            vertical-align: top;
            padding: 0;
        }

        /* Header Section */
        .header-table {
            width: 100%;
            margin-bottom: 4mm;
            border-bottom: 0.5mm solid #333333 !important;
            padding-bottom: 4mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-after: avoid !important;
        }

        .header-left-cell {
            width: 70%;
        }

        .header-right-cell {
            width: 30%;
            text-align: right;
        }

        .name {
            font-size: 15pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 1mm;
            text-transform: uppercase;
        }

        .profession {
            font-size: 9.5pt;
            color: #666666;
            margin-bottom: 2mm;
        }

        /* Photo Styling */
        .photo-container {
            width: 30mm;
            height: 30mm;
            overflow: hidden;
            border: 0.2mm solid #cccccc !important;
            float: right;
            border-radius: 2mm;
            padding: 2mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Contact Information */
        .contact-table {
            width: 100%;
        }

        .contact-item {
            margin-bottom: 1mm;
            font-size: 8.5pt;
            color: #333333;
        }

        .contact-label {
            font-weight: bold;
            display: inline-block;
            width: 15mm;
        }
        
        /* Main Layout */
        .main-table {
            width: 90%;
            margin-top: 4mm;
            margin: 2mm;
            page-break-inside: auto;
            page-break-before: avoid !important;
        }

        .left-column-cell {
            width: 28%;
            padding-right: 4mm;
            page-break-inside: auto;
        }

        .right-column-cell {
            width: 68%;
            border-left: 0.2mm solid #cccccc !important;
            padding-left: 4mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: auto;
        }

        /* Section Styling */
        .section {
            margin-bottom: 5mm;
            page-break-inside: auto;
        }

        .section-title {
            font-size: 10pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 2mm;
            text-transform: uppercase;
            border-bottom: 0.2mm solid #cccccc !important;
            padding-bottom: 1mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Summary Section */
        .summary {
            font-size: 8.5pt;
            color: #333333;
            line-height: 1.3;
            margin-bottom: 3mm;
            text-align: justify;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 3mm;
            page-break-inside: auto;
        }

        .experience-left-cell {
            width: 25%;
            padding-right: 2%;
        }

        .experience-right-cell {
            width: 75%;
        }

        .experience-date {
            font-size: 8pt;
            color: #333333;
            font-weight: bold;
        }

        .experience-location {
            font-size: 7.5pt;
            font-style: italic;
            color: #666666;
            margin-top: 1mm;
        }

        .experience-title {
            font-size: 9pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 1mm;
        }

        .experience-company {
            font-size: 8.5pt;
            color: #555555;
            margin-bottom: 1mm;
        }

        .experience-description {
            font-size: 8pt;
            color: #333333;
            line-height: 1.3;
            text-align: justify;
        }

        /* Skills Styling */
        .skill-item {
            margin-bottom: 1.5mm;
        }

        .skill-name {
            font-size: 8.5pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 0.5mm;
        }

        .skill-description {
            font-size: 7.5pt;
            color: #555555;
        }

        /* Language Section */
        .language-table {
            width: 100%;
            border: 0.2mm solid #cccccc !important;
            margin-bottom: 4mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        .language-table td, .language-table th {
            padding: 1mm 1.5mm;
            text-align: left;
            font-size: 8.5pt;
            border-bottom: 0.1mm solid #cccccc !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        .language-table th {
            background-color: #f5f5f5 !important;
            font-weight: bold;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Education Styling */
        .education-item {
            margin-bottom: 2mm;
        }

        .education-date {
            font-size: 8pt;
            color: #333333;
            font-weight: bold;
        }

        .education-degree {
            font-size: 8.5pt;
            font-weight: bold;
            color: #333333;
            margin: 0.5mm 0;
        }

        .education-institution {
            font-size: 8pt;
            font-style: italic;
            color: #555555;
        }

        /* Hobbies Section */
        .hobbies-list {
            padding: 0;
            margin: 0;
            list-style-type: none;
        }

        .hobby-item {
            display: inline-block;
            margin-right: 1.5mm;
            margin-bottom: 1.5mm;
            padding: 0.8mm 1.5mm;
            font-size: 7.5pt;
            background-color: #f5f5f5 !important;
            border: 0.1mm solid #cccccc !important;
            border-radius: 1.5mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Footer */
        .footer {
            font-size: 7pt;
            color: #999999;
            text-align: center;
            margin-top: 6mm;
            font-style: italic;
            border-top: 0.2mm solid #cccccc !important;
            padding-top: 2mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Multi-language Indicators */
        .lang-indicator {
            display: inline-block;
            font-size: 6.5pt;
            font-style: italic;
            color: #666666;
            margin-left: 1mm;
        }

        /* Experience Item */
        .experience-item {
            page-break-inside: avoid;
            margin-bottom: 3mm;
        }
        
        @media print {
            body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }
            
            .cv-container {
                position: relative;
                top: 0;
                left: 0;
                width: 100%;
                height: auto;
                margin: 0;
                padding: 0;
            }
            
            .header-table {
                page-break-after: avoid !important;
            }
            
            .main-table {
                page-break-before: avoid !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
            }
            
            .experience-left-cell, .experience-right-cell {
                page-break-inside: auto;
            }
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header --}}
    <table class="header-table">
        <tr>
            <td class="header-left-cell">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                    @if($currentLocale === 'fr' && !empty($cvInformation['professions'][0]['name_en']))
                        <span class="lang-indicator">({{ $cvInformation['professions'][0]['name_en'] }})</span>
                    @elseif($currentLocale !== 'fr' && !empty($cvInformation['professions'][0]['name']))
                        <span class="lang-indicator">({{ $cvInformation['professions'][0]['name'] }})</span>
                    @endif
                </div>
                
                <table class="contact-table">
                    <tr>
                        <td style="width: 50%">
                            @if($cvInformation['personalInformation']['email'])
                                <div class="contact-item">
                                    <span class="contact-label">Email:</span>
                                    {{ $cvInformation['personalInformation']['email'] }}
                                </div>
                            @endif
                            @if($cvInformation['personalInformation']['phone'])
                                <div class="contact-item">
                                    <span class="contact-label">
                                        {{ $currentLocale === 'fr' ? 'Tél:' : 'Phone:' }}
                                    </span>
                                    {{ $cvInformation['personalInformation']['phone'] }}
                                </div>
                            @endif
                        </td>
                        <td style="width: 50%">
                            @if($cvInformation['personalInformation']['address'])
                                <div class="contact-item">
                                    <span class="contact-label">
                                        {{ $currentLocale === 'fr' ? 'Adresse:' : 'Address:' }}
                                    </span>
                                    {{ $cvInformation['personalInformation']['address'] }}
                                </div>
                            @endif
                            @if($cvInformation['personalInformation']['linkedin'])
                                <div class="contact-item">
                                    <span class="contact-label">LinkedIn:</span>
                                    {{ $cvInformation['personalInformation']['linkedin'] }}
                                </div>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
            <td class="header-right-cell">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="photo-container">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                    </div>
                @endif
            </td>
        </tr>
    </table>

    {{-- Main Content Two Columns --}}
    <table class="main-table">
        <tr>
            <td class="left-column-cell">
                {{-- Languages Section --}}
                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</div>
                        <table class="language-table">
                            <tr>
                                <th>{{ $currentLocale === 'fr' ? 'Langue' : 'Language' }}</th>
                                <th>{{ $currentLocale === 'fr' ? 'Niveau' : 'Level' }}</th>
                            </tr>
                            @foreach($cvInformation['languages'] ?? [] as $language)
                                <tr>
                                    <td>{{ $language['name'] ?? '' }}</td>
                                    <td>{{ $language['level'] ?? '' }}</td>
                                </tr>
                            @endforeach
                        </table>
                    </div>
                @endif

                {{-- Skills Section --}}
                @if(!empty($cvInformation['competences']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'COMPÉTENCES' : 'SKILLS' }}</div>
                        @foreach($cvInformation['competences'] as $competence)
                            <div class="skill-item">
                                <div class="skill-name">
                                    {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                    @if($currentLocale === 'fr' && !empty($competence['name_en']))
                                        <span class="lang-indicator">({{ $competence['name_en'] }})</span>
                                    @elseif($currentLocale !== 'fr' && !empty($competence['name']))
                                        <span class="lang-indicator">({{ $competence['name'] }})</span>
                                    @endif
                                </div>
                                @if(isset($competence['description']) && !empty($competence['description']))
                                    <div class="skill-description">{{ $competence['description'] }}</div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @endif

                {{-- Education Section --}}
                @foreach($experiencesByCategory as $category => $experiences)
                    @if($category == 'Éducation' || $category == 'Education')
                        <div class="section">
                            <div class="section-title">
                                {{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}
                            </div>

                            @foreach($experiences as $experience)
                                <div class="education-item">
                                    <div class="education-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @if($experience['date_end'])
                                            - {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @else
                                            - {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                    <div class="education-degree">{{ $experience['name'] }}</div>
                                    <div class="education-institution">{{ $experience['InstitutionName'] }}</div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                @endforeach

                {{-- Hobbies Section --}}
                @if(!empty($cvInformation['hobbies']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'INTÉRÊTS' : 'INTERESTS' }}</div>
                        <div class="hobbies-list">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <span class="hobby-item">
                                    {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                                    @if($currentLocale === 'fr' && !empty($hobby['name_en']))
                                        <span class="lang-indicator">({{ $hobby['name_en'] }})</span>
                                    @elseif($currentLocale !== 'fr' && !empty($hobby['name']))
                                        <span class="lang-indicator">({{ $hobby['name'] }})</span>
                                    @endif
                                </span>
                            @endforeach
                        </div>
                    </div>
                @endif
            </td>
            <td class="right-column-cell">
                {{-- Summary Section --}}
                @if(!empty($cvInformation['summaries']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'PROFIL' : 'PROFILE' }}</div>
                        <div class="summary">
                            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                        </div>
                    </div>
                @endif

                {{-- Experience Sections --}}
                @foreach($experiencesByCategory as $category => $experiences)
                    @if($category != 'Éducation' && $category != 'Education')
                        <div class="section">
                            <div class="section-title">
                                @if($currentLocale === 'fr')
                                    {{ strtoupper($category) }}
                                @else
                                    {{ strtoupper($categoryTranslations[$category]['name_en'] ?? $category) }}
                                @endif
                            </div>

                            @foreach($experiences as $experience)
                                <table class="experience-table">
                                    <tr>
                                        <td class="experience-left-cell">
                                            <div class="experience-date">
                                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                                @if($experience['date_end'])
                                                    {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                                @else
                                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                                @endif
                                            </div>
                                            <div class="experience-location">
                                                {{ $experience['city'] ?? '' }}{{ !empty($experience['city']) && !empty($experience['country']) ? ', ' : '' }}{{ $experience['country'] ?? '' }}
                                            </div>
                                        </td>
                                        <td class="experience-right-cell">
                                            <div class="experience-title">{{ $experience['name'] }}</div>
                                            <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                            <div class="experience-description">
                                                {{ $experience['description'] }}
                                                @if($experience['output'])
                                                    <br>{{ $experience['output'] }}
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            @endforeach
                        </div>
                    @endif
                @endforeach
            </td>
        </tr>
    </table>

    {{-- Footer --}}
    <div class="footer">
        {{ $currentLocale === 'fr' ? 'Curriculum Vitae International - ' : 'International Curriculum Vitae - ' }} 
        {{ $cvInformation['personalInformation']['firstName'] }} | 
        {{ $currentLocale === 'fr' ? 'Dernière mise à jour : ' : 'Last Updated: ' }} 
        {{ \Carbon\Carbon::now()->locale($currentLocale)->isoFormat('DD MMMM YYYY') }}
    </div>
</div>
</body>
</html>
@endsection 