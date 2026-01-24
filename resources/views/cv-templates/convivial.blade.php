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
            $primaryColor = $cvInformation['primary_color'] ?? '#ff7e67'; /* Warm coral */
            $softBg = '#fdfcfb';
            $textMain = "#3d405b";
        @endphp

        @page { margin: 10mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Outfit', 'Inter', sans-serif; font-size: 10pt; line-height: 1.4; color: {{ $textMain }}; background: {{ $softBg }}; }

        .cv-wrapper { padding: 5mm; }

        /* FRIENDLY HEADER */
        .header { display: flex; align-items: center; background: #fff; padding: 6mm 8mm; border-radius: 6mm; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 6mm; position: relative; overflow: hidden; border: 2px solid {{ $primaryColor }}; }
        .header::after { content: ''; position: absolute; right: -50px; top: -50px; width: 150px; height: 150px; background: {{ $primaryColor }}; opacity: 0.1; border-radius: 50%; }

        .photo-wrap { width: 32mm; height: 32mm; border-radius: 50%; overflow: hidden; border: 4px solid {{ $primaryColor }}; margin-right: 8mm; flex-shrink: 0; z-index: 2; }
        .photo-wrap img { width: 100%; height: 100%; object-fit: cover; }

        .header-content { flex: 1; z-index: 2; }
        .hello { font-size: 10pt; color: {{ $primaryColor }}; font-weight: 700; margin-bottom: 1mm; text-transform: uppercase; letter-spacing: 1px; }
        .name { font-size: 22pt; font-weight: 900; color: #1e1b4b; line-height: 1.1; margin-bottom: 2mm; }
        .role { font-size: 11pt; font-weight: 500; color: #64748b; margin-bottom: 3mm; }

        .contact-pills { display: flex; gap: 2mm; flex-wrap: wrap; }
        .pill { background: #f8fafc; padding: 1mm 3mm; border-radius: 20px; font-size: 8pt; color: #334155; border: 1px solid #e2e8f0; display: flex; align-items: center; }
        .pill svg { width: 3.5mm; height: 3.5mm; margin-right: 1.5mm; stroke: {{ $primaryColor }}; stroke-width: 2; }

        /* LAYOUT GRID */
        .grid { display: table; width: 100%; table-layout: fixed; border-spacing: 10px; }
        .col-main { display: table-cell; width: 63%; vertical-align: top; }
        .col-side { display: table-cell; width: 37%; vertical-align: top; }

        .full-width-card { margin-bottom: 6mm; background: #fff; padding: 6mm; border-radius: 5mm; box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; }

        .card { background: #fff; padding: 5mm; border-radius: 5mm; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; margin-bottom: 6mm; }
        .card-header { display: flex; align-items: center; margin-bottom: 4mm; }
        .card-icon { width: 8mm; height: 8mm; background: {{ $primaryColor }}; color: #fff; border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; display: flex; align-items: center; justify-content: center; margin-right: 3mm; }
        .card-icon svg { width: 4.5mm; height: 4.5mm; }
        .card-title { font-size: 11pt; font-weight: 800; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.5px; }

        /* CONTENT STYLES */
        .item { margin-bottom: 4mm; position: relative; padding-left: 2mm; }
        .item-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1mm; }
        .item-name { font-weight: 800; font-size: 10pt; color: #1e1b4b; }
        .item-date { font-size: 8pt; color: #64748b; font-weight: 600; background: #f1f5f9; padding: 1px 6px; border-radius: 4px; }
        .item-inst { font-size: 9pt; font-weight: 600; color: {{ $primaryColor }}; margin-bottom: 2mm; }

        .rich-text { font-size: 9pt; color: #475569; text-align: justify; }
        .rich-text ul { list-style: disc; padding-left: 4mm; margin-top: 1mm; margin-left: 1mm; }
        .rich-text li { margin-bottom: 0.5mm; }

        .skill-bubble { display: inline-block; background: #f1f5f9; color: #475569; padding: 1mm 2.5mm; border-radius: 4mm; font-size: 8.5pt; font-weight: 600; margin-right: 1mm; margin-bottom: 1.5mm; border-bottom: 2px solid #cbd5e1; }
        
        .side-sub-title { font-size: 9.5pt; font-weight: 800; color: #1e1b4b; margin-top: 5mm; margin-bottom: 3mm; border-left: 3px solid {{ $primaryColor }}; padding-left: 2mm; text-transform: uppercase; }

        svg { fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; }
    </style>
</head>
<body>
<div class="cv-wrapper">
    <div class="header">
        @if($cvInformation['personalInformation']['photo'])
        <div class="photo-wrap">
            <img src="data:image/jpeg;base64,{{ base64_encode(file_get_contents(public_path('storage/' . str_replace('/storage/', '', $cvInformation['personalInformation']['photo'])))) }}" alt="">
        </div>
        @endif
        
        <div class="header-content">
            <div class="hello">{{ $currentLocale === 'fr' ? 'Bonjour, je suis' : 'Hello, I am' }}</div>
            <div class="name">{{ $cvInformation['personalInformation']['firstName'] }} {{ $cvInformation['personalInformation']['lastName'] }}</div>
            <div class="role">{{ $currentLocale === 'fr' ? $cvInformation['professions'][0]['name'] : $cvInformation['professions'][0]['name_en'] }}</div>
            
            <div class="contact-pills">
                @if($cvInformation['personalInformation']['email'])
                <div class="pill"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{{ $cvInformation['personalInformation']['email'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['phone'])
                <div class="pill"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.35a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.75.34 1.54.57 2.35.7A2 2 0 0 1 22 16.92z"/></svg>{{ $cvInformation['personalInformation']['phone'] }}</div>
                @endif
                @if($cvInformation['personalInformation']['address'])
                <div class="pill"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{{ $cvInformation['personalInformation']['address'] }}</div>
                @endif
            </div>
        </div>
    </div>

    @if(!empty($cvInformation['summaries']))
    <div class="full-width-card">
        <div class="card-header">
            <div class="card-icon" style="border-radius: 50%"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="card-title">{{ $currentLocale === 'fr' ? 'À propos de moi' : 'About Me' }}</div>
        </div>
        <div class="rich-text content-text">{!! $cvInformation['summaries'][0]['description'] ?? '' !!}</div>
    </div>
    @endif

    @php
        $research = [];
        $academic = [];
        $professional = [];
        
        foreach($experiencesByCategory as $category => $experiences) {
            $catLower = strtolower($category);
            if(str_contains($catLower, 'recherche') || str_contains($catLower, 'research')) {
                $research = array_merge($research, $experiences);
            } elseif(str_contains($catLower, 'formation') || str_contains($catLower, 'acadé') || str_contains($catLower, 'education') || str_contains($catLower, 'enseign')) {
                $academic = array_merge($academic, $experiences);
            } else {
                $professional = array_merge($professional, $experiences);
            }
        }
        $isEnglish = str_starts_with(strtolower($currentLocale), 'en');
    @endphp

    <div class="grid">
        <div class="col-main">
             @if(!empty($research))
            <div class="card">
                <div class="card-header">
                    <div class="card-icon" style="background: #4cc9f0;"><svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></div>
                    <div class="card-title">{{ $currentLocale === 'fr' ? 'Recherche & Innovation' : 'Research' }}</div>
                </div>
                @foreach($research as $exp)
                <div class="item">
                    <div class="item-head"><span class="item-name">{{ $exp['name'] }}</span> <span class="item-date">{{ \Carbon\Carbon::parse($exp['date_start'])->format('Y') }}</span></div>
                    <div class="item-inst">{{ $exp['InstitutionName'] }}</div>
                    <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                </div>
                @endforeach
            </div>
            @endif

            @if(!empty($professional))
            <div class="card">
                <div class="card-header">
                    <div class="card-icon" style="background: #7209b7;"><svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
                    <div class="card-title">{{ $currentLocale === 'fr' ? 'Expériences Professionnelles' : 'Work Experience' }}</div>
                </div>
                @foreach($professional as $exp)
                <div class="item">
                    <div class="item-head"><span class="item-name">{{ $exp['name'] }}</span> <span class="item-date">{{ \Carbon\Carbon::parse($exp['date_start'])->locale($currentLocale)->isoFormat('MMM YY') }} - {{ $exp['date_end'] ? \Carbon\Carbon::parse($exp['date_end'])->locale($currentLocale)->isoFormat('MMM YY') : ($isEnglish ? 'Present' : 'Présent') }}</span></div>
                    <div class="item-inst">{{ $exp['InstitutionName'] }}</div>
                    <div class="rich-text content-text">{!! $exp['description'] !!}</div>
                </div>
                @endforeach
            </div>
            @endif
        </div>

        <div class="col-side">
            <div class="card">
                <div class="card-header">
                    <div class="card-icon" style="background: #4895ef;"><svg viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3.33 3 14.67 3 18 0v-5"/></svg></div>
                    <div class="card-title">{{ $currentLocale === 'fr' ? 'Formation' : 'Formation' }}</div>
                </div>
                
                @foreach($academic as $exp)
                <div class="item">
                    <div class="item-head"><span class="item-name">{{ $exp['name'] }}</span> <span class="item-date">{{ \Carbon\Carbon::parse($exp['date_start'])->format('Y') }}</span></div>
                    <div style="font-size: 8.5pt; color: #666; margin-bottom: 1.5mm;">{{ $exp['InstitutionName'] }}</div>
                    @if(!empty($exp['description']))
                    <div class="rich-text content-text" style="font-size: 8pt; border-left: 2px solid #eee; padding-left: 2mm;">{!! $exp['description'] !!}</div>
                    @endif
                </div>
                @endforeach

                @if(!empty($cvInformation['competences']))
                <div class="side-sub-title">{{ $currentLocale === 'fr' ? 'Compétences' : 'Skills' }}</div>
                @foreach($cvInformation['competences'] as $comp)
                @php $lvl = match($comp['level'] ?? 'Intermédiaire') { 'Expert' => 100, 'Avancé' => 80, 'Intermédiaire' => 60, 'Débutant' => 40, default => 60 }; @endphp
                <div style="margin-bottom: 3mm;">
                    <div style="display: flex; justify-content: space-between; font-size: 8.5pt; font-weight: 600; margin-bottom: 0.5mm;">
                        <span>{{ $currentLocale === 'fr' ? $comp['name'] : $comp['name_en'] }}</span>
                        <span style="color: {{ $primaryColor }}; font-size: 8pt;">{{ $comp['level'] ?? '' }}</span>
                    </div>
                    <div style="height: 1.5mm; background: #f1f5f9; border-radius: 1mm; overflow: hidden; border: 1px solid #e2e8f0;">
                        <div style="height: 100%; background: {{ $primaryColor }}; width: {{ $lvl }}%; border-radius: 1mm;"></div>
                    </div>
                </div>
                @endforeach
                @endif

                @if(!empty($cvInformation['certifications']))
                <div class="side-sub-title">Certifications</div>
                @foreach($cvInformation['certifications'] as $cert)
                <div style="margin-bottom: 2mm; font-size: 8.5pt;"><strong>{{ $cert['name'] }}</strong><br><small style="color: #666;">{{ $cert['institution'] }}</small></div>
                @endforeach
                @endif

                @if(!empty($cvInformation['languages']))
                <div class="side-sub-title">{{ $currentLocale === 'fr' ? 'Langues' : 'Languages' }}</div>
                @foreach($cvInformation['languages'] as $lang)
                <div style="font-size: 8.5pt; margin-bottom: 1mm;"><strong>{{ $lang['name'] }}</strong>: {{ $lang['level'] }}</div>
                @endforeach
                @endif
            </div>
        </div>
    </div>
</div>
</body>
<x-cv-editable-scripts />
</html>
@endsection
