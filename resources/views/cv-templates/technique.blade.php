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
            line-height: 1.2;
            font-size: 9pt;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .cv-container {
            width: 190mm;
        }

        /* Tables Reset */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            vertical-align: top;
            padding: 0;
        }

        /* Layout */
        .main-table {
            width: 100%;
        }

        .sidebar-cell {
            width: 55mm;
            background-color: #263238;
            color: #ECEFF1;
            height: 100%;
            padding: 8mm 4mm;
        }

        .main-content-cell {
            width: 137mm;
            padding: 8mm 6mm;
        }

        /* Header Styling */
        .header {
            margin-bottom: 6mm;
        }

        .name {
            font-size: 16pt;
            font-weight: bold;
            color: #263238;
            margin-bottom: 1mm;
        }

        .profession {
            font-size: 11pt;
            color: #607D8B;
            margin-bottom: 3mm;
            font-weight: 600;
        }

        .header-line {
            width: 35mm;
            height: 1mm;
            background-color: #00BCD4;
            margin-bottom: 3mm;
        }

        /* Photo Styling */
        .photo-container {
            width: 35mm;
            height: 35mm;
            overflow: hidden;
            border-radius: 2mm;
            margin: 0 auto 5mm auto;
            border: 0.5mm solid #00BCD4;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Section Styling */
        .section {
            margin-bottom: 5mm;
        }

        .section-title {
            font-size: 10pt;
            font-weight: bold;
            color: #00BCD4;
            margin-bottom: 2mm;
            text-transform: uppercase;
            border-bottom: 0.3mm solid #E0E0E0;
            padding-bottom: 1mm;
        }

        .sidebar-section-title {
            font-size: 10pt;
            font-weight: bold;
            color: #00BCD4;
            text-transform: uppercase;
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #455A64;
        }

        /* Contact Info */
        .contact-item {
            margin-bottom: 1.5mm;
            font-size: 8pt;
            color: #B0BEC5;
        }

        .contact-label {
            color: #00BCD4;
            font-weight: bold;
            margin-right: 1mm;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #455A64;
            line-height: 1.3;
            margin-bottom: 5mm;
            padding: 2mm;
            background-color: #F5F5F5;
            border-left: 1mm solid #00BCD4;
        }

        /* Experience Styling */
        .experience-item {
            margin-bottom: 3mm;
            page-break-inside: avoid;
        }

        .experience-table {
            width: 100%;
            margin-bottom: 1mm;
        }

        .experience-title {
            font-size: 9pt;
            font-weight: bold;
            color: #455A64;
        }

        .experience-company {
            font-size: 8pt;
            font-weight: 600;
            color: #607D8B;
        }

        .experience-date {
            font-size: 8pt;
            color: #00BCD4;
            font-weight: bold;
            text-align: right;
        }

        .experience-description {
            font-size: 8pt;
            color: #546E7A;
            line-height: 1.3;
            text-align: justify;
        }

        /* Skills Styling */
        .skill-category {
            margin-bottom: 3mm;
        }

        .skill-category-title {
            font-size: 8pt;
            font-weight: bold;
            color: #ECEFF1;
            margin-bottom: 1.5mm;
        }

        .skill-bar-container {
            height: 1.5mm;
            background-color: #455A64;
            border-radius: 0.75mm;
            margin-bottom: 1.5mm;
        }

        .skill-bar {
            height: 100%;
            background-color: #00BCD4;
            border-radius: 0.75mm;
        }

        .skill-item {
            margin-bottom: 1.5mm;
        }

        .skill-name {
            font-size: 8pt;
            margin-bottom: 1mm;
            display: flex;
            justify-content: space-between;
        }

        /* Languages Section */
        .language-item {
            margin-bottom: 2mm;
        }
        
        .language-name {
            font-size: 8pt;
            color: #ECEFF1;
            margin-bottom: 1mm;
        }
        
        .language-level {
            font-size: 7pt;
            color: #B0BEC5;
            font-style: italic;
        }
        
        .language-bar-container {
            height: 1.5mm;
            background-color: #455A64;
            border-radius: 0.75mm;
            margin-top: 1mm;
        }
        
        .language-bar {
            height: 100%;
            background-color: #00BCD4;
            border-radius: 0.75mm;
        }

        /* Education Styling */
        .education-item {
            margin-bottom: 2mm;
        }

        .education-degree {
            font-size: 9pt;
            font-weight: bold;
            color: #455A64;
        }

        .education-institution {
            font-size: 8pt;
            color: #607D8B;
        }

        .education-date {
            font-size: 8pt;
            color: #00BCD4;
            font-weight: bold;
            margin-top: 0.5mm;
        }

        /* Projects Styling */
        .project-item {
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 0.2mm solid #EEEEEE;
        }

        .project-title {
            font-size: 9pt;
            font-weight: bold;
            color: #455A64;
        }

        .project-description {
            font-size: 8pt;
            color: #546E7A;
            margin-top: 1mm;
        }

        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            margin-top: 1mm;
            gap: 1mm;
        }

        .tech-tag {
            background-color: #E0F7FA;
            color: #00838F;
            font-size: 7pt;
            padding: 0.5mm 1mm;
            border-radius: 1mm;
        }
    </style>
