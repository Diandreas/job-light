import React, { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';

import { useTranslation } from 'react-i18next';
import {
    FileText, Brain, PenTool, MessageSquare,
    Sparkles, ArrowRight, Star, ChevronRight,
    Users, Award, Trophy, Terminal, Globe, Mail
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Dropdown from '@/Components/Dropdown';
import FluidCursorEffect from "@/Components/ai/FluidCursorEffect";

const LanguageSelector = () => {
    const { t, i18n } = useTranslation();

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
                    <Globe className="h-5 w-5" />
                    <span className="font-medium">{i18n.language === 'fr' ? 'FR' : 'EN'}</span>
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content>
                <div className="bg-white rounded-lg w-32 shadow-lg">
                    <button
                        onClick={() => i18n.changeLanguage('fr')}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            i18n.language === 'fr'
                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                : "text-gray-700 hover:bg-amber-50"
                        )}
                    >
                        <span className="font-medium">Français</span>
                        {i18n.language === 'fr' && (
                            <motion.div
                                layoutId="activeLang"
                                className="ml-auto w-2 h-2 rounded-full bg-white"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            i18n.language === 'en'
                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                : "text-gray-700 hover:bg-amber-50"
                        )}
                    >
                        <span className="font-medium">English</span>
                        {i18n.language === 'en' && (
                            <motion.div
                                layoutId="activeLang"
                                className="ml-auto w-2 h-2 rounded-full bg-white"
                            />
                        )}
                    </button>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
};

const AnimatedCounter = ({ target, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        const updateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setCount(Math.floor(target * percentage));

            if (percentage < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }, [target, duration]);

    return <span>{count.toLocaleString()}+</span>;
};

