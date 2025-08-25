<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Storage;

class PortfolioSeoService
{
    /**
     * Générer automatiquement les meta tags SEO pour un portfolio
     */
    public static function generateSeoData(User $user, array $cvInformation = null): array
    {
        $personalInfo = $cvInformation['personalInformation'] ?? [];
        $name = $personalInfo['firstName'] ?? $user->name;
        $profession = $personalInfo['full_profession'] ?? '';
        
        // Titre SEO automatique
        $seoTitle = self::generateTitle($name, $profession);
        
        // Description SEO automatique
        $seoDescription = self::generateDescription($user, $cvInformation);
        
        // Image Open Graph (photo de profil)
        $ogImage = $personalInfo['photo'] ?? null;
        
        // Keywords automatiques
        $keywords = self::generateKeywords($user, $cvInformation);
        
        return [
            'seo_title' => $seoTitle,
            'seo_description' => $seoDescription,
            'og_image' => $ogImage,
            'keywords' => $keywords,
            'og_type' => 'profile',
            'og_site_name' => 'Job Light Portfolio'
        ];
    }
    
    /**
     * Générer le titre SEO
     */
    private static function generateTitle(string $name, string $profession): string
    {
        if (empty($profession)) {
            return "Portfolio de {$name} | Job Light";
        }
        
        return "{$name} - {$profession} | Portfolio Professionnel";
    }
    
    /**
     * Générer la description SEO
     */
    private static function generateDescription(User $user, ?array $cvInformation): string
    {
        $personalInfo = $cvInformation['personalInformation'] ?? [];
        $name = $personalInfo['firstName'] ?? $user->name;
        $profession = $personalInfo['full_profession'] ?? 'Professionnel';
        
        // Essayer de récupérer un résumé
        $summary = '';
        if (!empty($cvInformation['summaries'])) {
            $summary = strip_tags($cvInformation['summaries'][0]['description'] ?? '');
            $summary = substr($summary, 0, 100) . '...';
        }
        
        // Compter les expériences
        $experienceCount = count($cvInformation['experiences'] ?? []);
        $competenceCount = count($cvInformation['competences'] ?? []);
        
        if (!empty($summary)) {
            return "Découvrez le portfolio de {$name}, {$profession}. {$summary}";
        }
        
        $description = "Portfolio professionnel de {$name}, {$profession}.";
        
        if ($experienceCount > 0) {
            $description .= " {$experienceCount} expérience" . ($experienceCount > 1 ? 's' : '') . " professionnelle" . ($experienceCount > 1 ? 's' : '') . ".";
        }
        
        if ($competenceCount > 0) {
            $description .= " {$competenceCount} compétence" . ($competenceCount > 1 ? 's' : '') . " technique" . ($competenceCount > 1 ? 's' : '') . ".";
        }
        
        return $description;
    }
    
    /**
     * Générer les mots-clés automatiquement
     */
    private static function generateKeywords(User $user, ?array $cvInformation): string
    {
        $keywords = ['portfolio', 'cv', 'professionnel'];
        
        $personalInfo = $cvInformation['personalInformation'] ?? [];
        $name = $personalInfo['firstName'] ?? $user->name;
        
        if ($name) {
            $keywords[] = strtolower($name);
        }
        
        // Ajouter la profession
        if (!empty($personalInfo['full_profession'])) {
            $keywords[] = strtolower($personalInfo['full_profession']);
        }
        
        // Ajouter les compétences (max 5 pour ne pas surcharger)
        $competences = array_slice($cvInformation['competences'] ?? [], 0, 5);
        foreach ($competences as $competence) {
            $keywords[] = strtolower($competence['name']);
        }
        
        // Ajouter les professions (max 2)
        $professions = array_slice($cvInformation['professions'] ?? [], 0, 2);
        foreach ($professions as $profession) {
            $keywords[] = strtolower($profession['name']);
        }
        
        return implode(', ', array_unique($keywords));
    }
    
    /**
     * Générer les données Schema.org
     */
    public static function generateSchemaOrg(User $user, array $cvInformation, string $portfolioUrl): array
    {
        $personalInfo = $cvInformation['personalInformation'] ?? [];
        $seoData = self::generateSeoData($user, $cvInformation);
        
        return [
            "@context" => "https://schema.org",
            "@type" => "Person",
            "name" => $personalInfo['firstName'] ?? $user->name,
            "description" => $seoData['seo_description'],
            "image" => $personalInfo['photo'],
            "url" => $portfolioUrl,
            "jobTitle" => $personalInfo['full_profession'],
            "email" => $personalInfo['email'] ?? $user->email,
            "telephone" => $personalInfo['phone'],
            "address" => $personalInfo['address'],
            "sameAs" => array_filter([
                $personalInfo['linkedin'],
                $personalInfo['github']
            ])
        ];
    }
}