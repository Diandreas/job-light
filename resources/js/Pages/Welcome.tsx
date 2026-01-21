import React, { useState, useEffect, useRef } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from 'react-i18next';
import {
    FileText, Brain, PenTool, MessageSquare,
    Sparkles, ArrowRight, Star, Check,
    Users, Award, Trophy, Zap, Globe, Mail,
    Play, ChevronDown, Rocket, Shield, Clock,
    TrendingUp, Target, Briefcase
} from 'lucide-react';
import { cn } from "@/lib/utils";

// Composant Hero moderne avec animation de texte
const ModernHero = () => {
    const { t } = useTranslation();
    const [currentWord, setCurrentWord] = useState(0);
    const words = [t('hero.words.professional'), t('hero.words.impressive'), t('hero.words.optimized')];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWord((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background avec effet de grille moderne */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Gradient orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
                {/* Badge animé */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-sm font-medium text-amber-700 dark:text-amber-300">
                        <Sparkles className="w-4 h-4" />
                        {t('hero.badge')}
                        <ArrowRight className="w-3 h-3" />
                    </span>
                </motion.div>

                {/* Titre principal avec animation de mots */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6"
                >
                    <span className="text-gray-900 dark:text-white">{t('hero.title_start')}</span>
                    <br className="hidden sm:block" />
                    <span className="relative inline-block">
                        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 bg-clip-text text-transparent">
                            {t('hero.title_highlight')}
                        </span>
                    </span>
                    <br />
                    <motion.span
                        key={currentWord}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="inline-block bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent"
                    >
                        {words[currentWord]}
                    </motion.span>
                </motion.h1>

                {/* Sous-titre */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    {t('hero.description')}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
                >
                    <Link
                        href={route('register')}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1"
                    >
                        <Rocket className="w-5 h-5" />
                        {t('cta.button')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a
                        href="/guest-cv"
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <Play className="w-5 h-5 text-amber-500" />
                        {t('cta.try_guest')}
                    </a>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400"
                >
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{t('trust.free')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{t('trust.no_card')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{t('trust.ats')}</span>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex flex-col items-center gap-2 text-gray-400"
                    >
                        <span className="text-xs">{t('hero.scroll')}</span>
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

// Section des fonctionnalités avec design moderne
const FeaturesSection = () => {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const features = [
        {
            icon: FileText,
            title: t('features.cv_designer.title'),
            description: t('features.cv_designer.description'),
            color: 'from-amber-500 to-orange-500',
            link: '/guest-cv'
        },
        {
            icon: Brain,
            title: t('features.career_advisor.title'),
            description: t('features.career_advisor.description'),
            color: 'from-purple-500 to-pink-500',
            premium: true
        },
        {
            icon: PenTool,
            title: t('features.cover_letter.title'),
            description: t('features.cover_letter.description'),
            color: 'from-emerald-500 to-teal-500'
        },
        {
            icon: MessageSquare,
            title: t('features.interview_coach.title'),
            description: t('features.interview_coach.description'),
            color: 'from-blue-500 to-indigo-500',
            premium: true
        }
    ];

    return (
        <section ref={ref} className="py-24 px-4 relative">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold mb-4">
                        {t('sections.features_badge')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        {t('sections.core_features')}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t('sections.core_features_desc')}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative bg-white dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 hover:border-amber-200 dark:hover:border-amber-700/50 shadow-sm hover:shadow-xl transition-all duration-500"
                        >
                            {/* Gradient hover effect */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`} />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    {feature.premium && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                                            PRO
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {feature.description}
                                </p>
                                <Link
                                    href={feature.link || route('register')}
                                    className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold group/link"
                                >
                                    {t('features.learn_more')}
                                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Section des statistiques avec compteur anime
const StatsSection = () => {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const stats = [
        { value: 50000, suffix: '+', label: t('stats.users'), icon: Users },
        { value: 95, suffix: '%', label: t('stats.satisfaction'), icon: Award },
        { value: 75000, suffix: '+', label: t('stats.cvs'), icon: FileText },
        { value: 99, suffix: '%', label: t('stats.availability'), icon: Zap }
    ];

    const Counter = ({ value, suffix }: { value: number; suffix: string }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (!isInView) return;

            let start = 0;
            const duration = 2000;
            const startTime = Date.now();

            const timer = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                setCount(Math.floor(value * easeOut));

                if (progress >= 1) clearInterval(timer);
            }, 16);

            return () => clearInterval(timer);
        }, [isInView, value]);

        return <span>{count.toLocaleString()}{suffix}</span>;
    };

    return (
        <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 mb-4">
                                <stat.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                                <Counter value={stat.value} suffix={stat.suffix} />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Section "Comment ca marche"
const HowItWorksSection = () => {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const steps = [
        {
            number: '01',
            title: t('how_it_works.step1.title'),
            description: t('how_it_works.step1.description'),
            icon: Target
        },
        {
            number: '02',
            title: t('how_it_works.step2.title'),
            description: t('how_it_works.step2.description'),
            icon: Sparkles
        },
        {
            number: '03',
            title: t('how_it_works.step3.title'),
            description: t('how_it_works.step3.description'),
            icon: TrendingUp
        }
    ];

    return (
        <section ref={ref} className="py-24 px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

            <div className="relative max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-4">
                        {t('how_it_works.badge')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                        {t('how_it_works.title')}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t('how_it_works.description')}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className="relative"
                        >
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-amber-300 to-transparent dark:from-amber-700" />
                            )}

                            <div className="relative bg-white dark:bg-gray-800/50 rounded-3xl p-8 border border-gray-100 dark:border-gray-700/50 text-center hover:shadow-xl transition-shadow duration-300">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-600 text-white text-2xl font-black mb-6 shadow-lg">
                                    {step.number}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Section CTA finale
const FinalCTA = () => {
    const { t } = useTranslation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <section ref={ref} className="py-24 px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 via-orange-500 to-purple-600 p-1">
                    <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-purple-600 rounded-[2.3rem] px-8 py-16 sm:px-16 text-center">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-600/30 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={isInView ? { scale: 1 } : {}}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="inline-flex p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-8"
                            >
                                <Rocket className="w-8 h-8 text-white" />
                            </motion.div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
                                {t('final_cta.title')}
                            </h2>
                            <p className="text-lg text-white/90 max-w-xl mx-auto mb-10">
                                {t('final_cta.description')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-amber-600 font-bold rounded-2xl hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <Star className="w-5 h-5" />
                                    {t('final_cta.button')}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <a
                                    href="/guest-cv"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                                >
                                    {t('final_cta.try_free')}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

// Footer moderne
const ModernFooter = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-purple-600">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-xl bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent">
                                {t('brand')}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {t('footer.tagline')}
                        </p>
                        <div className="flex gap-3">
                            <a href="mailto:guidy.makeitreall@gmail.com" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                                <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </a>
                            <a href="https://wa.me/237693427913" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t('footer.services.title')}</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/guest-cv" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.services.resume')}</Link></li>
                            <li><Link href={route('register')} className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.services.advisor')}</Link></li>
                            <li><Link href={route('register')} className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.services.interview')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t('footer.legal.title')}</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.privacy')}</Link></li>
                            <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.terms')}</Link></li>
                            <li><Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.cookies')}</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t('footer.support.title')}</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href={route('support')} className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.support.help')}</Link></li>
                            <li><a href="mailto:guidy.makeitreall@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.support.contact')}</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} {t('brand')}. {t('footer.copyright')}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{t('footer.made_with')}</span>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>{t('footer.by_team')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Page principale
export default function Welcome() {
    return (
        <GuestLayout>
            <Head>
                <title>Guidy | Créez un CV Professionnel avec l'IA</title>
                <meta name="description" content="Créez gratuitement un CV optimisé ATS avec notre IA. Templates internationaux, conseils de carrière personnalisés." />
                <meta name="keywords" content="CV IA, CV ATS, resume builder, AI CV, lettre de motivation, cover letter, préparation entretien, interview preparation, template CV, modèle CV" />
                <meta name="theme-color" content="#F59E0B" />
                <link rel="canonical" href="https://guidy.com" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Guidy" />
                <meta property="og:title" content="Guidy | Créez un CV Professionnel avec l'IA" />
                <meta property="og:description" content="Créez gratuitement un CV optimisé ATS avec notre IA." />
                <meta property="og:url" content="https://guidy.com" />
                <meta property="og:image" content="/image.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Guidy | Créez un CV Professionnel avec l'IA" />
                <meta name="twitter:description" content="Créez gratuitement un CV optimisé ATS avec notre IA." />
                <meta name="twitter:image" content="/image.png" />
                <link rel="icon" href="/ai.png" />
            </Head>

            <div className="min-h-screen bg-white dark:bg-gray-950">
                <ModernHero />
                <FeaturesSection />
                <StatsSection />
                <HowItWorksSection />
                <FinalCTA />
                <ModernFooter />
            </div>
        </GuestLayout>
    );
}
