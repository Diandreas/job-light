@extends('layouts.cv')

@section('content')
    <!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page {
            margin: 10mm;
            size: A4;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 9pt;
            color: #333;
            background-color: white;
        }

        .cv-container {
            width: 190mm;
            margin: 0 auto;
            padding: 10mm;
            position: relative;
            background: white;
        }

        /* Header */
        .header-content {
            position: relative;
            min-height: 25mm;
            margin-bottom: 3mm;
            border-bottom: 0.3mm solid #2c3e50;
            padding-bottom: 2mm;
        }

        .profile-photo {
            position: absolute;
            top: 0;
            left: 0;
            width: 25mm;
            height: 25mm;
            border-radius: 50%;
            overflow: hidden;
        }

        .profile-photo img {
            width: 100%;
            height: 100%;
        }

        .header-text {
            margin-left: 30mm;
            padding-top: 1mm;
        }

        h1 {
            font-size: 14pt;
            color: #2c3e50;
            margin-bottom: 1mm;
            line-height: 1.2;
        }

        h2.profession {
            font-size: 11pt;
            color: #34495e;
            margin-bottom: 2mm;
            border: none;
            font-weight: normal;
        }

        .contact-info {
            width: 100%;
            margin-top: 2mm;
        }

        .contact-item {
            display: inline-block;
            font-size: 8pt;
            color: #34495e;
            margin-right: 3mm;
        }

        /* Sections */
        section {
            margin-bottom: 3mm;
            clear: both;
        }

        h2 {
            font-size: 11pt;
            color: #2c3e50;
            border-bottom: 0.2mm solid #bdc3c7;
            padding-bottom: 1mm;
            margin-bottom: 2mm;
        }

        /* Experiences */
        .experience-item {
            margin-bottom: 2mm;
            padding-bottom: 2mm;
            border-bottom: 0.2mm dotted #bdc3c7;
        }

        .experience-header {
            width: 100%;
            margin-bottom: 1mm;
        }

        .experience-header table {
            width: 100%;
            border-collapse: collapse;
        }

        .experience-header td {
            vertical-align: top;
        }

        .title-company {
            width: 75%;
        }

        .title-company h3 {
            font-size: 9pt;
            color: #34495e;
            margin-bottom: 0.5mm;
        }

        .company {
            font-size: 8pt;
            font-style: italic;
            color: #34495e;
        }

        .date {
            text-align: right;
            font-size: 8pt;
            color: #666;
            width: 25%;
        }

        .description {
            font-size: 8pt;
            line-height: 1.2;
            text-align: justify;
            margin: 1mm 0;
        }

        /* Skills and Hobbies */
        .skills-list, .hobbies-list {
            margin-top: 2mm;
        }

        .skill-item, .hobby-item {
            display: inline-block;
            background: #f5f5f5;
            padding: 1mm 2mm;
            margin: 0 1mm 1mm 0;
            border-radius: 1mm;
            font-size: 8pt;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
                width: 210mm;
                height: 297mm;
            }

            .cv-container {
                margin: 0 auto;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
<div class="cv-container">
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
                <span class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</span>
                <span class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</span>
                <span class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</span>
                @if($cvInformation['personalInformation']['linkedin'])
                    <span class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</span>
                @endif
            </div>
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
        <section class="professional-summary">
            <h2>Résumé Professionnel</h2>
            <p class="description">{{ $cvInformation['summaries'][0]['description'] ?? '' }}</p>
        </section>
    @endif

    @foreach($experiencesByCategory as $category => $experiences)
        <section class="experience-section">
            <h2>{{ $category }}</h2>
            @foreach($experiences as $experience)
                <div class="experience-item">
                    <div class="experience-header">
                        <table>
                            <tr>
                                <td class="title-company">
                                    <h3>{{ $experience['name'] }}</h3>
                                    <div class="company">{{ $experience['InstitutionName'] }}</div>
                                </td>
                                <td class="date">
                                    {{ \Carbon\Carbon::parse($experience['date_start'])->format('M Y') }} -
                                    {{ $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end'])->format('M Y') : 'Present' }}
                                </td>
                            </tr>
                        </table>
                    </div>
                    <p class="description">{{ $experience['description'] }}</p>
                    @if($experience['output'])
                        <p class="description">{{ $experience['output'] }}</p>
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
                    <span class="skill-item">{{ $competence['name'] }}</span>
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
</body>
</html>
@endsection
