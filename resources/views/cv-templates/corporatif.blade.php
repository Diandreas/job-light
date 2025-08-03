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
            $primaryColor = $cvInformation['primary_color'] ?? '#FFA500';
            // Générer des variations de la couleur primaire
            $primaryColorRgb = sscanf($primaryColor, "#%02x%02x%02x");
            $darkColor = sprintf("#%02x%02x%02x",
                max(0, $primaryColorRgb[0] - 40),
                max(0, $primaryColorRgb[1] - 40),
                max(0, $primaryColorRgb[2] - 40)
            );
        @endphp

        @page {
            margin: 0;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
            line-height: 1.4;
            font-size: 9pt;
            color: #333333;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        .cv-container {
            width: 210mm;
            min-height: 297mm;
            position: relative;
            background-color: #F8F9FA;
        }

        /* Header Bar */
        .header-bar {
            height: 8mm;
            width: 100%;
            background-color: #333333;
            position: relative;
        }

        .header-accent {
            position: absolute;
            top: 0;
            left: 50mm;
            height: 8mm;
            width: 35mm;
            background-color: {{ $primaryColor }};
        }

        /* Layout */
        .main-content {
            display: flex;
            min-height: 289mm; /* 297mm - 8mm header */
        }

        .left-column {
            width: 65mm;
            background-color: #EEEEEE;
            padding: 15mm 5mm 10mm 10mm;
        }

        .right-column {
            flex: 1;
            background-color: #FFFFFF;
            padding: 15mm 10mm 10mm 10mm;
        }

        /* Profile Photo */
        .profile-section {
            text-align: center;
            margin-bottom: 10mm;
        }

        .profile-photo {
            width: 45mm;
            height: 45mm;
            border-radius: 50%;
            overflow: hidden;
            border: 0.5mm solid #DDDDDD;
            margin: 0 auto 5mm auto;
            background-color: #FFFFFF;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Section Headings */
        .section-heading {
            font-size: 14pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 5mm;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
            border-bottom: 0.3mm solid #DDDDDD;
            padding-bottom: 2mm;
        }

        /* Left Column Sections */
        .left-section {
            margin-bottom: 8mm;
        }

        /* Education Items */
        .education-item {
            margin-bottom: 5mm;
        }

        .degree {
            font-weight: bold;
            margin-bottom: 1mm;
            font-size: 10pt;
        }

        .school {
            font-style: italic;
            margin-bottom: 1mm;
        }

        .education-date {
            font-size: 9pt;
            color: #666666;
        }

        .education-details {
            font-size: 8.5pt;
            margin-top: 1mm;
            color: #555555;
        }

        /* Expertise Section */
        .expertise-category {
            font-weight: bold;
            margin: 3mm 0 2mm 0;
            color: #555555;
        }

        .expertise-list {
            list-style-type: none;
            padding-left: 3mm;
            margin: 0;
        }

        .expertise-list li {
            position: relative;
            padding-left: 4mm;
            margin-bottom: 1.5mm;
            font-size: 9pt;
        }

        .expertise-list li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: {{ $primaryColor }};
            font-weight: bold;
        }

        /* Right Column */
        .right-section {
            margin-bottom: 8mm;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
            color: #333333;
            margin-bottom: 5mm;
            border-bottom: 0.3mm solid #DDDDDD;
            padding-bottom: 2mm;
        }

        /* About Me Section */
        .about-me {
            text-align: justify;
            margin-bottom: 8mm;
            line-height: 1.5;
        }

        /* Experience Items */
        .experience-item {
            margin-bottom: 6mm;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
        }

        .job-title {
            font-weight: bold;
            font-size: 10pt;
        }

        .job-date {
            color: #666666;
            font-size: 9pt;
        }

        .company {
            font-style: italic;
            margin-bottom: 2mm;
        }

        .job-description {
            text-align: justify;
        }

        .job-bullets {
            list-style-type: none;
            padding-left: 0;
            margin-top: 2mm;
        }

        .job-bullets li {
            position: relative;
            padding-left: 4mm;
            margin-bottom: 1.5mm;
        }

        .job-bullets li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: {{ $primaryColor }};
            font-weight: bold;
        }

        /* Contact Info */
        .contact-section {
            margin-top: 5mm;
        }

        .contact-info {
            display: flex;
            flex-wrap: wrap;
        }

        .contact-item {
            display: flex;
            align-items: center;
            width: 48%;
            margin-bottom: 2mm;
            font-size: 9pt;
        }

        .contact-icon {
            width: 5mm;
            height: 5mm;
            background-color: {{ $primaryColor }};
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 2mm;
            color: white;
            font-size: 8pt;
            font-weight: bold;
        }

        /* References Section */
        .references-section {
            margin-top: 8mm;
        }

        .references-container {
            display: flex;
            justify-content: space-between;
        }

        .reference {
            width: 48%;
        }

        .reference-name {
            font-weight: bold;
            margin-bottom: 1mm;
        }

        .reference-title {
            font-style: italic;
            margin-bottom: 1mm;
            font-size: 8.5pt;
        }

        .reference-contact {
            font-size: 8.5pt;
            color: #666666;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Bar --}}
    <div class="header-bar">
        <div class="header-accent"></div>
    </div>

    <div class="main-content">
        {{-- Left Column --}}
        <div class="left-column">
            {{-- Profile Photo --}}
            <div class="profile-section">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                    </div>
                @endif
            </div>

            {{-- Education Section (ID 1) --}}
            <div class="left-section">
                <div class="section-heading">
                    {{ $currentLocale === 'fr' ? 'ÉDUCATION' : 'EDUCATION' }}
                </div>

                @foreach($cvInformation['experiences'] ?? [] as $experience)
                    @if($experience['experience_categories_id'] == 1)
                        <div class="education-item">
                            <div class="degree">{{ $experience['name'] }}</div>
                            <div class="school">{{ $experience['InstitutionName'] }}</div>
                            <div class="education-date">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                @if($experience['date_end'])
                                    {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                @else
                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                @endif
                            </div>
                            @if($experience['description'])
                                <div class="education-details">
                                    {{ $experience['description'] }}
                                </div>
                            @endif
                        </div>
                    @endif
                @endforeach
            </div>

            {{-- Expertise/Skills Section --}}
            @if(!empty($cvInformation['competences']))
                <div class="left-section">
                    <div class="section-heading">
                        {{ $currentLocale === 'fr' ? 'EXPERTISE' : 'EXPERTISE' }}
                    </div>

                    @php
                        // Group skills by category if needed
                        $skillCategories = [
                            $currentLocale === 'fr' ? 'Professionnel' : 'Professional',
                            $currentLocale === 'fr' ? 'Technique' : 'Technical'
                        ];
                        $skillsByCategory = [];

                        // Distribute skills across categories
                        $i = 0;
                        foreach($cvInformation['competences'] as $skill) {
                            $category = $skillCategories[$i % count($skillCategories)];
                            if (!isset($skillsByCategory[$category])) {
                                $skillsByCategory[$category] = [];
                            }
                            $skillsByCategory[$category][] = $skill;
                            $i++;
                        }
                    @endphp

                    @foreach($skillsByCategory as $category => $skills)
                        <div class="expertise-category">{{ $category }}</div>
                        <ul class="expertise-list">
                            @foreach($skills as $skill)
                                <li>{{ $currentLocale === 'fr' ? $skill['name'] : $skill['name_en'] }}</li>
                            @endforeach
                        </ul>
                    @endforeach
                </div>
            @endif

            {{-- Languages Section --}}
            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <div class="left-section">
                    <div class="section-heading">
                        {{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}
                    </div>

                    <ul class="expertise-list">
                        @foreach($cvInformation['languages'] ?? [] as $language)
                            <li>
                                {{ $language['name'] ?? '' }}
                                @if(isset($language['level']))
                                    <span style="color: #666666;"> - {{ $language['level'] ?? '' }}</span>
                                @endif
                            </li>
                        @endforeach
                    </ul>
                </div>
            @endif

            {{-- Hobbies Section if space permits --}}
            @if(!empty($cvInformation['hobbies']))
                <div class="left-section">
                    <div class="section-heading">
                        {{ $currentLocale === 'fr' ? 'CENTRES D\'INTÉRÊT' : 'HOBBIES' }}
                    </div>

                    <ul class="expertise-list">
                        @foreach($cvInformation['hobbies'] as $hobby)
                            <li>{{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif
        </div>

        {{-- Right Column --}}
        <div class="right-column">
            {{-- Name and Title --}}
            <h1 style="font-size: 18pt; text-transform: uppercase; letter-spacing: 1mm; margin: 0 0 1mm 0; color: #333333; font-weight: bold;">
                {{ $cvInformation['personalInformation']['firstName'] }}
            </h1>
            <div style="font-size: 11pt; color: #666666; margin-bottom: 5mm; text-transform: uppercase; letter-spacing: 0.5mm;">
                {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
            </div>

            {{-- Contact Information --}}
            <div class="contact-section">
                <div class="contact-info">
                    @if($cvInformation['personalInformation']['email'])
                        <div class="contact-item">
                            <div class="contact-icon">✉</div>
                            {{ $cvInformation['personalInformation']['email'] }}
                        </div>
                    @endif
                    @if($cvInformation['personalInformation']['phone'])
                        <div class="contact-item">
                            <div class="contact-icon">☎</div>
                            {{ $cvInformation['personalInformation']['phone'] }}
                        </div>
                    @endif
                    @if($cvInformation['personalInformation']['linkedin'])
                        <div class="contact-item">
                            <div class="contact-icon">in</div>
                            {{ $cvInformation['personalInformation']['linkedin'] }}
                        </div>
                    @endif
                    @if($cvInformation['personalInformation']['address'])
                        <div class="contact-item">
                            <div class="contact-icon">⌂</div>
                            {{ $cvInformation['personalInformation']['address'] }}
                        </div>
                    @endif
                </div>
            </div>

            {{-- About Me / Summary --}}
            @if(!empty($cvInformation['summaries']))
                <div class="right-section">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'À PROPOS DE MOI' : 'ABOUT ME' }}</div>
                    <div class="about-me">
                        {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                    </div>
                </div>
            @endif

            {{-- Work Experience (ID 2) --}}
            <div class="right-section">
                <div class="section-title">
                    {{ $currentLocale === 'fr' ? 'EXPÉRIENCE PROFESSIONNELLE' : 'WORK EXPERIENCE' }}
                </div>

                @foreach($cvInformation['experiences'] ?? [] as $experience)
                    @if($experience['experience_categories_id'] == 2)
                        <div class="experience-item">
                            <div class="experience-header">
                                <div class="job-title">{{ $experience['name'] }}</div>
                                <div class="job-date">
                                    {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                    @if($experience['date_end'])
                                        {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                    @else
                                        {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                    @endif
                                </div>
                            </div>
                            <div class="company">{{ $experience['InstitutionName'] }}</div>
                            <div class="job-description">
                                {{ $experience['description'] }}

                                @if($experience['output'])
                                    <ul class="job-bullets">
                                        @php
                                            $bullets = explode("\n", $experience['output']);
                                        @endphp

                                        @foreach($bullets as $bullet)
                                            @if(trim($bullet) !== '')
                                                <li>{{ trim($bullet) }}</li>
                                            @endif
                                        @endforeach
                                    </ul>
                                @endif
                            </div>
                        </div>
                    @endif
                @endforeach
            </div>

            {{-- References Section (Placeholder) --}}
            <div class="references-section">
                <div class="section-title">{{ $currentLocale === 'fr' ? 'RÉFÉRENCES' : 'REFERENCES' }}</div>
                <div class="references-container">
                    <div class="reference">
                        <div class="reference-name">{{ $currentLocale === 'fr' ? 'Disponibles sur demande' : 'Available upon request' }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
@endsection
