@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV Archives Professionnel</title>
    <style>
        @php
            // Couleurs APIDCA - Bleu institutionnel et doré
            $primaryColor = $cvInformation['primary_color'] ?? '#1e40af'; // Bleu professionnel
            $accentColor = '#f59e0b'; // Doré APIDCA
            $lightBlue = '#dbeafe';
            $darkBlue = '#1e3a8a';
        @endphp

        @page {
            margin: 10mm;
            size: A4;
        }

        body {
            font-family: 'DejaVu Sans', 'Segoe UI', sans-serif;
            line-height: 1.4;
            font-size: 10pt;
            color: #1f2937;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .cv-container {
            width: 100%;
            margin: 0 auto;
            background: #ffffff;
            position: relative;
        }

        /* Header avec logo APIDCA */
        .header {
            background: linear-gradient(135deg, {{ $primaryColor }} 0%, {{ $darkBlue }} 100%);
            color: white;
            padding: 4mm;
            margin-bottom: 4mm;
            border-radius: 2mm;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 60mm;
            height: 60mm;
            background: rgba(245, 158, 11, 0.1);
            border-radius: 50%;
            z-index: 1;
        }

        .header-content {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-left {
            flex: 1;
        }

        .header-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2mm;
        }

        .apidca-logo {
            background: white;
            padding: 2mm;
            border-radius: 1mm;
            font-weight: bold;
            color: {{ $primaryColor }};
            font-size: 8pt;
            text-align: center;
            border: 1px solid {{ $accentColor }};
            box-shadow: 0 1mm 2mm rgba(0,0,0,0.1);
        }

        .name {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 1mm;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .profession {
            font-size: 12pt;
            opacity: 0.9;
            font-weight: 300;
        }

        .contact-info {
            font-size: 9pt;
            opacity: 0.9;
            margin-top: 2mm;
            display: flex;
            flex-wrap: wrap;
            gap: 3mm;
        }

        .contact-info div {
            margin-bottom: 0.5mm;
        }
        
        .contact-info a {
            color: inherit;
            text-decoration: none;
        }

        /* Sections */
        .section {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            color: {{ $primaryColor }};
            border-bottom: 1pt solid {{ $accentColor }};
            padding-bottom: 1mm;
            margin-bottom: 3mm;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -1pt;
            left: 0;
            width: 15mm;
            height: 1pt;
            background: {{ $primaryColor }};
        }

        /* Profil professionnel */
        .profile-summary {
            background: {{ $lightBlue }};
            padding: 3mm;
            border-radius: 2mm;
            border-left: 2mm solid {{ $primaryColor }};
            font-style: italic;
            text-align: justify;
        }

        /* Expériences */
        .experience-item {
            margin-bottom: 3mm;
            padding-left: 3mm;
            border-left: 1pt solid {{ $lightBlue }};
            position: relative;
        }

        .experience-item::before {
            content: '';
            position: absolute;
            left: -2pt;
            top: 1mm;
            width: 3pt;
            height: 3pt;
            background: {{ $accentColor }};
            border-radius: 50%;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 1mm;
        }

        .experience-title {
            font-weight: bold;
            color: {{ $primaryColor }};
            font-size: 11pt;
        }

        .experience-company {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5mm;
        }

        .experience-date {
            font-size: 9pt;
            color: #6b7280;
            font-style: italic;
        }

        .experience-description {
            text-align: justify;
            margin-top: 1mm;
            line-height: 1.3;
        }

        /* Compétences spécialisées archives */
        .competences-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2mm;
            margin-top: 2mm;
        }

        .competence-category {
            background: #f8fafc;
            padding: 2mm;
            border-radius: 1mm;
            border-left: 2mm solid {{ $primaryColor }};
        }

        .competence-category-title {
            font-weight: bold;
            color: {{ $primaryColor }};
            font-size: 9pt;
            margin-bottom: 1mm;
            text-transform: uppercase;
        }

        .competence-list {
            font-size: 9pt;
            line-height: 1.2;
        }

        .competence-item {
            margin-bottom: 0.5mm;
            position: relative;
            padding-left: 3mm;
        }

        .competence-item::before {
            content: '▪';
            position: absolute;
            left: 0;
            color: {{ $accentColor }};
            font-weight: bold;
        }

        /* Formation */
        .formation-item {
            background: #fefefe;
            padding: 2mm;
            border-radius: 1mm;
            border: 1pt solid {{ $lightBlue }};
            margin-bottom: 2mm;
        }

        .formation-title {
            font-weight: bold;
            color: {{ $primaryColor }};
            font-size: 10pt;
        }

        .formation-institution {
            color: #4b5563;
            font-size: 9pt;
            margin-top: 0.5mm;
        }

        /* Langues */
        .languages-container {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
            margin-top: 2mm;
        }

        .language-item {
            background: {{ $lightBlue }};
            padding: 1mm 2mm;
            border-radius: 1mm;
            font-size: 9pt;
            border: 1pt solid {{ $primaryColor }};
        }

        .language-name {
            font-weight: bold;
            color: {{ $primaryColor }};
        }

        .language-level {
            color: #6b7280;
            font-size: 8pt;
        }

        /* Footer APIDCA */
        .apidca-footer {
            margin-top: 5mm;
            padding: 2mm;
            background: linear-gradient(to right, {{ $lightBlue }}, #ffffff);
            border-radius: 1mm;
            text-align: center;
            font-size: 8pt;
            color: {{ $primaryColor }};
            border: 1pt solid {{ $primaryColor }};
        }

        /* Responsive adjustments */
        @media print {
            .cv-container {
                width: 100%;
                margin: 0;
            }
        }

        /* Spécialisations archives */
        .archives-highlight {
            background: linear-gradient(90deg, {{ $accentColor }}22, transparent);
            padding: 1mm;
            border-radius: 1mm;
        }
    </style>
    <x-cv-editable-css />
</head>
<body>
    <div class="cv-container">
        <!-- Header avec informations personnelles -->
        <div class="header">
            <div class="header-content">
                <div class="header-left">
                    <div class="name">
                        {{ $cvInformation['personalInformation']['firstName'] ?? '' }} 
                        {{ $cvInformation['personalInformation']['lastName'] ?? '' }}
                    </div>
                    <div class="profession">
                        {{ $currentLocale === 'en' ? ($cvInformation['professions'][0]['name_en'] ?? $cvInformation['professions'][0]['name']) : $cvInformation['professions'][0]['name'] }}
                    </div>
                    <div class="contact-info">
                        @if(!empty($cvInformation['personalInformation']['email']))
                            <div>📧 {{ $cvInformation['personalInformation']['email'] }}</div>
                        @endif
                        @if(!empty($cvInformation['personalInformation']['phone']))
                            <div>📞 {{ $cvInformation['personalInformation']['phone'] }}</div>
                        @endif
                        @if(!empty($cvInformation['personalInformation']['address']))
                            <div>📍 {{ $cvInformation['personalInformation']['address'] }}</div>
                        @endif
                        @if(!empty($cvInformation['personalInformation']['linkedin']))
                            <div>🔗 <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" target="_blank">{{ $cvInformation['personalInformation']['linkedin'] }}</a></div>
                        @endif
                        @if(!empty($cvInformation['personalInformation']['github']))
                            <div>🐱 <a href="{{ $cvInformation['personalInformation']['github'] }}" target="_blank">{{ $cvInformation['personalInformation']['github'] }}</a></div>
                        @endif
                    </div>
                </div>
                <div class="header-right">
                    @if(!empty($cvInformation['personalInformation']['photo']))
                        <div class="photo-container" style="width: 30mm; height: 35mm; border: 1px solid white; border-radius: 1mm; overflow: hidden; background: white;">
                            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" 
                                 alt="Photo" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    @endif
                    <div class="apidca-logo">
                        <div style="font-weight: bold; font-size: 9pt;">APIDCA</div>
                        <div style="font-size: 7pt;">Association Professionnelle</div>
                        <div style="font-size: 7pt;">des Archivistes</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profil professionnel -->
        @if(!empty($cvInformation['summaries']))
            <div class="section">
                <div class="section-title">{{ __('cv.profile') }}</div>
                <div class="profile-summary content-text">
                    {!! $cvInformation['summaries'][0]['description'] ?? '' !!}
                </div>
            </div>
        @endif

        <!-- Expériences professionnelles -->
        @php
            $prof_experiences = [];
            foreach($experiencesByCategory as $category => $experiences) {
                $prof_experiences = array_merge($prof_experiences, $experiences);
            }
        @endphp

        @if(!empty($prof_experiences))
            <div class="section">
                <div class="section-title">{{ __('cv.experience') }}</div>
                @foreach($prof_experiences as $experience)
                    <div class="experience-item {{ in_array(strtolower($experience['name'] ?? ''), ['archiviste', 'documentaliste', 'conservateur', 'bibliothécaire']) ? 'archives-highlight' : '' }}">
                        <div class="experience-header">
                            <div>
                                <div class="experience-title">{{ $experience['name'] ?? '' }}</div>
                                <div class="experience-company">{{ $experience['InstitutionName'] ?? '' }}</div>
                            </div>
                            <div class="experience-date">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                @if(!empty($experience['date_end']))
                                    - {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                @else
                                    - {{ __('cv.present') }}
                                @endif
                            </div>
                        </div>
                        @if(!empty($experience['description']))
                            <div class="experience-description content-text">{!! $experience['description'] !!}</div>
                        @endif
                    </div>
                @endforeach
            </div>
        @endif

        <!-- Compétences spécialisées archives -->
        @if(!empty($cvInformation['competences']) && count($cvInformation['competences']) > 0)
            <div class="section">
                <div class="section-title">{{ __('cv.skills') }}</div>
                <div class="competences-grid">
                    <div class="competence-category">
                        <div class="competence-category-title">{{ __('cv.skills') }}</div>
                        <div class="competence-list">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="competence-item">{{ $currentLocale === 'en' ? ($competence['name_en'] ?? $competence['name']) : $competence['name'] }}</div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        @endif

        <!-- Formation -->
        @php
            $educations = [];
            $academic_keywords = ['formation', 'académique', 'education', 'étudiant', 'diplôme', 'scolarité'];
            foreach($experiencesByCategory as $category => $experiences) {
                $is_academic = false;
                foreach($academic_keywords as $kw) {
                    if(str_contains(strtolower($category), $kw)) {
                        $is_academic = true; break;
                    }
                }
                if($is_academic) {
                    $educations = array_merge($educations, $experiences);
                }
            }
        @endphp

        @if(!empty($educations))
            <div class="section">
                <div class="section-title">{{ __('cv.education') }}</div>
                @foreach($educations as $edu)
                    <div class="formation-item">
                        <div class="formation-title">{{ $edu['name'] ?? '' }}</div>
                        <div class="formation-institution">{{ $edu['InstitutionName'] }} | {{ \Carbon\Carbon::parse($edu['date_start'])->format('Y') }}</div>
                    </div>
                @endforeach
            </div>
        @endif

        <!-- Langues -->
        @if(!empty($cvInformation['languages']) && count($cvInformation['languages']) > 0)
            <div class="section">
                <div class="section-title">{{ __('cv.languages') }}</div>
                <div class="languages-container">
                    @foreach($cvInformation['languages'] as $language)
                        <div class="language-item">
                            <span class="language-name">{{ $currentLocale === 'en' ? ($language['name_en'] ?? $language['name']) : $language['name'] }}</span>
                            @if(!empty($language['level']))
                                <span class="language-level"> - {{ trans()->has("cv.levels." . $language['level']) ? __("cv.levels." . $language['level']) : $language['level'] }}</span>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Centres d'intérêt -->
        @if(!empty($cvInformation['hobbies']) && count($cvInformation['hobbies']) > 0)
            <div class="section">
                <div class="section-title">{{ __('cv.hobbies') }}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 2mm; margin-top: 2mm;">
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <span style="background: {{ $lightBlue }}; padding: 1mm 2mm; border-radius: 1mm; font-size: 9pt; border: 1pt solid {{ $primaryColor }};">
                            {{ $currentLocale === 'en' ? ($hobby['name_en'] ?? $hobby['name']) : $hobby['name'] }}
                        </span>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Footer APIDCA -->
        <div class="apidca-footer">
            <div style="font-weight: bold; margin-bottom: 1mm;">
                CV créé avec Guidy en partenariat avec l'APIDCA
            </div>
            <div style="font-size: 7pt; color: #6b7280;">
                Association Professionnelle des Archivistes - Promotion de l'excellence archivistique
            </div>
        </div>
    </div>
</body>
<x-cv-editable-scripts />
</html>
@endsection