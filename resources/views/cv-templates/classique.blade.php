@extends('layouts.cv')

@section('content')
    <!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page { margin: 8mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.15;
            font-size: 9pt;
            color: #333;
        }

        .cv-container {
            width: 190mm;
            margin: 0 auto;
            padding: 8mm;
            background: white;
        }

        .header-content {
            position: relative;
            min-height: 22mm;
            margin-bottom: 2mm;
            border-bottom: 0.3mm solid #2c3e50;
            padding-bottom: 1mm;
        }

        .profile-photo {
            position: absolute;
            top: 0;
            left: 0;
            width: 22mm;
            height: 22mm;
            border-radius: 50%;
            overflow: hidden;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            margin-left: 26mm;
        }

        h1 {
            font-size: 13pt;
            color: #2c3e50;
            margin-bottom: 0.5mm;
            line-height: 1.1;
        }

        h2 {
            font-size: 10pt;
            color: #2c3e50;
            border-bottom: 0.2mm solid #bdc3c7;
            padding-bottom: 0.5mm;
            margin-bottom: 1.5mm;
        }

        h2.profession {
            font-size: 10pt;
            color: #34495e;
            margin-bottom: 1mm;
            border: none;
        }

        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 1mm;
        }

        .contact-item {
            display: inline-flex;
            align-items: center;
            font-size: 8pt;
            color: #34495e;
            margin-right: 2mm;
        }

        section { margin-bottom: 3mm; }

        .experience-item {
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 0.2mm dotted #bdc3c7;
        }

        .experience-header table {
            width: 100%;
            border-collapse: collapse;
        }

        .title-company {
            width: 80%;
        }

        .title-company h3 {
            font-size: 9pt;
            color: #34495e;
            margin-bottom: 0.3mm;
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
            width: 20%;
        }

        .description {
            font-size: 8pt;
            line-height: 1.3;
            text-align: justify;
            margin: 1mm 0;
            color: #444;
        }

        .skills-list, .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1mm;
            margin-top: 1mm;
        }

        .skill-item, .hobby-item {
            display: inline-block;
            background: #f5f5f5;
            padding: 0.8mm 1.5mm;
            border-radius: 0.8mm;
            font-size: 8pt;
            color: #444;
            border: 0.2mm solid #e0e0e0;
        }

        .professional-summary {
            background: #f8f9fa;
            padding: 1.5mm;
            border-radius: 0.8mm;
            margin-bottom: 3mm;
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
            }
            section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
<div class="cv-container">
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

    @if(!empty($cvInformation['summaries']))
        <section class="professional-summary">
            <h2>{{ $currentLocale === 'fr' ? 'Résumé Professionnel' : 'Professional Summary' }}</h2>
            <p class="description">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
        </section>
    @endif

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
