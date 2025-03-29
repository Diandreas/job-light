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
            line-height: 1.2;
            font-size: 8.5pt;
            color: #333;
            background: white;
        }

        .cv-container {
            width: 170mm;
            margin: 0 auto;
            padding: 0;
            background: white;
        }

        /* Header Section */
        .header-section {
            background-color: #333333;
            color: white;
            text-align: center;
            padding: 5mm 4mm 22mm 4mm;
            position: relative;
            margin-bottom: 0;
        }

        .header-name {
            font-size: 22pt;
            text-transform: uppercase;
            letter-spacing: 1.5mm;
            margin-bottom: 1.5mm;
            font-weight: normal;
        }

        .header-title {
            font-size: 13pt;
            text-transform: uppercase;
            letter-spacing: 0.8mm;
            font-weight: normal;
            color: #eee;
        }

        .contact-row {
            display: flex;
            justify-content: space-between;
            margin-top: 3mm;
        }

        .contact-left, .contact-right {
            width: 45%;
        }

        .contact-left {
            text-align: left;
        }

        .contact-right {
            text-align: right;
        }

        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 1.5mm;
            color: white;
        }

        .contact-left .contact-item {
            justify-content: flex-start;
        }

        .contact-right .contact-item {
            justify-content: flex-end;
        }

        .contact-icon {
            background-color: #c08c5d;
            color: white;
            width: 7mm;
            height: 7mm;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1.5mm;
        }

        .contact-right .contact-icon {
            margin-right: 0;
            margin-left: 1.5mm;
        }

        /* Photo */
        .profile-photo-container {
            position: absolute;
            left: 50%;
            bottom: -16mm;
            transform: translateX(-50%);
            width: 32mm;
            height: 32mm;
            border-radius: 50%;
            background-color: white;
            padding: 1mm;
            z-index: 10;
        }

        .profile-photo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            border: 1.5mm solid #c08c5d;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Top Section */
        .top-section {
            display: flex;
            padding: 0 4mm;
            margin-top: 18mm;
            margin-bottom: 3mm;
        }

        .profile-section {
            width: 50%;
            padding-right: 3mm;
        }

        .skills-section {
            width: 50%;
            padding-left: 3mm;
        }

        /* Central Sections */
        .central-section {
            padding: 0 4mm;
            margin-bottom: 3mm;
        }

        /* Bottom Section */
        .bottom-section {
            display: flex;
            padding: 0 4mm;
            margin-bottom: 3mm;
        }

        .social-section {
            width: 50%;
            padding-right: 3mm;
        }

        .interests-section {
            width: 50%;
            padding-left: 3mm;
        }

        /* Section titles */
        .section-title {
            background-color: #c08c5d;
            color: white;
            text-align: center;
            padding: 1.5mm 0;
            margin-bottom: 3mm;
            font-size: 11pt;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
            font-weight: bold;
        }

        /* Profile Section */
        .profile-content {
            text-align: justify;
            margin-bottom: 3mm;
            line-height: 1.3;
        }

        /* Skills Section */
        .skill-item {
            margin-bottom: 1.5mm;
        }

        .skill-name {
            font-weight: bold;
            margin-bottom: 0.5mm;
        }

        .skill-bar-container {
            width: 100%;
            height: 1.5mm;
            background-color: #eeeeee;
        }

        .skill-bar {
            height: 100%;
            background-color: #c08c5d;
        }

        /* Centered Timeline for education and experience */
        .timeline-container {
            position: relative;
            margin: 0 auto;
            text-align: center;
        }

        .timeline-line {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 0.5mm;
            background-color: #999;
            transform: translateX(-50%);
        }

        .timeline-item {
            position: relative;
            margin-bottom: 3mm;
            display: flex;
            align-items: flex-start;
        }

        .timeline-left {
            width: 50%;
            padding-right: 15mm;
            text-align: right;
        }

        .timeline-right {
            width: 50%;
            padding-left: 15mm;
            text-align: left;
        }

        .timeline-date {
            font-weight: bold;
            margin-bottom: 1mm;
        }

        .timeline-dot {
            position: absolute;
            left: 50%;
            top: 0;
            width: 3.5mm;
            height: 3.5mm;
            border-radius: 50%;
            background-color: #333;
            border: 0.8mm solid white;
            transform: translateX(-50%);
            z-index: 2;
        }

        .timeline-title {
            font-weight: bold;
            margin-bottom: 0.5mm;
        }

        .timeline-subtitle {
            font-style: italic;
            margin-bottom: 0.5mm;
        }

        .timeline-content {
            text-align: justify;
            line-height: 1.3;
        }

        /* Interests Section */
        .interests-container {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
        }

        .interest-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0 2mm 2mm 2mm;
            width: 20%;
        }

        .interest-icon {
            width: 8mm;
            height: 8mm;
            background-color: #333333;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10pt;
            margin-bottom: 1mm;
        }

        /* Social links */
        .social-container {
            display: flex;
            flex-direction: column;
        }

        .social-item {
            display: flex;
            align-items: center;
            margin-bottom: 1.5mm;
        }

        .social-icon {
            width: 4mm;
            margin-right: 1.5mm;
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
                width: 190mm;
            }
            .timeline-item { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
<div class="cv-container">
    <!-- Header Section -->
    <div class="header-section">
        <div class="header-name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
        <div class="header-title">
            {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
        </div>
        
        <div class="contact-row">
            <div class="contact-left">
                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-item">
                        <div class="contact-icon">📱</div>
                        <div>{{ $cvInformation['personalInformation']['phone'] }}</div>
                    </div>
                @endif
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-item">
                        <div class="contact-icon">✉</div>
                        <div>{{ $cvInformation['personalInformation']['email'] }}</div>
                    </div>
                @endif
            </div>
            <div class="contact-right">
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">
                        <div>{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                        <div class="contact-icon">🔗</div>
                    </div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <div class="contact-item">
                        <div>{{ $cvInformation['personalInformation']['address'] }}</div>
                        <div class="contact-icon">📍</div>
                    </div>
                @endif
            </div>
        </div>
        
        @if($cvInformation['personalInformation']['photo'])
            <div class="profile-photo-container">
                <div class="profile-photo">
                    <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                         alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                </div>
            </div>
        @endif
    </div>

    <!-- Top Section: Profile and Skills -->
    <div class="top-section">
        <!-- Profile Section -->
        <div class="profile-section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'PROFIL' : 'PROFILE' }}</div>
            @if(!empty($cvInformation['summaries']))
                <div class="profile-content">
                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                </div>
            @endif
        </div>

        <!-- Skills Section -->
        <div class="skills-section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'COMPÉTENCES' : 'SKILLS' }}</div>
            @if(!empty($cvInformation['competences']))
                @foreach($cvInformation['competences'] as $index => $competence)
                    <div class="skill-item">
                        <div class="skill-name">
                            {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                        </div>
                        <div class="skill-bar-container">
                            <div class="skill-bar" style="width: {{ 50 + ($index * 10) % 50 }}%;"></div>
                        </div>
                    </div>
                @endforeach
            @endif
            
            <!-- Languages Section -->
            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                <div class="section-title" style="margin-top: 3mm;">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</div>
                @foreach($cvInformation['languages'] ?? [] as $index => $language)
                    <div class="skill-item">
                        <div class="skill-name">
                            {{ $language['name'] ?? '' }} 
                            @if(isset($language['level']))
                                - {{ $language['level'] ?? '' }}
                            @endif
                        </div>
                        <div class="skill-bar-container">
                            <div class="skill-bar" style="width: {{ 70 + ($index * 10) % 30 }}%;"></div>
                        </div>
                    </div>
                @endforeach
            @endif
        </div>
    </div>

    <!-- Education Section -->
    <div class="central-section">
        <div class="section-title">{{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}</div>
        <div class="timeline-container">
            <div class="timeline-line"></div>
            @php $count = 0; @endphp
            @foreach($experiencesByCategory as $category => $experiences)
                @foreach($experiences as $experience)
                    @if(isset($experience['experience_categories_id']) && $experience['experience_categories_id'] != 1)
                        <div class="timeline-item">
                            @if($count % 2 == 0)
                                <div class="timeline-left">
                                    <div class="timeline-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} -
                                        @if($experience['date_end'])
                                            {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                </div>
                                <div class="timeline-dot"></div>
                                <div class="timeline-right">
                                    <div class="timeline-title">{{ $experience['name'] }}</div>
                                    <div class="timeline-subtitle">{{ $experience['InstitutionName'] }}</div>
                                    <div class="timeline-content">
                                        {{ $experience['description'] }}
                                        @if($experience['output'])
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                            @else
                                <div class="timeline-left">
                                    <div class="timeline-title">{{ $experience['name'] }}</div>
                                    <div class="timeline-subtitle">{{ $experience['InstitutionName'] }}</div>
                                    <div class="timeline-content">
                                        {{ $experience['description'] }}
                                        @if($experience['output'])
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                                <div class="timeline-dot"></div>
                                <div class="timeline-right">
                                    <div class="timeline-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} -
                                        @if($experience['date_end'])
                                            {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                </div>
                            @endif
                        </div>
                        @php $count++; @endphp
                    @endif
                @endforeach
            @endforeach
        </div>
    </div>

    <!-- Experience Section -->
    <div class="central-section">
        <div class="section-title">{{ $currentLocale === 'fr' ? 'EXPÉRIENCE' : 'EXPERIENCE' }}</div>
        <div class="timeline-container">
            <div class="timeline-line"></div>
            @php $count = 0; @endphp
            @foreach($experiencesByCategory as $category => $experiences)
                @foreach($experiences as $experience)
                    @if(isset($experience['experience_categories_id']) && $experience['experience_categories_id'] == 1)
                        <div class="timeline-item">
                            @if($count % 2 == 0)
                                <div class="timeline-left">
                                    <div class="timeline-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} -
                                        @if($experience['date_end'])
                                            {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                </div>
                                <div class="timeline-dot"></div>
                                <div class="timeline-right">
                                    <div class="timeline-title">{{ $experience['name'] }}</div>
                                    <div class="timeline-subtitle">{{ $experience['InstitutionName'] }}</div>
                                    <div class="timeline-content">
                                        {{ $experience['description'] }}
                                        @if($experience['output'])
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                            @else
                                <div class="timeline-left">
                                    <div class="timeline-title">{{ $experience['name'] }}</div>
                                    <div class="timeline-subtitle">{{ $experience['InstitutionName'] }}</div>
                                    <div class="timeline-content">
                                        {{ $experience['description'] }}
                                        @if($experience['output'])
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                                <div class="timeline-dot"></div>
                                <div class="timeline-right">
                                    <div class="timeline-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} -
                                        @if($experience['date_end'])
                                            {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                </div>
                            @endif
                        </div>
                        @php $count++; @endphp
                    @endif
                @endforeach
            @endforeach
        </div>
    </div>

    <!-- Bottom Section: Social Links and Interests -->
    <div class="bottom-section">
        <!-- Social Links Section -->
        <div class="social-section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'LIENS SOCIAUX' : 'SOCIAL LINKS' }}</div>
            <div class="social-container">
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="social-item">
                        <div class="social-icon">🔗</div>
                        <div>{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                    </div>
                @endif
                <!-- Ajout d'exemples de liens sociaux comme dans l'image -->
                <div class="social-item">
                    <div class="social-icon">𝕏</div>
                    <div>/ Nom d'utilisateur</div>
                </div>
                <div class="social-item">
                    <div class="social-icon">𝕱</div>
                    <div>/ Nom d'utilisateur</div>
                </div>
            </div>
        </div>

        <!-- Interests Section -->
        <div class="interests-section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'INTÉRÊTS' : 'INTERESTS' }}</div>
            <div class="interests-container">
                @if(!empty($cvInformation['hobbies']))
                    @foreach($cvInformation['hobbies'] as $index => $hobby)
                        @php
                            $icons = ['🎮', '🎵', '📷', '✈️', '📚', '🏀', '🎨', '🍳'];
                            $icon = $icons[$index % count($icons)];
                        @endphp
                        <div class="interest-item">
                            <div class="interest-icon">{{ $icon }}</div>
                            <div>{{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}</div>
                        </div>
                    @endforeach
                @endif
                <!-- Si aucun hobby n'est défini, ajouter des exemples comme dans l'image -->
                @if(empty($cvInformation['hobbies']))
                    <div class="interest-item">
                        <div class="interest-icon">🎮</div>
                        <div>Jeux</div>
                    </div>
                    <div class="interest-item">
                        <div class="interest-icon">🎵</div>
                        <div>Musique</div>
                    </div>
                    <div class="interest-item">
                        <div class="interest-icon">📷</div>
                        <div>Photographie</div>
                    </div>
                    <div class="interest-item">
                        <div class="interest-icon">✈️</div>
                        <div>Voyage</div>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
</body>
</html>
@endsection