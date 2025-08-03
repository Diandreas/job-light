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
            $primaryColor = $cvInformation['primary_color'] ?? '#00BCD4';
            // Générer des variations de la couleur primaire
            $primaryColorRgb = sscanf($primaryColor, "#%02x%02x%02x");
            $darkColor = sprintf("#%02x%02x%02x",
                max(0, $primaryColorRgb[0] - 40),
                max(0, $primaryColorRgb[1] - 40),
                max(0, $primaryColorRgb[2] - 40)
            );
            $lightColor = sprintf("#%02x%02x%02x%02x",
                min(255, $primaryColorRgb[0] + 50),
                min(255, $primaryColorRgb[1] + 50),
                min(255, $primaryColorRgb[2] + 50),
                26 // Alpha pour transparence
            );
        @endphp

        /* Print Settings */
        @page {
            size: A4;
            margin: 0;
        }

        /* Reset & Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.3;
            font-size: 9pt;
            color: #333333;
            background-color: #FFFFFF;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        /* Main Container */
        .cv-container {
            width: 210mm; /* A4 width */
            min-height: 297mm; /* A4 height */
            display: flex;
            page-break-after: avoid;
            overflow: hidden;
        }

        /* Sidebar */
        .sidebar {
            width: 65mm;
            background-color: #263238;
            color: #ECEFF1;
            padding: 8mm 4mm;
            display: flex;
            flex-direction: column;
        }

        /* Main Content */
        .main-content {
            width: 145mm;
            padding: 8mm 6mm;
            background-color: #FFFFFF;
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
            background-color: {{ $primaryColor }};
            margin-bottom: 3mm;
        }

        /* Photo Styling */
        .photo-container {
            width: 35mm;
            height: 35mm;
            overflow: hidden;
            border-radius: 2mm;
            margin: 0 auto 5mm auto;
            border: 0.5mm solid {{ $primaryColor }};
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
            font-size::10pt;
            font-weight: bold;
            color: {{ $primaryColor }};
            margin-bottom: 2mm;
            text-transform: uppercase;
            border-bottom: 0.3mm solid #E0E0E0;
            padding-bottom: 1mm;
        }

        .sidebar-section-title {
            font-size: 10pt;
            font-weight: bold;
            color: {{ $primaryColor }};
            text-transform: uppercase;
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #455A64;
        }

        /* Contact Info */
        .contact-info {
            margin-bottom: 5mm;
        }

        .contact-row {
            display: flex;
            margin-bottom: 1.5mm;
        }

        .contact-label {
            color: {{ $primaryColor }};
            font-weight: bold;
            margin-right: 1mm;
            font-size: 8pt;
            min-width: 15mm;
        }

        .contact-value {
            font-size: 8pt;
            color: #B0BEC5;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #455A64;
            line-height: 1.4;
            margin-bottom: 5mm;
            padding: 2mm;
            background-color: #F5F5F5;
            border-left: 1mm solid {{ $primaryColor }};
        }

        /* Experience Styling */
        .experience-container {
            display: flex;
            flex-direction: column;
            gap: 3mm;
        }

        .experience-item {
            margin-bottom: 3mm;
            break-inside: avoid;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
        }

        .experience-title-company {
            max-width: 75%;
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
            color: {{ $primaryColor }};
            font-weight: bold;
            text-align: right;
        }

        .experience-description {
            font-size: 8pt;
            color: #546E7A;
            line-height: 1.4;
            text-align: justify;
        }

        /* Skills Styling */
        .skills-container {
            display: flex;
            flex-direction: column;
            gap: 1.5mm;
        }

        .skill-item {
            margin-bottom: 1.5mm;
        }

        .skill-name {
            font-size: 8pt;
            margin-bottom: 1mm;
            color: #ECEFF1;
        }

        .skill-bar-container {
            height: 1.5mm;
            background-color: #455A64;
            border-radius: 0.75mm;
            margin-bottom: 1.5mm;
        }

        .skill-bar {
            height: 100%;
            background-color: {{ $primaryColor }};
            border-radius: 0.75mm;
        }

        /* Languages Section */
        .languages-container {
            display: flex;
            flex-direction: column;
            gap: 2mm;
        }

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
            background-color: {{ $primaryColor }};
            border-radius: 0.75mm;
        }

        /* Hobbies Styling */
        .hobbies-container {
            display: flex;
            flex-direction: column;
            gap: 1.5mm;
        }

        .hobby-item {
            font-size: 8pt;
            color: #B0BEC5;
        }

        /* Tech Tags */
        .tech-tags {
            display: flex;
            flex-wrap: wrap;
            margin-top: 1mm;
            gap: 1mm;
        }

        .tech-tag {
            background-color: {{ $lightColor }};
            color: {{ $darkColor }};
            font-size: 7pt;
            padding: 0.5mm 1mm;
            border-radius: 1mm;
        }

        /* Print Specific Styles */
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }

            .cv-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 210mm;
                height: 297mm;
                margin: 0;
                page-break-after: avoid;
                overflow: hidden;
            }

            .sidebar {
                break-inside: avoid;
            }

            .main-content {
                break-inside: avoid;
            }

            .experience-item {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
<div class="cv-container">
    <!-- Sidebar -->
    <div class="sidebar">
        @if($cvInformation['personalInformation']['photo'])
            <div class="photo-container">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                     alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
            </div>
        @endif

        <!-- Contact Information -->
        <div class="section">
            <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Contact' : 'Contact' }}</div>
            <div class="contact-info">
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-row">
                        <span class="contact-label">Email:</span>
                        <span class="contact-value">{{ $cvInformation['personalInformation']['email'] }}</span>
                    </div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-row">
                        <span class="contact-label">Tel:</span>
                        <span class="contact-value">{{ $cvInformation['personalInformation']['phone'] }}</span>
                    </div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <div class="contact-row">
                        <span class="contact-label">{{ $currentLocale === 'fr' ? 'Adresse:' : 'Address:' }}</span>
                        <span class="contact-value">{{ $cvInformation['personalInformation']['address'] }}</span>
                    </div>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-row">
                        <span class="contact-label">LinkedIn:</span>
                        <span class="contact-value">{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                    </div>
                @endif
            </div>
        </div>

        <!-- Skills Section -->
        @if(!empty($cvInformation['competences']))
            <div class="section">
                <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                <div class="skills-container">
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
            </div>
        @endif

        <!-- Languages Section -->
        @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
            <div class="section">
                <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                <div class="languages-container">
                    @foreach($cvInformation['languages'] ?? [] as $language)
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
            </div>
        @endif

        <!-- Hobbies Section -->
        @if(!empty($cvInformation['hobbies']))
            <div class="section">
                <div class="sidebar-section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                <div class="hobbies-container">
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <div class="hobby-item">
                            {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                        </div>
                    @endforeach
                </div>
            </div>
        @endif
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Header Section -->
        <div class="header">
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
            <div class="profession">
                {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
            </div>
            <div class="header-line"></div>
        </div>

        <!-- Summary Section -->
        @if(!empty($cvInformation['summaries']))
            <div class="summary">
                {{ $cvInformation['summaries'][0]['description'] ?? '' }}
            </div>
        @endif

        <!-- Experience Sections -->
        @foreach($experiencesByCategory as $category => $experiences)
            <div class="section">
                <div class="section-title">
                    @if($currentLocale === 'fr')
                        {{ $category }}
                    @else
                        {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                    @endif
                </div>

                <div class="experience-container">
                    @foreach($experiences as $experience)
                        <div class="experience-item">
                            <div class="experience-header">
                                <div class="experience-title-company">
                                    <div class="experience-title">{{ $experience['name'] }}</div>
                                    <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                </div>
                                <div class="experience-date">
                                    {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                    @if($experience['date_end'])
                                        {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                    @else
                                        {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                    @endif
                                </div>
                            </div>
                            <div class="experience-description">
                                {{ $experience['description'] }}
                                @if(!empty($experience['output']))
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
            </div>
        @endforeach
    </div>
</div>
</body>
</html>
@endsection
