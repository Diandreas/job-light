import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar
} from 'lucide-react';
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { cn } from "@/lib/utils";

interface MinimalDesignProps {
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

export default function MinimalDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: MinimalDesignProps) {
    const { t } = useTranslation();

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#000000';

    return (
        <div className="min-h-screen bg-white">
            {/* Header minimaliste */}
            <motion.header
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-4xl mx-auto px-8 py-16"
            >
                <div className="flex flex-col md:flex-row md:items-center gap-12">

                    {/* Photo de profil simple */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="shrink-0"
                    >
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt={`${user.name} - Photo de profil`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-300" />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Informations principales */}
                    <div className="flex-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-4xl md:text-5xl font-light tracking-tight text-gray-900 mb-2"
                        >
                            {user.name || `${cvData?.first_name || ''} ${cvData?.last_name || ''}`.trim()}
                        </motion.h1>

                        {(settings.tagline || cvData?.professional_title) && (
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, duration: 0.6 }}
                                className="text-xl font-normal text-gray-600 mb-6"
                                style={{ color: primaryColor }}
                            >
                                {settings.tagline || cvData.professional_title}
                            </motion.p>
                        )}

                        {/* Contact simple */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="flex flex-wrap gap-6 text-sm text-gray-500"
                        >
                            {(cvData?.email || user.email) && (
                                <a
                                    href={`mailto:${cvData?.email || user.email}`}
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    {cvData?.email || user.email}
                                </a>
                            )}
                            {cvData?.phone && (
                                <a
                                    href={`tel:${cvData.phone}`}
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    {cvData.phone}
                                </a>
                            )}
                            {cvData?.address && (
                                <span>{cvData.address}</span>
                            )}
                        </motion.div>

                        {/* Bio */}
                        {(settings.bio || cvData?.summary) && (
                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.0, duration: 0.6 }}
                                className="text-gray-700 leading-relaxed mt-8 max-w-2xl"
                            >
                                {settings.bio || safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                            </motion.p>
                        )}
                    </div>
                </div>
            </motion.header>

            <div className="max-w-4xl mx-auto px-8">
                <Separator className="mb-16" />
            </div>

            {/* Main content */}
            <main className="max-w-4xl mx-auto px-8 pb-16">

                {/* Expériences */}
                {settings.show_experiences && cvData?.experiences?.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="mb-16"
                    >
                        <h2 className="text-2xl font-light text-gray-900 mb-8 tracking-wide">
                            Expérience
                        </h2>

                        <div className="space-y-12">
                            {(() => {
                                const groups = cvData.experiences.reduce((acc: any, exp: any) => {
                                    let cat = exp.category_name || t('portfolio.categories.other');
                                    if (!acc[cat]) acc[cat] = [];
                                    acc[cat].push(exp);
                                    return acc;
                                }, {});

                                return Object.entries(groups).map(([category, experiences]: [string, any], groupIndex) => (
                                    <div key={category} className="space-y-6">
                                        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] flex items-center gap-4">
                                            <span>{category}</span>
                                            <div className="h-px bg-gray-100 flex-1" />
                                        </h3>

                                        <div className="space-y-10">
                                            {experiences.map((exp: any, index: number) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * index }}
                                                    className="group relative pl-8 border-l border-gray-100 hover:border-gray-900 transition-colors"
                                                >
                                                    <div className="absolute -left-[3px] top-0 w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gray-900 transition-colors" />

                                                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                                                        <h4 className="text-xl font-medium text-gray-900">
                                                            {exp.name}
                                                        </h4>
                                                        <span className="text-xs font-mono text-gray-400 uppercase tracking-tighter">
                                                            {exp.date_start && exp.date_end ?
                                                                `${new Date(exp.date_start).getFullYear()} / ${new Date(exp.date_end).getFullYear()}` :
                                                                exp.date_start ?
                                                                    `${new Date(exp.date_start).getFullYear()} / NOW` :
                                                                    'TBD'
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="text-gray-500 font-medium text-sm mb-4">
                                                        {exp.InstitutionName}
                                                    </div>

                                                    {exp.description && (
                                                        <div
                                                            className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed rich-text-content"
                                                            dangerouslySetInnerHTML={{ __html: exp.description }}
                                                        />
                                                    )}

                                                    <style>{`
                                                        .rich-text-content ul { list-style-type: square !important; padding-left: 1.25rem !important; margin-top: 0.75rem !important; }
                                                        .rich-text-content li { margin-bottom: 0.35rem !important; }
                                                        .rich-text-content p { margin-bottom: 0.75rem !important; }
                                                    `}</style>

                                                    {exp.references && exp.references.length > 0 && (
                                                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                                                            {exp.references.map((ref: any, refIndex: number) => (
                                                                <div key={refIndex} className="text-[10px] text-gray-400">
                                                                    <span className="font-bold text-gray-600 uppercase mr-2">{ref.name}</span>
                                                                    <span>{ref.function}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </motion.section>
                )}

                {/* Grid pour les autres sections */}
                <div className="grid md:grid-cols-2 gap-16">

                    {/* Compétences */}
                    {settings.show_competences && cvData?.competences?.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6, duration: 0.8 }}
                        >
                            <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                                {t('portfolio.sections.skills')}
                            </h2>

                            <div className="space-y-3">
                                {cvData.competences.map((competence, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.8 + index * 0.05, duration: 0.4 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <span className="text-gray-700 text-sm">
                                            {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Centres d'intérêt */}
                    {settings.show_hobbies && cvData?.hobbies?.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8, duration: 0.8 }}
                        >
                            <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                                Intérêts
                            </h2>

                            <div className="space-y-3">
                                {cvData.hobbies.map((hobby, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 2.0 + index * 0.05, duration: 0.4 }}
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                        <span className="text-gray-700 text-sm">
                                            {typeof hobby === 'string' ? hobby : hobby.name || hobby.hobby}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </div>

                {/* Résumé en bas */}
                {settings.show_summary && cvData?.summary && settings.bio !== cvData.summary && (
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.0, duration: 0.8 }}
                        className="mt-16 pt-12 border-t border-gray-100"
                    >
                        <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                            {t('portfolio.sections.summary')}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            {safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                        </p>
                    </motion.section>
                )}

                {/* Langues */}
                {settings.show_languages && cvData?.languages?.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.15, duration: 0.8 }}
                        className="mt-16 pt-12 border-t border-gray-100"
                    >
                        <h2 className="text-2xl font-light text-gray-900 mb-8" style={{ color: primaryColor }}>
                            {t('portfolio.sections.languages')}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cvData.languages.map((lang, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2.3 + index * 0.1, duration: 0.5 }}
                                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <span className="font-medium text-gray-800">{lang.name}</span>
                                    {lang.pivot?.language_level && (
                                        <span className="text-sm text-gray-600 px-3 py-1 border border-gray-300 rounded">
                                            {lang.pivot.language_level}
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Contact détaillé si activé */}
                {settings.show_contact_info && (cvData?.email || cvData?.phone || cvData?.address) && (
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.2, duration: 0.8 }}
                        className="mt-16 pt-12 border-t border-gray-100"
                    >
                        <h2 className="text-2xl font-light text-gray-900 mb-6 tracking-wide">
                            {t('portfolio.sections.contact')}
                        </h2>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {(cvData?.email || user.email) && (
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                                    <a
                                        href={`mailto:${cvData?.email || user.email}`}
                                        className="text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        {cvData?.email || user.email}
                                    </a>
                                </div>
                            )}
                            {cvData?.phone && (
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Téléphone</p>
                                    <a
                                        href={`tel:${cvData.phone}`}
                                        className="text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        {cvData.phone}
                                    </a>
                                </div>
                            )}
                            {cvData?.address && (
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-gray-400">Adresse</p>
                                    <p className="text-gray-700">{cvData.address}</p>
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}
            </main>

            {/* Footer minimaliste */}
            <footer className="border-t border-gray-100 mt-16">
                <div className="max-w-4xl mx-auto px-8 py-8">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.4, duration: 0.8 }}
                        className="text-center text-xs text-gray-400 tracking-wide"
                    >
                        {user.name} • {new Date().getFullYear()} • Réalisé avec Guidy
                    </motion.p>
                </div>
            </footer>
        </div>
    );
}