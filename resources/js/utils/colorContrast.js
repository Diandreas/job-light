// Fonction pour calculer la luminosité d'une couleur hexadécimale
function getLuminance(hex) {
    // Convertir hex en RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculer la luminosité relative
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Fonction pour déterminer si une couleur est claire ou foncée
function isLightColor(hex) {
    return getLuminance(hex) > 0.5;
}

// Fonction pour générer des couleurs de contraste automatiques
function generateContrastColors(primaryColor) {
    const isLight = isLightColor(primaryColor);

    return {
        textOnPrimary: isLight ? '#000000' : '#FFFFFF',
        textPrimary: isLight ? '#2c3e50' : '#ffffff',
        textSecondary: isLight ? '#666666' : '#cccccc',
        textMuted: isLight ? '#999999' : '#aaaaaa',
        border: isLight ? '#e0e0e0' : '#555555',
        background: isLight ? '#f8f9fa' : '#1a1a1a',
        backgroundSecondary: isLight ? '#ffffff' : '#2d2d2d'
    };
}

// Fonction pour appliquer les couleurs de contraste
function applyContrastColors(primaryColor) {
    const colors = generateContrastColors(primaryColor);

    // Créer les variables CSS dynamiques
    const root = document.documentElement;
    root.style.setProperty('--text-on-primary', colors.textOnPrimary);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--border-color', colors.border);
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--background-secondary', colors.backgroundSecondary);
}

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getLuminance,
        isLightColor,
        generateContrastColors,
        applyContrastColors
    };
}
