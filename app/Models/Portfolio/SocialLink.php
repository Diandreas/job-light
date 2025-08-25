<?php

namespace App\Models\Portfolio;

/**
 * Classe helper pour gérer les liens sociaux du portfolio
 */
class SocialLink
{
    public string $platform;
    public string $url;
    public string $label;
    public string $icon;
    public string $color;

    public function __construct(string $platform, string $url, string $label = '')
    {
        $this->platform = $platform;
        $this->url = $url;
        $this->label = $label ?: $this->getDefaultLabel($platform);
        $this->icon = $this->getDefaultIcon($platform);
        $this->color = $this->getDefaultColor($platform);
    }

    /**
     * Plateformes sociales supportées
     */
    public static function getSupportedPlatforms(): array
    {
        return [
            'linkedin' => [
                'label' => 'LinkedIn',
                'icon' => 'linkedin',
                'color' => 'bg-blue-600',
                'placeholder' => 'https://linkedin.com/in/votre-profil'
            ],
            'github' => [
                'label' => 'GitHub',
                'icon' => 'github',
                'color' => 'bg-gray-800',
                'placeholder' => 'https://github.com/votre-username'
            ],
            'twitter' => [
                'label' => 'Twitter/X',
                'icon' => 'twitter',
                'color' => 'bg-black',
                'placeholder' => 'https://x.com/votre-username'
            ],
            'email' => [
                'label' => 'Email',
                'icon' => 'mail',
                'color' => 'bg-green-600',
                'placeholder' => 'votre.email@exemple.com'
            ],
            'website' => [
                'label' => 'Site Web',
                'icon' => 'globe',
                'color' => 'bg-purple-600',
                'placeholder' => 'https://votre-site.com'
            ]
        ];
    }

    /**
     * Créer depuis les données du CV
     */
    public static function createFromCvData(array $personalInfo): array
    {
        $links = [];
        
        if (!empty($personalInfo['linkedin'])) {
            $links[] = new self('linkedin', $personalInfo['linkedin']);
        }
        
        if (!empty($personalInfo['github'])) {
            $links[] = new self('github', $personalInfo['github']);
        }
        
        if (!empty($personalInfo['email'])) {
            $links[] = new self('email', 'mailto:' . $personalInfo['email']);
        }

        return $links;
    }

    /**
     * Valider une URL de réseau social
     */
    public static function validateUrl(string $platform, string $url): bool
    {
        $patterns = [
            'linkedin' => '/^https:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/',
            'github' => '/^https:\/\/(www\.)?github\.com\/[\w\-]+\/?$/',
            'twitter' => '/^https:\/\/(www\.)?(twitter\.com|x\.com)\/[\w\-]+\/?$/',
            'email' => '/^[^\s@]+@[^\s@]+\.[^\s@]+$/',
        ];

        if ($platform === 'website') {
            return filter_var($url, FILTER_VALIDATE_URL) !== false;
        }

        if ($platform === 'email') {
            return filter_var($url, FILTER_VALIDATE_EMAIL) !== false;
        }

        return isset($patterns[$platform]) && preg_match($patterns[$platform], $url);
    }

    private function getDefaultLabel(string $platform): string
    {
        $platforms = self::getSupportedPlatforms();
        return $platforms[$platform]['label'] ?? ucfirst($platform);
    }

    private function getDefaultIcon(string $platform): string
    {
        $platforms = self::getSupportedPlatforms();
        return $platforms[$platform]['icon'] ?? 'globe';
    }

    private function getDefaultColor(string $platform): string
    {
        $platforms = self::getSupportedPlatforms();
        return $platforms[$platform]['color'] ?? 'bg-gray-600';
    }

    public function toArray(): array
    {
        return [
            'platform' => $this->platform,
            'url' => $this->url,
            'label' => $this->label,
            'icon' => $this->icon,
            'color' => $this->color,
        ];
    }
}