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
            color: #2d3748;
            background: #fff;
        }

        .cv-container {
            width: 190mm;
            margin: 0 auto;
            padding: 8mm;
            background: white;
        }

        /* Header moderne avec accent de couleur */
        .header-content {
            position: relative;
            min-height: 24mm;
            margin-bottom: 3mm;
            background: #4299e1;
            border-radius: 3mm;
            padding: 3mm;
            color: white;
        }

        .profile-photo {
            position: absolute;
            top: 3mm;
            left: 3mm;
            width: 22mm;
            height: 22mm;
            border-radius: 2mm;
            overflow: hidden;
            border: 0.4mm solid rgba(255, 255, 255, 0.3);
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
            font-size: 14pt;
            color: white;
            margin-bottom: 1mm;
            line-height: 1.1;
        }

        h2.profession {
            font-size: 10pt;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2mm;
            font-weight: normal;
        }

        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
            margin-top: 2mm;
        }

        .contact-item {
            display: inline-flex;
            align-items: center;
            font-size: 8pt;
            color: white;
            background: rgba(255, 255, 255, 0.1);
            padding: 0.8mm 1.5mm;
            border-radius: 1mm;
        }

        /* Sections avec style moderne */
        section {
            margin-bottom: 3mm;
            background: white;
        }

        h2 {
            font-size: 11pt;
            color: #4299e1;
            margin-bottom: 2mm;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #e2e8f0;
        }

        .experience-item {
            margin-bottom: 2.5mm;
            padding: 2mm;
            border-radius: 1.5mm;
            background: #f7fafc;
        }

        .experience-header table {
            width: 100%;
            border-collapse: collapse;
        }

        .title-company {
            width: 75%;
        }

        .title-company h3 {
            font-size: 9.5pt;
            color: #2d3748;
            margin-bottom: 0.5mm;
            font-weight: bold;
        }

        .company {
            font-size: 8pt;
            color: #4a5568;
        }

        .date {
            text-align: right;
            font-size: 8pt;
            color: #4299e1;
            width: 25%;
            font-weight: 500;
        }

        .description {
            font-size: 8pt;
            line-height: 1.3;
            color: #4a5568;
            margin-top: 1mm;
        }

        /* Skills et Hobbies avec style moderne */
        .skills-list, .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2mm;
            margin-top: 2mm;
        }

        .skill-item {
            display: inline-block;
            background: #ebf8ff;
            padding: 1mm 2mm;
            border-radius: 1mm;
            font-size: 8pt;
            color: #4299e1;
            border: 0.2mm solid #bee3f8;
        }

        .hobby-item {
            display: inline-block;
            background: #f0fff4;
            padding: 1mm 2mm;
            border-radius: 1mm;
            font-size: 8pt;
            color: #38a169;
            border: 0.2mm solid #c6f6d5;
        }

        .professional-summary {
            background: #ebf8ff;
            padding: 2.5mm;
            border-radius: 2mm;
            margin-bottom: 3mm;
            border-left: 1mm solid #4299e1;
        }

        .professional-summary .description {
            color: #2c5282;
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
