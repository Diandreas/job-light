@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête -->
        <header>
            @if($cvInformation['personalInformation']['photo'])
                <div class="profile-photo">
                    <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil">
                </div>
            @endif
            <div class="header-content">
                <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                <p class="title">{{ $cvInformation['professions'][0]['name'] ?? '' }}</p>
                <div class="contact">
                    <p><i class="far fa-envelope"></i> {{ $cvInformation['personalInformation']['email'] }}</p>
                    @if($cvInformation['personalInformation']['phone'])
                        <p><i class="fas fa-phone"></i> {{ $cvInformation['personalInformation']['phone'] }}</p>
                    @endif
                    @if($cvInformation['personalInformation']['address'])
                        <p><i class="fas fa-map-marker-alt"></i> {{ $cvInformation['personalInformation']['address'] }}</p>
                    @endif
                    @if($cvInformation['personalInformation']['linkedin'])
                        <p><i class="fab fa-linkedin"></i> {{ $cvInformation['personalInformation']['linkedin'] }}</p>
                    @endif
                </div>
            </div>
        </header>

        <div class="main-content">
            <!-- Résumé -->
            @if(!empty($cvInformation['summaries']))
                <section class="summary-section">
                    <p class="summary">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
                </section>
            @endif

            <!-- Expérience -->
            @foreach($experiencesByCategory as $category => $experiences)
                <section class="experience-section">
                    <h2><span>{{ $category }}</span></h2>
                    @foreach($experiences as $experience)
                        <div class="experience">
                            <div class="experience-header">
                                <div class="experience-titles">
                                    <h3>{{ $experience['name'] }}</h3>
                                    <p class="company">{{ $experience['InstitutionName'] }}</p>
                                </div>
                                <div class="experience-date">
                                    <span>{{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Present' }}</span>
                                    @if($experience['attachment_path'])
                                        <i class="fas fa-paperclip attachment-icon" title="Pièce jointe disponible"></i>
                                    @endif
                                </div>
                            </div>
                            <p class="experience-description">{{ $experience['description'] }}</p>
                            @if($experience['output'])
                                <p class="experience-output">{{ $experience['output'] }}</p>
                            @endif
                        </div>
                    @endforeach
                </section>
            @endforeach

            <!-- Section combinée Compétences et Centres d'intérêt -->
            <div class="skills-hobbies-grid">
                @if(!empty($cvInformation['competences']))
                    <section class="skills-section">
                        <h2><span>Compétences</span></h2>
                        <div class="skills-list">
                            @foreach($cvInformation['competences'] as $competence)
                                <span class="skill-tag">{{ $competence['name'] }}</span>
                            @endforeach
                        </div>
                    </section>
                @endif

                @if(!empty($cvInformation['hobbies']))
                    <section class="hobbies-section">
                        <h2><span>Centres d'intérêt</span></h2>
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
        /* Base */
        :root {
            --primary-color: #2c3e50;
            --text-color: #2c3e50;
            --text-light: #5d6d7e;
            --border-color: #eaecef;
            --background-light: #f8f9fa;
            --page-margin: 1.8cm;
            --content-width: calc(210mm - (var(--page-margin) * 2));
        }

        .cv-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: var(--page-margin);
            background: white;
            color: var(--text-color);
            font-family: 'Source Sans Pro', Arial, sans-serif;
            font-size: 10.5pt;
            line-height: 1.6;
        }

        /* Header */
        header {
            display: flex;
            align-items: flex-start;
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .profile-photo {
            width: 120px;
            height: 120px;
            border-radius: 2px;
            overflow: hidden;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-content {
            flex: 1;
        }

        /* Typography */
        h1 {
            font-size: 24pt;
            font-weight: 400;
            margin: 0;
            color: var(--primary-color);
            line-height: 1.2;
        }

        .title {
            font-size: 13pt;
            color: var(--text-light);
            margin: 0.3rem 0 1rem;
        }

        h2 {
            font-size: 11pt;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 2rem 0 1rem;
            position: relative;
            color: var(--primary-color);
        }

        h2::after {
            content: '';
            display: block;
            width: 100%;
            height: 1px;
            background: var(--border-color);
            margin-top: 0.3rem;
        }

        h3 {
            font-size: 11pt;
            font-weight: 600;
            margin: 0;
            color: var(--primary-color);
        }

        /* Contact */
        .contact {
            margin-top: 1rem;
        }

        .contact p {
            margin: 0.2rem 0;
            color: var(--text-light);
            font-size: 10pt;
        }

        .contact i {
            width: 16px;
            margin-right: 0.5rem;
            color: var(--primary-color);
        }

        /* Experience */
        .experience {
            margin-bottom: 1.5rem;
            break-inside: avoid;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }

        .company {
            font-size: 10pt;
            color: var(--text-light);
            margin: 0.2rem 0;
        }

        .experience-date {
            font-size: 10pt;
            color: var(--text-light);
            text-align: right;
        }

        .attachment-icon {
            margin-left: 0.5rem;
            color: var(--text-light);
            font-size: 9pt;
        }

        .experience-description {
            margin: 0.5rem 0;
            text-align: justify;
        }

        /* Skills & Hobbies */
        .skills-hobbies-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1.5rem;
            break-inside: avoid;
        }

        .skills-list, .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .skill-tag, .hobby-tag {
            padding: 0.3rem 0.8rem;
            background: var(--background-light);
            border-radius: 2px;
            font-size: 9.5pt;
            color: var(--text-color);
        }

        /* Summary */
        .summary {
            font-size: 10.5pt;
            color: var(--text-light);
            margin: 0;
            text-align: justify;
        }

        /* Print Optimization */
        @media print {
            .cv-container {
                width: 210mm;
                height: 297mm;
                padding: var(--page-margin);
                margin: 0;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            section {
                break-inside: avoid;
            }

            .skills-hobbies-grid {
                break-inside: avoid;
            }
        }
    </style>
@endsection
