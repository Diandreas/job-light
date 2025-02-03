@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête compact avec photo et infos essentielles -->
        <header class="cv-header">
            @if($cvInformation['personalInformation']['photo'])
                <div class="header-photo">
                    <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil">
                </div>
            @endif
            <div class="header-content">
                <div class="header-main">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                    <h2>{{ $cvInformation['professions'][0]['name']}}</h2>
                </div>
                <div class="header-contact">
                    <div class="contact-item"><i class="bi bi-envelope"></i>{{ $cvInformation['personalInformation']['email'] }}</div>
                    <div class="contact-item"><i class="bi bi-telephone"></i>{{ $cvInformation['personalInformation']['phone'] }}</div>
                    <div class="contact-item"><i class="bi bi-geo-alt"></i>{{ $cvInformation['personalInformation']['address'] }}</div>
                    @if($cvInformation['personalInformation']['linkedin'])
                        <div class="contact-item"><i class="bi bi-linkedin"></i>{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                    @endif
                    @if($cvInformation['personalInformation']['github'])
                        <div class="contact-item"><i class="bi bi-github"></i>{{ $cvInformation['personalInformation']['github'] }}</div>
                    @endif
                </div>
            </div>
        </header>

        <!-- Résumé très concis -->
        @if(!empty($cvInformation['summaries']))
            <section class="summary-section">
                {{ $cvInformation['summaries'][0]['description'] ?? '' }}
            </section>
        @endif

        <div class="two-columns">
            <!-- Colonne principale -->
            <div class="main-column">
                <!-- Expériences -->
                @foreach($experiencesByCategory as $category => $experiences)
                    <section class="experience-section">
                        <h3>{{ $category }}</h3>
                        @foreach($experiences as $experience)
                            <div class="experience-item">
                                <div class="experience-header">
                                    <div class="title-company">
                                        <strong>{{ $experience['name'] }}</strong>
                                        <span class="company">{{ $experience['InstitutionName'] }}</span>
                                    </div>
                                    <div class="date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->format('M Y') }} -
                                        {{ $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end'])->format('M Y') : 'Present' }}
                                    </div>
                                </div>
                                <p class="description">{{ $experience['description'] }}</p>
                                @if($experience['output'])
                                    <p class="output">• {{ $experience['output'] }}</p>
                                @endif

                                <!-- Références compactes -->
                                @if(!empty($experience['references']))
                                    <div class="references-compact">
                                        <div class="references-title">Références:</div>
                                        <div class="references-grid">
                                            @foreach($experience['references'] as $reference)
                                                <div class="reference-item">
                                                    <div class="reference-name">{{ $reference['name'] }}</div>
                                                    <div class="reference-function">{{ $reference['function'] }}</div>
                                                    @if($reference['email'])
                                                        <div class="reference-contact">
                                                            <i class="bi bi-envelope"></i> {{ $reference['email'] }}
                                                        </div>
                                                    @endif
                                                    @if($reference['telephone'])
                                                        <div class="reference-contact">
                                                            <i class="bi bi-telephone"></i> {{ $reference['telephone'] }}
                                                        </div>
                                                    @endif
                                                </div>
                                            @endforeach
                                        </div>
                                    </div>
                                @endif

                                <!-- Indicateur de pièce jointe -->
                                @if($experience['attachment_path'])
                                    <div class="attachment-indicator">
                                        <i class="bi bi-paperclip"></i> Documentation disponible
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </section>
                @endforeach
            </div>

            <!-- Colonne latérale -->
            <div class="side-column">
                <!-- Compétences -->
                @if(!empty($cvInformation['competences']))
                    <section class="skills-section">
                        <h3>Compétences</h3>
                        <div class="skills-list">
                            @foreach($cvInformation['competences'] as $competence)
                                <span class="skill-tag">{{ $competence['name'] }}</span>
                            @endforeach
                        </div>
                    </section>
                @endif

                <!-- Centres d'intérêt -->
                @if(!empty($cvInformation['hobbies']))
                    <section class="hobbies-section">
                        <h3>Centres d'intérêt</h3>
                        <div class="hobbies-list">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <span class="hobby-tag">{{ $hobby['name'] }}</span>
                            @endforeach
                        </div>
                    </section>
                @endif
            </div>
        </div>
    </div>

    <style>
        :root {
            --text-primary: #2d3748;
            --text-secondary: #4a5568;
            --border-color: #e2e8f0;
            --bg-accent: #f7fafc;
            --font-size-base: 0.875rem;
            --line-height-base: 1.4;
            --spacing-unit: 0.75rem;
            --accent-color: #3182ce;
        }

        .cv-container {
            width: calc(210mm - 60px);
            min-height: calc(297mm - 60px);
            padding: calc(var(--spacing-unit) * 2);
            font-family: 'Arial', sans-serif;
            font-size: var(--font-size-base);
            line-height: var(--line-height-base);
            color: var(--text-primary);
            background: white;
        }

        /* Header avec photo */
        .cv-header {
            display: flex;
            gap: calc(var(--spacing-unit) * 1.5);
            padding-bottom: var(--spacing-unit);
            border-bottom: 1px solid var(--border-color);
            margin-bottom: var(--spacing-unit);
        }

        .header-photo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid var(--accent-color);
        }

        .header-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header-main h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
            color: var(--text-primary);
        }

        .header-main h2 {
            font-size: 1rem;
            font-weight: normal;
            color: var(--text-secondary);
            margin: calc(var(--spacing-unit) * 0.25) 0 0;
        }

        .header-contact {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: calc(var(--spacing-unit) * 0.5);
            font-size: 0.8rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing-unit) * 0.5);
            white-space: nowrap;
        }

        .contact-item i {
            font-size: 0.9rem;
            color: var(--accent-color);
        }

        /* Layout deux colonnes */
        .two-columns {
            display: grid;
            grid-template-columns: 68% 30%;
            gap: calc(var(--spacing-unit) * 2);
        }

        /* Sections */
        section {
            margin-bottom: var(--spacing-unit);
        }

        .summary-section {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: calc(var(--spacing-unit) * 1.5);
            line-height: 1.5;
        }

        h3 {
            font-size: 1rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 calc(var(--spacing-unit) * 0.75);
            padding-bottom: calc(var(--spacing-unit) * 0.25);
            border-bottom: 1px solid var(--border-color);
            color: var(--accent-color);
        }

        /* Expériences */
        .experience-item {
            margin-bottom: var(--spacing-unit);
            padding-bottom: var(--spacing-unit);
            border-bottom: 1px dotted var(--border-color);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: calc(var(--spacing-unit) * 0.25);
        }

        .title-company {
            display: flex;
            flex-direction: column;
        }

        .company {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .date {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }

        .description {
            font-size: 0.8rem;
            margin: calc(var(--spacing-unit) * 0.25) 0;
        }

        .output {
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin: calc(var(--spacing-unit) * 0.5) 0;
            padding-left: calc(var(--spacing-unit) * 0.5);
        }

        /* Références compactes */
        .references-compact {
            margin-top: calc(var(--spacing-unit) * 0.75);
            font-size: 0.8rem;
            background: var(--bg-accent);
            padding: calc(var(--spacing-unit) * 0.75);
            border-radius: 4px;
        }

        .references-title {
            font-weight: 600;
            margin-bottom: calc(var(--spacing-unit) * 0.5);
            color: var(--accent-color);
        }

        .references-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: calc(var(--spacing-unit) * 0.75);
        }

        .reference-item {
            font-size: 0.75rem;
        }

        .reference-name {
            font-weight: 600;
        }

        .reference-function {
            color: var(--text-secondary);
            margin-bottom: calc(var(--spacing-unit) * 0.25);
        }

        .reference-contact {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing-unit) * 0.25);
            color: var(--text-secondary);
        }

        .reference-contact i {
            font-size: 0.7rem;
            color: var(--accent-color);
        }

        /* Indicateur de pièce jointe */
        .attachment-indicator {
            font-size: 0.75rem;
            color: var(--accent-color);
            margin-top: calc(var(--spacing-unit) * 0.5);
            display: flex;
            align-items: center;
            gap: calc(var(--spacing-unit) * 0.25);
        }

        /* Compétences et centres d'intérêt */
        .skills-list, .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: calc(var(--spacing-unit) * 0.5);
        }

        .skill-tag, .hobby-tag {
            font-size: 0.75rem;
            padding: calc(var(--spacing-unit) * 0.25) calc(var(--spacing-unit) * 0.5);
            background: var(--bg-accent);
            border-radius: 3px;
            white-space: nowrap;
        }

        .skill-tag {
            border-left: 2px solid var(--accent-color);
        }

        /* Style d'impression */
        @media print {
            .cv-container {
                padding: 0;
                margin: 0;
                width: 210mm;
                height: 297mm;
            }

            section {
                break-inside: avoid;
            }

            .experience-item {
                break-inside: avoid;
            }

            .references-compact {
                break-inside: avoid;
            }

            :root {
                --accent-color: #000;
            }

            .skill-tag, .hobby-tag {
                border: 1px solid var(--border-color);
            }
        }

        /* Ajustements pour les petits écrans */
        @media screen and (max-width: 768px) {
            .two-columns {
                grid-template-columns: 1fr;
            }

            .cv-header {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .header-content {
                width: 100%;
                align-items: center;
            }

            .header-contact {
                grid-template-columns: 1fr;
                width: 100%;
            }

            .contact-item {
                justify-content: center;
            }

            .experience-header {
                flex-direction: column;
                gap: calc(var(--spacing-unit) * 0.25);
            }

            .references-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
@endsection
