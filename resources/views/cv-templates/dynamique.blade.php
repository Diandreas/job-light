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
            font-size: 9pt;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        .cv-container {
            width: 210mm;
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

        /* Header Section */
        .header {
            background-color: #6B5B95 !important; /* Utilisation de la couleur principale violet/bleu */
            color: white !important;
            padding: 10mm !important;
            position: relative !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
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

        .graphic-element {
            position: absolute;
            width: 30mm;
            height: 30mm;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            right: -10mm;
            top: -10mm;
            z-index: 1;
        }
        
        .graphic-element-2 {
            position: absolute;
            width: 20mm;
            height: 20mm;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.1);
            left: 30mm;
            bottom: -10mm;
            z-index: 1;
        }

        .name {
            font-size: 22pt;
            font-weight: bold;
            margin-bottom: 2mm;
            letter-spacing: 0.5pt;
        }

        .profession {
            font-size: 11pt;
            opacity: 0.9;
            margin-bottom: 6mm;
            font-weight: normal;
        }

        .contact-info {
            display: table;
            width: 100%;
        }

        .contact-row {
            display: table-row;
        }

        .contact-item {
            display: table-cell;
            padding-right: 10mm;
            padding-bottom: 3mm;
            font-size: 8pt;
        }

        .contact-icon {
            font-weight: bold;
        }

        /* Photo Styling */
        .photo-container {
            width: 35mm;
            height: 35mm;
            overflow: hidden;
            border-radius: 50%;
            border: 2mm solid rgba(255, 255, 255, 0.3);
            margin-left: auto;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Main Content */
        .content-table {
            width: 100%;
        }

        .content-left-cell {
            width: 60%;
            padding: 10mm 6mm 10mm 10mm;
        }

        .content-right-cell {
            width: 40%;
            padding: 10mm 10mm 10mm 6mm;
            border-left: 0.3mm solid #EEEEEE;
        }

        /* Section Styling */
        .section {
            margin-bottom: 8mm;
            position: relative;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #6B5B95;
            margin-bottom: 4mm;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            position: relative;
            display: flex;
            align-items: center;
        }

        .section-title::before {
            content: '';
            width: 4mm;
            height: 4mm;
            background-color: #FF6F61;
            border-radius: 50%;
            margin-right: 3mm;
            display: inline-block;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #444444;
            line-height: 1.5;
            text-align: justify;
            margin-bottom: 6mm;
            padding: 4mm;
            background-color: #F9F9F9;
            border-radius: 2mm;
            position: relative;
        }

        .summary::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 2mm;
            height: 100%;
            background: linear-gradient(to bottom, #6B5B95, #FF6F61);
            border-radius: 2mm 0 0 2mm;
        }

        /* Experience Styling */
        .experience-item {
            margin-bottom: 5mm;
            padding-bottom: 5mm;
            border-bottom: 0.2mm dashed #EEEEEE;
            position: relative;
        }

        .experience-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .experience-table {
            width: 100%;
        }

        .experience-title-cell {
            width: 70%;
        }

        .experience-date-cell {
            width: 30%;
            text-align: right;
        }

        .experience-date {
            background-color: #6B5B95;
            color: white;
            padding: 1mm 2mm;
            border-radius: 1mm;
            font-size: 7.5pt;
            white-space: nowrap;
            display: inline-block;
        }

        .experience-title {
            font-size: 10pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 1mm;
        }

        .experience-company {
            font-size: 9pt;
            color: #6B5B95;
            font-style: italic;
        }

        .experience-description {
            font-size: 8.5pt;
            color: #555555;
            line-height: 1.4;
            text-align: justify;
            padding-top: 2mm;
        }

        /* Skills Styling */
        .skills-container {
            width: 100%;
        }

        .skill-item {
            background-color: #F0F0F0;
            padding: 2mm 3mm;
            border-radius: 1mm;
            font-size: 8pt;
            color: #333333;
            margin-bottom: 2mm;
            position: relative;
            overflow: hidden;
            display: inline-block;
            margin-right: 2mm;
        }

        .skill-item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0.5mm;
            background-color: #FF6F61;
        }

        /* Language Section */
        .language-items {
            width: 100%;
        }
        
        .language-item {
            background-color: #F9F9F9;
            border-radius: 1mm;
            padding: 2mm 3mm;
            position: relative;
            margin-bottom: 3mm;
        }
        
        .language-name {
            font-size: 9pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 1mm;
        }
        
        .language-level {
            font-size: 8pt;
            color: #6B5B95;
            display: inline-block;
            background-color: rgba(107, 91, 149, 0.1);
            padding: 0.5mm 2mm;
            border-radius: 1mm;
        }
        
        .language-bar-container {
            height: 1mm;
            background-color: #EEEEEE;
            border-radius: 0.5mm;
            margin-top: 1.5mm;
        }
        
        .language-bar {
            height: 100%;
            background: linear-gradient(to right, #6B5B95, #FF6F61);
            border-radius: 0.5mm;
        }

        /* Hobbies Styling */
        .hobbies-container {
            width: 100%;
        }

        .hobby-item {
            font-size: 8pt;
            color: #555555;
            background-color: #F9F9F9;
            padding: 2mm 3mm;
            border-radius: 1mm;
            border-left: 1mm solid #FF6F61;
            display: inline-block;
            margin-right: 2mm;
            margin-bottom: 2mm;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Section --}}
    <div class="header">
        <div class="graphic-element"></div>
        <div class="graphic-element-2"></div>
        <table class="header-table">
            <tr>
                <td class="header-left-cell">
                    <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                    <div class="profession">
                        {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                    </div>
                    <table class="contact-info">
                        <tr>
                            @if($cvInformation['personalInformation']['email'])
                                <td class="contact-item">
                                    <span class="contact-icon">@</span> {{ $cvInformation['personalInformation']['email'] }}
                                </td>
                            @endif
                            @if($cvInformation['personalInformation']['phone'])
                                <td class="contact-item">
                                    <span class="contact-icon">✆</span> {{ $cvInformation['personalInformation']['phone'] }}
                                </td>
                            @endif
                        </tr>
                        <tr>
                            @if($cvInformation['personalInformation']['address'])
                                <td class="contact-item">
                                    <span class="contact-icon">⌂</span> {{ $cvInformation['personalInformation']['address'] }}
                                </td>
                            @endif
                            @if($cvInformation['personalInformation']['linkedin'])
                                <td class="contact-item">
                                    <span class="contact-icon">in</span> {{ $cvInformation['personalInformation']['linkedin'] }}
                                </td>
                            @endif
                        </tr>
                    </table>
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

    {{-- Main Content --}}
    <table class="content-table">
        <tr>
            <td class="content-left-cell">
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
                                        <td class="experience-title-cell">
                                            <div class="experience-title">{{ $experience['name'] }}</div>
                                            <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                        </td>
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
                                    </tr>
                                    <tr>
                                        <td colspan="2">
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
            </td>

            <td class="content-right-cell">
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
                            @foreach($cvInformation['languages'] ?? [] as $index => $language)
                                <div class="language-item">
                                    <div class="language-name">{{ $language['name'] ?? '' }}</div>
                                    @if(isset($language['level']))
                                        <div class="language-level">{{ $language['level'] ?? '' }}</div>
                                    @endif
                                    <div class="language-bar-container">
                                        <div class="language-bar" style="width: {{ min((($index + 1) % 3 + 3) * 20, 100) }}%"></div>
                                    </div>
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