<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">

    <!-- SEO - Balises techniques -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="author" content="Guidy">
    <meta name="generator" content="Guidy AI Resume Platform">
    <meta name="application-name" content="Guidy">
    <meta name="theme-color" content="#F59E0B">
    <meta name="format-detection" content="telephone=no">
    <meta name="HandheldFriendly" content="true">
    <meta name="referrer" content="no-referrer-when-downgrade">
    <meta name="copyright" content="© {{ date('Y') }} Guidy">

    <!-- Balises d'identification linguistique -->
    <meta name="language" content="English, French">

    <!-- Favicon et icônes -->
    <link rel="icon" type="image/png" href="{{ asset('ai.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('ai.png') }}">
    <link rel="shortcut icon" href="{{ asset('ai.png') }}">

    <!-- Titre de page dynamique -->
    <title inertia>{{ config('app.name', 'Guidy | AI Resume Builder & Career Assistant') }}</title>

    <!-- Description et mots-clés par défaut (peuvent être écrasés par Inertia) -->
    <meta name="description" content="Créez votre CV professionnel avec l'IA en minutes. Templates optimisés pour le marché international, conseils personnalisés et préparation aux entretiens. Available in English & French.">
    <meta name="keywords" content="CV, création CV, resume builder, AI CV, lettre de motivation, cover letter, entretien embauche, interview preparation, IA, AI, assistant carrière">

    <!-- Open Graph par défaut -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Guidy">
    <meta property="og:title" content="Guidy | AI Resume Builder & Career Assistant">
    <meta property="og:description" content="Create professional resumes with AI guidance. Available in English & French worldwide.">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ asset('image.png') }}" fetchpriority="low">
    <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">
    <meta property="og:locale:alternate" content="{{ app()->getLocale() == 'fr' ? 'en_US' : 'fr_FR' }}">

    <!-- Twitter Card par défaut -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@guidyai">
    <meta name="twitter:title" content="Guidy - AI Resume Builder">
    <meta name="twitter:description" content="Create professional resumes with AI guidance. Templates optimized for global job markets.">
    <meta name="twitter:image" content="{{ asset('image.png') }}">
    <meta property="og:site_name" content="Guidy">
    <meta property="og:whatsapp:title" content="Guidy - Créateur de CV propulsé par l'IA">
    <meta property="og:whatsapp:text" content="Crée ton CV professionnel en 5 minutes avec l'IA! Optimisé pour ATS, gratuit et disponible en français et anglais.">
    <meta property="og:whatsapp:image" content="{{ asset('image.png') }}">

    <!-- LinkedIn Sharing Optimization -->
    <meta property="linkedin:title" content="Guidy - Créez votre CV professionnel avec l'IA">
    <meta property="linkedin:description" content="Notre IA analyse votre profil et crée un CV optimisé pour les recruteurs et les ATS. Templates internationaux, conseils personnalisés et préparation aux entretiens.">
    <meta property="linkedin:image" content="{{ asset('image.png') }}">
    <meta property="linkedin:owner" content="Guidy">
    <meta property="article:publisher" content="https://www.linkedin.com/company/guidyai">

    <!-- Amélioration générale pour le partage social -->
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Interface de Guidy montrant un exemple de CV créé par l'IA">
    <meta property="og:type" content="website">
    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Données structurées par défaut pour le site web -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "{{ url('/') }}",
            "name": "Guidy - AI Resume Builder",
            "alternateName": "Guidy - Créateur de CV IA",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "{{ url('/') }}/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        }
    </script>

    <!-- Données structurées pour l'organisation -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Guidy",
            "url": "{{ url('/') }}",
            "logo": {
                "@type": "ImageObject",
                "url": "{{ asset('logo.png') }}"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+237693427913",
                "contactType": "customer service",
                "email": "guidy.makeitreall@gmail.com",
                "availableLanguage": ["French", "English"]
            }
        }
    </script>

    <!-- Préchargement des ressources -->
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.bunny.net">

    <!-- Fonts -->
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet">

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body class="font-sans antialiased">
@inertia
</body>
</html>
