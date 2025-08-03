<?php

namespace App\Services;

class ColorContrastService
{
    /**
     * Calcule la luminosité d'une couleur hexadécimale
     */
    public static function getLuminance($hex)
    {
        // Supprimer le # si présent
        $hex = ltrim($hex, '#');
        
        // Convertir en RGB
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        // Calculer la luminosité relative
        $rs = $r / 255;
        $gs = $g / 255;
        $bs = $b / 255;
        
        $rs = $rs <= 0.03928 ? $rs / 12.92 : pow(($rs + 0.055) / 1.055, 2.4);
        $gs = $gs <= 0.03928 ? $gs / 12.92 : pow(($gs + 0.055) / 1.055, 2.4);
        $bs = $bs <= 0.03928 ? $bs / 12.92 : pow(($bs + 0.055) / 1.055, 2.4);
        
        return 0.2126 * $rs + 0.7152 * $gs + 0.0722 * $bs;
    }
    
    /**
     * Détermine si une couleur est claire
     */
    public static function isLightColor($hex)
    {
        return self::getLuminance($hex) > 0.5;
    }
    
    /**
     * Génère des couleurs de contraste automatiques
     */
    public static function generateContrastColors($primaryColor)
    {
        $isLight = self::isLightColor($primaryColor);
        
        return [
            'textOnPrimary' => $isLight ? '#000000' : '#FFFFFF',
            'textPrimary' => $isLight ? '#2c3e50' : '#ffffff',
            'textSecondary' => $isLight ? '#666666' : '#cccccc',
            'textMuted' => $isLight ? '#999999' : '#aaaaaa',
            'border' => $isLight ? '#e0e0e0' : '#555555',
            'background' => $isLight ? '#f8f9fa' : '#1a1a1a',
            'backgroundSecondary' => $isLight ? '#ffffff' : '#2d2d2d',
            'sidebarBackground' => $isLight ? self::darkenColor($primaryColor, 0.1) : self::lightenColor($primaryColor, 0.1),
            'sidebarText' => $isLight ? '#ffffff' : '#000000'
        ];
    }
    
    /**
     * Assombrit une couleur
     */
    public static function darkenColor($hex, $percent)
    {
        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        $r = max(0, $r - ($r * $percent));
        $g = max(0, $g - ($g * $percent));
        $b = max(0, $b - ($b * $percent));
        
        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }
    
    /**
     * Éclaircit une couleur
     */
    public static function lightenColor($hex, $percent)
    {
        $hex = ltrim($hex, '#');
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        $r = min(255, $r + ((255 - $r) * $percent));
        $g = min(255, $g + ((255 - $g) * $percent));
        $b = min(255, $b + ((255 - $b) * $percent));
        
        return sprintf("#%02x%02x%02x", $r, $g, $b);
    }
    
    /**
     * Génère une couleur d'accent basée sur la couleur primaire
     */
    public static function generateAccentColor($primaryColor)
    {
        $isLight = self::isLightColor($primaryColor);
        
        if ($isLight) {
            return self::darkenColor($primaryColor, 0.2);
        } else {
            return self::lightenColor($primaryColor, 0.3);
        }
    }
}
