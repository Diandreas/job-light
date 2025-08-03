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
            $primaryColor = $cvInformation['primary_color'] ?? '#333333';
            // Générer des variations de la couleur primaire
            $primaryColorRgb = sscanf($primaryColor, "#%02x%02x%02x");
            $lightColor = sprintf("#%02x%02x%02x",
                min(255, $primaryColorRgb[0] + 60),
                min(255, $primaryColorRgb[1] + 60),
                min(255, $primaryColorRgb[2] + 60)
            );
        @endphp

        @page {
            margin: 15mm;
            padding: 0;
            size: A4;
        }

        body {
            font-family: Arial, 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 10pt;
            color: {{ $primaryColor }};
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .cv-container {
            width: 170mm;
            padding: 0;
        }

        /* En-tête */
        .header {
            width: 100%;
            border-bottom: 0.2mm solid {{ $primaryColor }};
            padding-bottom: 3mm;
            margin-bottom: 4mm;
        }

        .header-left {
            width: 70%;
        }

        .name {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 1.5mm;
        }

        .profession {
            font-size: 11pt;
            color: #666666;
            margin-bottom: 1.5mm;
        }

        .contact-info {
            font-size: 9pt;
            color: #666666;
        }

        .contact-table td {
            padding-right: 3mm;
            font-size: 9pt;
        }

        /* Profil Photo */
        .photo-cell {
            width: 25mm;
            text-align: right;
        }

        .profile-photo {
            width: 25mm;
            height: 25mm;
            border-radius: 50%;
            overflow: hidden;
            border: 0.3mm solid {{ $primaryColor }};
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Language Section Styling */
        .language-section {
            margin-top: 3mm;
            margin-bottom: 3mm;
            padding: 2mm;
            background-color: #F8F9FA;
            border-radius: 1.5mm;
            border-left: 1.5mm solid {{ $primaryColor }};
        }

        .language-title {
            color: {{ $primaryColor }};
            font-size: 11pt;
            font-weight: bold;
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
            margin-bottom: 0;
            font-size: 9pt;
            color: {{ $primaryColor }};
            background-color: #ffffff;
            padding: 0.8mm 1.5mm;
            border-radius: 1mm;
            border: 0.1mm solid #e5e5e5;
        }

        .language-level {
            color: #666666;
            font-weight: 600;
            margin-left: 1mm;
        }

        /* Timeline */
        .timeline-container {
            position: relative;
            padding-left: 20mm;
        }

        .timeline-marker {
            position: absolute;
            left: 0;
            width: 15mm;
            font-size: 8pt;
            text-align: right;
            padding-right: 3mm;
            color: #666666;
        }

        .timeline-content {
            position: relative;
            border-left: 0.3mm solid {{ $primaryColor }};
            padding-left: 3mm;
            padding-bottom: 3mm;
        }

        .timeline-dot {
            position: absolute;
            left: -1.2mm;
            top: 1mm;
            width: 2mm;
            height: 2mm;
            background-color: {{ $primaryColor }};
            border-radius: 50%;
        }

        /* Sections */
        .section {
            margin-bottom: 4mm;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 3mm;
            color: {{ $primaryColor }};
            text-transform: uppercase;
        }

        .experience-title {
            font-weight: bold;
            font-size: 11pt;
            margin-bottom: 0.8mm;
        }

        .company {
            font-style: italic;
            color: #666666;
            margin-bottom: 0.8mm;
            font-size: 10pt;
        }

        .description {
            text-align: justify;
            margin-bottom: 1.5mm;
            line-height: 1.2;
            font-size: 9.5pt;
        }

        /* Compétences et Centres d'intérêt */
        .bottom-section {
            margin-top: 4mm;
            padding-top: 3mm;
            border-top: 0.2mm solid {{ $primaryColor }};
        }

        .skills-hobbies-container {
            width: 100%;
        }

        .skills-column {
            width: 50%;
            padding-right: 3mm;
            vertical-align: top;
        }

        .hobbies-column {
            width: 50%;
            padding-left: 3mm;
            vertical-align: top;
        }

        .skill-item, .hobby-item {
            margin-bottom: 0.8mm;
            padding-left: 2.5mm;
            position: relative;
            font-size: 9.5pt;
        }

        .skill-item:before, .hobby-item:before {
            content: "•";
            position: absolute;
            left: 0;
        }

        /* Résumé */
        .summary {
            background-color: #f8f8f8;
            padding: 2.5mm;
            margin-bottom: 4mm;
            border-left: 1mm solid {{ $primaryColor }};
            text-align: justify;
            font-size: 9.5pt;
            line-height: 1.2;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- En-tête --}}
    <table class="header">
        <tr>
            <td class="header-left">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
                <table class="contact-table">
                    <tr>
                        @if($cvInformation['personalInformation']['email'])
                            <td>✉ {{ $cvInformation['personalInformation']['email'] }}</td>
                        @endif
                        @if($cvInformation['personalInformation']['phone'])
                            <td>☎ {{ $cvInformation['personalInformation']['phone'] }}</td>
                        @endif
                    </tr>
                    <tr>
                        @if($cvInformation['personalInformation']['address'])
                            <td>⌂ {{ $cvInformation['personalInformation']['address'] }}</td>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <td>∞ {{ $cvInformation['personalInformation']['linkedin'] }}</td>
                        @endif
                    </tr>
                </table>
            </td>
            <td class="photo-cell">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                    </div>
                @endif
            </td>
        </tr>
    </table>

    {{-- Résumé --}}
    @if(!empty($cvInformation['summaries']))
        <div class="summary">
            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
        </div>
    @endif

    {{-- Expériences par catégorie --}}
    @foreach($experiencesByCategory as $category => $experiences)
        <div class="section">
            <div class="section-title">
                @if($currentLocale === 'fr')
                    {{ $category }}
                @else
                    {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                @endif
            </div>

            <div class="timeline-container">
                @foreach($experiences as $experience)
                    <div class="timeline-marker">
                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-dot"></div>
                        <div class="experience-title">{{ $experience['name'] }}</div>
                        <div class="company">{{ $experience['InstitutionName'] }}</div>
                        <div class="description">
                            {{ $experience['description'] }}
                            @if($experience['output'])
                                <br>{{ $experience['output'] }}
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach

    {{-- Compétences, Langues et Centres d'intérêt --}}
    <div class="bottom-section">
        <table class="skills-hobbies-container">
            <tr>
                @if(!empty($cvInformation['competences']))
                    <td class="skills-column">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                        @foreach($cvInformation['competences'] as $competence)
                            <div class="skill-item">
                                {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                            </div>
                        @endforeach
                    </td>
                @endif

                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <td class="skills-column">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                        @foreach($cvInformation['languages'] ?? [] as $language)
                            <div class="skill-item">
                                {{ $language['name'] ?? '' }}
                                @if(isset($language['level']))
                                    <span class="language-level">- {{ $language['level'] ?? '' }}</span>
                                @endif
                            </div>
                        @endforeach
                    </td>
                @endif

                @if(!empty($cvInformation['hobbies']))
                    <td class="hobbies-column">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                        @foreach($cvInformation['hobbies'] as $hobby)
                            <div class="hobby-item">
                                {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                            </div>
                        @endforeach
                    </td>
                @endif
            </tr>
        </table>
    </div>
</div>
</body>
</html>
@endsection
