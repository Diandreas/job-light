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
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.3;
            font-size: 9pt;
            color: #2E2E2E;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .cv-container {
            width: 170mm;
            padding: 5mm;
            background-color: #FFFFFF;
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
            width: 100%;
            margin-bottom: 10mm;
        }

        .header-left-cell {
            width: 70%;
        }

        .header-right-cell {
            width: 30%;
            text-align: right;
        }

        .name {
            font-size: 20pt;
            font-weight: 300;
            color: #2E2E2E;
            margin-bottom: 3mm;
            letter-spacing: 0.5pt;
        }

        .profession {
            font-size: 11pt;
            color: #777777;
            letter-spacing: 0.3pt;
            font-weight: 300;
            margin-bottom: 5mm;
        }

        .contact-item {
            font-size: 8pt;
            margin-bottom: 2mm;
            color: #777777;
        }

        /* Photo Styling */
        .photo-container {
            width: 35mm;
            height: 35mm;
            overflow: hidden;
            border-radius: 1mm;
            margin-left: auto;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Section Styling */
        .section {
            margin-bottom: 8mm;
        }

        .section-title {
            font-size: 11pt;
            font-weight: 600;
            color: #2E2E2E;
            margin-bottom: 4mm;
            letter-spacing: 0.5pt;
            text-transform: uppercase;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #2E2E2E;
            line-height: 1.5;
            margin-bottom: 6mm;
            padding: 4mm;
            background-color: #F8F8F8;
            border-radius: 1mm;
        }

        /* Experience Styling */
        .experience-item {
            margin-bottom: 5mm;
        }

        .experience-table {
            width: 100%;
        }

        .experience-date-cell {
            width: 25%;
            padding-right: 4mm;
        }

        .experience-date {
            font-size: 9pt;
            color: #777777;
        }

        .experience-content-cell {
            width: 75%;
        }

        .experience-title {
            font-size: 10pt;
            font-weight: 600;
            color: #2E2E2E;
            margin-bottom: 1mm;
        }

        .experience-company {
            font-size: 9pt;
            color: #555555;
            margin-bottom: 2mm;
        }

        .experience-description {
            font-size: 8.5pt;
            color: #555555;
            line-height: 1.4;
        }

        /* Skills and Languages Layout */
        .two-column-table {
            width: 100%;
            margin-bottom: 6mm;
        }

        .col-left-cell {
            width: 48%;
            padding-right: 2%;
        }

        .col-right-cell {
            width: 48%;
            padding-left: 2%;
        }

        /* Skills Styling */
        .skills-container {
            width: 100%;
        }

        .skill-item {
            font-size: 8pt;
            color: #2E2E2E;
            background-color: #F8F8F8;
            padding: 1.5mm 3mm;
            border-radius: 4mm;
            margin-bottom: 2mm;
            margin-right: 2mm;
            display: inline-block;
        }

        /* Language Section */
        .language-table {
            width: 100%;
        }
        
        .language-row {
            border-bottom: 0.1mm solid #EEEEEE;
        }
        
        .language-name-cell {
            padding: 1.5mm 0;
        }
        
        .language-level-cell {
            text-align: right;
            padding: 1.5mm 0;
        }
        
        .language-name {
            font-size: 9pt;
            color: #2E2E2E;
        }
        
        .language-level {
            font-size: 8pt;
            color: #777777;
            font-style: italic;
        }

        /* Hobbies Styling */
        .hobbies-container {
            width: 100%;
        }

        .hobby-item {
            font-size: 8pt;
            color: #777777;
            margin-bottom: 1mm;
            margin-right: 3mm;
            display: inline-block;
        }

        /* Divider */
        .divider {
            height: 0.1mm;
            background-color: #EEEEEE;
            margin: 6mm 0;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Section --}}
    <table class="header-table">
        <tr>
            <td class="header-left-cell">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
                <div>
                    @if($cvInformation['personalInformation']['email'])
                        <div class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</div>
                    @endif
                    @if($cvInformation['personalInformation']['phone'])
                        <div class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</div>
                    @endif
                    @if($cvInformation['personalInformation']['address'])
                        <div class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</div>
                    @endif
                    @if($cvInformation['personalInformation']['linkedin'])
                        <div class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                    @endif
                </div>
            </td>
            <td class="header-right-cell">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="photo-container">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                    </div>
                @endif
            </td>
        </tr>
    </table>

    {{-- Summary Section --}}
    @if(!empty($cvInformation['summaries']))
        <div class="summary">
            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
        </div>
    @endif

    {{-- Experience Sections --}}
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
                <div class="experience-item">
                    <table class="experience-table">
                        <tr>
                            <td class="experience-date-cell">
                                <div class="experience-date">
                                    {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                    @if($experience['date_end'])
                                        {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                    @else
                                        {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                    @endif
                                </div>
                            </td>
                            <td class="experience-content-cell">
                                <div class="experience-title">{{ $experience['name'] }}</div>
                                <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                <div class="experience-description">
                                    {{ $experience['description'] }}
                                    @if($experience['output'])
                                        <br>{{ $experience['output'] }}
                                    @endif
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            @endforeach
        </div>
    @endforeach

    <div class="divider"></div>

    {{-- Skills and Languages in Two Columns --}}
    <table class="two-column-table">
        <tr>
            {{-- Skills Section --}}
            @if(!empty($cvInformation['competences']))
                <td class="col-left-cell">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                    <div class="skills-container">
                        @foreach($cvInformation['competences'] as $competence)
                            <div class="skill-item">
                                {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                            </div>
                        @endforeach
                    </div>
                </td>
            @endif

            {{-- Languages Section --}}
            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <td class="col-right-cell">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                    <table class="language-table">
                        @foreach($cvInformation['languages'] ?? [] as $language)
                            <tr class="language-row">
                                <td class="language-name-cell">
                                    <div class="language-name">{{ $language['name'] ?? '' }}</div>
                                </td>
                                @if(isset($language['level']))
                                    <td class="language-level-cell">
                                        <div class="language-level">{{ $language['level'] ?? '' }}</div>
                                    </td>
                                @endif
                            </tr>
                        @endforeach
                    </table>
                </td>
            @endif
        </tr>
    </table>

    {{-- Hobbies Section --}}
    @if(!empty($cvInformation['hobbies']))
        <div class="section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
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
</body>
</html>
@endsection 