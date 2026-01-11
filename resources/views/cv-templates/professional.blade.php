@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        /* Document Settings */
        @page { 
            margin: 12mm; 
            size: A4;
        }
        
        /* Reset & Base Styles */
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }

        body {
            font-family: 'DejaVu Sans', 'Segoe UI', sans-serif;
            line-height: 1.3;
            font-size: 10pt;
            color: #2c3e50;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        .cv-container {
            width: 185mm;
            margin: 0 auto;
            background: #ffffff;
            position: relative;
            overflow: hidden;
        }

        /* Subtle Background Elements */
        .bg-element {
            position: absolute;
            z-index: 0;
            opacity: 0.05;
        }

        .bg-circle {
            width: 40mm;
            height: 40mm;
            border-radius: 50%;
            background: #3498db;
            top: 10mm;
            right: -10mm;
        }

        .bg-square {
            width: 30mm;
            height: 30mm;
            background: #9b59b6;
            transform: rotate(45deg);
            bottom: 20mm;
            left: -15mm;
        }

        /* Header Section */
        .header {
            position: relative;
            padding: 4mm 3mm;
            margin-bottom: 5mm;
            z-index: 1;
            border-bottom: 0.5mm solid #3498db;
            background: linear-gradient(to right, #f8f9fa, #e9f7fe);
            border-radius: 2mm 2mm 0 0;
            display: flex;
        }

        .header-content {
            flex: 1;
        }

        .header-photo {
            width: 30mm;
            display: flex;
            justify-content: flex-end;
            align-items: center;
        }

        .photo-container {
            width: 25mm;
            height: 25mm;
            overflow: hidden;
            border-radius: 50%;
            border: 0.5mm solid #3498db;
            background-color: #ffffff;
            box-shadow: 0 1mm 2mm rgba(52, 152, 219, 0.2);
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .name {
            font-size: 18pt;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1mm;
            letter-spacing: 0.5mm;
        }

        .profession {
            font-size: 12pt;
            color: #3498db;
            margin-bottom: 3mm;
            font-weight: 400;
        }

        /* Contact Info */
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm 5mm;
            margin-top: 2mm;
        }

        .contact-item {
            display: flex;
            align-items: center;
            font-size: 9pt;
            color: #7f8c8d;
            position: relative;
            padding-left: 4mm;
        }

        .contact-item::before {
            content: "";
            position: absolute;
            left: 0;
            width: 2.5mm;
            height: 2.5mm;
            border-radius: 0.5mm;
            background: #3498db;
        }

        /* Main Content */
        .content {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 5mm;
            padding: 0 2mm;
        }

        /* Sections */
        .section {
            margin-bottom: 6mm;
            position: relative;
            padding: 3mm;
            background: #ffffff;
            border-radius: 2mm;
            box-shadow: 0 0.5mm 2mm rgba(0, 0, 0, 0.05);
            border-left: 1mm solid #3498db;
        }

        .section-title {
            font-size: 12pt;
            font-weight: 600;
            color: #3498db;
            margin-bottom: 3mm;
            letter-spacing: 0.2mm;
            position: relative;
            padding-bottom: 1mm;
            border-bottom: 0.2mm solid #ecf0f1;
        }

        /* Summary Section */
        .summary-content {
            padding: 1mm;
            line-height: 1.4;
            text-align: justify;
            font-size: 9.5pt;
            color: #34495e;
        }

        /* Experience Items */
        .experiences-container {
            /* No forced page break control here to allow natural flow */
        }

        .experience-item {
            margin-bottom: 4mm;
            padding-bottom: 2mm;
            position: relative;
            border-bottom: 0.2mm dotted #ecf0f1;
            break-inside: avoid; /* This is the key property for experience items */
        }

        .experience-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1.5mm;
        }

        .experience-title {
            font-size: 11pt;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 1mm;
        }

        .company {
            font-size: 9pt;
            color: #7f8c8d;
            margin-bottom: 1.5mm;
            font-style: italic;
        }

        .dates {
            font-size: 8pt;
            color: #ffffff;
            padding: 1mm 2mm;
            background: #3498db;
            border-radius: 3mm;
            min-width: 18%;
            text-align: center;
            white-space: nowrap;
        }

        .description {
            font-size: 9pt;
            line-height: 1.3;
            text-align: justify;
            color: #34495e;
        }

        /* Skills Section */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(20mm, 1fr));
            gap: 2mm;
        }

        .skill-item {
            position: relative;
            padding: 2mm;
            font-size: 9pt;
            color: #2c3e50;
            background: #ecf0f1;
            border-radius: 1mm;
            text-align: center;
            border-bottom: 0.3mm solid #3498db;
        }

        /* Languages Section */
        .languages-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2mm;
        }

        .language-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2mm;
            font-size: 9pt;
            color: #2c3e50;
            background: #ecf0f1;
            border-radius: 1mm;
        }

        .language-name {
            font-weight: 500;
        }

        .language-level {
            font-size: 8pt;
            padding: 0.5mm 1.5mm;
            background: #3498db;
            color: white;
            border-radius: 2mm;
        }

        /* Hobbies Section */
        .hobbies-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }

        .hobby-item {
            padding: 1.5mm 3mm;
            font-size: 9pt;
            color: #2c3e50;
            background: #ecf0f1;
            border-radius: 3mm;
            border-bottom: 0.3mm solid #9b59b6;
        }

        /* Print Specific */
        @media print {
            body {
                background-color: #ffffff;
            }
            
            .cv-container {
                margin: 0 auto;
                box-shadow: none;
            }
            
            .section {
                break-inside: auto; /* Allow sections to break across pages */
            }
            
            .experience-item {
                break-inside: avoid; /* Never break mid-experience */
            }
            
            .bg-element {
                display: none; /* Hide background elements in print */
            }
        }
    </style>
    <x-cv-editable-css />
