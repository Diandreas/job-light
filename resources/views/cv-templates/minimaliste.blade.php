@extends('layouts.cv')

@section('content')
    <!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page {
            margin: 0;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 8.5pt;
            color: #333333;
            margin: 0;
            padding: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            vertical-align: top;
            padding: 0;
        }

        .cv-container {
            width: 190mm;
            padding: 10mm;
        }

        .header-table {
            margin-bottom: 5mm;
            border-bottom: 0.2mm solid #000000;
            padding-bottom: 5mm;
        }

        .header-left {
            width: 70%;
        }

        .header-right {
            text-align: right;
        }

        .name {
            font-size: 16pt;
            margin-bottom: 1mm;
            font-weight: normal;
        }

        .profession {
            font-size: 10pt;
            color: #666666;
            margin-bottom: 2mm;
        }

        .contact-item {
            font-size: 8pt;
            margin-bottom: 0.5mm;
            color: #666666;
        }

        .section {
            margin-bottom: 4mm;
        }

        .section-title {
            font-size: 10pt;
            margin-bottom: 2mm;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 0.5mm;
        }

        .summary {
            margin-bottom: 4mm;
            padding-bottom: 4mm;
            border-bottom: 0.1mm solid #cccccc;
        }

        .experience-table {
            margin-bottom: 3mm;
        }

        .experience-left {
            width: 25%;
            padding-right: 3mm;
        }

        .experience-right {
            width: 75%;
        }

        .date {
            font-size: 8pt;
            color: #666666;
        }

        .company {
            font-size: 8pt;
            margin-top: 0.5mm;
            color: #666666;
        }

        .title {
            font-weight: bold;
            margin-bottom: 0.5mm;
            font-size: 8.5pt;
        }

        .description {
            color: #333333;
            text-align: justify;
            padding-bottom: 1mm;
            font-size: 8pt;
            line-height: 1.3;
        }

        .skills-table, .hobbies-table {
            margin-top: 1mm;
        }

        .skill-cell, .hobby-cell {
            padding-right: 3mm;
            padding-bottom: 1mm;
            font-size: 8pt;
            line-height: 1.2;
        }

        .bottom-section {
            margin-top: 2mm;
            padding-top: 2mm;
            border-top: 0.1mm solid #cccccc;
        }
    </style>
</head>
<body>
<div class="cv-container">
    {{-- Header Section --}}
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </td>
            <td class="header-right">
                @if($cvInformation['personalInformation']['email'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['linkedin'])
                    <div class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                @endif
            </td>
        </tr>
    </table>

    {{-- Summary Section --}}
    @if(!empty($cvInformation['summaries']))
        <div class="summary">
            {{ $cvInformation['summaries'][0]['description'] ?? '' }}
        </div>
    @endif

    {{-- Experience Sections --}}
    @foreach($experiencesByCategory as $category => $experiences)
        <div class="section">
            <div class="section-title">
                @if($currentLocale === 'fr')
                    {{ $category }}
                @else
                    {{ $categoryTranslations[$category]['name_en'] ?? $category }}
                @endif
            </div>

            @foreach($experiences as $experience)
                <table class="experience-table">
                    <tr>
                        <td class="experience-left">
                            <div class="date">
                                {{ \Carbon\Carbon::parse($experience['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} -
                                @if($experience['date_end'])
                                    {{ \Carbon\Carbon::parse($experience['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') }}
                                @else
                                    {{ $currentLocale === 'fr' ? 'Présent' : 'Present' }}
                                @endif
                            </div>
                            <div class="company">{{ $experience['InstitutionName'] }}</div>
                        </td>
                        <td class="experience-right">
                            <div class="title">{{ $experience['name'] }}</div>
                            <div class="description">
                                {{ $experience['description'] }}
                                @if($experience['output'])
                                    <br>{{ $experience['output'] }}
                                @endif
                            </div>
                        </td>
                    </tr>
                </table>
            @endforeach
        </div>
    @endforeach

    {{-- Skills and Hobbies in Two Columns --}}
    <div class="bottom-section">
        <table>
            <tr>
                @if(!empty($cvInformation['competences']))
                    <td style="width: 50%; padding-right: 3mm;">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                        <table class="skills-table">
                            @foreach(array_chunk($cvInformation['competences'], 2) as $row)
                                <tr>
                                    @foreach($row as $competence)
                                        <td class="skill-cell">
                                            {{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}
                                        </td>
                                    @endforeach
                                </tr>
                            @endforeach
                        </table>
                    </td>
                @endif

                @if(!empty($cvInformation['hobbies']))
                    <td style="width: 50%;">
                        <div class="section-title">{{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}</div>
                        <table class="hobbies-table">
                            @foreach(array_chunk($cvInformation['hobbies'], 2) as $row)
                                <tr>
                                    @foreach($row as $hobby)
                                        <td class="hobby-cell">
                                            {{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}
                                        </td>
                                    @endforeach
                                </tr>
                            @endforeach
                        </table>
                    </td>
                @endif
            </tr>
        </table>
    </div>
</div>
</body>
</html>
@endsection
