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
    Palette, Eye, Save, RefreshCw, QrCode, Share,
    Briefcase, Award, Heart, FileText, Contact,
    Globe, Wrench, User, ArrowUp, ArrowDown,
    Settings, Sparkles, Plus, Edit, Trash2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import CVSectionManager from '@/Components/Portfolio/CVSectionManager';
import ServiceManager from '@/Components/Portfolio/ServiceManager';
import { __ } from '@/utils/translation';

// Traductions
const translations = {
    fr: {
        portfolioConfig: 'Configuration Portfolio',
        quickConfig: 'Configuration rapide',
        designStyle: 'Design & Style',
        portfolioSections: 'Sections du Portfolio',
        services: 'Services',
        experiences: 'Expériences',
        competences: 'Compétences',
        hobbies: 'Centres d\'intérêt',
        summary: 'Résumé',
        contact_info: 'Contact',
        languages: 'Langues',
        about: 'À propos',
        preview: 'Aperçu',
        hide: 'Masquer',
        save: 'Sauvegarder',
        saving: 'Sauvegarde...',
        qrCode: 'QR Code',
        sharePortfolio: 'Partager votre Portfolio',
        close: 'Fermer',
        livePreview: 'Aperçu Live',
        viewFullscreen: 'Voir en pleine page',
        professional: 'Pro',
        creative: 'Créatif',
        minimal: 'Minimal',
        modern: 'Moderne'
    },
    en: {
        portfolioConfig: 'Portfolio Configuration',
        quickConfig: 'Quick Configuration',
        designStyle: 'Design & Style',
        portfolioSections: 'Portfolio Sections',
        services: 'Services',
        experiences: 'Experiences',
        competences: 'Skills',
        hobbies: 'Hobbies',
        summary: 'Summary',
        contact_info: 'Contact',
        languages: 'Languages',
        about: 'About',
        preview: 'Preview',
        hide: 'Hide',
        save: 'Save',
        saving: 'Saving...',
        qrCode: 'QR Code',
        sharePortfolio: 'Share your Portfolio',
        close: 'Close',
        livePreview: 'Live Preview',
        viewFullscreen: 'View Fullscreen',
        professional: 'Pro',
        creative: 'Creative',
        minimal: 'Minimal',
        modern: 'Modern'
    }
};

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

const getSectionLabel = (key: string, lang: string) => {
    const labels = {
        experiences: lang === 'en' ? 'Experiences' : 'Expériences',
        competences: lang === 'en' ? 'Skills' : 'Compétences',
        hobbies: lang === 'en' ? 'Hobbies' : 'Centres d\'intérêt',
        summary: lang === 'en' ? 'Summary' : 'Résumé',
        contact_info: lang === 'en' ? 'Contact' : 'Contact',
        languages: lang === 'en' ? 'Languages' : 'Langues',
        services: lang === 'en' ? 'Services' : 'Services',
        about: lang === 'en' ? 'About' : 'À propos',
    };
    return labels[key] || key;
};

const DESIGN_OPTIONS = [
    { value: 'professional', label: 'Professionnel', desc: 'Classique et épuré' },
    { value: 'creative', label: 'Créatif', desc: 'Coloré et dynamique' },
    { value: 'minimal', label: 'Minimal', desc: 'Simple et moderne' },
    { value: 'modern', label: 'Moderne', desc: 'Tendance et stylé' },
];

const TESTIMONIAL_ICONS = {
    testimonials: Heart,
};

