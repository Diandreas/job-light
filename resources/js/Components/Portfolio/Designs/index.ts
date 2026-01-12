// Portfolio Design Components
import ProfessionalDesign from './ProfessionalDesign';
import CreativeDesign from './CreativeDesign';
import MinimalDesign from './MinimalDesign';
import ModernDesign from './ModernDesign';
import GlassmorphismDesign from './GlassmorphismDesign';
import NeonCyberDesign from './NeonCyberDesign';
import ElegantCorporateDesign from './ElegantCorporateDesign';
import ArtisticShowcaseDesign from './ArtisticShowcaseDesign';
import DynamicTechDesign from './DynamicTechDesign';
import GlassDesign from './GlassDesign';
import NeonDesign from './NeonDesign';
import ParticleDesign from './ParticleDesign';
import WaveDesign from './WaveDesign';
import MorphingDesign from './MorphingDesign';
import NeumorphismDesign from './NeumorphismDesign';

// Export all designs
export {
    ProfessionalDesign,
    CreativeDesign,
    MinimalDesign,
    ModernDesign,
    GlassmorphismDesign,
    NeonCyberDesign,
    ElegantCorporateDesign,
    ArtisticShowcaseDesign,
    DynamicTechDesign,
    GlassDesign,
    NeonDesign,
    WaveDesign,
    MorphingDesign,
    NeumorphismDesign
};

// Design mapping for dynamic imports
export const PORTFOLIO_DESIGNS = {
    professional: ProfessionalDesign,
    creative: CreativeDesign,
    minimal: MinimalDesign,
    modern: ModernDesign,
    glassmorphism: GlassmorphismDesign,
    neon_cyber: NeonCyberDesign,
    elegant_corporate: ElegantCorporateDesign,
    artistic_showcase: ArtisticShowcaseDesign,
    dynamic_tech: DynamicTechDesign,
    glass: GlassDesign,
    neon: NeonDesign,
    particle: ParticleDesign,
    wave: WaveDesign,
    morphing: MorphingDesign,
    neumorphism: NeumorphismDesign
} as const;

