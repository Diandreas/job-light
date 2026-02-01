@extends('layouts.cv')

@section('content')
<!DOCTYPE html>
<html lang="{{ $currentLocale }}">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @php
            $primaryColor = $cvInformation['primary_color'] ?? '#000';
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3; color: #000; }

        /* BRUTALIST OLDSCHOOL STYLE */
        .cv-container { max-width: 100%; border: 4px double #000; padding: 5mm; min-height: 280mm; }

        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 4mm; margin-bottom: 6mm; }
        .name { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 2mm; text-decoration: underline; }
        
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 6mm; font-size: 10pt; }
        .info-table td { border: 1px solid #000; padding: 2mm; }
        .info-table a { color: inherit; text-decoration: none; }
        .label { font-weight: bold; background: #eee; width: 30%; }

        /* SECTIONS */
        .section-title { font-size: 12pt; font-weight: bold; background: {{ $primaryColor }}; color: #fff; padding: 1mm 2mm; margin-bottom: 4mm; text-transform: uppercase; border: 1px solid {{ $primaryColor }}; }

        .exp-item { margin-bottom: 5mm; border-bottom: 1px solid #000; padding-bottom: 2mm; }
        .exp-item:last-child { border-bottom: none; }
        
        .exp-title { font-weight: bold; font-size: 11pt; }
        .exp-meta { font-style: italic; font-size: 10pt; margin-bottom: 1mm; }

        .rich-text ul { list-style-type: square; padding-left: 6mm; margin-top: 2mm; margin-bottom: 2mm; }
        .rich-text li { margin-bottom: 1.2mm; line-height: 1.4; display: list-item; }
        .rich-text p { margin-bottom: 2mm; }

        .photo-box { width: 35mm; height: 45mm; border: 1px solid #000; float: right; margin: 0 0 2mm 2mm; border-radius: 8px; overflow: hidden; }
        .photo-box img { width: 100%; height: 100%; object-fit: cover; }
    </style>
</head>
<body>
<div class="cv-container">
    @if($cvInformation['personalInformation']['photo'])
    <div class="photo-box">
        <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
    </div>
    @endif

    <div class="header">
        <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
        <div>{{ strtoupper($currentLocale === 'en' ? ($cvInformation['professions'][0]['name_en'] ?? $cvInformation['professions'][0]['name']) : $cvInformation['professions'][0]['name']) }}</div>
    </div>

    <table class="info-table">
        @if($cvInformation['personalInformation']['phone'])
        <tr>
            <td class="label">PHONE</td>
            <td>{{ $cvInformation['personalInformation']['phone'] }}</td>
        </tr>
        @endif
        @if($cvInformation['personalInformation']['email'])
        <tr>
            <td class="label">EMAIL</td>
            <td>{{ $cvInformation['personalInformation']['email'] }}</td>
        </tr>
        @endif
        @if($cvInformation['personalInformation']['address'])
        <tr>
            <td class="label">ADDRESS</td>
            <td>{{ $cvInformation['personalInformation']['address'] }}</td>
        </tr>
        @endif
        @if(!empty($cvInformation['personalInformation']['linkedin']))
        <tr>
            <td class="label">LINKEDIN</td>
            <td><a href="{{ $cvInformation['personalInformation']['linkedin'] }}" target="_blank">{{ $cvInformation['personalInformation']['linkedin'] }}</a></td>
        </tr>
        @endif
        @if(!empty($cvInformation['personalInformation']['github']))
        <tr>
            <td class="label">GITHUB</td>
            <td><a href="{{ $cvInformation['personalInformation']['github'] }}" target="_blank">{{ $cvInformation['personalInformation']['github'] }}</a></td>
        </tr>
        @endif
    </table>

    @if(!empty($cvInformation['summaries']))
    <div class="section-title">{{ strtoupper(__('cv.profile')) }}</div>
    <div style="margin-bottom: 6mm; text-align: justify;" class="content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    @endif

    <div class="section-title" style="background: {{ $primaryColor }}; border-color: {{ $primaryColor }};">{{ strtoupper(__('cv.experience')) }}</div>
    @foreach($experiencesByCategory as $category => $experiences)
        @php
            $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
            $translatedCategory = $isEnglish ? ($categoryTranslations[$category]['name_en'] ?? $category) : $category;
            
            if($isEnglish && $translatedCategory === $category) {
                $normCat = strtolower($category);
                if(str_contains($normCat, 'professionnel') || str_contains($normCat, 'professional') || str_contains($normCat, 'travail') || str_contains($normCat, 'work')) {
                    $translatedCategory = 'Work Experience';
                } elseif(str_contains($normCat, 'recherche') || str_contains($normCat, 'research')) {
                    $translatedCategory = 'Research';
                } elseif(str_contains($normCat, 'enseign') || str_contains($normCat, 'teach')) {
                    $translatedCategory = 'Teaching';
                } elseif(str_contains($normCat, 'format') || str_contains($normCat, 'académ') || str_contains($normCat, 'education')) {
                    $translatedCategory = 'Education';
                }
            }
        @endphp
        <div style="font-weight: bold; text-decoration: underline; margin-top: 4mm; margin-bottom: 2mm; font-size: 10pt; color: {{ $primaryColor }};">{{ strtoupper($translatedCategory) }}</div>
        @foreach($experiences as $exp)
        <div class="exp-item">
            <div class="exp-title">{{ strtoupper($exp['name']) }}</div>
            <div class="exp-meta">{{ $exp['InstitutionName'] }} | {{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YYYY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YYYY') : ($isEnglish ? 'Present' : 'Présent') }}</div>
            <div class="content-text rich-text">{!! $exp['description'] !!}</div>
        </div>
        @endforeach
    @endforeach
    
    @if(!empty($cvInformation['certifications']))
    <div class="section-title" style="background: {{ $primaryColor }}; border-color: {{ $primaryColor }};">{{ strtoupper(__('cv.certifications')) }}</div>
    <ul class="content-text rich-text" style="list-style-type: square; margin-bottom: 5mm;">
        @foreach($cvInformation['certifications'] as $cert)
        <li>
            <strong>{{ $cert['name'] }}</strong>
            @if(!empty($cert['institution'])) - {{ $cert['institution'] }} @endif
            @if(!empty($cert['date'])) [{{ $cert['date'] }}] @endif
        </li>
        @endforeach
    </ul>
    @endif

    <div class="section-title" style="background: {{ $primaryColor }}; border-color: {{ $primaryColor }};">{{ strtoupper(__('cv.skills')) }} & {{ strtoupper(__('cv.hobbies')) }}</div>
    <table class="info-table">
        @if(!empty($cvInformation['competences']))
        <tr>
            <td class="label" style="border-color: {{ $primaryColor }};">{{ strtoupper(__('cv.skills')) }}</td>
            <td style="border-color: {{ $primaryColor }};">
                {{ collect($cvInformation['competences'])->map(fn($c) => ($currentLocale === 'en' ? ($c['name_en'] ?? $c['name']) : $c['name']) . ($c['level'] ? ' (' . $c['level'] . ')' : ''))->join(', ') }}
            </td>
        </tr>
        @endif
        @if(!empty($cvInformation['languages']))
        <tr>
            <td class="label">{{ strtoupper(__('cv.languages')) }}</td>
            <td>
                @foreach($cvInformation['languages'] as $lang)
                {{ $currentLocale === 'en' ? ($lang['name_en'] ?? $lang['name']) : $lang['name'] }} ({{ trans()->has("cv.levels." . $lang['level']) ? __("cv.levels." . $lang['level']) : $lang['level'] }})@if(!$loop->last), @endif
                @endforeach
            </td>
        </tr>
        @endif
        @if(!empty($cvInformation['hobbies']))
        <tr>
            <td class="label">{{ strtoupper(__('cv.hobbies')) }}</td>
            <td>
                {{ collect($cvInformation['hobbies'])->map(fn($h) => $currentLocale === 'en' ? ($h['name_en'] ?? $h['name']) : $h['name'])->join(', ') }}
            </td>
        </tr>
        @endif
    </table>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection