<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class BlogManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('can:access-admin');
    }

    /**
     * Liste des articles pour l'admin
     */
    public function index(Request $request)
    {
        $query = BlogPost::with('author')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $posts = $query->paginate(20);

        $stats = [
            'total' => BlogPost::count(),
            'published' => BlogPost::where('status', 'published')->count(),
            'draft' => BlogPost::where('status', 'draft')->count(),
            'total_views' => BlogPost::sum('views_count'),
            'avg_seo_score' => BlogPost::avg('seo_score')
        ];

        return Inertia::render('Admin/Blog/Index', [
            'posts' => $posts,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'category'])
        ]);
    }

    /**
     * Créer un nouvel article
     */
    public function create()
    {
        return Inertia::render('Admin/Blog/Create');
    }

    /**
     * Sauvegarder un nouvel article
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'featured_image' => 'nullable|image|max:2048',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'featured' => 'boolean'
        ]);

        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')
                ->store('blog', 'public');
        }

        $validated['author_id'] = auth()->id();

        if ($validated['status'] === 'published' && !$validated['published_at']) {
            $validated['published_at'] = now();
        }

        $post = BlogPost::create($validated);
        $post->calculateSeoScore();

        return redirect()->route('admin.blog.index')
            ->with('success', 'Article créé avec succès');
    }

    /**
     * Afficher un article pour édition
     */
    public function edit(BlogPost $blogPost)
    {
        return Inertia::render('Admin/Blog/Edit', [
            'post' => $blogPost
        ]);
    }

    /**
     * Mettre à jour un article
     */
    public function update(Request $request, BlogPost $blogPost)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string|max:500',
            'content' => 'required|string',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'meta_title' => 'nullable|string|max:60',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
            'featured_image' => 'nullable|image|max:2048',
            'status' => 'required|in:draft,published,scheduled',
            'published_at' => 'nullable|date',
            'featured' => 'boolean'
        ]);

        if ($request->hasFile('featured_image')) {
            // Supprimer l'ancienne image
            if ($blogPost->featured_image) {
                Storage::disk('public')->delete($blogPost->featured_image);
            }
            
            $validated['featured_image'] = $request->file('featured_image')
                ->store('blog', 'public');
        }

        if ($validated['status'] === 'published' && !$validated['published_at']) {
            $validated['published_at'] = now();
        }

        $blogPost->update($validated);
        $blogPost->calculateSeoScore();

        return redirect()->route('admin.blog.index')
            ->with('success', 'Article mis à jour avec succès');
    }

    /**
     * Supprimer un article
     */
    public function destroy(BlogPost $blogPost)
    {
        if ($blogPost->featured_image) {
            Storage::disk('public')->delete($blogPost->featured_image);
        }

        $blogPost->delete();

        return redirect()->route('admin.blog.index')
            ->with('success', 'Article supprimé avec succès');
    }

    /**
     * Statistiques SEO
     */
    public function seoStats()
    {
        $stats = [
            'total_posts' => BlogPost::count(),
            'published_posts' => BlogPost::published()->count(),
            'avg_seo_score' => round(BlogPost::avg('seo_score'), 1),
            'posts_with_good_seo' => BlogPost::where('seo_score', '>=', 80)->count(),
            'total_views' => BlogPost::sum('views_count'),
            'most_viewed' => BlogPost::orderBy('views_count', 'desc')->take(5)->get(['title', 'slug', 'views_count']),
            'recent_posts' => BlogPost::published()->latest('published_at')->take(5)->get(['title', 'slug', 'published_at'])
        ];

        return response()->json($stats);
    }
}