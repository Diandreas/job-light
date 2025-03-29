@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page { margin: 0; size: A4; }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.15;
            font-size: 9pt;
            color: #333;
            background: white;
            margin: 0;
            padding: 0;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
        }
        
        td {
            vertical-align: top;
            padding: 0;
        }
        
        /* Header Section */
        .header {
            background-color: #333333;
            color: white;
            text-align: center;
            padding: 6mm 5mm 25mm 5mm;
            position: relative;
        }
        
        .header-name {
            font-size: 24pt;
            text-transform: uppercase;
            letter-spacing: 2mm;
            margin-bottom: 2mm;
            font-weight: normal;
        }
        
        .header-title {
            font-size: 14pt;
            text-transform: uppercase;
            letter-spacing: 1mm;
            font-weight: normal;
            color: #eee;
        }
        
        .contact-table {
            width: 100%;
            margin-top: 4mm;
        }
        
        .contact-left {
            text-align: left;
            width: 45%;
        }
        
        .contact-right {
            text-align: right;
            width: 45%;
        }
        
        .contact-icon {
            background-color: #c08c5d;
            color: white;
            width: 8mm;
            height: 8mm;
            border-radius: 50%;
            text-align: center;
            line-height: 8mm;
            margin-right: 2mm;
        }
        
        .contact-icon-right {
            background-color: #c08c5d;
            color: white;
            width: 8mm;
            height: 8mm;
            border-radius: 50%;
            text-align: center;
            line-height: 8mm;
            margin-left: 2mm;
        }
        
        /* Photo */
        .profile-photo-container {
            position: absolute;
            left: 50%;
            bottom: -18mm;
            margin-left: -18mm;
            width: 36mm;
            height: 36mm;
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
            border: 2mm solid #c08c5d;
        }
        
        .profile-photo img {
            width: 100%;
            height: 100%;
        }
        
        /* Content */
        .main-table {
            width: 100%;
            margin-top: 20mm;
        }
        
        .content-padding {
            padding: 0 10mm;
        }
        
        /* Section titles */
        .section-title {
            background-color: #c08c5d;
            color: white;
            text-align: center;
            padding: 2mm 0;
            margin-bottom: 4mm;
            font-size: 12pt;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
            font-weight: bold;
        }
        
        /* Profile Section */
        .profile-content {
            text-align: justify;
            margin-bottom: 5mm;
            line-height: 1.4;
        }
        
        /* Skills Section */
        .skill-item {
            margin-bottom: 2mm;
        }
        
        .skill-name {
            font-weight: bold;
            margin-bottom: 1mm;
        }
        
        .skill-bar-container {
            width: 100%;
            height: 2mm;
            background-color: #eeeeee;
        }
        
        .skill-bar {
            height: 100%;
            background-color: #c08c5d;
        }
        
        /* Timeline for education and experience */
        .timeline-table {
            width: 100%;
            margin-bottom: 10mm;
            position: relative;
        }
        
        .timeline-line {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 2mm;
            width: 0.5mm;
            background-color: #999;
        }
        
        .timeline-item {
            padding-left: 8mm;
            margin-bottom: 5mm;
            position: relative;
        }
        
        .timeline-dot {
            position: absolute;
            left: 0;
            top: 0;
            width: 4mm;
            height: 4mm;
            border-radius: 50%;
            background-color: #c08c5d;
            border: 1mm solid white;
            z-index: 5;
        }
        
        .timeline-date {
            position: absolute;
            left: -12mm;
            top: 0;
            width: 10mm;
            text-align: right;
            font-weight: bold;
        }
        
        .timeline-title {
            font-weight: bold;
            margin-bottom: 1mm;
        }
        
        .timeline-subtitle {
            font-style: italic;
            margin-bottom: 1mm;
        }
        
        .timeline-content {
            text-align: justify;
            line-height: 1.3;
        }
        
        /* Interests Section */
        .interests-table {
            width: 100%;
            text-align: center;
        }
        
        .interest-item {
            display: inline-block;
            text-align: center;
            margin: 0 2mm 3mm 2mm;
            width: 20mm;
        }
        
        .interest-icon {
            width: 10mm;
            height: 10mm;
            background-color: #333333;
            border-radius: 50%;
            text-align: center;
            line-height: 10mm;
            color: white;
            font-size: 12pt;
            margin: 0 auto 1mm auto;
        }
        
        /* Social links */
        .social-container {
            margin-top: 2mm;
        }
        
        .social-item {
            margin-bottom: 2mm;
        }
        
        .social-icon {
            width: 5mm;
            margin-right: 2mm;
            display: inline-block;
        }
    </style>
