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
            font-size: 8.5pt;
            color: #333333;
            margin: 0;
            padding: 0;
        }

        .cv-container {
            width: 190mm;
            padding: 10mm;
        }

        /* En-tête */
        .header {
            width: 100%;
            border-bottom: 0.2mm solid #333333;
            padding-bottom: 4mm;
            margin-bottom: 6mm;
        }

        .header-left {
            width: 70%;
        }

        .name {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 2mm;
        }

        .profession {
            font-size: 10pt;
            color: #666666;
            margin-bottom: 2mm;
        }

        .contact-info {
            font-size: 8pt;
            color: #666666;
        }

        .contact-table td {
            padding-right: 4mm;
        }

        /* Profil Photo */
        .photo-cell {
            width: 30mm;
            text-align: right;
        }
        .photo-cell {
            width: 30mm;
            text-align: right;
        }

        .profile-photo {
            width: 30mm;
            height: 30mm;
            border-radius: 50%;
            overflow: hidden;
            border: 0.3mm solid #333333;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .profile-photo {
            width: 30mm;
            height: 30mm;
            border: 0.2mm solid #333333;
        }


        /* Timeline */
        .timeline-container {
            position: relative;
            padding-left: 25mm;
        }

        .timeline-marker {
            position: absolute;
            left: 0;
            width: 20mm;
            font-size: 8pt;
            text-align: right;
            padding-right: 4mm;
            color: #666666;
        }

        .timeline-content {
            position: relative;
            border-left: 0.3mm solid #333333;
            padding-left: 4mm;
            padding-bottom: 4mm;
        }

        .timeline-dot {
            position: absolute;
            left: -1.5mm;
            top: 1mm;
            width: 2.5mm;
            height: 2.5mm;
            background-color: #333333;
            border-radius: 50%;
        }

        /* Sections */
        .section {
            margin-bottom: 6mm;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 4mm;
            color: #333333;
            text-transform: uppercase;
        }

        .experience-title {
            font-weight: bold;
            font-size: 9pt;
            margin-bottom: 1mm;
        }

        .company {
            font-style: italic;
            color: #666666;
            margin-bottom: 1mm;
        }

        .description {
            text-align: justify;
            margin-bottom: 2mm;
            line-height: 1.3;
        }

        /* Compétences et Centres d'intérêt */
        .bottom-section {
            margin-top: 6mm;
            padding-top: 4mm;
            border-top: 0.2mm solid #333333;
        }

        .skills-hobbies-container {
            width: 100%;
        }

        .skills-column {
            width: 50%;
            padding-right: 4mm;
            vertical-align: top;
        }

        .hobbies-column {
            width: 50%;
            padding-left: 4mm;
            vertical-align: top;
        }

        .skill-item, .hobby-item {
            margin-bottom: 1mm;
            padding-left: 3mm;
            position: relative;
        }

        .skill-item:before, .hobby-item:before {
            content: "•";
            position: absolute;
            left: 0;
        }

        /* Résumé */
        .summary {
            background-color: #f8f8f8;
            padding: 3mm;
            margin-bottom: 6mm;
            border-left: 1mm solid #333333;
            text-align: justify;
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

    {{-- Compétences et Centres d'intérêt --}}
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
