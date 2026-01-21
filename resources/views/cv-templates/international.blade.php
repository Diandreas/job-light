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
            $secondaryColor = $cvInformation['primary_color'] ?? '#3498db';
            $accentColor = $cvInformation['primary_color'] ?? '#e74c3c';

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

        /* Modern CV Variables */
        :root {
            --primary-color: {{ $primaryColor }};
            --secondary-color: {{ $secondaryColor }};
            --light-color: {{ $lightColor }};
            --dark-color: {{ $primaryColor }};
            --text-color: #333333;
            --text-light: #7f8c8d;
            --border-color: #bdc3c7;
            --accent-color: {{ $accentColor }};
            --section-spacing: 5mm;
        }

        /* Page Setup */
        @page {
            margin: 5mm;
            padding: 0;
            size: A4;
        }

        /* Global Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', 'Segoe UI', sans-serif;
            line-height: 1.3;
            font-size: 9pt;
            color: var(--text-color);
            background-color: #FFFFFF;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        /* Main Container */
        .cv-container {
            width: 100%;
            max-width: 210mm;
            background-color: #FFFFFF;
            display: flex;
            flex-direction: column;
        }

        /* Header Section */
        .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 0.5mm solid var(--secondary-color);
            padding-bottom: 4mm;
            margin-bottom: 4mm;
        }

        .header-left {
            flex: 3;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header-right {
            flex: 1;
            display: flex;
            justify-content: flex-end;
            align-items: flex-start;
        }

        .name-profession {
            margin-bottom: 2mm;
        }

        .name {
            font-size: 16pt;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 1mm;
            text-transform: uppercase;
        }

        .profession {
            font-size: 10pt;
            color: var(--secondary-color);
            margin-bottom: 2mm;
        }

        /* Contact Information */
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm 5mm;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 1mm;
            font-size: 8.5pt;
        }

        .contact-label {
            font-weight: bold;
            color: var(--primary-color);
        }

        /* Photo Styling */
        .photo-container {
            width: 35mm;
            height: 35mm;
            overflow: hidden;
            border: 0.2mm solid var(--border-color);
            border-radius: 2mm;
            padding: 1mm;
            box-shadow: 0 1mm 2mm rgba(0,0,0,0.1);
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 1mm;
        }

        /* Main Content Layout */
        .main-content {
            display: flex;
            gap: 5mm;
        }

        .left-column {
            flex: 1;
            padding-right: 4mm;
        }

        .right-column {
            flex: 2;
            padding-left: 4mm;
            border-left: 0.2mm solid var(--border-color);
        }

        /* Section Styling */
        .section {
            margin-bottom: var(--section-spacing);
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 3mm;
            text-transform: uppercase;
            border-bottom: 0.2mm solid var(--secondary-color);
            padding-bottom: 1mm;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -0.2mm;
            left: 0;
            width: 10mm;
            height: 0.5mm;
            background-color: var(--accent-color);
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: var(--text-color);
            line-height: 1.4;
            margin-bottom: 3mm;
            text-align: justify;
        }

        /* Experience Item */
        .experience-item {
            display: flex;
            margin-bottom: 3mm;
            page-break-inside: avoid;
        }

        .experience-dates {
            flex: 1;
            padding-right: 2mm;
        }

        .experience-content {
            flex: 3;
        }

        .experience-date {
            font-size: 8.5pt;
            color: var(--primary-color);
            font-weight: bold;
        }

        .experience-duration {
            font-size: 7.5pt;
            color: var(--text-light);
            margin-top: 0.5mm;
        }

        .experience-location {
            font-size: 8pt;
            font-style: italic;
            color: var(--text-light);
            margin-top: 1mm;
        }

        .experience-title {
            font-size: 10pt;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 1mm;
        }

        .experience-company {
            font-size: 9pt;
            color: var(--secondary-color);
            font-weight: 500;
            margin-bottom: 2mm;
        }

        .experience-description {
            font-size: 8.5pt;
            color: var(--text-color);
            line-height: 1.4;
            text-align: justify;
        }

        /* Skills Styling */
        .skills-container {
            display: flex;
            flex-direction: column;
            gap: 2mm;
        }

        .skill-item {
            margin-bottom: 2mm;
        }

        .skill-name {
            font-size: 9pt;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 1mm;
            display: flex;
            align-items: center;
        }

        .skill-name::before {
            content: "•";
            color: var(--secondary-color);
            margin-right: 1mm;
            font-size: 10pt;
        }

        .skill-description {
            font-size: 8pt;
            color: var(--text-light);
            margin-left: 3mm;
        }

        /* Languages Section */
        .languages-container {
            display: flex;
            flex-direction: column;
            gap: 2mm;
        }

        .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5mm;
            background-color: var(--light-color);
            border-radius: 1mm;
            margin-bottom: 1mm;
        }

        .language-name {
            font-weight: bold;
            font-size: 9pt;
            color: var(--primary-color);
        }

        .language-level {
            font-size: 8pt;
            color: var(--secondary-color);
            background-color: white;
            padding: 0.5mm 1.5mm;
            border-radius: 1mm;
        }

        /* Education Styling */
        .education-item {
            margin-bottom: 3mm;
        }

        .education-date {
            font-size: 8.5pt;
            color: var(--primary-color);
            font-weight: bold;
            margin-bottom: 1mm;
        }

        .education-degree {
            font-size: 9pt;
            font-weight: bold;
            color: var(--dark-color);
            margin-bottom: 1mm;
        }

        .education-institution {
            font-size: 8.5pt;
            font-style: italic;
            color: var(--secondary-color);
        }

        /* Hobbies Section */
        .hobbies-container {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
        }

        .hobby-item {
            display: inline-block;
            padding: 1mm 2mm;
            font-size: 8pt;
            background-color: var(--light-color);
            color: var(--primary-color);
            border-radius: 2mm;
        }

        /* Footer */
        .footer {
            font-size: 7.5pt;
            color: var(--text-light);
            text-align: center;
            margin-top: 6mm;
            font-style: italic;
            border-top: 0.2mm solid var(--border-color);
            padding-top: 2mm;
        }

        /* Language Indicator */
        .lang-indicator {
            display: inline-block;
            font-size: 7pt;
            font-style: italic;
            color: var(--text-light);
            margin-left: 1mm;
        }

        /* Print Specific Styles */
        @media print {
            html, body {
                width: 210mm;
                height: 297mm;
            }

            .cv-container {
                width: 100%;
                height: auto;
            }

            .section {
                break-inside: avoid;
            }

            .experience-item, .education-item {
                break-inside: avoid;
            }
        }
        
    <x-cv-editable-css />
