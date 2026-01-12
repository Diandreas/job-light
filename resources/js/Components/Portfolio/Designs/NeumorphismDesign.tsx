import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface NeumorphismDesignProps {
    user: any;
    cvData: any;
    settings: any;
    isPreview?: boolean;
}

// Utility function to safely extract text
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

export default function NeumorphismDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: NeumorphismDesignProps) {
    const { t } = useTranslation();

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#4A5568'; // Default dark gray for text
    const accentColor = settings.accent_color || '#3b82f6'; // Blue accent

    // Helper for neumorphic container
    const NeuCard = ({ children, className, pressed = false }: { children: React.ReactNode, className?: string, pressed?: boolean }) => (
        <div className={cn(
            pressed ? "neu-pressed" : "neu-flat",
            "p-6 text-gray-700 dark:text-gray-200 transition-all duration-300",
            className
        )}>
            {children}
        </div>
    );

    const NeuButton = ({ children, onClick, href, className, variant = 'default' }: any) => {
        const buttonClass = cn(
            "neu-button inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-300",
            className
        );

        if (href) {
            return (
                <a href={href} className={buttonClass} target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            );
        }
        return (
            <button onClick={onClick} className={buttonClass}>
                {children}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#e0e5ec] text-gray-700 font-sans p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row items-center gap-10">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        <div className="neu-convex rounded-full p-2 w-48 h-48 flex items-center justify-center">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover border-4 border-[#e0e5ec]"
                                />
                            ) : (
                                <User className="w-20 h-20 text-gray-400" />
                            )}
                        </div>
                    </motion.div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight"
                        >
                            {user.name || `${cvData?.first_name || ''} ${cvData?.last_name || ''}`.trim()}
                        </motion.h1>

                        {(settings.tagline || cvData?.professional_title) && (
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl md:text-2xl font-medium text-gray-600"
                                style={{ color: accentColor }}
                            >
                                {settings.tagline || cvData.professional_title}
                            </motion.p>
                        )}

                        {(settings.bio || cvData?.summary) && (
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-gray-600 max-w-2xl text-lg leading-relaxed"
                            >
                                {settings.bio || safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                            </motion.p>
                        )}

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center md:justify-start gap-4 pt-4"
                        >
                            {(cvData?.email || user.email) && (
                                <NeuButton href={`mailto:${cvData?.email || user.email}`}>
                                    <Mail className="w-4 h-4" />
                                    <span>Contact</span>
                                </NeuButton>
                            )}
                            {cvData?.phone && (
                                <NeuButton href={`tel:${cvData.phone}`}>
                                    <Phone className="w-4 h-4" />
                                    <span>Call</span>
                                </NeuButton>
                            )}
                            {cvData?.linkedin && (
                                <NeuButton href={cvData.linkedin}>
                                    <Linkedin className="w-4 h-4" />
                                    <span>LinkedIn</span>
                                </NeuButton>
                            )}
                        </motion.div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* Experiences */}
                        {settings.show_experiences && cvData?.experiences?.length > 0 && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="neu-convex p-3 rounded-xl">
                                        <Briefcase className="w-6 h-6 text-gray-700" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">{t('portfolio.sections.experiences')}</h2>
                                </div>

                                {cvData.experiences.map((exp: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                    >
                                        <NeuCard className="hover:scale-[1.02] transition-transform">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-800">{exp.name}</h3>
                                                    <p className="text-lg font-medium text-gray-600">{exp.InstitutionName}</p>
                                                </div>
                                                <div className="neu-pressed px-4 py-2 rounded-lg text-sm font-semibold text-gray-500">
                                                    {exp.date_start ? new Date(exp.date_start).getFullYear() : ''} - {exp.date_end ? new Date(exp.date_end).getFullYear() : t('portfolio.dates.present')}
                                                </div>
                                            </div>

                                            {exp.description && (
                                                <p className="text-gray-600 leading-relaxed mb-4">
                                                    {safeText(exp.description)}
                                                </p>
                                            )}

                                            {exp.attachment_path && (
                                                <div className="mt-4">
                                                    <NeuButton href={exp.attachment_path} className="text-sm py-2 px-4">
                                                        <FileText className="w-4 h-4" />
                                                        {t('portfolio.attachments.viewDocument')}
                                                    </NeuButton>
                                                </div>
                                            )}
                                        </NeuCard>
                                    </motion.div>
                                ))}
                            </section>
                        )}

                        {/* Summary Details */}
                        {settings.show_summary && (cvData?.summary || cvData?.summaries?.[0]) && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="neu-convex p-3 rounded-xl">
                                        <FileText className="w-6 h-6 text-gray-700" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">{t('portfolio.sections.summary')}</h2>
                                </div>
                                <NeuCard>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                                    </p>
                                </NeuCard>
                            </section>
                        )}
                    </div>

                    <div className="space-y-10">
                        {/* Skills */}
                        {settings.show_competences && cvData?.competences?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="neu-convex p-3 rounded-xl">
                                        <Award className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">{t('portfolio.sections.skills')}</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {cvData.competences.map((skill: any, index: number) => (
                                        <NeuCard key={index} className="px-4 py-2 rounded-lg text-sm font-semibold">
                                            {typeof skill === 'string' ? skill : skill.name}
                                        </NeuCard>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Hobbies */}
                        {settings.show_hobbies && cvData?.hobbies?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="neu-convex p-3 rounded-xl">
                                        <Heart className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">{t('portfolio.sections.hobbies')}</h3>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {cvData.hobbies.map((hobby: any, index: number) => (
                                        <div key={index} className="neu-pressed px-4 py-2 rounded-lg text-sm text-gray-600">
                                            {typeof hobby === 'string' ? hobby : hobby.name}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Contact Info */}
                        {settings.show_contact_info && (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="neu-convex p-3 rounded-xl">
                                        <Contact className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">{t('portfolio.sections.contact')}</h3>
                                </div>
                                <NeuCard className="space-y-4">
                                    {(cvData?.email || user.email) && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Mail className="w-4 h-4" />
                                            <span>{cvData?.email || user.email}</span>
                                        </div>
                                    )}
                                    {cvData?.phone && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span>{cvData.phone}</span>
                                        </div>
                                    )}
                                    {cvData?.address && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{cvData.address}</span>
                                        </div>
                                    )}
                                </NeuCard>
                            </section>
                        )}
                    </div>
                </div>

                <footer className="text-center text-gray-500 py-8">
                    <p>© {new Date().getFullYear()} {user.name}. {t('portfolio.footer.generatedBy')}</p>
                </footer>
            </div>
        </div>
    );
}
