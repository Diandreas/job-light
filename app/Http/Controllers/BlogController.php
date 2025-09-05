<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class BlogController extends Controller
{
    /**
     * Affiche la liste des articles de blog
     */
    public function index(Request $request)
    {
        $query = BlogPost::published()
            ->with('author')
            ->orderBy('featured', 'desc')
            ->orderBy('published_at', 'desc');

        // Filtrage par catégorie
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        // Recherche
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $posts = $query->paginate(12);
        
        // Articles en vedette pour la sidebar
        $featuredPosts = BlogPost::published()
            ->featured()
            ->take(5)
            ->get(['id', 'title', 'slug', 'published_at', 'views_count']);

        // Catégories disponibles
        $categories = BlogPost::published()
            ->distinct()
            ->pluck('category')
            ->filter()
            ->sort()
            ->values();

        return view('blog.index', [
            'posts' => $posts,
            'featuredPosts' => $featuredPosts,
            'categories' => $categories,
            'currentCategory' => $request->category,
            'searchQuery' => $request->search
        ]);
    }

    /**
     * Affiche un article spécifique
     */
    public function show($slug)
    {
        $post = BlogPost::where('slug', $slug)
            ->published()
            ->with('author')
            ->firstOrFail();

        // Incrémenter les vues
        $post->incrementViews();

        // Articles similaires
        $relatedPosts = BlogPost::published()
            ->where('id', '!=', $post->id)
            ->where('category', $post->category)
            ->take(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at']);

        // Articles récents si pas assez d'articles similaires
        if ($relatedPosts->count() < 3) {
            $recentPosts = BlogPost::published()
                ->where('id', '!=', $post->id)
                ->whereNotIn('id', $relatedPosts->pluck('id'))
                ->latest('published_at')
                ->take(3 - $relatedPosts->count())
                ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at']);
            
            $relatedPosts = $relatedPosts->concat($recentPosts);
        }

        return view('blog.show', [
            'post' => $post,
            'relatedPosts' => $relatedPosts
        ]);
    }

    /**
     * Sitemap XML pour SEO
     */
    public function sitemap()
    {
        $posts = Cache::remember('blog_sitemap', 3600, function () {
            return BlogPost::published()
                ->select(['slug', 'updated_at', 'created_at'])
                ->get();
        });

        return response()->view('blog.sitemap', ['posts' => $posts])
            ->header('Content-Type', 'application/xml');
    }

    /**
     * RSS Feed
     */
    public function rss()
    {
        $posts = Cache::remember('blog_rss', 1800, function () {
            return BlogPost::published()
                ->with('author')
                ->latest('published_at')
                ->take(20)
                ->get();
        });

        return response()->view('blog.rss', ['posts' => $posts])
            ->header('Content-Type', 'application/rss+xml');
    }

    /**
     * API pour recherche
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2'
        ]);

        $results = BlogPost::published()
            ->where(function($query) use ($request) {
                $search = $request->q;
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
            })
            ->select(['id', 'title', 'slug', 'excerpt', 'published_at'])
            ->take(10)
            ->get();

        return response()->json($results);
    }
}
