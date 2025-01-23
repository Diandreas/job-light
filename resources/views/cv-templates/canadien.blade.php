@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête professionnel sans photo -->
        <header class="cv-header">
            <div class="name-title">
                <h1>{{ $cvInformation['personalInformation']['firstName'] }} </h1>
                <h2>{{ $cvInformation['professions'][0]['name']}}</h2>
            </div>
            <div class="contact-info">
                <div class="contact-item">
                    <i class="bi bi-envelope"></i>
                    {{ $cvInformation['personalInformation']['email'] }}
                </div>
                <div class="contact-item">
                    <i class="bi bi-telephone"></i>
                    {{ $cvInformation['personalInformation']['phone'] }}
                </div>
                <div class="contact-item">
                    <i class="bi bi-geo-alt"></i>
                    {{ $cvInformation['personalInformation']['address'] }}
                </div>
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">
                        <i class="bi bi-linkedin"></i>
                        {{ $cvInformation['personalInformation']['linkedin'] }}
                    </div>
                @endif
            </div>
        </header>

        <!-- Professional Summary -->
        @if(!empty($cvInformation['summaries']))
            <section class="summary-section">
                <h2>Professional Summary</h2>
                <div class="content">
                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                </div>
            </section>
        @endif

        <!-- Core Competencies -->
        @if(!empty($cvInformation['competences']))
            <section class="competencies-section">
                <h2>Core Competencies</h2>
                <div class="competencies-grid">
                    @foreach($cvInformation['competences'] as $competence)
                        <div class="competency-item">
                            <i class="bi bi-check2-circle"></i>
                            {{ $competence['name'] }}
                        </div>
                    @endforeach
                </div>
            </section>
        @endif

        <!-- Professional Experience -->
        @foreach($experiencesByCategory as $category => $experiences)
            <section class="experience-section">
                <h2>{{ $category }}</h2>
                @foreach($experiences as $experience)
                    <div class="experience-item">
                        <div class="experience-header">
                            <div class="position-company">
                                <h3>{{ $experience['name'] }}</h3>
                                <div class="company">{{ $experience['InstitutionName'] }}</div>
                            </div>
                            <div class="date-location">
                                <div class="date">{{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Present' }}</div>
                                @if(isset($experience['location']))
                                    <div class="location">{{ $experience['location'] }}</div>
                                @endif
                            </div>
                        </div>
                        <div class="experience-content">
                            <div class="responsibilities">
                                <p>{{ $experience['description'] }}</p>
                            </div>
                            @if($experience['output'])
                                <div class="accomplishments">
                                    <h4>Key Accomplishments:</h4>
                                    <ul>
                                        <li>{{ $experience['output'] }}</li>
                                    </ul>
                                </div>
                            @endif
                        </div>
                    </div>
                @endforeach
            </section>
        @endforeach

        <!-- Technical Skills -->
        @if(!empty($cvInformation['competences']))
            <section class="skills-section">
                <h2>Technical Skills</h2>
                <div class="skills-categories">
                    <div class="skills-list">
                        @foreach($cvInformation['competences'] as $competence)
                            <span class="skill-item">{{ $competence['name'] }}</span>
                        @endforeach
                    </div>
                </div>
            </section>
        @endif

        <!-- Professional Development -->
        @if(!empty($cvInformation['hobbies']))
            <section class="development-section">
                <h2>Professional Development</h2>
                <div class="development-items">
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <div class="development-item">
                            <i class="bi bi-arrow-right"></i>
                            {{ $hobby['name'] }}
                        </div>
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
            --text-color: #333;
            --text-light: #666;
            --border-color: #ddd;
            --background-light: #f8f9fa;
            --spacing: 1.5rem;
        }

        .cv-container {
            width: calc(210mm - 10px); /* A4 width minus margins */
            min-height: calc(297mm - 10px); /* A4 height minus margins */
            padding: var(--spacing);
            font-family: 'Calibri', 'Arial', sans-serif;
            color: var(--text-color);
            line-height: 1;
            background: white;
        }

        /* Header Styles */
        .cv-header {
            margin-bottom: calc(var(--spacing) * 2);
        }

        .name-title h1 {
            font-size: 2rem;
            color: var(--primary-color);
            margin: 0;
            font-weight: bold;
        }

        .name-title h2 {
            font-size: 1.2rem;
            color: var(--text-light);
            margin: 0.5rem 0 1rem;
            font-weight: normal;
        }

        .contact-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0.5rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }

        /* Section Styles */
        section {
            margin-bottom: calc(var(--spacing) * 2);
        }

        h2 {
            color: var(--primary-color);
            font-size: 1.3rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 0.5rem;
            margin-bottom: var(--spacing);
        }

        /* Core Competencies */
        .competencies-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 0.5rem;
        }

        .competency-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem;
        }

        .competency-item i {
            color: var(--accent-color);
        }

        /* Experience Section */
        .experience-item {
            margin-bottom: var(--spacing);
            padding-bottom: var(--spacing);
            border-bottom: 1px solid var(--border-color);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .position-company h3 {
            font-size: 1.1rem;
            color: var(--secondary-color);
            margin: 0;
        }

        .company {
            color: var(--text-light);
            font-size: 0.9rem;
            margin-top: 0.2rem;
        }

        .date-location {
            text-align: right;
            color: var(--text-light);
            font-size: 0.9rem;
        }

        /* Key Accomplishments */
        .accomplishments {
            margin-top: 1rem;
        }

        .accomplishments h4 {
            font-size: 1rem;
            color: var(--secondary-color);
            margin-bottom: 0.5rem;
        }

        .accomplishments ul {
            margin: 0;
            padding-left: 1.5rem;
        }

        .accomplishments li {
            margin-bottom: 0.3rem;
        }

        /* Technical Skills */
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .skill-item {
            background: var(--background-light);
            padding: 0.3rem 0.8rem;
            border-radius: 3px;
            font-size: 0.9rem;
        }

        /* Professional Development */
        .development-items {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 0.5rem;
        }

        .development-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
        }

        .development-item i {
            color: var(--accent-color);
        }

        /* Print Styles */
        @media print {
            .cv-container {
                margin: 0;
                padding: 15mm;
            }

            section {
                break-inside: avoid;
            }

            .experience-item {
                break-inside: avoid;
            }
        }
    </style>
@endsection