</head>
<body>
<div class="cv-container">
    <table class="main-table">
        <tr>
            {{-- Sidebar --}}
            <td class="sidebar-cell">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="photo-container">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                    </div>
                @endif

                {{-- Contact Information --}}
                <div class="section">
                    <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Contact' : 'Contact' }}</div>
                    <table>
                        @if($cvInformation['personalInformation']['email'])
                            <tr>
                                <td><span class="contact-label">Email:</span></td>
                                <td>{{ $cvInformation['personalInformation']['email'] }}</td>
                            </tr>
                        @endif
                        @if($cvInformation['personalInformation']['phone'])
                            <tr>
                                <td><span class="contact-label">Tel:</span></td>
                                <td>{{ $cvInformation['personalInformation']['phone'] }}</td>
                            </tr>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <tr>
                                <td><span class="contact-label">Adresse:</span></td>
                                <td>{{ $cvInformation['personalInformation']['address'] }}</td>
                            </tr>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <tr>
                                <td><span class="contact-label">LinkedIn:</span></td>
                                <td>{{ $cvInformation['personalInformation']['linkedin'] }}</td>
                            </tr>
                        @endif
                    </table>
                </div>

                {{-- Skills Section --}}
                @if(!empty($cvInformation['competences']))
                    <div class="section">
                        <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                        @foreach($cvInformation['competences'] as $index => $competence)
                            <div class="skill-item">
                                <div class="skill-name">
                                    {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                </div>
                                <div class="skill-bar-container">
                                    <div class="skill-bar" style="width: {{ min((($index + 1) % 5 + 2) * 20, 100) }}%"></div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif

                {{-- Languages Section --}}
                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <div class="section">
                        <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                        @foreach($cvInformation['languages'] ?? [] as $index => $language)
                            <div class="language-item">
                                <div class="language-name">{{ $language['name'] ?? '' }}</div>
                                @if(isset($language['level']))
                                    <div class="language-level">{{ $language['level'] ?? '' }}</div>
                                @endif
                                <div class="language-bar-container">
                                    @php
                                        $levelWidth = 60; // Default percentage
                                        
                                        if (isset($language['level'])) {
                                            $level = strtolower($language['level']);
                                            
                                            if (strpos($level, 'débutant') !== false || strpos($level, 'beginner') !== false) {
                                                $levelWidth = 25;
                                            } elseif (strpos($level, 'intermédiaire') !== false || strpos($level, 'intermediate') !== false) {
                                                $levelWidth = 50;
                                            } elseif (strpos($level, 'avancé') !== false || strpos($level, 'advanced') !== false) {
                                                $levelWidth = 75;
                                            } elseif (strpos($level, 'natif') !== false || strpos($level, 'native') !== false || strpos($level, 'fluent') !== false || strpos($level, 'courant') !== false) {
                                                $levelWidth = 100;
                                            }
                                        }
                                    @endphp
                                    <div class="language-bar" style="width: {{ $levelWidth }}%"></div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @endif

                {{-- Hobbies Section --}}
                @if(!empty($cvInformation['hobbies']))
                    <div class="section">
                        <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                        @foreach($cvInformation['hobbies'] as $hobby)
                            <div class="contact-item">
                                {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                            </div>
                        @endforeach
                    </div>
                @endif
            </td>

            {{-- Main Content --}}
            <td class="main-content-cell">
                {{-- Header Section --}}
                <div class="header">
                    <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                    <div class="profession">
                        {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                    </div>
                    <div class="header-line"></div>
                </div>

                {{-- Summary Section --}}
                @if(!empty($cvInformation['summaries']))
                    <div class="summary">
                        {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                    </div>
                @endif

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
                            <div class="experience-item">
                                <table class="experience-table">
                                    <tr>
                                        <td style="width: 75%;">
                                            <div class="experience-title">{{ $experience['name'] }}</div>
                                            <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                        </td>
                                        <td style="width: 25%;">
                                            <div class="experience-date">
                                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                                @if($experience['date_end'])
                                                    {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                                @else
                                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                                <div class="experience-description">
                                    {{ $experience['description'] }}
                                    @if($experience['output'])
                                        <br>{{ $experience['output'] }}
                                    @endif
                                </div>
                                @if($category == 'Projets' || $category == 'Projects')
                                    <div class="tech-tags">
                                        @foreach(explode(',', $experience['description'] ?? '') as $index => $tech)
                                            @if($index < 5 && trim($tech) != '')
                                                <div class="tech-tag">{{ trim($tech) }}</div>
                                            @endif
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @endforeach
            </td>
        </tr>
    </table>
</div>
</body>
</html>
@endsection 