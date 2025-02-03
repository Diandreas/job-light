@extends('layouts.cv')

@section('title', 'CV - {{ $cvInformation["personalInformation"]["firstName"] }}')

@section('content')
    <div class="cv-container">
        <header class="cv-header">
            <div class="header-content">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil" class="profile-image">
                    </div>
                @endif
                <div class="header-text">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                    <h2>{{ $cvInformation['professions'][0]['name'] }}</h2>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> {{ $cvInformation['personalInformation']['email'] }}</p>
                        @if($cvInformation['personalInformation']['phone'])
                            <p><i class="fas fa-phone"></i> {{ $cvInformation['personalInformation']['phone'] }}</p>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <p><i class="fas fa-map-marker-alt"></i> {{ $cvInformation['personalInformation']['address'] }}</p>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <p><i class="fab fa-linkedin"></i> {{ $cvInformation['personalInformation']['linkedin'] }}</p>
                        @endif
                        @if($cvInformation['personalInformation']['github'])
                            <p><i class="fab fa-github"></i> {{ $cvInformation['personalInformation']['github'] }}</p>
                        @endif
                    </div>
                </div>
            </div>
        </header>

        <main class="cv-main">
            <div class="content-primary">
                @if(!empty($cvInformation['summaries']))
                    <section class="summary">
                        <h2><i class="fas fa-user-circle"></i> Résumé</h2>
                        @foreach($cvInformation['summaries'] as $summary)
                            <p>{{ $summary['description'] }}</p>
                        @endforeach
                    </section>
                @endif

                <section class="experiences">
                    @foreach($experiencesByCategory as $category => $experiences)
                        <div class="experience-category">
                            <h2><i class="fas fa-briefcase"></i> {{ $category }}</h2>
                            @foreach($experiences as $experience)
                                <div class="experience-item">
                                    <h3>{{ $experience['name'] }}</h3>
                                    <div class="experience-header">
                                        <p class="institution"><i class="fas fa-building"></i> {{ $experience['InstitutionName'] }}</p>
                                        <p class="dates"><i class="fas fa-calendar-alt"></i>
                                            {{ \Carbon\Carbon::parse($experience['date_start'])->format('M Y') }} -
                                            {{ $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end'])->format('M Y') : 'Present' }}
                                        </p>
                                    </div>
                                    <div class="experience-content">
                                        <p class="description">{{ $experience['description'] }}</p>
                                        @if($experience['output'])
                                            <p class="achievements"><i class="fas fa-star"></i> {{ $experience['output'] }}</p>
                                        @endif

                                        @if(!empty($experience['references']))
                                            <div class="references">
                                                <h4><i class="fas fa-user-check"></i> Références</h4>
                                                <div class="references-grid">
                                                    @foreach($experience['references'] as $reference)
                                                        <div class="reference-item">
                                                            <h5>{{ $reference['name'] }}</h5>
                                                            <p class="reference-role">{{ $reference['function'] }}</p>
                                                            @if($reference['email'])
                                                                <p class="reference-contact">
                                                                    <i class="fas fa-envelope"></i> {{ $reference['email'] }}
                                                                </p>
                                                            @endif
                                                            @if($reference['telephone'])
                                                                <p class="reference-contact">
                                                                    <i class="fas fa-phone"></i> {{ $reference['telephone'] }}
                                                                </p>
                                                            @endif
                                                        </div>
                                                    @endforeach
                                                </div>
                                            </div>
                                        @endif

                                        @if($experience['attachment_path'])
                                            <div class="attachment-indicator">
                                                <i class="fas fa-paperclip"></i> Document justificatif disponible
                                            </div>
                                        @endif
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endforeach
                </section>
            </div>

            <aside class="sidebar">
                @if(!empty($cvInformation['competences']))
                    <section class="competences">
                        <h2><i class="fas fa-code"></i> Compétences</h2>
                        <div class="skills-grid">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="skill-item">
                                    <span class="skill-name">{{ $competence['name'] }}</span>
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif

                @if(!empty($cvInformation['hobbies']))
                    <section class="hobbies">
                        <h2><i class="fas fa-heart"></i> Centres d'intérêt</h2>
                        <div class="hobbies-grid">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <div class="hobby-item">
                                    <span class="hobby-name">{{ $hobby['name'] }}</span>
                                </div>
                            @endforeach
                        </div>
                    </section>
                @endif
            </aside>
        </main>
    </div>
@endsection

@section('styles')
    <style>
        :root {
            --primary-color: #2d3748;
            --secondary-color: #4a5568;
            --accent-color: #3182ce;
            --background-light: #f7fafc;
            --border-color: #e2e8f0;
            --shadow-color: rgba(0, 0, 0, 0.1);
        }

        .cv-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            font-family: 'Arial', sans-serif;
            color: var(--primary-color);
            background: white;
        }

        /* Header Styles */
        .cv-header {
            margin-bottom: 2rem;
        }

        .header-content {
            display: flex;
            align-items: center;
            gap: 2rem;
        }

        .profile-photo {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid var(--accent-color);
            flex-shrink: 0;
        }

        .profile-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            flex-grow: 1;
        }

        .header-text h1 {
            font-size: 2.5rem;
            margin: 0 0 0.5rem 0;
            color: var(--primary-color);
        }

        .header-text h2 {
            font-size: 1.5rem;
            color: var(--secondary-color);
            margin: 0 0 1rem 0;
            font-weight: normal;
        }

        .contact-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.5rem;
        }

        .contact-info p {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0;
            font-size: 0.9rem;
        }

        .contact-info i {
            color: var(--accent-color);
            width: 20px;
        }

        /* Main Layout */
        .cv-main {
            display: grid;
            grid-template-columns: 7fr 3fr;
            gap: 2rem;
        }

        /* Sections */
        section {
            margin-bottom: 2rem;
        }

        h2 {
            font-size: 1.5rem;
            color: var(--primary-color);
            margin: 0 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--accent-color);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        h2 i {
            color: var(--accent-color);
        }

        /* Experience Items */
        .experience-item {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: var(--background-light);
            border-radius: 8px;
            box-shadow: 0 2px 4px var(--shadow-color);
        }

        .experience-item h3 {
            font-size: 1.2rem;
            margin: 0 0 0.5rem 0;
            color: var(--accent-color);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: var(--secondary-color);
        }

        .experience-content {
            font-size: 0.95rem;
        }

        .achievements {
            margin-top: 0.5rem;
            padding-left: 1rem;
            border-left: 2px solid var(--accent-color);
        }

        /* References */
        .references {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed var(--border-color);
        }

        .references h4 {
            font-size: 1rem;
            margin: 0 0 0.5rem 0;
            color: var(--secondary-color);
        }

        .references-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .reference-item {
            padding: 0.75rem;
            background: white;
            border-radius: 4px;
            font-size: 0.85rem;
        }

        .reference-item h5 {
            margin: 0 0 0.25rem 0;
            color: var(--primary-color);
        }

        .reference-role {
            color: var(--secondary-color);
            margin: 0 0 0.5rem 0;
        }

        .reference-contact {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.25rem 0;
            color: var(--secondary-color);
        }

        /* Attachment Indicator */
        .attachment-indicator {
            margin-top: 0.75rem;
            font-size: 0.85rem;
            color: var(--accent-color);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        /* Sidebar */
        .sidebar section {
            background: var(--background-light);
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px var(--shadow-color);
        }

        .skills-grid, .hobbies-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .skill-item, .hobby-item {
            background: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            box-shadow: 0 1px 2px var(--shadow-color);
        }

        .skill-item {
            border-left: 3px solid var(--accent-color);
        }

        /* Print Styles */
        @media print {
            .cv-container {
                padding: 0;
                max-width: none;
            }

            .experience-item, .sidebar section {
                box-shadow: none;
                border: 1px solid var(--border-color);
            }

            .profile-photo {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            section {
                break-inside: avoid;
            }
        }

        /* Responsive Design */
        @media screen and (max-width: 768px) {
            .cv-main {
                grid-template-columns: 1fr;
            }

            .header-content {
                flex-direction: column;
                text-align: center;
            }

            .contact-info {
                grid-template-columns: 1fr;
            }

            .contact-info p {
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
        }
    </style>
@endsection

@section('scripts')
    <script src="https://kit.fontawesome.com/your-font-awesome-kit.js" crossorigin="anonymous"></script>
@endsection