</head>
<body>
<div class="header">
    <div class="header-name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
    <div class="header-title">
        {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
    </div>
    
    <table class="contact-table">
        <tr>
            <td class="contact-left">
                @if($cvInformation['personalInformation']['phone'])
                    <table>
                        <tr>
                            <td style="width: 8mm; vertical-align: middle;"><div class="contact-icon">📱</div></td>
                            <td style="vertical-align: middle;">{{ $cvInformation['personalInformation']['phone'] }}</td>
                        </tr>
                    </table>
                @endif
                @if($cvInformation['personalInformation']['email'])
                    <table style="margin-top: 2mm;">
                        <tr>
                            <td style="width: 8mm; vertical-align: middle;"><div class="contact-icon">✉</div></td>
                            <td style="vertical-align: middle;">{{ $cvInformation['personalInformation']['email'] }}</td>
                        </tr>
                    </table>
                @endif
            </td>
            <td style="width: 10%;"></td>
            <td class="contact-right">
                @if($cvInformation['personalInformation']['linkedin'])
                    <table>
                        <tr>
                            <td style="vertical-align: middle;">{{ $cvInformation['personalInformation']['linkedin'] }}</td>
                            <td style="width: 8mm; vertical-align: middle;"><div class="contact-icon-right">🔗</div></td>
                        </tr>
                    </table>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <table style="margin-top: 2mm;">
                        <tr>
                            <td style="vertical-align: middle;">{{ $cvInformation['personalInformation']['address'] }}</td>
                            <td style="width: 8mm; vertical-align: middle;"><div class="contact-icon-right">📍</div></td>
                        </tr>
                    </table>
                @endif
            </td>
        </tr>
    </table>
    
    @if($cvInformation['personalInformation']['photo'])
        <div class="profile-photo-container">
            <div class="profile-photo">
                <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                     alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
            </div>
        </div>
    @endif
</div>

<!-- Main Content -->
<table class="main-table">
    <tr>
        <td class="content-padding">
            <!-- Top section - Profile and Skills -->
            <table>
                <tr>
                    <td style="width: 48%; padding-right: 2%;">
                        <!-- Profile Section -->
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'PROFIL' : 'PROFILE' }}</div>
                        @if(!empty($cvInformation['summaries']))
                            <div class="profile-content">
                                {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                            </div>
                        @endif
                    </td>
                    <td style="width: 48%; padding-left: 2%;">
                        <!-- Skills Section -->
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
                    </td>
                </tr>
            </table>
            
            <!-- Middle section - Education -->
            <div style="margin-top: 10mm;">
                <div class="section-title">{{ $currentLocale === 'fr' ? 'FORMATION' : 'EDUCATION' }}</div>
                <div class="timeline-table">
                    <div class="timeline-line"></div>
                    @foreach($experiencesByCategory as $category => $experiences)
                        @foreach($experiences as $experience)
                            @if(isset($experience['experience_categories_id']) && $experience['experience_categories_id'] != 1)
                                <div class="timeline-item">
                                    <div class="timeline-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} -
                                        @if($experience['date_end'])
                                            {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-title">{{ $experience['name'] }}</div>
                                    <div class="timeline-subtitle">{{ $experience['InstitutionName'] }}</div>
                                    <div class="timeline-content">
                                        {{ $experience['description'] }}
                                        @if($experience['output'])
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    @endforeach
                </div>
            </div>
            
            <!-- Middle section - Experience -->
            <div>
                <div class="section-title">{{ $currentLocale === 'fr' ? 'EXPÉRIENCE' : 'EXPERIENCE' }}</div>
                <div class="timeline-table">
                    <div class="timeline-line"></div>
                    @foreach($experiencesByCategory as $category => $experiences)
                        @foreach($experiences as $experience)
                            @if(isset($experience['experience_categories_id']) && $experience['experience_categories_id'] == 1)
                                <div class="timeline-item">
                                    <div class="timeline-date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }} -
                                        @if($experience['date_end'])
                                            {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                        @else
                                            {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                        @endif
                                    </div>
                                    <div class="timeline-dot"></div>
                                    <div class="timeline-title">{{ $experience['name'] }}</div>
                                    <div class="timeline-subtitle">{{ $experience['InstitutionName'] }}</div>
                                    <div class="timeline-content">
                                        {{ $experience['description'] }}
                                        @if($experience['output'])
                                            <br>{{ $experience['output'] }}
                                        @endif
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    @endforeach
                </div>
            </div>
            
            <!-- Social Links Section -->
            <div>
                <div class="section-title">{{ $currentLocale === 'fr' ? 'LIENS SOCIAUX' : 'SOCIAL LINKS' }}</div>
                <div class="social-container">
                    @if($cvInformation['personalInformation']['linkedin'])
                        <div class="social-item">
                            <table>
                                <tr>
                                    <td style="width: 5mm; vertical-align: middle;"><div class="social-icon">🔗</div></td>
                                    <td style="vertical-align: middle;">{{ $cvInformation['personalInformation']['linkedin'] }}</td>
                                </tr>
                            </table>
                        </div>
                    @endif
                </div>
            </div>
            
            <!-- Bottom section - Interests and Languages -->
            <div style="margin-top: 5mm;">
                <table>
                    <tr>
                        <td style="width: 48%; padding-right: 2%;">
                            <!-- Interests Section -->
                            <div class="section-title">{{ $currentLocale === 'fr' ? 'INTÉRÊTS' : 'INTERESTS' }}</div>
                            <div class="interests-table">
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
                            </div>
                        </td>
                        <td style="width: 48%; padding-left: 2%;">
                            <!-- Languages Section -->
                            @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                                <div class="section-title">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</div>
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
                        </td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
</table>
</body>
</html>
@endsection