</head>
<body>
<div class="cv-container">
    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <div class="name-profession">
                <h1 class="name" @if(isset($editable) && $editable) contenteditable="true" data-editable data-field="personalInformation.firstName" @endif>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                    @if($currentLocale === 'fr' && !empty($cvInformation['professions'][0]['name_en']))
                        <span class="lang-indicator">({{ $cvInformation['professions'][0]['name_en'] }})</span>
                    @elseif($currentLocale !== 'fr' && !empty($cvInformation['professions'][0]['name']))
                        <span class="lang-indicator">({{ $cvInformation['professions'][0]['name'] }})</span>
                    @endif
                </div>
            </div>

            <div class="contact-info">
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-item">
                        <span class="contact-label">Email:</span>
                        {{ $cvInformation['personalInformation']['email'] }}
                    </div>
                @endif

                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-item">
                        <span class="contact-label">{{ $currentLocale === 'fr' ? 'Tél:' : 'Phone:' }}</span>
                        {{ $cvInformation['personalInformation']['phone'] }}
                    </div>
                @endif

                @if($cvInformation['personalInformation']['address'])
                    <div class="contact-item">
                        <span class="contact-label">{{ $currentLocale === 'fr' ? 'Adresse:' : 'Address:' }}</span>
                        {{ $cvInformation['personalInformation']['address'] }}
                    </div>
                @endif

                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">
                        <span class="contact-label">LinkedIn:</span>
                        {{ $cvInformation['personalInformation']['linkedin'] }}
                    </div>
                @endif
            </div>
        </div>

        <div class="header-right">
            @if($cvInformation['personalInformation']['photo'])
                <div class="photo-container">
                    <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                         alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                </div>
            @endif
        </div>
    </header>

    <!-- Main Content -->
    <div class="main-content">
        <!-- Left Column -->
        <div class="left-column">
            <!-- Languages Section -->
            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <div class="section">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</h2>
                    <div class="languages-container">
                        @foreach($cvInformation['languages'] ?? [] as $language)
                            <div class="language-item">
                                <span class="language-name">{{ $language['name'] ?? '' }}</span>
                                <span class="language-level">{{ $language['level'] ?? '' }}</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Skills Section -->
            @if(!empty($cvInformation['competences']))
                <div class="section">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'COMPÉTENCES' : 'SKILLS' }}</h2>
                    <div class="skills-container">
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
                </div>
            @endif

            <!-- Education Section -->
            @foreach($experiencesByCategory as $category => $experiences)
                @if($category == 'Éducation' || $category == 'Education')
                    <div class="section">
                        <h2 class="section-title">
                            {{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}
                        </h2>

                        <div class="education-container">
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
                    </div>
                @endif
            @endforeach

            <!-- Hobbies Section -->
            @if(!empty($cvInformation['hobbies']))
                <div class="section">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'INTÉRÊTS' : 'INTERESTS' }}</h2>
                    <div class="hobbies-container">
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
        </div>

        <!-- Right Column -->
        <div class="right-column">
            <!-- Summary Section -->
            @if(!empty($cvInformation['summaries']))
                <div class="section">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'PROFIL' : 'PROFILE' }}</h2>
                    <div class="summary">
                        {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                    </div>
                </div>
            @endif

            <!-- Experience Sections -->
            @foreach($experiencesByCategory as $category => $experiences)
                @if($category != 'Éducation' && $category != 'Education')
                    <div class="section">
                        <h2 class="section-title">
                            @if($currentLocale === 'fr')
                                {{ strtoupper($category) }}
                            @else
                                {{ strtoupper($categoryTranslations[$category]['name_en'] ?? $category) }}
                            @endif
                        </h2>

                        <div class="experiences-container">
                            @foreach($experiences as $experience)
                                <div class="experience-item">
                                    <div class="experience-dates">
                                        <div class="experience-date">
                                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                            @if($experience['date_end'])
                                                {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                            @else
                                                {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                            @endif
                                        </div>

                                        @php
                                            $start = \Carbon\Carbon::parse($experience['date_start']);
                                            $end = $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end']) : \Carbon\Carbon::now();
                                            $diff = $start->diff($end);
                                            $duration = '';
                                            if ($diff->y > 0) {
                                                $duration .= $diff->y . ($currentLocale === 'fr' ? ' an' . ($diff->y > 1 ? 's' : '') : ' yr' . ($diff->y > 1 ? 's' : ''));
                                            }
                                            if ($diff->m > 0) {
                                                if ($duration) $duration .= ', ';
                                                $duration .= $diff->m . ' mo';
                                            }
                                        @endphp

                                        @if($duration)
                                            <div class="experience-duration">({{ $duration }})</div>
                                        @endif

                                        @if(!empty($experience['city']) || !empty($experience['country']))
                                            <div class="experience-location">
                                                {{ $experience['city'] ?? '' }}{{ !empty($experience['city']) && !empty($experience['country']) ? ', ' : '' }}{{ $experience['country'] ?? '' }}
                                            </div>
                                        @endif
                                    </div>

                                    <div class="experience-content">
                                        <div class="experience-title" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="name" @endif>{{ $experience['name'] }}</div>
                                        <div class="experience-company" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="InstitutionName" @endif>{{ $experience['InstitutionName'] }}</div>
                                        <div class="experience-description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="description" data-multiline="true" @endif>
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
                @endif
            @endforeach
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        {{ $currentLocale === 'fr' ? 'Curriculum Vitae International - ' : 'International Curriculum Vitae - ' }}
        {{ $cvInformation['personalInformation']['firstName'] }} |
        {{ $currentLocale === 'fr' ? 'Dernière mise à jour : ' : 'Last Updated: ' }}
        {{ \Carbon\Carbon::now()->locale($currentLocale)->isoFormat('DD MMMM YYYY') }}
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
