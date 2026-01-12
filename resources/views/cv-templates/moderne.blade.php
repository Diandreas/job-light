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
            $primaryColor = $cvInformation['primary_color'] ?? '#1ABC9C';
            // Générer des variations de la couleur primaire
            $primaryColorRgb = sscanf($primaryColor, "#%02x%02x%02x");
            $lightColor = sprintf("#%02x%02x%02x",
                min(255, $primaryColorRgb[0] + 30),
                min(255, $primaryColorRgb[1] + 30),
                min(255, $primaryColorRgb[2] + 30)
            );
            $veryLightColor = sprintf("#%02x%02x%02x",
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
            line-height: 1.1;
            font-size: 10.5pt;
            color: #2C3E50;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .cv-container {
            width: 180mm;
            padding: 0;
        }

        /* Tables Reset */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            vertical-align: top;
            padding: 0;
        }

        /* Header Styling */
        .header-table {
            margin-bottom: 6mm;
        }

        .profile-td {
            width: 65%;
            padding-right: 4mm;
        }

        .contact-td {
            background-color: #F8F9FA;
            padding: 2.5mm;
            border-radius: 2mm;
        }

        .photo-td {
            width: 28mm;
            padding-left: 2mm;
        }

        .name {
            font-size: 15pt;
            font-weight: 700;
            color: {{ $primaryColor }};
            margin-bottom: 1.5mm;
            letter-spacing: -0.5pt;
        }

        .profession {
            font-size: 11pt;
            color: #34495E;
            margin-bottom: 2mm;
        }

        .contact-item {
            font-size: 9.5pt;
            margin-bottom: 1.5mm;
            color: #7F8C8D;
            white-space: nowrap;
        }

        .contact-icon {
            color: {{ $primaryColor }};
            margin-right: 1mm;
        }

        /* Photo Styling */
        .photo-container {
            width: 28mm;
            height: 28mm;
            overflow: hidden;
            border-radius: 2mm;
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
            font-size: 13pt;
            font-weight: bold;
            color: {{ $primaryColor }};
            text-transform: uppercase;
            margin-bottom: 2.5mm;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #E8EAED;
        }

        /* Summary Section */
        .summary {
            font-size: 10.5pt;
            color: #34495E;
            line-height: 1.1;
            text-align: justify;
            margin-bottom: 4mm;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 3mm;
            page-break-inside: avoid;
        }

        .date-td {
            width: 18mm;
            padding-right: 2.5mm;
        }

        .date-box {
            background-color: #F8F9FA;
            border-left: 0.5mm solid {{ $primaryColor }};
            padding: 1.5mm;
            font-size: 9.5pt;
            color: #7F8C8D;
            text-align: left;
            line-height: 1.1;
        }

        .duration {
            font-size: 7pt;
            color: #95A5A6;
            margin-top: 0.5mm;
        }

        .company-td {
            width: 33mm;
            padding-right: 2.5mm;
        }

        .company-name {
            color: {{ $primaryColor }};
            font-weight: 600;
            font-size: 10.5pt;
            line-height: 1.1;
        }

        .content-td {
            padding-right: 1.5mm;
        }

        .experience-title {
            font-weight: bold;
            color: #2C3E50;
            margin-bottom: 1mm;
            font-size: 11pt;
        }

        .experience-description {
            font-size: 10pt;
            color: #34495E;
            text-align: justify;
            line-height: 1.1;
        }

        /* Skills and Hobbies */
        .skills-hobbies-table {
            width: 100%;
        }

        .skills-td {
            width: 50%;
            padding-right: 2.5mm;
        }

        .hobbies-td {
            width: 50%;
            padding-left: 2.5mm;
        }

        .skill-item, .hobby-item {
            display: inline-block;
            background-color: #F8F9FA;
            padding: 1mm 2mm;
            margin: 0 1mm 1mm 0;
            border-radius: 1mm;
            font-size: 9.5pt;
            color: #34495E;
        }

        .skill-item:before, .hobby-item:before {
            content: "•";
            color: {{ $primaryColor }};
            margin-right: 1mm;
        }

        /* Language Section Styling */
        .language-section {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 0.2mm solid #E0E0E0;
        }

        .language-title {
            color: {{ $primaryColor }};
            font-weight: 600;
            font-size: 13pt;
            margin-bottom: 1.5mm;
            text-transform: uppercase;
            letter-spacing: 0.3mm;
        }

        .language-item {
            font-size: 9.5pt;
            color: #7F8C8D;
            margin-bottom: 1mm;
            padding: 0.8mm 0;
            display: flex;
            justify-content: space-between;
            border-bottom: 0.1mm dotted #E0E0E0;
        }

        .language-level {
            color: {{ $primaryColor }};
            font-weight: 600;
        }
    </style>
    <x-cv-editable-css />
