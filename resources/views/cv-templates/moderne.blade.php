@extends('layouts.cv')

@section('content')
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" media="all">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" media="all">

    <div class="cv-container">
        <header class="header-section">
            <div class="header-content">
                <div class="profile-section">
                    @if($cvInformation['personalInformation']['photo'])
                        <div class="profile-photo">
                            <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil">
                        </div>
                    @endif
                    <div class="name-section">
                        <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                        @if(!empty($cvInformation['professions']))
                            <div class="title-tag">{{ $cvInformation['professions'][0]['name'] ?? '' }}</div>
                        @endif
                    </div>
                </div>
                <div class="contact-section">
                    <div class="contact-pill">
                        <i class="bi bi-envelope"></i>{{ $cvInformation['personalInformation']['email'] }}
                    </div>
                    @if($cvInformation['personalInformation']['phone'])
                        <div class="contact-pill">
                            <i class="bi bi-telephone"></i>{{ $cvInformation['personalInformation']['phone'] }}
                        </div>
                    @endif
                    @if($cvInformation['personalInformation']['address'])
                        <div class="contact-pill">
                            <i class="bi bi-geo-alt"></i>{{ $cvInformation['personalInformation']['address'] }}
                        </div>
                    @endif
                    @if($cvInformation['personalInformation']['linkedin'])
                        <div class="contact-pill">
                            <i class="bi bi-linkedin"></i>{{ $cvInformation['personalInformation']['linkedin'] }}
                        </div>
                    @endif
                </div>
            </div>
        </header>

        @if(!empty($cvInformation['summaries']))
            <section class="summary-section">
                <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </section>
        @endif

        @foreach($experiencesByCategory as $category => $experiences)
            <section class="experience-section">
                <h2>{{ $category }}</h2>
                @foreach($experiences as $experience)
                    <div class="experience">
                        <div class="experience-header">
                            <div class="experience-title">
                                <h3>{{ $experience['name'] }}</h3>
                                <p class="company">{{ $experience['InstitutionName'] }}</p>
                            </div>
                            <div class="date-tag">
                                {{ $experience['date_start'] }} - {{ $experience['date_end'] ?? 'Présent' }}
                                @if($experience['attachment_path'])
                                    <i class="bi bi-paperclip" style="margin-left:3pt;"></i>
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

        <div class="skills-interests">
            @if(!empty($cvInformation['competences']))
                <section class="skills-section">
                    <h2>Compétences</h2>
                    <div class="tags-container">
                        @foreach($cvInformation['competences'] as $competence)
                            <span class="tag">{{ $competence['name'] }}</span>
                        @endforeach
                    </div>
                </section>
            @endif

            @if(!empty($cvInformation['hobbies']))
                <section class="hobbies-section">
                    <h2>Centres d'intérêt</h2>
                    <div class="tags-container">
                        @foreach($cvInformation['hobbies'] as $hobby)
                            <span class="tag">{{ $hobby['name'] }}</span>
                        @endforeach
                    </div>
                </section>
            @endif
        </div>
    </div>

    <style>
        :root {
            --primary-color: #2196F3;
            --primary-dark: #1976D2;
            --text-color: #2c3e50;
            --text-light: #718096;
            --border-color: #e2e8f0;
            --tag-bg: #f7fafc;
        }

        .cv-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 9pt;
            line-height: 1.3;
            color: var(--text-color);
        }

        .header-section {
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: white;
            padding: 8mm;
        }

        .profile-section {
            display: flex;
            align-items: center;
            gap: 8mm;
            margin-bottom: 4mm;
        }

        .profile-photo {
            width: 25mm;
            height: 25mm;
            border-radius: 50%;
            border: 0.5mm solid rgba(255,255,255,0.2);
            overflow: hidden;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        h1 {
            font-size: 16pt;
            font-weight: 600;
            margin: 0;
        }

        .title-tag {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 1mm 3mm;
            border-radius: 3mm;
            font-size: 9pt;
            margin-top: 1mm;
        }

        .contact-section {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }

        .contact-pill {
            display: flex;
            align-items: center;
            gap: 1mm;
            background: rgba(255,255,255,0.1);
            padding: 1mm 3mm;
            border-radius: 3mm;
            font-size: 8pt;
        }

        section {
            padding: 3mm 8mm;
        }

        .summary-section {
            font-size: 9pt;
            color: var(--text-light);
            padding-bottom: 2mm;
        }

        h2 {
            font-size: 11pt;
            font-weight: 600;
            color: var(--primary-color);
            margin: 2mm 0;
            padding-bottom: 1mm;
            border-bottom: 0.5mm solid var(--primary-color);
        }

        .experience {
            margin-bottom: 3mm;
        }

        .experience:last-child {
            margin-bottom: 0;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1mm;
        }

        .experience-title h3 {
            font-size: 10pt;
            font-weight: 600;
            margin: 0;
        }

        .company {
            color: var(--text-light);
            font-size: 8pt;
            margin: 0.5mm 0;
        }

        .date-tag {
            font-size: 8pt;
            color: var(--text-light);
        }

        .experience-description {
            margin: 1mm 0;
            font-size: 9pt;
        }

        .experience-output {
            font-style: italic;
            color: var(--text-light);
            font-size: 8pt;
            margin-top: 1mm;
        }

        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }

        .tag {
            background: var(--tag-bg);
            padding: 1mm 3mm;
            border-radius: 2mm;
            font-size: 8pt;
        }

        @media print {
            @page {
                size: A4;
                margin: 0;
            }

            html, body {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }

            .cv-container {
                width: 210mm;
                min-height: 297mm;
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .header-section {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            section {
                page-break-inside: avoid;
            }

            h2 {
                page-break-after: avoid;
            }

            .experience {
                page-break-inside: avoid;
            }
        }
    </style>
@endsection
