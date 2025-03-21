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
        .header-container {
            background: linear-gradient(135deg, #4356ef, #3023ae) !important;
            padding: 10mm 15mm;
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

        .name {
            font-size: 18pt;
            font-weight: bold;
            color: #FFFFFF !important;
            margin-bottom: 2mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .profession {
            font-size: 11pt;
            color: #FFFFFF !important;
            margin-bottom: 5mm;
            opacity: 0.9;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Photo Styling */
        .photo-container {
            width: 28mm;
            height: 28mm;
            border-radius: 50%;
            overflow: hidden;
            border: 0.5mm solid #FFFFFF !important;
            background-color: #FFFFFF;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Contact Information */
        .contact-table {
            width: 100%;
            margin-top: 5mm;
        }

        .contact-item {
            display: table;
            margin-bottom: 2mm;
            color: #FFFFFF !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .contact-icon {
            display: table-cell;
            width: 4mm;
            text-align: center;
            vertical-align: middle;
            font-family: 'DejaVu Sans', sans-serif;
        }

        .contact-text {
            display: table-cell;
            padding-left: 2mm;
            font-size: 9pt;
            vertical-align: middle;
        }

        /* Main Content Layout */
        .main-content {
            padding: 10mm 15mm;
        }

        /* Section Styling */
        .section {
            margin-bottom: 8mm;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: #4356ef !important;
            margin-bottom: 3mm;
            border-bottom: 0.2mm solid #4356ef !important;
            padding-bottom: 1mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #333333;
            line-height: 1.4;
            margin-bottom: 5mm;
            text-align: justify;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 4mm;
            border-left: 1mm solid #e0e0e0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .experience-date-cell {
            width: 25%;
            padding: 2mm 3mm 2mm 3mm;
        }

        .experience-content-cell {
            width: 75%;
            padding: 2mm 0 2mm 3mm;
        }

        .experience-date {
            font-size: 8pt;
            color: #4356ef !important;
            font-weight: bold;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .experience-bullet {
            width: 2mm;
            height: 2mm;
            background-color: #4356ef !important;
            border-radius: 50%;
            position: absolute;
            left: -3.5mm;
            top: 2mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .experience-company {
            font-size: 8pt;
            color: #666666;
            font-style: italic;
        }

        .experience-title {
            font-size: 10pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 1mm;
            position: relative;
        }

        .experience-description {
            font-size: 9pt;
            color: #333333;
            line-height: 1.4;
        }

        /* Two Column Layout */
        .two-column-table {
            width: 100%;
            margin-bottom: 5mm;
        }

        .column-left-cell {
            width: 48%;
            padding-right: 2%;
        }

        .column-right-cell {
            width: 48%;
            padding-left: 2%;
        }

        /* Skills Styling */
        .skills-table {
            width: 100%;
        }

        .skill-row {
            margin-bottom: 3mm;
        }

        .skill-name-cell {
            width: 60%;
            padding-right: 2%;
        }

        .skill-level-cell {
            width: 40%;
        }

        .skill-name {
            font-size: 9pt;
            color: #333333;
        }

        .skill-bar-container {
            width: 100%;
            height: 1mm;
            background-color: #e0e0e0;
            border-radius: 0.5mm;
        }

        .skill-bar {
            height: 100%;
            background-color: #4356ef !important;
            border-radius: 0.5mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Language Section */
        .language-table {
            width: 100%;
        }

        .language-row {
            margin-bottom: 2mm;
        }

        .language-name-cell {
            width: 50%;
        }

        .language-level-cell {
            width: 50%;
            text-align: right;
        }
        
        .language-name {
            font-size: 9pt;
            color: #333333;
        }
        
        .language-level {
            font-size: 8pt;
            color: #4356ef !important;
            font-weight: bold;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Hobbies Section */
        .hobbies-table {
            width: 100%;
        }

        .hobby-item {
            display: inline-block;
            margin: 0 1mm 1mm 0;
            padding: 1mm 2mm;
            font-size: 8pt;
            color: #4356ef !important;
            background-color: rgba(67, 86, 239, 0.1) !important;
            border-radius: 1mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* QR Code Section */
        .qr-container {
            text-align: center;
            margin-top: 5mm;
        }

        .qr-text {
            font-size: 7pt;
            color: #999999;
            margin-top: 1mm;
            text-align: center;
        }

        /* Responsive Digital Elements */
        .digital-badge {
            display: inline-block;
            margin-right: 2mm;
            padding: 1mm 3mm;
            background-color: rgba(67, 86, 239, 0.1) !important;
            border-radius: 1mm;
            font-size: 8pt;
            color: #4356ef !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Section with Contact Info --}}
    <div class="header-container">
        <table class="header-table">
            <tr>
                <td class="header-left-cell">
                    <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                    <div class="profession">
                        {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                    </div>
                    
                    <table class="contact-table">
                        @if($cvInformation['personalInformation']['email'])
                            <tr>
                                <td class="contact-item">
                                    <span class="contact-icon">@</span>
                                    <span class="contact-text">{{ $cvInformation['personalInformation']['email'] }}</span>
                                </td>
                            </tr>
                        @endif
                        @if($cvInformation['personalInformation']['phone'])
                            <tr>
                                <td class="contact-item">
                                    <span class="contact-icon">☎</span>
                                    <span class="contact-text">{{ $cvInformation['personalInformation']['phone'] }}</span>
                                </td>
                            </tr>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <tr>
                                <td class="contact-item">
                                    <span class="contact-icon">⌂</span>
                                    <span class="contact-text">{{ $cvInformation['personalInformation']['address'] }}</span>
                                </td>
                            </tr>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <tr>
                                <td class="contact-item">
                                    <span class="contact-icon">in</span>
                                    <span class="contact-text">{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                                </td>
                            </tr>
                        @endif
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
    <div class="main-content">
        {{-- Summary Section --}}
        @if(!empty($cvInformation['summaries']))
            <div class="section">
                <div class="section-title">{{ $currentLocale === 'fr' ? 'Profil' : 'Profile' }}</div>
                <div class="summary">
                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                </div>
                
                {{-- Digital Keywords/Tags --}}
                @if(!empty($cvInformation['competences']))
                    <div style="margin-top: 3mm;">
                        @foreach($cvInformation['competences'] as $index => $competence)
                            @if($index < 5)
                                <span class="digital-badge">
                                    {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                </span>
                            @endif
                        @endforeach
                    </div>
                @endif
            </div>
        @endif

        {{-- Experience Section --}}
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
                                    <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                </td>
                                <td class="experience-content-cell">
                                    <div class="experience-title">
                                        <div class="experience-bullet"></div>
                                        {{ $experience['name'] }}
                                    </div>
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

        {{-- Two Column Section for Skills, Languages, Education, Hobbies --}}
        <table class="two-column-table">
            <tr>
                <td class="column-left-cell">
                    {{-- Skills Section --}}
                    @if(!empty($cvInformation['competences']))
                        <div class="section">
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
                                @foreach($cvInformation['languages'] ?? [] as $language)
                                    <tr class="language-row">
                                        <td class="language-name-cell">
                                            <div class="language-name">{{ $language['name'] ?? '' }}</div>
                                        </td>
                                        <td class="language-level-cell">
                                            @if(isset($language['level']))
                                                <div class="language-level">{{ $language['level'] ?? '' }}</div>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </table>
                        </div>
                    @endif
                </td>
                <td class="column-right-cell">
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

                                @foreach($experiences as $experience)
                                    <table class="experience-table">
                                        <tr>
                                            <td class="experience-date-cell">
                                                <div class="experience-date">
                                                    {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }}
                                                    @if($experience['date_end'])
                                                        - {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                                    @endif
                                                </div>
                                            </td>
                                            <td class="experience-content-cell">
                                                <div class="experience-title">
                                                    <div class="experience-bullet"></div>
                                                    {{ $experience['name'] }}
                                                </div>
                                                <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                            </td>
                                        </tr>
                                    </table>
                                @endforeach
                            </div>
                        @endif
                    @endforeach

                    {{-- Hobbies Section --}}
                    @if(!empty($cvInformation['hobbies']))
                        <div class="section">
                            <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Interests' }}</div>
                            <table class="hobbies-table">
                                <tr>
                                    <td>
                                        @foreach($cvInformation['hobbies'] as $hobby)
                                            <span class="hobby-item">
                                                {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                                            </span>
                                        @endforeach
                                    </td>
                                </tr>
                            </table>
                        </div>
                    @endif

                    {{-- Simulated QR Code Section --}}
                    <div class="qr-container">
                        <div style="width: 20mm; height: 20mm; background-color: #f0f0f0; margin: 0 auto; border: 0.2mm solid #cccccc;"></div>
                        <div class="qr-text">{{ $currentLocale === 'fr' ? 'Scannez pour profil en ligne' : 'Scan for online profile' }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>
</body>
</html>
@endsection 