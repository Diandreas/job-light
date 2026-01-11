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

        /* Optimized page margins */
        @page {
            margin: 10mm;
            padding: 0;
            size: A4;
        }

        body {
            font-family: 'Times New Roman', 'DejaVu Serif', serif;
            line-height: 1.15;
            font-size: 10pt;
            color: var(--text-dark);
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }

        /* Improved container width for better space utilization */
        .cv-container {
            width: 100%;
            max-width: 190mm;
            margin: 0 auto;
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

        /* Improved Header Section */
        .header-table {
            width: 100%;
            margin-bottom: 3mm;
        }

        .header-left {
            width: 50%;
        }

        .header-right {
            width: 32%;
            text-align: right;
        }

        .photo-td {
            width: 18%;
            text-align: right;
        }

        .name {
            font-size: 15pt;
            font-weight: bold;
            letter-spacing: 0.2mm;
            margin-bottom: 1mm;
            text-transform: uppercase;
            color: var(--presidential-blue);
        }

        .profession {
            font-size: 12pt;
            margin-bottom: 1.5mm;
            color: var(--presidential-light);
        }

        .contact-info {
            font-size: 9pt;
            line-height: 1.2;
        }

        /* Enhanced Section Styling */
        .section {
            margin-bottom: 5mm;
        }

        .section-title {
            font-size: 12pt;
            font-weight: bold;
            margin-bottom: 2mm;
            text-transform: uppercase;
            text-align: left;
            color: var(--presidential-blue);
            border-bottom: 0.4mm solid var(--presidential-light);
            padding-bottom: 0.5mm;
        }

        /* Experience Item Formatting */
        .experience-table {
            margin-bottom: 3mm;
            width: 100%;
        }

        .date-td {
            width: 16%;
            vertical-align: top;
            padding-right: 1.5mm;
        }

        .content-td {
            width: 84%;
        }

        .date-box {
            font-size: 9pt;
            font-weight: bold;
            color: var(--presidential-light);
        }

        .duration {
            font-size: 8pt;
            font-style: italic;
            color: var(--text-light);
            margin-top: 0.5mm;
        }

        .position-title {
            font-size: 10.5pt;
            font-weight: bold;
            margin-bottom: 0.5mm;
        }

        .company-info {
            font-size: 9.5pt;
            font-style: italic;
            margin-bottom: 1mm;
        }

        /* Enhanced Description Table */
        .description-table {
            width: 100%;
        }

        .description-bullet {
            width: 2mm;
            vertical-align: top;
            color: var(--presidential-light);
            font-weight: bold;
        }

        .description-content {
            padding-bottom: 0.7mm;
            text-align: justify;
            font-size: 9.5pt;
        }

        /* Summary */
        .summary {
            font-size: 9.5pt;
            line-height: 1.2;
            margin-bottom: 3mm;
            text-align: justify;
            font-style: italic;
            color: var(--text-light);
        }

        /* Photo */
        .photo-container {
            border: 0.4mm solid var(--presidential-light);
            padding: 0.5mm;
            margin: 0 auto;
            max-width: 27mm;
            box-shadow: 0 0.5mm 1mm rgba(0,0,0,0.1);
        }

        .photo-container img {
            width: 100%;
            height: auto;
            display: block;
        }

        /* Skills Section */
        .skills-table {
            width: 100%;
            margin-top: 1mm;
        }

        .skill-category {
            vertical-align: top;
            padding-right: 2mm;
        }

        .skill-item {
            display: block;
            margin-bottom: 1mm;
            font-size: 9.5pt;
            line-height: 1.15;
        }

        .skill-item:before {
            content: "•";
            color: var(--presidential-light);
            margin-right: 0.5mm;
            font-weight: bold;
        }

        /* Additional Info */
        .additional-info {
            font-size: 8pt;
            color: var(--text-light);
            margin-top: 1.5mm;
            text-align: center;
            font-style: italic;
        }

        .hobby-item {
            display: inline-block;
            margin-right: 1.5mm;
            margin-bottom: 0.5mm;
        }

        /* Page break utility */
        .page-break {
            page-break-before: always;
        }

        /* Print-specific adjustments */
        @media print {
            body {
                font-size: 10pt;
            }
            
            .cv-container {
                width: 100%;
            }
        }
    </style>
    <x-cv-editable-css />
</head>
<body>
<div class="cv-container">
    <!-- Header Section -->
    <table class="header-table">
        <tr>
            <td class="header-left">
                <div class="name" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="firstName" @endif>{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="profession" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="personalInformation" data-id="{{ $cvInformation['personalInformation']['id'] }}" data-field="profession" @endif>
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>
            </td>
            <td class="header-right">
                <div class="contact-info">
                    @if(!empty($cvInformation['personalInformation']['email']))
                        {{ $cvInformation['personalInformation']['email'] }}<br>
                    @endif
                    @if(!empty($cvInformation['personalInformation']['phone']))
                        {{ $cvInformation['personalInformation']['phone'] }}<br>
                    @endif
                    @if(!empty($cvInformation['personalInformation']['address']))
                        {{ $cvInformation['personalInformation']['address'] }}<br>
                    @endif
                    @if(!empty($cvInformation['personalInformation']['linkedin']))
                        {{ $cvInformation['personalInformation']['linkedin'] }}
                    @endif
                </div>
            </td>
            @if(!empty($cvInformation['personalInformation']['photo']))
                <td class="photo-td">
                    <div class="photo-container">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="Profile Photo">
                    </div>
                </td>
            @endif
        </tr>
    </table>

    <!-- Summary Section -->
    @if(!empty($cvInformation['summaries']))
        <div class="section">
            <div class="section-title">{{ $currentLocale === 'fr' ? 'Profil' : 'Profile' }}</div>
            <div class="summary" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="summary" data-id="{{ $cvInformation['summaries'][0]['id'] ?? 0 }}" data-field="description" @endif>
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
                                    {{ $startDate }} - {{ $endDate }}
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
                            <div class="position-title" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="name" @endif>{{ $experience['name'] }}</div>
                            <div class="company-info" @if(isset($editable) && $editable) contenteditable="true" data-editable data-model="experience" data-id="{{ $experience['id'] }}" data-field="InstitutionName" @endif>{{ $experience['InstitutionName'] }}</div>
                            <table class="description-table">
                                @php
                                    $descriptionLines = explode("\n", $experience['description']);
                                @endphp
                                @foreach($descriptionLines as $line)
                                    @if(trim($line))
                                        <tr>
                                            <td class="description-bullet">•</td>
                                            <td class="description-content">{{ trim($line) }}</td>
                                        </tr>
                                    @endif
                                @endforeach
                                @if(!empty($experience['output']))
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
                                <div class="skill-item">{{ $currentLocale === 'fr' ? $skill['name'] : $skill['name_en'] }}</div>
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
            <div>
                @foreach($cvInformation['hobbies'] as $hobby)
                    <span class="hobby-item skill-item">{{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}</span>
                @endforeach
            </div>
        </div>
    @endif

    <!-- Footer with date -->
    <div class="additional-info">
        {{ $currentLocale === 'fr' ? 'Mise à jour le ' : 'Updated on ' }} {{ \Carbon\Carbon::now()->locale($currentLocale)->isoFormat('LL') }}
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection