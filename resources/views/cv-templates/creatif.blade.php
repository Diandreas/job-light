@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête créatif avec forme géométrique -->
        <header class="cv-header">
            <div class="header-shape"></div>
            <div class="header-content">
                <div class="name-title">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}<br></h1>
                    <div class="title-box">
                        <span>{{ $cvInformation['professions'][0]['name']}}</span>
                    </div>
                </div>
                <div class="contact-info">
                    <div class="contact-grid">
                        <a class="contact-item" href="mailto:{{ $cvInformation['personalInformation']['email'] }}">
                            <i class="bi bi-envelope-paper-fill"></i>
                            <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                        </a>
                        <a class="contact-item" href="tel:{{ $cvInformation['personalInformation']['phone'] }}">
                            <i class="bi bi-telephone-forward-fill"></i>
                            <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                        </a>
                        <div class="contact-item">
                            <i class="bi bi-geo-alt-fill"></i>
                            <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                        </div>
                        @if($cvInformation['personalInformation']['linkedin'])
                            <a class="contact-item" href="{{ $cvInformation['personalInformation']['linkedin'] }}" target="_blank">
                                <i class="bi bi-linkedin"></i>
                                <span>LinkedIn</span>
                            </a>
                        @endif
                    </div>
                </div>
            </div>
        </header>

        <!-- Résumé avec style créatif -->
        @if(!empty($cvInformation['summaries']))
            <section class="summary-section">
                <div class="section-icon"><i class="bi bi-quote"></i></div>
                <div class="summary-content">
                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                </div>
            </section>
        @endif

        <!-- Conteneur principal -->
        <div class="main-content">
            <!-- Timeline des expériences -->
            @foreach($experiencesByCategory as $category => $experiences)
                <section class="experience-section">
                    <div class="section-header">
                        <div class="section-icon"><i class="bi bi-briefcase-fill"></i></div>
                        <h2>{{ $category }}</h2>
                    </div>
                    <div class="timeline">
                        @foreach($experiences as $index => $experience)
                            @if($index > 0 && $index % 3 == 0)
                    </div></section>
                <section class="experience-section experience-page-break">
                    <div class="timeline">
                        @endif
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <div class="experience-header">
                                    <h3>{{ $experience['name'] }}</h3>
                                    <span class="date">{{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Present' }}</span>
                                </div>
                                <div class="company-name">{{ $experience['InstitutionName'] }}</div>
                                <p class="description">{{ $experience['description'] }}</p>
                                @if($experience['output'])
                                    <div class="key-achievement">
                                        <i class="bi bi-trophy-fill"></i>
                                        <p>{{ $experience['output'] }}</p>
                                    </div>
                                @endif
                            </div>
                        </div>
                        @endforeach
                    </div>
                </section>
            @endforeach

            <!-- Compétences en hexagones -->
            @if(!empty($cvInformation['competences']))
                <section class="skills-section">
                    <div class="section-header">
                        <div class="section-icon"><i class="bi bi-gear-fill"></i></div>
                        <h2>Compétences</h2>
                    </div>
                    <div class="skills-hexgrid">
                        @foreach($cvInformation['competences'] as $competence)
                            <div class="hexagon">
                                <div class="hexagon-content">
                                    {{ $competence['name'] }}
                                </div>
                            </div>
                        @endforeach
                    </div>
                </section>
            @endif

            <!-- Centres d'intérêt avec design créatif -->
            @if(!empty($cvInformation['hobbies']))
                <section class="hobbies-section">
                    <div class="section-header">
                        <div class="section-icon"><i class="bi bi-heart-fill"></i></div>
                        <h2>Centres d'intérêt</h2>
                    </div>
                    <div class="hobbies-grid">
                        @foreach($cvInformation['hobbies'] as $hobby)
                            <div class="hobby-item">
                                <span>{{ $hobby['name'] }}</span>
                            </div>
                        @endforeach
                    </div>
                </section>
            @endif
        </div>
    </div>

    <style>
        :root {
            --primary-color: #FF6B6B;
            --secondary-color: #4ECDC4;
            --accent-color: #45B7AF;
            --dark-color: #2C3E50;
            --light-color: #F7F9FC;
            --gradient: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        }

        .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            font-family: 'Poppins', sans-serif;
            position: relative;
            overflow: hidden;
        }

        /* Header Styles */
        .cv-header {
            position: relative;
            padding: 3rem 2rem;
            color: white;
            overflow: hidden;
        }

        .header-shape {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--gradient);
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
            z-index: 1;
        }

        .header-content {
            position: relative;
            z-index: 2;
        }

        .name-title h1 {
            font-size: 3rem;
            font-weight: 700;
            line-height: 1.1;
            margin: 0;
        }

        .title-box {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 0.5rem 1rem;
            border-radius: 25px;
            margin-top: 1rem;
        }

        /* Contact Grid */
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
            color: white;
            transition: transform 0.3s;
        }

        .contact-item:hover {
            transform: translateX(5px);
        }

        /* Section Styles */
        section {
            padding: 2rem;
            margin: 1rem 0;
        }

        .section-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .section-icon {
            width: 40px;
            height: 40px;
            background: var(--gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        h2 {
            font-size: 1.5rem;
            color: var(--dark-color);
            margin: 0;
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: 2rem;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--gradient);
        }

        .timeline-item {
            position: relative;
            margin-bottom: 2rem;
        }

        .timeline-dot {
            position: absolute;
            left: -2.4rem;
            top: 0;
            width: 1rem;
            height: 1rem;
            background: var(--primary-color);
            border-radius: 50%;
            border: 2px solid white;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .experience-header h3 {
            margin: 0;
            color: var(--dark-color);
            font-size: 1.2rem;
        }

        .date {
            color: var(--accent-color);
            font-size: 0.9rem;
        }

        .company-name {
            color: var(--primary-color);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }

        .description {
            color: var(--dark-color);
            line-height: 1.6;
            margin: 0;
        }

        /* Skills Hexgrid */
        .skills-hexgrid {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;
        }

        .hexagon {
            width: 120px;
            height: 104px;
            background: var(--gradient);
            clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s;
        }

        .hexagon:hover {
            transform: scale(1.1);
        }

        .hexagon-content {
            color: white;
            text-align: center;
            padding: 1rem;
            font-size: 0.9rem;
        }

        /* Hobbies Grid */
        .hobbies-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .hobby-item {
            background: var(--light-color);
            padding: 0.8rem 1.2rem;
            border-radius: 25px;
            font-size: 0.9rem;
            transition: transform 0.3s;
        }

        .hobby-item:hover {
            transform: translateY(-3px);
            background: var(--gradient);
            color: white;
        }

        /* Key Achievement */
        .key-achievement {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-top: 1rem;
            padding: 1rem;
            background: var(--light-color);
            border-radius: 8px;
        }

        .key-achievement i {
            color: var(--primary-color);
        }

        /* Summary Section */
        .summary-section {
            background: var(--light-color);
            border-radius: 8px;
            margin: -2rem 2rem 2rem;
            padding: 1.5rem;
            position: relative;
            z-index: 3;
        }

        .summary-content {
            color: var(--dark-color);
            line-height: 1.6;
            font-style: italic;
        }

        /* Print Styles */
        @media print {
            /* Configuration de base */
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible;
                background-color: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            /* Nouvelle section pour la gestion des expériences */
            .experience-section {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 20px;
            }

            .experience-page-break {
                break-before: page;
                page-break-before: always;
            }

            .timeline-item {
                break-inside: avoid;
                page-break-inside: avoid;
                margin-bottom: 1.5rem;
            }

            /* Ajustement de l'espacement des expériences */
            .timeline-content {
                padding-bottom: 15px;
            }

            .experience-header {
                margin-bottom: 10px;
            }

            /* Réduire légèrement la taille du texte pour l'impression */
            .description {
                font-size: 0.9rem;
                line-height: 1.4;
                margin: 8px 0;
            }

            .key-achievement {
                margin-top: 8px;
                padding: 8px;
            }

            /* Ajuster les marges pour optimiser l'espace */
            section {
                padding: 10px 15px !important;
                margin: 0 !important;
                margin-bottom: 1rem !important;
            }

            .section-header {
                margin-bottom: 15px !important;
            }

            /* Gestion des compétences et hobbies */
            .skills-section,
            .hobbies-section {
                break-before: auto;
                page-break-before: auto;
                break-inside: avoid;
                page-break-inside: avoid;
                padding: 0.8rem 15px !important;
                margin: 0.5rem 0 !important;
            }

            /* Optimisation des hexagones de compétences */
            .skills-hexgrid {
                justify-content: start;
                gap: 0.6rem;
                padding: 0.5rem;
            }

            .hexagon {
                width: 90px;
                height: 78px;
            }

            /* Optimisation de la grille de hobbies */
            .hobbies-grid {
                gap: 0.6rem;
                padding: 0.5rem;
            }

            .hobby-item {
                padding: 0.5rem 1rem;
                margin: 0;
            }

            /* Préserver les couleurs et les dégradés */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            .header-shape {
                background: var(--gradient) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .cv-header {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
                color: white !important;
                padding: 2rem 1.5rem !important;
            }

            .name-title h1 {
                font-size: 2.5rem !important;
            }

            /* Optimisation de l'espace */
            .contact-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 0.8rem;
            }

            /* Timeline ajustements */
            .timeline {
                padding-left: 1.5rem;
            }

            .timeline::before {
                left: 0;
                width: 1.5px;
            }

            .timeline-dot {
                left: -2rem;
                width: 0.8rem;
                height: 0.8rem;
            }

            /* Style du résumé pour l'impression */
            .summary-section {
                margin: -1rem 1.5rem 1.5rem;
                padding: 1.2rem;
            }

            /* Optimisation des marges globales */
            .main-content {
                padding: 0 10px;
                display: flow-root;
            }

            /* Désactiver les effets hover */
            .contact-item:hover,
            .hexagon:hover,
            .hobby-item:hover {
                transform: none !important;
                background: var(--light-color) !important;
                color: var(--dark-color) !important;
            }

            /* Assurer la lisibilité des liens */
            a {
                text-decoration: none;
            }

            a.contact-item {
                color: white !important;
            }

            /* Assurer que les icônes restent visibles */
            .bi {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* Gestion des sauts de page */
            section {
                break-inside: avoid;
                page-break-inside: avoid;
            }

            h2, h3 {
                break-after: avoid;
                page-break-after: avoid;
            }
        }
    </style>
@endsection
