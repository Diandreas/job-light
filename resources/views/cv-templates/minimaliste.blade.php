@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête minimaliste -->
        <header>
            <h1>{{ $cvInformation['personalInformation']['firstName'] }} </h1>
            <p class="title">{{ $cvInformation['professions'][0]['name']}}</p>

            <div class="contact">
                <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                <span class="separator">•phone:</span>
                <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                <span class="separator">•address:</span>
                <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                @if($cvInformation['personalInformation']['linkedin'])
                    <span class="separator">•linkedin:</span>
                    <span>{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                @endif
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
                        <p>{{ $experience['description'] }}</p>
                        @if($experience['output'])
                            <p class="achievement">{{ $experience['output'] }}</p>
                        @endif
                    </div>
                @endforeach
            </section>
        @endforeach

        <!-- Compétences -->
        @if(!empty($cvInformation['competences']))
            <section>
                <h2>Compétences</h2>
                <p class="skills">
                    @foreach($cvInformation['competences'] as $competence)
                        <span class="skill">{{ $competence['name'] }}</span>
                    @endforeach
                </p>
            </section>
        @endif

        <!-- Centres d'intérêt -->
        @if(!empty($cvInformation['hobbies']))
            <section>
                <h2>Centres d'intérêt</h2>
                <p class="hobbies">
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <span class="hobby">{{ $hobby['name'] }}</span>
                    @endforeach
                </p>
            </section>
        @endif
    </div>

    <style>
        :root {
            --text-color: #000;
            --text-light: #666;
            --border-color: #ddd;
            --spacing: 2rem;
        }

        .cv-container {
            width: calc(210mm - 10px); /* A4 width minus margins */
            min-height: calc(297mm - 10px); /* A4 height minus margins */
            padding: 3rem;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
        }

        /* Typography */
        h1 {
            font-size: 2rem;
            font-weight: 300;
            letter-spacing: -0.5px;
            margin: 0;
        }

        h2 {
            font-size: 1rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin: var(--spacing) 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        h3 {
            font-size: 1.1rem;
            font-weight: 500;
            margin: 0;
        }

        /* Header */
        header {
            margin-bottom: var(--spacing);
        }

        .title {
            color: var(--text-light);
            margin: 0.5rem 0 1rem;
        }

        .contact {
            font-size: 0.9rem;
        }

        .separator {
            margin: 0 0.5rem;
            color: var(--text-light);
        }

        /* Sections */
        section {
            margin-bottom: var(--spacing);
        }

        .summary {
            font-size: 1.1rem;
            color: var(--text-light);
        }

        /* Experience */
        .experience {
            margin-bottom: 1.5rem;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }

        .company {
            color: var(--text-light);
            margin: 0.2rem 0;
        }

        .date {
            color: var(--text-light);
            font-size: 0.9rem;
        }

        .achievement {
            margin-top: 0.5rem;
            font-style: italic;
        }

        /* Skills and Hobbies */
        .skills, .hobbies {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 0;
        }

        .skill, .hobby {
            border: 1px solid var(--border-color);
            padding: 0.3rem 0.8rem;
            font-size: 0.9rem;
        }

        /* Print Styles */
        @media print {
            .cv-container {
                padding: 0;
                margin: 0;
            }

            section {
                break-inside: avoid;
            }

            h2 {
                break-after: avoid;
            }
        }
    </style>
@endsection
