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
    Globe, Wrench, User, ArrowUp, ArrowDown,
    Settings, Sparkles, Plus, Edit, Trash2,
    GripVertical, EyeOff
} from 'lucide-react';

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
];

export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, groupedSections = {} }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const { t } = useTranslation();

    const [sections, setSections] = useState<Section[]>([]);

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

    const generateQRCode = () => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portfolioUrl)}`;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('portfolio.edit.portfolio_express')} />

            <div className="py-4 bg-white dark:bg-gray-950 min-h-screen">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

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
                                    className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg border border-gray-200 dark:border-gray-600"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center mb-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                            <QrCode className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{t('portfolio.edit.sharePortfolio')}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">{t('portfolio.edit.scanQr')}</p>
                                    </div>
                                    <div className="text-center mb-4">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
                                            <img
                                                src={generateQRCode()}
                                                alt="QR Code"
                                                className="mx-auto rounded-lg"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 break-all bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono">
                                            {portfolioUrl}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQR(false)}
                                        className="w-full h-9 font-medium text-sm"
                                    >
                                        {t('portfolio.edit.close')}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                                                    src={portfolioUrl}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}