</head>
<body>
<div class="cv-container">
    <!-- Header Section -->
    <table class="header-table">
        <tr>
            <td class="profile-td">
                <div class="name" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="firstName" @endif>{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="profession" @endif>
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </td>
            <td class="contact-td">
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-item">
                        <span class="contact-icon">✉</span> {{ $cvInformation['personalInformation']['email'] }}
                    </div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-item">
                        <span class="contact-icon">☎</span> {{ $cvInformation['personalInformation']['phone'] }}
                    </div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <div class="contact-item">
                        <span class="contact-icon">⌂</span> {{ $cvInformation['personalInformation']['address'] }}
                    </div>
                @endif

                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <div class="language-section">
                        <div class="language-title">{{ __('Languages') }}</div>
                        @foreach($cvInformation['languages'] ?? [] as $language)
                            <div class="language-item">
                                <span>{{ $language['name'] ?? '' }}</span>
                                @if(isset($language['level']))
                                    <span class="language-level">{{ $language['level'] ?? '' }}</span>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">
                        <span class="contact-icon">∞</span> {{ $cvInformation['personalInformation']['linkedin'] }}
                    </div>
                @endif
            </td>
            @if($cvInformation['personalInformation']['photo'])
                <td class="photo-td">
                    <div class="photo-container">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="Profile">
                    </div>
                </td>
            @endif
        </tr>
    </table>

    <!-- Summary Section -->
    @if(!empty($cvInformation['summaries']))
        <div class="section">
            <div class="summary" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="summary" data-id="{{ $cvInformation['summaries'][0]['id'] ?? 0 }}" data-field="description" @endif>
                {{ $cvInformation['summaries'][0]['description'] ?? '' }}
            </div>
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
            @foreach($experiences as $experience)
                <table class="experience-table">
                    <tr>
                        <td class="date-td">
                            <div class="date-box">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                -
                                @if($experience['date_end'])
                                    {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                @else
                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}

                                @endif
                            </div>
                        </td>
                        <td class="company-td">
                            <div class="company-name" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="InstitutionName" @endif>{{ $experience['InstitutionName'] }}</div>
                        </td>
                        <td class="content-td">
                            <div class="experience-title" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="name" @endif>{{ $experience['name'] }}</div>
                            <div class="experience-description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="description" @endif>
                                {{ $experience['description'] }}
                                @if($experience['output'])
                                    <br>{{ $experience['output'] }}
                                @endif
                            </div>
                        </td>
                    </tr>
                </table>
            @endforeach
        </div>
    @endforeach

    <!-- Certifications Section -->
    @if(!empty($cvInformation['certifications']) && count($cvInformation['certifications']) > 0)
        <div class="section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Certifications' : 'Certifications' }}</div>
            @foreach($cvInformation['certifications'] as $certification)
                <table class="experience-table">
                    <tr>
                        <td class="date-td">
                            <div class="date-box">
                                {{ \Carbon\Carbon::parse($certification['date_obtained'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                            </div>
                        </td>
                        <td class="company-td">
                            <div class="company-name" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="certification" data-id="{{ $certification['id'] }}" data-field="institution" @endif>{{ $certification['institution'] }}</div>
                        </td>
                        <td class="content-td">
                            <div class="experience-title" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="certification" data-id="{{ $certification['id'] }}" data-field="name" @endif>{{ $certification['name'] }}</div>
                            @if($certification['description'])
                                <div class="experience-description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="certification" data-id="{{ $certification['id'] }}" data-field="description" @endif>{{ $certification['description'] }}</div>
                            @endif
                            @if(isset($certification['link']) && $certification['link'])
                                <div class="experience-description" style="margin-top: 4px;">
                                    <a href="{{ $certification['link'] }}" target="_blank" style="color: {{ $cvInformation['primary_color'] ?? '#3498db' }}; text-decoration: underline; font-size: 0.9em;">
                                        {{ $currentLocale === 'fr' ? 'Voir le certificat' : 'View Certificate' }}
                                    </a>
                                </div>
                            @endif
                        </td>
                    </tr>
                </table>
            @endforeach
        </div>
    @endif

    <!-- Skills and Hobbies -->
    <table class="skills-hobbies-table">
        <tr>
            @if(!empty($cvInformation['competences']))
                <td class="skills-td">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                    @foreach($cvInformation['competences'] as $competence)
                        <span class="skill-item">{{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}</span>
                    @endforeach
                </td>
            @endif

            @if(!empty($cvInformation['hobbies']))
                <td class="hobbies-td">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <span class="hobby-item">{{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}</span>
                    @endforeach
                </td>
            @endif
        </tr>
    </table>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
