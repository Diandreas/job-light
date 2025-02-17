@extends('layouts.cv')

@section('content')
    <style>
        .cv-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 12mm;
            background: white;
            box-sizing: border-box;
        }

        /* En-tête plus compact */
        .cv-header {
            margin-bottom: 8mm;
            border-bottom: 0.5mm solid #2c3e50;
            padding-bottom: 3mm;
        }

        .header-content {
            display: flex;
            align-items: flex-start;
            gap: 4mm;
        }

        .profile-photo {
            flex: 0 0 25mm;
            width: 25mm;
            height: 25mm;
            border-radius: 50%;
            overflow: hidden;
            border: 0.3mm solid #bdc3c7;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            flex: 1;
            min-width: 0;
        }

        /* Typographie plus compacte */
        h1 {
            color: #2c3e50;
            font-size: 16pt;
            margin: 0 0 1mm 0;
            line-height: 1.1;
        }

        .profession {
            font-size: 11pt;
            color: #34495e;
            margin: 1mm 0;
            line-height: 1.1;
        }

        .contact-info {
            margin-top: 2mm;
            display: flex;
            flex-wrap: wrap;
            gap: 1mm 3mm;
        }

        .contact-item {
            font-size: 8pt;
            color: #34495e;
            white-space: nowrap;
        }

        /* Sections avec moins d'espacement */
        section {
            margin-bottom: 4mm;
            page-break-inside: avoid;
        }

        h2 {
            color: #2c3e50;
            font-size: 11pt;
            margin: 3mm 0 2mm 0;
            padding-bottom: 0.5mm;
            border-bottom: 0.2mm solid #bdc3c7;
            line-height: 1.1;
        }

        /* Résumé professionnel plus compact */
        .professional-summary p {
            font-size: 9pt;
            line-height: 1.3;
            margin: 0;
            padding: 0;
            text-align: justify;
        }

        /* Expériences plus compactes */
        .experience-item {
            margin-bottom: 3mm;
            padding-bottom: 2mm;
            border-bottom: 0.2mm dotted #bdc3c7;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1mm;
        }

        .title-company h3 {
            font-size: 10pt;
            color: #34495e;
            margin: 0 0 0.5mm 0;
            line-height: 1.1;
        }

        .company {
            font-size: 9pt;
            font-style: italic;
            color: #34495e;
        }

        .date {
            font-size: 8pt;
            color: #666;
            text-align: right;
        }

        .description {
            font-size: 9pt;
            line-height: 1.3;
            margin: 1mm 0;
            text-align: justify;
        }

        /* Compétences et centres d'intérêt plus compacts */
        .skills-list, .hobbies-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5mm;
            margin-top: 1.5mm;
        }

        .skill-item, .hobby-item {
            background: #ecf0f1;
            padding: 1mm 2mm;
            border-radius: 1mm;
            font-size: 8pt;
            line-height: 1.2;
        }

        /* Références plus compactes */
        .references-block {
            margin-top: 2mm;
            padding-top: 2mm;
            border-top: 0.2mm dashed #bdc3c7;
        }

        .references-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2mm;
        }

        .reference-item {
            background: #ecf0f1;
            padding: 2mm;
            border-radius: 1mm;
        }

        .reference-name {
            font-size: 9pt;
            font-weight: bold;
        }

        .reference-title {
            font-size: 8pt;
            font-style: italic;
            margin-top: 0.5mm;
        }

        .reference-contact {
            font-size: 8pt;
            margin-top: 1mm;
        }

        @media print {
            .cv-container {
                margin: 0;
                padding: 12mm;
                width: 210mm;
                height: 297mm;
            }

            body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
        /* Ajustements globaux pour réduire l'espacement vertical */
        .cv-container {
            width: 210mm;
            padding: 10mm;
            margin: 0 auto;
            box-sizing: border-box;
        }

        /* En-tête plus compact */
        .cv-header {
            margin-bottom: 5mm;
            padding-bottom: 2mm;
        }

        /* Résumé professionnel plus compact */
        .professional-summary {
            margin-bottom: 3mm;
        }

        .professional-summary p {
            font-size: 9pt;
            line-height: 1.2;
            margin-bottom: 2mm;
        }

        /* Sections avec moins d'espacement */
        section {
            margin-bottom: 3mm;
        }

        h2 {
            margin: 2mm 0 1mm 0;
            padding-bottom: 0.5mm;
            font-size: 11pt;
        }

        /* Expériences plus compactes */
        .experience-item {
            margin-bottom: 2mm;
            padding-bottom: 1mm;
        }

        .experience-header {
            margin-bottom: 0.5mm;
        }

        /* Institution et dates plus compactes */
        .company {
            font-size: 8pt;
            margin-bottom: 0.5mm;
        }

        .date {
            font-size: 8pt;
        }

        /* Description des expériences */
        .description {
            font-size: 9pt;
            line-height: 1.2;
            margin: 0.5mm 0;
        }

        /* Compétences et centres d'intérêt */
        .skills-list, .hobbies-list {
            margin-top: 1mm;
            gap: 1mm;
        }

        .skill-item, .hobby-item {
            padding: 0.5mm 1.5mm;
            font-size: 8pt;
        }

        /* Forcer une seule page */
        @media print {
            .cv-container {
                min-height: 0;
                max-height: 297mm;
                overflow: hidden;
            }
        }
    </style>

    <div class="cv-container">
        <header class="cv-header">
            <div class="header-content">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="Photo de profil">
                    </div>
                @endif
                <div class="header-text">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                    <h2 class="profession">{{ $cvInformation['professions'][0]['name']}}</h2>
                    <div class="contact-info">
                        <div class="contact-item">
                            {{ $cvInformation['personalInformation']['email'] }}
                        </div>
                        <div class="contact-item">
                            {{ $cvInformation['personalInformation']['phone'] }}
                        </div>
                        <div class="contact-item">
                            {{ $cvInformation['personalInformation']['address'] }}
                        </div>
                        @if($cvInformation['personalInformation']['linkedin'])
                            <div class="contact-item">
                                {{ $cvInformation['personalInformation']['linkedin'] }}
                            </div>
                        @endif
                        @if($cvInformation['personalInformation']['github'])
                            <div class="contact-item">
                                {{ $cvInformation['personalInformation']['github'] }}
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </header>

        @if(!empty($cvInformation['summaries']))
            <section class="professional-summary">
                <h2>Résumé Professionnel</h2>
                <p>{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
            </section>
        @endif

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
                                <p>{{ $experience['output'] }}</p>
                            </div>
                        @endif
                    </div>
                @endforeach
            </section>
        @endforeach

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
@endsection
