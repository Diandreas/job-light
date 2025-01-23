@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête moderne avec gradient -->
        <header class="header-section">
            <div class="header-content">
                <div class="name-section">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                    <div class="title-tag">{{ $cvInformation['professions'][0]['name'] ?? '' }}</div>
                </div>
                <div class="contact-section">
                    <a href="mailto:{{ $cvInformation['personalInformation']['email'] }}" class="contact-pill">
                        <i class="bi bi-envelope-fill"></i>
                        <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                    </a>
                    <a href="tel:{{ $cvInformation['personalInformation']['phone'] }}" class="contact-pill">
                        <i class="bi bi-telephone-fill"></i>
                        <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                    </a>
                    <div class="contact-pill">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                    </div>
                    @if(!empty($cvInformation['personalInformation']['linkedin']))
                        <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" class="contact-pill" target="_blank">
                            <i class="bi bi-linkedin"></i>
                            <span>LinkedIn</span>
                        </a>
                    @endif
                </div>
            </div>
        </header>

        <main class="main-content">
            <div class="left-column">
                <!-- À propos -->
                @if(!empty($cvInformation['summaries']))
                    <section class="about-section">
                        <h2><i class="bi bi-person-lines-fill"></i>À propos</h2>
                        <div class="content-card">
                            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                        </div>
                    </section>
                @endif

                <!-- Expérience -->
                @foreach($experiencesByCategory as $category => $experiences)
                    <section class="experience-section">
                        <h2><i class="bi bi-briefcase-fill"></i>{{ $category }}</h2>
                        <div class="timeline">
                            @foreach($experiences as $experience)
                                <div class="timeline-item">
                                    <div class="timeline-marker"></div>
                                    <div class="content-card">
                                        <div class="experience-header">
                                            <div class="experience-title">
                                                <h3>{{ $experience['name'] }}</h3>
                                                <div class="company-name">{{ $experience['InstitutionName'] }}</div>
                                            </div>
                                            <div class="date-tag">
                                                {{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Présent' }}
                                            </div>
                                        </div>
                                        <p class="experience-description">{{ $experience['description'] }}</p>
                                        @if(!empty($experience['output']))
                                            <div class="achievement-card">
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
            </div>

            <div class="right-column">
                <!-- Compétences -->
                @if(!empty($cvInformation['competences']))
                    <section class="skills-section">
                        <h2><i class="bi bi-gear-fill"></i>Compétences</h2>
                        <div class="skills-grid">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="skill-card">
                                    {{ $competence['name'] }}
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif

                <!-- Centres d'intérêt -->
                @if(!empty($cvInformation['hobbies']))
                    <section class="interests-section">
                        <h2><i class="bi bi-heart-fill"></i>Centres d'intérêt</h2>
                        <div class="interests-grid">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <div class="interest-card">
                                    {{ $hobby['name'] }}
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif
            </div>
        </main>
    </div>

    <style>
        :root {
            --primary-color: #2196F3;
            --primary-dark: #1976D2;
            --primary-light: #BBDEFB;
            --secondary-color: #78909C;
            --accent-color: #FF4081;
            --text-primary: #212121;
            --text-secondary: #757575;
            --background: #FFFFFF;
            --surface: #F5F5F5;
            --card-shadow: 0 2px 4px rgba(0,0,0,0.1);
            --spacing-xs: 0.25rem;
            --spacing-sm: 0.5rem;
            --spacing-md: 1rem;
            --spacing-lg: 1.5rem;
            --border-radius: 8px;
            --header-height: 180px;
        }

        .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            background: var(--background);
            font-family: 'Inter', sans-serif;
            line-height: 1.4;
        }

        /* Header Styles */
        .header-section {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: white;
            padding: var(--spacing-lg);
            border-radius: 0 0 var(--border-radius) var(--border-radius);
        }

        .header-content {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
        }

        .name-section h1 {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
        }

        .title-tag {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: 20px;
            font-size: 14px;
            margin-top: var(--spacing-xs);
        }

        .contact-section {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
        }

        .contact-pill {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            background: rgba(255, 255, 255, 0.1);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: 20px;
            font-size: 12px;
            text-decoration: none;
            color: white;
            transition: background 0.3s;
        }

        .contact-pill:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        /* Main Content Layout */
        .main-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: var(--spacing-lg);
            padding: var(--spacing-lg);
        }

        /* Section Styles */
        section {
            margin-bottom: var(--spacing-lg);
        }

        h2 {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs);
            font-size: 16px;
            color: var(--primary-color);
            margin-bottom: var(--spacing-md);
            padding-bottom: var(--spacing-xs);
            border-bottom: 2px solid var(--primary-light);
        }

        h2 i {
            font-size: 18px;
        }

        /* Cards */
        .content-card {
            background: var(--surface);
            padding: var(--spacing-md);
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            font-size: 14px;
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: var(--spacing-lg);
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--primary-light);
        }

        .timeline-item {
            position: relative;
            margin-bottom: var(--spacing-lg);
        }

        .timeline-marker {
            position: absolute;
            left: calc(-1 * var(--spacing-lg));
            width: 12px;
            height: 12px;
            background: var(--primary-color);
            border-radius: 50%;
            border: 2px solid white;
            transform: translateX(-50%);
        }

        /* Experience Cards */
        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: var(--spacing-sm);
        }

        .experience-title h3 {
            font-size: 15px;
            color: var(--primary-dark);
            margin: 0;
        }

        .company-name {
            font-size: 13px;
            color: var(--secondary-color);
        }

        .date-tag {
            font-size: 12px;
            color: var(--accent-color);
            background: var(--primary-light);
            padding: var(--spacing-xs) var(--spacing-sm);
            border-radius: 12px;
        }

        .achievement-card {
            display: flex;
            align-items: flex-start;
            gap: var(--spacing-sm);
            background: white;
            padding: var(--spacing-sm);
            border-radius: var(--border-radius);
            margin-top: var(--spacing-sm);
        }

        .achievement-card i {
            color: var(--accent-color);
        }

        /* Skills and Interests */
        .skills-grid, .interests-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: var(--spacing-sm);
        }

        .skill-card, .interest-card {
            background: var(--surface);
            padding: var(--spacing-sm);
            border-radius: var(--border-radius);
            text-align: center;
            font-size: 12px;
            transition: transform 0.3s;
        }

        .skill-card:hover, .interest-card:hover {
            transform: translateY(-2px);
        }

        /* Print Styles */
        @media print {
            .cv-container {
                max-width: none;
                margin: 0;
                padding: 0;
            }

            .header-section {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .timeline-marker, .content-card, .skill-card, .interest-card {
                break-inside: avoid;
            }

            section {
                break-inside: avoid;
            }
        }

        /* Responsive Design */
        @media screen and (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
            }

            .header-content {
                flex-direction: column;
            }

            .contact-section {
                flex-direction: column;
            }

            .skills-grid, .interests-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
@endsection
