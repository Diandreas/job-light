@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête avec photo -->
        <header>
            <div class="header-content">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil">
                    </div>
                @endif
                <div class="header-text">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                    <p class="title">{{ $cvInformation['professions'][0]['name'] ?? '' }}</p>
                    <div class="contact">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                        </div>
                        @if($cvInformation['personalInformation']['phone'])
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                            </div>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                            </div>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <div class="contact-item">
                                <i class="fab fa-linkedin"></i>
                                <span>{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                            </div>
                        @endif
                        @if($cvInformation['personalInformation']['github'])
                            <div class="contact-item">
                                <i class="fab fa-github"></i>
                                <span>{{ $cvInformation['personalInformation']['github'] }}</span>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </header>

        <!-- Résumé -->
        @if(!empty($cvInformation['summaries']))
            <section>
                <p class="summary">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </section>
        @endif

        <!-- Expérience -->
        @foreach($experiencesByCategory as $category => $experiences)
            <section>
                <h2>{{ $category }}</h2>
                @foreach($experiences as $experience)
                    <div class="experience">
                        <div class="experience-header">
                            <div>
                                <h3>{{ $experience['name'] }}</h3>
                                <p class="company">{{ $experience['InstitutionName'] }}</p>
                            </div>
                            <span class="date">{{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Present' }}</span>
                        </div>
                        <p class="experience-description">{{ $experience['description'] }}</p>
                        @if($experience['output'])
                            <p class="achievement">{{ $experience['output'] }}</p>
                        @endif
                        @if($experience['attachment_path'])
                            <div class="experience-media">
                                <img src="{{ $experience['attachment_path'] }}" alt="Image expérience" class="experience-image">
                            </div>
                        @endif
                    </div>
                @endforeach
            </section>
        @endforeach

        <!-- Compétences et Centres d'intérêt en colonnes -->
        <div class="footer-sections">
            @if(!empty($cvInformation['competences']))
                <section class="footer-section">
                    <h2>Compétences</h2>
                    <div class="skills">
                        @foreach($cvInformation['competences'] as $competence)
                            <span class="skill">{{ $competence['name'] }}</span>
                        @endforeach
                    </div>
                </section>
            @endif

            @if(!empty($cvInformation['hobbies']))
                <section class="footer-section">
                    <h2>Centres d'intérêt</h2>
                    <div class="hobbies">
                        @foreach($cvInformation['hobbies'] as $hobby)
                            <span class="hobby">{{ $hobby['name'] }}</span>
                        @endforeach
                    </div>
                </section>
            @endif
        </div>
    </div>

    <style>
        :root {
            --primary-color: #2d3748;
            --text-color: #1a202c;
            --text-light: #4a5568;
            --border-color: #e2e8f0;
            --bg-light: #f7fafc;
            --spacing: 2rem;
            --radius: 8px;
        }

        .cv-container {
            width: 210mm;
            min-height: 297mm;
            padding: 3rem;
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: white;
        }

        /* Header Styles */
        .header-content {
            display: flex;
            gap: 2rem;
            margin-bottom: var(--spacing);
        }

        .profile-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid var(--border-color);
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            flex: 1;
        }

        .contact {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.5rem;
            margin-top: 1rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-light);
            font-size: 0.9rem;
        }

        /* Typography */
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
            color: var(--primary-color);
        }

        .title {
            font-size: 1.25rem;
            color: var(--text-light);
            margin: 0.5rem 0;
        }

        h2 {
            font-size: 1.1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin: var(--spacing) 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--border-color);
            color: var(--primary-color);
        }

        /* Experience Section */
        .experience {
            margin-bottom: 2rem;
            padding: 1rem;
            border-radius: var(--radius);
            background-color: var(--bg-light);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .experience-description {
            margin: 0.5rem 0;
            color: var(--text-color);
        }

        .experience-media {
            margin-top: 1rem;
            border-radius: var(--radius);
            overflow: hidden;
        }

        .experience-image {
            max-width: 100%;
            height: auto;
            display: block;
        }

        /* Footer Sections */
        .footer-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: var(--spacing);
        }

        .skills, .hobbies {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .skill, .hobby {
            background-color: var(--bg-light);
            border: 1px solid var(--border-color);
            padding: 0.4rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }

        .skill:hover, .hobby:hover {
            background-color: var(--primary-color);
            color: white;
        }

        /* Print Styles */
        @media print {
            .cv-container {
                width: 100%;
                padding: 0;
                margin: 0;
            }

            .experience {
                break-inside: avoid;
                background-color: white !important;
                border: 1px solid var(--border-color);
            }

            .skill, .hobby {
                background-color: white !important;
                border: 1px solid var(--border-color) !important;
                color: var(--text-color) !important;
            }

            .profile-photo {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            section {
                break-inside: avoid;
            }
        }
    </style>

    @section('scripts')
        <script src="https://kit.fontawesome.com/your-fontawesome-kit.js" crossorigin="anonymous"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    @endsection
@endsection
