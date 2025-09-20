import React, { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import {
    Palette, Eye, Save, RefreshCw, QrCode, Share,
    Briefcase, Award, Heart, FileText, Contact,
    Globe, Wrench, User, ArrowUp, ArrowDown, ArrowLeft,
    Settings, Sparkles, Plus, Edit, Trash2,
    GripVertical, EyeOff, Menu, X, ChevronUp
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import ServiceManager from '@/Components/Portfolio/ServiceManager';
import SectionGroupManager from '@/Components/Portfolio/SectionGroupManager';
import { PortfolioQRCode } from '@/Components/PortfolioQRCode';

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

const DESIGN_OPTIONS = [
    { value: 'professional', labelKey: 'professional', descKey: 'classicClean' },
    { value: 'creative', labelKey: 'creative', descKey: 'colorfulDynamic' },
    { value: 'minimal', labelKey: 'minimal', descKey: 'simpleModern' },
    { value: 'modern', labelKey: 'modern', descKey: 'trendyStyled' },
    { value: 'glassmorphism', labelKey: 'glassmorphism', descKey: 'glassmorphismDesc', icon: '🔮' },
    { value: 'neon_cyber', labelKey: 'neonCyber', descKey: 'neonCyberDesc', icon: '🌐' },
    { value: 'elegant_corporate', labelKey: 'elegantCorporate', descKey: 'elegantCorporateDesc', icon: '🏢' },
    { value: 'artistic_showcase', labelKey: 'artisticShowcase', descKey: 'artisticShowcaseDesc', icon: '🎭' },
    { value: 'dynamic_tech', labelKey: 'dynamicTech', descKey: 'dynamicTechDesc', icon: '⚡' },
    { value: 'glass', labelKey: 'glass', descKey: 'glassDesc', icon: '💎' },
    { value: 'neon', labelKey: 'neon', descKey: 'neonDesc', icon: '🌈' },
    { value: 'particle', labelKey: 'particle', descKey: 'particleDesc', icon: '✨' },
    { value: 'wave', labelKey: 'wave', descKey: 'waveDesc', icon: '🌊' },
    { value: 'morphing', labelKey: 'morphing', descKey: 'morphingDesc', icon: '🔮' },
];

export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, groupedSections = {} }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showMobileControls, setShowMobileControls] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dragY, setDragY] = useState(0);

    const { t } = useTranslation();

    const [sections, setSections] = useState<Section[]>([]);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
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

            const sectionOrder = settings.section_order || {};

            const sectionLabels = {
                experiences: t('portfolio.edit.experiences'),
                competences: t('portfolio.edit.competences'),
                hobbies: t('portfolio.edit.hobbies'),
                summary: t('portfolio.edit.summary'),
                contact_info: t('portfolio.edit.contact_info'),
                languages: t('portfolio.edit.languages'),
                services: t('portfolio.edit.services'),
                about: t('portfolio.edit.about'),
            };
            return sectionsData.map((section) => ({
                ...section,
                label: sectionLabels[section.key],
                icon: SECTION_ICONS[section.key],
                order: sectionOrder[section.key] ?? 999,
            })).sort((a, b) => a.order - b.order);
        };
        setSections(createSections());
    }, [t, cvData, settings, services]);

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
            onSuccess: () => {
                // Simple refresh de la preview
                setPreviewKey(prev => prev + 1);
            }
        });
    };

    const handleToggleSection = (sectionKey: string) => {
        setSections(prevSections => {
            const updatedSections = prevSections.map(section =>
                section.key === sectionKey
                    ? { ...section, isActive: !section.isActive }
                    : section
            );

            const toggledSection = updatedSections.find(s => s.key === sectionKey);
            if (toggledSection) {
                setData(`show_${sectionKey}` as any, toggledSection.isActive);
            }

            return updatedSections;
        });
    };


    return (
        <AuthenticatedLayout user={auth.user} hideSidebar={isMobile}>
            <Head title={t('portfolio.edit.portfolio_express')} />

            <div className={cn("bg-white dark:bg-gray-950 min-h-screen", isMobile ? "py-0" : "py-4")}>
                <div className={cn("mx-auto", isMobile ? "px-0" : "max-w-6xl px-4 sm:px-6 lg:px-8")}>

                    {/* QR Code Modal */}
                    <QRCodeGenerator
                        url={portfolioUrl}
                        isOpen={showQR}
                        onClose={() => setShowQR(false)}
                        userPhoto={auth.user.photo ? `/storage/${auth.user.photo}` : undefined}
                    />

                    {/* Mobile Layout */}
                    {isMobile ? (
                        <div className="h-screen relative">
                            {/* Mobile Preview - TRUE Full Screen */}
                            <iframe
                                key={`preview-${previewKey}`}
                                src={`${portfolioUrl}?v=${previewKey}`}
                                className="w-full h-full border-0 absolute inset-0"
                                title={t('portfolio.edit.portfolio_preview')}
                                loading="lazy"
                            />

                            {/* Back Button - Top Left */}
                            <div className="fixed top-20 left-4 z-50">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => window.history.back()}
                                    className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </motion.button>
                            </div>

                            {/* Floating Action Buttons - Top Right */}
                            <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
                                {/* QR Code FAB */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowQR(true)}
                                    className="w-12 h-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200/50 dark:border-gray-600/50 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                                >
                                    <QrCode className="w-5 h-5" />
                                </motion.button>

                                {/* Main Edit FAB */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setDragY(0); // Reset la position du drag
                                        setShowMobileControls(!showMobileControls);
                                    }}
                                    className={cn(
                                        "w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 border-2",
                                        showMobileControls
                                            ? "bg-red-500 hover:bg-red-600 border-red-400 text-white"
                                            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-blue-400 text-white"
                                    )}
                                >
                                    <motion.div
                                        animate={{ rotate: showMobileControls ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {showMobileControls ? (
                                            <X className="w-6 h-6" />
                                        ) : (
                                            <Edit className="w-6 h-6" />
                                        )}
                                    </motion.div>
                                </motion.button>

                            </div>

                            {/* Bottom Drawer */}
                            <AnimatePresence>
                                {showMobileControls && (
                                    <>
                                        {/* Backdrop */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 bg-black/50 z-40"
                                            onClick={() => setShowMobileControls(false)}
                                        />

                                        {/* Bottom Sheet */}
                                        <motion.div
                                            initial={{ y: '100%' }}
                                            animate={{ y: 0 }}
                                            exit={{ y: '100%' }}
                                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                            drag="y"
                                            dragConstraints={{ top: 0, bottom: 0 }}
                                            dragElastic={{ top: 0, bottom: 0.2 }}
                                            onDragEnd={(_, info) => {
                                                if (info.offset.y > 100) {
                                                    setShowMobileControls(false);
                                                    setDragY(0); // Reset pour la prochaine fois
                                                }
                                            }}
                                            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
                                        >
                                            {/* Handle - Draggable */}
                                            <div
                                                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                                                onTouchStart={(e) => e.stopPropagation()}
                                            >
                                                <div className="w-12 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
                                            </div>

                                            {/* Header avec Save Button */}
                                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Paramètres
                                                    </h3>
                                                    <Button
                                                        onClick={() => setShowMobileControls(false)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                {/* Save Button dans le header */}
                                                <form onSubmit={onSubmit}>
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 font-medium"
                                                    >
                                                        {processing ? (
                                                            <>
                                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                                Sauvegarde...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="h-4 w-4 mr-2" />
                                                                Sauvegarder
                                                            </>
                                                        )}
                                                    </Button>
                                                </form>
                                            </div>

                                            {/* Content */}
                                            <div className="overflow-y-auto max-h-[calc(80vh-160px)]">
                                                <div className="p-4 space-y-4">
                                                    {/* Design Selection - Compact */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Design
                                                        </h4>
                                                        <div className="grid grid-cols-3 gap-1.5">
                                                            {DESIGN_OPTIONS.map((option) => (
                                                                <motion.div
                                                                    key={option.value}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className={cn(
                                                                        "p-2 rounded-lg border cursor-pointer transition-all duration-200 relative",
                                                                        data.design === option.value
                                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                                                            : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                                                                    )}
                                                                    onClick={() => setData('design', option.value)}
                                                                >
                                                                    <div className="text-center p-1.5">
                                                                        <div className="text-base mb-0.5">
                                                                            {option.icon || '🎨'}
                                                                        </div>
                                                                        <h5 className="font-medium text-gray-900 dark:text-white text-xs leading-tight">
                                                                            {option.labelKey === 'glassmorphism' ? 'Glass' :
                                                                                option.labelKey === 'neonCyber' ? 'Neon' :
                                                                                    option.labelKey === 'elegantCorporate' ? 'Corp' :
                                                                                        option.labelKey === 'artisticShowcase' ? 'Art' :
                                                                                            option.labelKey === 'dynamicTech' ? 'Tech' :
                                                                                                option.labelKey === 'glass' ? 'Crystal' :
                                                                                                    option.labelKey === 'neon' ? 'Futur' :
                                                                                                        option.labelKey === 'particle' ? 'Cosmic' :
                                                                                                            option.labelKey === 'wave' ? 'Ocean' :
                                                                                                                option.labelKey === 'morphing' ? 'Fluid' :
                                                                                                                    t(`portfolio.edit.${option.labelKey}`)}
                                                                        </h5>
                                                                    </div>
                                                                    {data.design === option.value && (
                                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Color Picker - Compact */}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                            Couleur
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="color"
                                                                value={data.primary_color}
                                                                onChange={(e) => setData('primary_color', e.target.value)}
                                                                className="w-12 h-8 rounded cursor-pointer border"
                                                            />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono flex-1">
                                                                {data.primary_color}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                onClick={() => setData('primary_color', '#f59e0b')}
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs"
                                                            >
                                                                Reset
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Sections - Ultra Compact */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    Sections visibles
                                                                </h4>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    Tap pour afficher/masquer
                                                                </p>
                                                            </div>
                                                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                                                {sections.filter(s => s.isActive).length}/{sections.length}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            {sections.map((section) => {
                                                                const IconComponent = section.icon;
                                                                return (
                                                                    <div
                                                                        key={section.key}
                                                                        className={cn(
                                                                            "flex flex-col items-center p-2 rounded-lg border transition-all cursor-pointer",
                                                                            section.count === 0
                                                                                ? "border-orange-200 dark:border-orange-600 bg-orange-50 dark:bg-orange-950 opacity-60"
                                                                                : section.isActive
                                                                                    ? "border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-950"
                                                                                    : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                        )}
                                                                        onClick={() => {
                                                                            if (section.count > 0) {
                                                                                handleToggleSection(section.key);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className={cn(
                                                                            "w-6 h-6 rounded-full flex items-center justify-center mb-1",
                                                                            section.count === 0
                                                                                ? "bg-orange-100 dark:bg-orange-800 text-orange-500"
                                                                                : section.isActive
                                                                                    ? "bg-green-100 dark:bg-green-800 text-green-600"
                                                                                    : "bg-gray-100 dark:bg-gray-600 text-gray-400"
                                                                        )}>
                                                                            <IconComponent className="w-3 h-3" />
                                                                        </div>
                                                                        <span className="text-xs font-medium text-gray-900 dark:text-white text-center leading-tight">
                                                                            {section.label.split(' ')[0]}
                                                                        </span>
                                                                        <div className="text-xs text-gray-500 text-center">
                                                                            {section.count}
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            <div className={cn(
                                                                                "w-3 h-3 rounded-full",
                                                                                section.isActive ? "bg-green-500" : "bg-gray-300"
                                                                            )} />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* Desktop Layout */
                        <div className={cn("grid gap-6", previewMode ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2")}>

                            {/* Colonne 1: Choix de modèle */}
                            <div className="space-y-4">
                                <form onSubmit={onSubmit} id="portfolio-form">
                                    {/* Design & Couleur */}
                                    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                    <div>
                                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('portfolio.edit.designStyle')}</h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => setShowQR(!showQR)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2"
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => setPreviewMode(!previewMode)}
                                                        variant={previewMode ? "default" : "ghost"}
                                                        size="sm"
                                                        className="h-8 px-3"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        {previewMode ? t('portfolio.edit.hide') : t('portfolio.edit.preview')}
                                                    </Button>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Sélection du design */}
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">{t('portfolio.edit.chooseTheme')}</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {DESIGN_OPTIONS.map((option) => (
                                                        <motion.div
                                                            key={option.value}
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            className={cn(
                                                                "p-2 rounded-lg border cursor-pointer transition-all duration-200 relative",
                                                                data.design === option.value
                                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 ring-1 ring-blue-200"
                                                                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
                                                            )}
                                                            onClick={() => setData('design', option.value)}
                                                        >
                                                            <div className="text-center">
                                                                <div className="text-sm mb-1">
                                                                    {option.icon || '🎨'}
                                                                </div>
                                                                <h4 className="font-medium text-gray-900 dark:text-white text-xs">
                                                                    {option.labelKey === 'glassmorphism' ? 'Glassmorphism' :
                                                                        option.labelKey === 'neonCyber' ? 'Neon Cyber' :
                                                                            option.labelKey === 'elegantCorporate' ? 'Corporate' :
                                                                                option.labelKey === 'artisticShowcase' ? 'Artistique' :
                                                                                    option.labelKey === 'dynamicTech' ? 'Tech' :
                                                                                        option.labelKey === 'glass' ? 'Crystal Glass' :
                                                                                            option.labelKey === 'neon' ? 'Neon Futuriste' :
                                                                                                option.labelKey === 'particle' ? 'Particule Cosmique' :
                                                                                                    option.labelKey === 'wave' ? 'Ocean Wave' :
                                                                                                        option.labelKey === 'morphing' ? 'Morphing Fluide' :
                                                                                                            t(`portfolio.edit.${option.labelKey}`)}
                                                                </h4>
                                                            </div>

                                                            {/* Selected Indicator */}
                                                            {data.design === option.value && (
                                                                <motion.div
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                                                                >
                                                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </motion.div>
                                                            )}

                                                            {/* New Badge for our custom designs */}
                                                            {option.icon && (
                                                                <div className="absolute top-1 left-1">
                                                                    <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                                                        NEW
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Couleur principale */}
                                            <div className="border border-gray-200 dark:border-gray-600 p-3 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">{t('portfolio.edit.primaryColor')}</Label>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Input
                                                            type="color"
                                                            value={data.primary_color}
                                                            onChange={(e) => setData('primary_color', e.target.value)}
                                                            className="w-10 h-8 rounded cursor-pointer border"
                                                        />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                            {data.primary_color}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            onClick={() => setData('primary_color', '#f59e0b')}
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 px-2 text-xs"
                                                        >
                                                            {t('portfolio.edit.default')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bouton de sauvegarde */}
                                            <div className="pt-4">
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium"
                                                >
                                                    {processing ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                            {t('portfolio.edit.saving')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="h-4 w-4 mr-2" />
                                                            {t('portfolio.edit.saveChanges')}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </form>
                            </div>

                            {/* Colonne 2: Visibilité des Sections */}
                            <div className="space-y-4">
                                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                <div>
                                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('portfolio.edit.sectionManagement')}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {sections.filter(s => s.isActive).length}/{sections.length}
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
                                                            "flex items-center gap-3 p-2 rounded-lg border transition-all duration-200",
                                                            section.count === 0
                                                                ? "cursor-not-allowed opacity-60 border-orange-200 dark:border-orange-600 bg-orange-50 dark:bg-orange-950"
                                                                : section.isActive
                                                                    ? "cursor-pointer border-green-200 dark:border-green-600 bg-green-50 dark:bg-green-950"
                                                                    : "cursor-pointer border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 opacity-75 hover:opacity-90"
                                                        )}
                                                        onClick={() => section.count > 0 && handleToggleSection(section.key)}
                                                    >
                                                        {/* Section Icon */}
                                                        <div className={cn(
                                                            "flex items-center justify-center w-6 h-6 rounded transition-all duration-200 shrink-0",
                                                            section.count === 0
                                                                ? "bg-orange-100 dark:bg-orange-800 text-orange-500 dark:text-orange-400"
                                                                : section.isActive
                                                                    ? "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300"
                                                                    : "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-300"
                                                        )}>
                                                            <IconComponent className="w-3 h-3" />
                                                        </div>

                                                        {/* Section Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className={cn(
                                                                        "text-sm font-medium block",
                                                                        section.count === 0
                                                                            ? "text-orange-700 dark:text-orange-400"
                                                                            : section.isActive
                                                                                ? "text-gray-900 dark:text-white"
                                                                                : "text-gray-500 dark:text-gray-400"
                                                                    )}>
                                                                        {section.label}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {section.count}
                                                                    </span>
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
                                                                        className="data-[state=checked]:bg-green-500 shrink-0"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>

                                        {/* Actions rapides */}
                                        <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-600">
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
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    {t('portfolio.edit.showAll')}
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
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    {t('portfolio.edit.hideEmpty')}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Colonne 3: Prévisualisation */}
                            {previewMode && (
                                <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-4"
                                >
                                    <Card className="sticky top-6 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-3">
                                                <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                <div>
                                                    <span className="text-base font-semibold text-gray-900 dark:text-white">{t('portfolio.edit.livePreview')}</span>
                                                </div>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="p-3">
                                                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                                    <iframe
                                                        key={`desktop-preview-${previewKey}`}
                                                        src={`${portfolioUrl}?v=${previewKey}`}
                                                        className="w-full h-full border-0 scale-75 origin-top-left"
                                                        style={{ width: '133.33%', height: '133.33%' }}
                                                        title={t('portfolio.edit.portfolio_preview')}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-600">
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => window.open(portfolioUrl, '_blank')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 h-8 text-xs"
                                                    >
                                                        <Share className="h-3 w-3 mr-1" />
                                                        {t('portfolio.edit.fullscreen')}
                                                    </Button>
                                                    <Button
                                                        onClick={() => setShowQR(true)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs"
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// QR Code Generator component
const QRCodeGenerator = ({
    url,
    isOpen,
    onClose,
    userPhoto
}: {
    url: string;
    isOpen: boolean;
    onClose: () => void;
    userPhoto?: string;
}) => {
    const { t } = useTranslation();
    const [qrCodeRef, setQrCodeRef] = React.useState<HTMLCanvasElement | null>(null);

    if (!isOpen) return null;

    const shareQRCodeImage = async (platform: string) => {
        if (!qrCodeRef) return;

        try {
            // Convert QR code to blob
            qrCodeRef.toBlob(async (blob) => {
                if (!blob) return;

                const shareText = `Découvrez mon portfolio professionnel : ${url}`;

                if (platform === 'whatsapp') {
                    // For WhatsApp, we can try to share the image if Web Share API is supported
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'qrcode.png', { type: 'image/png' })] })) {
                        try {
                            await navigator.share({
                                text: shareText,
                                files: [new File([blob], 'qrcode.png', { type: 'image/png' })]
                            });
                            return;
                        } catch (error) {
                            console.log('Native share failed, falling back to URL');
                        }
                    }
                    // Fallback to WhatsApp URL with text
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                } else {
                    // For other platforms, download the QR code and open share URL
                    const link = document.createElement('a');
                    link.download = 'qrcode-portfolio.png';
                    link.href = URL.createObjectURL(blob);
                    link.click();

                    // Then open the share URL
                    const shareUrls = {
                        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                        x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
                        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    };

                    if (shareUrls[platform as keyof typeof shareUrls]) {
                        setTimeout(() => {
                            window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
                        }, 500);
                    }
                }
            }, 'image/png', 0.9);
        } catch (error) {
            console.error('Error sharing QR code:', error);
            // Fallback to simple URL sharing
            const shareUrls = {
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                x: `https://x.com/intent/tweet?text=${encodeURIComponent('Découvrez mon portfolio professionnel : ' + url)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                whatsapp: `https://wa.me/?text=${encodeURIComponent('Découvrez mon portfolio : ' + url)}`,
            };
            window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h3 className="text-lg font-bold mb-4">{t('portfolio.share.title')}</h3>

                    {/* Beautiful QR Code with Guidy branding */}
                    <div className="mb-4">
                        <PortfolioQRCode
                            value={url}
                            size={200}
                            profilePicture={userPhoto}
                            className="flex flex-col items-center compact-mode"
                            onQRReady={(canvas) => setQrCodeRef(canvas)}
                        />
                        <p className="text-xs text-gray-500 break-all px-2 mt-2">{url}</p>
                    </div>

                    {/* Social sharing buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('linkedin')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {t('portfolio.share.linkedin')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('x')}
                            className="bg-black hover:bg-gray-800 text-white"
                        >
                            X (Twitter)
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('facebook')}
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                        >
                            {t('portfolio.share.facebook')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('whatsapp')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {t('portfolio.share.whatsapp')}
                        </Button>
                    </div>

                    {/* Copy link */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="w-full mb-2"
                    >
                        {t('portfolio.controls.copyLink')}
                    </Button>

                    {/* Close button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        className="w-full"
                    >
                        {t('portfolio.edit.close')}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};