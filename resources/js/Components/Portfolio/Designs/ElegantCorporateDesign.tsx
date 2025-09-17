import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar, Sparkles, Zap, Target, Building,
    Users, TrendingUp, Star, ChevronRight, Download,
    Eye, CheckCircle, ArrowUpRight, Book, Code
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface ElegantCorporateDesignProps {
    user: any;
    cvData: any;
    settings: any;
    isPreview?: boolean;
}

// Utility function for hex to RGB conversion
const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '99, 102, 241';
};

// Utility function to safely extract text from objects
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

// Elegant card with sophisticated hover effects
const ElegantCard = ({
    children,
    className = "",
    gradient = "indigo",
    delay = 0,
    ...props
}: any) => {
    const gradients = {
        indigo: 'from-indigo-500/20 via-purple-500/20 to-pink-500/20',
        blue: 'from-blue-500/20 via-cyan-500/20 to-teal-500/20',
        purple: 'from-purple-500/20 via-violet-500/20 to-indigo-500/20',
        emerald: 'from-emerald-500/20 via-green-500/20 to-teal-500/20',
        amber: 'from-amber-500/20 via-orange-500/20 to-red-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
                delay,
                duration: 0.8,
                type: "spring",
                stiffness: 100
            }}
            viewport={{ once: true }}
            whileHover={{
                y: -8,
                transition: { duration: 0.3 }
            }}
            className={cn(
                "relative group bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl",
                "hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500",
                className
            )}
            {...props}
        >
            {/* Gradient overlay */}
            <div className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                gradients[gradient as keyof typeof gradients] || gradients.indigo
            )} />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
                <div className="w-full h-full bg-white rounded-2xl" />
            </div>
        </motion.div>
    );
};

// Animated counter component
const AnimatedCounter = ({
    value,
    suffix = "",
    prefix = "",
    duration = 2
}: {
    value: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
}) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref);

    React.useEffect(() => {
        if (isInView) {
            const timer = setInterval(() => {
                setCount(prev => {
                    const increment = Math.ceil(value / (duration * 60));
                    if (prev + increment >= value) {
                        clearInterval(timer);
                        return value;
                    }
                    return prev + increment;
                });
            }, 1000 / 60);

            return () => clearInterval(timer);
        }
    }, [isInView, value, duration]);

    return (
        <span ref={ref} className="font-bold">
            {prefix}{count}{suffix}
        </span>
    );
};

