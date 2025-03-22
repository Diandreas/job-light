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

        /* Header Styling */
        .header-bg {
            height: 22mm;
            background-color: #37474F !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            position: relative;
        }

        .header-content {
            position: relative;
            padding: 0 8mm;
            margin-top: -18mm;
        }

        .header-table {
            width: 100%;
        }

        .header-left-cell {
            width: 65%;
        }

        .header-right-cell {
            width: 35%;
            text-align: right;
        }

        .name {
            font-size: 18pt;
            font-weight: bold;
            color: #FFFFFF;
            margin-bottom: 1mm;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }

        .profession {
            font-size: 10pt;
            color: #CFD8DC;
            margin-bottom: 4mm;
            font-weight: 300;
        }

        /* Photo Styling */
        .photo-container {
            width: 30mm;
            height: 30mm;
            overflow: hidden;
            border: 1.5mm solid #FFFFFF;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            float: right;
            margin-top: -4mm;
            background-color: #FFFFFF;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Contact Information */
        .contact-table {
            width: 100%;
            background-color: #F5F5F5 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin-top: 5mm;
            border-top: 0.5mm solid #FF5722;
            border-bottom: 0.5mm solid #FF5722;
        }

        .contact-cell {
            padding: 1.5mm 8mm;
            font-size: 8pt;
            color: #37474F;
        }

        .contact-item {
            display: inline-block;
            margin-right: 4mm;
        }

        .contact-icon {
            font-weight: bold;
            color: #FF5722;
            margin-right: 1mm;
        }

        /* Main Content */
        .main-table {
            width: 100%;
            padding: 6mm 8mm;
        }

        .section {
            margin-bottom: 5mm;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #37474F;
            margin-bottom: 2.5mm;
            text-transform: uppercase;
            border-left: 1mm solid #FF5722;
            padding-left: 2mm;
        }

        /* Summary Section */
        .summary {
            font-size: 9pt;
            color: #37474F;
            line-height: 1.3;
            margin-bottom: 5mm;
            border: 0.2mm solid #EEEEEE;
            padding: 2.5mm;
            background-color: #FAFAFA !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Skills and Expertise */
        .expertise-table {
            width: 100%;
            border: 0.2mm solid #EEEEEE;
        }

        .expertise-row {
            background-color: #FFFFFF;
        }

        .expertise-row:nth-child(odd) {
            background-color: #FAFAFA !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .expertise-category-cell {
            width: 30%;
            padding: 1.5mm;
            font-weight: bold;
            color: #37474F;
            border-right: 0.2mm solid #EEEEEE;
        }

        .expertise-skills-cell {
            width: 70%;
            padding: 1.5mm;
        }

        .skill-tag {
            display: inline-block;
            background-color: #EEEEEE !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            padding: 0.5mm 1.5mm;
            margin: 0.5mm 1mm 0.5mm 0;
            border-radius: 1mm;
            font-size: 8pt;
            color: #37474F;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 3mm;
            border: 0.2mm solid #EEEEEE;
        }

        .experience-header {
            background-color: #FAFAFA !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-bottom: 0.2mm solid #EEEEEE;
        }

        .experience-title-cell {
            width: 70%;
            padding: 1.5mm;
        }

        .experience-date-cell {
            width: 30%;
            text-align: right;
            padding: 1.5mm;
        }

        .experience-content-cell {
            padding: 1.5mm;
        }

        .experience-title {
            font-size: 9.5pt;
            font-weight: bold;
            color: #37474F;
        }

        .experience-company {
            font-size: 8.5pt;
            color: #FF5722;
        }

        .experience-date {
            font-size: 8pt;
            color: #607D8B;
        }

        .experience-description {
            font-size: 8.5pt;
            color: #37474F;
            line-height: 1.3;
        }

        /* Languages Section */
        .language-table {
            width: 100%;
            border: 0.2mm solid #EEEEEE;
        }
        
        .language-row {
            border-bottom: 0.2mm solid #EEEEEE;
        }
        
        .language-row:last-child {
            border-bottom: none;
        }
        
        .language-name-cell {
            width: 25%;
            padding: 1.5mm;
            font-weight: bold;
            color: #37474F;
            border-right: 0.2mm solid #EEEEEE;
        }
        
        .language-level-cell {
            width: 75%;
            padding: 1.5mm;
        }
        
        .language-level-bar {
            height: 2mm;
            background-color: #EEEEEE !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-radius: 1mm;
            position: relative;
        }
        
        .language-level-value {
            height: 100%;
            background-color: #FF5722 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            border-radius: 1mm;
            position: absolute;
            top: 0;
            left: 0;
        }

        /* Certifications and Education */
        .cert-edu-table {
            width: 100%;
        }

        .cert-edu-left-cell {
            width: 48%;
            padding-right: 2%;
        }

        .cert-edu-right-cell {
            width: 48%;
            padding-left: 2%;
        }

        .edu-cert-item-table {
            width: 100%;
            margin-bottom: 2mm;
        }

        .edu-cert-date-cell {
            width: 30%;
            font-size: 8pt;
            color: #607D8B;
            font-weight: bold;
        }

        .edu-cert-content-cell {
            width: 70%;
        }

        .edu-cert-title {
            font-size: 9pt;
            font-weight: bold;
            color: #37474F;
        }

        .edu-cert-institution {
            font-size: 8pt;
            color: #607D8B;
        }

        /* Footer */
        .footer {
            text-align: center;
            border-top: 0.5mm solid #FF5722;
            padding: 2mm 0;
            margin: 0 8mm;
            font-size: 8pt;
            color: #78909C;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Background --}}
    <div class="header-bg"></div>

    {{-- Header Content --}}
    <div class="header-content">
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
    <table class="contact-table">
        <tr>
            <td class="contact-cell">
                <table>
                    <tr>
                        <td style="width: 50%">
                            @if($cvInformation['personalInformation']['email'])
                                <span class="contact-item"><span class="contact-icon">@</span> {{ $cvInformation['personalInformation']['email'] }}</span>
                            @endif
                            @if($cvInformation['personalInformation']['phone'])
                                <span class="contact-item"><span class="contact-icon">✆</span> {{ $cvInformation['personalInformation']['phone'] }}</span>
                            @endif
                        </td>
                        <td style="width: 50%">
                            @if($cvInformation['personalInformation']['address'])
                                <span class="contact-item"><span class="contact-icon">⌂</span> {{ $cvInformation['personalInformation']['address'] }}</span>
                            @endif
                            @if($cvInformation['personalInformation']['linkedin'])
                                <span class="contact-item"><span class="contact-icon">in</span> {{ $cvInformation['personalInformation']['linkedin'] }}</span>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Main Content --}}
    <table class="main-table">
        <tr>
            <td>
                {{-- Summary Section --}}
                @if(!empty($cvInformation['summaries']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Profil' : 'Profile' }}</div>
                        <div class="summary">
                            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                        </div>
                    </div>
                @endif

                {{-- Expertise and Skills --}}
                @if(!empty($cvInformation['competences']))
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Expertise Technique' : 'Technical Expertise' }}</div>
                        <table class="expertise-table">
                            <tr class="expertise-row">
                                <td class="expertise-category-cell">
                                    {{ $currentLocale === 'fr' ? 'Compétences Techniques' : 'Technical Skills' }}
                                </td>
                                <td class="expertise-skills-cell">
                                    @foreach($cvInformation['competences'] as $index => $competence)
                                        @if($index < count($cvInformation['competences']) / 2)
                                            <span class="skill-tag">
                                                {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                            </span>
                                        @endif
                                    @endforeach
                                </td>
                            </tr>
                            <tr class="expertise-row">
                                <td class="expertise-category-cell">
                                    {{ $currentLocale === 'fr' ? 'Compétences Additionnelles' : 'Additional Skills' }}
                                </td>
                                <td class="expertise-skills-cell">
                                    @foreach($cvInformation['competences'] as $index => $competence)
                                        @if($index >= count($cvInformation['competences']) / 2)
                                            <span class="skill-tag">
                                                {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                            </span>
                                        @endif
                                    @endforeach
                                </td>
                            </tr>
                        </table>
                    </div>
                @endif

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
                                    <tr class="experience-header">
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
                                        <td colspan="2" class="experience-content-cell">
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

                {{-- Languages Section --}}
                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <div class="section">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                        <table class="language-table">
                            @foreach($cvInformation['languages'] ?? [] as $language)
                                <tr class="language-row">
                                    <td class="language-name-cell">{{ $language['name'] ?? '' }}</td>
                                    <td class="language-level-cell">
                                        <div class="language-level-bar">
                                            @php
                                                $levelWidth = 60; // Default percentage
                                                
                                                if (isset($language['level'])) {
                                                    $level = strtolower($language['level']);
                                                    
                                                    if (strpos($level, 'débutant') !== false || strpos($level, 'beginner') !== false) {
                                                        $levelWidth = 25;
                                                    } elseif (strpos($level, 'intermédiaire') !== false || strpos($level, 'intermediate') !== false) {
                                                        $levelWidth = 50;
                                                    } elseif (strpos($level, 'avancé') !== false || strpos($level, 'advanced') !== false) {
                                                        $levelWidth = 75;
                                                    } elseif (strpos($level, 'natif') !== false || strpos($level, 'native') !== false || strpos($level, 'fluent') !== false || strpos($level, 'courant') !== false) {
                                                        $levelWidth = 100;
                                                    }
                                                }
                                            @endphp
                                            <div class="language-level-value" style="width: {{ $levelWidth }}%"></div>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </table>
                    </div>
                @endif

                {{-- Education and Certifications --}}
                <table class="cert-edu-table">
                    <tr>
                        {{-- Education Column --}}
                        <td class="cert-edu-left-cell">
                            @foreach($experiencesByCategory as $category => $experiences)
                                @if($category == 'Éducation' || $category == 'Education')
                                    <div class="section">
                                        <div class="section-title">
                                            {{ $currentLocale === 'fr' ? 'Formation' : 'Education' }}
                                        </div>
                                        
                                        @foreach($experiences as $experience)
                                            <table class="edu-cert-item-table">
                                                <tr>
                                                    <td class="edu-cert-date-cell">
                                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }}
                                                        @if($experience['date_end'])
                                                            - {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                                        @endif
                                                    </td>
                                                    <td class="edu-cert-content-cell">
                                                        <div class="edu-cert-title">{{ $experience['name'] }}</div>
                                                        <div class="edu-cert-institution">{{ $experience['InstitutionName'] }}</div>
                                                    </td>
                                                </tr>
                                            </table>
                                        @endforeach
                                    </div>
                                @endif
                            @endforeach
                        </td>

                        {{-- Interests and Hobbies --}}
                        <td class="cert-edu-right-cell">
                            @if(!empty($cvInformation['hobbies']))
                                <div class="section">
                                    <div class="section-title">
                                        {{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Interests' }}
                                    </div>
                                    
                                    <table class="expertise-table">
                                        <tr class="expertise-row">
                                            <td class="expertise-skills-cell">
                                                @foreach($cvInformation['hobbies'] as $hobby)
                                                    <span class="skill-tag">
                                                        {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                                                    </span>
                                                @endforeach
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    {{-- Footer --}}
    <div class="footer">
        {{ $currentLocale === 'fr' ? 'Curriculum Vitae Industriel | ' : 'Industrial Curriculum Vitae | ' }} 
        {{ $cvInformation['personalInformation']['firstName'] }}
    </div>
</div>
</body>
</html>
@endsection 