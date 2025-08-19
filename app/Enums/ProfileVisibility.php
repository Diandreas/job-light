<?php

namespace App\Enums;

enum /ProfileVisibility: string
{
    case PRIVATE = 'private';
    case COMPANY_PORTAL = 'company_portal';
    case COMMUNITY = 'community';
    case PUBLIC = 'public';

    public function label(): string
    {
        return match($this) {
            self::PRIVATE => 'Privé',
            self::COMPANY_PORTAL => 'Portail Entreprise',
            self::COMMUNITY => 'Communauté',
            self::PUBLIC => 'Public',
        };
    }

    public function description(): string
    {
        return match($this) {
            self::PRIVATE => 'Profil visible uniquement par vous. Idéal pour générer votre CV en toute discrétion.',
            self::COMPANY_PORTAL => 'Visible uniquement aux entreprises enregistrées. Parfait pour les opportunités d\'emploi.',
            self::COMMUNITY => 'Visible par tous les utilisateurs de la plateforme. Idéal pour les collaborations entre professionnels.',
            self::PUBLIC => 'Visible par tous sur internet. Maximum de visibilité comme un portfolio public.',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::PRIVATE => '🔒',
            self::COMPANY_PORTAL => '🏢',
            self::COMMUNITY => '👥',
            self::PUBLIC => '🌐',
        };
    }

    public static function options(): array
    {
        return array_map(
            fn($case) => [
                'value' => $case->value,
                'label' => $case->label(),
                'description' => $case->description(),
                'icon' => $case->icon(),
            ],
            self::cases()
        );
    }
}
