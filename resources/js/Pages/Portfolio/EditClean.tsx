import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
import { Textarea } from "@/Components/ui/textarea";
import { __ } from '@/utils/translation';
import {
    Palette, Eye, Save, RefreshCw, QrCode, Share,
    Briefcase, Award, Heart, FileText, Contact,
    Globe, Wrench, User, ArrowUp, ArrowDown,
    Settings, Sparkles, Plus, Edit, Trash2,
    GripVertical, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ServiceManager from '@/Components/Portfolio/ServiceManager';
import SectionGroupManager from '@/Components/Portfolio/SectionGroupManager';
import EnhancedQRCode from '@/Components/Portfolio/EnhancedQRCode';


interface Section {
    key: string;
    label: string;
    icon: React.ComponentType<any>;
    count: number;
    isActive: boolean;
    order: number;
}

const SECTION_ICONS = {
    experiences: Briefcase,
    competences: Award,
    hobbies: Heart,
    summary: FileText,
    contact_info: Contact,
    languages: Globe,
    services: Wrench,
    about: User,
    testimonials: Heart,
};

const SECTION_LABELS = {
    experiences: 'Expériences',
    competences: 'Compétences',
    hobbies: 'Centres d\'intérêt',
    summary: 'Résumé',
    contact_info: 'Contact',
    languages: 'Langues',
    services: 'Services',
    about: 'À propos',
};

const DESIGN_OPTIONS = [
    { value: 'professional', label: 'Professionnel', desc: 'Classique et épuré' },
    { value: 'creative', label: 'Créatif', desc: 'Coloré et dynamique' },
    { value: 'minimal', label: 'Minimal', desc: 'Simple et moderne' },
    { value: 'modern', label: 'Moderne', desc: 'Tendance et stylé' },
    { value: 'custom', label: 'Personnalisé', desc: 'Drag & drop complet' },
];



export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, groupedSections = {}, portfolioStats }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [showQR, setShowQR] = useState(false);

    // Créer les sections avec compteurs corrects
    const createSections = (): Section[] => {
        const sectionsData = [
            {
                key: 'experiences',
                count: Array.isArray(cvData?.experiences) ? cvData.experiences.length : 0,
                isActive: settings.show_experiences ?? true
            },
            {
                key: 'competences',
                count: Array.isArray(cvData?.competences) ? cvData.competences.length :
                    Array.isArray(cvData?.skills) ? cvData.skills.length : 0,
                isActive: settings.show_competences ?? true
            },
            {
                key: 'hobbies',
                count: Array.isArray(cvData?.hobbies) ? cvData.hobbies.length : 0,
                isActive: settings.show_hobbies ?? true
            },
            {
                key: 'languages',
                count: Array.isArray(cvData?.languages) ? cvData.languages.length : 0,
                isActive: settings.show_languages ?? true
            },
            {
                key: 'summary',
                count: (cvData?.summary || (cvData?.summaries && cvData.summaries.length > 0)) ? 1 : 0,
                isActive: settings.show_summary ?? true
            },
            {
                key: 'contact_info',
                count: [
                    cvData?.personalInfo?.email || cvData?.email,
                    cvData?.personalInfo?.phone || cvData?.phone_number || cvData?.phone,
                    cvData?.personalInfo?.address || cvData?.address
                ].filter(Boolean).length,
                isActive: settings.show_contact_info ?? true
            },
            {
                key: 'services',
                count: Array.isArray(services) ? services.length : 0,
                isActive: settings.show_services ?? false
            },
        ];

        // Appliquer l'ordre sauvegardé
        const sectionOrder = settings.section_order || {};

        return sectionsData.map((section) => ({
            ...section,
            label: SECTION_LABELS[section.key],
            icon: SECTION_ICONS[section.key],
            order: sectionOrder[section.key] ?? 999,
        })).sort((a, b) => a.order - b.order);
    };

    const [sections, setSections] = useState<Section[]>(createSections);

    const { data, setData, put, processing } = useForm({
        design: settings.design || 'professional',
        primary_color: settings.primary_color || '#f59e0b',
        section_order: settings.section_order || {},
        show_experiences: settings.show_experiences ?? true,
        show_competences: settings.show_competences ?? true,
        show_hobbies: settings.show_hobbies ?? true,
        show_summary: settings.show_summary ?? true,
        show_contact_info: settings.show_contact_info ?? true,
        show_languages: settings.show_languages ?? true,
        show_services: settings.show_services ?? false,
    });

    const portfolioUrl = `${window.location.origin}/portfolio/${auth.user.username || auth.user.email}`;

    // Utiliser les vraies statistiques du backend ou des valeurs par défaut
    const defaultStats = {
        views: 0,
        shares: 0,
        lastViewed: new Date().toLocaleDateString('fr-FR'),
        isPublic: true
    };
    const realPortfolioStats = portfolioStats || defaultStats;

    const onSubmit = (e) => {
        e.preventDefault();
        put(route('portfolio.update'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMoveSection = (sectionKey: string, direction: 'up' | 'down') => {
        const currentIndex = sections.findIndex(s => s.key === sectionKey);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= sections.length) return;

        const newSections = [...sections];
        const [movedSection] = newSections.splice(currentIndex, 1);
        newSections.splice(newIndex, 0, movedSection);

        const updatedSections = newSections.map((section, index) => ({
            ...section,
            order: index
        }));

        setSections(updatedSections);

        // Mettre à jour l'ordre dans le formulaire
        const sectionOrder = {};
        updatedSections.forEach((section, index) => {
            sectionOrder[section.key] = index;
        });
        setData('section_order', sectionOrder);
    };

    const handleToggleSection = (sectionKey: string) => {
        setSections(prevSections => {
            const updatedSections = prevSections.map(section =>
                section.key === sectionKey
                    ? { ...section, isActive: !section.isActive }
                    : section
            );
            
            // Update form data using the new state
            const toggledSection = updatedSections.find(s => s.key === sectionKey);
            if (toggledSection) {
                setData(`show_${sectionKey}` as any, toggledSection.isActive);
            }
            
            return updatedSections;
        });
    };


    const generateQRCode = () => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portfolioUrl)}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{__('portfolio.edit.portfolio_express')}</h2>
                            <p className="text-xs text-gray-500">{__('portfolio.edit.quick_config')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setShowQR(!showQR)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3"
                        >
                            <QrCode className="h-3 w-3 mr-1" />
                            QR
                        </Button>
                        <Button
                            onClick={() => setPreviewMode(!previewMode)}
                            variant={previewMode ? "default" : "outline"}
                            size="sm"
                            className="h-8 px-3"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            {previewMode ? __('portfolio.edit.hide') : __('portfolio.edit.preview')}
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={__('portfolio.edit.portfolio_express')} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Enhanced QR Code Modal */}
                    <EnhancedQRCode
                        url={portfolioUrl}
                        isOpen={showQR}
                        onClose={() => setShowQR(false)}
                        user={auth.user}
                        portfolioStats={realPortfolioStats}
                    />

                    <div className={cn("grid gap-8", previewMode ? "lg:grid-cols-3" : "lg:grid-cols-1")}>

                        {/* Configuration principale */}
                        <div className={cn("space-y-6", previewMode ? "lg:col-span-2" : "lg:col-span-1")}>



                            <form onSubmit={onSubmit} id="portfolio-form" className="space-y-6">

                                {/* Design & Couleur */}
                                <Card className="bg-white shadow-lg">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                <Palette className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Design & Style</h3>
                                                <p className="text-sm text-gray-500 mt-1">Personnalisez l'apparence de votre portfolio</p>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Sélection du design */}
                                        <div>
                                            <Label className="text-base font-medium text-gray-700 mb-3 block">Thème du portfolio</Label>
                                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                                {DESIGN_OPTIONS.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        className={cn(
                                                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                                                            data.design === option.value
                                                                ? "border-violet-500 bg-violet-50 shadow-md"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        )}
                                                        onClick={() => setData('design', option.value)}
                                                    >
                                                        <h4 className="font-medium text-gray-900 text-sm">{option.label}</h4>
                                                        <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Couleur principale */}
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <Label className="text-base font-medium text-gray-700">Couleur principale</Label>
                                                <p className="text-sm text-gray-500 mt-1">Choisissez la couleur dominante de votre portfolio</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="color"
                                                    value={data.primary_color}
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                    className="w-16 h-12 rounded-lg cursor-pointer border-2"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => setData('primary_color', '#f59e0b')}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                >
                                                    Par défaut
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                                {/* Visibilité des Sections - Interface Simplifiée */}
                                <Card className="bg-white shadow-lg border-l-4 border-l-emerald-500">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                                                    <Eye className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Visibilité des Sections</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Choisissez les sections à afficher</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                {sections.filter(s => s.isActive).length}/{sections.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {sections.map((section, index) => {
                                                const IconComponent = section.icon;
                                                return (
                                                    <motion.div
                                                        key={section.key}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.03 }}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200",
                                                            section.count === 0 
                                                                ? "cursor-not-allowed opacity-40 border-orange-200 bg-orange-50/20"
                                                                : section.isActive 
                                                                    ? "cursor-pointer border-emerald-200 bg-emerald-50/30 hover:border-emerald-300" 
                                                                    : "cursor-pointer border-gray-200 bg-gray-50/30 opacity-60 hover:opacity-80"
                                                        )}
                                                        onClick={() => section.count > 0 && handleToggleSection(section.key)}
                                                    >
                                                        {/* Section Icon */}
                                                        <div className={cn(
                                                            "flex items-center justify-center w-8 h-8 rounded-md transition-colors shrink-0",
                                                            section.isActive 
                                                                ? "bg-emerald-100 text-emerald-600" 
                                                                : "bg-gray-100 text-gray-400"
                                                        )}>
                                                            <IconComponent className="w-4 h-4" />
                                                        </div>

                                                        {/* Section Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn(
                                                                    "text-sm font-medium truncate",
                                                                    section.isActive ? "text-gray-900" : "text-gray-500"
                                                                )}>
                                                                    {section.label}
                                                                </span>
                                                                <Badge 
                                                                    variant="secondary"
                                                                    className={cn(
                                                                        "text-xs px-1.5 py-0.5 shrink-0",
                                                                        section.count === 0 
                                                                            ? "bg-orange-100 text-orange-600" 
                                                                            : "bg-blue-100 text-blue-600"
                                                                    )}
                                                                >
                                                                    {section.count}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {/* Toggle Switch */}
                                                        <Switch
                                                            checked={section.isActive}
                                                            disabled={section.count === 0}
                                                            onCheckedChange={() => {}}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (section.count > 0) {
                                                                    handleToggleSection(section.key);
                                                                }
                                                            }}
                                                            className="data-[state=checked]:bg-emerald-500 shrink-0"
                                                        />
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Actions rapides */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="text-xs text-gray-500">
                                                {sections.filter(s => s.count === 0).length > 0 && "Les sections sans contenu sont marquées en orange"}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSections(prevSections => {
                                                            const updatedSections = prevSections.map(section =>
                                                                (!section.isActive && section.count > 0)
                                                                    ? { ...section, isActive: true }
                                                                    : section
                                                            );
                                                            
                                                            // Update form data for all changed sections
                                                            updatedSections.forEach(section => {
                                                                const originalSection = prevSections.find(s => s.key === section.key);
                                                                if (originalSection && originalSection.isActive !== section.isActive) {
                                                                    setData(`show_${section.key}` as any, section.isActive);
                                                                }
                                                            });
                                                            
                                                            return updatedSections;
                                                        });
                                                    }}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    Afficher tout
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSections(prevSections => {
                                                            const updatedSections = prevSections.map(section =>
                                                                (section.isActive && section.count === 0)
                                                                    ? { ...section, isActive: false }
                                                                    : section
                                                            );
                                                            
                                                            // Update form data for all changed sections
                                                            updatedSections.forEach(section => {
                                                                const originalSection = prevSections.find(s => s.key === section.key);
                                                                if (originalSection && originalSection.isActive !== section.isActive) {
                                                                    setData(`show_${section.key}` as any, section.isActive);
                                                                }
                                                            });
                                                            
                                                            return updatedSections;
                                                        });
                                                    }}
                                                    className="h-7 px-2 text-xs"
                                                >
                                                    Masquer vides
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>





                                {/* Bouton de sauvegarde */}
                                <div className="flex justify-center pt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        size="lg"
                                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-12 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                                    >
                                        {processing ? (
                                            <>
                                                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                                                Sauvegarde en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-3" />
                                                Sauvegarder les modifications
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </form>
                        </div>

                        {/* Preview (if active) */}
                        {previewMode && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-1"
                            >
                                <Card className="sticky top-6 shadow-xl bg-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-center flex items-center justify-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <Eye className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-base font-semibold text-gray-900">{__('portfolio.edit.live_preview')}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mx-4 border-2 border-purple-100">
                                            <iframe
                                                src={portfolioUrl}
                                                className="w-full h-full border-0 scale-75 origin-top-left"
                                                style={{ width: '133.33%', height: '133.33%' }}
                                                title={__('portfolio.edit.portfolio_preview')}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <Button
                                                onClick={() => window.open(portfolioUrl, '_blank')}
                                                variant="outline"
                                                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                                            >
                                                <Share className="h-4 w-4 mr-2" />
                                                Ouvrir en plein écran
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}