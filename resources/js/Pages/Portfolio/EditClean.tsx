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
    GripVertical, Layout, EyeOff
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
    { value: 'custom', label: 'Personnalisé', desc: 'Drag & drop complet' },
];

const LAYOUT_OPTIONS = [
    { value: '1', label: '1 Colonne', desc: 'Layout vertical' },
    { value: '2', label: '2 Colonnes', desc: 'Layout équilibré' },
    { value: '3', label: '3 Colonnes', desc: 'Layout compact' },
];

const DIVISION_STYLES = [
    { value: 'moderne', label: 'Moderne', desc: 'Bordures arrondies, ombres' },
    { value: 'soft', label: 'Soft', desc: 'Couleurs douces, espaces' },
    { value: 'minimalist', label: 'Minimaliste', desc: 'Lignes nettes, épuré' },
    { value: 'creative', label: 'Créatif', desc: 'Formes, couleurs vives' },
    { value: 'corporate', label: 'Corporate', desc: 'Professionnel, structuré' },
];


export default function EditClean({ auth, portfolio, settings, cvData = portfolio, customSections, services, groupedSections = {} }) {
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [serviceForm, setServiceForm] = useState({
        title: '',
        description: '',
        price: '',
        price_type: 'fixed',
        is_active: true,
        is_featured: false
    });
    const [isCreatingService, setIsCreatingService] = useState(false);
    const [activeTab, setActiveTab] = useState('services');
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
        layout_columns: settings.layout_columns || '2',
        division_style: settings.division_style || 'moderne',
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

    const handleCreateService = async (e) => {
        e.preventDefault();
        if (!serviceForm.title.trim()) return;

        setIsCreatingService(true);
        try {
            const response = await fetch('/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(serviceForm)
            });

            if (response.ok) {
                // Réinitialiser le formulaire
                setServiceForm({
                    title: '',
                    description: '',
                    price: '',
                    price_type: 'fixed',
                    is_active: true,
                    is_featured: false
                });
                // Recharger la page ou mettre à jour les services
                window.location.reload();
            } else {
                console.error('Erreur lors de la création du service');
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsCreatingService(false);
        }
    };

    const handleServiceFormChange = (field: string, value: any) => {
        setServiceForm(prev => ({ ...prev, [field]: value }));
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
                                    className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h3 className="font-semibold text-lg text-center mb-4">Partager votre Portfolio</h3>
                                    <div className="text-center mb-4">
                                        <img
                                            src={generateQRCode()}
                                            alt="QR Code"
                                            className="mx-auto mb-3 rounded-lg shadow-md"
                                        />
                                        <p className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                                            {portfolioUrl}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowQR(false)}
                                        className="w-full"
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

                                {/* Mise en Page & Style */}
                                <Card className="bg-white shadow-lg border-l-4 border-l-purple-500">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                                <Layout className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Mise en Page & Style</h3>
                                                <p className="text-sm text-gray-500 mt-1">Configuration de l'organisation visuelle</p>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Nombre de colonnes */}
                                        <div>
                                            <Label className="text-base font-medium text-gray-700 mb-3 block">Organisation en colonnes</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {LAYOUT_OPTIONS.map((option) => (
                                                    <div
                                                        key={option.value}
                                                        className={cn(
                                                            "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm text-center",
                                                            data.layout_columns === option.value
                                                                ? "border-purple-500 bg-purple-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        )}
                                                        onClick={() => setData('layout_columns', option.value)}
                                                    >
                                                        <h4 className="font-medium text-gray-900 text-sm">{option.label}</h4>
                                                        <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Style des divisions */}
                                        <div>
                                            <Label className="text-base font-medium text-gray-700 mb-3 block">Style des sections</Label>
                                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                                {DIVISION_STYLES.map((style) => (
                                                    <div
                                                        key={style.value}
                                                        className={cn(
                                                            "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm",
                                                            data.division_style === style.value
                                                                ? "border-purple-500 bg-purple-50"
                                                                : "border-gray-200 hover:border-gray-300"
                                                        )}
                                                        onClick={() => setData('division_style', style.value)}
                                                    >
                                                        <h4 className="font-medium text-gray-900 text-sm">{style.label}</h4>
                                                        <p className="text-xs text-gray-500 mt-1">{style.desc}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Aperçu des styles */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Aperçu du style "{DIVISION_STYLES.find(s => s.value === data.division_style)?.label}"</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div 
                                                    className={cn(
                                                        "p-3 bg-white transition-all",
                                                        data.division_style === 'moderne' && "rounded-lg shadow-sm border",
                                                        data.division_style === 'soft' && "rounded-xl shadow-none border border-gray-100",
                                                        data.division_style === 'minimalist' && "rounded-none border-l-4 border-l-gray-300",
                                                        data.division_style === 'creative' && "rounded-2xl shadow-md bg-gradient-to-r from-blue-50 to-purple-50",
                                                        data.division_style === 'corporate' && "rounded-sm shadow-lg border-2 border-gray-200"
                                                    )}
                                                >
                                                    <h4 className="text-sm font-semibold text-gray-800">Section Exemple</h4>
                                                    <p className="text-xs text-gray-600 mt-1">Contenu de démonstration</p>
                                                </div>
                                                <div 
                                                    className={cn(
                                                        "p-3 bg-white transition-all opacity-60",
                                                        data.division_style === 'moderne' && "rounded-lg shadow-sm border",
                                                        data.division_style === 'soft' && "rounded-xl shadow-none border border-gray-100",
                                                        data.division_style === 'minimalist' && "rounded-none border-l-4 border-l-gray-300",
                                                        data.division_style === 'creative' && "rounded-2xl shadow-md bg-gradient-to-r from-green-50 to-yellow-50",
                                                        data.division_style === 'corporate' && "rounded-sm shadow-lg border-2 border-gray-200"
                                                    )}
                                                >
                                                    <h4 className="text-sm font-semibold text-gray-800">Autre Section</h4>
                                                    <p className="text-xs text-gray-600 mt-1">Plus de contenu</p>
                                                </div>
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


                                {/* Interface moderne avec tabs pour les services */}
                                <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
                                    <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                                            <DialogHeader>
                                                <DialogTitle className="text-white text-xl font-semibold flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                                        <Wrench className="h-4 w-4 text-white" />
                                                    </div>
                                                    {__('portfolio.edit.service_management_description')}
                                                </DialogTitle>
                                                <DialogDescription className="text-blue-100">
                                                    Créez, organisez et gérez vos services pour les présenter sur votre portfolio
                                                </DialogDescription>
                                            </DialogHeader>
                                        </div>

                                        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                                <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
                                                    <TabsTrigger value="services" className="flex items-center gap-2">
                                                        <Briefcase className="h-4 w-4" />
                                                        {__('portfolio.edit.my_services')}
                                                    </TabsTrigger>
                                                    <TabsTrigger value="nouveau" className="flex items-center gap-2">
                                                        <Plus className="h-4 w-4" />
                                                        Nouveau Service
                                                    </TabsTrigger>
                                                    <TabsTrigger value="config" className="flex items-center gap-2">
                                                        <Settings className="h-4 w-4" />
                                                        Configuration
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* Tab: My Services */}
                                                <TabsContent value="services" className="space-y-4">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900">{__('portfolio.edit.your_services')}</h3>
                                                            <p className="text-sm text-gray-500">{services?.length || 0} service{(services?.length || 0) > 1 ? 's' : ''} configuré{(services?.length || 0) > 1 ? 's' : ''}</p>
                                                        </div>
                                                        <Button
                                                            className="bg-blue-500 hover:bg-blue-600"
                                                            onClick={() => setActiveTab('nouveau')}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Ajouter un service
                                                        </Button>
                                                    </div>

                                                    {services && services.length > 0 ? (
                                                        <div className="grid gap-4">
                                                            {services.map((service, index) => (
                                                                <Card key={service.id} className="p-4 hover:shadow-md transition-shadow">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex items-start gap-4 flex-1">
                                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                                                                <Wrench className="h-6 w-6 text-blue-600" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="flex items-center gap-3 mb-2">
                                                                                    <h4 className="font-semibold text-gray-900">{service.title}</h4>
                                                                                    {service.is_featured && (
                                                                                        <Badge className="bg-amber-100 text-amber-800">
                                                                                            ⭐ En vedette
                                                                                        </Badge>
                                                                                    )}
                                                                                    <Badge variant={service.is_active ? "default" : "secondary"}>
                                                                                        {service.is_active ? 'Actif' : 'Inactif'}
                                                                                    </Badge>
                                                                                </div>
                                                                                <p className="text-sm text-gray-600 mb-3">{service.short_description || service.description}</p>
                                                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                                    {service.formatted_price && (
                                                                                        <span className="font-medium text-green-600">{service.formatted_price}</span>
                                                                                    )}
                                                                                    <span>Position #{index + 1}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button size="sm" variant="ghost">
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button size="sm" variant="ghost" className="text-red-500">
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-12">
                                                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                                                <Wrench className="h-10 w-10 text-gray-400" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun service configuré</h3>
                                                            <p className="text-gray-500 mb-6">Créez votre premier service pour le présenter sur votre portfolio</p>
                                                            <Button
                                                                className="bg-blue-500 hover:bg-blue-600"
                                                                onClick={() => setActiveTab('nouveau')}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Créer mon premier service
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                {/* Tab: Nouveau Service */}
                                                <TabsContent value="nouveau">
                                                    <div className="max-w-2xl mx-auto">
                                                        <div className="text-center mb-8">
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Créer un nouveau service</h3>
                                                            <p className="text-gray-500">Remplissez les informations de votre service professionnel</p>
                                                        </div>

                                                        {/* Formulaire de création fonctionnel */}
                                                        <form onSubmit={handleCreateService}>
                                                            <Card className="p-6">
                                                                <div className="space-y-6">
                                                                    <div>
                                                                        <Label htmlFor="service-title" className="text-base font-medium">Titre du service *</Label>
                                                                        <Input
                                                                            id="service-title"
                                                                            placeholder="ex: Développement Web, Conseil Marketing..."
                                                                            className="mt-2"
                                                                            value={serviceForm.title}
                                                                            onChange={(e) => handleServiceFormChange('title', e.target.value)}
                                                                            required
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <Label htmlFor="service-desc" className="text-base font-medium">Description</Label>
                                                                        <Textarea
                                                                            id="service-desc"
                                                                            placeholder="Décrivez votre service en quelques mots..."
                                                                            className="mt-2"
                                                                            rows={3}
                                                                            value={serviceForm.description}
                                                                            onChange={(e) => handleServiceFormChange('description', e.target.value)}
                                                                        />
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <Label className="text-base font-medium">Prix</Label>
                                                                            <Input
                                                                                placeholder="500"
                                                                                className="mt-2"
                                                                                type="number"
                                                                                value={serviceForm.price}
                                                                                onChange={(e) => handleServiceFormChange('price', e.target.value)}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-base font-medium">Type de prix</Label>
                                                                            <select
                                                                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md"
                                                                                value={serviceForm.price_type}
                                                                                onChange={(e) => handleServiceFormChange('price_type', e.target.value)}
                                                                            >
                                                                                <option value="fixed">Prix fixe</option>
                                                                                <option value="hourly">Par heure</option>
                                                                                <option value="daily">Par jour</option>
                                                                                <option value="project">Par projet</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center space-x-2">
                                                                            <Switch
                                                                                id="active"
                                                                                checked={serviceForm.is_active}
                                                                                onCheckedChange={(checked) => handleServiceFormChange('is_active', checked)}
                                                                            />
                                                                            <Label htmlFor="active">Service actif</Label>
                                                                        </div>
                                                                        <div className="flex items-center space-x-2">
                                                                            <Switch
                                                                                id="featured"
                                                                                checked={serviceForm.is_featured}
                                                                                onCheckedChange={(checked) => handleServiceFormChange('is_featured', checked)}
                                                                            />
                                                                            <Label htmlFor="featured">Mettre en vedette</Label>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex gap-3 pt-4">
                                                                        <Button
                                                                            type="submit"
                                                                            className="flex-1 bg-blue-500 hover:bg-blue-600"
                                                                            disabled={isCreatingService || !serviceForm.title.trim()}
                                                                        >
                                                                            {isCreatingService ? (
                                                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                                            ) : (
                                                                                <Save className="h-4 w-4 mr-2" />
                                                                            )}
                                                                            {isCreatingService ? 'Création...' : 'Créer le service'}
                                                                        </Button>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            className="flex-1"
                                                                            onClick={() => setServiceForm({
                                                                                title: '',
                                                                                description: '',
                                                                                price: '',
                                                                                price_type: 'fixed',
                                                                                is_active: true,
                                                                                is_featured: false
                                                                            })}
                                                                        >
                                                                            Réinitialiser
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        </form>
                                                    </div>
                                                </TabsContent>

                                                {/* Tab: Configuration */}
                                                <TabsContent value="config">
                                                    <div className="max-w-4xl mx-auto space-y-6">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{__('portfolio.edit.service_configuration')}</h3>
                                                            <p className="text-gray-500">Paramètres généraux et organisation de vos services</p>
                                                        </div>

                                                        <Card className="p-6">
                                                            <h4 className="font-medium text-gray-900 mb-4">Paramètres d'affichage</h4>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <Label className="text-base font-medium">Afficher les services sur le portfolio</Label>
                                                                        <p className="text-sm text-gray-500">Activez cette option pour afficher vos services sur votre portfolio public</p>
                                                                    </div>
                                                                    <Switch checked={true} />
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <Label className="text-base font-medium">Afficher les prix</Label>
                                                                        <p className="text-sm text-gray-500">Les prix de vos services seront visibles par les visiteurs</p>
                                                                    </div>
                                                                    <Switch checked={true} />
                                                                </div>
                                                            </div>
                                                        </Card>

                                                        <Card className="p-6">
                                                            <h4 className="font-medium text-gray-900 mb-4">Organisation</h4>
                                                            <p className="text-sm text-gray-500 mb-4">{__('portfolio.edit.service_reorder_tip')}</p>
                                                            <div className="flex gap-3">
                                                                <Button variant="outline">
                                                                    Réinitialiser l'ordre
                                                                </Button>
                                                                <Button variant="outline">
                                                                    Trier par nom
                                                                </Button>
                                                                <Button variant="outline">
                                                                    Trier par prix
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </DialogContent>
                                </Dialog>



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