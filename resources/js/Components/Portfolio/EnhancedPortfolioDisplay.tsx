import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { 
    User, GraduationCap, Briefcase, Heart, Mail, Phone, MapPin, 
    Github, Linkedin, FileText, Eye, ExternalLink, Award, Globe,
    Star, MessageSquare, FolderOpen, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/Components/ui/dialog";
import { cn } from "@/lib/utils";

// Icônes disponibles pour les sections
const availableIcons = {
    User, GraduationCap, Briefcase, Heart, Mail, Phone, MapPin,
    Github, Linkedin, FileText, Eye, ExternalLink, Award, Globe,
    Star, MessageSquare, FolderOpen, Edit
};

interface PortfolioLayoutProps {
    children: React.ReactNode;
    settings: any;
}

const EnhancedPortfolioLayout = ({ children, settings }: PortfolioLayoutProps) => {
    const getBackgroundStyle = () => {
        if (settings.design === 'modern') {
            return {
                background: `linear-gradient(135deg, ${settings.primary_color}20 0%, ${settings.secondary_color}20 100%)`,
                minHeight: '100vh'
            };
        }
        
        return {
            backgroundColor: settings.background_color || '#ffffff',
            color: settings.text_color || '#1f2937',
            minHeight: '100vh'
        };
    };

    const getFontFamily = () => {
        const fonts = {
            'Inter': 'font-sans',
            'Roboto': 'font-sans',
            'Open Sans': 'font-sans',
            'Poppins': 'font-sans',
            'Montserrat': 'font-sans',
            'Lato': 'font-sans',
            'Nunito': 'font-sans',
            'Source Sans Pro': 'font-sans'
        };
        return fonts[settings.font_family] || 'font-sans';
    };

    const getContainerClass = () => {
        const base = "container mx-auto py-6 px-4";
        const maxWidth = settings.design === 'minimal' ? 'max-w-4xl' : 'max-w-7xl';
        return `${base} ${maxWidth}`;
    };

    return (
        <div 
            className={cn(getFontFamily(), "transition-all duration-300")}
            style={getBackgroundStyle()}
        >
            <main className={getContainerClass()}>
                {children}
            </main>
        </div>
    );
};

interface SectionProps {
    title: string;
    icon: keyof typeof availableIcons;
    children: React.ReactNode;
    settings: any;
    sectionSettings?: any;
}

const EnhancedSection = ({ title, icon, children, settings, sectionSettings }: SectionProps) => {
    const IconComponent = availableIcons[icon] || User;
    
    const getSectionStyle = () => {
        const baseStyles = "mb-6 transition-all duration-300";
        
        // Styles basés sur le design choisi
        const designStyles = {
            intuitive: "bg-white shadow-lg rounded-lg p-6 hover:shadow-xl hover:scale-105 transform",
            professional: "bg-white shadow rounded-lg p-6",
            "user-friendly": "bg-white shadow-md rounded-2xl p-6 border-2 hover:border-opacity-100 transition-colors",
            modern: "bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl border border-white/20"
        };

        const borderRadius = settings.border_radius ? `${settings.border_radius}px` : '0.5rem';
        
        return {
            className: cn(baseStyles, designStyles[settings.design] || designStyles.professional),
            style: {
                borderRadius,
                backgroundColor: sectionSettings?.background_color || undefined,
                color: sectionSettings?.text_color || undefined,
                borderColor: settings.primary_color || undefined
            }
        };
    };

    const sectionStyle = getSectionStyle();

    return (
        <motion.section
            className={sectionStyle.className}
            style={sectionStyle.style}
            initial={settings.show_animations ? { opacity: 0, y: 20 } : {}}
            animate={settings.show_animations ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            whileHover={settings.show_animations ? { scale: 1.01 } : {}}
        >
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-2xl font-semibold mb-4">
                    <div 
                        className="mr-3 p-2 rounded-lg"
                        style={{
                            backgroundColor: `${settings.primary_color}20` || '#f59e0b20',
                            color: settings.primary_color || '#f59e0b'
                        }}
                    >
                        <IconComponent className="h-5 w-5" />
                    </div>
                    <span style={{ color: sectionSettings?.text_color || settings.text_color }}>
                        {title}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </motion.section>
    );
};

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfPath: string | null;
}

const PDFPreviewModal = ({ isOpen, onClose, pdfPath }: PDFPreviewModalProps) => {
    if (!isOpen || !pdfPath) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-4xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Prévisualisation du document</DialogTitle>
                    <DialogDescription>
                        Si le document ne s'affiche pas, 
                        <a href={pdfPath} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-500 hover:underline ml-1">
                            cliquez ici pour l'ouvrir dans un nouvel onglet
                        </a>.
                    </DialogDescription>
                </DialogHeader>
                <iframe src={pdfPath} className="m-0 w-full h-full rounded" />
            </DialogContent>
        </Dialog>
    );
};

