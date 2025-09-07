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
];



export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, groupedSections = {} }) {
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
                                "h-11 px-5 font-medium transition-all duration-200",
                                previewMode 
                                    ? "bg-gradient-to-r from-purple-600 to-amber-500 text-white shadow-lg hover:shadow-xl" 
                                    : "border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md"
                            )}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {previewMode ? __('portfolio.edit.hide') : __('portfolio.edit.preview')}
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={__('portfolio.edit.portfolio_express')} />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

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
                                    className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-amber-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                            <QrCode className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="font-bold text-2xl text-gray-900 mb-2">Partager votre Portfolio</h3>
                                        <p className="text-gray-600">Scannez le QR code pour accéder à votre portfolio</p>
                                    </div>
                                    <div className="text-center mb-6">
                                        <div className="p-6 bg-gray-50 rounded-2xl shadow-inner mb-4">
                                            <img
                                                src={generateQRCode()}
                                                alt="QR Code"
                                                className="mx-auto rounded-xl"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600 break-all bg-gray-100 p-3 rounded-lg font-mono">
                                            {portfolioUrl}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQR(false)}
                                        className="w-full h-12 font-semibold border-gray-300 hover:bg-gray-50"
                                    >
                                        Fermer
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={cn("grid gap-8", previewMode ? "lg:grid-cols-3" : "lg:grid-cols-1")}>

                        {/* Configuration principale */}
                        <div className={cn("space-y-6", previewMode ? "lg:col-span-2" : "lg:col-span-1")}>



                            <form onSubmit={onSubmit} id="portfolio-form" className="space-y-8">

                                {/* Design & Couleur */}
                                <Card className="bg-white shadow-xl border-l-4 border-l-violet-500 hover:shadow-2xl transition-shadow duration-300">
                                    <CardHeader className="pb-6 bg-gradient-to-r from-violet-50 to-purple-50">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                                                    <Palette className="h-7 w-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Design & Style</h3>
                                                    <p className="text-sm text-gray-600 font-medium mt-1">Personnalisez l'apparence de votre portfolio</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-violet-100 text-violet-800 font-semibold px-3 py-1.5">
                                                Thème: {DESIGN_OPTIONS.find(d => d.value === data.design)?.label}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Sélection du design */}
                                        <div>
                                            <Label className="text-lg font-semibold text-gray-800 mb-4 block">Choisissez votre thème</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {DESIGN_OPTIONS.map((option) => (
                                                    <motion.div
                                                        key={option.value}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className={cn(
                                                            "p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg",
                                                            data.design === option.value
                                                                ? "border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg ring-2 ring-violet-200"
                                                                : "border-gray-200 hover:border-violet-300 bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-violet-50"
                                                        )}
                                                        onClick={() => setData('design', option.value)}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-gray-900 text-base">{option.label}</h4>
                                                            {data.design === option.value && (
                                                                <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{option.desc}</p>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Couleur principale */}
                                        <div className="bg-gradient-to-r from-gray-50 to-violet-50 p-6 rounded-2xl border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="text-lg font-semibold text-gray-800 mb-1 block">Couleur principale</Label>
                                                    <p className="text-sm text-gray-600">Sélectionnez la couleur dominante de votre portfolio</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <Input
                                                            type="color"
                                                            value={data.primary_color}
                                                            onChange={(e) => setData('primary_color', e.target.value)}
                                                            className="w-20 h-16 rounded-2xl cursor-pointer border-3 border-white shadow-lg hover:shadow-xl transition-shadow"
                                                        />
                                                        <p className="text-xs text-gray-500 font-mono mt-2 bg-white px-2 py-1 rounded-md">
                                                            {data.primary_color}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setData('primary_color', '#f59e0b')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 font-medium"
                                                    >
                                                        Par défaut
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>


                                {/* Visibilité des Sections - Interface Simplifiée */}
                                <Card className="bg-white shadow-xl border-l-4 border-l-emerald-500 hover:shadow-2xl transition-shadow duration-300">
                                    <CardHeader className="pb-6 bg-gradient-to-r from-emerald-50 to-green-50">
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                                                    <Settings className="h-7 w-7 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Gestion des Sections</h3>
                                                    <p className="text-sm text-gray-600 font-medium mt-1">Organisez et configurez les sections de votre portfolio</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className="bg-emerald-100 text-emerald-800 font-semibold px-3 py-1.5">
                                                    {sections.filter(s => s.isActive).length}/{sections.length} Actives
                                                </Badge>
                                                <Badge className="bg-orange-100 text-orange-800 font-semibold px-3 py-1.5">
                                                    {sections.filter(s => s.count === 0).length} Vides
                                                </Badge>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
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
                                                            "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-md",
                                                            section.count === 0
                                                                ? "cursor-not-allowed opacity-60 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50"
                                                                : section.isActive
                                                                    ? "cursor-pointer border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 hover:border-emerald-400 shadow-sm"
                                                                    : "cursor-pointer border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 opacity-75 hover:opacity-90 hover:border-gray-300"
                                                        )}
                                                        onClick={() => section.count > 0 && handleToggleSection(section.key)}
                                                    >
                                                        {/* Section Icon */}
                                                        <div className={cn(
                                                            "flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 shrink-0",
                                                            section.count === 0
                                                                ? "bg-orange-100 text-orange-500"
                                                                : section.isActive
                                                                    ? "bg-emerald-100 text-emerald-600 shadow-md"
                                                                    : "bg-gray-100 text-gray-400"
                                                        )}>
                                                            <IconComponent className="w-6 h-6" />
                                                        </div>

                                                        {/* Section Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <span className={cn(
                                                                        "text-base font-semibold block",
                                                                        section.count === 0
                                                                            ? "text-orange-700"
                                                                            : section.isActive 
                                                                                ? "text-gray-900" 
                                                                                : "text-gray-500"
                                                                    )}>
                                                                        {section.label}
                                                                    </span>
                                                                    <span className="text-sm text-gray-600">
                                                                        {section.count === 0 
                                                                            ? "Aucun contenu disponible" 
                                                                            : `${section.count} élément${section.count > 1 ? 's' : ''}`
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge
                                                                        className={cn(
                                                                            "text-sm px-3 py-1 font-semibold rounded-full",
                                                                            section.count === 0
                                                                                ? "bg-orange-100 text-orange-700"
                                                                                : "bg-blue-100 text-blue-700"
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
                                                                        className="data-[state=checked]:bg-emerald-500 shrink-0 scale-110"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
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