const FeatureCard = ({ icon: Icon, title, description, action, link, color, bgColor, premium }) => (
    <motion.div
        whileHover={{ y: -8, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group h-full transition-all duration-300 hover:shadow-2xl ${bgColor ? `hover:bg-gradient-to-br hover:${bgColor}` : ''}`}
    >
        <div className={`absolute inset-0 bg-gradient-to-r ${color ? color.replace('from-', 'from-').replace('to-', 'to-') + '/10' : 'from-amber-500/10 to-purple-500/10'} dark:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-start mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-r ${color || 'from-amber-500 to-purple-500'} transform group-hover:rotate-6 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                {premium && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-xs font-bold text-white rounded-full shadow-sm"
                    >
                        PRO
                    </motion.div>
                )}
            </div>
            <h3 className="text-base md:text-xl font-bold mb-2 md:mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors dark:text-white leading-tight">{title}</h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6 flex-grow leading-relaxed">{description}</p>
            {action && link && (
                link.startsWith('/') ? (
                    <a href={link} className="inline-flex items-center text-sm md:text-base text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold group/link mt-auto">
                        {action}
                        <ArrowRight className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
                    </a>
                ) : (
                    <Link href={link} className="inline-flex items-center text-sm md:text-base text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold group/link mt-auto">
                        {action}
                        <ArrowRight className="ml-2 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                )
            )}
        </div>
    </motion.div>
);

const AdditionalFeatureCard = ({ icon: Icon, title, description, color, bgColor, comingSoon }) => {
    const { t } = useTranslation();
    return (
        <motion.div
            whileHover={comingSoon ? {} : { y: -5, scale: 1.02 }}
            whileTap={comingSoon ? {} : { scale: 0.98 }}
            className={`relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden group transition-all duration-300 hover:shadow-lg ${bgColor && !comingSoon ? `hover:bg-gradient-to-br hover:${bgColor}` : ''} ${comingSoon ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-r ${color}/10 dark:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="relative z-10 flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${color} transform ${!comingSoon && 'group-hover:scale-110'} transition-transform duration-300 shadow-sm flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors dark:text-white leading-tight">{title}</h4>
                        {comingSoon && (
                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50">
                                {t('common.comingSoon')}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
                </div>
            </div>
        </motion.div>
    );
};

const StatisticCard = ({ icon: Icon, value, label }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
    >
        <Icon className="w-6 h-6 md:w-8 md:h-8 text-amber-500 dark:text-amber-400 mb-3 md:mb-4 mx-auto" />
        <div className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">
            <AnimatedCounter target={value} />
        </div>
        <p className="text-xs md:text-base text-gray-600 dark:text-gray-300 font-medium">{label}</p>
    </motion.div>
);

// Composant Call-to-Action amélioré pour mobile
// Composant Call-to-Action optimisé pour mobile compact
const ImageCallToAction = () => {
    const { t } = useTranslation();
    return (
        <div className="bg-gradient-to-br from-amber-50 via-purple-50 to-amber-100 dark:from-amber-900/20 dark:via-purple-900/20 dark:to-amber-900/30 rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-200 dark:border-amber-700">

            {/* Layout mobile compact - NOUVEAU */}
            <div className="block md:hidden">
                <div className="p-4">
                    {/* Titre plus compact */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-purple-600 to-amber-600 text-transparent bg-clip-text text-center leading-tight"
                    >
                        {t('cta_image.title')}
                    </motion.h2>

                    {/* Container des deux images en ligne */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-3 mb-4"
                    >
                        {/* Image conversation (gauche) */}
                        <div className="flex-1 relative h-40 rounded-xl shadow-lg overflow-hidden border border-amber-300 dark:border-amber-700 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 z-10"></div>
                            <div className="absolute left-1 top-1/2 transform -translate-y-1/2 z-20">
                                <motion.div
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <ChevronRight className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                                </motion.div>
                            </div>
                            <div className="flex items-center justify-center h-full p-2">
                                <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    src="/call.png"
                                    alt="Conversation IA"
                                    className="h-auto max-w-[90%] object-contain dark:opacity-90 dark:brightness-90 filter drop-shadow-md"
                                />
                            </div>
                        </div>

                        {/* Image CV (droite) */}
                        <div className="flex-1 relative h-40 rounded-xl shadow-lg overflow-hidden border border-amber-300 dark:border-amber-700 bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-gray-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-amber-500/10 z-10"></div>
                            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 z-20">
                                <motion.div
                                    animate={{ x: [0, -3, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <ChevronRight className="w-6 h-6 text-amber-500 dark:text-amber-400 transform rotate-180" />
                                </motion.div>
                            </div>
                            <div className="flex items-center justify-center h-full p-2">
                                <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    src="/cvs.png"
                                    alt="CV Professionnel"
                                    className="h-auto max-w-[90%] object-contain dark:opacity-90 dark:brightness-90 filter drop-shadow-md"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Description compacte */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-gray-700 dark:text-gray-300 mb-4 text-center leading-relaxed"
                    >
                        {t('hero.description')}
                    </motion.p>

                    {/* Bouton CTA compact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-3 justify-center"
                    >
                        <a
                            href="/guest-cv"
                            className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-bold bg-white text-amber-600 border-2 border-amber-500 hover:bg-amber-50 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                        >
                            <FileText className="mr-2 w-4 h-4" />
                            Essayer sans inscription
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </a>
                        <Link
                            href={route('register')}
                            className="inline-flex items-center px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                        >
                            <Star className="mr-2 w-4 h-4" />
                            {t('cta_image.button')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Layout desktop inchangé */}
            <div className="hidden md:flex md:flex-row md:items-stretch">
                {/* Image gauche (conversation) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-1/3 p-6 flex items-center justify-center relative"
                >
                    <div className="relative h-80 w-full rounded-xl shadow-md overflow-hidden border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-500/20 z-10"></div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20">
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <ChevronRight className="w-16 h-16 text-amber-500 dark:text-amber-400" />
                            </motion.div>
                        </div>
                        <div className="flex items-center justify-center h-full p-3">
                            <motion.img
                                whileHover={{ scale: 1.1 }}
                                src="/call.png"
                                alt="Conversation IA"
                                className="max-h-full max-w-full object-contain rounded-lg dark:opacity-90 dark:brightness-90 z-5"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Contenu central */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-1/3 p-8 flex flex-col justify-center items-center text-center"
                >
                    <h2 className="text-2xl lg:text-3xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                        {t('cta_image.title')}
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        {t('hero.description')}
                    </p>
                    <div className="flex flex-col gap-4">
                        <a
                            href="/guest-cv"
                            className="inline-flex items-center px-6 py-3 rounded-full text-base font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                            <FileText className="mr-2 w-4 h-4" />
                            Essayer sans inscription
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </a>
                        <Link
                            href={route('register')}
                            className="inline-flex items-center px-6 py-3 rounded-full text-base font-medium bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                        >
                            <Star className="mr-2 w-4 h-4" />
                            {t('cta_image.button')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Image droite (CV) */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="w-1/3 p-6 flex items-center justify-center relative"
                >
                    <div className="relative h-80 w-full rounded-xl shadow-md overflow-hidden border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800">
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
                            <motion.div
                                animate={{ x: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <ChevronRight className="w-16 h-16 text-amber-500 dark:text-amber-400 transform rotate-180" />
                            </motion.div>
                        </div>
                        <div className="flex items-center justify-center h-full p-3">
                            <motion.img
                                whileHover={{ scale: 1.1 }}
                                src="/cvs.png"
                                alt="CV Professionnel"
                                className="max-h-full max-w-full object-contain rounded-lg dark:opacity-90 dark:brightness-90"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
export default function Welcome() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
    const { t } = useTranslation();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Guidy",
        "description": "Assistant IA pour la création de CV et le développement de carrière",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "creator": {
            "@type": "Organization",
            "name": "Guidy",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+237693427913",
                "contactType": "customer service",
                "email": "guidy.makeitreall@gmail.com",
                "availableLanguage": ["French", "English"]
            }
        }
    };

    const features = [
        {
            icon: FileText,
            title: t('features.cv_designer.title'),
            description: t('features.cv_designer.description'),
            action: 'Essayer maintenant',
            link: '/guest-cv',
            color: 'from-amber-500 to-purple-500',
            bgColor: 'from-amber-50 to-purple-50 dark:from-amber-950/50 dark:to-purple-950/50',
            premium: false
        },
        {
            icon: Brain,
            title: t('features.career_advisor.title'),
            description: t('features.career_advisor.description'),
            action: t('features.career_advisor.action'),
            link: route('register'),
            color: 'from-purple-500 to-pink-500',
            bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50',
            premium: true
        },
        {
            icon: PenTool,
            title: t('features.cover_letter.title'),
            description: t('features.cover_letter.description'),
            action: t('features.cover_letter.action'),
            link: route('register'),
            color: 'from-green-500 to-emerald-500',
            bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50',
            premium: false
        },
        {
            icon: MessageSquare,
            title: t('features.interview_coach.title'),
            description: t('features.interview_coach.description'),
            action: t('features.interview_coach.action'),
            link: route('register'),
            color: 'from-orange-500 to-red-500',
            bgColor: 'from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50',
            premium: true
        }
    ];

    const additionalFeatures = [
        {
            icon: Globe,
            title: t('features.additional.portfolio.title'),
            description: t('features.additional.portfolio.description'),
            color: 'from-teal-500 to-blue-500',
            bgColor: 'from-teal-50 to-blue-50 dark:from-teal-950/50 dark:to-blue-950/50'
        },
        {
            icon: Users,
            title: t('features.additional.job_portal.title'),
            description: t('features.additional.job_portal.description'),
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50',
            comingSoon: true
        },
        {
            icon: Award,
            title: t('features.additional.skill_assessment.title'),
            description: t('features.additional.skill_assessment.description'),
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50'
        },
        {
            icon: Terminal,
            title: t('features.additional.ats_optimization.title'),
            description: t('features.additional.ats_optimization.description'),
            color: 'from-gray-500 to-slate-500',
            bgColor: 'from-gray-50 to-slate-50 dark:from-gray-950/50 dark:to-slate-950/50'
        },
        {
            icon: Star,
            title: t('features.additional.referral.title'),
            description: t('features.additional.referral.description'),
            color: 'from-pink-500 to-rose-500',
            bgColor: 'from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50'
        },
        {
            icon: Globe,
            title: t('features.additional.multilanguage.title'),
            description: t('features.additional.multilanguage.description'),
            color: 'from-cyan-500 to-teal-500',
            bgColor: 'from-cyan-50 to-teal-50 dark:from-cyan-950/50 dark:to-teal-950/50'
        }
    ];

    const statistics = [
        {
            icon: Users,
            value: 50000,
            label: t('stats.users')
        },
        {
            icon: Award,
            value: 95,
            label: t('stats.satisfaction')
        },
        {
            icon: Trophy,
            value: 75000,
            label: t('stats.cvs')
        },
        {
            icon: Terminal,
            value: 99,
            label: t('stats.availability')
        }
    ];

    return (
        <GuestLayout>
            <Head>
                {/* Toutes les balises HEAD restent identiques */}
                <title>Guidy | Créez un CV Professionnel en 5 Minutes avec l'IA | Resume Builder</title>
                <meta name="description" content="Créez gratuitement un CV optimisé ATS avec notre IA. Templates internationaux, conseils de carrière personnalisés et préparation aux entretiens. Available in English. Professional resumes in minutes!" />
                <meta name="keywords" content="CV IA, CV ATS, resume builder, AI CV, lettre de motivation, cover letter, préparation entretien, interview preparation, template CV, modèle CV, international resume, conseil carrière, career advice, emploi international, global job search, CV Canada, CV France, CV USA, Africa CV, UK resume, carrieres internationales, CV francophone, anglophone CV" />
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1, noodp, noydir" />
                <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="google" content="nositelinkssearchbox" />
                <meta name="author" content="Guidy" />
                <meta name="generator" content="Guidy AI Resume Platform" />
                <meta name="application-name" content="Guidy" />
                <meta name="apple-mobile-web-app-title" content="Guidy" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#F59E0B" />
                <meta name="msapplication-TileColor" content="#F59E0B" />
                <meta name="msapplication-navbutton-color" content="#F59E0B" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="google" content="notranslate" />
                <meta name="HandheldFriendly" content="true" />
                <meta name="referrer" content="no-referrer-when-downgrade" />
                <meta name="revisit-after" content="7 days" />
                <meta name="rating" content="general" />
                <meta name="copyright" content="© 2025 Guidy" />

                <link rel="canonical" href="https://guidy.com" />

                <meta name="geo.placename" content="Worldwide" />
                <meta name="geo.region" content="US, CA, FR, CM, GB, BE, CH, SN, CI, IN, NG, AU" />
                <meta name="geo.position" content="0;0" />
                <meta name="ICBM" content="0, 0" />
                <meta name="language" content="English, French" />

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Guidy" />
                <meta property="og:title" content="Guidy | Créez un CV professionnel en 5 min | Create your resume now" />
                <meta property="og:description" content="Utilisez l'IA pour créer un CV optimisé pour les recruteurs et ATS. Templates pour tous les pays, conseils personnalisés. Available in English/French. 100% Free!" />
                <meta property="og:url" content="https://guidy.com" />
                <meta property="og:image" content="/image.png" />
                <meta property="og:image:secure_url" content="/image.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Guidy AI Resume Builder Interface" />
                <meta property="og:locale" content="fr_FR" />
                <meta property="og:locale:alternate" content="en_US" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@guidyai" />
                <meta name="twitter:creator" content="@guidyai" />
                <meta name="twitter:title" content="Guidy - AI Resume Builder | Ready in 5 Minutes | 100% Free" />
                <meta name="twitter:description" content="Create ATS-optimized resumes with AI guidance. 50+ templates for every country. Boost your job applications with Guidy. French & English available!" />
                <meta name="twitter:image" content="/image.png" />
                <meta name="twitter:image:alt" content="Guidy Resume Builder Interface" />
                <meta name="twitter:label1" content="Available in" />
                <meta name="twitter:data1" content="English & French" />
                <meta name="twitter:label2" content="Perfect for" />
                <meta name="twitter:data2" content="Global Job Seekers" />

                <meta property="linkedin:title" content="Guidy - Create Your Professional Resume in 5 Minutes | AI-Powered" />
                <meta property="linkedin:description" content="AI-powered resume creation and career development platform. Optimize your job search with Guidy's professional templates." />
                <meta property="linkedin:image" content="/image.png" />

                <meta property="og:whatsapp:title" content="Guidy - Créateur de CV IA" />
                <meta property="og:whatsapp:text" content="Crée ton CV professionnel en 5 minutes avec l'IA! CV optimisé pour tous les pays." />

                <meta name="format-detection" content="email=no,address=no,date=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-tap-highlight" content="no" />
                <meta name="msapplication-starturl" content="https://guidy.com" />

                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://www.google-analytics.com" />
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
                <link rel="dns-prefetch" href="https://www.google-analytics.com" />
                <link rel="preload" href="/image.png" as="image" fetchPriority="high" />

                <link rel="icon" href="/ai.png" />
                <link rel="apple-touch-icon" href="/ai.png" />

                {/* Toutes les données structurées restent identiques */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Guidy - Global AI Resume Builder & Career Assistant",
                        "alternateName": ["Guidy - Assistant CV IA", "Guidy - Career Builder", "Guidy - Créateur de CV", "Guidy - AI Job Coach"],
                        "url": "https://guidy.com",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "/logo.png"
                        },
                        "description": "Create professional resumes and advance your career with personalized AI guidance. Available in English and French worldwide with region-specific optimization.",
                        "applicationCategory": ["CareerDevelopment", "BusinessApplication", "LifestyleApplication"],
                        "operatingSystem": ["Web", "iOS PWA", "Android PWA"],
                        "offers": {
                            "@type": "AggregateOffer",
                            "highPrice": "0",
                            "lowPrice": "0",
                            "priceCurrency": "USD",
                            "offerCount": "4",
                            "offers": [
                                {
                                    "@type": "Offer",
                                    "name": "North America",
                                    "description": "Region-optimized resume templates for US and Canadian job markets",
                                    "areaServed": ["US", "CA"]
                                },
                                {
                                    "@type": "Offer",
                                    "name": "Europe",
                                    "description": "EU-compliant CV formats with multilingual support",
                                    "areaServed": ["FR", "BE", "CH", "LU", "DE", "ES", "IT", "NL"]
                                },
                                {
                                    "@type": "Offer",
                                    "name": "Africa",
                                    "description": "Specialized templates for African job markets with regional optimization",
                                    "areaServed": ["CM", "SN", "CI", "BF", "ML", "NE", "TG", "BJ", "GA", "CG", "CD", "MG", "MA", "DZ", "TN"]
                                },
                                {
                                    "@type": "Offer",
                                    "name": "Global English Markets",
                                    "description": "International CV formats following anglo-saxon standards",
                                    "areaServed": ["GB", "AU", "NZ", "IN", "NG", "GH", "KE", "ZA", "SG", "MY", "PH"]
                                }
                            ]
                        },
                        "availableLanguage": ["en", "fr"],
                        "inLanguage": [
                            {
                                "@type": "Language",
                                "name": "English",
                                "alternateName": "en"
                            },
                            {
                                "@type": "Language",
                                "name": "French",
                                "alternateName": "fr"
                            }
                        ],
                        "featureList": [
                            "AI Resume Builder with ATS Optimization",
                            "Career Path Analysis & Recommendations",
                            "Interview Preparation & Mock Interviews",
                            "Cover Letter Generator with AI Customization",
                            "Skill Assessment & Gap Analysis",
                            "Job Market Insights by Region"
                        ],
                        "screenshot": [
                            {
                                "@type": "ImageObject",
                                "url": "/image.png",
                                "caption": "Guidy AI Resume Builder Interface"
                            }
                        ],
                        "review": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "1250",
                            "bestRating": "5",
                            "worstRating": "1"
                        },
                        "creator": {
                            "@type": "Organization",
                            "name": "Guidy AI",
                            "url": "https://guidy.com",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "/logo.png"
                            },
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "telephone": "+237693427913",
                                "contactType": "customer service",
                                "email": "guidy.makeitreall@gmail.com",
                                "availableLanguage": ["French", "English"]
                            }
                        },
                        "potentialAction": {
                            "@type": "UseAction",
                            "target": {
                                "@type": "EntryPoint",
                                "urlTemplate": "https://guidy.com/register",
                                "actionPlatform": [
                                    "http://schema.org/DesktopWebPlatform",
                                    "http://schema.org/MobileWebPlatform"
                                ]
                            },
                            "expectsAcceptanceOf": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            }
                        }
                    })}
                </script>

                {/* Données structurées FAQ bilingue */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Comment fonctionne le créateur de CV IA de Guidy?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Guidy utilise l'IA avancée pour analyser votre expérience professionnelle et créer des CV adaptés à votre région et secteur cibles. Saisissez simplement vos informations, sélectionnez vos préférences, et notre IA génère des CV professionnels compatibles ATS en quelques minutes. Nos templates sont optimisés pour maximiser votre taux de réponse."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How does Guidy's AI resume builder work?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Guidy uses advanced AI to analyze your professional experience and create tailored resumes optimized for your target region and industry. Simply input your details, select your preferences, and our AI generates professional, ATS-friendly resumes in minutes. Our templates are optimized to maximize your response rate from recruiters."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Est-ce que Guidy est disponible dans mon pays?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Oui! Guidy est disponible dans le monde entier avec des optimisations spécifiques pour l'Amérique du Nord, l'Europe, l'Afrique et les marchés anglophones mondiaux. Notre plateforme prend en charge l'anglais et le français avec des modèles adaptés à chaque région, respectant les normes locales de recrutement."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is Guidy available in my country?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes! Guidy is available worldwide with specific optimizations for North America, Europe, Africa, and global English-speaking markets. Our platform supports English and French languages with region-specific templates that follow local recruitment standards and employer expectations."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Est-ce que Guidy est gratuit?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Oui, Guidy propose une version gratuite qui vous permet de créer des CV professionnels et d'accéder aux fonctionnalités de base. Vous pouvez créer autant de CV que vous souhaitez, les télécharger en PDF et accéder à nos conseils de base sans frais. Des options premium sont disponibles pour des fonctionnalités avancées."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is Guidy free to use?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, Guidy offers a free version that allows you to create professional resumes and access basic features. You can create as many resumes as you want, download them as PDFs, and access our basic career advice at no cost. Premium options are available for advanced features and personalized guidance."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Les CV créés avec Guidy sont-ils optimisés pour les ATS?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Absolument! Tous nos modèles de CV sont conçus pour être parfaitement compatibles avec les systèmes ATS (Applicant Tracking Systems) utilisés par les recruteurs. Notre IA analyse les offres d'emploi pour suggérer les mots-clés pertinents à inclure dans votre CV, augmentant ainsi vos chances de passer les filtres automatiques."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Are Guidy's resumes optimized for ATS?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Absolutely! All our resume templates are designed to be fully compatible with Applicant Tracking Systems (ATS) used by recruiters. Our AI analyzes job postings to suggest relevant keywords to include in your resume, increasing your chances of passing automated filters and reaching the interview stage."
                                }
                            }
                        ]
                    })}
                </script>

                {/* Données structurées Organisation */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Guidy",
                        "url": "https://guidy.com",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "/logo.png"
                        },
                        "slogan": "Your AI Career Partner",
                        "description": "Guidy provides AI-powered career tools including resume building, interview preparation, and personalized career advice.",
                        "email": "guidy.makeitreall@gmail.com",
                        "telephone": "+237693427913",
                        "contactPoint": [
                            {
                                "@type": "ContactPoint",
                                "telephone": "+237693427913",
                                "contactType": "customer service",
                                "email": "guidy.makeitreall@gmail.com",
                                "availableLanguage": ["French", "English"]
                            }
                        ]
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "url": "https://guidy.com",
                        "name": "Guidy - AI Resume Builder",
                        "alternateName": "Guidy - Créateur de CV IA",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://guidy.com/search?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        },
                        "hasPart": [
                            {
                                "@type": "WebPage",
                                "isPartOf": {
                                    "@id": "https://guidy.com"
                                },
                                "name": "CV Creator",
                                "url": "https://guidy.com/create-cv"
                            },
                            {
                                "@type": "WebPage",
                                "isPartOf": {
                                    "@id": "https://guidy.com"
                                },
                                "name": "Cover Letter Generator",
                                "url": "https://guidy.com/cover-letter"
                            },
                            {
                                "@type": "WebPage",
                                "isPartOf": {
                                    "@id": "https://guidy.com"
                                },
                                "name": "Interview Preparation",
                                "url": "https://guidy.com/interview"
                            }
                        ]
                    })}
                </script>

                {/* Données structurées pour les statistiques */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Dataset",
                        "name": "Guidy Platform Statistics",
                        "description": "Key performance metrics for the Guidy AI Resume Platform",
                        "keywords": ["resume builder statistics", "career assistance metrics", "user satisfaction", "platform metrics"],
                        "creator": {
                            "@type": "Organization",
                            "name": "Guidy",
                            "url": "https://guidy.com"
                        },
                        "variableMeasured": [
                            {
                                "@type": "PropertyValue",
                                "name": "Active Users",
                                "value": "50000+"
                            },
                            {
                                "@type": "PropertyValue",
                                "name": "User Satisfaction",
                                "value": "95%"
                            },
                            {
                                "@type": "PropertyValue",
                                "name": "CVs Created",
                                "value": "75000+"
                            },
                            {
                                "@type": "PropertyValue",
                                "name": "Platform Availability",
                                "value": "99%"
                            }
                        ]
                    })}
                </script>
            </Head>

            <div className="opacity-25"><FluidCursorEffect zIndex={100} /></div>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <main className="pt-20 md:pt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Badge hero amélioré */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="mb-8 text-center"
                        >
                            <span className="inline-flex items-center bg-gradient-to-r from-amber-100 to-purple-100 dark:from-amber-900/40 dark:to-purple-900/40 text-amber-800 dark:text-amber-300 px-6 py-3 rounded-full text-sm md:text-base font-semibold border border-amber-200 dark:border-amber-700 shadow-lg">
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('hero.badge')}
                            </span>
                        </motion.div>

                        {/* Call-to-Action principal avec espacement amélioré */}
                        <div className="mb-12 md:mb-20">
                            <ImageCallToAction />
                        </div>

                        {/* Core Features Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, staggerChildren: 0.1 }}
                            className="mb-16 md:mb-24"
                        >
                            <div className="text-center mb-12">
                                <motion.h2
                                    className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-purple-600 to-amber-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    {t('sections.core_features')}
                                </motion.h2>
                                <motion.p
                                    className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Everything you need to accelerate your career with AI-powered tools
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <FeatureCard
                                            icon={feature.icon}
                                            title={feature.title}
                                            description={feature.description}
                                            action={feature.action}
                                            link={feature.link}
                                            color={feature.color}
                                            bgColor={feature.bgColor}
                                            premium={feature.premium}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Additional Features Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, staggerChildren: 0.1 }}
                            className="mb-16 md:mb-24"
                        >
                            <div className="text-center mb-12">
                                <motion.h2
                                    className="text-2xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-amber-600 to-purple-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    {t('sections.advanced_tools')}
                                </motion.h2>
                                <motion.p
                                    className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Professional tools to give you the competitive edge in today's job market
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {additionalFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <AdditionalFeatureCard
                                            icon={feature.icon}
                                            title={feature.title}
                                            description={feature.description}
                                            color={feature.color}
                                            bgColor={feature.bgColor}
                                            comingSoon={feature.comingSoon}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Statistiques avec animations séquentielles */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-20"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {statistics.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15, duration: 0.5 }}
                                >
                                    <StatisticCard
                                        icon={stat.icon}
                                        value={stat.value}
                                        label={stat.label}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA final amélioré */}
                        <motion.div
                            className="text-center pb-16 md:pb-20"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="inline-flex items-center bg-gradient-to-r from-purple-100 to-amber-100 dark:from-purple-900/40 dark:to-amber-900/40 text-purple-800 dark:text-purple-300 px-6 py-3 rounded-full text-sm md:text-base font-semibold border border-purple-200 dark:border-purple-700 shadow-lg">
                                    <Trophy className="w-4 h-4 mr-2" />
                                    {t('cta.badge')}
                                </span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center"
                            >
                                <a
                                    href="/guest-cv"
                                    className="inline-flex items-center bg-white text-amber-600 border-2 border-amber-500 px-6 md:px-8 py-3 md:py-4 rounded-2xl text-base md:text-lg font-bold hover:bg-amber-50 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 group"
                                >
                                    <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                                    {t('cta.try_guest')}
                                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl text-base md:text-lg font-bold hover:from-amber-600 hover:via-purple-600 hover:to-amber-600 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 group"
                                >
                                    <Star className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 group-hover:rotate-12 transition-transform" />
                                    {t('cta.button')}
                                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2 md:ml-3 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </main>

                {/* Footer amélioré */}
                <footer className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto py-12 md:py-16 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                            {/* Logo et description */}
                            <div className="col-span-1 md:col-span-2">
                                <motion.div
                                    className="flex items-center space-x-3 mb-6"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400 }}
                                >
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500 shadow-lg">
                                        <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    </div>
                                    <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-amber-500 via-purple-500 to-amber-500 text-transparent bg-clip-text">
                                        {t('brand')}
                                    </span>
                                </motion.div>
                                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed max-w-md">
                                    {t('hero.description')}
                                </p>
                                <div className="flex space-x-4">
                                    <motion.a
                                        href="mailto:guidy.makeitreall@gmail.com"
                                        className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Mail className="h-5 w-5 md:h-6 md:w-6" />
                                    </motion.a>
                                    <motion.a
                                        href="https://wa.me/237693427913"
                                        className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-all"
                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
                                    </motion.a>
                                </div>
                            </div>

                            {/* Services */}
                            <div>
                                <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 mb-4 md:mb-6">{t('footer.services.title')}</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                            {t('footer.services.resume')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                            {t('footer.services.advisor')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                            {t('footer.services.interview')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Légal */}
                            <div>
                                <h3 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-200 mb-4 md:mb-6">{t('footer.legal.title')}</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                            {t('footer.legal.privacy')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                            {t('footer.legal.terms')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                            {t('footer.legal.cookies')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mentions-legales" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium">
                                            {t('footer.legal.mentions')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Copyright avec séparateur amélioré */}
                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <p className="text-center md:text-left text-gray-500 dark:text-gray-400 font-medium">
                                    © {new Date().getFullYear()} {t('brand')}. {t('footer.copyright')}
                                </p>
                                <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
                                    <span className="text-xs md:text-sm">Made with</span>
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <Star className="w-4 h-4 text-amber-500" />
                                    </motion.div>
                                    <span className="text-xs md:text-sm">by Guidy Team</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </GuestLayout>
    );
}
