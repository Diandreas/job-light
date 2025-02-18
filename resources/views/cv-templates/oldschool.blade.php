@extends('layouts.cv')

@section('content')
    <!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        :root {
            --presidential-blue: #002D72;
            --presidential-light: #004FBF;
            --presidential-pale: #E6EEF8;
            --text-dark: #1A1A1A;
            --text-light: #4A4A4A;
        }

        @page {
            margin: 0;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.2;
            font-size: 9pt;
            color: var(--text-dark);
            margin: 0;
            padding: 0;
        }

        .cv-container {
            width: 190mm;
            padding: 12mm;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        td {
            vertical-align: top;
            padding: 0;
        }

        /* Header Styling */
        .header-table {
            margin-bottom: 4mm;
            border-bottom: 0.4mm solid var(--presidential-blue);
            padding-bottom: 2mm;
        }

        .header-left {
            width: 58%;
            padding-right: 3mm;
        }

        .header-right {
            width: 25%;
            padding-right: 2mm;
        }

        .photo-td {
            width: 25mm;
        }

        .name {
            font-size: 16pt;
            font-weight: 700;
            color: var(--presidential-blue);
            margin-bottom: 1mm;
            letter-spacing: -0.2pt;
        }

        .profession {
            font-size: 10pt;
            color: var(--presidential-light);
            margin-bottom: 1.5mm;
            font-weight: 600;
        }

        .contact-info {
            font-size: 8pt;
            color: var(--text-light);
            line-height: 1.3;
        }

        .photo-container {
            width: 25mm;
            height: 30mm;
            overflow: hidden;
            border: 0.25mm solid var(--presidential-light);
            border-radius: 1.5mm;
            box-shadow: 0 1mm 2mm rgba(0,45,114,0.1);
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Section Styling */
        .section {
            margin-bottom: 3mm;
        }

        .section-title {
            font-size: 10pt;
            font-weight: bold;
            color: var(--presidential-blue);
            text-transform: uppercase;
            margin-bottom: 1.5mm;
            border-bottom: 0.2mm solid var(--presidential-light);
            padding-bottom: 0.5mm;
        }

        /* Summary Section */
        .summary {
            font-size: 8.5pt;
            color: var(--text-dark);
            line-height: 1.3;
            text-align: justify;
            margin-bottom: 3mm;
            padding: 2mm;
            background-color: var(--presidential-pale);
            border-left: 0.6mm solid var(--presidential-blue);
        }

        /* Experience Section */
        .experience-table {
            width: 100%;
            margin-bottom: 2mm;
            page-break-inside: avoid;
        }

        .date-td {
            width: 20mm;
            padding-right: 2mm;
        }

        .date-box {
            font-size: 8pt;
            color: var(--presidential-blue);
            line-height: 1.2;
            font-weight: 600;
            background-color: var(--presidential-pale);
            padding: 0.8mm 1mm;
            border-radius: 0.8mm;
        }

        .duration {
            font-size: 7.5pt;
            color: var(--text-light);
            margin-top: 0.5mm;
        }

        .content-td {
            padding-right: 1.5mm;
        }

        .position-title {
            font-weight: bold;
            color: var(--presidential-blue);
            font-size: 9pt;
            margin-bottom: 0.5mm;
        }

        .company-info {
            color: var(--presidential-light);
            font-weight: 600;
            font-size: 8.5pt;
            margin-bottom: 1mm;
        }

        .description-table {
            width: 100%;
            padding-left: 1mm;
        }

        .description-bullet {
            width: 1.5mm;
            padding-right: 0.8mm;
            color: var(--presidential-light);
            font-size: 7.5pt;
        }

        .description-content {
            font-size: 8pt;
            color: var(--text-light);
            line-height: 1.2;
            padding-bottom: 0.8mm;
        }

        /* Skills Section */
        .skills-table {
            width: 100%;
            margin-top: 1mm;
        }

        .skill-category {
            width: 50%;
            padding-right: 2mm;
            vertical-align: top;
        }

        .skill-item {
            display: inline-block;
            background-color: var(--presidential-pale);
            padding: 0.8mm 1.5mm;
            margin: 0 1mm 1mm 0;
            border-radius: 0.8mm;
            font-size: 8pt;
            color: var(--presidential-blue);
            border: 0.15mm solid var(--presidential-light);
        }

        .skill-item:before {
            content: "•";
            color: var(--presidential-light);
            margin-right: 0.5mm;
        }

        /* Additional Info */
        .additional-info {
            font-size: 8pt;
            color: var(--text-light);
            margin-top: 2mm;
            text-align: center;
            font-style: italic;
        }
    </style>
</head>
<body>
<div class="cv-container">
    <!-- Header Section -->
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </td>
            <td class="header-right">
                <div class="contact-info">
                    @if($cvInformation['personalInformation']['email'])
                        {{ $cvInformation['personalInformation']['email'] }}<br>
                    @endif
                    @if($cvInformation['personalInformation']['phone'])
                        {{ $cvInformation['personalInformation']['phone'] }}<br>
                    @endif
                    @if($cvInformation['personalInformation']['address'])
                        {{ $cvInformation['personalInformation']['address'] }}<br>
                    @endif
                    @if($cvInformation['personalInformation']['linkedin'])
                        {{ $cvInformation['personalInformation']['linkedin'] }}
                    @endif
                </div>
            </td>
            @if($cvInformation['personalInformation']['photo'])
                <td class="photo-td">
                    <div class="photo-container">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="Profile">
                    </div>
                </td>
            @endif
        </tr>
    </table>

    <!-- Summary Section -->
    @if(!empty($cvInformation['summaries']))
        <div class="section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Sommaire Professionnel' : 'Professional Summary' }}</div>
            <div class="summary">
                {{ $cvInformation['summaries'][0]['description'] ?? '' }}
            </div>
        </div>
    @endif

    <!-- Experience Sections -->
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
                        <td class="date-td">
                            <div class="date-box">
                                @php
                                    $start = \Carbon\Carbon::parse($experience['date_start']);
                                    $end = $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end']) : \Carbon\Carbon::now();
                                    $startDate = $start->locale($currentLocale)->isoFormat('MMM YY');
                                    $endDate = $experience['date_end'] ? $end->locale($currentLocale)->isoFormat('MMM YY') : ($currentLocale === 'fr' ? 'Présent' : 'Present');
                                @endphp
                                @if($startDate === $endDate)
                                    {{ $startDate }}
                                @else
                                    {{ $startDate }}-{{ $endDate }}
                                @endif

                                @if($startDate !== $endDate)
                                    <div class="duration">
                                        @php
                                            $diff = $start->diff($end);
                                            $duration = '';
                                            if ($diff->y > 0) {
                                                $duration .= $diff->y . ($currentLocale === 'fr' ? ' an' . ($diff->y > 1 ? 's' : '') : ' yr' . ($diff->y > 1 ? 's' : ''));
                                            }
                                            if ($diff->m > 0) {
                                                if ($duration) $duration .= ', ';
                                                $duration .= $diff->m . ' mo';
                                            }
                                        @endphp
                                        ({{ $duration }})
                                    </div>
                                @endif
                            </div>
                        </td>
                        <td class="content-td">
                            <div class="position-title">{{ $experience['name'] }}</div>
                            <div class="company-info">{{ $experience['InstitutionName'] }}</div>
                            <table class="description-table">
                                @php
                                    $descriptionLines = explode("\n", $experience['description']);
                                @endphp
                                @foreach($descriptionLines as $line)
                                    @if(trim($line))
                                        <tr>
                                            <td class="description-bullet">•</td>
                                            <td class="description-content">{{ $line }}</td>
                                        </tr>
                                    @endif
                                @endforeach
                                @if($experience['output'])
                                    <tr>
                                        <td class="description-bullet">•</td>
                                        <td class="description-content">{{ $experience['output'] }}</td>
                                    </tr>
                                @endif
                            </table>
                        </td>
                    </tr>
                </table>
            @endforeach
        </div>
    @endforeach

    <!-- Skills Section -->
    @if(!empty($cvInformation['competences']))
        <div class="section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
            <table class="skills-table">
                <tr>
                    @php
                        $skills = $cvInformation['competences'];
                        $skillsPerColumn = ceil(count($skills) / 2);
                        $columns = array_chunk($skills, $skillsPerColumn);
                    @endphp

                    @foreach($columns as $column)
                        <td class="skill-category">
                            @foreach($column as $skill)
                                <span class="skill-item">{{ $currentLocale === 'fr' ? $skill['name'] : $skill['name_en'] }}</span>
                            @endforeach
                        </td>
                    @endforeach
                </tr>
            </table>
        </div>
    @endif

    <!-- Additional Info -->
    @if(!empty($cvInformation['hobbies']))
        <div class="section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Informations Complémentaires' : 'Additional Information' }}</div>
            @foreach($cvInformation['hobbies'] as $hobby)
                <span class="skill-item">{{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}</span>
            @endforeach
        </div>
    @endif
</div>
</body>
</html>
@endsection
