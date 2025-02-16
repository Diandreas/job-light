@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- Header with improved structure -->
        <header class="cv-header">
            <div class="header-flex">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="header-photo">
                        <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil" loading="lazy">
                    </div>
                @endif
                <div class="header-content">
                    <div class="header-main">
                        <h1>{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] ?? '' }}</h1>
                        <h2>{{ $cvInformation['professions'][0]['name'] }}</h2>
                    </div>
                    <div class="header-contact">
                        @if($cvInformation['personalInformation']['email'])
                            <a href="mailto:{{ $cvInformation['personalInformation']['email'] }}" class="contact-item">
                                <i class="bi bi-envelope" aria-hidden="true"></i>
                                <span>{{ $cvInformation['personalInformation']['email'] }}</span>
                            </a>
                        @endif
                        @if($cvInformation['personalInformation']['phone'])
                            <a href="tel:{{ $cvInformation['personalInformation']['phone'] }}" class="contact-item">
                                <i class="bi bi-telephone" aria-hidden="true"></i>
                                <span>{{ $cvInformation['personalInformation']['phone'] }}</span>
                            </a>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <div class="contact-item">
                                <i class="bi bi-geo-alt" aria-hidden="true"></i>
                                <span>{{ $cvInformation['personalInformation']['address'] }}</span>
                            </div>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <a href="{{ $cvInformation['personalInformation']['linkedin'] }}" class="contact-item" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-linkedin" aria-hidden="true"></i>
                                <span>LinkedIn</span>
                            </a>
                        @endif
                        @if($cvInformation['personalInformation']['github'])
                            <a href="{{ $cvInformation['personalInformation']['github'] }}" class="contact-item" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-github" aria-hidden="true"></i>
                                <span>GitHub</span>
                            </a>
                        @endif
                    </div>
                </div>
            </div>
        </header>

        <!-- Professional Summary -->
        @if(!empty($cvInformation['summaries']))
            <section class="summary-section" aria-label="Professional Summary">
                <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </section>
        @endif

        <div class="two-columns">
            <!-- Main Column -->
            <main class="main-column">
                <!-- Experience Sections -->
                @foreach($experiencesByCategory as $category => $experiences)
                    <section class="experience-section" aria-label="{{ $category }}">
                        <h3>{{ $category }}</h3>
                        @foreach($experiences as $experience)
                            <article class="experience-item">
                                <header class="experience-header">
                                    <div class="title-company">
                                        <h4>{{ $experience['name'] }}</h4>
                                        <div class="company">{{ $experience['InstitutionName'] }}</div>
                                    </div>
                                    <time class="date">
                                        {{ \Carbon\Carbon::parse($experience['date_start'])->format('M Y') }} -
                                        {{ $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end'])->format('M Y') : 'Present' }}
                                    </time>
                                </header>

                                <div class="experience-content">
                                    <p class="description">{{ $experience['description'] }}</p>
                                    @if($experience['output'])
                                        <p class="output">• {{ $experience['output'] }}</p>
                                    @endif

                                    <!-- Compact References -->
                                    @if(!empty($experience['references']))
                                        <div class="references-compact">
                                            <h5 class="references-title">Références</h5>
                                            <div class="references-grid">
                                                @foreach($experience['references'] as $reference)
                                                    <div class="reference-item">
                                                        <div class="reference-name">{{ $reference['name'] }}</div>
                                                        <div class="reference-function">{{ $reference['function'] }}</div>
                                                        @if($reference['email'])
                                                            <a href="mailto:{{ $reference['email'] }}" class="reference-contact">
                                                                <i class="bi bi-envelope" aria-hidden="true"></i>
                                                                <span>{{ $reference['email'] }}</span>
                                                            </a>
                                                        @endif
                                                        @if($reference['telephone'])
                                                            <a href="tel:{{ $reference['telephone'] }}" class="reference-contact">
                                                                <i class="bi bi-telephone" aria-hidden="true"></i>
                                                                <span>{{ $reference['telephone'] }}</span>
                                                            </a>
                                                        @endif
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                    @endif

                                    @if($experience['attachment_path'])
                                        <div class="attachment-indicator">
                                            <i class="bi bi-paperclip" aria-hidden="true"></i>
                                            <span>Documentation disponible</span>
                                        </div>
                                    @endif
                                </div>
                            </article>
                        @endforeach
                    </section>
                @endforeach
            </main>

            <!-- Side Column -->
            <aside class="side-column">
                <!-- Skills -->
                @if(!empty($cvInformation['competences']))
                    <section class="skills-section" aria-label="Skills">
                        <h3>Compétences</h3>
                        <div class="skills-list" role="list">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="skill-tag" role="listitem">{{ $competence['name'] }}</div>
                            @endforeach
                        </div>
                    </section>
                @endif

                <!-- Hobbies -->
                @if(!empty($cvInformation['hobbies']))
                    <section class="hobbies-section" aria-label="Hobbies">
                        <h3>Centres d'intérêt</h3>
                        <div class="hobbies-list" role="list">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <div class="hobby-tag" role="listitem">{{ $hobby['name'] }}</div>
                            @endforeach
                        </div>
                    </section>
                @endif
            </aside>
        </div>
    </div>

    <style>
        :root {
            --text-primary: #2d3748;
            --text-secondary: #4a5568;
            --border-color: #e2e8f0;
            --bg-accent: #f7fafc;
            --bg-hover: #edf2f7;
            --font-size-base: 0.875rem;
            --line-height-base: 1.5;
            --spacing-unit: 0.75rem;
            --accent-color: #3182ce;
            --transition-speed: 0.2s;
            --box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .cv-container {
            width: min(calc(210mm - 60px), 100%);
            min-height: calc(297mm - 60px);
            padding: clamp(1rem, 2vw, 2rem);
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: var(--font-size-base);
            line-height: var(--line-height-base);
            color: var(--text-primary);
            background: white;
            margin: 0 auto;
        }

        /* Improved Header */
        .cv-header {
            margin-bottom: calc(var(--spacing-unit) * 2);
        }

        .header-flex {
            display: flex;
            gap: calc(var(--spacing-unit) * 1.5);
            padding-bottom: var(--spacing-unit);
            border-bottom: 1px solid var(--border-color);
        }

        .header-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid var(--accent-color);
            transition: transform var(--transition-speed);
        }

        .header-photo:hover {
            transform: scale(1.05);
        }

        .header-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: filter var(--transition-speed);
        }

        .header-content {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: var(--spacing-unit);
        }

        .header-main h1 {
            font-size: clamp(1.5rem, 3vw, 2rem);
            font-weight: 700;
            margin: 0;
            color: var(--text-primary);
            line-height: 1.2;
        }

        .header-main h2 {
            font-size: clamp(1rem, 2vw, 1.25rem);
            font-weight: 500;
            color: var(--text-secondary);
            margin: calc(var(--spacing-unit) * 0.5) 0 0;
        }

        .header-contact {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: calc(var(--spacing-unit) * 0.75);
            font-size: 0.9rem;
        }

        .contact-item {
            display: inline-flex;
            align-items: center;
            gap: calc(var(--spacing-unit) * 0.5);
            color: inherit;
            text-decoration: none;
            transition: color var(--transition-speed);
        }

        .contact-item:hover {
            color: var(--accent-color);
        }

        .contact-item i {
            font-size: 1rem;
            color: var(--accent-color);
        }

        /* Improved Layout */
        .two-columns {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
            gap: calc(var(--spacing-unit) * 2);
            margin-top: calc(var(--spacing-unit) * 2);
        }

        /* Enhanced Sections */
        section {
            margin-bottom: calc(var(--spacing-unit) * 2);
        }

        .summary-section {
            font-size: 0.95rem;
            color: var(--text-secondary);
            line-height: 1.6;
            max-width: 70ch;
        }

        h3 {
            font-size: 1.1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 calc(var(--spacing-unit) * 1);
            padding-bottom: calc(var(--spacing-unit) * 0.5);
            border-bottom: 2px solid var(--accent-color);
            color: var(--accent-color);
        }

        /* Experience Items */
        .experience-item {
            margin-bottom: calc(var(--spacing-unit) * 1.5);
            padding-bottom: calc(var(--spacing-unit) * 1.5);
            border-bottom: 1px solid var(--border-color);
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: var(--spacing-unit);
            margin-bottom: calc(var(--spacing-unit) * 0.75);
        }

        .title-company {
            flex: 1;
        }

        .title-company h4 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0;
            color: var(--text-primary);
        }

        .company {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-top: calc(var(--spacing-unit) * 0.25);
        }

        .date {
            font-size: 0.85rem;
            color: var(--text-secondary);
            white-space: nowrap;
        }

        .description {
            font-size: 0.9rem;
            margin: calc(var(--spacing-unit) * 0.5) 0;
            line-height: 1.6;
        }

        .output {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin: calc(var(--spacing-unit) * 0.75) 0;
            padding-left: calc(var(--spacing-unit) * 0.75);
            position: relative;
        }

        .output::before {
            content: "•";
            position: absolute;
            left: 0;
            color: var(--accent-color);
        }

        /* Enhanced References */
        .references-compact {
            margin-top: calc(var(--spacing-unit) * 1);
            font-size: 0.9rem;
            background: var(--bg-accent);
            padding: calc(var(--spacing-unit) * 1);
            border-radius: 6px;
            box-shadow: var(--box-shadow);
        }

        .references-title {
            font-size: 0.95rem;
            font-weight: 600;
            margin: 0 0 calc(var(--spacing-unit) * 0.75);
            color: var(--accent-color);
        }

        .references-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: calc(var(--spacing-unit) * 1);
        }

        .reference-item {
            font-size: 0.85rem;
            background: white;
            padding: calc(var(--spacing-unit) * 0.75);
            border-radius: 4px;
            box-shadow: var(--box-shadow);
            transition: transform var(--transition-speed);
        }

        .reference-item:hover {
            transform: translateY(-2px);
        }

        .reference-name {
            font-weight: 600;
            color: var(--text-primary);
        }

        .reference-function {
            color: var(--text-secondary);
            margin: calc(var(--spacing-unit) * 0.25) 0 calc(var(--spacing-unit) * 0.5);
        }

        .reference-contact {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing-unit) * 0.25);
            color: var(--text-secondary);
            text-decoration: none;
            transition: color var(--transition-speed);
            margin-top: calc(var(--spacing-unit) * 0.25);
        }

        .reference-contact:hover {
            color: var(--accent-color);
        }

        .reference-contact i {
            font-size: 0.8rem;
            color: var(--accent-color);
        }

        /* Attachment Indicator */
        .attachment-indicator {
            display: inline-flex;
            align-items: center;
            gap: calc(var(--spacing-unit) * 0.5);
            font-size: 0.85rem;
            color: var(--accent-color);
            margin-top: calc(var(--spacing-unit) * 0.75);
            padding: calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 0.75);
            background: var(--bg-accent);
            border-radius: 4px;
            transition: background-color var(--transition-speed);
        }

        .attachment-indicator:hover {
            background: var(--bg-hover);
        }

        /* Skills and Hobbies */
        .skills-list, .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: calc(var(--spacing-unit) * 0.75);
        }

        .skill-tag, .hobby-tag {
            font-size: 0.85rem;
            padding: calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit) * 0.75);
            background: var(--bg-accent);
            border-radius: 4px;
            transition: all var(--transition-speed);
            box-shadow: var(--box-shadow);
        }

        .skill-tag {
            border-left: 3px solid var(--accent-color);
        }

        .skill-tag:hover, .hobby-tag:hover {
            transform: translateY(-2px);
            background: var(--bg-hover);
        }

        /* Print Styles */
        @media print {
            :root {
                --accent-color: #000;
                --box-shadow: none;
            }

            .cv-container {
                padding: 0;
                margin: 0;
                width: 210mm;
                min-height: 297mm;
            }

            section {
                break-inside: avoid;
            }

            .experience-item {
                break-inside: avoid;
            }

            .references-compact {
                break-inside: avoid;
                box-shadow: none;
                border: 1px solid var(--border-color);
            }

            .skill-tag, .hobby-tag {
                box-shadow: none;
                border: 1px solid var(--border-color);
            }

            .reference-item {
                box-shadow: none;
                border: 1px solid var(--border-color);
            }

            .attachment-indicator {
                border: 1px solid var(--border-color);
            }

            /* Remove hover effects for print */
            .header-photo:hover,
            .contact-item:hover,
            .reference-item:hover,
            .reference-contact:hover,
            .skill-tag:hover,
            .hobby-tag:hover {
                transform: none;
            }
        }

        /* Responsive Design */
        @media screen and (max-width: 768px) {
            .two-columns {
                grid-template-columns: 1fr;
                gap: calc(var(--spacing-unit) * 1.5);
            }

            .header-flex {
                flex-direction: column;
                align-items: center;
                text-align: center;
                gap: var(--spacing-unit);
            }

            .header-content {
                width: 100%;
                align-items: center;
            }

            .header-contact {
                grid-template-columns: 1fr;
                justify-items: center;
            }

            .experience-header {
                flex-direction: column;
                align-items: flex-start;
                gap: calc(var(--spacing-unit) * 0.5);
            }

            .date {
                margin-top: calc(var(--spacing-unit) * -0.25);
            }

            .references-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            :root {
                --text-primary: #e2e8f0;
                --text-secondary: #a0aec0;
                --border-color: #4a5568;
                --bg-accent: #2d3748;
                --bg-hover: #4a5568;
            }

            .cv-container {
                background: #1a202c;
            }

            .header-photo img {
                filter: brightness(0.9);
            }

            .reference-item {
                background: #2d3748;
            }
        }

        /* Accessibility Improvements */
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        /* Focus styles */
        a:focus-visible,
        button:focus-visible {
            outline: 2px solid var(--accent-color);
            outline-offset: 2px;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
    </style>
@endsection