export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, sectionGroups = {} }) {
    // Langue par défaut (vous pouvez la récupérer des settings utilisateur)
    const [currentLang, setCurrentLang] = useState('fr');
    const t = translations[currentLang] || translations.fr;
    const [showServiceModal, setShowServiceModal] = useState(false);
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
                count: (cvData?.summary || cvData?.summaries?.length > 0) ? 1 : 0,
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
            label: getSectionLabel(section.key, currentLang),
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
        const updatedSections = sections.map(section =>
            section.key === sectionKey
                ? { ...section, isActive: !section.isActive }
                : section
        );
        setSections(updatedSections);
        setData(`show_${sectionKey}` as any, !sections.find(s => s.key === sectionKey)?.isActive);
    };

    const generateQRCode = () => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portfolioUrl)}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between bg-gradient-to-r from-white via-gray-50 to-white p-4 rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Portfolio Studio</h2>
                            <p className="text-sm text-gray-600 font-medium">{t.quickConfig}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={currentLang}
                            onChange={(e) => setCurrentLang(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-2 h-10 bg-white focus:border-blue-500 transition-colors"
                        >
                            <option value="fr">🇫🇷 FR</option>
                            <option value="en">🇺🇸 EN</option>
                        </select>
                        <Button
                            onClick={() => setShowQR(!showQR)}
                            variant="outline"
                            size="default"
                            className="h-10 px-4 border-gray-300 hover:bg-gray-50"
                        >
                            <QrCode className="h-4 w-4 mr-2" />
                            {t.qrCode}
                        </Button>
                        <Button
                            onClick={() => setPreviewMode(!previewMode)}
                            variant={previewMode ? "default" : "outline"}
                            size="default"
                            className={cn(
                                "h-10 px-4 transition-all duration-200",
                                previewMode 
                                    ? "bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-lg hover:shadow-xl" 
                                    : "border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {previewMode ? t.hide : t.preview}
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Portfolio Express" />

            <div className="py-6 md:py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 md:px-6">

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
                                    className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 className="font-bold text-xl text-center mb-6 text-gray-900">{t.sharePortfolio}</h3>
                                    <div className="text-center mb-6">
                                        <div className="p-4 bg-gray-50 rounded-xl shadow-inner mb-4">
                                            <img
                                                src={generateQRCode()}
                                                alt="QR Code"
                                                className="mx-auto rounded-lg"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600 break-all bg-gray-100 p-3 rounded-lg font-mono">
                                            {portfolioUrl}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQR(false)}
                                        className="w-full h-11 font-medium border-gray-300 hover:bg-gray-50"
                                    >
                                        {t.close}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={cn("grid gap-4 md:gap-8", previewMode ? "lg:grid-cols-3" : "lg:grid-cols-1")}>

                        {/* Configuration principale */}
                        <div className={cn("space-y-4 md:space-y-6", previewMode ? "lg:col-span-2" : "lg:col-span-1")}>

                            {/* Save Button - Enhanced Sticky */}
                            <div className="sticky top-6 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-gray-200/50">
                                <Button
                                    type="submit"
                                    form="portfolio-form"
                                    disabled={processing}
                                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-white font-semibold text-sm shadow-md transition-all duration-200 hover:shadow-lg"
                                >
                                    {processing ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            {__('portfolio.edit.saving')}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {__('portfolio.edit.save')}
                                        </>
                                    )}
                                </Button>
                            </div>

                            <form onSubmit={onSubmit} id="portfolio-form" className="space-y-4 md:space-y-6">

                                {/* Design & Couleur */}
                                <Card className="border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
                                    <CardContent className="p-4 md:p-6">
                                        <div className="flex items-center justify-between mb-4 md:mb-6">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-3 bg-amber-100 rounded-xl">
                                                    <Palette className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900">{t.designStyle}</span>
                                                    <p className="text-sm text-gray-600">Personnalisez l'apparence de votre portfolio</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        value={data.primary_color}
                                                        onChange={(e) => setData('primary_color', e.target.value)}
                                                        className="h-12 w-16 rounded-xl border-2 border-amber-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                                    />
                                                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{data.primary_color}</span>
                                                </div>
                                                <select
                                                    value={data.design}
                                                    onChange={(e) => setData('design', e.target.value)}
                                                    className="text-sm border-2 border-gray-300 rounded-xl px-4 py-3 h-12 bg-white transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-200 shadow-sm"
                                                >
                                                    <option value="professional">{t.professional}</option>
                                                    <option value="creative">{t.creative}</option>
                                                    <option value="minimal">{t.minimal}</option>
                                                    <option value="modern">{t.modern}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sections du Portfolio */}
                                <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
                                    <CardContent className="p-4 md:p-6">
                                        <div className="flex items-center justify-between mb-4 md:mb-6">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="p-3 bg-green-100 rounded-xl">
                                                    <Settings className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div>
                                                    <span className="text-lg font-bold text-gray-900">{t.portfolioSections}</span>
                                                    <p className="text-sm text-gray-600">Organisez les sections de votre portfolio</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-sm px-3 py-2 bg-green-100 text-green-800 font-semibold rounded-full">
                                                {sections.filter(s => s.isActive).length}/{sections.length} actives
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            {sections.map((section, index) => {
                                                const IconComponent = section.icon;

                                                return (
                                                    <motion.div
                                                        key={section.key}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className={cn(
                                                            "flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-md hover:from-gray-100 hover:to-gray-200",
                                                            !section.isActive && "opacity-50 grayscale"
                                                        )}
                                                    >
                                                        {/* Contrôles d'ordre */}
                                                        <div className="flex flex-col gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleMoveSection(section.key, 'up')}
                                                                disabled={index === 0}
                                                                className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                                            >
                                                                <ArrowUp className="h-3 w-3 text-gray-600" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleMoveSection(section.key, 'down')}
                                                                disabled={index === sections.length - 1}
                                                                className="h-7 w-7 p-0 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                                                            >
                                                                <ArrowDown className="h-3 w-3 text-gray-600" />
                                                            </Button>
                                                        </div>

                                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                            <IconComponent className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                                                                {section.label}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {section.count} élément{section.count !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>

                                                        <Badge
                                                            className={cn(
                                                                "text-xs px-2 py-1 font-medium rounded-full",
                                                                section.count === 0 
                                                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                                                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            )}
                                                        >
                                                            {section.count}
                                                        </Badge>

                                                        <Switch
                                                            checked={section.isActive}
                                                            onCheckedChange={() => handleToggleSection(section.key)}
                                                            className="h-6 w-11 data-[state=checked]:bg-green-500 dark:data-[state=checked]:bg-green-400"
                                                        />
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Gestion des Services */}
                                {data.show_services && (
                                    <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white dark:bg-slate-800 dark:border-slate-700">
                                        <CardContent className="p-4 md:p-6">
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                        <Wrench className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t.services}</span>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">Gérez vos services professionnels</p>
                                                    </div>
                                                    <Badge variant="secondary" className="text-sm px-3 py-1.5 h-7 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                                                        {services?.length || 0} services
                                                    </Badge>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="default"
                                                    onClick={() => setShowServiceModal(true)}
                                                    className="flex items-center gap-2 h-10 px-4 border-2 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Gérer les services
                                                </Button>
                                            </div>

                                            {services && services.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {services.slice(0, 4).map((service) => (
                                                        <div key={service.id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700/50 text-sm">
                                                            <div className="font-semibold text-blue-900 dark:text-blue-100 truncate mb-1">{service.title}</div>
                                                            <div className="text-blue-700 dark:text-blue-300 text-xs truncate">{service.short_description || service.description}</div>
                                                        </div>
                                                    ))}
                                                    {services.length > 4 && (
                                                        <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 text-sm flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium">
                                                            +{services.length - 4} autres services
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Modal de gestion des services */}
                                <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
                                    <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Gestion des Services</DialogTitle>
                                            <DialogDescription>
                                                Ajoutez, modifiez ou organisez vos services professionnels
                                            </DialogDescription>
                                        </DialogHeader>
                                        <ServiceManager
                                            services={services || []}
                                            onServiceUpdate={(updatedServices) => {
                                                // Optionnel : Mise à jour des services
                                            }}
                                        />
                                    </DialogContent>
                                </Dialog>


                                {/* Gestion avancée des sections CV */}
                                <CVSectionManager
                                    cvData={cvData}
                                    settings={settings}
                                    onUpdate={(newSettings) => {
                                        // Optionnel : Mise à jour automatique des settings
                                    }}
                                />

                            </form>
                        </div>

                        {/* Aperçu (si activé) */}
                        {previewMode && (
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="lg:col-span-1"
                            >
                                <Card className="sticky top-6 shadow-2xl border-l-4 border-l-purple-500 bg-white dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b dark:border-slate-700">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                    <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t.livePreview}</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">Aperçu en temps réel</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-700 border-2 border-purple-200 dark:border-purple-700/50 shadow-inner">
                                                <iframe
                                                    src={portfolioUrl}
                                                    className="h-full w-full border-0 scale-75 origin-top-left transition-all duration-300"
                                                    style={{ width: '133.33%', height: '133.33%' }}
                                                    title="Aperçu portfolio"
                                                    loading="lazy"
                                                />
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Button
                                                    onClick={() => window.open(portfolioUrl, '_blank')}
                                                    variant="outline"
                                                    size="default"
                                                    className="flex-1 h-10 border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-medium"
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    {t.viewFullscreen}
                                                </Button>
                                                <Button
                                                    onClick={() => setShowQR(true)}
                                                    variant="outline"
                                                    size="default"
                                                    className="h-10 px-4 border-2 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                                >
                                                    <QrCode className="h-4 w-4" />
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