interface HeaderProps {
    personalInfo: any;
    settings: any;
    identifier: string;
    showContactInfo: boolean;
}

const EnhancedHeader = ({ personalInfo, settings, identifier, showContactInfo }: HeaderProps) => {
    const getHeaderStyle = () => {
        switch (settings.header_style) {
            case 'minimal':
                return 'text-left py-8';
            case 'centered':
                return 'text-center py-12';
            case 'modern':
                return 'text-center py-16 relative overflow-hidden';
            default:
                return 'text-center py-10';
        }
    };

    const getPhotoSize = () => {
        switch (settings.header_style) {
            case 'minimal':
                return 'w-24 h-24';
            case 'modern':
                return 'w-48 h-48';
            default:
                return 'w-40 h-40';
        }
    };

    return (
        <motion.div
            className={cn("relative", getHeaderStyle())}
            initial={settings.show_animations ? { opacity: 0, y: -20 } : {}}
            animate={settings.show_animations ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
        >
            {/* Effet de fond pour le style moderne */}
            {settings.header_style === 'modern' && (
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: `radial-gradient(circle at center, ${settings.primary_color} 0%, transparent 70%)`
                    }}
                />
            )}

            <div className="relative z-10">
                {personalInfo.profile_picture && (
                    <motion.img
                        src={personalInfo.profile_picture}
                        alt={`Photo de profil de ${identifier}`}
                        className={cn(
                            getPhotoSize(),
                            "rounded-full mx-auto mb-6 object-cover shadow-lg",
                            settings.header_style === 'modern' && "ring-4 ring-white/50"
                        )}
                        initial={settings.show_animations ? { scale: 0.8, opacity: 0 } : {}}
                        animate={settings.show_animations ? { scale: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{
                            borderColor: settings.primary_color
                        }}
                    />
                )}
                
                <motion.div
                    initial={settings.show_animations ? { opacity: 0, y: 20 } : {}}
                    animate={settings.show_animations ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h1 
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{ color: settings.text_color }}
                    >
                        {personalInfo.name}
                    </h1>
                    <p 
                        className="text-xl md:text-2xl mb-6"
                        style={{ color: settings.primary_color }}
                    >
                        {personalInfo.title}
                    </p>
                    
                    {showContactInfo && settings.show_social_links && (
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            {personalInfo.email && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`mailto:${personalInfo.email}`} 
                                       className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4" />
                                        <span>Email</span>
                                    </a>
                                </Button>
                            )}
                            {personalInfo.phone && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`tel:${personalInfo.phone}`}
                                       className="flex items-center space-x-2">
                                        <Phone className="h-4 w-4" />
                                        <span>Téléphone</span>
                                    </a>
                                </Button>
                            )}
                            {personalInfo.linkedin && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center space-x-2">
                                        <Linkedin className="h-4 w-4" />
                                        <span>LinkedIn</span>
                                    </a>
                                </Button>
                            )}
                            {personalInfo.github && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={personalInfo.github} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center space-x-2">
                                        <Github className="h-4 w-4" />
                                        <span>GitHub</span>
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

interface ExperienceCardProps {
    experience: any;
    onPreviewPDF: (path: string) => void;
    settings: any;
}

const EnhancedExperienceCard = ({ experience, onPreviewPDF, settings }: ExperienceCardProps) => {
    return (
        <motion.div
            className={cn(
                "mb-6 p-6 rounded-lg border transition-all duration-200",
                settings.show_animations && "hover:shadow-md"
            )}
            style={{
                borderRadius: `${settings.border_radius}px`,
                borderColor: `${settings.primary_color}30`,
                backgroundColor: `${settings.primary_color}05`
            }}
            whileHover={settings.show_animations ? { scale: 1.02, y: -2 } : {}}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 
                        className="text-xl font-semibold mb-1"
                        style={{ color: settings.text_color }}
                    >
                        {experience.title}
                    </h3>
                    <p 
                        className="font-medium mb-1"
                        style={{ color: settings.primary_color }}
                    >
                        {experience.company_name}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                        {experience.date_start} - {experience.date_end || 'Présent'}
                    </p>
                </div>
                
                {experience.attachment_id && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreviewPDF(experience.attachment_path)}
                        className="ml-4 flex items-center space-x-1"
                    >
                        <Eye className="h-4 w-4" />
                        <span>Voir</span>
                    </Button>
                )}
            </div>
            
            <p className="text-gray-700 leading-relaxed">
                {experience.description}
            </p>
        </motion.div>
    );
};

export default function EnhancedPortfolioDisplay({ portfolio, identifier }) {
    const { personalInfo, experiences, competences, hobbies, summary, customSections = [] } = portfolio;
    const settings = portfolio.settings || portfolio;
    const [previewPDF, setPreviewPDF] = useState<string | null>(null);

    const handlePreviewPDF = (pdfPath: string) => {
        setPreviewPDF(pdfPath);
    };

    return (
        <EnhancedPortfolioLayout settings={settings}>
            <Head title={`Portfolio de ${identifier}`} />

            {/* En-tête amélioré */}
            <EnhancedHeader
                personalInfo={personalInfo}
                settings={settings}
                identifier={identifier}
                showContactInfo={portfolio.show_contact_info}
            />

            {/* Résumé/À propos */}
            {portfolio.show_summary && summary?.description && (
                <EnhancedSection title="À propos de moi" icon="User" settings={settings}>
                    <div className="prose prose-lg max-w-none">
                        <p className="text-lg leading-relaxed">{summary.description}</p>
                    </div>
                </EnhancedSection>
            )}

            {/* Sections personnalisées */}
            <AnimatePresence>
                {customSections.filter(section => section.is_active).map((section, index) => (
                    <EnhancedSection 
                        key={section.id}
                        title={section.title} 
                        icon={section.icon || "Edit"} 
                        settings={settings}
                        sectionSettings={section}
                    >
                        <div className="prose max-w-none">
                            <p>{section.content}</p>
                        </div>
                    </EnhancedSection>
                ))}
            </AnimatePresence>

            {/* Expériences professionnelles */}
            {portfolio.show_experiences && experiences?.length > 0 && (
                <EnhancedSection title="Parcours professionnel" icon="Briefcase" settings={settings}>
                    <div className="space-y-4">
                        {experiences.map((exp, index) => (
                            <EnhancedExperienceCard
                                key={index}
                                experience={exp}
                                onPreviewPDF={handlePreviewPDF}
                                settings={settings}
                            />
                        ))}
                    </div>
                </EnhancedSection>
            )}

            {/* Compétences */}
            {portfolio.show_competences && competences?.length > 0 && (
                <EnhancedSection title="Compétences" icon="Award" settings={settings}>
                    <div className="flex flex-wrap gap-3">
                        {competences.map((comp, index) => (
                            <motion.div
                                key={index}
                                initial={settings.show_animations ? { opacity: 0, scale: 0.8 } : {}}
                                animate={settings.show_animations ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: index * 0.1 }}
                                whileHover={settings.show_animations ? { scale: 1.05 } : {}}
                            >
                                <Badge 
                                    variant="secondary"
                                    className="px-4 py-2 text-sm font-medium"
                                    style={{
                                        backgroundColor: `${settings.primary_color}20`,
                                        color: settings.primary_color,
                                        borderRadius: `${settings.border_radius}px`
                                    }}
                                >
                                    {comp.name}
                                </Badge>
                            </motion.div>
                        ))}
                    </div>
                </EnhancedSection>
            )}

            {/* Centres d'intérêt */}
            {portfolio.show_hobbies && hobbies?.length > 0 && (
                <EnhancedSection title="Centres d'intérêt" icon="Heart" settings={settings}>
                    <div className="flex flex-wrap gap-3">
                        {hobbies.map((hobby, index) => (
                            <motion.div
                                key={index}
                                initial={settings.show_animations ? { opacity: 0, scale: 0.8 } : {}}
                                animate={settings.show_animations ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: index * 0.1 }}
                                whileHover={settings.show_animations ? { scale: 1.05 } : {}}
                            >
                                <Badge 
                                    variant="outline"
                                    className="px-4 py-2 text-sm font-medium"
                                    style={{
                                        borderColor: settings.secondary_color,
                                        color: settings.secondary_color,
                                        borderRadius: `${settings.border_radius}px`
                                    }}
                                >
                                    {hobby.name}
                                </Badge>
                            </motion.div>
                        ))}
                    </div>
                </EnhancedSection>
            )}

            {/* Modal de prévisualisation PDF */}
            <PDFPreviewModal
                isOpen={!!previewPDF}
                onClose={() => setPreviewPDF(null)}
                pdfPath={previewPDF}
            />
        </EnhancedPortfolioLayout>
    );
}