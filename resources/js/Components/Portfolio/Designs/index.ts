// Portfolio Design Components
import ProfessionalDesign from './ProfessionalDesign';
import CreativeDesign from './CreativeDesign';
import MinimalDesign from './MinimalDesign';
import ModernDesign from './ModernDesign';
import CustomDesign from './CustomDesign';

// Export all designs
export {
    ProfessionalDesign,
    CreativeDesign,
    MinimalDesign,
    ModernDesign,
    CustomDesign
};

// Design mapping for dynamic imports
export const PORTFOLIO_DESIGNS = {
    professional: ProfessionalDesign,
    creative: CreativeDesign,
    minimal: MinimalDesign,
    modern: ModernDesign,
    custom: CustomDesign
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
    custom: {
        name: 'Personnalisé',
        description: 'Design entièrement customisable avec drag & drop des sections',
        preview: '/images/designs/custom-preview.png',
        features: ['Drag & Drop sections', 'Ordre personnalisé', 'Mode édition live', 'Contrôle total'],
        colors: ['#3b82f6', '#059669', '#7c3aed'],
        icon: '🎯'
    }
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