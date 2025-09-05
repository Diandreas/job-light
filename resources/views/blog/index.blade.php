<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Guidy - Conseils CV et Carrière | {{ config('app.name') }}</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Découvrez nos conseils d'experts pour créer un CV parfait, optimiser votre recherche d'emploi et booster votre carrière avec l'IA. Articles pratiques et guides complets.">
    <meta name="keywords" content="blog CV, conseils carrière, recherche emploi, CV professionnel, IA carrière, guide CV, optimisation ATS">
    <meta name="author" content="Guidy">
    <meta name="robots" content="index, follow">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url('/blog') }}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="Blog Guidy - Conseils CV et Carrière">
    <meta property="og:description" content="Conseils d'experts pour optimiser votre CV et booster votre carrière avec l'IA">
    <meta property="og:url" content="{{ url('/blog') }}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="{{ asset('image.png') }}">
    <meta property="og:site_name" content="Guidy">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Blog Guidy - Conseils CV et Carrière">
    <meta name="twitter:description" content="Conseils d'experts pour optimiser votre CV et booster votre carrière">
    <meta name="twitter:image" content="{{ asset('image.png') }}">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('flavicon.ico') }}">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Blog Guidy",
        "description": "Conseils d'experts pour créer un CV parfait et optimiser votre carrière avec l'IA",
        "url": "{{ url('/blog') }}",
        "publisher": {
            "@type": "Organization",
            "name": "Guidy",
            "logo": {
                "@type": "ImageObject",
                "url": "{{ asset('logo.png') }}"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "{{ url('/blog') }}"
        }
    }
    </script>

    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-text { 
            background: linear-gradient(135deg, #f59e0b 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div class="flex items-center gap-4">
                    <a href="{{ route('welcome') }}" class="flex items-center gap-2">
                        <img src="{{ asset('logo.png') }}" alt="Guidy" class="w-8 h-8">
                        <span class="text-xl font-bold gradient-text">Guidy</span>
                    </a>
                    <span class="text-gray-400">|</span>
                    <h1 class="text-lg font-semibold text-gray-800">Blog</h1>
                </div>
                
                <nav class="flex items-center gap-4">
                    <a href="{{ route('welcome') }}" class="text-gray-600 hover:text-amber-600 transition-colors">
                        Accueil
                    </a>
                    <a href="{{ route('register') }}" class="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-purple-600 transition-all">
                        Créer mon CV
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-amber-500 to-purple-500 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
                Blog Guidy
            </h1>
            <p class="text-xl md:text-2xl mb-8 opacity-90">
                Conseils d'experts pour créer un CV parfait et booster votre carrière
            </p>
            
            <!-- Barre de recherche -->
            <div class="max-w-md mx-auto">
                <form method="GET" action="{{ route('blog.index') }}" class="relative">
                    <input 
                        type="text" 
                        name="search" 
                        value="{{ $searchQuery }}"
                        placeholder="Rechercher un article..." 
                        class="w-full px-4 py-3 rounded-lg text-gray-800 bg-white/90 backdrop-blur-sm border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    >
                    <button type="submit" class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-500 text-white p-2 rounded-md hover:bg-amber-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Articles -->
            <div class="lg:col-span-3">
                <!-- Filtres de catégorie -->
                @if($categories->count() > 0)
                    <div class="mb-8">
                        <div class="flex flex-wrap gap-2">
                            <a href="{{ route('blog.index') }}" 
                               class="px-4 py-2 rounded-full text-sm font-medium transition-colors {{ !$currentCategory ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-amber-50' }}">
                                Tous les articles
                            </a>
                            @foreach($categories as $category)
                                <a href="{{ route('blog.index', ['category' => $category]) }}" 
                                   class="px-4 py-2 rounded-full text-sm font-medium transition-colors {{ $currentCategory === $category ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-amber-50' }}">
                                    {{ ucfirst($category) }}
                                </a>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Grille d'articles -->
                @if($posts->count() > 0)
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        @foreach($posts as $post)
                            <article class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-hover">
                                @if($post->featured_image)
                                    <div class="aspect-video bg-gray-200 overflow-hidden">
                                        <img src="{{ asset($post->featured_image) }}" 
                                             alt="{{ $post->title }}" 
                                             class="w-full h-full object-cover">
                                    </div>
                                @endif
                                
                                <div class="p-6">
                                    <div class="flex items-center gap-2 mb-3">
                                        @if($post->featured)
                                            <span class="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                ⭐ En vedette
                                            </span>
                                        @endif
                                        <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                            {{ ucfirst($post->category) }}
                                        </span>
                                        <span class="text-gray-400 text-xs">
                                            {{ $post->reading_time }} min de lecture
                                        </span>
                                    </div>
                                    
                                    <h2 class="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                                        <a href="{{ route('blog.show', $post->slug) }}" class="hover:text-amber-600 transition-colors">
                                            {{ $post->title }}
                                        </a>
                                    </h2>
                                    
                                    <p class="text-gray-600 mb-4 line-clamp-3">
                                        {{ $post->excerpt }}
                                    </p>
                                    
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{{ $post->published_at->format('d M Y') }}</span>
                                            <span>•</span>
                                            <span>{{ $post->views_count }} vues</span>
                                        </div>
                                        
                                        <a href="{{ route('blog.show', $post->slug) }}" 
                                           class="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1">
                                            Lire la suite
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </article>
                        @endforeach
                    </div>

                    <!-- Pagination -->
                    <div class="flex justify-center">
                        {{ $posts->appends(request()->query())->links() }}
                    </div>
                @else
                    <div class="text-center py-12">
                        <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-800 mb-2">Aucun article trouvé</h3>
                        <p class="text-gray-600">
                            @if($searchQuery)
                                Aucun résultat pour "{{ $searchQuery }}"
                            @else
                                Les articles seront bientôt disponibles.
                            @endif
                        </p>
                    </div>
                @endif
            </div>

            <!-- Sidebar -->
            <aside class="lg:col-span-1 space-y-6">
                <!-- Articles en vedette -->
                @if($featuredPosts->count() > 0)
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                            Articles populaires
                        </h3>
                        <div class="space-y-4">
                            @foreach($featuredPosts as $featured)
                                <div class="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                    <h4 class="font-medium text-gray-800 text-sm mb-1">
                                        <a href="{{ route('blog.show', $featured->slug) }}" class="hover:text-amber-600 transition-colors">
                                            {{ $featured->title }}
                                        </a>
                                    </h4>
                                    <div class="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{{ $featured->published_at->format('d M Y') }}</span>
                                        <span>•</span>
                                        <span>{{ $featured->views_count }} vues</span>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                <!-- Newsletter -->
                <div class="bg-gradient-to-r from-amber-500 to-purple-500 rounded-xl p-6 text-white">
                    <h3 class="text-lg font-bold mb-2">Restez informé</h3>
                    <p class="text-sm mb-4 opacity-90">
                        Recevez nos derniers conseils carrière directement par email
                    </p>
                    <form class="space-y-3">
                        <input 
                            type="email" 
                            placeholder="votre@email.com" 
                            class="w-full px-3 py-2 rounded-lg text-gray-800 bg-white/90 border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-sm"
                        >
                        <button type="submit" class="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors text-sm font-medium">
                            S'abonner
                        </button>
                    </form>
                </div>

                <!-- CTA Guidy -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div class="text-center">
                        <div class="w-12 h-12 bg-gradient-to-r from-amber-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <h3 class="font-bold text-blue-800 mb-2">Prêt à créer votre CV ?</h3>
                        <p class="text-blue-600 text-sm mb-4">
                            Mettez en pratique nos conseils avec Guidy
                        </p>
                        <a href="{{ route('register') }}" class="block bg-gradient-to-r from-amber-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-amber-600 hover:to-purple-600 transition-all text-sm font-medium">
                            Commencer gratuitement
                        </a>
                    </div>
                </div>
            </aside>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div class="col-span-2">
                    <div class="flex items-center gap-2 mb-4">
                        <img src="{{ asset('logo.png') }}" alt="Guidy" class="w-8 h-8">
                        <span class="text-xl font-bold">Guidy</span>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Votre assistant IA pour créer des CV professionnels et développer votre carrière.
                    </p>
                    <div class="flex gap-4">
                        <a href="mailto:guidy.makeitreall@gmail.com" class="text-gray-400 hover:text-white transition-colors">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Blog</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="{{ route('blog.index') }}" class="hover:text-white transition-colors">Tous les articles</a></li>
                        @foreach($categories->take(3) as $category)
                            <li><a href="{{ route('blog.index', ['category' => $category]) }}" class="hover:text-white transition-colors">{{ ucfirst($category) }}</a></li>
                        @endforeach
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Guidy</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="{{ route('welcome') }}" class="hover:text-white transition-colors">Accueil</a></li>
                        <li><a href="{{ route('register') }}" class="hover:text-white transition-colors">Créer un CV</a></li>
                        <li><a href="{{ route('privacy') }}" class="hover:text-white transition-colors">Confidentialité</a></li>
                        <li><a href="{{ route('terms') }}" class="hover:text-white transition-colors">Conditions</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; {{ date('Y') }} Guidy. Tous droits réservés.</p>
            </div>
        </div>
    </footer>
</body>
</html>