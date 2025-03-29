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
            font-family: 'DejaVu Serif', serif;
            line-height: 1.3;
            font-size: 9pt;
            color: #333333;
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
        .header {
            margin-bottom: 6mm;
            text-align: center;
            border-bottom: 0.8mm solid #1F497D;
            padding-bottom: 4mm;
        }

        .name {
            font-size: 16pt;
            font-weight: bold;
            color: #1F497D;
            margin-bottom: 2mm;
            font-family: 'DejaVu Serif', serif;
            letter-spacing: 0.3mm;
        }

        .profession {
            font-size: 11pt;
            color: #555555;
            margin-bottom: 3mm;
            font-style: italic;
        }

        /* Contact Information */
        .contact-table {
            width: 100%;
            margin-bottom: 2mm;
        }

        .contact-row td {
            text-align: center;
            font-size: 8pt;
            color: #666666;
            padding: 0 2mm;
        }

        /* Photo Styling */
        .photo-container {
            width: 30mm;
            height: 30mm;
            overflow: hidden;
            border-radius: 1mm;
            border: 0.5mm solid #1F497D;
            margin: 0 auto 3mm auto;
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
            font-size: 11pt;
            font-weight: bold;
            color: #1F497D;
            margin-bottom: 2mm;
            text-transform: uppercase;
            border-bottom: 0.3mm solid #1F497D;
            padding-bottom: 1mm;
            letter-spacing: 0.2mm;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #333333;
            line-height: 1.4;
            text-align: justify;
            margin-bottom: 4mm;
            font-style: italic;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 3mm;
            page-break-inside: avoid;
        }

        .exp-date-cell {
            width: 25%;
            padding-right: 2mm;
            font-weight: bold;
            color: #1F497D;
        }

        .exp-content-cell {
            width: 75%;
        }

        .exp-title {
            font-size: 9pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 0.5mm;
        }

        .exp-institution {
            font-size: 8pt;
            font-style: italic;
            color: #666666;
            margin-bottom: 1mm;
        }

        .exp-description {
            font-size: 8pt;
            color: #333333;
            line-height: 1.3;
            text-align: justify;
        }

        /* Publications Styling */
        .publication-item {
            margin-bottom: 2mm;
            text-align: justify;
            font-size: 8pt;
            line-height: 1.3;
            padding-left: 4mm;
            text-indent: -4mm;
        }

        /* Skills and Languages Layout */
        .two-column-table {
            width: 100%;
            margin-bottom: 4mm;
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
        .skills-table {
            width: 100%;
        }

        .skill-row {
            border-bottom: 0.1mm solid #EEEEEE;
        }

        .skill-row:last-child {
            border-bottom: none;
        }

        .skill-name-cell {
            width: 70%;
            padding: 1.5mm 0;
        }

        .skill-level-cell {
            width: 30%;
            text-align: right;
            padding: 1.5mm 0;
        }

        .skill-name {
            font-size: 8pt;
            color: #333333;
        }

        .skill-level {
            font-size: 7pt;
            color: #1F497D;
            font-style: italic;
        }

        /* Language Section */
        .language-table {
            width: 100%;
        }
        
        .language-row {
            border-bottom: 0.1mm solid #EEEEEE;
        }
        
        .language-row:last-child {
            border-bottom: none;
        }
        
        .language-name-cell {
            width: 60%;
            padding: 1.5mm 0;
        }
        
        .language-level-cell {
            width: 40%;
            text-align: right;
            padding: 1.5mm 0;
        }
        
        .language-name {
            font-size: 8pt;
            color: #333333;
        }
        
        .language-level {
            font-size: 7pt;
            color: #1F497D;
            font-style: italic;
        }

        /* References/Hobbies Styling */
        .references {
            font-size: 8pt;
            color: #666666;
            font-style: italic;
            text-align: center;
            margin-top: 6mm;
        }
        
        .hobbies-container {
            text-align: center;
            width: 100%;
        }
        
        .hobby-item {
            display: inline-block;
            font-size: 8pt;
            color: #666666;
            margin: 0 2mm;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header With Photo--}}
    <div class="header">
        @if($cvInformation['personalInformation']['photo'])
            <div class="photo-container">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                     alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
            </div>
        @endif
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
        <div class="profession">
            {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
        </div>
        <table class="contact-table">
            <tr class="contact-row">
                @if($cvInformation['personalInformation']['email'])
                    <td>{{ $cvInformation['personalInformation']['email'] }}</td>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <td>{{ $cvInformation['personalInformation']['phone'] }}</td>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <td>{{ $cvInformation['personalInformation']['linkedin'] }}</td>
                @endif
            </tr>
            @if($cvInformation['personalInformation']['address'])
                <tr class="contact-row">
                    <td colspan="3">{{ $cvInformation['personalInformation']['address'] }}</td>
                </tr>
            @endif
        </table>
    </div>

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
                <table class="experience-table">
                    <tr>
                        <td class="exp-date-cell">
                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                            @if($experience['date_end'])
                                {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                            @else
                                {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                            @endif
                        </td>
                        <td class="exp-content-cell">
                            <div class="exp-title">{{ $experience['name'] }}</div>
                            <div class="exp-institution">{{ $experience['InstitutionName'] }}</div>
                            <div class="exp-description">
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

    {{-- Skills and Languages in Two Columns --}}
    <table class="two-column-table">
        <tr>
            {{-- Skills Section --}}
            @if(!empty($cvInformation['competences']))
                <td class="col-left-cell">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                    <table class="skills-table">
                        @foreach($cvInformation['competences'] as $index => $competence)
                            <tr class="skill-row">
                                <td class="skill-name-cell">
                                    <div class="skill-name">
                                        {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                    </div>
                                </td>
                                <td class="skill-level-cell">
                                    <div class="skill-level">
                                        @if($index % 3 == 0)
                                            {{ $currentLocale === 'fr' ? 'Avancé' : 'Advanced' }}
                                        @elseif($index % 3 == 1)
                                            {{ $currentLocale === 'fr' ? 'Intermédiaire' : 'Intermediate' }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Débutant' : 'Beginner' }}
                                        @endif
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </table>
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
                    <span class="hobby-item">
                        {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }} •
                    </span>
                @endforeach
            </div>
        </div>
    @endif

    {{-- References --}}
    <div class="references">
        {{ $currentLocale === 'fr' ? 'Références académiques disponibles sur demande' : 'Academic references available upon request' }}
    </div>
</div>
</body>
</html>
@endsection 