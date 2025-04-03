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
            margin: 4mm; 
            size: A4; 
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 9pt;
            color: #333;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        
        /* Layout principal */
        .cv-container {
            width: 210mm;
            min-height: 297mm;
            display: flex;
        }
        
        /* Colonne principale (gauche) */
        .main-column {
            width: 140mm;
            background-color: #ffffff;
            position: relative;
        }
        
        /* Colonne latérale (droite) */
        .side-column {
            width: 70mm;
            background-color: #222222;
            color: #ffffff;
            padding: 0;
        }
        
        /* Section photo et entête */
        .header-section {
            position: relative;
            height: 75mm;
        }
        
        .photo-container {
            position: absolute;
            top: 15mm;
            left: 15mm;
            width: 50mm;
            height: 50mm;
            border-radius: 50%;
            overflow: hidden;
            border: 2mm solid #222222;
            background-color: #ffffff;
            z-index: 2;
        }
        
        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .name-title-band {
            position: absolute;
            top: 35mm;
            left: 70mm;
            right: 0;
            background-color: #ff9800;
            color: white;
            padding: 5mm 10mm 5mm 10mm;
            z-index: 1;
        }
        
        .name {
            font-size: 18pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 1mm;
        }
        
        .profession {
            font-size: 14pt;
            text-transform: uppercase;
        }
        
        /* Sections principales */
        .main-section {
            padding: 0 15mm;
        }
        
        .main-section-title {
            background-color: #ff9800;
            color: white;
            text-transform: uppercase;
            font-weight: bold;
            padding: 2mm 5mm;
            font-size: 14pt;
            margin: 5mm 0;
        }
        
        /* Expérience et éducation */
        .timeline-item {
            display: flex;
            margin-bottom: 6mm;
        }
        
        .timeline-marker {
            flex: 0 0 5mm;
            padding-top: 2mm;
        }
        
        .timeline-marker-dot {
            width: 3mm;
            height: 3mm;
            background-color: #ff9800;
        }
        
        .timeline-content {
            flex: 1;
            padding-left: 3mm;
        }
        
        .timeline-years {
            color: #333;
            font-weight: bold;
            margin-bottom: 1mm;
        }
        
        .timeline-title {
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 1mm;
        }
        
        .timeline-place {
            margin-bottom: 1mm;
        }
        
        .timeline-description {
            font-size: 8.5pt;
            color: #666;
            text-align: justify;
        }
        
        /* Sections latérales */
        .side-section {
            padding: 15mm 10mm;
        }
        
        .side-section-title {
            border: 1px solid #ff9800;
            color: white;
            text-transform: uppercase;
            font-weight: bold;
            padding: 2mm 5mm;
            font-size: 12pt;
            margin-bottom: 8mm;
            text-align: center;
        }
        
        /* Informations de contact */
        .contact-item {
            display: flex;
            margin-bottom: 5mm;
            align-items: flex-start;
        }
        
        .contact-icon {
            flex: 0 0 8mm;
            padding-top: 1mm;
        }
        
        .contact-icon-circle {
            width: 6mm;
            height: 6mm;
            background-color: #ff9800;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 8pt;
            color: white;
            font-weight: bold;
        }
        
        .contact-text {
            flex: 1;
            font-size: 9pt;
        }
        
        /* Compétences sans barre de progression */
        .skill-item {
            margin-bottom: 3mm;
            display: flex;
            align-items: center;
        }
        
        .skill-dot {
            width: 2.5mm;
            height: 2.5mm;
            background-color: #ff9800;
            margin-right: 3mm;
            flex-shrink: 0;
        }
        
        .skill-name {
            font-weight: normal;
            flex: 1;
        }
        
        /* Réseaux sociaux */
        .social-icons {
            display: flex;
            justify-content: center;
            margin-top: 15mm;
        }
        
        .social-icon {
            width: 8mm;
            height: 8mm;
            border: 1px solid white;
            margin: 0 2mm;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        /* Pour respecter les marges sur la deuxième page */
        .page-break {
            page-break-before: always;
            margin-top: 0;
        }
        
        .second-page {
            padding-top: 15mm;
        }
    </style>
</head>
<body>
<div class="cv-container">
    <!-- Colonne principale (gauche) -->
    <div class="main-column">
        <!-- Section photo et entête -->
        <div class="header-section">
            @if($cvInformation['personalInformation']['photo'])
                <div class="photo-container">
                    <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                         alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                </div>
            @endif
            <div class="name-title-band">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </div>
        </div>

        <!-- Section Éducation -->
        <div class="main-section">
            <div class="main-section-title">{{ $currentLocale === 'fr' ? 'ÉDUCATION' : 'EDUCATION' }}</div>
            
            @foreach($cvInformation['experiences'] ?? [] as $experience)
                @if(isset($experience['experience_categories_id']) && $experience['experience_categories_id'] == 1)
                    <div class="timeline-item">
                        <div class="timeline-marker">
                            <div class="timeline-marker-dot"></div>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-years">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->format('Y') }} - 
                                @if($experience['date_end'])
                                    {{ \Carbon\Carbon::parse($experience['date_end'])->format('Y') }}
                                @else
                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                @endif
                            </div>
                            <div class="timeline-title">{{ $experience['name'] }}</div>
                            <div class="timeline-place">{{ $experience['InstitutionName'] }}</div>
                            <div class="timeline-description">
                                {{ $experience['description'] }}
                                @if($experience['output'])
                                    <br>{{ $experience['output'] }}
                                @endif
                            </div>
                        </div>
                    </div>
                @endif
            @endforeach
        </div>

        <!-- Section Expérience -->
        <div class="main-section">
            <div class="main-section-title">{{ $currentLocale === 'fr' ? 'EXPÉRIENCE' : 'EXPERIENCE' }}</div>
            
            @foreach($cvInformation['experiences'] ?? [] as $experience)
                @if(isset($experience['experience_categories_id']) && $experience['experience_categories_id'] == 2)
                    <div class="timeline-item">
                        <div class="timeline-marker">
                            <div class="timeline-marker-dot"></div>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-years">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->format('Y') }} - 
                                @if($experience['date_end'])
                                    {{ \Carbon\Carbon::parse($experience['date_end'])->format('Y') }}
                                @else
                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                @endif
                            </div>
                            <div class="timeline-title">{{ $experience['name'] }}</div>
                            <div class="timeline-place">{{ $experience['InstitutionName'] }}</div>
                            <div class="timeline-description">
                                {{ $experience['description'] }}
                                @if($experience['output'])
                                    <br>{{ $experience['output'] }}
                                @endif
                            </div>
                        </div>
                    </div>
                @endif
            @endforeach
        </div>
    </div>

    <!-- Colonne latérale (droite) -->
    <div class="side-column">
        <!-- Section Contact -->
        <div class="side-section">
            <div class="side-section-title">{{ $currentLocale === 'fr' ? 'CONTACT' : 'CONTACT ME' }}</div>
            
            @if($cvInformation['personalInformation']['address'])
                <div class="contact-item">
                    <div class="contact-icon">
                        <div class="contact-icon-circle">📍</div>
                    </div>
                    <div class="contact-text">
                        <div style="text-transform: uppercase; margin-bottom: 1mm; color: #ccc;">{{ $currentLocale === 'fr' ? 'ADRESSE' : 'ADDRESS' }}</div>
                        {{ $cvInformation['personalInformation']['address'] }}
                    </div>
                </div>
            @endif
            
            @if($cvInformation['personalInformation']['email'] || $cvInformation['personalInformation']['linkedin'])
                <div class="contact-item">
                    <div class="contact-icon">
                        <div class="contact-icon-circle">🌐</div>
                    </div>
                    <div class="contact-text">
                        <div style="text-transform: uppercase; margin-bottom: 1mm; color: #ccc;">{{ $currentLocale === 'fr' ? 'WEB' : 'WEB' }}</div>
                        @if($cvInformation['personalInformation']['email'])
                            {{ $cvInformation['personalInformation']['email'] }}<br>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            {{ $cvInformation['personalInformation']['linkedin'] }}
                        @endif
                    </div>
                </div>
            @endif
            
            @if($cvInformation['personalInformation']['phone'])
                <div class="contact-item">
                    <div class="contact-icon">
                        <div class="contact-icon-circle">📞</div>
                    </div>
                    <div class="contact-text">
                        <div style="text-transform: uppercase; margin-bottom: 1mm; color: #ccc;">{{ $currentLocale === 'fr' ? 'TÉLÉPHONE' : 'PHONE' }}</div>
                        {{ $cvInformation['personalInformation']['phone'] }}
                    </div>
                </div>
            @endif
            
            <!-- Résumé / Profil -->
            @if(!empty($cvInformation['summaries']))
                <div class="contact-item" style="margin-top: 10mm;">
                    <div class="contact-text" style="text-align: justify; line-height: 1.3;">
                        {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                    </div>
                </div>
            @endif
        </div>

        <!-- Section Compétences -->
        <div class="side-section" style="padding-top: 0;">
            <div class="side-section-title">{{ $currentLocale === 'fr' ? 'COMPÉTENCES' : 'PRO SKILLS' }}</div>
            
            @if(!empty($cvInformation['competences']))
                @foreach($cvInformation['competences'] as $competence)
                    <div class="skill-item">
                        <div class="skill-dot"></div>
                        <div class="skill-name">
                            {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                        </div>
                    </div>
                @endforeach
            @endif
            
            <!-- Section Langues -->
            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <div style="margin-top: 15mm;">
                    <div class="side-section-title">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</div>
                    
                    @foreach($cvInformation['languages'] ?? [] as $language)
                        <div class="skill-item">
                            <div class="skill-dot"></div>
                            <div class="skill-name">
                                {{ $language['name'] ?? '' }}
                                @if(isset($language['level']))
                                    <span style="color: #aaa; font-size: 8pt; margin-left: 2mm;">({{ $language['level'] ?? '' }})</span>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
            
            <!-- Centres d'intérêt -->
            @if(!empty($cvInformation['hobbies']))
                <div style="margin-top: 15mm;">
                    <div class="side-section-title">{{ $currentLocale === 'fr' ? 'CENTRES D\'INTÉRÊT' : 'HOBBIES' }}</div>
                    
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <div class="skill-item">
                            <div class="skill-dot"></div>
                            <div class="skill-name">
                                {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                            </div>
                        </div>
                    @endforeach
                </div>
            @endif
            
    
        </div>
    </div>
</div>
</body>
</html>
@endsection