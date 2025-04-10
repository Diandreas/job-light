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
            font-family: Arial, 'DejaVu Sans', sans-serif;
            line-height: 1.15;
            font-size: 11pt;
            color: #2c3e50;
            margin: 0;
            padding: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            vertical-align: top;
            padding: 2mm;
        }

        .main-table {
            width: 170mm;
        }

        .sidebar {
            width: 60mm;
            background-color: #3498db;
            color: white;
        }

        .profile-photo {
            width: 35mm;
            height: 35mm;
            margin: 0 auto 4mm auto;
            border: 2mm solid white;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
        }

        .contact-item {
            margin-bottom: 2mm;
            padding-left: 5mm;
            font-size: 10pt;
        }

        .section-title {
            font-size: 14pt;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            margin: 4mm 0 2mm 0;
            padding-bottom: 1mm;
            border-bottom: 0.5mm solid #ffffff;
        }

        /* Language Section */
        .language-section {
            margin-top: 3mm;
            padding: 3mm;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 2mm;
            border-left: 1mm solid rgba(255, 255, 255, 0.3);
        }

        .language-title {
            color: white;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
        }

        .language-items {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }

        .language-item {
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 1mm;
            padding: 1mm 2mm;
            margin-bottom: 1mm;
            font-size: 10pt;
            color: rgba(255, 255, 255, 0.9);
        }

        .language-level {
            color: rgba(255, 255, 255, 0.7);
            font-weight: 600;
            margin-left: 1mm;
        }

        .skill-item, .hobby-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 1.5mm 2.5mm;
            margin-bottom: 1.5mm;
            font-size: 10pt;
        }

        .header-name {
            font-size: 16pt;
            color: #3498db;
            text-transform: uppercase;
            margin-bottom: 2mm;
        }

        .header-title {
            font-size: 12pt;
            color: #7f8c8d;
            margin-bottom: 4mm;
        }

        .main-section-title {
            font-size: 14pt;
            color: #3498db;
            text-transform: uppercase;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #3498db;
            /* margin: 4mm 0; */
        }

        .summary-box {
            background: #f5f6fa;
            padding: 3mm;
            border-left: 1mm solid #3498db;
            margin-bottom: 4mm;
            font-size: 11pt;
            line-height: 1.15;
            text-align: justify;
        }

        .experience-table {
            width: 130mm;
            page-break-inside: avoid;
            margin-bottom: 2mm;
        }

        .experience-title {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
        }

        .experience-company {
            font-size: 11pt;
            font-style: italic;
            color: #3498db;
        }

        .experience-date {
            font-size: 10pt;
            color: #7f8c8d;
        }

        .experience-description {
            font-size: 10.5pt;
            color: #2c3e50;
            text-align: justify;
            padding-top: 1.5mm;
            line-height: 1.15;
        }

        .separator {
            border-top: 0.2mm solid #bdc3c7;
            margin: 2mm 0;
        }
    </style>
</head>
<body>
<table class="main-table">
    <tr>
        <td class="sidebar">
            @if($cvInformation['personalInformation']['photo'])
                <div class="profile-photo">
                    <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                         alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                </div>
            @endif

            <div class="section-title">Contact</div>
            @if($cvInformation['personalInformation']['email'])
                <div class="contact-item">✉ {{ $cvInformation['personalInformation']['email'] }}</div>
            @endif
            @if($cvInformation['personalInformation']['phone'])
                <div class="contact-item">☎ {{ $cvInformation['personalInformation']['phone'] }}</div>
            @endif
            @if($cvInformation['personalInformation']['address'])
                <div class="contact-item">⌂ {{ $cvInformation['personalInformation']['address'] }}</div>
            @endif
            @if($cvInformation['personalInformation']['linkedin'])
                <div class="contact-item">∞ {{ $cvInformation['personalInformation']['linkedin'] }}</div>
            @endif

            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <div class="language-section">
                    <div class="language-title">{{ __('Languages') }}</div>
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

            @if(!empty($cvInformation['competences']))
                <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                @foreach($cvInformation['competences'] as $competence)
                    <div class="skill-item">
                        {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                    </div>
                @endforeach
            @endif

            @if(!empty($cvInformation['hobbies']))
                <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                @foreach($cvInformation['hobbies'] as $hobby)
                    <div class="hobby-item">
                        {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                    </div>
                @endforeach
            @endif
        </td>
        <td style="padding: 8mm;">
            <div class="header-name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
            <div class="header-title">
                {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
            </div>

            @if(!empty($cvInformation['summaries']))
                <div class="summary-box">
                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                </div>
            @endif

            @foreach($experiencesByCategory as $category => $experiences)
                <div class="main-section-title">
                    @if($currentLocale === 'fr')
                        {{ $category }}
                    @else
                        {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                    @endif
                </div>

                @foreach($experiences as $experience)
                    <table class="experience-table">
                        <tr>
                            <td style="padding: 0;">
                                <div class="experience-title">{{ $experience['name'] }}</div>
                                <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                                <div class="experience-date">
                                    {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                    @if($experience['date_end'])
                                        {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                    @else
                                        {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                    @endif
                                </div>
                                <div class="separator"></div>
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
            @endforeach
        </td>
    </tr>
</table>
</body>
</html>
@endsection
