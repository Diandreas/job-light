@extends('layouts.cv')

@section('content')
    @php
        $currentLang = $_COOKIE['i18nextLng'] ?? 'fr';
        $translations = [
            'fr' => [
                'about' => 'À propos',
                'skills' => 'Compétences',
                'interests' => "Centres d'intérêt",
                'present' => 'Présent',
                'experience' => 'Expérience professionnelle',
                'education' => 'Formation',
                'print' => 'Imprimer CV'
            ],
            'en' => [
                'about' => 'About',
                'skills' => 'Skills',
                'interests' => 'Interests',
                'present' => 'Present',
                'experience' => 'Professional Experience',
                'education' => 'Education',
                'print' => 'Print CV'
            ]
        ];

        function t($key, $lang, $translations) {
            return $translations[$lang][$key] ?? $key;
        }
    @endphp

    <div class="cv-container">
        <!-- En-tête -->
        <header class="cv-header">
            <div class="header-shape"></div>
            <div class="header-content">
                <div class="profile-info">
                    @if($cvInformation['personalInformation']['photo'])
                        <div class="profile-photo">
                            <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Profile photo">
                        </div>
                    @endif
                    <div class="name-title">
                        <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                        @if(!empty($cvInformation['personalInformation']['full_profession']))
                            <div class="title-box">
                                <span>{{ $cvInformation['personalInformation']['full_profession'] }}</span>
                            </div>
                        @elseif(!empty($cvInformation['professions']))
                            <div class="title-box">
                                <span>{{ $cvInformation['professions'][0]['name'] }}</span>
                            </div>
                        @endif
                    </div>
                </div>
                <div class="contact-grid">
                    <div class="contact-item">
                        <i class="bi bi-envelope"></i>
                        <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                    </div>
                    @if($cvInformation['personalInformation']['phone'])
                        <div class="contact-item">
                            <i class="bi bi-telephone"></i>
                            <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                        </div>
                    @endif
                    @if($cvInformation['personalInformation']['address'])
                        <div class="contact-item">
                            <i class="bi bi-geo-alt"></i>
                            <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                        </div>
                    @endif
                    @if($cvInformation['personalInformation']['linkedin'])
                        <div class="contact-item">
                            <i class="bi bi-linkedin"></i>
                            <span>{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                        </div>
                    @endif
                </div>
            </div>
        </header>

        <!-- Résumé -->
        @if(!empty($cvInformation['summaries']))
            <section class="summary-section">
                <div class="section-header">
                    <div class="section-icon"><i class="bi bi-person"></i></div>
                    <h2>{{ t('about', $currentLang, $translations) }}</h2>
                </div>
                <p class="summary-content">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </section>
        @endif

        <!-- Expériences -->
        @foreach($experiencesByCategory as $category => $experiences)
            <section class="experience-section">
                <div class="section-header">
                    <div class="section-icon"><i class="bi bi-briefcase"></i></div>
                    <h2>{{ t($category, $currentLang, $translations) }}</h2>
                </div>
                <div class="timeline">
                    @foreach($experiences as $experience)
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <div class="experience-header">
                                    <div class="experience-title">
                                        <h3>{{ $experience['name'] }}</h3>
                                        <div class="company-name">{{ $experience['InstitutionName'] }}</div>
                                    </div>
                                    <div class="date-range">
                                        @php
                                            $startDate = \Carbon\Carbon::parse($experience['date_start']);
                                            $endDate = !empty($experience['date_end']) ? \Carbon\Carbon::parse($experience['date_end']) : now();

                                            setlocale(LC_TIME, $currentLang == 'fr' ? 'fr_FR.utf8' : 'en_US.utf8');
                                            $startFormat = $startDate->translatedFormat('M Y');
                                            $endFormat = !empty($experience['date_end']) ? $endDate->translatedFormat('M Y') : t('present', $currentLang, $translations);
                                        @endphp
                                        {{ $startFormat }} - {{ $endFormat }}
                                        @if($experience['attachment_path'])
                                            <i class="bi bi-paperclip"></i>
                                        @endif
                                    </div>
                                </div>
                                <p class="experience-description">{{ $experience['description'] }}</p>
                                @if($experience['output'])
                                    <div class="achievement">
                                        <i class="bi bi-trophy"></i>
                                        <span>{{ $experience['output'] }}</span>
                                    </div>
                                @endif
                            </div>
                        </div>
                    @endforeach
                </div>
            </section>
        @endforeach

        <!-- Compétences et Centres d'intérêt -->
        <div class="skills-interests">
            @if(!empty($cvInformation['competences']))
                <section class="skills-section">
                    <div class="section-header">
                        <div class="section-icon"><i class="bi bi-gear"></i></div>
                        <h2>{{ t('skills', $currentLang, $translations) }}</h2>
                    </div>
                    <div class="skills-grid">
                        @foreach($cvInformation['competences'] as $competence)
                            <div class="skill-tag">{{ $competence['name'] }}</div>
                        @endforeach
                    </div>
                </section>
            @endif

            @if(!empty($cvInformation['hobbies']))
                <section class="hobbies-section">
                    <div class="section-header">
                        <div class="section-icon"><i class="bi bi-heart"></i></div>
                        <h2>{{ t('interests', $currentLang, $translations) }}</h2>
                    </div>
                    <div class="hobbies-grid">
                        @foreach($cvInformation['hobbies'] as $hobby)
                            <div class="hobby-tag">{{ $hobby['name'] }}</div>
                        @endforeach
                    </div>
                </section>
            @endif
        </div>
    </div>

    <style>
        /* Variables CSS */
        :root {
            --primary: #2196F3;
            --primary-dark: #1976D2;
            --text: #2c3e50;
            --text-light: #718096;
            --gradient: linear-gradient(135deg, var(--primary), var(--primary-dark));
        }

        .cv-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16);
            font-family: 'Poppins', system-ui, sans-serif;
            font-size: 8pt;
            line-height: 1.3;
            color: var(--text);
        }

        /* En-tête */
        .cv-header {
            position: relative;
            padding: 8mm 12mm;
            color: white;
        }

        .header-shape {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--gradient);
            clip-path: polygon(0 0, 100% 0, 100% 80%, 0 95%);
            z-index: 1;
        }

        .header-content {
            position: relative;
            z-index: 2;
        }

        .profile-info {
            display: flex;
            gap: 10mm;
            margin-bottom: 6mm;
        }

        .profile-photo {
            width: 30mm;
            height: 30mm;
            border-radius: 50%;
            border: 0.8mm solid rgba(255,255,255,0.3);
            overflow: hidden;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .name-title h1 {
            font-size: 14pt;
            font-weight: 600;
            margin: 0;
            line-height: 1.1;
        }

        .title-box {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 1mm 3mm;
            border-radius: 4mm;
            font-size: 8pt;
            margin-top: 1.5mm;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2mm;
            font-size: 7.5pt;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 2mm;
            color: white;
        }

        /* Sections */
        section {
            padding: 2mm 12mm;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 2mm;
            margin-bottom: 2mm;
        }

        .section-icon {
            width: 6mm;
            height: 6mm;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gradient);
            border-radius: 50%;
            color: white;
            font-size: 8pt;
        }

        h2 {
            font-size: 10pt;
            color: var(--primary-dark);
            margin: 0;
            padding-bottom: 0.8mm;
            border-bottom: 0.3mm solid var(--primary);
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: 4mm;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 0.3mm;
            background: var(--primary);
        }

        .timeline-item {
            position: relative;
            margin-bottom: 3mm;
        }

        .timeline-dot {
            position: absolute;
            left: -2mm;
            top: 2mm;
            width: 1.5mm;
            height: 1.5mm;
            background: var(--primary);
            border-radius: 50%;
            transform: translateX(-50%);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1mm;
        }

        .experience-title h3 {
            font-size: 9pt;
            font-weight: 600;
            margin: 0;
            color: var(--text);
        }

        .company-name {
            font-size: 8pt;
            color: var(--primary);
            margin-top: 0.3mm;
        }

        .date-range {
            font-size: 7.5pt;
            color: var(--text-light);
            display: flex;
            align-items: center;
            gap: 1mm;
            white-space: nowrap;
        }

        .experience-description {
            font-size: 8pt;
            margin: 1.5mm 0;
            color: var(--text);
        }

        .achievement {
            display: flex;
            align-items: center;
            gap: 2mm;
            font-size: 7.5pt;
            color: var(--text-light);
            margin-top: 1.5mm;
        }

        /* Skills & Interests */
        .skills-interests {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4mm;
            padding: 0 12mm;
            margin-top: 3mm;
        }

        .skills-grid, .hobbies-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
        }

        .skill-tag, .hobby-tag {
            background: #f8fafc;
            padding: 1mm 2mm;
            border-radius: 3mm;
            font-size: 7.5pt;
            color: var(--text);
            border: 0.2mm solid rgba(0,0,0,0.05);
        }

        /* Optimisation impression */
        @media print {
            * {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
            }

            .cv-container {
                margin: 0;
                padding: 0;
                box-shadow: none;
            }

            /* Force le rendu des dégradés et couleurs */
            .header-shape,
            .section-icon {
                background: var(--gradient) !important;
            }

            /* Éviter les sauts de page indésirables */
            section {
                break-inside: avoid;
            }

            .timeline-item {
                break-inside: avoid;
            }

            /* Spacer pour les marges de page suivantes */
            .page-break-spacer {
                height: 12mm;
                width: 100%;
                display: block;
                page-break-after: always;
                visibility: hidden;
            }
        }
    </style>
@endsection
