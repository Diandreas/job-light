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
    Settings, Sparkles, Plus, Edit, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import CVSectionManager from '@/Components/Portfolio/CVSectionManager';
import ServiceManager from '@/Components/Portfolio/ServiceManager';
import { __ } from '@/utils/translation';
import EnhancedQRCode from '@/Components/Portfolio/EnhancedQRCode';

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

export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, sectionGroups = {}, portfolioStats }) {
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Portfolio Express</h2>
                            <p className="text-xs text-gray-500">{t.quickConfig}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={currentLang}
                            onChange={(e) => setCurrentLang(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 h-8"
                        >
                            <option value="fr">FR</option>
                            <option value="en">EN</option>
                        </select>
                        <Button
                            onClick={() => setShowQR(!showQR)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3"
                        >
                            <QrCode className="h-3 w-3 mr-1" />
                            {t.qrCode}
                        </Button>
                        <Button
                            onClick={() => setPreviewMode(!previewMode)}
                            variant={previewMode ? "default" : "outline"}
                            size="sm"
                            className="h-8 px-3"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                            {previewMode ? t.hide : t.preview}
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Portfolio Express" />

            <div className="py-4 md:py-8">
                <div className="mx-auto max-w-6xl px-4 md:px-6">

                    {/* Enhanced QR Code Modal */}
                    <EnhancedQRCode
                        url={portfolioUrl}
                        isOpen={showQR}
                        onClose={() => setShowQR(false)}
                        user={auth.user}
                        portfolioStats={realPortfolioStats}
                    />

                    <div className={cn("grid gap-4 md:gap-8", previewMode ? "lg:grid-cols-3" : "lg:grid-cols-1")}>

                        {/* Configuration principale */}
                        <div className={cn("space-y-2 md:space-y-6", previewMode ? "lg:col-span-2" : "lg:col-span-1")}>

                            {/* Save Button - Ultra Compact Sticky */}
                            <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-sm rounded p-1.5 shadow-sm border">
                                <Button
                                    type="submit"
                                    form="portfolio-form"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white text-xs py-1.5"
                                >
                                    {processing ? (
                                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                        <Save className="h-3 w-3 mr-1" />
                                    )}
                                    {processing ? __('portfolio.edit.saving') : __('portfolio.edit.save')}
                                </Button>
                            </div>

                            <form onSubmit={onSubmit} id="portfolio-form" className="space-y-2 md:space-y-4">

                                {/* Design & Couleur */}
                                <Card className="border-l-2 border-l-amber-400 shadow-sm">
                                    <CardContent className="p-3 md:p-6">
                                        <div className="flex items-center justify-between mb-3 md:mb-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <Palette className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                                                <span className="text-sm md:text-base font-medium text-gray-900">{t.designStyle}</span>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-4">
                                                <Input
                                                    type="color"
                                                    value={data.primary_color}
                                                    onChange={(e) => setData('primary_color', e.target.value)}
                                                    className="h-6 w-8 md:h-8 md:w-12 rounded border-amber-200"
                                                />
                                                <select
                                                    value={data.design}
                                                    onChange={(e) => setData('design', e.target.value)}
                                                    className="text-xs md:text-sm border border-gray-300 rounded px-2 py-1 h-6 md:h-8 md:px-3 md:py-2"
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
                                <Card className="border-l-2 border-l-green-400 shadow-sm">
                                    <CardContent className="p-3 md:p-6">
                                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                            <Settings className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                            <span className="text-sm md:text-base font-medium text-gray-900">{t.portfolioSections}</span>
                                            <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                                                {sections.filter(s => s.isActive).length}/{sections.length}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                                            {sections.map((section, index) => {
                                                const IconComponent = section.icon;

                                                return (
                                                    <div
                                                        key={section.key}
                                                        className={cn(
                                                            "flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg border transition-all",
                                                            !section.isActive && "opacity-40"
                                                        )}
                                                    >
                                                        {/* Contrôles d'ordre */}
                                                        <div className="flex flex-col gap-0.5">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleMoveSection(section.key, 'up')}
                                                                disabled={index === 0}
                                                                className="h-5 w-5 md:h-6 md:w-6 p-0 hover:bg-gray-200"
                                                            >
                                                                <ArrowUp className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleMoveSection(section.key, 'down')}
                                                                disabled={index === sections.length - 1}
                                                                className="h-5 w-5 md:h-6 md:w-6 p-0 hover:bg-gray-200"
                                                            >
                                                                <ArrowDown className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                            </Button>
                                                        </div>

                                                        <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-green-600 shrink-0" />

                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs md:text-sm font-medium text-gray-800 truncate block">
                                                                {section.label}
                                                            </span>
                                                        </div>

                                                        <Badge
                                                            className={cn(
                                                                "text-xs px-1.5 py-0.5 h-5 min-w-[24px] text-center",
                                                                section.count === 0 ? "bg-red-500 text-white" : "bg-green-500 text-white"
                                                            )}
                                                        >
                                                            {section.count}
                                                        </Badge>

                                                        <Switch
                                                            checked={section.isActive}
                                                            onCheckedChange={() => handleToggleSection(section.key)}
                                                            className="h-5 w-9 md:h-6 md:w-11 data-[state=checked]:bg-green-500"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Gestion des Services */}
                                {data.show_services && (
                                    <Card className="border-l-2 border-l-blue-400 shadow-sm">
                                        <CardContent className="p-3 md:p-6">
                                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <Wrench className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                                                    <span className="text-sm md:text-base font-medium text-gray-900">{t.services}</span>
                                                    <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                                                        {services?.length || 0}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowServiceModal(true)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Gérer les services
                                                </Button>
                                            </div>

                                            {services && services.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {services.slice(0, 4).map((service) => (
                                                        <div key={service.id} className="p-2 bg-blue-50 rounded border text-xs">
                                                            <div className="font-medium text-blue-900 truncate">{service.title}</div>
                                                            <div className="text-blue-700 truncate">{service.short_description || service.description}</div>
                                                        </div>
                                                    ))}
                                                    {services.length > 4 && (
                                                        <div className="p-2 bg-gray-100 rounded border text-xs flex items-center justify-center text-gray-600">
                                                            +{services.length - 4} autres
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
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-1"
                            >
                                <Card className="sticky top-4 shadow-lg border-purple-200">
                                    <CardContent className="p-4">
                                        <div className="text-center mb-3">
                                            <h3 className="font-semibold text-sm text-gray-900 flex items-center justify-center gap-2">
                                                <Eye className="h-3 w-3 text-purple-600" />
                                                {t.livePreview}
                                            </h3>
                                        </div>

                                        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 border-2 border-purple-200">
                                            <iframe
                                                src={portfolioUrl}
                                                className="h-full w-full border-0 scale-75 origin-top-left"
                                                style={{ width: '133.33%', height: '133.33%' }}
                                                title="Aperçu portfolio"
                                                loading="lazy"
                                            />
                                        </div>

                                        <Button
                                            onClick={() => window.open(portfolioUrl, '_blank')}
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-3 border-purple-300 text-purple-700 hover:bg-purple-50"
                                        >
                                            <Share className="h-3 w-3 mr-2" />
                                            {t.viewFullscreen}
                                        </Button>
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