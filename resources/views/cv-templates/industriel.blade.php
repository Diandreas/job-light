@extends('layouts.cv')

@section('content')
    <!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page { margin: 8mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.15;
            font-size: 9pt;
            color: #333;
        }

        .cv-container {
            width: 190mm;
            margin: 0 auto;
            padding: 8mm;
            background: white;
        }

        /* Header Styling */
        .header-section {
            margin-bottom: 3mm;
        }

        .header-bg {
            height: 20mm;
            background-color: #455a64;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            position: relative;
            margin-bottom: 10mm;
        }

        .name-section {
            position: relative;
            margin-top: -18mm;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .name-content {
            padding-left: 8mm;
        }

        .name {
            font-size: 14pt;
            font-weight: bold;
            color: #FFFFFF;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.2);
            margin-bottom: 1mm;
        }

        .profession {
            font-size: 10pt;
            color: #e0e0e0;
            margin-bottom: 1mm;
        }

        /* Photo Styling */
        .photo-container {
            width: 26mm;
            height: 26mm;
            overflow: hidden;
            border: 1mm solid #FFFFFF;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            margin-right: 8mm;
            background-color: #FFFFFF;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Contact Information */
        .contact-bar {
            background-color: #f5f7fa;
            padding: 2mm 8mm;
            margin-top: 5mm;
            border-top: 0.3mm solid #546e7a;
            border-bottom: 0.3mm solid #546e7a;
            display: flex;
            flex-wrap: wrap;
            gap: 4mm;
        }

        .contact-item {
            font-size: 8pt;
            color: #455a64;
            display: flex;
            align-items: center;
        }

        .contact-icon {
            margin-right: 1mm;
        }

        /* Section Styling */
        h2 {
            font-size: 10pt;
            font-weight: bold;
            color: #455a64;
            margin-bottom: 2mm;
            border-bottom: 0.2mm solid #e0e0e0;
            padding-bottom: 0.5mm;
            text-transform: uppercase;
        }

        section {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }

        /* Summary Styling */
        .summary {
            background-color: #f5f7fa;
            padding: 2mm;
            border-radius: 1mm;
            margin-bottom: 3mm;
            border-left: 0.5mm solid #546e7a;
            font-size: 8.5pt;
            line-height: 1.3;
            text-align: justify;
        }

        /* Experience Styling */
        .experience-item {
            margin-bottom: 2.5mm;
            padding-bottom: 1.5mm;
            border-bottom: 0.2mm dotted #e0e0e0;
        }

        .experience-item:last-child {
            border-bottom: none;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
        }

        .title-company {
            flex: 1;
        }

        .experience-title {
            font-weight: bold;
            font-size: 9pt;
            color: #455a64;
            margin-bottom: 0.3mm;
        }

        .experience-company {
            font-style: italic;
            font-size: 8pt;
            color: #607d8b;
        }

        .experience-date {
            font-size: 8pt;
            color: #78909c;
            text-align: right;
            min-width: 20%;
        }

        .experience-description {
            font-size: 8pt;
            line-height: 1.3;
            text-align: justify;
            color: #444;
            margin-top: 1mm;
        }

        /* Skills and Items Styling */
        .skills-list, .hobbies-list, .language-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 1.5mm;
        }

        .skill-item, .hobby-item {
            background-color: #f5f7fa;
            padding: 1mm 1.5mm;
            border-radius: 1mm;
            font-size: 8pt;
            color: #455a64;
            border-left: 0.3mm solid #546e7a;
        }

        .language-item {
            background-color: #f5f7fa;
            padding: 1mm 1.5mm;
            border-radius: 1mm;
            font-size: 8pt;
            margin-bottom: 1mm;
            display: inline-flex;
            align-items: center;
        }

        .language-name {
            font-weight: bold;
            color: #455a64;
        }

        .language-level {
            color: #78909c;
            font-style: italic;
            margin-left: 1mm;
        }

        /* Education Styling */
        .education-item {
            margin-bottom: 2mm;
        }

        .education-title {
            font-weight: bold;
            font-size: 8.5pt;
            color: #455a64;
        }

        .education-institution {
            font-style: italic;
            font-size: 8pt;
            color: #607d8b;
        }

        .education-date {
            font-size: 7.5pt;
            color: #78909c;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
            }
            .cv-container {
                margin: 0 auto;
                box-shadow: none;
            }
            section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
<div class="cv-container">
    <div class="header-section">
        <div class="header-bg"></div>
        
        <div class="name-section">
            <div class="name-content">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </div>
            
            @if($cvInformation['personalInformation']['photo'])
                <div class="photo-container">
                    <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                         alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                </div>
            @endif
        </div>
        
        <div class="contact-bar">
            @if($cvInformation['personalInformation']['email'])
                <span class="contact-item">
                    <span class="contact-icon">📧</span>
                    {{ $cvInformation['personalInformation']['email'] }}
                </span>
            @endif
            @if($cvInformation['personalInformation']['phone'])
                <span class="contact-item">
                    <span class="contact-icon">📱</span>
                    {{ $cvInformation['personalInformation']['phone'] }}
                </span>
            @endif
            @if($cvInformation['personalInformation']['address'])
                <span class="contact-item">
                    <span class="contact-icon">📍</span>
                    {{ $cvInformation['personalInformation']['address'] }}
                </span>
            @endif
            @if($cvInformation['personalInformation']['linkedin'])
                <span class="contact-item">
                    <span class="contact-icon">🔗</span>
                    {{ $cvInformation['personalInformation']['linkedin'] }}
                </span>
            @endif
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
        <section>
            <h2>{{ $currentLocale === 'fr' ? 'Résumé Professionnel' : 'Professional Summary' }}</h2>
            <div class="summary">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</div>
        </section>
    @endif

    @foreach($experiencesByCategory as $category => $experiences)
        @if($category != 'Éducation' && $category != 'Education')
            <section>
                <h2>
                    @if($currentLocale === 'fr')
                        {{ $category }}
                    @else
                        {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                    @endif
                </h2>
                
                @foreach($experiences as $experience)
                    <div class="experience-item">
                        <div class="experience-header">
                            <div class="title-company">
                                <div class="experience-title">{{ $experience['name'] }}</div>
                                <div class="experience-company">{{ $experience['InstitutionName'] }}</div>
                            </div>
                            <div class="experience-date">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - 
                                @if($experience['date_end'])
                                    {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                @else
                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                @endif
                            </div>
                        </div>
                        <div class="experience-description">{{ $experience['description'] }}</div>
                        @if($experience['output'])
                            <div class="experience-description" style="margin-top: 1mm;">{{ $experience['output'] }}</div>
                        @endif
                    </div>
                @endforeach
            </section>
        @endif
    @endforeach

    @foreach($experiencesByCategory as $category => $experiences)
        @if($category == 'Éducation' || $category == 'Education')
            <section>
                <h2>
                    @if($currentLocale === 'fr')
                        {{ $category }}
                    @else
                        {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                    @endif
                </h2>
                
                @foreach($experiences as $experience)
                    <div class="education-item">
                        <div class="education-title">{{ $experience['name'] }}</div>
                        <div class="education-institution">{{ $experience['InstitutionName'] }}</div>
                        <div class="education-date">
                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }}
                            @if($experience['date_end'])
                                - {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                            @else
                                - {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                            @endif
                        </div>
                    </div>
                @endforeach
            </section>
        @endif
    @endforeach

    @if(!empty($cvInformation['competences']))
        <section>
            <h2>{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</h2>
            <div class="skills-list">
                @foreach($cvInformation['competences'] as $competence)
                    <span class="skill-item">
                        {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                    </span>
                @endforeach
            </div>
        </section>
    @endif

    @if(!empty($cvInformation['languages']))
        <section>
            <h2>{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</h2>
            <div class="language-list">
                @foreach($cvInformation['languages'] ?? [] as $language)
                    <div class="language-item">
                        <span class="language-name">{{ $language['name'] ?? '' }}</span>
                        @if(isset($language['level']))
                            <span class="language-level">- {{ $language['level'] ?? '' }}</span>
                        @endif
                    </div>
                @endforeach
            </div>
        </section>
    @endif

    @if(!empty($cvInformation['hobbies']))
        <section>
            <h2>{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies & Interests' }}</h2>
            <div class="hobbies-list">
                @foreach($cvInformation['hobbies'] as $hobby)
                    <span class="hobby-item">
                        {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                    </span>
                @endforeach
            </div>
        </section>
    @endif
</div>
</body>
</html>
@endsection 