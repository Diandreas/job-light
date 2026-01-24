import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface ProfessionalDesignProps {
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

export default function ProfessionalDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: ProfessionalDesignProps) {
    const { t } = useTranslation();

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#0f172a';

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
            style={{
                '--primary-color': primaryColor,
                '--primary-rgb': hexToRgb(primaryColor)
            } as React.CSSProperties}
        >
            {/* Header Section */}
            <motion.section
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white shadow-sm border-b"
            >
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">

                        {/* Photo de profil */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 border-4 border-white shadow-xl">
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt={`${user.name} - Photo de profil`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-16 h-16 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Informations principales */}
                        <div className="flex-1 text-center md:text-left">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl md:text-4xl font-bold text-slate-800 mb-2"
                            >
                                {user.name || `${cvData?.first_name || ''} ${cvData?.last_name || ''}`.trim()}
                            </motion.h1>

                            {(settings.tagline || cvData?.professional_title) && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl font-medium mb-4"
                                    style={{ color: primaryColor }}
                                >
                                    {settings.tagline || cvData.professional_title}
                                </motion.p>
                            )}

                            {(settings.bio || cvData?.summary) && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-slate-600 max-w-2xl leading-relaxed"
                                >
                                    {settings.bio || safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                                </motion.p>
                            )}

                            {/* Contact rapide */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap justify-center md:justify-start gap-4 mt-6"
                            >
                                {(cvData?.email || user.email) && (
                                    <a
                                        href={`mailto:${cvData?.email || user.email}`}
                                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{cvData?.email || user.email}</span>
                                    </a>
                                )}
                                {cvData?.phone && (
                                    <a
                                        href={`tel:${cvData.phone}`}
                                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{cvData.phone}</span>
                                    </a>
                                )}
                                {cvData?.address && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">{cvData.address}</span>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Expériences */}
                        {settings.show_experiences && cvData?.experiences?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Briefcase className="w-6 h-6" style={{ color: primaryColor }} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-800">{t('portfolio.sections.experiences')}</h2>
                                        </div>

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
                                                        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-4">
                                                            <span>{category}</span>
                                                            <div className="h-px bg-slate-100 flex-1" />
                                                        </h3>

                                                        <div className="space-y-8">
                                                            {experiences.map((exp: any, index: number) => (
                                                                <motion.div
                                                                    key={index}
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.1 * index }}
                                                                    className="group relative pl-8 border-l-2 border-slate-100 hover:border-primary/30 transition-colors"
                                                                >
                                                                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-primary transition-colors" />

                                                                    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                                                                        <h4 className="text-xl font-bold text-slate-900 leading-tight">
                                                                            {exp.name}
                                                                        </h4>
                                                                        <span className="text-sm font-semibold px-3 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100 whitespace-nowrap">
                                                                            {exp.date_start && exp.date_end ?
                                                                                `${new Date(exp.date_start).getFullYear()} — ${new Date(exp.date_end).getFullYear()}` :
                                                                                exp.date_start ?
                                                                                    `${new Date(exp.date_start).getFullYear()} — ${t('portfolio.dates.present')}` :
                                                                                    t('portfolio.dates.periodNotSpecified')
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                    <div className="text-primary font-bold text-lg mb-4 opacity-80 uppercase tracking-wide">
                                                                        {exp.InstitutionName}
                                                                    </div>

                                                                    {exp.description && (
                                                                        <div
                                                                            className=" prose prose-slate max-w-none text-slate-600 leading-relaxed rich-text-content"
                                                                            dangerouslySetInnerHTML={{ __html: exp.description }}
                                                                        />
                                                                    )}

                                                                    <style>{`
                                                                        .rich-text-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 1rem !important; }
                                                                        .rich-text-content li { margin-bottom: 0.5rem !important; }
                                                                        .rich-text-content p { margin-bottom: 1rem !important; }
                                                                    `}</style>

                                                                    {exp.references && exp.references.length > 0 && (
                                                                        <div className="mt-6 flex flex-wrap gap-4">
                                                                            {exp.references.map((ref: any, refIndex: number) => (
                                                                                <div key={refIndex} className="text-xs bg-slate-50 border border-slate-100 p-2 rounded-md">
                                                                                    <span className="block font-bold text-slate-700">{ref.name}</span>
                                                                                    <span className="text-slate-500">{ref.function}</span>
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
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Résumé */}
                        {settings.show_summary && cvData?.summary && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <FileText className="w-6 h-6" style={{ color: primaryColor }} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-800">{t('portfolio.sections.summary')}</h2>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed">
                                            {safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Compétences */}
                        {settings.show_competences && cvData?.competences?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Award className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">{t('portfolio.sections.skills')}</h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {cvData.competences.map((competence, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="border-slate-200 hover:border-slate-300 transition-colors"
                                                >
                                                    {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Centres d'intérêt */}
                        {settings.show_hobbies && cvData?.hobbies?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Heart className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">{t('portfolio.sections.hobbies')}</h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {cvData.hobbies.map((hobby, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-slate-100 text-slate-700"
                                                >
                                                    {typeof hobby === 'string' ? hobby : hobby.name || hobby.hobby}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Langues */}
                        {settings.show_languages && cvData?.languages?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.15 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Globe className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">{t('portfolio.sections.languages')}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {cvData.languages.map((lang, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="font-medium text-slate-700">{lang.name}</span>
                                                    {lang.pivot?.language_level && (
                                                        <span className="text-sm text-slate-500 px-2 py-1 bg-white rounded">
                                                            {lang.pivot.language_level}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Contact */}
                        {settings.show_contact_info && (cvData?.email || cvData?.phone || cvData?.address) && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Contact className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">{t('portfolio.sections.contact')}</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {(cvData?.email || user.email) && (
                                                <a
                                                    href={`mailto:${cvData?.email || user.email}`}
                                                    className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-sm">{cvData?.email || user.email}</span>
                                                </a>
                                            )}
                                            {cvData?.phone && (
                                                <a
                                                    href={`tel:${cvData.phone}`}
                                                    className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    <span className="text-sm">{cvData.phone}</span>
                                                </a>
                                            )}
                                            {cvData?.address && (
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-sm">{cvData.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-6xl mx-auto px-6 py-8 text-center">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} {user.name}. {t('portfolio.footer.generatedBy')}
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Utility function to convert hex to rgb
function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '15, 23, 42'; // default slate-800 rgb

    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ].join(', ');
}