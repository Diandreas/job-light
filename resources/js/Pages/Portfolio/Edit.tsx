import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import {
    Palette, Eye, Save, RefreshCw, Crown, QrCode, Share,
    Briefcase, Award, Heart, FileText, Contact, Settings, Zap, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import DesignSelector from '@/Components/Portfolio/DesignSelector';

export default function SimpleEdit({ auth, portfolio, settings, cvData }) {
    const [previewMode, setPreviewMode] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const { data, setData, put, processing } = useForm({
        design: settings.design || 'professional',
        primary_color: settings.primary_color || '#f59e0b',
        // Auto-activation des sections selon les données CV
        show_experiences: settings.show_experiences ?? (cvData?.experiences?.length > 0),
        show_competences: settings.show_competences ?? (cvData?.skills?.length > 0),
        show_hobbies: settings.show_hobbies ?? (cvData?.hobbies?.length > 0),
        show_summary: settings.show_summary ?? Boolean(cvData?.summary),
        show_contact_info: settings.show_contact_info ?? Boolean(cvData?.email || cvData?.phone),
        show_languages: settings.show_languages ?? (cvData?.languages?.length > 0),
    });

    const previewRef = React.useRef(null);
    const portfolioUrl = `${window.location.origin}/portfolio/${auth.user.username || auth.user.email}`;

    const onSubmit = (e) => {
        e.preventDefault();
        put(route('portfolio.update'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                if (previewMode && previewRef.current) {
                    previewRef.current.src = previewRef.current.src;
                }
            }
        });
    };

    const generateQRCode = () => {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portfolioUrl)}`;
    };

    const sharePortfolio = (platform) => {
        const text = `Découvrez mon portfolio professionnel : ${portfolioUrl}`;
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`,
        };
        window.open(urls[platform], '_blank', 'width=600,height=400');
    };

    const quickSections = [
        { key: 'experiences', icon: Briefcase, label: 'Expériences', count: cvData?.experiences?.length || 0 },
        { key: 'competences', icon: Award, label: 'Compétences', count: cvData?.skills?.length || 0 },
        { key: 'hobbies', icon: Heart, label: 'Centres d\'intérêt', count: cvData?.hobbies?.length || 0 },
        { key: 'languages', icon: Globe, label: 'Langues', count: cvData?.languages?.length || 0 },
        { key: 'summary', icon: FileText, label: 'Résumé', count: cvData?.summary ? 1 : 0 },
        { key: 'contact_info', icon: Contact, label: 'Contact', count: (cvData?.email ? 1 : 0) + (cvData?.phone ? 1 : 0) },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                            Portfolio Express
                        </h2>
                        <Badge className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-700 border-amber-300">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                        </Badge>
                    </div>

                    {/* Actions Desktop */}
                    <div className="hidden md:flex gap-2">
                        <Button
                            onClick={() => setShowQR(!showQR)}
                            variant="outline"
                            size="sm"
                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                            <QrCode className="h-4 w-4 mr-2" />
                            QR Code
                        </Button>
                        <Button
                            onClick={() => setPreviewMode(!previewMode)}
                            variant={previewMode ? "default" : "outline"}
                            size="sm"
                            className={previewMode ? "bg-gradient-to-r from-amber-500 to-purple-500" : "border-purple-300 text-purple-700 hover:bg-purple-50"}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {previewMode ? 'Masquer' : 'Aperçu'}
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Portfolio Express" />

            <div className="py-3 md:py-6">
                <div className="mx-auto max-w-5xl px-3 md:px-6">

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
                                <Card className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                                    <CardContent className="p-6 text-center">
                                        <h3 className="font-bold mb-4 text-gray-900">Partager votre Portfolio</h3>
                                        <div className="mb-4">
                                            <img
                                                src={generateQRCode()}
                                                alt="QR Code"
                                                className="mx-auto mb-4 rounded-lg shadow-md"
                                            />
                                            <p className="text-xs text-gray-600 break-all">{portfolioUrl}</p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <Button size="sm" onClick={() => sharePortfolio('linkedin')} className="bg-blue-600 hover:bg-blue-700">
                                                LinkedIn
                                            </Button>
                                            <Button size="sm" onClick={() => sharePortfolio('twitter')} className="bg-sky-500 hover:bg-sky-600">
                                                Twitter
                                            </Button>
                                            <Button size="sm" onClick={() => sharePortfolio('facebook')} className="bg-blue-700 hover:bg-blue-800">
                                                Facebook
                                            </Button>
                                        </div>

                                        <Button
                                            variant="outline"
                                            onClick={() => setShowQR(false)}
                                            className="w-full mt-4"
                                        >
                                            Fermer
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={cn("grid gap-4", previewMode ? "lg:grid-cols-3" : "lg:grid-cols-1")}>

                        {/* Configuration Principale */}
                        <div className={cn("space-y-4", previewMode ? "lg:col-span-2" : "lg:col-span-1")}>

                            {/* Bouton Sauvegarder Sticky Mobile */}
                            <div className="sticky top-4 z-20 md:hidden">
                                <Button
                                    type="submit"
                                    form="portfolio-form"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 shadow-lg text-white font-medium py-3"
                                >
                                    {processing ? (
                                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5 mr-2" />
                                    )}
                                    {processing ? 'Sauvegarde...' : 'Sauvegarder Portfolio'}
                                </Button>
                            </div>

                            {/* Actions Mobile */}
                            <div className="flex gap-2 md:hidden">
                                <Button
                                    onClick={() => setShowQR(!showQR)}
                                    variant="outline"
                                    className="flex-1 border-amber-300 text-amber-700"
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    QR Code
                                </Button>
                                <Button
                                    onClick={() => setPreviewMode(!previewMode)}
                                    variant={previewMode ? "default" : "outline"}
                                    className={cn(
                                        "flex-1",
                                        previewMode
                                            ? "bg-gradient-to-r from-purple-500 to-amber-500"
                                            : "border-purple-300 text-purple-700"
                                    )}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {previewMode ? 'Masquer' : 'Aperçu'}
                                </Button>
                            </div>

                            <form onSubmit={onSubmit} id="portfolio-form" className="space-y-4">

                                {/* Design Selection - Compact */}
                                <Card className="border-l-4 border-l-amber-400 shadow-md">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-purple-500">
                                                <Palette className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">Design & Style</h3>
                                                <p className="text-xs text-gray-600">Choisissez votre template et couleurs</p>
                                            </div>
                                        </div>

                                        <DesignSelector
                                            currentDesign={data.design}
                                            onDesignChange={(design) => setData('design', design)}
                                            previewData={{ user: auth.user, cvData, settings: data }}
                                        />

                                        <div className="mt-4 pt-4 border-t border-amber-100">
                                            <div className="flex items-center gap-3">
                                                <Label className="text-sm font-medium text-gray-700 flex-shrink-0">Couleur principale</Label>
                                                <div className="flex-1 flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={data.primary_color}
                                                        onChange={(e) => setData('primary_color', e.target.value)}
                                                        className="h-10 w-16 rounded-lg border-2 border-amber-200 focus:border-amber-400"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => setData('primary_color', '#f59e0b')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs px-3 border-amber-300 text-amber-700 hover:bg-amber-50"
                                                    >
                                                        Reset
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sections du Portfolio - Ultra Compact */}
                                < Card className="border-l-4 border-l-purple-400 shadow-md" >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-amber-500">
                                                <Settings className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">Sections à afficher</h3>
                                                <p className="text-xs text-gray-600">Activez les éléments de votre portfolio</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {quickSections.map(({ key, icon: Icon, label, count }) => (
                                                <div
                                                    key={key}
                                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/50 to-purple-50/50 rounded-lg border border-amber-200/50 hover:border-amber-300 transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="w-4 h-4 text-amber-600" />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-gray-800">{label}</span>
                                                            {count > 0 && (
                                                                <Badge className="bg-green-500 text-white px-2 py-0.5 text-xs rounded-full">
                                                                    {count}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={data[`show_${key}` as keyof typeof data]}
                                                        onCheckedChange={(checked) => setData(`show_${key}` as keyof typeof data, checked)}
                                                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500 data-[state=checked]:to-purple-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {cvData && (
                                            <div className="mt-4 p-3 bg-gradient-to-r from-amber-100/70 to-purple-100/70 rounded-lg border border-amber-200">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Crown className="h-3 w-3 text-amber-600" />
                                                    <span className="text-xs font-semibold text-amber-800">Intelligence Automatique</span>
                                                </div>
                                                <p className="text-xs text-amber-700">
                                                    Les sections s'activent automatiquement selon vos données CV existantes
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card >
                            </form >

                            {/* Bouton Sauvegarder Desktop Sticky */}
                            <div className="hidden md:block sticky bottom-6 z-20">
                                <Button
                                    type="submit"
                                    form="portfolio-form"
                                    disabled={processing}
                                    className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 shadow-lg text-white font-medium py-3 rounded-xl"
                                >
                                    {processing ? (
                                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5 mr-2" />
                                    )}
                                    {processing ? 'Sauvegarde en cours...' : 'Sauvegarder Portfolio'}
                                </Button>
                            </div>
                        </div>

                        {/* Aperçu Mobile/Desktop */}
                        {previewMode && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="lg:col-span-1"
                            >
                                <Card className="sticky top-6 shadow-lg border-purple-200">
                                    <CardContent className="p-4">
                                        <div className="text-center mb-4">
                                            <h3 className="font-semibold text-gray-900 flex items-center justify-center gap-2">
                                                <Eye className="h-4 w-4 text-purple-600" />
                                                Aperçu Live
                                            </h3>
                                            <p className="text-xs text-gray-600">Portfolio en temps réel</p>
                                        </div>

                                        <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 border-2 border-purple-200">
                                            <iframe
                                                ref={previewRef}
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
                                            className="w-full mt-4 border-purple-300 text-purple-700 hover:bg-purple-50"
                                        >
                                            <Share className="h-4 w-4 mr-2" />
                                            Voir en pleine page
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