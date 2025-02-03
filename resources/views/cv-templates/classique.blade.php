@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête -->
        <header class="cv-header">
            <div class="header-content">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil">
                    </div>
                @endif
                <div class="header-text">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                    <h2 class="profession">{{ $cvInformation['professions'][0]['name']}}</h2>
                    <div class="contact-info">
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
            </div>
        </header>

        <!-- Résumé Professionnel -->
        @if(!empty($cvInformation['summaries']))
            <section class="professional-summary">
                <h2>Résumé Professionnel</h2>
                <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </section>
        @endif

        <!-- Expérience Professionnelle -->
        @foreach($experiencesByCategory as $category => $experiences)
            <section class="experience-section">
                <h2>{{ $category }}</h2>
                @foreach($experiences as $experience)
                    <div class="experience-item">
                        <div class="experience-header">
                            <div class="title-company">
                                <h3>{{ $experience['name'] }}</h3>
                                <div class="company">
                                    {{ $experience['InstitutionName'] }}
                                    @if($experience['attachment_path'])
                                        <span class="attachment-indicator">
                                            <i class="bi bi-paperclip"></i>
                                        </span>
                                    @endif
                                </div>
                            </div>
                            <div class="date">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->format('M Y') }} -
                                {{ $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end'])->format('M Y') : 'Present' }}
                            </div>
                        </div>
                        <p class="description">{{ $experience['description'] }}</p>
                        @if($experience['output'])
                            <div class="achievement">
                                <p><i class="bi bi-check-circle"></i> {{ $experience['output'] }}</p>
                            </div>
                        @endif

                        @if(!empty($experience['references']))
                            <div class="references-block">
                                <h4>Références</h4>
                                <div class="references-grid">
                                    @foreach($experience['references'] as $reference)
                                        <div class="reference-item">
                                            <div class="reference-header">
                                                <div class="reference-name">{{ $reference['name'] }}</div>
                                                <div class="reference-title">{{ $reference['function'] }}</div>
                                            </div>
                                            <div class="reference-contact">
                                                @if($reference['email'])
                                                    <div class="contact-detail">
                                                        <i class="bi bi-envelope"></i>
                                                        <span>{{ $reference['email'] }}</span>
                                                    </div>
                                                @endif
                                                @if($reference['telephone'])
                                                    <div class="contact-detail">
                                                        <i class="bi bi-telephone"></i>
                                                        <span>{{ $reference['telephone'] }}</span>
                                                    </div>
                                                @endif
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @endif
                    </div>
                @endforeach
            </section>
        @endforeach

        <!-- Compétences -->
        @if(!empty($cvInformation['competences']))
            <section class="skills-section">
                <h2>Compétences</h2>
                <div class="skills-list">
                    @foreach($cvInformation['competences'] as $competence)
                        <div class="skill-item">{{ $competence['name'] }}</div>
                    @endforeach
                </div>
            </section>
        @endif

        <!-- Centres d'intérêt -->
        @if(!empty($cvInformation['hobbies']))
            <section class="hobbies-section">
                <h2>Centres d'intérêt</h2>
                <div class="hobbies-list">
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <span class="hobby-item">{{ $hobby['name'] }}</span>
                    @endforeach
                </div>
            </section>
        @endif
    </div>

    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #34495e;
            --accent-color: #3498db;
            --text-color: #333333;
            --light-gray: #ecf0f1;
            --border-color: #bdc3c7;
        }

        /* Styles de base */
        .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            font-family: 'Times New Roman', serif;
            color: var(--text-color);
            background: white;
        }

        /* En-tête avec photo */
        .cv-header {
            margin-bottom: 2rem;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 1rem;
        }

        .header-content {
            display: flex;
            gap: 2rem;
            align-items: center;
        }

        .profile-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid var(--border-color);
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            flex: 1;
        }

        .cv-header h1 {
            color: var(--primary-color);
            font-size: 2rem;
            margin: 0 0 0.5rem 0;
        }

        .profession {
            font-size: 1.2rem;
            color: var(--secondary-color);
            margin-bottom: 1rem;
        }

        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }

        /* Sections générales */
        section {
            margin-bottom: 1.5rem;
        }

        h2 {
            color: var(--primary-color);
            font-size: 1.3rem;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 0.3rem;
            margin-bottom: 1rem;
        }

        /* Expériences */
        .experience-item {
            margin-bottom: 1.5rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px dotted var(--border-color);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.5rem;
        }

        .title-company h3 {
            font-size: 1.1rem;
            color: var(--secondary-color);
            margin-bottom: 0.2rem;
        }

        .company {
            font-style: italic;
            color: var(--secondary-color);
        }

        .attachment-indicator {
            color: var(--accent-color);
            margin-left: 0.5rem;
        }

        .date {
            color: var(--secondary-color);
            font-size: 0.9rem;
        }

        .description {
            margin: 0.5rem 0;
            text-align: justify;
        }

        .achievement {
            margin-top: 0.5rem;
            padding-left: 1rem;
            border-left: 2px solid var(--accent-color);
            color: var(--secondary-color);
        }

        .achievement i {
            color: var(--accent-color);
            margin-right: 0.5rem;
        }

        /* Références */
        .references-block {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed var(--border-color);
        }

        .references-block h4 {
            color: var(--primary-color);
            font-size: 1rem;
            margin-bottom: 0.8rem;
        }

        .references-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        .reference-item {
            background: var(--light-gray);
            padding: 0.8rem;
            border-radius: 4px;
        }

        .reference-header {
            margin-bottom: 0.5rem;
        }

        .reference-name {
            font-weight: bold;
            color: var(--primary-color);
        }

        .reference-title {
            font-style: italic;
            color: var(--secondary-color);
            font-size: 0.9rem;
            margin-top: 0.2rem;
        }

        .reference-contact {
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }

        .contact-detail {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            color: var(--secondary-color);
        }

        /* Compétences et Centres d'intérêt */
        .skills-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.8rem;
        }

        .skill-item, .hobby-item {
            background: var(--light-gray);
            padding: 0.5rem;
            border-radius: 4px;
            text-align: center;
        }

        .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }

        /* Optimisation pour l'impression */
        @media print {
            .cv-container {
                padding: 15mm;
                margin: 0;
            }

            section {
                break-inside: avoid;
            }

            .experience-item {
                break-inside: avoid;
            }

            .references-block {
                break-inside: avoid;
            }

            .reference-item {
                break-inside: avoid;
            }

            .profile-photo {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }

        /* Responsive */
        @media screen and (max-width: 768px) {
            .header-content {
                flex-direction: column;
                text-align: center;
            }

            .contact-info {
                justify-content: center;
            }

            .experience-header {
                flex-direction: column;
                text-align: center;
                gap: 0.5rem;
            }

            .references-grid {
                grid-template-columns: 1fr;
            }

            .skills-list {
                grid-template-columns: 1fr 1fr;
            }
        }
    </style>
@endsection
