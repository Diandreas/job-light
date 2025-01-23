@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête -->
        <header class="cv-header">
            <h1>{{ $cvInformation['personalInformation']['firstName'] }} </h1>
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
                                <div class="company">{{ $experience['InstitutionName'] }}</div>
                            </div>
                            <div class="date">
                                {{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Present' }}
                            </div>
                        </div>
                        <p class="description">{{ $experience['description'] }}</p>
                        @if($experience['output'])
                            <div class="achievement">
                                <p>{{ $experience['output'] }}</p>
                            </div>
                        @endif
                    </div>
                @endforeach
            </section>
        @endforeach

        <!-- Formation -->
        @if(!empty($cvInformation['education']))
            <section class="education-section">
                <h2>Formation</h2>
                @foreach($cvInformation['education'] as $education)
                    <div class="education-item">
                        <div class="education-header">
                            <h3>{{ $education['name'] }}</h3>
                            <span class="date">{{ $education['date_start'] }} - {{ $education['date_end'] }}</span>
                        </div>
                        <div class="institution">{{ $education['InstitutionName'] }}</div>
                    </div>
                @endforeach
            </section>
        @endif

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

        .cv-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            font-family: 'Times New Roman', serif;
            color: var(--text-color);
            background: white;
        }

        .cv-header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 1rem;
        }

        .cv-header h1 {
            color: var(--primary-color);
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .profession {
            font-size: 1.2rem;
            color: var(--secondary-color);
            margin-bottom: 1rem;
        }

        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }

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

        .experience-item, .education-item {
            margin-bottom: 1.2rem;
        }

        .experience-header, .education-header {
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

        .company, .institution {
            font-style: italic;
            color: var(--secondary-color);
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
        }

        .skills-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.8rem;
        }

        .skill-item {
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

        .hobby-item {
            background: var(--light-gray);
            padding: 0.3rem 0.8rem;
            border-radius: 4px;
            font-size: 0.9rem;
        }

        @media print {
            .cv-container {
                padding: 15mm;
                margin: 0;
            }

            section {
                break-inside: avoid;
            }
        }
    </style>
@endsection
