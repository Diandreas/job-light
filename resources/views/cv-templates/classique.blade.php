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
            size: A4;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 9pt;
            color: #333;
            background-color: white;
        }

        .cv-container {
            width: 190mm;
            margin: 0 auto;
            padding: 10mm;
            position: relative;
            background: white;
        }

        .header-content {
            position: relative;
            min-height: 25mm;
            margin-bottom: 3mm;
            border-bottom: 0.3mm solid #2c3e50;
            padding-bottom: 2mm;
        }

        .profile-photo {
            position: absolute;
            top: 0;
            left: 0;
            width: 25mm;
            height: 25mm;
            border-radius: 50%;
            overflow: hidden;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            margin-left: 30mm;
            padding-top: 1mm;
        }

        h1 {
            font-size: 14pt;
            color: #2c3e50;
            margin-bottom: 1mm;
            line-height: 1.2;
            font-weight: bold;
        }

        h2.profession {
            font-size: 11pt;
            color: #34495e;
            margin-bottom: 2mm;
            border: none;
            font-weight: normal;
        }

        .contact-info {
            width: 100%;
            margin-top: 2mm;
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }

        .contact-item {
            display: inline-flex;
            align-items: center;
            font-size: 8pt;
            color: #34495e;
            margin-right: 3mm;
        }

        section {
            margin-bottom: 4mm;
            clear: both;
        }

        h2 {
            font-size: 11pt;
            color: #2c3e50;
            border-bottom: 0.2mm solid #bdc3c7;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
            font-weight: bold;
        }

        .experience-item {
            margin-bottom: 3mm;
            padding-bottom: 2mm;
            border-bottom: 0.2mm dotted #bdc3c7;
        }

        .experience-item:last-child {
            border-bottom: none;
        }

        .experience-header {
            width: 100%;
            margin-bottom: 1mm;
        }

        .experience-header table {
            width: 100%;
            border-collapse: collapse;
        }

        .experience-header td {
            vertical-align: top;
        }

        .title-company {
            width: 75%;
        }

        .title-company h3 {
            font-size: 9pt;
            color: #34495e;
            margin-bottom: 0.5mm;
            font-weight: bold;
        }

        .company {
            font-size: 8pt;
            font-style: italic;
            color: #34495e;
        }

        .date {
            text-align: right;
            font-size: 8pt;
            color: #666;
            width: 25%;
        }

        .description {
            font-size: 8pt;
            line-height: 1.4;
            text-align: justify;
            margin: 1.5mm 0;
            color: #444;
        }

        .skills-list, .hobbies-list {
            margin-top: 2mm;
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
        }

        .skill-item, .hobby-item {
            display: inline-block;
            background: #f5f5f5;
            padding: 1mm 2mm;
            border-radius: 1mm;
            font-size: 8pt;
            color: #444;
            border: 0.2mm solid #e0e0e0;
        }

        .professional-summary {
            background: #f8f9fa;
            padding: 2mm;
            border-radius: 1mm;
            margin-bottom: 4mm;
        }

        .professional-summary .description {
            font-style: italic;
            color: #2c3e50;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
            }

            .cv-container {
                margin: 0 auto;
                box-shadow: none;
                width: 190mm;
            }

            section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Section --}}
    <div class="header-content">
        @if($cvInformation['personalInformation']['photo'])
            <div class="profile-photo">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                     alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
            </div>
        @endif
        <div class="header-text">
            <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
            <h2 class="profession">
                {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
            </h2>
            <div class="contact-info">
                @if($cvInformation['personalInformation']['email'])
                    <span class="contact-item">📧 {{ $cvInformation['personalInformation']['email'] }}</span>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <span class="contact-item">📱 {{ $cvInformation['personalInformation']['phone'] }}</span>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <span class="contact-item">📍 {{ $cvInformation['personalInformation']['address'] }}</span>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <span class="contact-item">🔗 {{ $cvInformation['personalInformation']['linkedin'] }}</span>
                @endif
            </div>
        </div>
    </div>

    {{-- Professional Summary Section --}}
    @if(!empty($cvInformation['summaries']))
        <section class="professional-summary">
            <h2>{{ $currentLocale === 'fr' ? 'Résumé Professionnel' : 'Professional Summary' }}</h2>
            <p class="description">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
        </section>
    @endif

    {{-- Experience Sections By Category --}}
    @foreach($experiencesByCategory as $category => $experiences)
        <section class="experience-section">
            <h2>
                @if($currentLocale === 'fr')
                    {{ $category }}
                @else
                    {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                @endif
            </h2>
            @foreach($experiences as $experience)
                <div class="experience-item">
                    <div class="experience-header">
                        <table>
                            <tr>
                                <td class="title-company">
                                    <h3>{{ $experience['name'] }}</h3>
                                    <div class="company">{{ $experience['InstitutionName'] }}</div>
                                </td>
                                <td class="date">
                                    {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                    @if($experience['date_end'])
                                        {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                    @else
                                        {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </div>
                    <p class="description">{{ $experience['description'] }}</p>
                    @if($experience['output'])
                        <p class="description">{{ $experience['output'] }}</p>
                    @endif
                </div>
            @endforeach
        </section>
    @endforeach

    {{-- Skills Section --}}
    @if(!empty($cvInformation['competences']))
        <section class="skills-section">
            <h2>{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</h2>
            <div class="skills-list">
                @foreach($cvInformation['competences'] as $competence)
                    <span class="skill-item">
                        {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                    </span>
                @endforeach
            </div>
        </section>
    @endif

    {{-- Hobbies Section --}}
    @if(!empty($cvInformation['hobbies']))
        <section class="hobbies-section">
            <h2>{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies & Interests' }}</h2>
            <div class="hobbies-list">
                @foreach($cvInformation['hobbies'] as $hobby)
                    <span class="hobby-item">
                        {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                    </span>
                @endforeach
            </div>
        </section>
    @endif
</div>
</body>
</html>
@endsection
