@extends('layouts.cv')

@section('content')
    <div class="cv-container">
        <!-- En-tête professionnel avec photo -->
        <header class="cv-header">
            <div class="header-content">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Profile Photo">
                    </div>
                @endif
                <div class="header-text">
                    <div class="name-title">
                        <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
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
                        @if($cvInformation['personalInformation']['github'])
                            <div class="contact-item">
                                <i class="bi bi-github"></i>
                                {{ $cvInformation['personalInformation']['github'] }}
                            </div>
                        @endif
                    </div>
                </div>
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
                                <div class="date">
                                    {{ \Carbon\Carbon::parse($experience['date_start'])->format('M Y') }} -
                                    {{ $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end'])->format('M Y') : 'Present' }}
                                </div>
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
                            @if(!empty($experience['references']))
                                <div class="experience-references">
                                    <h4>References:</h4>
                                    <div class="references-grid">
                                        @foreach($experience['references'] as $reference)
                                            <div class="reference-item">
                                                <div class="reference-header">
                                                    <h5>{{ $reference['name'] }}</h5>
                                                    <div class="reference-title">{{ $reference['function'] }}</div>
                                                </div>
                                                <div class="reference-contact">
                                                    @if($reference['email'])
                                                        <div class="reference-detail">
                                                            <i class="bi bi-envelope"></i>
                                                            {{ $reference['email'] }}
                                                        </div>
                                                    @endif
                                                    @if($reference['telephone'])
                                                        <div class="reference-detail">
                                                            <i class="bi bi-telephone"></i>
                                                            {{ $reference['telephone'] }}
                                                        </div>
                                                    @endif
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            @endif
                            @if($experience['attachment_path'])
                                <div class="attachment-section">
                                    <i class="bi bi-paperclip"></i>
                                    <span>Supporting Documentation Available</span>
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
            width: calc(210mm - 10px);
            min-height: calc(297mm - 10px);
            padding: var(--spacing);
            font-family: 'Calibri', 'Arial', sans-serif;
            color: var(--text-color);
            line-height: 1.4;
            background: white;
        }

        /* Header Styles with Photo */
        .header-content {
            display: flex;
            gap: var(--spacing);
            align-items: start;
            margin-bottom: calc(var(--spacing) * 2);
        }

        .profile-photo {
            flex-shrink: 0;
            width: 120px;
            height: 120px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid var(--accent-color);
            background-color: var(--background-light);
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            flex-grow: 1;
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

        .contact-item i {
            color: var(--accent-color);
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

        /* Experience Content */
        .experience-content {
            font-size: 0.95rem;
        }

        .responsibilities {
            margin-bottom: 1rem;
        }

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

        /* References Styles */
        .experience-references {
            margin-top: var(--spacing);
            padding-top: var(--spacing);
            border-top: 1px dashed var(--border-color);
        }

        .references-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--spacing);
            margin-top: 0.5rem;
        }

        .reference-item {
            background: var(--background-light);
            padding: 1rem;
            border-radius: 5px;
            border-left: 3px solid var(--accent-color);
        }

        .reference-header h5 {
            font-size: 1rem;
            color: var(--secondary-color);
            margin: 0;
        }

        .reference-title {
            color: var(--text-light);
            font-size: 0.9rem;
            margin-top: 0.2rem;
        }

        .reference-contact {
            margin-top: 0.5rem;
        }

        .reference-detail {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            color: var(--text-light);
            margin-top: 0.3rem;
        }

        .reference-detail i {
            color: var(--accent-color);
        }

        /* Attachment Section */
        .attachment-section {
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: var(--background-light);
            border-radius: 3px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-light);
        }

        .attachment-section i {
            color: var(--accent-color);
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
            transition: all 0.2s ease;
        }

        .skill-item:hover {
            background: var(--accent-color);
            color: white;
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
            padding: 0.5rem;
            transition: all 0.2s ease;
        }

        .development-item:hover {
            background: var(--background-light);
            border-radius: 3px;
        }

        .development-item i {
            color: var(--accent-color);
        }

        /* Print Styles */
        @media print {
            .cv-container {
                margin: 0;
                padding: 15mm;
                width: 210mm;
                height: 297mm;
            }

            section {
                break-inside: avoid;
            }

            .experience-item {
                break-inside: avoid;
            }

            .reference-item {
                break-inside: avoid;
            }

            .development-item {
                break-/* Print Styles (continuation) */
            @media print {
                /* Previous print styles remain... */

                .development-item {
                    break-inside: avoid;
                }

                .references-grid {
                    break-inside: avoid;
                }

                .skills-list {
                    break-inside: avoid;
                }

                .competencies-grid {
                    break-inside: avoid;
                }

                /* Ensure proper page breaks */
                .experience-section {
                    break-before: auto;
                }

                .references-section {
                    break-before: auto;
                }

                /* Remove hover effects and transitions for print */
                .skill-item,
                .development-item {
                    transition: none;
                }

                .skill-item:hover,
                .development-item:hover {
                    background: var(--background-light);
                    color: var(--text-color);
                }

                /* Ensure proper colors for print */
                :root {
                    --primary-color: #000;
                    --secondary-color: #333;
                    --accent-color: #666;
                    --text-color: #000;
                    --text-light: #333;
                    --border-color: #ccc;
                    --background-light: #f5f5f5;
                }

                /* Adjust font sizes for better print readability */
                .cv-container {
                    font-size: 11pt;
                    line-height: 1.3;
                }

                h1 { font-size: 18pt; }
                h2 { font-size: 14pt; }
                h3 { font-size: 12pt; }
                h4, h5 { font-size: 11pt; }

                /* Ensure proper image printing */
                .profile-photo {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }

                /* Hide unnecessary elements for print */
                .attachment-section {
                    display: none;
                }

                /* Ensure proper borders and backgrounds for print */
                .reference-item,
                .skill-item,
                .competency-item {
                    border: 1px solid var(--border-color);
                    background-color: transparent !important;
                }
            }

            /* Responsive adjustments for small screens */
            @media screen and (max-width: 768px) {
                .cv-container {
                    width: 100%;
                    padding: 1rem;
                }

                .header-content {
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .profile-photo {
                    margin-bottom: var(--spacing);
                }

                .contact-info {
                    grid-template-columns: 1fr;
                    text-align: center;
                }

                .contact-item {
                    justify-content: center;
                }

                .experience-header {
                    flex-direction: column;
                    text-align: center;
                }

                .date-location {
                    text-align: center;
                    margin-top: 0.5rem;
                }

                .references-grid {
                    grid-template-columns: 1fr;
                }

                .development-items {
                    grid-template-columns: 1fr;
                }
            }
        }
    </style>
@endsection
