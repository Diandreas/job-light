<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PortfolioSettings;
use App\Models\PortfolioSection;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PortfolioController extends Controller
{
    public function index()
    {
        return Inertia::render('Portfolio/Index');
    }

    public function show($identifier)
    {
        $user = User::where('username', $identifier)
            ->orWhere('email', $identifier)
            ->firstOrFail();

        $portfolio = $this->getPortfolioData($user);
//dd($portfolio);
        $responseData = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'phone' => $user->phone_number,
                'address' => $user->address,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                'photo' => $user->photo ? Storage::url($user->photo) : null,
                'full_profession' => $user->full_profession,
            ],
            'portfolio' => $portfolio,
            'identifier' => $user->identifier,
            'settings' => $portfolio['settings'] ?? [],
            'cvData' => $portfolio,
            'orderedSections' => self::getOrderedSections($portfolio),
        ];
        
        // Debug logging
        Log::info('Portfolio Show Response Data:', $responseData);
        
        return Inertia::render('Portfolio/Show', $responseData);
    }

    public function edit()
    {
        $user = auth()->user();
        $portfolio = $this->getPortfolioData($user);
        $settings = $user->portfolioSettings ?? new PortfolioSettings();
        $customSections = $user->portfolioSections()->activeOrdered()->get();

        return Inertia::render('Portfolio/EditClean', [
            'portfolio' => $portfolio,
            'settings' => $settings,
            'customSections' => $customSections,
            'services' => $user->services()->with('images')->ordered()->get(),
            'availableTypes' => PortfolioSection::getAvailableTypes(),
            'availableIcons' => PortfolioSection::getDefaultIcons(),
            'availableFonts' => PortfolioSettings::getAvailableFonts(),
            'availableHeaderStyles' => PortfolioSettings::getAvailableHeaderStyles(),
            'groupedSections' => self::getGroupedSections($portfolio),
        ]);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        // Validation améliorée
        $request->validate([
            'design' => 'required|in:professional,creative,minimal,modern,glassmorphism,neon_cyber,elegant_corporate,artistic_showcase,dynamic_tech,glass,neon,particle,wave,morphing',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'background_color' => 'nullable|string|max:7',
            'text_color' => 'nullable|string|max:7',
            'font_family' => 'nullable|string|max:50',
            'border_radius' => 'nullable|integer|min:0|max:50',
            'show_animations' => 'boolean',
            'header_style' => 'nullable|in:default,minimal,centered,modern',
            'show_social_links' => 'boolean',
            'show_experiences' => 'boolean',
            'show_competences' => 'boolean',
            'show_hobbies' => 'boolean',
            'show_summary' => 'boolean',
            'show_contact_info' => 'boolean',
            'show_languages' => 'boolean',
            'show_contact_form' => 'boolean',
            'show_services' => 'boolean',
            'currency' => 'nullable|string|max:10',
            'section_order' => 'nullable|array',
            'layout_columns' => 'nullable|in:1,2,3',
            'division_style' => 'nullable|in:moderne,soft,minimalist,creative,corporate',
            'banner_image' => 'nullable|image|max:10240', // 10MB Max
            'banner_position' => 'nullable|in:top,behind_text,overlay',
            'bio' => 'nullable|string|max:1000',
            'tagline' => 'nullable|string|max:200',
            'social_links' => 'nullable|array',
            'seo_title' => 'nullable|string|max:100',
            'seo_description' => 'nullable|string|max:300',
            'custom_css' => 'nullable|string|max:10000',
        ]);

        // Gérer l'upload de la bannière
        $bannerPath = null;
        if ($request->hasFile('banner_image')) {
            $bannerPath = $request->file('banner_image')->store('portfolio/banners', 'public');
        }

        $updateData = $request->only([
            'design',
            'primary_color',
            'secondary_color',
            'background_color',
            'text_color',
            'font_family',
            'border_radius',
            'show_animations',
            'header_style',
            'show_social_links',
            'show_experiences',
            'show_competences',
            'show_hobbies',
            'show_summary',
            'show_contact_info',
            'show_languages',
            'show_contact_form',
            'show_services',
            'currency',
            'section_order',
            'layout_columns',
            'division_style',
            'banner_position',
            'bio',
            'tagline',
            'social_links',
            'seo_title',
            'seo_description',
            'custom_css',
        ]);

        if ($bannerPath) {
            $updateData['banner_image'] = $bannerPath;
        }

        // Update portfolio settings
        $user->portfolioSettings()->updateOrCreate(
            ['user_id' => $user->id],
            $updateData
        );

        return redirect()->route('portfolio.edit')->with('success', 'Portfolio mis à jour avec succès.');
    }

    public function createSection(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'content' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'background_color' => 'nullable|string|max:7',
            'text_color' => 'nullable|string|max:7',
            'settings' => 'nullable|array',
        ]);

        $user = auth()->user();
        $maxOrder = $user->portfolioSections()->max('order_index') ?? 0;

        $section = $user->portfolioSections()->create([
            'title' => $request->title,
            'type' => $request->type,
            'content' => $request->content,
            'icon' => $request->icon,
            'background_color' => $request->background_color,
            'text_color' => $request->text_color,
            'settings' => $request->settings,
            'order_index' => $maxOrder + 1,
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'section' => $section,
            'message' => 'Section créée avec succès.'
        ]);
    }

    public function updateSection(Request $request, PortfolioSection $section)
    {
        // Vérifier que la section appartient à l'utilisateur connecté
        if ($section->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'content' => 'nullable|string',
            'icon' => 'nullable|string|max:50',
            'background_color' => 'nullable|string|max:7',
            'text_color' => 'nullable|string|max:7',
            'settings' => 'nullable|array',
        ]);

        $section->update($request->only([
            'title', 'type', 'content', 'icon', 
            'background_color', 'text_color', 'settings'
        ]));

        return response()->json([
            'success' => true,
            'section' => $section,
            'message' => 'Section mise à jour avec succès.'
        ]);
    }

    public function deleteSection(PortfolioSection $section)
    {
        // Vérifier que la section appartient à l'utilisateur connecté
        if ($section->user_id !== auth()->id()) {
            abort(403);
        }

        $section->delete();

        return response()->json([
            'success' => true,
            'message' => 'Section supprimée avec succès.'
        ]);
    }

    public function toggleSectionActive(Request $request, PortfolioSection $section)
    {
        // Vérifier que la section appartient à l'utilisateur connecté
        if ($section->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $section->update(['is_active' => $request->is_active]);

        return response()->json([
            'success' => true,
            'section' => $section,
            'message' => 'Visibilité de la section mise à jour.'
        ]);
    }

    public function updateSectionOrder(Request $request)
    {
        $request->validate([
            'sections' => 'required|array',
            'sections.*.id' => 'required|integer|exists:portfolio_sections,id',
            'sections.*.order_index' => 'required|integer',
        ]);

        $user = auth()->user();
        
        foreach ($request->sections as $sectionData) {
            $section = PortfolioSection::where('id', $sectionData['id'])
                                     ->where('user_id', $user->id)
                                     ->first();
            
            if ($section) {
                $section->update(['order_index' => $sectionData['order_index']]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Ordre des sections mis à jour.'
        ]);
    }

    private function getPortfolioData($user)
    {
        $settings = $user->portfolioSettings ?? $this->createDefaultSettings($user);

        return [
            'personalInfo' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'phone' => $user->phone_number,
                'address' => $user->address,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
                'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                'photo' => $user->photo ? Storage::url($user->photo) : null,
                'title' => $user->full_profession,
            ],
            'experiences' => $settings->show_experiences ? $user->experiences()
                ->with('references')
                ->join('experience_categories', 'experiences.experience_categories_id', '=', 'experience_categories.id')
                ->leftJoin('attachments', 'experiences.attachment_id', '=', 'attachments.id')
                ->select([
                    'experiences.*',
                    'experience_categories.name as category_name',
                    'experience_categories.name_en as category_name_en',
                    'experience_categories.ranking as category_ranking',
                    DB::raw('COALESCE(attachments.name, NULL) as attachment_name'),
                    DB::raw('CASE WHEN attachments.path IS NOT NULL THEN CONCAT("/storage/", attachments.path) ELSE NULL END as attachment_path'),
                    DB::raw('COALESCE(attachments.format, NULL) as attachment_format'),
                    DB::raw('COALESCE(attachments.size, NULL) as attachment_size')
                ])
                ->orderBy('experience_categories.ranking', 'asc')
                ->orderBy('experiences.date_start', 'desc')
                ->get()
                ->map(function ($experience) {
                    $experienceArray = $experience->toArray();
                    $experienceArray['references'] = $experience->references->map(function ($reference) {
                        return [
                            'id' => $reference->id,
                            'name' => $reference->name ?? '',
                            'function' => $reference->function ?? '',
                            'email' => $reference->email ?? '',
                            'telephone' => $reference->telephone ?? ''
                        ];
                    })->toArray();
                    return $experienceArray;
                })
                ->toArray() : [],
            'competences' => $settings->show_competences ? array_merge(
                $user->competences()->get()->toArray(),
                collect($user->manual_competences ?? [])->filter()->map(function($name) {
                    return [
                        'id' => 'manual_' . md5(is_string($name) ? $name : json_encode($name)),
                        'name' => is_string($name) ? $name : (is_array($name) ? ($name['name'] ?? '') : ''),
                        'is_manual' => true
                    ];
                })->toArray()
            ) : [],
            'hobbies' => $settings->show_hobbies ? array_merge(
                $user->hobbies()->get()->toArray(),
                collect($user->manual_hobbies ?? [])->filter()->map(function($name) {
                    return [
                        'id' => 'manual_' . md5(is_string($name) ? $name : json_encode($name)),
                        'name' => is_string($name) ? $name : (is_array($name) ? ($name['name'] ?? '') : ''),
                        'is_manual' => true
                    ];
                })->toArray()
            ) : [],
            'summary' => $settings->show_summary ? ($user->selected_summary ? $user->selected_summary->toArray() : null) : null,
            'customSections' => $user->portfolioSections()->activeOrdered()->get()->toArray(),
            'professions' => $user->profession()->take(2)->get()->toArray(),
            
            // Nouvelles données toujours disponibles  
            'languages' => $user->languages()
                ->select(['languages.id', 'languages.name', 'languages.name_en'])
                ->withPivot('language_level')
                ->get()
                ->map(function ($language) {
                    return [
                        'id' => $language->id,
                        'name' => $language->name,
                        'name_en' => $language->name_en,
                        'pivot' => [
                            'language_level' => $language->pivot->language_level ?? null
                        ]
                    ];
                })
                ->toArray(),
            'summaries' => $user->summaries()->get()->toArray(),
            
            // Settings de style
            'settings' => $settings->toArray(),
            'design' => $settings->design,
            'primary_color' => $settings->primary_color,
            'secondary_color' => $settings->secondary_color,
            'background_color' => $settings->background_color,
            'text_color' => $settings->text_color,
            'font_family' => $settings->font_family,
            'border_radius' => $settings->border_radius,
            'show_animations' => $settings->show_animations,
            'header_style' => $settings->header_style,
            'show_social_links' => $settings->show_social_links,
            
            // Settings de sections
            'show_contact_info' => $settings->show_contact_info,
            'show_experiences' => $settings->show_experiences,
            'show_competences' => $settings->show_competences,
            'show_hobbies' => $settings->show_hobbies,
            'show_summary' => $settings->show_summary,
            'show_languages' => $settings->show_languages ?? true,
            
            // Services (seulement si activés dans les paramètres)
            'services' => $settings->show_services ? $user->services()->active()->with('images')->get()->toArray() : [],
            
            // Ordre des sections pour l'affichage
            'section_order' => $settings->section_order ?? [],
        ];
    }

    private function createDefaultSettings($user)
    {
        return $user->portfolioSettings()->create([
            'design' => 'professional',
            'primary_color' => '#f59e0b',
            'secondary_color' => '#8b5cf6',
            'background_color' => '#ffffff',
            'text_color' => '#1f2937',
            'font_family' => 'Inter',
            'border_radius' => 8,
            'show_animations' => true,
            'header_style' => 'default',
            'show_social_links' => true,
            'show_experiences' => true,
            'show_competences' => true,
            'show_hobbies' => true,
            'show_summary' => true,
            'show_contact_info' => true,
            'show_languages' => true,
            'show_services' => false,
            'currency' => '€',
        ]);
    }

    /**
     * Organise les sections du portfolio selon l'ordre défini
     */
    public static function getOrderedSections($portfolioData)
    {
        $sectionOrder = $portfolioData['section_order'] ?? [];
        
        $sections = [
            'experiences' => [
                'key' => 'experiences',
                'data' => $portfolioData['experiences'] ?? [],
                'visible' => $portfolioData['show_experiences'] ?? true,
                'title' => 'Expériences'
            ],
            'competences' => [
                'key' => 'competences',
                'data' => $portfolioData['competences'] ?? [],
                'visible' => $portfolioData['show_competences'] ?? true,
                'title' => 'Compétences'
            ],
            'hobbies' => [
                'key' => 'hobbies',
                'data' => $portfolioData['hobbies'] ?? [],
                'visible' => $portfolioData['show_hobbies'] ?? true,
                'title' => 'Centres d\'intérêt'
            ],
            'languages' => [
                'key' => 'languages',
                'data' => $portfolioData['languages'] ?? [],
                'visible' => $portfolioData['show_languages'] ?? true,
                'title' => 'Langues'
            ],
            'summary' => [
                'key' => 'summary',
                'data' => $portfolioData['summary'] ?? null,
                'visible' => $portfolioData['show_summary'] ?? true,
                'title' => 'Résumé'
            ],
            'contact_info' => [
                'key' => 'contact_info',
                'data' => $portfolioData['personalInfo'] ?? [],
                'visible' => $portfolioData['show_contact_info'] ?? true,
                'title' => 'Contact'
            ],
            'services' => [
                'key' => 'services',
                'data' => $portfolioData['services'] ?? [],
                'visible' => $portfolioData['show_services'] ?? false,
                'title' => 'Services'
            ]
        ];

        // Trier selon l'ordre défini
        $orderedSections = [];
        
        // D'abord, ajouter les sections dans l'ordre défini
        foreach ($sectionOrder as $sectionKey => $order) {
            if (isset($sections[$sectionKey]) && $sections[$sectionKey]['visible']) {
                $orderedSections[$order] = $sections[$sectionKey];
            }
        }
        
        // Ensuite, ajouter les sections non ordonnées à la fin
        foreach ($sections as $key => $section) {
            if (!array_key_exists($key, $sectionOrder) && $section['visible']) {
                $orderedSections[9999 + array_search($key, array_keys($sections))] = $section;
            }
        }
        
        // Trier par clé (ordre)
        ksort($orderedSections);
        
        return array_values($orderedSections);
    }

    public static function getSectionGroups($portfolioData)
    {
        // Définition des groupes de sections par défaut
        $defaultGroups = [
            'identity' => [
                'label' => 'Identité',
                'description' => 'Informations de base toujours affichées en premier',
                'sections' => ['contact_info'],
                'position' => 'header' // toujours en premier
            ],
            'professional' => [
                'label' => 'Professionnel', 
                'description' => 'Contenu principal de votre portfolio',
                'sections' => ['experiences'],
                'position' => 'main' // zone principale
            ],
            'services_special' => [
                'label' => 'Services',
                'description' => 'Section indépendante pour vos services',
                'sections' => ['services'],
                'position' => 'special' // zone spéciale
            ],
            'summary_special' => [
                'label' => 'Résumé',
                'description' => 'Votre présentation personnelle', 
                'sections' => ['summary'],
                'position' => 'special' // zone spéciale
            ],
            'personal' => [
                'label' => 'Personnel',
                'description' => 'Informations complémentaires et compétences',
                'sections' => ['competences', 'languages', 'hobbies'],
                'position' => 'sidebar' // sidebar ou zone secondaire
            ]
        ];

        // Récupérer les groupes personnalisés depuis les settings ou utiliser les défauts
        $settings = $portfolioData['settings'] ?? [];
        $customGroups = $settings['section_groups'] ?? [];

        // Fusionner avec les groupes par défaut
        return array_merge($defaultGroups, $customGroups);
    }

    public static function getGroupedSections($portfolioData)
    {
        $sections = self::getOrderedSections($portfolioData);
        $groups = self::getSectionGroups($portfolioData);
        
        $groupedSections = [];
        
        foreach ($groups as $groupKey => $group) {
            $groupedSections[$groupKey] = [
                'label' => $group['label'],
                'description' => $group['description'],
                'position' => $group['position'],
                'sections' => []
            ];
            
            // Ajouter les sections correspondantes au groupe
            foreach ($sections as $section) {
                if (in_array($section['key'], $group['sections'])) {
                    // Mapper les données de la section avec les données du portfolio
                    $mappedSection = [
                        'key' => $section['key'],
                        'label' => $section['title'],
                        'count' => $section['count'] ?? 0,
                        'isActive' => $section['visible'] ?? false,
                        'data' => $section['data'] ?? []
                    ];
                    
                    $groupedSections[$groupKey]['sections'][] = $mappedSection;
                }
            }
        }
        
        return $groupedSections;
    }
}
