@extends('layouts.cv')

@section('content')
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" media="all">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" media="all">

    <div class="cv-container">
        <!-- En-tête avec photo -->
        <header class="cv-header">
            <div class="header-shape"></div>
            <div class="header-content">
                <div class="profile-info">
                    @if($cvInformation['personalInformation']['photo'])
                        <div class="profile-photo">
                            <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil">
                        </div>
                    @endif
                    <div class="name-title">
                        <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                        @if(!empty($cvInformation['professions']))
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
                    <h2>À propos</h2>
                </div>
                <p class="summary-content">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </section>
        @endif

        <!-- Expériences -->
        @foreach($experiencesByCategory as $category => $experiences)
            <section class="experience-section">
                <div class="section-header">
                    <div class="section-icon"><i class="bi bi-briefcase"></i></div>
                    <h2>{{ $category }}</h2>
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
                                        {{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Présent' }}
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
                        <h2>Compétences</h2>
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
                        <h2>Centres d'intérêt</h2>
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

        /* Base */
        .cv-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
            font-family: 'Poppins', system-ui, sans-serif;
            font-size: 9pt;
            line-height: 1.4;
            color: var(--text);
        }

        /* En-tête */
        .cv-header {
            position: relative;
            padding: 15mm 12mm;
            color: white;
        }

        .header-shape {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--gradient);
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
            z-index: 1;
        }

        .header-content {
            position: relative;
            z-index: 2;
        }

        .profile-info {
            display: flex;
            gap: 10mm;
            margin-bottom: 8mm;
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
            font-size: 16pt;
            font-weight: 600;
            margin: 0;
            line-height: 1.2;
        }

        .title-box {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 1.5mm 4mm;
            border-radius: 4mm;
            font-size: 9pt;
            margin-top: 2mm;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 3mm;
            font-size: 8.5pt;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 2mm;
            color: white;
        }

        /* Sections */
        section {
            padding: 3mm 12mm;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 3mm;
            margin-bottom: 3mm;
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
            font-size: 11pt;
            color: var(--primary-dark);
            margin: 0;
            padding-bottom: 1mm;
            border-bottom: 0.3mm solid var(--primary);
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: 5mm;
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
            margin-bottom: 4mm;
        }

        .timeline-dot {
            position: absolute;
            left: -2.5mm;
            top: 2mm;
            width: 2mm;
            height: 2mm;
            background: var(--primary);
            border-radius: 50%;
            transform: translateX(-50%);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
        }

        .experience-title h3 {
            font-size: 10pt;
            font-weight: 600;
            margin: 0;
            color: var(--text);
        }

        .company-name {
            font-size: 9pt;
            color: var(--primary);
            margin-top: 0.5mm;
        }

        .date-range {
            font-size: 8pt;
            color: var(--text-light);
        }

        .experience-description {
            font-size: 9pt;
            margin: 2mm 0;
            color: var(--text);
        }

        .achievement {
            display: flex;
            align-items: center;
            gap: 2mm;
            font-size: 8.5pt;
            color: var(--text-light);
            margin-top: 2mm;
        }

        /* Skills & Hobbies */
        .skills-grid, .hobbies-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }

        .skill-tag, .hobby-tag {
            background: #f8fafc;
            padding: 1.5mm 3mm;
            border-radius: 3mm;
            font-size: 8.5pt;
            color: var(--text);
        }

        /* Print Optimization */
        @media print {
            @page {
                size: A4;
                margin: 0;
            }

            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 0;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            .header-shape,
            .cv-header,
            .section-icon,
            .profile-photo {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            section {
                page-break-inside: avoid;
            }

            h2 {
                page-break-after: avoid;
            }

            .timeline-item {
                page-break-inside: avoid;
            }

            .skills-interests {
                page-break-inside: avoid;
            }
        }
    </style>
@endsection
