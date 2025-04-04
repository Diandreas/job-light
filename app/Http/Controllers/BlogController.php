<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    /**
     * Affiche la liste des articles de blog
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Liste des articles de blog
        $blogs = [
            [
                'id' => 1,
                'title' => 'Comparaison des générateurs de CV',
                'slug' => 'comparaison-generateurs-cv',
                'description' => 'Découvrez les avantages de Guidy par rapport aux autres générateurs de CV du marché.',
                'image' => asset('cvs.png'),
                'date' => '2024-06-01',
                'route' => route('blog.comparaison-autonome')
            ],
            // [
            //     'id' => 2,
            //     'title' => 'Comment créer un CV efficace',
            //     'slug' => 'creer-cv-efficace',
            //     'description' => 'Conseils pratiques pour créer un CV qui se démarque et attire l\'attention des recruteurs.',
            //     'image' => asset('images/blog/cv-efficace.jpg'),
            //     'date' => '2024-05-15',
            //     'route' => '#' // À remplacer par la route réelle quand l'article sera créé
            // ]
        ];

        return Inertia::render('Blog/Index', [
            'blogs' => $blogs
        ]);
    }
}
