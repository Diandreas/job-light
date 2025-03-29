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
            line-height: 1.2;
            font-size: 9pt;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .cv-container {
            width: 170mm;
            padding: 5mm;
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
            position: relative;
            margin-bottom: 6mm;
            border-bottom: 0.3mm solid #8E44AD;
            padding-bottom: 4mm;
        }

        .header-table {
            width: 100%;
        }

        .header-left-cell {
            width: 70%;
        }

        .header-right-cell {
            width: 30%;
            text-align: right;
        }
        
        .name {
            font-size: 18pt;
            font-weight: 300;
            color: #8E44AD;
            margin-bottom: 1mm;
            letter-spacing: 0.5pt;
        }

        .profession {
            font-size: 10pt;
            color: #555555;
            margin-bottom: 4mm;
            font-style: italic;
            letter-spacing: 0.5pt;
        }

        .contact-item {
            font-size: 8pt;
            margin-bottom: 1mm;
            color: #777777;
        }

        /* Photo Styling */
        .photo-container {
            width: 25mm;
            height: 25mm;
            overflow: hidden;
            border-radius: 50%;
            border: 0.5mm solid #8E44AD;
            margin-left: auto;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Section Styling */
        .section {
            margin-bottom: 5mm;
            position: relative;
        }

        .section-title {
            font-size: 10pt;
            font-weight: normal;
            color: #8E44AD;
            text-transform: uppercase;
            margin-bottom: 2mm;
            letter-spacing: 0.5pt;
            position: relative;
            padding-bottom: 1mm;
        }
        
        .section-title:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 12mm;
            height: 0.3mm;
            background-color: #8E44AD;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #444444;
            line-height: 1.3;
            text-align: justify;
            margin-bottom: 5mm;
            padding-bottom: 5mm;
            border-bottom: 0.1mm solid #EEEEEE;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 3mm;
            page-break-inside: avoid;
        }

        .experience-left {
            width: 25%;
            padding-right: 2mm;
        }

        .experience-right {
            width: 75%;
        }

        .date {
            font-size: 8pt;
            color: #8E44AD;
            font-weight: 600;
            font-style: italic;
        }

        .company {
            font-size: 8pt;
            margin-top: 1mm;
            color: #777777;
        }

        .position {
            font-size: 9pt;
            font-weight: 600;
            color: #444444;
            margin-bottom: 1mm;
        }

        .description {
            font-size: 8pt;
            color: #555555;
            line-height: 1.3;
            text-align: justify;
        }

        /* Skills Styling */
        .skills-container {
            margin-top: 2mm;
            margin-bottom: 2mm;
            width: 100%;
        }

        .skill-item {
            background-color: #F9F5FD;
            padding: 1mm 2mm;
            margin-right: 1.5mm;
            margin-bottom: 1.5mm;
            border-radius: 1.5mm;
            font-size: 8pt;
            color: #8E44AD;
            display: inline-block;
        }

        /* Language Section */
        .language-section {
            margin-top: 2mm;
        }
        
        .language-title {
            font-size: 10pt;
            font-weight: normal;
            color: #8E44AD;
            text-transform: uppercase;
            margin-bottom: 2mm;
            letter-spacing: 0.5pt;
            position: relative;
            padding-bottom: 1mm;
        }
        
        .language-title:after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 12mm;
            height: 0.3mm;
            background-color: #8E44AD;
        }
        
        .language-items {
            width: 100%;
        }
        
        .language-item {
            background-color: #F9F5FD;
            border-radius: 1.5mm;
            padding: 1mm 2mm;
            font-size: 8pt;
            color: #8E44AD;
            display: inline-block;
            margin-right: 1.5mm;
            margin-bottom: 1.5mm;
        }
        
        .language-level {
            color: #777777;
            margin-left: 1mm;
            font-style: italic;
        }

        /* Hobbies Styling */
        .hobbies-container {
            margin-top: 2mm;
            width: 100%;
        }

        .hobby-item {
            margin-right: 3mm;
            margin-bottom: 1.5mm;
            font-size: 8pt;
            color: #555555;
            display: inline-block;
        }

        /* Column Layout */
        .two-column-table {
            width: 100%;
            margin-bottom: 3mm;
        }

        .column-left-cell {
            width: 65%;
            padding-right: 3mm;
        }

        .column-right-cell {
            width: 35%;
            padding-left: 3mm;
            border-left: 0.1mm solid #EEEEEE;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Section --}}
    <div class="header">
        <table class="header-table">
            <tr>
                <td class="header-left-cell">
                    <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                    <div class="profession">
                        {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
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
    </div>

    {{-- Contact Information --}}
    <div class="contact-info" style="margin-bottom: 5mm;">
        <table>
            <tr>
                <td style="width: 50%;">
                    @if($cvInformation['personalInformation']['email'])
                        <span class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</span><br>
                    @endif
                    @if($cvInformation['personalInformation']['phone'])
                        <span class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</span>
                    @endif
                </td>
                <td style="width: 50%;">
                    @if($cvInformation['personalInformation']['address'])
                        <span class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</span><br>
                    @endif
                    @if($cvInformation['personalInformation']['linkedin'])
                        <span class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    {{-- Summary Section --}}
    @if(!empty($cvInformation['summaries']))
        <div class="summary">
            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
        </div>
    @endif

    <table class="two-column-table">
        <tr>
            <td class="column-left-cell">
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
                                    <td class="experience-left">
                                        <div class="date">
                                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                            @if($experience['date_end'])
                                                {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                            @else
                                                {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                            @endif
                                        </div>
                                        <div class="company">{{ $experience['InstitutionName'] }}</div>
                                    </td>
                                    <td class="experience-right">
                                        <div class="position">{{ $experience['name'] }}</div>
                                        <div class="description">
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
            </td>

            <td class="column-right-cell">
                {{-- Skills Section --}}
                @if(!empty($cvInformation['competences']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                        <div class="skills-container">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="skill-item">
                                    {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                {{-- Languages Section --}}
                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
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
                    </div>
                @endif

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
            </td>
        </tr>
    </table>
</div>
</body>
</html>
@endsection 