// Design metadata
export const DESIGN_METADATA = {
    professional: {
        name: 'Professionnel',
        description: 'Design épuré et moderne, parfait pour les secteurs corporate',
        preview: '/images/designs/professional-preview.png',
        features: ['Layout propre', 'Typographie élégante', 'Photo de profil intégrée', 'Toutes expériences affichées'],
        colors: ['#0f172a', '#1e293b', '#334155'],
        icon: '💼'
    },
    creative: {
        name: 'Créatif',
        description: 'Design vibrant avec animations et effets visuels pour les créatifs',
        preview: '/images/designs/creative-preview.png',
        features: ['Animations fluides', 'Timeline interactive', 'Effets de hover', 'Gradient dynamiques'],
        colors: ['#f59e0b', '#8b5cf6', '#ef4444'],
        icon: '🎨'
    },
    minimal: {
        name: 'Minimaliste',
        description: 'Design épuré et simple, focus sur le contenu essentiel',
        preview: '/images/designs/minimal-preview.png',
        features: ['Design clean', 'Typographie raffinée', 'Espace optimisé', 'Lisibilité maximale'],
        colors: ['#000000', '#374151', '#6b7280'],
        icon: '✨'
    },
    modern: {
        name: 'Moderne',
        description: 'Design futuriste avec effets glassmorphism et animations avancées',
        preview: '/images/designs/modern-preview.png',
        features: ['Effets glassmorphism', 'Parallax scrolling', 'Animations complexes', 'Design immersif'],
        colors: ['#3b82f6', '#8b5cf6', '#1e40af'],
        icon: '🚀'
    },
    glassmorphism: {
        name: 'Glassmorphism',
        description: 'Design cristallin avec effets de verre et particules flottantes animées',
        preview: '/images/designs/glassmorphism-preview.png',
        features: ['Effets glassmorphism', 'Particules animées', 'Cartes transparentes', 'Timeline élégante'],
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
        icon: '🔮'
    },
    neon_cyber: {
        name: 'Neon Cyber',
        description: 'Thème cyberpunk futuriste avec néons et effets de glitch',
        preview: '/images/designs/neon-cyber-preview.png',
        features: ['Effets néons', 'Glitch text', 'Terminal styling', 'Grille cyberpunk'],
        colors: ['#00ffff', '#ff00ff', '#ffff00'],
        icon: '🌐'
    },
    elegant_corporate: {
        name: 'Élégant Corporate',
        description: 'Design corporate sophistiqué avec animations élégantes et counters',
        preview: '/images/designs/elegant-corporate-preview.png',
        features: ['Timeline professionnelle', 'Compteurs animés', 'Cartes élégantes', 'Effets parallax'],
        colors: ['#6366f1', '#8b5cf6', '#ec4899'],
        icon: '🏢'
    },
    artistic_showcase: {
        name: 'Showcase Artistique',
        description: 'Portfolio créatif avec layout masonry et effets de peinture',
        preview: '/images/designs/artistic-showcase-preview.png',
        features: ['Layout masonry', 'Effets peinture', 'Curseur personnalisé', 'Animations créatives'],
        colors: ['#f56565', '#48bb78', '#4299e1'],
        icon: '🎭'
    },
    dynamic_tech: {
        name: 'Tech Dynamique',
        description: 'Interface technologique avec circuits interactifs et tableaux de bord',
        preview: '/images/designs/dynamic-tech-preview.png',
        features: ['Circuit board animé', 'Dashboard interactif', 'Cubes 3D', 'Stats temps réel'],
        colors: ['#22c55e', '#06b6d4', '#8b5cf6'],
        icon: '⚡'
    },
    glass: {
        name: 'Crystal Glass',
        description: 'Design sophistiqué avec effets de verre cristallin et particules flottantes',
        preview: '/images/designs/glass-preview.png',
        features: ['Glassmorphism avancé', 'Particules flottantes', 'Effets de lumière', 'Animations 3D'],
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
        icon: '💎'
    },
    neon: {
        name: 'Neon Futuriste',
        description: 'Interface cyberpunk avec effets néon et animations de glitch',
        preview: '/images/designs/neon-preview.png',
        features: ['Terminal interactif', 'Effets glitch', 'Néons animés', 'Scanlines'],
        colors: ['#00ffff', '#ff00ff', '#ffff00'],
        icon: '🌈'
    },
    particle: {
        name: 'Particule Cosmique',
        description: 'Univers galactique avec système de particules et orbites animées',
        preview: '/images/designs/particle-preview.png',
        features: ['Particules flottantes', 'Orbites animées', 'Mesh gradient', 'Effets spatiaux'],
        colors: ['#8b5cf6', '#ec4899', '#3b82f6'],
        icon: '✨'
    },
    wave: {
        name: 'Ocean Wave',
        description: 'Thème océanique avec vagues fluides et effets aquatiques',
        preview: '/images/designs/wave-preview.png',
        features: ['Vagues SVG animées', 'Effets aquatiques', 'Bulles flottantes', 'Parallax océan'],
        colors: ['#0ea5e9', '#3b82f6', '#8b5cf6'],
        icon: '🌊'
    },
    morphing: {
        name: 'Morphing Fluide',
        description: 'Design évolutif avec formes morphing et transitions liquides',
        preview: '/images/designs/morphing-preview.png',
        features: ['Formes morphing', 'Background fluide', 'Transitions liquides', 'Géométrie évolutive'],
        colors: ['#ff006e', '#3a86ff', '#06ffa5'],
        icon: '🔮'
    },
    neumorphism: {
        name: 'Neumorphism',
        description: 'Design doux avec ombres réalistes et effets de profondeur',
        preview: '/images/designs/neumorphism-preview.png',
        features: ['Ombres douces', 'Cartes en relief', 'Design épuré', 'Look tactile'],
        colors: ['#e0e5ec', '#4a5568', '#a3b1c6'],
        icon: '☁️'
    },
};

// Types
export type DesignType = keyof typeof PORTFOLIO_DESIGNS;

export interface DesignProps {
    user: any;
    cvData: any;
    settings: any;
    isPreview?: boolean;
}

// Helper function to get design component
export function getDesignComponent(designType: string) {
    return PORTFOLIO_DESIGNS[designType as DesignType] || ProfessionalDesign;
}

// Helper function to get design metadata
export function getDesignMetadata(designType: string) {
    return DESIGN_METADATA[designType as DesignType] || DESIGN_METADATA.professional;
}