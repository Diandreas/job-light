@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <header class="cv-header">
            <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
            <div class="contact-info">
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
                    @if($cvInformation['personalInformation']['github'])
                        <div class="contact-item">
                            <i class="bi bi-github"></i>
                            <span>{{ $cvInformation['personalInformation']['github'] }}</span>
                        </div>
                    @endif
                </div>
            </div>
        </header>

        @if(!empty($cvInformation['summaries']))
            <section class="summary">
                <h2><i class="bi bi-person-circle"></i> Résumé</h2>
                <div class="summary-content">
                    <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
                </div>
            </section>
        @endif

        <div class="main-content">
            <div class="left-column">
                @foreach($experiencesByCategory as $category => $experiences)
                    <section class="experiences">
                        <h2>
                            <i class="bi bi-briefcase"></i>
                            {{ $category }}
                        </h2>
                        @foreach($experiences as $experience)
                            <div class="experience-item">
                                <div class="experience-header">
                                    <h3>{{ $experience['name'] }}</h3>
                                    <span class="dates">{{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Present' }}</span>
                                </div>
                                <p class="company">{{ $experience['InstitutionName'] }}</p>
                                <p class="description">{{ $experience['description'] }}</p>
                                @if($experience['output'])
                                    <div class="achievements">
                                        <p><i class="bi bi-check2-circle"></i> {{ $experience['output'] }}</p>
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </section>
                @endforeach
            </div>

            <div class="right-column">
                @if(!empty($cvInformation['competences']))
                    <section class="competences">
                        <h2><i class="bi bi-gear"></i> Compétences</h2>
                        <div class="skills-grid">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="skill-item">{{ $competence['name'] }}</div>
                            @endforeach
                        </div>
                    </section>
                @endif

                @if(!empty($cvInformation['hobbies']))
                    <section class="hobbies">
                        <h2><i class="bi bi-heart"></i> Centres d'intérêt</h2>
                        <div class="hobbies-grid">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <div class="hobby-item">{{ $hobby['name'] }}</div>
                            @endforeach
                        </div>
                    </section>
                @endif
            </div>
        </div>
    </div>

    <style>
        /* Variables CSS */
        :root {
            --primary-color: #2563eb;
            --secondary-color: #1e40af;
            --text-color: #1f2937;
            --text-light: #4b5563;
            --background-color: #ffffff;
            --border-color: #e5e7eb;
            --section-spacing: 1rem;
            --content-width: 210mm;
            --content-padding: 15mm;
        }

        /* Reset et styles de base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--text-color);
            line-height: 1.4;
            background-color: var(--background-color);
            font-size: 0.9rem;
        }

        /* Container principal */
        .cv-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: var(--content-padding);
            background-color: var(--background-color);
        }

        /* En-tête */
        .cv-header {
            text-align: center;
            margin-bottom: 0.8rem;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid var(--border-color);
        }

        .cv-header h1 {
            font-size: 1.8rem;
            color: var(--primary-color);
            margin-bottom: 0.5rem;
            font-weight: 700;
        }

        /* Grille de contact */
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            font-size: 0.8rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            color: var(--text-light);
        }

        .contact-item i {
            color: var(--primary-color);
            font-size: 0.9rem;
        }

        /* Disposition principale */
        .main-content {
            display: grid;
            grid-template-columns: 65% 35%;
            gap: 1rem;
            margin-top: var(--section-spacing);
        }

        /* Sections */
        section {
            margin-bottom: var(--section-spacing);
            padding: 0.8rem;
        }

        section h2 {
            font-size: 1.2rem;
            color: var(--primary-color);
            margin-bottom: 0.8rem;
            padding-bottom: 0.3rem;
            border-bottom: 1px solid var(--primary-color);
            display: flex;
            align-items: center;
            gap: 0.3rem;
        }

        .section-icon {
            font-size: 1rem;
        }

        /* Expériences */
        .experience-item {
            margin-bottom: 0.8rem;
            padding-bottom: 0.8rem;
            border-bottom: 1px solid var(--border-color);
        }

        .experience-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.3rem;
        }

        .experience-header h3 {
            font-size: 1rem;
            color: var(--secondary-color);
            font-weight: 600;
        }

        .dates {
            font-size: 0.8rem;
            color: var(--text-light);
        }

        .company {
            font-weight: 600;
            color: var(--text-light);
            margin-bottom: 0.3rem;
            font-size: 0.9rem;
        }

        .description {
            font-size: 0.85rem;
            margin-bottom: 0.3rem;
        }

        .achievements {
            font-size: 0.85rem;
            color: var(--text-light);
        }

        .achievements i {
            color: var(--primary-color);
        }

        /* Compétences et centres d'intérêt */
        .skills-grid, .hobbies-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
        }

        .skill-item, .hobby-item {
            background-color: #f3f4f6;
            padding: 0.3rem 0.5rem;
            border-radius: 3px;
            font-size: 0.8rem;
            text-align: center;
        }

        /* Styles d'impression */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }

            .cv-container {
                width: 210mm;
                height: 297mm;
                padding: var(--content-padding);
                margin: 0;
                border: none;
                box-shadow: none;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            section {
                break-inside: avoid;
            }

            .main-content {
                grid-template-columns: 65% 35%;
            }
        }
    </style>

    <!-- Ajout de Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
@endsection
