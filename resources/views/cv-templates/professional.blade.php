@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.15;
            font-size: 9pt;
            color: #333;
        }

        .cv-container {
            width: 170mm;
            margin: 0 auto;
            padding: 5mm;
            background: white;
        }

        /* Header */
        .header-content {
            position: relative;
            border-bottom: 0.3mm solid #2979ff;
            margin-bottom: 3mm;
            padding-bottom: 3mm;
        }

        .header-content h1 {
            font-size: 14pt;
            font-weight: bold;
            color: #2979ff;
            margin-bottom: 1mm;
        }

        .profession {
            font-size: 10pt;
            color: #455a64;
            margin-bottom: 2mm;
        }

        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm 4mm;
        }

        .contact-item {
            display: flex;
            align-items: center;
            font-size: 8pt;
            color: #546e7a;
        }

        .contact-item i {
            margin-right: 1mm;
            color: #2979ff;
        }

        /* Sections */
        section {
            margin-bottom: 3mm;
            page-break-inside: avoid;
        }

        h2 {
            font-size: 10pt;
            font-weight: bold;
            color: #2979ff;
            margin-bottom: 2mm;
            border-bottom: 0.2mm solid #e0e0e0;
            padding-bottom: 0.5mm;
        }

        /* Summary Section */
        .summary-content {
            background-color: #f5f7fa;
            padding: 2mm;
            border-radius: 1mm;
            border-left: 0.5mm solid #2979ff;
            line-height: 1.3;
            text-align: justify;
            font-size: 8.5pt;
            color: #444;
            margin-bottom: 1mm;
        }

        /* Experience Items */
        .experience-item {
            margin-bottom: 2mm;
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

        .experience-title {
            font-size: 9pt;
            font-weight: bold;
            color: #455a64;
            margin-bottom: 0.3mm;
        }

        .company {
            font-style: italic;
            font-size: 8pt;
            color: #607d8b;
            margin-bottom: 0.7mm;
        }

        .dates {
            font-size: 8pt;
            color: #78909c;
            text-align: right;
            min-width: 20%;
        }

        .description {
            font-size: 8pt;
            line-height: 1.3;
            text-align: justify;
            color: #444;
        }

        /* Skills, Languages and Hobbies */
        .skills-grid, .hobbies-grid, .languages-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 1mm;
        }

        .skill-item, .hobby-item, .language-item {
            background-color: #f5f7fa;
            padding: 1mm 1.5mm;
            border-radius: 1mm;
            font-size: 8pt;
            color: #455a64;
            border-left: 0.3mm solid #2979ff;
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
    <div class="header-content">
        <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
        <div class="profession">
            {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
        </div>
        <div class="contact-info">
            @if($cvInformation['personalInformation']['email'])
                <div class="contact-item">
                    <i>📧</i>
                    <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                </div>
            @endif
            @if($cvInformation['personalInformation']['phone'])
                <div class="contact-item">
                    <i>📱</i>
                    <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                </div>
            @endif
            @if($cvInformation['personalInformation']['address'])
                <div class="contact-item">
                    <i>📍</i>
                    <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                </div>
            @endif
            @if($cvInformation['personalInformation']['linkedin'])
                <div class="contact-item">
                    <i>🔗</i>
                    <span>{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                </div>
            @endif
            @if($cvInformation['personalInformation']['github'])
                <div class="contact-item">
                    <i>🔗</i>
                    <span>{{ $cvInformation['personalInformation']['github'] }}</span>
                </div>
            @endif
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
        <section class="summary">
            <h2>{{ $currentLocale === 'fr' ? 'Résumé Professionnel' : 'Professional Summary' }}</h2>
            <div class="summary-content">
                <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </div>
        </section>
    @endif

    @foreach($experiencesByCategory as $category => $experiences)
        <section class="experiences">
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
                        <div>
                            <div class="experience-title">{{ $experience['name'] }}</div>
                            <div class="company">{{ $experience['InstitutionName'] }}</div>
                        </div>
                        <div class="dates">
                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - 
                            @if($experience['date_end'])
                                {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                            @else
                                {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                            @endif
                        </div>
                    </div>
                    <p class="description">{{ $experience['description'] }}</p>
                    @if($experience['output'])
                        <p class="description" style="margin-top: 1mm;">{{ $experience['output'] }}</p>
                    @endif
                </div>
            @endforeach
        </section>
    @endforeach

    @if(!empty($cvInformation['competences']))
        <section class="competences">
            <h2>{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</h2>
            <div class="skills-grid">
                @foreach($cvInformation['competences'] as $competence)
                    <div class="skill-item">
                        {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                    </div>
                @endforeach
            </div>
        </section>
    @endif

    @if(!empty($cvInformation['languages']))
        <section class="languages">
            <h2>{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</h2>
            <div class="languages-grid">
                @foreach($cvInformation['languages'] ?? [] as $language)
                    <div class="language-item">
                        {{ $language['name'] ?? '' }}
                        @if(isset($language['level']))
                            - {{ $language['level'] ?? '' }}
                        @endif
                    </div>
                @endforeach
            </div>
        </section>
    @endif

    @if(!empty($cvInformation['hobbies']))
        <section class="hobbies">
            <h2>{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies & Interests' }}</h2>
            <div class="hobbies-grid">
                @foreach($cvInformation['hobbies'] as $hobby)
                    <div class="hobby-item">
                        {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                    </div>
                @endforeach
            </div>
        </section>
    @endif
</div>
</body>
</html>
@endsection
