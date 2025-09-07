import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, ExternalLink, ArrowRight,
    Download, Share2, Star, Code, Lightbulb, Globe, Calendar
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface ModernDesignProps {
    user: any;
    cvData: any;
    settings: any;
    isPreview?: boolean;
}

// Utility function to safely extract text from objects
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

export default function ModernDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: ModernDesignProps) {
    const { t } = useTranslation();

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#3b82f6';
    const secondaryColor = settings.secondary_color || '#8b5cf6';

    const { scrollY } = useScroll();
    const headerY = useTransform(scrollY, [0, 300], [0, -50]);
    const headerOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">

            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Animated gradient orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-20 left-20 w-72 h-72 rounded-full opacity-20"
                    style={{
                        background: `radial-gradient(circle, ${primaryColor}, transparent)`
                    }}
                />
                <motion.div
                    animate={{
                        x: [0, -120, 0],
                        y: [0, 80, 0],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-15"
                    style={{
                        background: `radial-gradient(circle, ${secondaryColor}, transparent)`
                    }}
                />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, ${primaryColor} 1px, transparent 0)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Hero Section */}
            <motion.section
                style={{ y: headerY, opacity: headerOpacity }}
                className="relative z-10 min-h-screen flex items-center"
            >
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Content */}
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                                    <span className="text-sm text-blue-200">👋 Bonjour, je suis</span>
                                </div>

                                <h1 className="text-5xl md:text-7xl font-bold mb-4">
                                    <span
                                        className="bg-gradient-to-r bg-clip-text text-transparent"
                                        style={{
                                            backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                        }}
                                    >
                                        {user.name || `${cvData?.first_name || ''} ${cvData?.last_name || ''}`.trim()}
                                    </span>
                                </h1>

                                {(settings.tagline || cvData?.professional_title) && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                        className="text-2xl md:text-3xl font-light text-blue-200 mb-6"
                                    >
                                        {settings.tagline || cvData.professional_title}
                                    </motion.p>
                                )}

                                {(settings.bio || cvData?.summary) && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.8 }}
                                        className="text-xl text-gray-300 leading-relaxed max-w-2xl mb-8"
                                    >
                                        {settings.bio || safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                                    </motion.p>
                                )}

                                {/* CTA Buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.8 }}
                                    className="flex flex-wrap gap-4"
                                >
                                    {(cvData?.email || user.email) && (
                                        <Button
                                            size="lg"
                                            className="text-white font-semibold px-8 py-4 rounded-full hover:scale-105 transition-all duration-300 shadow-xl"
                                            style={{
                                                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                            }}
                                            asChild
                                        >
                                            <a href={`mailto:${cvData?.email || user.email}`}>
                                                <Mail className="w-5 h-5 mr-2" />
                                                Contactez-moi
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </a>
                                        </Button>
                                    )}

                                    {/* TODO: Réimplémenter le téléchargement CV plus tard */}
                                    {/* <Button
                                        size="lg"
                                        variant="outline"
                                        className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full hover:scale-105 transition-all duration-300"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Télécharger CV
                                    </Button> */}
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Photo avec effet glassmorphism */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="relative"
                        >
                            <div className="relative">
                                {/* Glow effect */}
                                <div
                                    className="absolute -inset-4 rounded-full blur-2xl opacity-30"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                    }}
                                />

                                {/* Photo container */}
                                <div className="relative w-80 h-80 md:w-96 md:h-96 mx-auto">
                                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/20 backdrop-blur-sm bg-white/5">
                                        {profilePhoto ? (
                                            <img
                                                src={profilePhoto}
                                                alt={`${user.name} - Photo de profil`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-32 h-32 text-white/30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Floating elements */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                                    >
                                        <Code className="w-6 h-6 text-blue-300" />
                                    </motion.div>

                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                        className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center"
                                    >
                                        <Lightbulb className="w-5 h-5 text-yellow-300" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="relative z-10">

                {/* Expériences avec design futuriste */}
                {settings.show_experiences && cvData?.experiences?.length > 0 && (
                    <section className="py-20">
                        <div className="max-w-6xl mx-auto px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                    Mon <span
                                        className="bg-gradient-to-r bg-clip-text text-transparent"
                                        style={{
                                            backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                        }}
                                    >
                                        Parcours
                                    </span>
                                </h2>
                                <p className="text-xl text-gray-300">{t('portfolio.sections.experiences')}</p>
                            </motion.div>

                            <div className="space-y-8">
                                {cvData.experiences.map((exp, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.2, duration: 0.8 }}
                                        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                    >
                                        <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
                                            <CardContent className="p-8">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4 mb-4">
                                                            <div
                                                                className="p-3 rounded-lg shrink-0"
                                                                style={{ backgroundColor: `${primaryColor}20` }}
                                                            >
                                                                <Briefcase className="w-6 h-6" style={{ color: primaryColor }} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-bold text-white mb-1">
                                                                    {exp.name}
                                                                </h3>
                                                                <p className="text-xl text-blue-300 font-medium mb-2">
                                                                    {exp.InstitutionName}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {exp.description && (
                                                            <p className="text-gray-300 leading-relaxed mb-3">
                                                                {safeText(exp.description)}
                                                            </p>
                                                        )}

                                                        {/* Informations détaillées */}
                                                        <div className="space-y-2 mb-3">
                                                            {(exp.date_start || exp.date_end) && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>
                                                                        {exp.date_start && new Date(exp.date_start).toLocaleDateString('fr-FR')}
                                                                        {exp.date_start && exp.date_end && ' - '}
                                                                        {exp.date_end && new Date(exp.date_end).toLocaleDateString('fr-FR')}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {exp.output && (
                                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span>Institution: {exp.InstitutionName}</span>
                                                                </div>
                                                            )}

                                                            {exp.category_name && (
                                                                <div className="inline-block px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-xs text-white">
                                                                    {exp.category_name}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Références */}
                                                        {exp.references && exp.references.length > 0 && (
                                                            <div className="mt-3 p-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                                                                <h4 className="text-sm font-medium text-white mb-2">Références :</h4>
                                                                <div className="space-y-2">
                                                                    {exp.references.map((ref, refIndex) => (
                                                                        <div key={refIndex} className="text-xs text-gray-300">
                                                                            <div className="font-medium text-white">{ref.name}</div>
                                                                            {ref.function && <div>Fonction: {ref.function}</div>}
                                                                            {ref.email && <div>Email: {ref.email}</div>}
                                                                            {ref.telephone && <div>Tél: {ref.telephone}</div>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {exp.attachment_path && (
                                                            <div className="mt-3">
                                                                <a
                                                                    href={exp.attachment_path}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm text-white transition-all duration-300"
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                    {exp.attachment_name || 'Voir le document'}
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Badge
                                                        className="text-white px-4 py-2 text-sm font-medium shrink-0"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${secondaryColor}80, ${primaryColor}80)`,
                                                            backdropFilter: 'blur(8px)'
                                                        }}
                                                    >
                                                        {exp.date_start && exp.date_end ?
                                                            `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                                            exp.date_start ?
                                                                `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - Présent` :
                                                                'Période non spécifiée'
                                                        }
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Skills avec animation interactive */}
                {settings.show_competences && cvData?.competences?.length > 0 && (
                    <section className="py-20 bg-white/5 backdrop-blur-sm">
                        <div className="max-w-6xl mx-auto px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="text-center mb-16"
                            >
                                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                                    Mes <span
                                        className="bg-gradient-to-r bg-clip-text text-transparent"
                                        style={{
                                            backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                        }}
                                    >
                                        {t('portfolio.sections.skills')}
                                    </span>
                                </h2>
                                <p className="text-xl text-gray-300">Technologies et expertise</p>
                            </motion.div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {cvData.competences.map((competence, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05, duration: 0.5 }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotate: [0, -2, 2, 0],
                                            transition: { duration: 0.3 }
                                        }}
                                        className="group"
                                    >
                                        <div className="relative p-6 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 text-center">
                                            {/* Glow effect on hover */}
                                            <div
                                                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
                                                style={{
                                                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                                }}
                                            />

                                            <div className="relative z-10">
                                                <Star className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                                                <p className="text-white font-medium">
                                                    {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Autres sections en grid */}
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <div className="grid md:grid-cols-2 gap-12">

                        {/* Centres d'intérêt */}
                        {settings.show_hobbies && cvData?.hobbies?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 h-full">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{ backgroundColor: `${secondaryColor}20` }}
                                            >
                                                <Heart className="w-6 h-6" style={{ color: secondaryColor }} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">{t('portfolio.sections.hobbies')}</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {cvData.hobbies.map((hobby, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: secondaryColor }}
                                                    />
                                                    <span className="text-gray-300">
                                                        {typeof hobby === 'string' ? hobby : hobby.name || hobby.hobby}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Langues */}
                        {settings.show_languages && cvData?.languages?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="glassmorphism p-8 rounded-2xl"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                        <Globe className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">{t('portfolio.sections.languages')}</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {cvData.languages.map((lang, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl transition-all duration-300"
                                        >
                                            <span className="font-semibold text-white">{lang.name}</span>
                                            {lang.pivot?.language_level && (
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-sm font-medium text-white">
                                                    {lang.pivot.language_level}
                                                </span>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Contact */}
                        {settings.show_contact_info && (cvData?.email || cvData?.phone || cvData?.address) && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 h-full">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div
                                                className="p-3 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}20` }}
                                            >
                                                <Contact className="w-6 h-6" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white">{t('portfolio.sections.contact')}</h3>
                                        </div>

                                        <div className="space-y-6">
                                            {(cvData?.email || user.email) && (
                                                <motion.a
                                                    whileHover={{ x: 5 }}
                                                    href={`mailto:${cvData?.email || user.email}`}
                                                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                                                >
                                                    <div
                                                        className="p-2 rounded-lg group-hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: `${primaryColor}30` }}
                                                    >
                                                        <Mail className="w-5 h-5" style={{ color: primaryColor }} />
                                                    </div>
                                                    <span className="text-gray-300 group-hover:text-white transition-colors">
                                                        {cvData?.email || user.email}
                                                    </span>
                                                </motion.a>
                                            )}
                                            {cvData?.phone && (
                                                <motion.a
                                                    whileHover={{ x: 5 }}
                                                    href={`tel:${cvData.phone}`}
                                                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                                                >
                                                    <div
                                                        className="p-2 rounded-lg group-hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: `${secondaryColor}30` }}
                                                    >
                                                        <Phone className="w-5 h-5" style={{ color: secondaryColor }} />
                                                    </div>
                                                    <span className="text-gray-300 group-hover:text-white transition-colors">
                                                        {cvData.phone}
                                                    </span>
                                                </motion.a>
                                            )}
                                            {cvData?.address && (
                                                <motion.div
                                                    whileHover={{ x: 5 }}
                                                    className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group"
                                                >
                                                    <div
                                                        className="p-2 rounded-lg group-hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: `${primaryColor}30` }}
                                                    >
                                                        <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                                                    </div>
                                                    <span className="text-gray-300 group-hover:text-white transition-colors">
                                                        {cvData.address}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer futuriste */}
            <footer className="relative z-10 py-12 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <p className="text-gray-400 mb-4">
                            🚀 Portfolio moderne de {user.name} • Propulsé par JobLight
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-gray-400 hover:text-white"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Partager
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            © {new Date().getFullYear()} • Conçu avec ❤️ pour l'avenir
                        </p>
                    </motion.div>
                </div>
            </footer>
        </div>
    );
}