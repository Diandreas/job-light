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

// Traductions complètes
const translations = {
    fr: {
        portfolioStudio: 'Portfolio Studio Pro',
        advancedConfig: 'Configuration avancée de votre portfolio',
        qrCode: 'QR Code',
        preview: 'Aperçu',
        hide: 'Masquer',
        sharePortfolio: 'Partager votre Portfolio',
        scanQr: 'Scannez le QR code pour accéder à votre portfolio',
        close: 'Fermer',
        designStyle: 'Design & Style',
        customizeAppearance: 'Personnalisez l\'apparence de votre portfolio',
        chooseTheme: 'Choisissez votre thème',
        primaryColor: 'Couleur principale',
        selectColor: 'Sélectionnez la couleur dominante de votre portfolio',
        default: 'Par défaut',
        sectionManagement: 'Gestion des Sections',
        organizePortfolio: 'Organisez et configurez les sections de votre portfolio',
        active: 'Actives',
        empty: 'Vides',
        noContent: 'Aucun contenu disponible',
        element: 'élément',
        elements: 'éléments',
        emptySectionsOrange: 'Les sections vides sont marquées en orange',
        allSectionsContent: 'Toutes vos sections contiennent du contenu !',
        showAll: 'Afficher tout',
        hideEmpty: 'Masquer vides',
        saveChanges: 'Sauvegarder les modifications',
        saving: 'Sauvegarde en cours...',
        livePreview: 'Aperçu Live',
        realtimePreview: 'Prévisualisation en temps réel',
        fullscreen: 'Plein écran',
        professional: 'Pro',
        creative: 'Créatif',
        minimal: 'Minimal',
        modern: 'Moderne',
        classicClean: 'Classique et épuré',
        colorfulDynamic: 'Coloré et dynamique',
        simpleModern: 'Simple et moderne',
        trendyStyled: 'Tendance et stylé',
        experiences: 'Expériences',
        competences: 'Compétences',
        hobbies: 'Centres d\'intérêt',
        summary: 'Résumé',
        contact_info: 'Contact',
        languages: 'Langues',
        services: 'Services',
        about: 'À propos',
        theme: 'Thème'
    },
    en: {
        portfolioStudio: 'Portfolio Studio Pro',
        advancedConfig: 'Advanced portfolio configuration',
        qrCode: 'QR Code',
        preview: 'Preview',
        hide: 'Hide',
        sharePortfolio: 'Share your Portfolio',
        scanQr: 'Scan the QR code to access your portfolio',
        close: 'Close',
        designStyle: 'Design & Style',
        customizeAppearance: 'Customize your portfolio appearance',
        chooseTheme: 'Choose your theme',
        primaryColor: 'Primary Color',
        selectColor: 'Select your portfolio dominant color',
        default: 'Default',
        sectionManagement: 'Section Management',
        organizePortfolio: 'Organize and configure your portfolio sections',
        active: 'Active',
        empty: 'Empty',
        noContent: 'No content available',
        element: 'element',
        elements: 'elements',
        emptySectionsOrange: 'Empty sections are marked in orange',
        allSectionsContent: 'All your sections contain content!',
        showAll: 'Show all',
        hideEmpty: 'Hide empty',
        saveChanges: 'Save changes',
        saving: 'Saving...',
        livePreview: 'Live Preview',
        realtimePreview: 'Real-time preview',
        fullscreen: 'Fullscreen',
        professional: 'Pro',
        creative: 'Creative',
        minimal: 'Minimal',
        modern: 'Modern',
        classicClean: 'Classic and clean',
        colorfulDynamic: 'Colorful and dynamic',
        simpleModern: 'Simple and modern',
        trendyStyled: 'Trendy and styled',
        experiences: 'Experiences',
        competences: 'Skills',
        hobbies: 'Hobbies',
        summary: 'Summary',
        contact_info: 'Contact',
        languages: 'Languages',
        services: 'Services',
        about: 'About',
        theme: 'Theme'
    }
};
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ServiceManager from '@/Components/Portfolio/ServiceManager';
import SectionGroupManager from '@/Components/Portfolio/SectionGroupManager';


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

const getSectionLabels = (t: any) => ({
    experiences: t.experiences,
    competences: t.competences,
    hobbies: t.hobbies,
    summary: t.summary,
    contact_info: t.contact_info,
    languages: t.languages,
    services: t.services,
    about: t.about,
});

const DESIGN_OPTIONS = [
    { value: 'professional', labelKey: 'professional', descKey: 'classicClean' },
    { value: 'creative', labelKey: 'creative', descKey: 'colorfulDynamic' },
    { value: 'minimal', labelKey: 'minimal', descKey: 'simpleModern' },
    { value: 'modern', labelKey: 'modern', descKey: 'trendyStyled' },
];