</head>
<body>
<div class="cv-container">
    <!-- Subtle Background Elements -->
    <div class="bg-element bg-circle"></div>
    <div class="bg-element bg-square"></div>
    
    <!-- Header Section -->
    <header class="header">
        <div class="header-content">
            <h1 class="name" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="firstName" @endif>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
            <div class="profession" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="profession" @endif>
                {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
            </div>
            <div class="contact-info">
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['github'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['github'] }}</div>
                @endif
            </div>
        </div>
        <div class="header-photo">
            @if($cvInformation['personalInformation']['photo'])
                <div class="photo-container">
                    <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                         alt="{{ $currentLocale === 'fr' ? 'Photo de profil' : 'Profile photo' }}">
                </div>
            @endif
        </div>
    </header>

    <!-- Main Content -->
    <div class="content">
        <!-- Left Column -->
        <div class="left-column">
            @if(!empty($cvInformation['summaries']))
                <section class="section summary">
                    <h2 class="section-title">{{ __('cv.profile') }}</h2>
                    <div class="summary-content" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="summary" data-id="{{ $cvInformation['summaries'][0]['id'] ?? 0 }}" data-field="description" @endif>
                        <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
                    </div>
                </section>
            @endif

            <!-- Experience Sections -->
            @foreach($experiencesByCategory as $category => $experiences)
                @if($category != 'Éducation' && $category != 'Education')
                    <section class="section experiences">
                        <h2 class="section-title">
                            @if($currentLocale === 'fr')
                                {{ $category }}
                            @else
                                {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                            @endif
                        </h2>
                        <div class="experiences-container">
                            @foreach($experiences as $experience)
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="name" @endif>{{ $experience['name'] }}</div>
                                            <div class="company" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="InstitutionName" @endif>{{ $experience['InstitutionName'] }}</div>
                                        </div>
                                        <div class="dates">
                                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YY') }} - 
                                            @if($experience['date_end'])
                                                {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YY') }}
                                            @else
                                                {{ __('cv.present') }}
                                            @endif
                                        </div>
                                    </div>
                                    <p class="description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="description" @endif>{{ $experience['description'] }}</p>
                                    @if(!empty($experience['output']))
                                        <p class="description" style="margin-top: 1mm;">{{ $experience['output'] }}</p>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif
            @endforeach
        </div>

        <!-- Right Column -->
        <div class="right-column">
            <!-- Education Section -->
            @foreach($experiencesByCategory as $category => $experiences)
                @if($category == 'Éducation' || $category == 'Education')
                    <section class="section education">
                        <h2 class="section-title">
                            {{ __('cv.education') }}
                        </h2>
                        <div class="experiences-container">
                            @foreach($experiences as $experience)
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div>
                                            <div class="experience-title" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="name" @endif>{{ $experience['name'] }}</div>
                                            <div class="company" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="InstitutionName" @endif>{{ $experience['InstitutionName'] }}</div>
                                        </div>
                                        <div class="dates" style="font-size: 7.5pt;">
                                            {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('YYYY') }}
                                            @if($experience['date_end'])
                                                - {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('YYYY') }}
                                            @endif
                                        </div>
                                    </div>
                                    @if(!empty($experience['description']))
                                        <p class="description" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="description" @endif>{{ $experience['description'] }}</p>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif
            @endforeach

            <!-- Skills Section -->
            @if(!empty($cvInformation['competences']))
                <section class="section competences">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'COMPÉTENCES' : 'SKILLS' }}</h2>
                    <div class="skills-grid">
                        @foreach($cvInformation['competences'] as $competence)
                            <div class="skill-item">
                                {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                            </div>
                        @endforeach
                    </div>
                </section>
            @endif

            <!-- Languages Section -->
            @if(!empty($cvInformation['languages']))
                <section class="section languages">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'LANGUES' : 'LANGUAGES' }}</h2>
                    <div class="languages-grid">
                        @foreach($cvInformation['languages'] ?? [] as $language)
                            <div class="language-item">
                                <span class="language-name">{{ $language['name'] ?? '' }}</span>
                                @if(isset($language['level']))
                                    <span class="language-level">{{ $language['level'] ?? '' }}</span>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </section>
            @endif

            <!-- Hobbies Section -->
            @if(!empty($cvInformation['hobbies']))
                <section class="section hobbies">
                    <h2 class="section-title">{{ $currentLocale === 'fr' ? 'INTÉRÊTS' : 'INTERESTS' }}</h2>
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
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection