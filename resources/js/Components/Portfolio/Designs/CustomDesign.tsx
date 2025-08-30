import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar, GripVertical, Settings, Eye, EyeOff,
    Plus, Edit, Trash2
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { cn } from "@/lib/utils";

interface CustomDesignProps {
    user: any;
    cvData: any;
    settings: any;
    isPreview?: boolean;
}

// Section component avec drag & drop
const DraggableSection = ({ 
    section, 
    onToggle, 
    onMove, 
    canMoveUp, 
    canMoveDown,
    primaryColor,
    isEditMode 
}: any) => {
    const { t } = useTranslation();

    const renderSectionContent = () => {
        switch (section.key) {
            case 'experiences':
                return (
                    <div className="space-y-4">
                        {section.data?.map((exp: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800">{exp.name}</h3>
                                <p className="text-gray-600 text-sm">{exp.InstitutionName}</p>
                                {exp.description && (
                                    <p className="text-gray-600 text-sm mt-2">{exp.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {exp.date_start && new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                        {exp.date_end ? 
                                            ` - ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                            ' - Présent'
                                        }
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                );
                
            case 'competences':
                return (
                    <div className="flex flex-wrap gap-2">
                        {section.data?.map((skill: any, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                {skill.name}
                            </Badge>
                        ))}
                    </div>
                );
                
            case 'languages':
                return (
                    <div className="space-y-2">
                        {section.data?.map((lang: any, index: number) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <span className="font-medium">{lang.name}</span>
                                <Badge variant="outline">{lang.pivot?.language_level || 'Non spécifié'}</Badge>
                            </div>
                        ))}
                    </div>
                );
                
            case 'hobbies':
                return (
                    <div className="flex flex-wrap gap-2">
                        {section.data?.map((hobby: any, index: number) => (
                            <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                                {hobby.name}
                            </Badge>
                        ))}
                    </div>
                );
                
            case 'summary':
                return (
                    <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                            {typeof section.data === 'string' ? section.data : section.data?.description || 'Aucun résumé disponible'}
                        </p>
                    </div>
                );
                
            case 'contact_info':
                return (
                    <div className="space-y-3">
                        {section.data?.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{section.data.email}</span>
                            </div>
                        )}
                        {section.data?.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{section.data.phone}</span>
                            </div>
                        )}
                        {section.data?.address && (
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{section.data.address}</span>
                            </div>
                        )}
                        {section.data?.github && (
                            <div className="flex items-center gap-3">
                                <Github className="w-4 h-4 text-gray-500" />
                                <a href={section.data.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    GitHub
                                </a>
                            </div>
                        )}
                        {section.data?.linkedin && (
                            <div className="flex items-center gap-3">
                                <Linkedin className="w-4 h-4 text-gray-500" />
                                <a href={section.data.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    LinkedIn
                                </a>
                            </div>
                        )}
                    </div>
                );
                
            case 'services':
                return (
                    <div className="grid gap-4">
                        {section.data?.map((service: any, index: number) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{service.title}</h3>
                                        {service.description && (
                                            <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                                        )}
                                    </div>
                                    {service.formatted_price && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            {service.formatted_price}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );
                
            default:
                return <div className="text-gray-500 italic">Contenu non disponible</div>;
        }
    };

    const getSectionIcon = () => {
        const icons = {
            experiences: Briefcase,
            competences: Award,
            hobbies: Heart,
            languages: Globe,
            summary: FileText,
            contact_info: Contact,
            services: Settings
        };
        const Icon = icons[section.key] || Settings;
        return <Icon className="w-5 h-5" />;
    };

    if (!section.visible && !isEditMode) {
        return null;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                "relative group bg-white rounded-xl shadow-sm border-2 transition-all duration-200",
                section.visible ? "border-gray-200" : "border-dashed border-gray-300 opacity-50",
                isEditMode && "hover:shadow-md hover:border-blue-300"
            )}
        >
            {/* Edit Mode Controls */}
            {isEditMode && (
                <div className="absolute -top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="bg-white rounded-lg shadow-md border p-1 flex items-center gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onMove('up')}
                            disabled={!canMoveUp}
                            className="h-6 w-6 p-0"
                        >
                            <GripVertical className="w-3 h-3" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onToggle()}
                            className="h-6 w-6 p-0"
                        >
                            {section.visible ? 
                                <Eye className="w-3 h-3 text-green-600" /> : 
                                <EyeOff className="w-3 h-3 text-gray-400" />
                            }
                        </Button>
                    </div>
                </div>
            )}

            {/* Drag Handle */}
            {isEditMode && (
                <div className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 transition-opacity">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
            )}

            {/* Section Content */}
            <div className={cn("p-6", isEditMode && "pl-10")}>
                {/* Section Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                        {getSectionIcon()}
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                    {!section.visible && isEditMode && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                            Masqué
                        </Badge>
                    )}
                </div>

                {/* Section Body */}
                {section.visible && (
                    <div className={cn(!section.data || (Array.isArray(section.data) && section.data.length === 0) ? "opacity-50" : "")}>
                        {renderSectionContent()}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function CustomDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: CustomDesignProps) {
    const { t } = useTranslation();
    const [isEditMode, setIsEditMode] = useState(!isPreview);
    
    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#3b82f6';

    // Create sections array with proper data structure
    const [sections, setSections] = useState(() => {
        return [
            {
                key: 'experiences',
                title: 'Expériences Professionnelles',
                data: cvData?.experiences || [],
                visible: settings?.show_experiences ?? true
            },
            {
                key: 'competences',
                title: 'Compétences',
                data: cvData?.competences || cvData?.skills || [],
                visible: settings?.show_competences ?? true
            },
            {
                key: 'hobbies',
                title: 'Centres d\'intérêt',
                data: cvData?.hobbies || [],
                visible: settings?.show_hobbies ?? true
            },
            {
                key: 'languages',
                title: 'Langues',
                data: cvData?.languages || [],
                visible: settings?.show_languages ?? true
            },
            {
                key: 'summary',
                title: 'Résumé Professionnel',
                data: typeof cvData?.summary === 'string' ? cvData.summary : cvData?.summaries?.[0]?.description || cvData?.summary,
                visible: settings?.show_summary ?? true
            },
            {
                key: 'contact_info',
                title: 'Informations de Contact',
                data: {
                    email: cvData?.email || user?.email,
                    phone: cvData?.phone || user?.phone,
                    address: cvData?.address || user?.address,
                    github: user?.github,
                    linkedin: user?.linkedin
                },
                visible: settings?.show_contact_info ?? true
            },
            {
                key: 'services',
                title: 'Services',
                data: cvData?.services || [],
                visible: settings?.show_services ?? false
            }
        ];
    });

    const handleSectionToggle = (sectionKey: string) => {
        setSections(prev => 
            prev.map(section => 
                section.key === sectionKey 
                    ? { ...section, visible: !section.visible }
                    : section
            )
        );
    };

    const handleSectionMove = (sectionKey: string, direction: 'up' | 'down') => {
        setSections(prev => {
            const currentIndex = prev.findIndex(s => s.key === sectionKey);
            if (currentIndex === -1) return prev;
            
            const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;
            
            const newSections = [...prev];
            const [movedSection] = newSections.splice(currentIndex, 1);
            newSections.splice(newIndex, 0, movedSection);
            
            return newSections;
        });
    };

    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
            style={{
                '--primary-color': primaryColor,
                '--primary-rgb': primaryColor.substring(1).match(/.{2}/g)?.map(x => parseInt(x, 16)).join(', ')
            } as React.CSSProperties}
        >
            {/* Edit Mode Toggle */}
            {!isPreview && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-6 right-6 z-50"
                >
                    <Card className="bg-white shadow-lg">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Mode édition</span>
                                <Switch
                                    checked={isEditMode}
                                    onCheckedChange={setIsEditMode}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Header Section */}
            <motion.section
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white shadow-sm border-b"
            >
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Photo de profil */}
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-xl">
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt={`${user.name} - Photo de profil`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations principales */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                                {user.name || `${cvData?.first_name || ''} ${cvData?.last_name || ''}`.trim()}
                            </h1>

                            {(settings.tagline || cvData?.professional_title) && (
                                <p 
                                    className="text-xl font-medium mb-4"
                                    style={{ color: primaryColor }}
                                >
                                    {settings.tagline || cvData.professional_title}
                                </p>
                            )}

                            {settings.bio && (
                                <p className="text-gray-600 leading-relaxed max-w-2xl">
                                    {settings.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Sections principales */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {isEditMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-blue-800 mb-2">
                            <Settings className="w-4 h-4" />
                            <span className="font-medium">Mode Personnalisation Activé</span>
                        </div>
                        <p className="text-sm text-blue-700">
                            Glissez-déposez les sections pour les réorganiser, utilisez les icônes pour les masquer/afficher.
                        </p>
                    </motion.div>
                )}

                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <DraggableSection
                            key={section.key}
                            section={section}
                            onToggle={() => handleSectionToggle(section.key)}
                            onMove={(direction: 'up' | 'down') => handleSectionMove(section.key, direction)}
                            canMoveUp={index > 0}
                            canMoveDown={index < sections.length - 1}
                            primaryColor={primaryColor}
                            isEditMode={isEditMode}
                        />
                    ))}
                </div>

                {/* Add Section Button in Edit Mode */}
                {isEditMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 text-center"
                    >
                        <Button
                            variant="outline"
                            className="border-dashed border-2 border-gray-300 h-16 px-8"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Ajouter une section personnalisée
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}