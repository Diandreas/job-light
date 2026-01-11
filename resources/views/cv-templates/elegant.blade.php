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
            $primaryColor = $cvInformation['primary_color'] ?? '#8E44AD';
            // Générer des variations de la couleur primaire
            $primaryColorRgb = sscanf($primaryColor, "#%02x%02x%02x");
            $lightColor = sprintf("#%02x%02x%02x",
                min(255, $primaryColorRgb[0] + 80),
                min(255, $primaryColorRgb[1] + 80),
                min(255, $primaryColorRgb[2] + 80)
            );
            $veryLightColor = sprintf("#%02x%02x%02x",
                min(255, $primaryColorRgb[0] + 120),
                min(255, $primaryColorRgb[1] + 120),
                min(255, $primaryColorRgb[2] + 120)
            );
        @endphp

        /* Page Setup */
        @page {
            margin: 10mm;
            padding: 0;
            size: A4;
        }

        /* Reset & Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', 'Calibri', sans-serif;
            line-height: 1.3;
            font-size: 11pt;
            color: #333333;
            background-color: #FFFFFF;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Main Container */
        .cv-container {
            width: 100%;
            max-width: 190mm;
            margin: 0 auto;
            padding: 2mm;
        }

        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6mm;
            border-bottom: 0.3mm solid {{ $primaryColor }};
            padding-bottom: 4mm;
        }

        .header-content {
            flex: 3;
        }

        .header-photo {
            flex: 1;
            display: flex;
            justify-content: flex-end;
        }

        .name {
            font-size: 21pt;
            font-weight: 300;
            color: {{ $primaryColor }};
            margin-bottom: 1mm;
            letter-spacing: 0.5pt;
        }

        .profession {
            font-size: 12pt;
            color: #555555;
            margin-bottom: 4mm;
            font-style: italic;
            letter-spacing: 0.5pt;
        }

        /* Photo Styling */
        .photo-container {
            width: 30mm;
            height: 30mm;
            overflow: hidden;
            border-radius: 50%;
            border: 0.5mm solid {{ $primaryColor }};
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Contact Information */
        .contact-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5mm;
        }

        .contact-column {
            flex: 1;
        }

        .contact-item {
            font-size: 10pt;
            margin-bottom: 1mm;
            color: #777777;
            display: block;
        }

        /* Summary Section */
        .summary {
            font-size: 11pt;
            color: #444444;
            line-height: 1.4;
            text-align: justify;
            margin-bottom: 5mm;
            padding-bottom: 5mm;
            border-bottom: 0.1mm solid #EEEEEE;
        }

        /* Main Content Two-Column Layout */
        .two-column-layout {
            display: flex;
            gap: 6mm;
        }

        .main-column {
            flex: 65;
        }

        .side-column {
            flex: 35;
            padding-left: 3mm;
            border-left: 0.1mm solid #EEEEEE;
        }

        /* Section Styling */
        .section {
            margin-bottom: 6mm;
        }

        .section-title {
            font-size: 12pt;
            font-weight: normal;
            color: {{ $primaryColor }};
            text-transform: uppercase;
            margin-bottom: 3mm;
            letter-spacing: 0.5pt;
            position: relative;
            padding-bottom: 1mm;
        }

        .section-title:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 12mm;
            height: 0.3mm;
            background-color: {{ $primaryColor }};
        }

        /* Experience Item */
        .experience-item {
            display: flex;
            gap: 2mm;
            margin-bottom: 4mm;
            break-inside: avoid;
        }

        .experience-left {
            flex: 1;
            min-width: 25%;
            max-width: 25%;
        }

        .experience-right {
            flex: 3;
        }

        .date {
            font-size: 10pt;
            color: {{ $primaryColor }};
            font-weight: 600;
            font-style: italic;
        }

        .company {
            font-size: 10pt;
            margin-top: 1mm;
            color: #777777;
        }

        .position {
            font-size: 11pt;
            font-weight: 600;
            color: #444444;
            margin-bottom: 1.5mm;
        }

        .description {
            font-size: 10pt;
            color: #555555;
            line-height: 1.4;
            text-align: justify;
        }

        /* Skills Styling */
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 2mm;
        }

        .skill-item {
            background-color: {{ $veryLightColor }};
            padding: 1mm 2mm;
            border-radius: 1.5mm;
            font-size: 10pt;
            color: {{ $primaryColor }};
        }

        /* Language Section */
        .language-items {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 2mm;
        }

        .language-item {
            background-color: {{ $veryLightColor }};
            border-radius: 1.5mm;
            padding: 1mm 2mm;
            font-size: 10pt;
            color: {{ $primaryColor }};
            display: flex;
            align-items: center;
        }

        .language-level {
            color: #777777;
            margin-left: 1mm;
            font-style: italic;
        }

        /* Hobbies Styling */
        .hobbies-container {
            display: flex;
            flex-wrap: wrap;
            gap: 3mm;
            margin-top: 2mm;
        }

        .hobby-item {
            font-size: 10pt;
            color: #555555;
            position: relative;
            padding-left: 2mm;
        }

        .hobby-item:before {
            content: "•";
            color: {{ $primaryColor }};
            position: absolute;
            left: 0;
        }

        /* Print Specific */
        @media print {
            body {
                width: 210mm;
                height: 297mm;
                font-size: 11pt;
            }

            .cv-container {
                width: 100%;
                height: auto;
            }

            .section-title {
                break-after: avoid;
            }

            .experience-item {
                break-inside: avoid;
            }
        }
    </style>
    <x-cv-editable-css />
