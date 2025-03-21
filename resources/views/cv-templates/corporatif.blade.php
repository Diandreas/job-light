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
        .header-table {
            width: 100%;
            border-bottom: 0.5mm solid #003366;
            margin-bottom: 6mm;
        }

        .header-top {
            height: 15mm;
            background-color: #003366 !important; /* Couleur bleu corporate */
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color: white !important;
        }

        .header-top-left {
            padding: 4mm 6mm;
            width: 70%;
        }

        .header-top-right {
            width: 30%;
            text-align: right;
            padding: 4mm 6mm 4mm 0;
        }

        .header-bottom {
            height: 12mm;
            background-color: #f2f2f2 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .header-bottom-cell {
            padding: 3mm 6mm;
        }

        .name {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 1mm;
        }

        .profession {
            font-size: 10pt;
            opacity: 0.9;
        }

        /* Contact Info */
        .contact-item {
            font-size: 8pt;
            margin-bottom: 0.5mm;
            text-align: right;
        }

        /* Photo Styling */
        .photo-container {
            width: 30mm;
            height: 30mm;
            overflow: hidden;
            position: absolute;
            top: 3mm;
            right: 6mm;
            border: 0.5mm solid white;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #333333;
            line-height: 1.4;
            margin-bottom: 6mm;
            padding: 0 6mm;
        }

        /* Main Layout */
        .main-table {
            width: 100%;
            padding: 0 6mm;
        }

        .main-left-cell {
            width: 68%;
            padding-right: 4mm;
        }

        .main-right-cell {
            width: 32%;
            padding-left: 4mm;
        }

        /* Section Styling */
        .section {
            margin-bottom: 6mm;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #003366;
            margin-bottom: 3mm;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #003366;
            text-transform: uppercase;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 4mm;
        }

        .experience-date-cell {
            width: 22%;
            padding-right: 3mm;
        }

        .experience-content-cell {
            width: 78%;
        }

        .experience-date {
            font-size: 9pt;
            color: #003366;
            font-weight: bold;
        }

        .experience-title {
            font-size: 10pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 1mm;
        }

        .experience-company {
            font-size: 9pt;
            color: #666666;
            margin-bottom: 2mm;
        }

        .experience-description {
            font-size: 8.5pt;
            color: #333333;
            line-height: 1.4;
            text-align: justify;
        }

        /* Skills Styling */
        .skills-table {
            width: 100%;
        }

        .skill-row {
            margin-bottom: 1.5mm;
        }

        .skill-name {
            font-size: 9pt;
            font-weight: normal;
            color: #333333;
            margin-bottom: 1mm;
        }

        .skill-bar-container {
            height: 1.5mm;
            background-color: #e0e0e0;
            border-radius: 0.75mm;
        }

        .skill-bar {
            height: 100%;
            background-color: #003366;
            border-radius: 0.75mm;
        }

        /* Language Section */
        .language-table {
            width: 100%;
        }
        
        .language-row {
            margin-bottom: 2mm;
        }
        
        .language-name {
            font-size: 9pt;
            color: #333333;
            font-weight: normal;
            margin-bottom: 1mm;
        }
        
        .language-bar-container {
            height: 1.5mm;
            background-color: #e0e0e0;
            border-radius: 0.75mm;
        }
        
        .language-bar {
            height: 100%;
            background-color: #003366;
            border-radius: 0.75mm;
        }

        /* Education Styling */
        .education-table {
            width: 100%;
        }

        .education-row {
            margin-bottom: 2mm;
        }

        .education-date {
            font-size: 8.5pt;
            color: #003366;
            font-weight: bold;
        }

        .education-degree {
            font-size: 9pt;
            font-weight: bold;
            color: #333333;
        }

        .education-institution {
            font-size: 8.5pt;
            color: #666666;
        }

        /* Footer */
        .footer {
            text-align: center;
            font-size: 7pt;
            color: #999999;
            margin-top: 8mm;
            padding: 2mm 0;
            border-top: 0.2mm solid #e0e0e0;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header --}}
    <table class="header-table">
        <tr class="header-top">
            <td class="header-top-left">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </td>
            <td class="header-top-right">
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                @endif
            </td>
        </tr>
        <tr class="header-bottom">
            <td class="header-bottom-cell" colspan="2">
                @if($cvInformation['personalInformation']['address'])
                    <div style="font-size: 8.5pt; color: #666666;">
                        <strong>{{ $currentLocale === 'fr' ? 'Adresse:' : 'Address:' }}</strong> {{ $cvInformation['personalInformation']['address'] }}
                    </div>
                @endif
            </td>
        </tr>
    </table>
    
    @if($cvInformation['personalInformation']['photo'])
        <div class="photo-container">
            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                 alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
        </div>
    @endif

    {{-- Summary Section --}}
    @if(!empty($cvInformation['summaries']))
        <div class="summary">
            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
        </div>
    @endif

    {{-- Main Content --}}
    <table class="main-table">
        <tr>
            <td class="main-left-cell">
                {{-- Experience Sections --}}
                @foreach($experiencesByCategory as $category => $experiences)
                    @if($category != 'Éducation' && $category != 'Education')
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
                            @endforeach
                        </div>
                    @endif
                @endforeach
            </td>

            <td class="main-right-cell">
                {{-- Education Section --}}
                @foreach($experiencesByCategory as $category => $experiences)
                    @if($category == 'Éducation' || $category == 'Education')
                        <div class="section">
                            <div class="section-title">
                                @if($currentLocale === 'fr')
                                    {{ $category }}
                                @else
                                    {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                                @endif
                            </div>

                            <table class="education-table">
                                @foreach($experiences as $experience)
                                    <tr class="education-row">
                                        <td>
                                            <div class="education-date">
                                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} -
                                                @if($experience['date_end'])
                                                    {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                                @else
                                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                                @endif
                                            </div>
                                            <div class="education-degree">{{ $experience['name'] }}</div>
                                            <div class="education-institution">{{ $experience['InstitutionName'] }}</div>
                                        </td>
                                    </tr>
                                @endforeach
                            </table>
                        </div>
                    @endif
                @endforeach

                {{-- Skills Section --}}
                @if(!empty($cvInformation['competences']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                        <table class="skills-table">
                            @foreach($cvInformation['competences'] as $index => $competence)
                                <tr class="skill-row">
                                    <td>
                                        <div class="skill-name">
                                            {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                        </div>
                                        <div class="skill-bar-container">
                                            <div class="skill-bar" style="width: {{ min((($index + 1) % 5 + 2) * 17, 100) }}%"></div>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </table>
                    </div>
                @endif

                {{-- Languages Section --}}
                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                        <table class="language-table">
                            @foreach($cvInformation['languages'] ?? [] as $index => $language)
                                <tr class="language-row">
                                    <td>
                                        <div class="language-name">
                                            {{ $language['name'] ?? '' }}
                                            @if(isset($language['level']))
                                                <span style="font-size: 8pt; color: #666666;"> - {{ $language['level'] ?? '' }}</span>
                                            @endif
                                        </div>
                                        <div class="language-bar-container">
                                            <div class="language-bar" style="width: {{ min((($index + 1) % 3 + 3) * 20, 100) }}%"></div>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </table>
                    </div>
                @endif

                {{-- Hobbies Section --}}
                @if(!empty($cvInformation['hobbies']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                        <div style="font-size: 8.5pt; color: #333333; line-height: 1.4;">
                            @foreach($cvInformation['hobbies'] as $index => $hobby)
                                {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                                @if($index < count($cvInformation['hobbies']) - 1), @endif
                            @endforeach
                        </div>
                    </div>
                @endif
            </td>
        </tr>
    </table>

    {{-- Footer --}}
    <div class="footer">
        {{ $currentLocale === 'fr' ? 'Curriculum Vitae de ' : 'Curriculum Vitae of ' }} {{ $cvInformation['personalInformation']['firstName'] }} | {{ $currentLocale === 'fr' ? 'Mis à jour le ' : 'Updated on ' }} {{ \Carbon\Carbon::now()->locale($currentLocale)->isoFormat('LL') }}
    </div>
</div>
</body>
</html>
@endsection 