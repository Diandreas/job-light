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
            margin: 0;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.15;
            font-size: 8pt;
            color: #2c3e50;
            margin: 0;
            padding: 0;
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
            width: 210mm;
        }

        /* Header Section */
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 6mm;
        }

        .header-table {
            width: 100%;
        }

        .profile-photo {
            width: 30mm;
            height: 30mm;
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
            padding-right: 4mm;
        }

        .header-right {
            text-align: right;
            padding-left: 4mm;
        }

        .name {
            font-size: 14pt;
            font-weight: bold;
            letter-spacing: 0.5mm;
            margin-bottom: 1mm;
        }

        .profession {
            font-size: 9pt;
            color: #ecf0f1;
            margin-bottom: 2mm;
        }

        .contact-info {
            font-size: 7.5pt;
            color: #bdc3c7;
        }

        .contact-item {
            margin-bottom: 0.5mm;
        }

        /* Language Section */
        .language-section {
            margin-top: 4mm;
            padding: 3mm;
            background-color: #ecf0f1;
            border-radius: 1mm;
        }
        
        .language-title {
            font-size: 9pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.2mm;
        }
        
        .language-items {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }
        
        .language-item {
            background-color: #ffffff;
            border-radius: 0.5mm;
            padding: 1mm 2mm;
            font-size: 7.5pt;
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
            padding: 6mm;
        }

        .two-columns {
            width: 100%;
        }

        .left-column {
            width: 68%;
            padding-right: 4mm;
            border-right: 0.2mm solid #ecf0f1;
        }

        .right-column {
            width: 32%;
            padding-left: 4mm;
        }

        .section {
            margin-bottom: 3mm;
        }

        .section-title {
            font-size: 9pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 2mm;
            padding-bottom: 0.5mm;
            border-bottom: 0.3mm solid #3498db;
        }

        .experience-block {
            margin-bottom: 2mm;
        }

        .experience-header {
            margin-bottom: 0.5mm;
        }

        .experience-title {
            font-weight: bold;
            color: #2c3e50;
            font-size: 8pt;
        }

        .company {
            font-style: italic;
            color: #7f8c8d;
            font-size: 7.5pt;
        }

        .date {
            float: right;
            color: #7f8c8d;
            font-size: 7pt;
        }

        .description {
            font-size: 7.5pt;
            line-height: 1.2;
            color: #34495e;
            text-align: justify;
        }

        .skill-category {
            margin-bottom: 2mm;
        }

        .skill-category-title {
            font-weight: bold;
            color: #3498db;
            font-size: 7.5pt;
            margin-bottom: 0.5mm;
        }

        .skill-list {
            margin-bottom: 1mm;
            padding-left: 2mm;
        }

        .skill-item {
            font-size: 7.5pt;
            color: #34495e;
            margin-bottom: 0.5mm;
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
            padding: 2mm;
            background-color: #f8f9fa;
            border-left: 0.3mm solid #3498db;
            margin-bottom: 3mm;
            font-size: 8pt;
            line-height: 1.2;
            color: #34495e;
            text-align: justify;
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
                </td>
            </tr>
        </table>
    </div>

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
</div>
</body>
</html>
@endsection