</head>
<body>
<div class="cv-container">
    <!-- Header Section -->
    <header class="header">
        <div class="header-content">
            <h1 class="name" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="firstName" @endif>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
            <div class="profession" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="profession" @endif>
                {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
            </div>
        </div>

        <div class="header-photo">
            @if($cvInformation['personalInformation']['photo'])
                <div class="photo-container">
                    <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                         alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                </div>
            @endif
        </div>
    </header>

    <!-- Contact Information -->
    <div class="contact-info">
        <div class="contact-column">
            @if($cvInformation['personalInformation']['email'])
                <span class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</span>
            @endif
            @if($cvInformation['personalInformation']['phone'])
                <span class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</span>
            @endif
        </div>
        <div class="contact-column">
            @if($cvInformation['personalInformation']['address'])
                <span class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</span>
            @endif
            @if($cvInformation['personalInformation']['linkedin'])
                <span class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</span>
            @endif
        </div>
    </div>

    <!-- Summary Section -->
    @if(!empty($cvInformation['summaries']))
        <div class="summary" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="summary" data-id="{{ $cvInformation['summaries'][0]['id'] ?? 0 }}" data-field="description" @endif>
            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
        </div>
    @endif

    <!-- Main Two-Column Layout -->
    <div class="two-column-layout">
        <!-- Main Column -->
        <div class="main-column">
            <!-- Experience Sections -->
            @foreach($experiencesByCategory as $category => $experiences)
                <div class="section">
                    <h2 class="section-title">
                        @if($currentLocale === 'fr')
                            {{ $category }}
                        @else
                            {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                        @endif
                    </h2>

                    <div class="experiences-container">
                        @foreach($experiences as $experience)
                            <div class="experience-item">
                                <div class="experience-left">
                                    <div class="date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                        @if($experience['date_end'])
                                            {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                    <div class="company" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="InstitutionName" @endif>{{ $experience['InstitutionName'] }}</div>
                                </div>
                                <div class="experience-right">
                                    <div class="position" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="name" @endif>{{ $experience['name'] }}</div>
                                    <div class="description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="description" @endif>
                                        {{ $experience['description'] }}
                                        @if(!empty($experience['output']))
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endforeach
        </div>

        <!-- Side Column -->
        <div class="side-column">
            <!-- Skills Section -->
            @if(!empty($cvInformation['competences']))
                <div class="section">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</h2>
                    <div class="skills-container">
                        @foreach($cvInformation['competences'] as $competence)
                            <div class="skill-item">
                                {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Languages Section -->
            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <div class="section">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</h2>
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

            <!-- Hobbies Section -->
            @if(!empty($cvInformation['hobbies']))
                <div class="section">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</h2>
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
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
