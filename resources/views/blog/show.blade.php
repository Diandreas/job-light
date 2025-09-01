<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $post->meta_title ?: $post->title }} | Blog Guidy</title>
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="{{ $post->meta_description ?: $post->excerpt }}">
    @if($post->meta_keywords)
        <meta name="keywords" content="{{ $post->meta_keywords }}">
    @endif
    <meta name="author" content="{{ $post->author->name }}">
    <meta name="robots" content="index, follow">
    <meta name="article:published_time" content="{{ $post->published_at->toISOString() }}">
    <meta name="article:modified_time" content="{{ $post->updated_at->toISOString() }}">
    <meta name="article:author" content="{{ $post->author->name }}">
    <meta name="article:section" content="{{ $post->category }}">
    @if($post->tags)
        @foreach($post->tags as $tag)
            <meta name="article:tag" content="{{ $tag }}">
        @endforeach
    @endif
    
    <!-- Canonical URL -->
    <link rel="canonical" href="{{ $post->url }}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="{{ $post->meta_title ?: $post->title }}">
    <meta property="og:description" content="{{ $post->meta_description ?: $post->excerpt }}">
    <meta property="og:url" content="{{ $post->url }}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="{{ $post->featured_image ? asset($post->featured_image) : asset('image.png') }}">
    <meta property="og:site_name" content="Guidy">
    <meta property="og:locale" content="fr_FR">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $post->meta_title ?: $post->title }}">
    <meta name="twitter:description" content="{{ $post->meta_description ?: $post->excerpt }}">
    <meta name="twitter:image" content="{{ $post->featured_image ? asset($post->featured_image) : asset('image.png') }}">
    
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
        "@type": "BlogPosting",
        "headline": "{{ $post->title }}",
        "description": "{{ $post->excerpt }}",
        "image": "{{ $post->featured_image ? asset($post->featured_image) : asset('image.png') }}",
        "author": {
            "@type": "Person",
            "name": "{{ $post->author->name }}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Guidy",
            "logo": {
                "@type": "ImageObject",
                "url": "{{ asset('logo.png') }}"
            }
        },
        "datePublished": "{{ $post->published_at->toISOString() }}",
        "dateModified": "{{ $post->updated_at->toISOString() }}",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "{{ $post->url }}"
        },
        "wordCount": {{ str_word_count(strip_tags($post->content)) }},
        "timeRequired": "PT{{ $post->reading_time }}M",
        "articleSection": "{{ $post->category }}",
        "keywords": "{{ $post->tags ? implode(', ', $post->tags) : '' }}"
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
        .article-content h2 { @apply text-2xl font-bold text-gray-800 mt-8 mb-4; }
        .article-content h3 { @apply text-xl font-semibold text-gray-800 mt-6 mb-3; }
        .article-content p { @apply text-gray-700 mb-4 leading-relaxed; }
        .article-content ul { @apply list-disc list-inside text-gray-700 mb-4 space-y-1; }
        .article-content ol { @apply list-decimal list-inside text-gray-700 mb-4 space-y-1; }
        .article-content blockquote { @apply border-l-4 border-amber-500 pl-4 italic text-gray-600 my-6; }
        .article-content code { @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono; }
        .article-content pre { @apply bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm; }
        .article-content a { @apply text-amber-600 hover:text-amber-700 underline; }
        .article-content strong { @apply font-semibold text-gray-800; }
        .article-content img { @apply rounded-lg shadow-md my-6; }
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
                    <a href="{{ route('blog.index') }}" class="text-lg font-semibold text-gray-800 hover:text-amber-600 transition-colors">
                        Blog
                    </a>
                </div>
                
                <nav class="flex items-center gap-4">
                    <a href="{{ route('blog.index') }}" class="text-gray-600 hover:text-amber-600 transition-colors">
                        Tous les articles
                    </a>
                    <a href="{{ route('register') }}" class="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-purple-600 transition-all">
                        Créer mon CV
                    </a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Breadcrumb -->
    <nav class="bg-white border-b border-gray-200">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div class="flex items-center gap-2 text-sm text-gray-600">
                <a href="{{ route('welcome') }}" class="hover:text-amber-600 transition-colors">Accueil</a>
                <span>›</span>
                <a href="{{ route('blog.index') }}" class="hover:text-amber-600 transition-colors">Blog</a>
                <span>›</span>
                <span class="text-gray-800 font-medium">{{ $post->title }}</span>
            </div>
        </div>
    </nav>

    <!-- Article -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
            <!-- Header de l'article -->
            <header class="mb-8">
                @if($post->featured_image)
                    <div class="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-8">
                        <img src="{{ asset($post->featured_image) }}" 
                             alt="{{ $post->title }}" 
                             class="w-full h-full object-cover">
                    </div>
                @endif

                <div class="flex items-center gap-2 mb-4">
                    @if($post->featured)
                        <span class="bg-gradient-to-r from-amber-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                            ⭐ Article en vedette
                        </span>
                    @endif
                    <span class="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {{ ucfirst($post->category) }}
                    </span>
                    @if($post->tags)
                        @foreach($post->tags as $tag)
                            <span class="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                                #{{ $tag }}
                            </span>
                        @endforeach
                    @endif
                </div>

                <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
                    {{ $post->title }}
                </h1>

                <div class="flex items-center gap-6 text-sm text-gray-600 mb-6">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-xs font-bold">
                                {{ substr($post->author->name, 0, 1) }}
                            </span>
                        </div>
                        <span>Par {{ $post->author->name }}</span>
                    </div>
                    <span>{{ $post->published_at->format('d M Y') }}</span>
                    <span>{{ $post->reading_time }} min de lecture</span>
                    <span>{{ $post->views_count }} vues</span>
                </div>

                <!-- Partage social -->
                <div class="flex items-center gap-3 py-4 border-y border-gray-200">
                    <span class="text-sm font-medium text-gray-600">Partager :</span>
                    <a href="https://twitter.com/intent/tweet?text={{ urlencode($post->title) }}&url={{ urlencode($post->url) }}" 
                       target="_blank" 
                       class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlencode($post->url) }}" 
                       target="_blank" 
                       class="bg-blue-700 text-white p-2 rounded-lg hover:bg-blue-800 transition-colors">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                    <button onclick="navigator.share({title: '{{ $post->title }}', url: '{{ $post->url }}'})" 
                            class="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                        </svg>
                    </button>
                </div>
            </header>

            <!-- Contenu de l'article -->
            <div class="article-content prose prose-lg max-w-none">
                {!! $post->content !!}
            </div>

            <!-- Footer de l'article -->
            <footer class="mt-12 pt-8 border-t border-gray-200">
                <div class="bg-gradient-to-r from-amber-50 to-purple-50 rounded-xl p-6 border border-amber-200">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-xl font-bold">
                                {{ substr($post->author->name, 0, 1) }}
                            </span>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-800 mb-1">{{ $post->author->name }}</h4>
                            <p class="text-gray-600 text-sm">
                                Expert en développement de carrière et création de CV professionnels
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </article>

        <!-- Articles similaires -->
        @if($relatedPosts->count() > 0)
            <section class="mt-16">
                <h2 class="text-2xl font-bold text-gray-800 mb-8">Articles similaires</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    @foreach($relatedPosts as $related)
                        <article class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            @if($related->featured_image)
                                <div class="aspect-video bg-gray-200">
                                    <img src="{{ asset($related->featured_image) }}" 
                                         alt="{{ $related->title }}" 
                                         class="w-full h-full object-cover">
                                </div>
                            @endif
                            
                            <div class="p-4">
                                <h3 class="font-semibold text-gray-800 mb-2 line-clamp-2">
                                    <a href="{{ route('blog.show', $related->slug) }}" class="hover:text-amber-600 transition-colors">
                                        {{ $related->title }}
                                    </a>
                                </h3>
                                <p class="text-gray-600 text-sm line-clamp-2 mb-3">
                                    {{ $related->excerpt }}
                                </p>
                                <div class="text-xs text-gray-500">
                                    {{ $related->published_at->format('d M Y') }}
                                </div>
                            </div>
                        </article>
                    @endforeach
                </div>
            </section>
        @endif

        <!-- CTA -->
        <section class="mt-16">
            <div class="bg-gradient-to-r from-amber-500 to-purple-500 rounded-2xl p-8 text-white text-center">
                <h2 class="text-2xl md:text-3xl font-bold mb-4">
                    Prêt à créer votre CV professionnel ?
                </h2>
                <p class="text-lg mb-6 opacity-90">
                    Mettez en pratique nos conseils avec Guidy
                </p>
                <a href="{{ route('register') }}" 
                   class="inline-block bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Commencer gratuitement
                </a>
            </div>
        </section>
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
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Blog</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="{{ route('blog.index') }}" class="hover:text-white transition-colors">Tous les articles</a></li>
                        <li><a href="{{ route('blog.index', ['category' => 'conseils']) }}" class="hover:text-white transition-colors">Conseils</a></li>
                        <li><a href="{{ route('blog.index', ['category' => 'guides']) }}" class="hover:text-white transition-colors">Guides</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Guidy</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="{{ route('welcome') }}" class="hover:text-white transition-colors">Accueil</a></li>
                        <li><a href="{{ route('register') }}" class="hover:text-white transition-colors">Créer un CV</a></li>
                        <li><a href="{{ route('privacy') }}" class="hover:text-white transition-colors">Confidentialité</a></li>
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