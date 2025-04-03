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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            font-size: 10pt;
            color: #333;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .cv-container {
            width: 200mm;
            padding: 0;
        }

        /* Layout principal avec sidebar */
        .main-layout {
            display: flex;
            min-height: 277mm; /* Approximativement A4 height - margins */
        }

        .sidebar {
            width: 55mm;
            background-color: #3D5A80;
            color: #fff;
            padding: 5mm;
        }

        .main-content {
            flex: 1;
            padding: 5mm;
            background-color: #fff;
        }

        /* Styles sidebar */
        .profile-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 8mm;
            padding-bottom: 6mm;
            border-bottom: 0.3mm solid rgba(255, 255, 255, 0.3);
        }

        .profile-photo {
            width: 35mm;
            height: 35mm;
            border-radius: 50%;
            overflow: hidden;
            border: 0.8mm solid #E0FBFC;
            margin-bottom: 3mm;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .name-sidebar {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2mm;
            color: #E0FBFC;
        }

        .profession-sidebar {
            font-size: 10pt;
            color: #E0FBFC;
            text-align: center;
            font-style: italic;
            margin-bottom: 2mm;
        }

        .sidebar-section {
            margin-bottom: 6mm;
        }

        .sidebar-title {
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 3mm;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
            color: #E0FBFC;
            padding-bottom: 1mm;
            border-bottom: 0.2mm solid rgba(255, 255, 255, 0.3);
        }

        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 2mm;
            font-size: 9pt;
        }

        .contact-icon {
            margin-right: 2mm;
            font-weight: bold;
            color: #E0FBFC;
        }

        .skill-item, .language-item, .hobby-item {
            margin-bottom: 2mm;
            font-size: 9pt;
            position: relative;
            padding-left: 3mm;
        }

        .skill-item:before, .language-item:before, .hobby-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #E0FBFC;
        }

        .language-level {
            color: #E0FBFC;
            opacity: 0.8;
            font-size: 8pt;
            margin-left: 1mm;
        }

        /* Styles contenu principal */
        .header-main {
            margin-bottom: 6mm;
        }

        .name-main {
            font-size: 18pt;
            font-weight: bold;
            color: #3D5A80;
            margin-bottom: 1mm;
        }

        .profession-main {
            font-size: 12pt;
            color: #293241;
            margin-bottom: 4mm;
        }

        .summary {
            padding: 3mm;
            background-color: #F7F9FB;
            border-left: 1.2mm solid #3D5A80;
            margin-bottom: 6mm;
            text-align: justify;
            font-size: 9.5pt;
            color: #293241;
        }

        .main-section {
            margin-bottom: 6mm;
        }

        .main-section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #3D5A80;
            margin-bottom: 4mm;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid #3D5A80;
        }

        .experience-item {
            margin-bottom: 4mm;
            position: relative;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
        }

        .experience-title {
            font-weight: bold;
            font-size: 11pt;
            color: #293241;
        }

        .experience-date {
            font-size: 9pt;
            color: #3D5A80;
            font-weight: 600;
        }

        .company {
            font-style: italic;
            color: #3D5A80;
            margin-bottom: 1.5mm;
            font-size: 10pt;
        }

        .description {
            text-align: justify;
            font-size: 9pt;
            color: #333;
            line-height: 1.3;
        }

        /* Barre latérale colorée pour expériences */
        .experience-content {
            padding-left: 3mm;
            border-left: 0.5mm solid #98C1D9;
        }
    </style>
</head>
<body>
<div class="cv-container">
    <div class="main-layout">
        {{-- Sidebar --}}
        <div class="sidebar">
            {{-- Photo et nom dans la sidebar --}}
            <div class="profile-section">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                    </div>
                @endif
                <div class="name-sidebar">{{ $cvInformation['personalInformation']['firstName'] ?? '' }}</div>
                <div class="profession-sidebar">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </div>

            {{-- Informations de contact --}}
            <div class="sidebar-section">
                <div class="sidebar-title">{{ $currentLocale === 'fr' ? 'Contact' : 'Contact' }}</div>
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-item">
                        <div class="contact-icon">✉</div>
                        {{ $cvInformation['personalInformation']['email'] }}
                    </div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-item">
                        <div class="contact-icon">☎</div>
                        {{ $cvInformation['personalInformation']['phone'] }}
                    </div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <div class="contact-item">
                        <div class="contact-icon">⌂</div>
                        {{ $cvInformation['personalInformation']['address'] }}
                    </div>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">
                        <div class="contact-icon">in</div>
                        {{ $cvInformation['personalInformation']['linkedin'] }}
                    </div>
                @endif
            </div>

            {{-- Compétences --}}
            @if(!empty($cvInformation['competences']))
                <div class="sidebar-section">
                    <div class="sidebar-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                    @foreach($cvInformation['competences'] as $competence)
                        <div class="skill-item">
                            {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                        </div>
                    @endforeach
                </div>
            @endif

            {{-- Langues --}}
            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <div class="sidebar-section">
                    <div class="sidebar-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                    @foreach($cvInformation['languages'] ?? [] as $language)
                        <div class="language-item">
                            {{ $language['name'] ?? '' }}
                            @if(isset($language['level']))
                                <span class="language-level">- {{ $language['level'] ?? '' }}</span>
                            @endif
                        </div>
                    @endforeach
                </div>
            @endif

            {{-- Centres d'intérêt --}}
            @if(!empty($cvInformation['hobbies']))
                <div class="sidebar-section">
                    <div class="sidebar-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <div class="hobby-item">
                            {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        {{-- Contenu principal --}}
        <div class="main-content">
            {{-- En-tête principal --}}
            <div class="header-main">
                <div class="name-main">{{ $cvInformation['personalInformation']['firstName'] ?? '' }}</div>
                <div class="profession-main">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </div>

            {{-- Résumé --}}
            @if(!empty($cvInformation['summaries']))
                <div class="summary">
                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                </div>
            @endif

            {{-- Expériences par catégorie --}}
            @foreach($experiencesByCategory as $category => $experiences)
                <div class="main-section">
                    <div class="main-section-title">
                        @if($currentLocale === 'fr')
                            {{ $category }}
                        @else
                            {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                        @endif
                    </div>

                    @foreach($experiences as $experience)
                        <div class="experience-item">
                            <div class="experience-content">
                                <div class="experience-header">
                                    <div class="experience-title">{{ $experience['name'] }}</div>
                                    <div class="experience-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                    </div>
                                </div>
                                <div class="company">{{ $experience['InstitutionName'] }}</div>
                                <div class="description">
                                    {{ $experience['description'] }}
                                    @if($experience['output'])
                                        <br>{{ $experience['output'] }}
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
            @endforeach
        </div>
    </div>
</div>
</body>
</html>
@endsection