export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, groupedSections = {} }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [showQR, setShowQR] = useState(false);
    
    // Détection de la langue (par défaut français)
    const currentLang = document.documentElement.lang || 'fr';
    const t = translations[currentLang] || translations.fr;

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

        const sectionLabels = getSectionLabels(t);
        return sectionsData.map((section) => ({
            ...section,
            label: sectionLabels[section.key],
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
                <div className="flex items-center justify-between bg-gradient-to-r from-white via-gray-50 to-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">Portfolio Studio Pro</h2>
                            <p className="text-sm text-gray-600 font-medium">Configuration avancée de votre portfolio</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowQR(!showQR)}
                            variant="outline"
                            size="default"
                            className="h-11 px-5 border-gray-300 hover:bg-gray-50 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <QrCode className="h-4 w-4 mr-2" />
                            QR Code
                        </Button>
                        <Button
                            onClick={() => setPreviewMode(!previewMode)}
                            variant={previewMode ? "default" : "outline"}
                            size="default"
                            className={cn(
                                "h-10 px-4 font-medium transition-all duration-200 text-sm",
                                previewMode
                                    ? "bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-lg hover:shadow-xl"
                                    : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md"
                            )}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            {previewMode ? t.hide : t.preview}
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={__('portfolio.edit.portfolio_express')} />

            <div className="py-2 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="mx-auto max-w-7xl px-2 sm:px-3 lg:px-4">

                    {/* QR Code Modal */}
                    <AnimatePresence>
                        {showQR && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                                onClick={() => setShowQR(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-600"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-amber-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                                            <QrCode className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{t.sharePortfolio}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">{t.scanQr}</p>
                                    </div>
                                    <div className="text-center mb-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner mb-3">
                                            <img
                                                src={generateQRCode()}
                                                alt="QR Code"
                                                className="mx-auto rounded-xl"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-700 p-2 rounded-lg font-mono">
                                            {portfolioUrl}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQR(false)}
                                        className="w-full h-10 font-semibold border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                    >
                                        {t.close}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={cn("grid gap-8", previewMode ? "lg:grid-cols-3" : "lg:grid-cols-1")}>

                        {/* Configuration principale */}
                        <div className={cn("space-y-3", previewMode ? "lg:col-span-2" : "lg:col-span-1")}>



                            <form onSubmit={onSubmit} id="portfolio-form" className="space-y-4">

                                {/* Design & Couleur */}
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-violet-500 hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                    <Palette className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.designStyle}</h3>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{t.customizeAppearance}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 font-semibold px-2 py-1 text-xs">
                                                {t.theme}: {t[DESIGN_OPTIONS.find(d => d.value === data.design)?.labelKey] || t.professional}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Sélection du design */}
                                        <div>
                                            <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 block">{t.chooseTheme}</Label>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                {DESIGN_OPTIONS.map((option) => (
                                                    <motion.div
                                                        key={option.value}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={cn(
                                                            "p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                                                            data.design === option.value
                                                                ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 shadow-md ring-1 ring-violet-300"
                                                                : "border-gray-200 dark:border-gray-600 hover:border-violet-300 bg-white dark:bg-gray-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-violet-50 dark:hover:from-gray-600 dark:hover:to-violet-900/20"
                                                        )}
                                                        onClick={() => setData('design', option.value)}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{t[option.labelKey]}</h4>
                                                            {data.design === option.value && (
                                                                <div className="w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{t[option.descKey]}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Couleur principale */}
                                        <div className="bg-gradient-to-r from-gray-50 to-violet-50 dark:from-gray-800 dark:to-violet-900/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 block">{t.primaryColor}</Label>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{t.selectColor}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <Input
                                                            type="color"
                                                            value={data.primary_color}
                                                            onChange={(e) => setData('primary_color', e.target.value)}
                                                            className="w-16 h-12 rounded-xl cursor-pointer border-2 border-white shadow-md hover:shadow-lg transition-shadow"
                                                        />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-md">
                                                            {data.primary_color}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setData('primary_color', '#f59e0b')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-2 border-amber-200 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-medium text-xs"
                                                    >
                                                        {t.default}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                                {/* Visibilité des Sections - Interface Simplifiée */}
                                <Card className="bg-white dark:bg-gray-800 shadow-lg border-l-4 border-l-emerald-500 hover:shadow-xl transition-shadow duration-300">
                                    <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                                                    <Settings className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sectionManagement}</h3>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">{t.organizePortfolio}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-semibold px-2 py-1 text-xs">
                                                    {sections.filter(s => s.isActive).length}/{sections.length} {t.active}
                                                </Badge>
                                                <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 font-semibold px-2 py-1 text-xs">
                                                    {sections.filter(s => s.count === 0).length} {t.empty}
                                                </Badge>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid grid-cols-1 gap-2">
                                            {sections.map((section, index) => {
                                                const IconComponent = section.icon;
                                                return (
                                                    <motion.div
                                                        key={section.key}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        whileHover={{ scale: 1.01 }}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-sm",
                                                            section.count === 0
                                                                ? "cursor-not-allowed opacity-60 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
                                                                : section.isActive
                                                                    ? "cursor-pointer border-emerald-300 dark:border-emerald-600 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 hover:border-emerald-400 shadow-sm"
                                                                    : "cursor-pointer border-gray-200 dark:border-gray-600 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 opacity-75 hover:opacity-90 hover:border-gray-300 dark:hover:border-gray-500"
                                                        )}
                                                        onClick={() => section.count > 0 && handleToggleSection(section.key)}
                                                    >
                                                        {/* Section Icon */}
                                                        <div className={cn(
                                                            "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 shrink-0",
                                                            section.count === 0
                                                                ? "bg-orange-100 dark:bg-orange-800 text-orange-500 dark:text-orange-400"
                                                                : section.isActive
                                                                    ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 shadow-md"
                                                                    : "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-300"
                                                        )}>
                                                            <IconComponent className="w-4 h-4" />
                                                        </div>

                                                        {/* Section Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className={cn(
                                                                        "text-sm font-semibold block",
                                                                        section.count === 0
                                                                            ? "text-orange-700 dark:text-orange-400"
                                                                            : section.isActive
                                                                                ? "text-gray-900 dark:text-white"
                                                                                : "text-gray-500 dark:text-gray-400"
                                                                    )}>
                                                                        {section.label}
                                                                    </span>
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {section.count === 0
                                                                            ? t.noContent
                                                                            : `${section.count} ${section.count > 1 ? t.elements : t.element}`
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge
                                                                        className={cn(
                                                                            "text-xs px-2 py-0.5 font-semibold rounded-full",
                                                                            section.count === 0
                                                                                ? "bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300"
                                                                                : "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                                                                        )}
                                                                    >
                                                                        {section.count}
                                                                    </Badge>
                                                                    <Switch
                                                                        checked={section.isActive}
                                                                        disabled={section.count === 0}
                                                                        onCheckedChange={() => { }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (section.count > 0) {
                                                                                handleToggleSection(section.key);
                                                                            }
                                                                        }}
                                                                        className="data-[state=checked]:bg-emerald-500 shrink-0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Actions rapides */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                                            <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                                                💡 {sections.filter(s => s.count === 0).length > 0
                                                    ? t.emptySectionsOrange
                                                    : t.allSectionsContent}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="default"
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
                                                    className="h-8 px-3 border-emerald-200 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    {t.showAll}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="default"
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
                                                    className="h-8 px-3 border-orange-200 dark:border-orange-600 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs"
                                                >
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    {t.hideEmpty}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>





                                {/* Bouton de sauvegarde */}
                                <div className="flex justify-center pt-4">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            size="lg"
                                            className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:from-violet-700 hover:via-purple-700 hover:to-amber-600 text-white px-12 py-3 text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                                        >
                                            {processing ? (
                                                <>
                                                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                                    {t.saving}
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-5 w-5 mr-2" />
                                                    {t.saveChanges}
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </div>

                            </form>
                        </div>

                        {/* Preview (if active) */}
                        {previewMode && (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4 }}
                                className="lg:col-span-1"
                            >
                                <Card className="sticky top-6 shadow-2xl bg-white border-l-4 border-l-purple-500 overflow-hidden">
                                    <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50">
                                        <CardTitle className="flex items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                                <Eye className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <span className="text-xl font-bold text-gray-900 block">Aperçu Live</span>
                                                <span className="text-sm text-gray-600">Prévisualisation en temps réel</span>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="p-4">
                                            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-purple-200 shadow-inner">
                                                <iframe
                                                    src={portfolioUrl}
                                                    className="w-full h-full border-0 scale-75 origin-top-left transition-all duration-300"
                                                    style={{ width: '133.33%', height: '133.33%' }}
                                                    title={__('portfolio.edit.portfolio_preview')}
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                            <div className="flex gap-1">
                                                <Button
                                                    onClick={() => window.open(portfolioUrl, '_blank')}
                                                    variant="outline"
                                                    className="flex-1 h-9 border border-purple-200 dark:border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 font-medium text-sm"
                                                >
                                                    <Share className="h-3 w-3 mr-1" />
                                                    {t.fullscreen}
                                                </Button>
                                                <Button
                                                    onClick={() => setShowQR(true)}
                                                    variant="outline"
                                                    className="h-9 px-3 border border-purple-200 dark:border-purple-600 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 text-sm"
                                                >
                                                    <QrCode className="h-3 w-3" />
                                                </Button>
                                            </div>
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