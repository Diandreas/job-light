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
            $primaryColor = $cvInformation['primary_color'] ?? '#3498db';
            // Générer des variations de la couleur primaire
            $primaryColorRgb = sscanf($primaryColor, "#%02x%02x%02x");
            $lightColor = sprintf("#%02x%02x%02x",
                min(255, $primaryColorRgb[0] + 60),
                min(255, $primaryColorRgb[1] + 60),
                min(255, $primaryColorRgb[2] + 60)
            );
            $veryLightColor = sprintf("#%02x%02x%02x",
                min(255, $primaryColorRgb[0] + 100),
                min(255, $primaryColorRgb[1] + 100),
                min(255, $primaryColorRgb[2] + 100)
            );
        @endphp

        @page {
            margin: 5mm;
            padding: 0;
            size: A4;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: Arial, 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 10.5pt;
            color: #2c3e50;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
        }

        .cv-container {
            width: 170mm;
            margin: 0 auto;
            padding-top: 5mm;
            background: white;
        }

        .header-content {
            position: relative;
            min-height: 25mm;
            margin-bottom: 4mm;
            border-bottom: 0.4mm solid {{ $primaryColor }};
            padding-bottom: 3mm;
        }

        .profile-photo {
            position: absolute;
            top: 0;
            left: 0;
            width: 25mm;
            height: 25mm;
            border-radius: 50%;
            overflow: hidden;
            border: 0.3mm solid #e0e0e0;
            box-shadow: 0 1mm 2mm rgba(0,0,0,0.1);
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            margin-left: 30mm;
        }

        h1 {
            font-size: 16pt;
            color: #2c3e50;
            margin-bottom: 1.5mm;
            line-height: 1.1;
        }

        h2 {
            font-size: 12pt;
            color: {{ $primaryColor }};
            border-bottom: 0.2mm solid #e0e0e0;
            padding-bottom: 0.8mm;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.4mm;
        }

        h2.profession {
            font-size: 11pt;
            color: #7f8c8d;
            margin-bottom: 2mm;
            border: none;
            text-transform: none;
            letter-spacing: normal;
            font-weight: normal;
        }

        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 1.5mm;
        }

        .contact-item {
            display: inline-flex;
            align-items: center;
            font-size: 9pt;
            color: #34495e;
            margin-right: 3mm;
        }

        .contact-icon {
            margin-right: 1mm;
            color: {{ $primaryColor }};
            font-size: 9pt;
        }

        section {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }

        .experience-item {
            margin-bottom: 2.5mm;
            padding-bottom: 1.5mm;
            border-bottom: 0.1mm dotted #bdc3c7;
        }

        .experience-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        .experience-header table {
            width: 100%;
            border-collapse: collapse;
        }

        .title-company {
            width: 75%;
        }

        .title-company h3 {
            font-size: 11pt;
            color: #2c3e50;
            margin-bottom: 0.8mm;
        }

        .company {
            font-size: 10pt;
            font-style: italic;
            color: #7f8c8d;
        }

        .date {
            text-align: right;
            font-size: 9pt;
            color: {{ $primaryColor }};
            width: 25%;
            font-weight: bold;
        }

        .description {
            font-size: 9.5pt;
            line-height: 1.3;
            text-align: justify;
            margin: 1.5mm 0;
            color: #2c3e50;
        }

        .skills-list, .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 1.5mm;
        }

        .skill-item, .hobby-item {
            display: inline-block;
            background: #f8f9fa;
            padding: 1mm 2mm;
            border-radius: 1.5mm;
            font-size: 9pt;
            color: #2c3e50;
            border: 0.2mm solid #e0e0e0;
            margin-bottom: 1mm;
            margin-right: 1mm;
        }

        .professional-summary {
            background: #f8f9fa;
            padding: 2.5mm;
            border-radius: 1.5mm;
            margin-bottom: 4mm;
            font-size: 10pt;
            line-height: 1.3;
            border-left: 1mm solid {{ $primaryColor }};
        }

        /* Language section styling */
        .languages-section {
            margin-bottom: 3mm;
        }

        .language-items {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
        }

        .language-item {
            background-color: #f8f9fa;
            border: 0.2mm solid #e0e0e0;
            border-radius: 1.5mm;
            padding: 1mm 2mm;
            font-size: 9pt;
            color: #2c3e50;
            margin-bottom: 1mm;
            margin-right: 1mm;
            display: inline-block;
        }

        .language-level {
            color: {{ $primaryColor }};
            margin-left: 1mm;
            font-style: italic;
            font-weight: 600;
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
                padding-top: 5mm;
                box-shadow: none;
            }

            section {
                page-break-inside: avoid;
            }

            .page-break {
                page-break-before: always;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <x-cv-editable-css />
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
            <h1 @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="firstName" @endif>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
            <h2 class="profession" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="profession" @endif>
                {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
            </h2>
            <div class="contact-info">
                @if($cvInformation['personalInformation']['email'])
                    <span class="contact-item"><i class="fas fa-envelope contact-icon"></i> {{ $cvInformation['personalInformation']['email'] }}</span>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <span class="contact-item"><i class="fas fa-phone-alt contact-icon"></i> {{ $cvInformation['personalInformation']['phone'] }}</span>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <span class="contact-item"><i class="fas fa-map-marker-alt contact-icon"></i> {{ $cvInformation['personalInformation']['address'] }}</span>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <span class="contact-item"><i class="fab fa-linkedin-in contact-icon"></i> {{ $cvInformation['personalInformation']['linkedin'] }}</span>
                @endif
            </div>
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
        <section class="professional-summary">
            <h2>{{ $currentLocale === 'fr' ? 'Résumé Professionnel' : 'Professional Summary' }}</h2>
            <p class="description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="summary" data-id="{{ $cvInformation['summaries'][0]['id'] ?? 0 }}" data-field="description" @endif>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
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
                                    <h3 @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="name" @endif>{{ $experience['name'] }}</h3>
                                    <div class="company" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="InstitutionName" @endif>{{ $experience['InstitutionName'] }}</div>
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
                    <p class="description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="description" @endif>{{ $experience['description'] }}</p>
                    @if($experience['output'])
                        <p class="description">{{ $experience['output'] }}</p>
                    @endif
                </div>
            @endforeach
        </section>
    @endforeach

    @if(!empty($cvInformation['certifications']) && count($cvInformation['certifications']) > 0)
        <section class="experience-section">
            <h2>{{ $currentLocale === 'fr' ? 'Certifications' : 'Certifications' }}</h2>
            @foreach($cvInformation['certifications'] as $certification)
                <div class="experience-item">
                    <div class="experience-header">
                        <table>
                            <tr>
                                <td class="title-company">
                                    <h3 @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="certification" data-id="{{ $certification['id'] }}" data-field="name" @endif>{{ $certification['name'] }}</h3>
                                    <div class="company" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="certification" data-id="{{ $certification['id'] }}" data-field="institution" @endif>{{ $certification['institution'] }}</div>
                                </td>
                                <td class="date">
                                    {{ \Carbon\Carbon::parse($certification['date_obtained'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                </td>
                            </tr>
                        </table>
                    </div>
                     @if($certification['description'])
                        <p class="description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="certification" data-id="{{ $certification['id'] }}" data-field="description" @endif>{{ $certification['description'] }}</p>
                    @endif
                    @if(isset($certification['link']) && $certification['link'])
                        <p class="description" style="margin-top: 4px;">
                            <a href="{{ $certification['link'] }}" target="_blank" style="color: {{ $cvInformation['primary_color'] ?? '#2c3e50' }}; text-decoration: underline;">
                                {{ $currentLocale === 'fr' ? 'Lien vers le certificat' : 'Link to certificate' }}
                            </a>
                        </p>
                    @endif
                </div>
            @endforeach
        </section>
    @endif

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

    @if(!empty($cvInformation['languages']))
        <section class="languages-section">
            <h2>{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</h2>
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
        </section>
    @endif
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
