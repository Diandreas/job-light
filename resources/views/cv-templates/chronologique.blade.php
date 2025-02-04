@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête moderne -->
        <header class="cv-header">
            <div class="profile-section">
                <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                <div class="profession">{{ $cvInformation['professions'][0]['name']}}</div>
            </div>
            <div class="contact-section">
                <div class="contact-grid">
                    <div class="contact-item">
                        <i class="bi bi-envelope"></i>
                        <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                    </div>
                    <div class="contact-item">
                        <i class="bi bi-telephone"></i>
                        <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                    </div>
                    <div class="contact-item">
                        <i class="bi bi-geo-alt"></i>
                        <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                    </div>
                    @if($cvInformation['personalInformation']['linkedin'])
                        <div class="contact-item">
                            <i class="bi bi-linkedin"></i>
                            <span>{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                        </div>
                    @endif
                </div>
            </div>
        </header>

        <!-- Section profil -->
        @if(!empty($cvInformation['summaries']))
            <section class="profile-summary">
                <h2><i class="bi bi-person-lines-fill"></i> Profil Professionnel</h2>
                <div class="summary-content">
                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                </div>
            </section>
        @endif

        <!-- Parcours chronologique -->
        <div class="main-content">
            <div class="left-column">
                @foreach($experiencesByCategory as $category => $experiences)
                    <section class="experience-section">
                        <h2><i class="bi bi-briefcase"></i> {{ $category }}</h2>
                        @foreach($experiences as $experience)
                            <div class="experience-block">
                                <div class="date-block">
                                    <span class="year">{{ \Carbon\Carbon::parse($experience['date_start'])->format('Y') }}</span>
                                    <div class="date-range">
                                        <div>{{ $experience['date_start'] }}</div>
                                        <div class="date-separator"></div>
                                        <div>{{ $experience['date_end'] ?? 'Present' }}</div>
                                    </div>
                                </div>
                                <div class="experience-content">
                                    <h3>{{ $experience['name'] }}</h3>
                                    <div class="company-name">
                                        <i class="bi bi-building"></i>
                                        {{ $experience['InstitutionName'] }}
                                    </div>
                                    <p class="experience-description">{{ $experience['description'] }}</p>
                                    @if($experience['output'])
                                        <div class="experience-achievement">
                                            <i class="bi bi-check-circle"></i>
                                            <span>{{ $experience['output'] }}</span>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </section>
                @endforeach
            </div>

            <div class="right-column">
                @if(!empty($cvInformation['competences']))
                    <section class="skills-section">
                        <h2><i class="bi bi-gear"></i> Compétences</h2>
                        <div class="skills-grid">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="skill-item">{{ $competence['name'] }}</div>
                            @endforeach
                        </div>
                    </section>
                @endif

                @if(!empty($cvInformation['hobbies']))
                    <section class="interests-section">
                        <h2><i class="bi bi-heart"></i> Centres d'intérêt</h2>
                        <div class="interests-grid">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <div class="interest-item">{{ $hobby['name'] }}</div>
                            @endforeach
                        </div>
                    </section>
                @endif
            </div>
        </div>
    </div>

    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #34495e;
            --accent-color: #3498db;
            --text-color: #2c3e50;
            --text-light: #7f8c8d;
            --background-color: #ffffff;
            --border-color: #ecf0f1;
            --section-spacing: 2rem;
        }

        .cv-container {
            width: 210mm;
            min-height: 297mm;
            background: var(--background-color);
            padding: 30px;
            color: var(--text-color);
            font-family: 'Source Sans Pro', sans-serif;
        }

        /* Header Styles */
        .cv-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--section-spacing);
            padding-bottom: var(--section-spacing);
            border-bottom: 2px solid var(--border-color);
        }

        .profile-section h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin: 0;
        }

        .profession {
            font-size: 1.2rem;
            color: var(--accent-color);
            margin-top: 0.5rem;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-light);
        }

        /* Main Content Layout */
        .main-content {
            display: flex;
            gap: 2rem;
        }

        .left-column {
            flex: 2;
        }

        .right-column {
            flex: 1;
        }

        /* Experience Blocks */
        .experience-block {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
            position: relative;
        }

        .date-block {
            flex: 0 0 120px;
            text-align: right;
        }

        .year {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--accent-color);
        }

        .date-range {
            font-size: 0.9rem;
            color: var(--text-light);
            position: relative;
        }

        .date-separator {
            height: 100%;
            width: 2px;
            background-color: var(--border-color);
            position: absolute;
            right: -1.5rem;
            top: 0;
        }

        .experience-content {
            flex: 1;
            padding-left: 1.5rem;
            border-left: 2px solid var(--border-color);
        }

        .experience-content h3 {
            color: var(--primary-color);
            margin: 0 0 0.5rem 0;
        }

        .company-name {
            color: var(--text-light);
            margin-bottom: 0.75rem;
        }

        .experience-description {
            margin-bottom: 0.75rem;
            line-height: 1.5;
        }

        .experience-achievement {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            color: var(--accent-color);
        }

        /* Skills and Interests */
        .skills-grid, .interests-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }



        .skill-item, .interest-item {
            background-color: var(--border-color);
            padding: 0.5rem 1rem;
            border-radius: 4px;
            text-align: center;
        }

        /* Section Headers */
        section h2 {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary-color);
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
        }

        section h2 i {
            color: var(--accent-color);
        }

        /* Profile Summary */
        .profile-summary {
            margin-bottom: var(--section-spacing);
            padding-bottom: var(--section-spacing);
            border-bottom: 2px solid var(--border-color);
        }

        .summary-content {
            line-height: 1.6;
        }

        /* Print Optimization */
        @media print {
            .cv-container {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 20mm;
            }

            section {
                break-inside: avoid;
            }

            .experience-block {
                break-inside: avoid;
            }
        }

        /* Responsive Design */
        @media screen and (max-width: 768px) {
            .cv-header {
                flex-direction: column;
                gap: 1.5rem;
            }

            .main-content {
                flex-direction: column;
            }

            .contact-grid {
                grid-template-columns: 1fr;
            }

            .skills-grid, .interests-grid {
                grid-template-columns: 1fr;
            }

            .experience-block {
                flex-direction: column;
                gap: 1rem;
            }

            .date-block {
                text-align: left;
            }

            .date-separator {
                display: none;
            }

            .experience-content {
                padding-left: 0;
                border-left: none;
            }
        }
        @media print {
            /* Préserver les dimensions exactes */
            .cv-container {
                width: 210mm;
                min-height: 297mm;
                padding: 30px !important; /* Garder le même padding qu'à l'écran */
                margin: 0 !important;
                background-color: var(--background-color) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            /* Garder les couleurs et les styles */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            /* Maintenir la structure en colonnes */
            .main-content {
                display: flex !important;
                gap: 2rem !important;
            }

            .left-column {
                flex: 2 !important;
            }

            .right-column {
                flex: 1 !important;
            }

            /* Préserver les bordures et couleurs */
            .cv-header {
                border-bottom: 2px solid var(--border-color) !important;
            }

            .experience-content {
                border-left: 2px solid var(--border-color) !important;
            }

            .date-separator {
                background-color: var(--border-color) !important;
            }

            /* Garder les couleurs de fond des compétences */
            .skill-item, .interest-item {
                background-color: var(--border-color) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* Maintenir les marges et espacements */
            .experience-block {
                margin-bottom: 2rem !important;
                break-inside: avoid;
                page-break-inside: avoid;
            }

            section {
                break-inside: avoid;
                page-break-inside: avoid;
            }

            /* Préserver les icônes */
            .bi {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            /* Garder les tailles de police */
            .profile-section h1 {
                font-size: 2.5rem !important;
            }

            .profession {
                font-size: 1.2rem !important;
            }

            /* Éviter les sauts de page indésirables */
            h2, h3 {
                break-after: avoid;
                page-break-after: avoid;
            }

            .profile-summary {
                break-inside: avoid;
                page-break-inside: avoid;
            }

            /* Assurer que les couleurs sont imprimées */
            .year {
                color: var(--accent-color) !important;
            }

            .experience-achievement {
                color: var(--accent-color) !important;
            }

            section h2 i {
                color: var(--accent-color) !important;
            }
        }
    </style>
@endsection
