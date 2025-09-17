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

                        <div className="space-y-8">
                            {cvData.experiences.map((exp, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                                    className="border-l-2 border-gray-100 pl-8 relative"
                                >
                                    <div
                                        className="absolute -left-1.5 w-3 h-3 rounded-full bg-white border-2"
                                        style={{ borderColor: primaryColor }}
                                    />

                                    <div className="mb-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                            <h3 className="text-xl font-medium text-gray-900">
                                                {exp.name}
                                            </h3>
                                            <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                                                {exp.date_start && exp.date_end ?
                                                    `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                                    exp.date_start ?
                                                        `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - Présent` :
                                                        'Période non spécifiée'
                                                }
                                            </span>
                                        </div>
                                        <p className="text-gray-600 font-normal mb-3">
                                            {exp.InstitutionName}
                                        </p>
                                        {exp.description && (
                                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                                {safeText(exp.description)}
                                            </p>
                                        )}

                                        {/* Informations détaillées */}
                                        <div className="space-y-1 text-xs text-gray-500 mb-3">
                                            {(exp.date_start || exp.date_end) && (
                                                <div>📅 {exp.date_start && new Date(exp.date_start).toLocaleDateString('fr-FR')}{exp.date_start && exp.date_end && ' - '}{exp.date_end && new Date(exp.date_end).toLocaleDateString('fr-FR')}</div>
                                            )}
                                            {exp.output && (
                                                <div>📈 Résultats: {exp.output}</div>
                                            )}
                                            {exp.category_name && (
                                                <div>🏷️ Catégorie: {exp.category_name}</div>
                                            )}
                                        </div>

                                        {/* Références */}
                                        {exp.references && exp.references.length > 0 && (
                                            <div className="mt-3 p-3 bg-gray-50 rounded">
                                                <div className="text-sm font-medium text-gray-700 mb-2">Références :</div>
                                                <div className="space-y-1">
                                                    {exp.references.map((ref, refIndex) => (
                                                        <div key={refIndex} className="text-xs text-gray-600">
                                                            <div className="font-medium">{ref.name}</div>
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
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 hover:border-gray-400 rounded text-sm text-gray-700 hover:text-gray-900 transition-colors"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    {exp.attachment_name || 'Voir le document'}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
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