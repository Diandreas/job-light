<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=no">

    <!-- PWA -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Guidy">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="Guidy">
    <meta name="msapplication-TileColor" content="#F59E0B">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="theme-color" content="#F59E0B">
    <link rel="manifest" href="{{ asset('manifest.json') }}">

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
    <link rel="icon" type="image/x-icon" href="{{ asset('flavicon.ico') }}">
    <link rel="apple-touch-icon" href="{{ asset('flavicon.ico') }}">
    <link rel="shortcut icon" href="{{ asset('flavicon.ico') }}">

    <!-- Titre de page dynamique -->
    <title inertia>{{ config('app.name', 'Guidy | Générateur de CV gratuit & Assistant de carrière IA') }}</title>

    <!-- Description et mots-clés par défaut (peuvent être écrasés par Inertia) -->
    <meta name="description" content="Générateur de CV gratuit avec intelligence artificielle. Créez votre CV professionnel en minutes. Templates optimisés pour l'ATS, conseils personnalisés et préparation aux entretiens. Guidy AI - votre assistant de carrière.">
    <meta name="keywords" content="générateur de CV gratuit, CV gratuit, Guidy AI, Guidy CV, création CV, resume builder, AI CV, lettre de motivation, cover letter, entretien embauche, interview preparation, IA, AI, assistant carrière">

    <!-- Open Graph par défaut -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Guidy">
    <meta property="og:title" content="Guidy | Générateur de CV gratuit & Assistant de carrière IA">
    <meta property="og:description" content="Utilisez Guidy AI pour créer un CV professionnel gratuit optimisé pour l'ATS. Disponible en français et anglais.">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:image" content="{{ asset('image.png') }}" fetchpriority="low">
    <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">
    <meta property="og:locale:alternate" content="{{ app()->getLocale() == 'fr' ? 'en_US' : 'fr_FR' }}">

    <!-- Twitter Card par défaut -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@guidyai">
    <meta name="twitter:title" content="Guidy - Générateur de CV gratuit avec IA">
    <meta name="twitter:description" content="Créez gratuitement un CV professionnel avec l'aide de l'IA. Templates optimisés pour le marché de l'emploi mondial.">
    <meta name="twitter:image" content="{{ asset('image.png') }}">
    <meta property="og:site_name" content="Guidy">
    <meta property="og:whatsapp:title" content="Guidy - Générateur de CV gratuit propulsé par l'IA">
    <meta property="og:whatsapp:text" content="Crée ton CV professionnel gratuit en 5 minutes avec l'IA! Optimisé pour ATS, disponible en français et anglais.">
    <meta property="og:whatsapp:image" content="{{ asset('image.png') }}">

    <!-- LinkedIn Sharing Optimization -->
    <meta property="linkedin:title" content="Guidy - Générateur de CV gratuit avec l'IA">
    <meta property="linkedin:description" content="Notre IA analyse votre profil et crée gratuitement un CV optimisé pour les recruteurs et les ATS. Templates internationaux, conseils personnalisés et préparation aux entretiens.">
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
            "name": "Guidy - Générateur de CV gratuit avec IA",
            "alternateName": ["Guidy AI", "Guidy CV", "Guidy - Créateur de CV IA"],
            "description": "Générateur de CV gratuit avec IA. Créez un CV professionnel optimisé pour l'ATS en quelques minutes.",
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

    <!-- Données structurées pour SoftwareApplication -->
    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Guidy - Générateur de CV gratuit",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR"
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

<!-- PWA Service Worker -->
<script>
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
</script>
</body>
</html>