// Professional timeline component
const TimelineItem = ({
    experience,
    index,
    isLast
}: {
    experience: any;
    index: number;
    isLast: boolean;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex gap-6 pb-8"
        >
            {/* Timeline line */}
            {!isLast && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-indigo-400 to-purple-400" />
            )}

            {/* Timeline dot */}
            <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg"
            >
                <Building className="w-6 h-6 text-white" />
            </motion.div>

            {/* Content */}
            <div className="flex-1 pt-2">
                <ElegantCard gradient="indigo" delay={index * 0.2 + 0.3} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {experience.name}
                            </h3>
                            <p className="text-indigo-600 font-semibold">
                                {experience.InstitutionName}
                            </p>
                        </div>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            <Calendar className="w-3 h-3 mr-1" />
                            {experience.date_start && experience.date_end ?
                                `${new Date(experience.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${new Date(experience.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                experience.date_start ?
                                    `${new Date(experience.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - Présent` :
                                    'Période non spécifiée'
                            }
                        </Badge>
                    </div>
                    {experience.description && (
                        <p className="text-gray-600 leading-relaxed mb-3">
                            {safeText(experience.description)}
                        </p>
                    )}

                    {/* Informations détaillées */}
                    <div className="space-y-2 mb-3">
                        {(experience.date_start || experience.date_end) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>
                                    {experience.date_start && new Date(experience.date_start).toLocaleDateString('fr-FR')}
                                    {experience.date_start && experience.date_end && ' - '}
                                    {experience.date_end && new Date(experience.date_end).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        )}

                        {experience.output && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MapPin className="w-3 h-3" />
                                <span>Résultats: {experience.output}</span>
                            </div>
                        )}

                        {experience.category_name && (
                            <div className="mb-3">
                                <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-600">
                                    {experience.category_name}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Références */}
                    {experience.references && experience.references.length > 0 && (
                        <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <h4 className="text-sm font-medium text-indigo-700 mb-2">Références :</h4>
                            <div className="space-y-2">
                                {experience.references.map((ref, refIndex) => (
                                    <div key={refIndex} className="text-xs text-gray-600">
                                        <div className="font-medium text-indigo-700">{ref.name}</div>
                                        {ref.function && <div>Fonction: {ref.function}</div>}
                                        {ref.email && <div>Email: {ref.email}</div>}
                                        {ref.telephone && <div>Tél: {ref.telephone}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pièces jointes */}
                    {experience.attachment_path && (
                        <div className="mt-3">
                            <a
                                href={experience.attachment_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-sm text-indigo-700 transition-all duration-300"
                            >
                                <FileText className="w-4 h-4" />
                                {experience.attachment_name || 'Voir le document'}
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}

                    {/* Skills tags if available */}
                    {experience.skills && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {experience.skills.slice(0, 3).map((skill: string, skillIndex: number) => (
                                <Badge
                                    key={skillIndex}
                                    variant="outline"
                                    className="text-xs bg-white/50"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    )}
                </ElegantCard>
            </div>
        </motion.div>
    );
};

export default function ElegantCorporateDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: ElegantCorporateDesignProps) {
    const { t } = useTranslation();
    const { scrollY } = useScroll();

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#6366f1';
    const secondaryColor = settings.secondary_color || '#8b5cf6';

    // Parallax effects
    const backgroundY = useTransform(scrollY, [0, 500], [0, -150]);
    const heroY = useTransform(scrollY, [0, 300], [0, -50]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                duration: 1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-purple-50/50 relative overflow-hidden">
            {/* Sophisticated background pattern */}
            <motion.div
                className="fixed inset-0 opacity-30"
                style={{ y: backgroundY }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.02)_25%,rgba(99,102,241,0.02)_50%,transparent_50%)] bg-[length:60px_60px]" />
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hero Section */}
                <motion.section
                    className="min-h-screen flex items-center px-4 py-20"
                    style={{ y: heroY }}
                >
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            {/* Profile Information */}
                            <motion.div variants={itemVariants} className="text-center lg:text-left">
                                {/* Profile Image */}
                                <motion.div
                                    className="relative w-64 h-64 mx-auto lg:mx-0 mb-12"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full p-1">
                                        <div className="w-full h-full bg-white rounded-full p-2">
                                            {profilePhoto ? (
                                                <img
                                                    src={profilePhoto}
                                                    alt={user.name}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                    <User className="w-24 h-24 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Floating badges */}
                                    <motion.div
                                        className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg border border-indigo-100"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        <Star className="w-6 h-6 text-yellow-500" />
                                    </motion.div>
                                    <motion.div
                                        className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg border border-purple-100"
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                                    >
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    </motion.div>
                                </motion.div>

                                {/* Name and Title */}
                                <motion.h1
                                    className="text-5xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                >
                                    {user.name}
                                </motion.h1>

                                <motion.p
                                    className="text-2xl lg:text-3xl text-gray-600 mb-6 font-light"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    {cvData?.professional_title || user.full_profession || 'Professional Executive'}
                                </motion.p>

                                {/* Tagline */}
                                {settings.tagline && (
                                    <motion.p
                                        className="text-lg text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7, duration: 0.8 }}
                                    >
                                        {settings.tagline}
                                    </motion.p>
                                )}

                                {/* Professional Links */}
                                <motion.div
                                    className="flex justify-center lg:justify-start gap-4 mb-8"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.8 }}
                                >
                                    {[
                                        { icon: Mail, href: `mailto:${user.email}`, label: 'Email', color: 'indigo' },
                                        { icon: Phone, href: `tel:${user.phone}`, label: 'Phone', color: 'purple' },
                                        { icon: Linkedin, href: user.linkedin, label: 'LinkedIn', color: 'blue' },
                                        { icon: Github, href: user.github, label: 'GitHub', color: 'gray' }
                                    ].filter(item => item.href).map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                                            whileHover={{ y: -5, scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <item.icon className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.label}
                                            </div>
                                        </motion.a>
                                    ))}
                                </motion.div>

                                {/* Call to Action */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1, duration: 0.8 }}
                                >
                                    <Button
                                        size="lg"
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                        asChild
                                    >
                                        <a href="#contact">
                                            Collaborons ensemble
                                            <ArrowUpRight className="w-5 h-5 ml-2" />
                                        </a>
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* Professional Stats */}
                            <motion.div variants={itemVariants} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <ElegantCard gradient="indigo" delay={0.3} className="p-6 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Briefcase className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-2">
                                            <AnimatedCounter value={cvData?.experiences?.length || 0} suffix="+" />
                                        </div>
                                        <p className="text-gray-600 font-medium">Expériences</p>
                                    </ElegantCard>

                                    <ElegantCard gradient="purple" delay={0.4} className="p-6 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Award className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-2">
                                            <AnimatedCounter value={cvData?.skills?.length || 0} suffix="+" />
                                        </div>
                                        <p className="text-gray-600 font-medium">Compétences</p>
                                    </ElegantCard>

                                    <ElegantCard gradient="emerald" delay={0.5} className="p-6 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <TrendingUp className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-2">
                                            <AnimatedCounter value={Math.floor(Math.random() * 50) + 10} suffix="%" />
                                        </div>
                                        <p className="text-gray-600 font-medium">Croissance</p>
                                    </ElegantCard>

                                    <ElegantCard gradient="amber" delay={0.6} className="p-6 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-2">
                                            <AnimatedCounter value={Math.floor(Math.random() * 500) + 100} suffix="+" />
                                        </div>
                                        <p className="text-gray-600 font-medium">Clients</p>
                                    </ElegantCard>
                                </div>

                                {/* Quote or Summary */}
                                {(cvData?.summary || cvData?.summaries?.[0]) && (
                                    <ElegantCard gradient="blue" delay={0.7} className="p-8">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Vision Professionnelle</h3>
                                                <p className="text-gray-600 leading-relaxed italic">
                                                    "{safeText(cvData?.summary || cvData?.summaries?.[0]).substring(0, 200)}..."
                                                </p>
                                            </div>
                                        </div>
                                    </ElegantCard>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* Experience Timeline */}
                {(settings.show_experiences && cvData?.experiences?.length > 0) && (
                    <section className="py-24 px-4 bg-white/50 backdrop-blur-sm">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                                    Parcours Professionnel
                                </h2>
                                <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
                            </motion.div>

                            <div className="max-w-4xl mx-auto">
                                {cvData.experiences.map((exp: any, index: number) => (
                                    <TimelineItem
                                        key={index}
                                        experience={exp}
                                        index={index}
                                        isLast={index === cvData.experiences.length - 1}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Skills Excellence */}
                {(settings.show_competences && cvData?.competences?.length > 0) && (
                    <section className="py-24 px-4">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                                    Excellence Technique
                                </h2>
                                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
                            </motion.div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {cvData.competences.map((competence: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <ElegantCard gradient="blue" delay={index * 0.05} className="p-6 h-full">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                                    <Code className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                                </h3>
                                            </div>

                                            {competence.level && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm text-gray-600">
                                                        <span>Maîtrise</span>
                                                        <span>{competence.level}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${competence.level}%` }}
                                                            transition={{ delay: index * 0.1 + 0.5, duration: 1.5 }}
                                                            viewport={{ once: true }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </ElegantCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Personal Interests */}
                {(settings.show_hobbies && cvData?.hobbies?.length > 0) && (
                    <section className="py-24 px-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                className="text-center mb-16"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                                    Centres d'Intérêt
                                </h2>
                                <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto rounded-full"></div>
                            </motion.div>

                            <div className="flex flex-wrap justify-center gap-6">
                                {cvData.hobbies.map((hobby: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        viewport={{ once: true }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                    >
                                        <ElegantCard gradient="purple" className="p-6 text-center">
                                            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Heart className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {safeText(hobby.name || hobby)}
                                            </h3>
                                        </ElegantCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact Section */}
                {settings.show_contact_info && (
                    <section id="contact" className="py-24 px-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                                    Démarrons un Projet
                                </h2>
                                <p className="text-xl text-indigo-200 mb-12 max-w-2xl mx-auto">
                                    Prêt à transformer vos idées en réalité ? Contactez-moi pour discuter de votre prochain projet.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                    {user.email && (
                                        <Button
                                            size="lg"
                                            asChild
                                            className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            <a href={`mailto:${user.email}`}>
                                                <Mail className="w-5 h-5 mr-2" />
                                                Envoyer un Email
                                            </a>
                                        </Button>
                                    )}
                                    {user.phone && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            asChild
                                            className="border-white text-white hover:bg-white hover:text-indigo-900 font-semibold px-8 py-4 rounded-full transition-all duration-300"
                                        >
                                            <a href={`tel:${user.phone}`}>
                                                <Phone className="w-5 h-5 mr-2" />
                                                Appeler Maintenant
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* Elegant Footer */}
                <footer className="relative z-10 py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto px-4 text-center"
                    >
                        <ElegantCard gradient="indigo" className="p-8">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="space-y-4"
                            >
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    🏢 Portfolio Élégant de {user.name}
                                </h3>
                                <p className="text-gray-600 font-medium">
                                    Créé avec excellence par <span className="font-bold text-indigo-600">Guidy</span>
                                </p>
                                <div className="text-sm text-gray-500">
                                    © {new Date().getFullYear()} • Design Corporate Sophistiqué
                                </div>
                            </motion.div>
                        </ElegantCard>
                    </motion.div>
                </footer>
            </motion.div>
        </div>
    );
}
