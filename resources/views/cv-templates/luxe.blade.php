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
            margin: 5mm;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'DejaVu Serif', serif;
            line-height: 1.2;
            font-size: 9pt;
            color: #111111;
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

        /* Borders */
        .border-container {
            border: 0.5mm solid #D4AF37 !important;
            margin: 4mm;
            padding: 4mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .inner-container {
            border: 0.2mm solid #D4AF37 !important;
            margin: 2mm;
            padding: 6mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Header Styling */
        .header-table {
            width: 100%;
            margin-bottom: 6mm;
        }

        .monogram-cell {
            width: 18%;
            text-align: center;
        }

        .monogram {
            font-size: 20pt;
            font-weight: bold;
            color: #D4AF37 !important;
            border: 1.5mm solid #D4AF37 !important;
            border-radius: 50%;
            width: 15mm;
            height: 15mm;
            line-height: 15mm;
            margin: 0 auto;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .name-cell {
            width: 64%;
            text-align: center;
        }

        .photo-cell {
            width: 18%;
            text-align: center;
        }

        .name {
            font-size: 16pt;
            font-weight: normal;
            color: #111111;
            text-transform: uppercase;
            letter-spacing: 2pt;
            margin-bottom: 1.5mm;
        }

        .profession {
            font-size: 9pt;
            color: #D4AF37 !important;
            text-transform: uppercase;
            letter-spacing: 1pt;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Photo Styling */
        .photo-container {
            width: 20mm;
            height: 20mm;
            overflow: hidden;
            border: 0.5mm solid #D4AF37 !important;
            margin: 0 auto;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Divider */
        .divider {
            border-top: 0.2mm solid #D4AF37 !important;
            margin: 3mm 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Contact Information */
        .contact-table {
            width: 100%;
            margin-bottom: 3mm;
            text-align: center;
        }

        .contact-item {
            display: inline-block;
            margin: 0 2mm;
            font-size: 8pt;
            color: #111111;
            letter-spacing: 0.5pt;
        }

        /* Main Layout */
        .main-table {
            width: 100%;
        }

        /* Section Styling */
        .section {
            margin-bottom: 5mm;
        }

        .section-title {
            font-size: 10pt;
            font-weight: normal;
            color: #D4AF37 !important;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 1.5pt;
            text-align: center;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Summary Section */
        .summary {
            font-size: 8.5pt;
            color: #111111;
            line-height: 1.4;
            text-align: center;
            margin-bottom: 3mm;
            font-style: italic;
        }

        /* Experience Styling */
        .experience-table {
            width: 100%;
            margin-bottom: 3mm;
        }

        .experience-left-cell {
            width: 28%;
            padding-right: 2%;
            text-align: right;
            border-right: 0.2mm solid #D4AF37 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .experience-right-cell {
            width: 70%;
            padding-left: 2%;
        }

        .experience-date {
            font-size: 8pt;
            color: #111111;
            font-style: italic;
        }

        .experience-company {
            font-size: 8pt;
            color: #111111;
            margin-top: 1mm;
            font-weight: bold;
        }

        .experience-title {
            font-size: 9pt;
            font-weight: normal;
            color: #111111;
            margin-bottom: 1mm;
        }

        .experience-description {
            font-size: 8pt;
            color: #333333;
            line-height: 1.3;
            text-align: justify;
        }

        /* Skills and Languages Layout */
        .two-column-table {
            width: 100%;
            margin-bottom: 3mm;
        }

        .column-left-cell {
            width: 48%;
            padding-right: 2%;
            border-right: 0.2mm solid #D4AF37 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .column-right-cell {
            width: 48%;
            padding-left: 2%;
        }

        /* Skills Styling */
        .skill-item {
            margin-bottom: 1.5mm;
        }

        .skill-name {
            font-size: 8.5pt;
            font-weight: normal;
            color: #111111;
            margin-bottom: 0.8mm;
        }

        .skill-bar-container {
            height: 0.5mm;
            background-color: #EEEEEE;
            position: relative;
        }

        .skill-bar {
            height: 100%;
            background-color: #D4AF37 !important;
            position: absolute;
            top: 0;
            left: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Language Section */
        .language-item {
            margin-bottom: 1.5mm;
            text-align: left;
        }
        
        .language-name {
            font-size: 8.5pt;
            color: #111111;
            display: inline-block;
        }
        
        .language-level {
            font-size: 7.5pt;
            color: #333333;
            display: inline-block;
            font-style: italic;
            margin-left: 1.5mm;
        }

        /* Hobbies Section */
        .hobbies-container {
            text-align: center;
        }

        .hobby-item {
            display: inline-block;
            margin: 0 1.5mm;
            font-size: 8pt;
            color: #333333;
            font-style: italic;
        }

        /* Footer */
        .footer {
            text-align: center;
            font-size: 7pt;
            color: #777777;
            margin-top: 4mm;
            font-style: italic;
        }
    </style>
</head>
<body>
<div class="cv-container">
    <div class="border-container">
        <div class="inner-container">
            {{-- Header --}}
            <table class="header-table">
                <tr>
                    <td class="monogram-cell">
                        <div class="monogram">{{ substr($cvInformation['personalInformation']['firstName'] ?? 'CV', 0, 1) }}</div>
                    </td>
                    <td class="name-cell">
                        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                        <div class="profession">
                            {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                        </div>
                    </td>
                    <td class="photo-cell">
                        @if($cvInformation['personalInformation']['photo'])
                            <div class="photo-container">
                                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                                     alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                            </div>
                        @endif
                    </td>
                </tr>
            </table>

            <div class="divider"></div>

            {{-- Contact Information --}}
            <div class="contact-table">
                <table>
                    <tr>
                        @if($cvInformation['personalInformation']['email'])
                            <td style="width: 25%; text-align: center;"><span class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</span></td>
                        @endif
                        @if($cvInformation['personalInformation']['phone'])
                            <td style="width: 25%; text-align: center;"><span class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</span></td>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <td style="width: 25%; text-align: center;"><span class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</span></td>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <td style="width: 25%; text-align: center;"><span class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</span></td>
                        @endif
                    </tr>
                </table>
            </div>

            {{-- Summary Section --}}
            @if(!empty($cvInformation['summaries']))
                <div class="section">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'Profil' : 'Profile' }}</div>
                    <div class="summary">
                        {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                    </div>
                </div>
                <div class="divider"></div>
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
                                <tr>
                                    <td class="experience-left-cell">
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
                                    <td class="experience-right-cell">
                                        <div class="experience-title">{{ $experience['name'] }}</div>
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
                    <div class="divider"></div>
                @endif
            @endforeach

            {{-- Skills and Languages in Two Columns --}}
            <table class="two-column-table">
                <tr>
                    {{-- Skills Section --}}
                    @if(!empty($cvInformation['competences']))
                        <td class="column-left-cell">
                            <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                            @foreach($cvInformation['competences'] as $index => $competence)
                                <div class="skill-item">
                                    <div class="skill-name">
                                        {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                    </div>
                                    <div class="skill-bar-container">
                                        <div class="skill-bar" style="width: {{ min((($index + 1) % 5 + 2) * 17, 100) }}%"></div>
                                    </div>
                                </div>
                            @endforeach
                        </td>
                    @endif

                    {{-- Languages and Education Section --}}
                    <td class="column-right-cell">
                        {{-- Languages Section --}}
                        @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                            <div class="section-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                            @foreach($cvInformation['languages'] ?? [] as $language)
                                <div class="language-item">
                                    <div class="language-name">{{ $language['name'] ?? '' }}</div>
                                    @if(isset($language['level']))
                                        <div class="language-level">- {{ $language['level'] ?? '' }}</div>
                                    @endif
                                </div>
                            @endforeach

                            <div style="margin-bottom: 3mm;"></div>
                        @endif

                        {{-- Education Section --}}
                        @foreach($experiencesByCategory as $category => $experiences)
                            @if($category == 'Éducation' || $category == 'Education')
                                <div class="section-title">
                                    @if($currentLocale === 'fr')
                                        {{ $category }}
                                    @else
                                        {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                                    @endif
                                </div>

                                @foreach($experiences as $experience)
                                    <div class="language-item">
                                        <div class="language-name">{{ $experience['name'] }}</div>
                                        <div class="language-level">{{ $experience['InstitutionName'] }}</div>
                                    </div>
                                @endforeach
                            @endif
                        @endforeach
                    </td>
                </tr>
            </table>

            <div class="divider"></div>

            {{-- Hobbies Section --}}
            @if(!empty($cvInformation['hobbies']))
                <div class="section">
                    <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Interests' }}</div>
                    <div class="hobbies-container">
                        @foreach($cvInformation['hobbies'] as $index => $hobby)
                            <span class="hobby-item">
                                {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                                @if($index < count($cvInformation['hobbies']) - 1)
                                    &bull;
                                @endif
                            </span>
                        @endforeach
                    </div>
                </div>
            @endif

            {{-- Footer --}}
            <div class="footer">
                {{ $currentLocale === 'fr' ? 'Curriculum Vitae de ' : 'Curriculum Vitae of ' }} {{ $cvInformation['personalInformation']['firstName'] }}
            </div>
        </div>
    </div>
</div>
</body>
</html>
@endsection 