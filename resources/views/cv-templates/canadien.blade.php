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
            font-size: 9pt;
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
            padding: 12mm;
        }

        .main-table {
            width: 100%;
        }

        .content-col {
            width: 75%;
            padding-right: 6mm;
        }

        .sidebar-col {
            width: 25%;
        }

        /* Header */
        .header-name {
            font-size: 18pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 1mm;
        }

        .header-title {
            font-size: 11pt;
            color: #666666;
            margin-bottom: 4mm;
        }

        /* Sections */
        .section-table {
            width: 100%;
            margin-bottom: 3mm;
        }

        /* Language Section */
        .language-section {
            margin-top: 3mm;
            padding: 3mm;
            background-color: rgba(236, 240, 241, 0.4);
            border-radius: 1mm;
            border-left: 1.5mm solid #3498db;
        }

        .language-title {
            color: #2980b9;
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 2mm;
            text-transform: uppercase;
            letter-spacing: 0.2mm;
        }

        .language-items {
            display: flex;
            flex-wrap: wrap;
            gap: 2mm;
        }

        .language-item {
            background-color: rgba(255, 255, 255, 0.7);
            border-radius: 0.5mm;
            padding: 1mm 2mm;
            font-size: 8pt;
            color: #34495e;
            box-shadow: 0 0.2mm 0.5mm rgba(0,0,0,0.05);
        }

        .language-level {
            color: #7f8c8d;
            font-weight: 600;
            margin-left: 1mm;
        }

        .section-icon-cell {
            width: 6mm;
            padding-right: 2mm;
            padding-top: 1mm;
        }

        .section-icon {
            width: 6mm;
            height: 6mm;
            background: #333333;
            border-radius: 50%;
            color: white;
            font-size: 9pt;
            text-align: center;
            line-height: 6mm;
        }

        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #333333;
            margin-bottom: 2mm;
        }

        .section-content {
            text-align: justify;
            padding-right: 2mm;
        }

        /* Timeline */
        .timeline-table {
            width: 100%;
        }

        .timeline-dot-cell {
            width: 1.5mm;
            padding-right: 2mm;
            position: relative;
        }

        .timeline-dot {
            width: 1.5mm;
            height: 1.5mm;
            background: #333333;
            border-radius: 50%;
            margin-top: 2.5mm;
        }

        .timeline-line {
            position: absolute;
            left: 0.65mm;
            top: 4mm;
            bottom: -3mm;
            width: 0.2mm;
            background: #999999;
        }

        .timeline-content {
            padding-bottom: 3mm;
        }

        .timeline-date {
            color: #666666;
            font-size: 8.5pt;
            margin-bottom: 0.5mm;
        }

        .timeline-title {
            font-weight: bold;
            font-size: 9.5pt;
            margin-bottom: 0.5mm;
        }

        .timeline-company {
            color: #666666;
            font-style: italic;
            font-size: 9pt;
            margin-bottom: 1mm;
        }

        .timeline-description {
            text-align: justify;
            padding-left: 2mm;
        }

        .timeline-description ul {
            margin: 0;
            padding-left: 3mm;
        }

        .timeline-description li {
            margin-bottom: 0.5mm;
            text-align: justify;
            font-size: 8.5pt;
        }

        /* Photo */
        .photo-container {
            width: 35mm;
            height: 35mm;
            margin-bottom: 4mm;
            overflow: hidden;
            border-radius: 1mm;
        }

        .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* Sidebar */
        .sidebar-section {
            margin-bottom: 4mm;
        }

        .sidebar-title-table {
            width: 100%;
            margin-bottom: 1.5mm;
        }

        .sidebar-icon-cell {
            width: 5mm;
            padding-right: 1.5mm;
            border: none;
        }

        .sidebar-icon {
            width: 5mm;
            height: 5mm;
            background: #333333;
            border-radius: 50%;
            color: white;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .sidebar-icon svg {
            width: 3mm;
            height: 3mm;
            fill: currentColor;
        }

        .sidebar-title {
            font-size: 10pt;
            font-weight: bold;
            color: #333333;
        }

        .sidebar-content {
            padding-left: 6.5mm;
        }

        .contact-item {
            margin-bottom: 1mm;
            font-size: 8.5pt;
        }

        .skill-item {
            margin-bottom: 1mm;
            font-size: 8.5pt;
            text-align: justify;
        }

        .skill-item:before {
            content: "•";
            margin-right: 1mm;
        }

        /* Fix for PDF rendering */
        * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
    </style>
</head>
<body>
<div class="cv-container">
    <table class="main-table">
        <tr>
            <td class="content-col">
                <!-- Header -->
                <div class="header-name">{{ $cvInformation['personalInformation']['firstName'] }}</div>
                <div class="header-title">
                    {{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}
                </div>

                @if(isset($cvInformation['languages']) && count($cvInformation['languages']) > 0)
                    <div class="language-section">
                        <div class="language-title">{{ __('Languages') }}</div>
                        <div class="language-items">
                            @foreach($cvInformation['languages'] ?? [] as $language)
                                <div class="language-item">
                                    {{ $language['name'] ?? '' }}
                                    @if(isset($language['level']))
                                        <span class="language-level">- {{ $language['level'] ?? '' }}</span>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Objective Section -->
                @if(!empty($cvInformation['summaries']))
                    <table class="section-table">
                        <tr>
                            <td class="section-icon-cell">
                                <div class="section-icon">⌖</div>
                            </td>
                            <td>
                                <div class="section-title">{{ $currentLocale === 'fr' ? 'Objectif' : 'Objective' }}</div>
                                <div class="section-content">
                                    {{ $cvInformation['summaries'][0]['description'] ?? '' }}
                                </div>
                            </td>
                        </tr>
                    </table>
                @endif

                <!-- Experience Sections -->
                @foreach($experiencesByCategory as $category => $experiences)
                    <table class="section-table">
                        <tr>
                            <td class="section-icon-cell">
                                <div class="section-icon">
                                    @if(strtolower($category) == 'académique' || strtolower($category) == 'academic')
                                        <img src="data:image/svg+xml;base64,{{ base64_encode('
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 16 16">
                                                <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/>
                                                <path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/>
                                            </svg>
                                        ') }}" alt="Academic" style="width: 60%; height: 60%;" />
                                    @elseif(strtolower($category) == 'professionnel' || strtolower($category) == 'professional')
                                        <img src="data:image/svg+xml;base64,{{ base64_encode('
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 16 16">
                                                <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v1.384l7.614 2.03a1.5 1.5 0 0 0 .772 0L16 5.884V4.5A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5z"/>
                                                <path d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5V6.85L8.129 8.947a.5.5 0 0 1-.258 0L0 6.85v5.65z"/>
                                            </svg>
                                        ') }}" alt="Professional" style="width: 60%; height: 60%;" />
                                    @else
                                        <img src="data:image/svg+xml;base64,{{ base64_encode('
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 16 16">
                                                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                                            </svg>
                                        ') }}" alt="Other" style="width: 60%; height: 60%;" />
                                    @endif
                                </div>
                            </td>
                            <td>
                                <div class="section-title">{{ $category }}</div>
                                <table class="timeline-table">
                                    @foreach($experiences as $experience)
                                        <tr>
                                            <td class="timeline-dot-cell">
                                                <div class="timeline-dot"></div>
                                                @if(!$loop->last)
                                                    <div class="timeline-line"></div>
                                                @endif
                                            </td>
                                            <td class="timeline-content">
                                                <div class="timeline-date">
                                                    @php
                                                        $start = \Carbon\Carbon::parse($experience['date_start']);
                                                        $end = $experience['date_end'] ? \Carbon\Carbon::parse($experience['date_end']) : \Carbon\Carbon::now();
                                                        $startDate = $start->format('Y-m');
                                                        $endDate = $experience['date_end'] ? $end->format('Y-m') : ($currentLocale === 'fr' ? 'Présent' : 'Present');
                                                    @endphp
                                                    {{ $startDate }} - {{ $endDate }}
                                                </div>
                                                <div class="timeline-title">{{ $experience['name'] }}</div>
                                                <div class="timeline-company">{{ $experience['InstitutionName'] }}</div>
                                                <div class="timeline-description">
                                                    @php
                                                        $descriptionLines = explode("\n", $experience['description']);
                                                    @endphp
                                                    <ul>
                                                        @foreach($descriptionLines as $line)
                                                            @if(trim($line))
                                                                <li>{{ $line }}</li>
                                                            @endif
                                                        @endforeach
                                                        @if($experience['output'])
                                                            <li>{{ $experience['output'] }}</li>
                                                        @endif
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                </table>
                            </td>
                        </tr>
                    </table>
                @endforeach
            </td>

            <td class="sidebar-col">
                <!-- Photo -->
                @if($cvInformation['personalInformation']['photo'])
                    <div class="photo-container">
                        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}"
                             alt="Profile">
                    </div>
                @endif

                <!-- Personal Information -->
                <div class="sidebar-section">
                    <table class="sidebar-title-table">
                        <tr>
                            <td class="sidebar-icon-cell">
                                <div class="sidebar-icon">
                                    <img src="data:image/svg+xml;base64,{{ base64_encode('
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" viewBox="0 0 16 16">
                                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                                            <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
                                        </svg>
                                    ') }}" alt="Info" style="width: 60%; height: 60%;" />
                                </div>
                            </td>
                            <td class="sidebar-title">
                                {{ $currentLocale === 'fr' ? 'Informations' : 'Information' }}
                            </td>
                        </tr>
                    </table>
                    <div class="sidebar-content">
                        @if($cvInformation['personalInformation']['address'])
                            <div class="contact-item">{{ $cvInformation['personalInformation']['address'] }}</div>
                        @endif
                        @if($cvInformation['personalInformation']['phone'])
                            <div class="contact-item">{{ $cvInformation['personalInformation']['phone'] }}</div>
                        @endif
                        @if($cvInformation['personalInformation']['email'])
                            <div class="contact-item">{{ $cvInformation['personalInformation']['email'] }}</div>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <div class="contact-item">{{ $cvInformation['personalInformation']['linkedin'] }}</div>
                        @endif
                    </div>
                </div>

                <!-- Skills -->
                @if(!empty($cvInformation['competences']))
                    <div class="sidebar-section">
                        <table class="sidebar-title-table">
                            <tr>
                                <td class="sidebar-icon-cell">
                                    <div class="sidebar-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M9.162 4.047l.904.204a1.464 1.464 0 0 1 1.088 1.089l.204.904-5.707 5.707L4.243 10.545l5.707-5.707zM0 6.5 8 0l-.352.352-2.284 2.284a6.5 6.5 0 1 0 .001-.001l3.315-3.315L9.032 0 0 6.5z"/>
                                        </svg>
                                    </div>
                                </td>
                                <td class="sidebar-title">
                                    {{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}
                                </td>
                            </tr>
                        </table>
                        <div class="sidebar-content">
                            @foreach($cvInformation['competences'] as $competence)
                                <div class="skill-item">{{ $currentLocale === 'fr' ? $competence['name'] : $competence['name_en'] }}</div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Hobbies -->
                @if(!empty($cvInformation['hobbies']))
                    <div class="sidebar-section">
                        <table class="sidebar-title-table">
                            <tr>
                                <td class="sidebar-icon-cell">
                                    <div class="sidebar-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                        </svg>
                                    </div>
                                </td>
                                <td class="sidebar-title">
                                    {{ $currentLocale === 'fr' ? 'Centres d\'intérêt' : 'Hobbies' }}
                                </td>
                            </tr>
                        </table>
                        <div class="sidebar-content">
                            @foreach($cvInformation['hobbies'] as $hobby)
                                <div class="skill-item">{{ $currentLocale === 'fr' ? $hobby['name'] : $hobby['name_en'] }}</div>
                            @endforeach
                        </div>
                    </div>
                @endif
            </td>
        </tr>
    </table>
</div>
</body>
</html>
@endsection
