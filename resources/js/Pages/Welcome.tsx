import React, { useState, useEffect, useRef } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from 'react-i18next';
import {
    FileText, Brain, Sparkles, ArrowRight, Star, Check,
    Users, Award, Zap, Mail, ChevronRight,
    Rocket, MessageSquare, PenTool, Target,
    Briefcase, GraduationCap, TrendingUp, Shield,
    Play, Bot, Wand2, FileCheck, Download
} from 'lucide-react';

// ============================================
// HERO SECTION - Présentation des 2 modules clés
// ============================================
const HeroSection = () => {
    const { t } = useTranslation();
    const [activeModule, setActiveModule] = useState<'cv' | 'ai'>('cv');

    return (
        <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Background Effects */}
            <div className="absolute inset-0">
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Gradient orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-r from-amber-400/30 to-orange-400/30 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, delay: 2 }}
                    className="absolute bottom-20 -right-20 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
                {/* Header Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent">
                            {t('hero.badge')}
                        </span>
                    </span>
                </motion.div>

                {/* Main Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                        <span className="text-gray-900 dark:text-white">{t('hero.title_start')}</span>
                        <br />
                        <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 bg-clip-text text-transparent">
                            {t('hero.title_highlight')}
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t('hero.description')}
                    </p>
                </motion.div>

                {/* Module Selector Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-12"
                >
                    <div className="inline-flex p-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveModule('cv')}
                            className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeModule === 'cv'
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {activeModule === 'cv' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg"
                                />
                            )}
                            <span className="relative flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                CV Builder
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveModule('ai')}
                            className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeModule === 'ai'
                                ? 'text-white'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {activeModule === 'ai' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
                                />
                            )}
                            <span className="relative flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                AI Assistant
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Module Cards */}
                <AnimatePresence mode="wait">
                    {activeModule === 'cv' ? (
                        <CVModuleShowcase key="cv" />
                    ) : (
                        <AIModuleShowcase key="ai" />
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

// ============================================
// CV BUILDER MODULE SHOWCASE
// ============================================
const CVModuleShowcase = () => {
    const { t } = useTranslation();
    const features = [
        { icon: Wand2, text: t('cv_module.feature1') },
        { icon: FileCheck, text: t('cv_module.feature2') },
        { icon: Download, text: t('cv_module.feature3') },
        { icon: Shield, text: t('cv_module.feature4') },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
            {/* Left: Content */}
            <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-6">
                    <FileText className="w-3.5 h-3.5" />
                    {t('cv_module.badge')}
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('cv_module.title')}
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {t('cv_module.description')}
                </p>

                {/* Features list */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-sm"
                        >
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                                <feature.icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{feature.text}</span>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <a
                        href="/guest-cv"
                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1"
                    >
                        <Play className="w-5 h-5" />
                        {t('cv_module.cta_try')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <Link
                        href={route('register')}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 shadow-lg transition-all duration-300"
                    >
                        {t('cv_module.cta_register')}
                    </Link>
                </div>
            </div>

            {/* Right: Visual */}
            <div className="order-1 lg:order-2">
                <CVBuilderVisual />
            </div>
        </motion.div>
    );
};

// CV Builder Visual Component
const CVBuilderVisual = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-3xl" />

            {/* Main card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-400">cv-builder.guidy.com</span>
                </div>

                {/* Content - CV Preview */}
                <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                        {/* Sidebar */}
                        <div className="space-y-4">
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="h-20 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500"
                            />
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${60 + i * 10}%` }}
                                        transition={{ delay: i * 0.2, duration: 0.8 }}
                                        className="h-2 rounded-full bg-gray-200 dark:bg-gray-700"
                                    />
                                ))}
                            </div>
                            <div className="pt-4 space-y-3">
                                {['Skills', 'Languages', 'Contact'].map((label, i) => (
                                    <div key={label} className="space-y-1">
                                        <div className="h-2 w-16 rounded bg-amber-200 dark:bg-amber-800" />
                                        <div className="h-1.5 w-full rounded bg-gray-100 dark:bg-gray-700" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="col-span-2 space-y-4">
                            <div>
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '70%' }}
                                    transition={{ duration: 1 }}
                                    className="h-4 rounded bg-gray-800 dark:bg-white mb-2"
                                />
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '50%' }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-2 rounded bg-amber-500"
                                />
                            </div>

                            {/* Experience items */}
                            {[1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.3 }}
                                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-2"
                                >
                                    <div className="flex justify-between">
                                        <div className="h-2.5 w-32 rounded bg-gray-300 dark:bg-gray-600" />
                                        <div className="h-2 w-16 rounded bg-amber-200 dark:bg-amber-800" />
                                    </div>
                                    <div className="h-2 w-24 rounded bg-gray-200 dark:bg-gray-600" />
                                    <div className="space-y-1">
                                        <div className="h-1.5 w-full rounded bg-gray-100 dark:bg-gray-700" />
                                        <div className="h-1.5 w-4/5 rounded bg-gray-100 dark:bg-gray-700" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-gray-500">Auto-saving...</span>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold"
                        >
                            Download PDF
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Floating badges */}
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">ATS Optimized</span>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">5+ Templates</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ============================================
// AI ASSISTANT MODULE SHOWCASE
// ============================================
const AIModuleShowcase = () => {
    const { t } = useTranslation();
    const services = [
        { icon: Brain, title: t('ai_module.service1_title'), desc: t('ai_module.service1_desc'), color: 'from-purple-500 to-pink-500' },
        { icon: PenTool, title: t('ai_module.service2_title'), desc: t('ai_module.service2_desc'), color: 'from-blue-500 to-cyan-500' },
        { icon: MessageSquare, title: t('ai_module.service3_title'), desc: t('ai_module.service3_desc'), color: 'from-green-500 to-emerald-500' },
        { icon: Target, title: t('ai_module.service4_title'), desc: t('ai_module.service4_desc'), color: 'from-orange-500 to-red-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
            {/* Left: Visual */}
            <div>
                <AIAssistantVisual />
            </div>

            {/* Right: Content */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6">
                    <Bot className="w-3.5 h-3.5" />
                    {t('ai_module.badge')}
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('ai_module.title')}
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {t('ai_module.description')}
                </p>

                {/* Services Grid */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                        >
                            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${service.color} mb-3`}>
                                <service.icon className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{service.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href={route('register')}
                        className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
                    >
                        <Rocket className="w-5 h-5" />
                        {t('ai_module.cta_start')}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <span className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-xs">PRO</span>
                        {t('ai_module.pro_label')}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// AI Assistant Visual Component
const AIAssistantVisual = () => {
    const [currentMessage, setCurrentMessage] = useState(0);
    const messages = [
        { type: 'user', text: "Comment puis-je améliorer mon CV?" },
        { type: 'ai', text: "Je vais analyser votre CV et vous donner des conseils personnalisés pour le rendre plus impactant..." },
        { type: 'user', text: "Prépare-moi pour un entretien chez Google" },
        { type: 'ai', text: "Parfait! Commençons par les questions techniques fréquentes chez Google..." },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />

            {/* Main card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Guidy AI Assistant</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-white/80 text-xs">Online - Ready to help</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat area */}
                <div className="p-6 space-y-4 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {messages.slice(0, currentMessage + 1).map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.type === 'user'
                                    ? 'bg-gray-100 dark:bg-gray-700 rounded-br-md'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-bl-md'
                                    }`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-2"
                    >
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-400">Guidy is thinking...</span>
                    </motion.div>
                </div>

                {/* Input area */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-400">
                            Ask me anything...
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Floating badges */}
            <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -left-4 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">GPT-4 Powered</span>
                </div>
            </motion.div>

            <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">24/7 Available</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ============================================
// TRUST SECTION
// ============================================
const TrustSection = () => {
    const { t } = useTranslation();
    const stats = [
        { value: '50K+', label: t('stats.users'), icon: Users },
        { value: '95%', label: t('stats.satisfaction'), icon: Award },
        { value: '75K+', label: t('stats.cvs'), icon: FileText },
        { value: '99%', label: t('stats.availability'), icon: Zap },
    ];

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="max-w-6xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 to-purple-500/10 mb-4">
                                <stat.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
                                {stat.value}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center items-center gap-8"
                >
                    {[
                        { icon: Shield, text: t('trust.free') },
                        { icon: Check, text: t('trust.no_card') },
                        { icon: FileCheck, text: t('trust.ats') },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <item.icon className="w-5 h-5 text-green-500" />
                            <span className="font-medium">{item.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ============================================
// FINAL CTA SECTION
// ============================================
const FinalCTASection = () => {
    const { t } = useTranslation();

    return (
        <section className="py-24 px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
            >
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

                    <div className="relative rounded-[2.3rem] px-8 py-16 sm:px-16 text-center">
                        {/* Decorative grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring" }}
                                className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-purple-500 mb-8"
                            >
                                <Rocket className="w-8 h-8 text-white" />
                            </motion.div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
                                {t('final_cta.title')}
                            </h2>
                            <p className="text-lg text-gray-300 max-w-xl mx-auto mb-10">
                                {t('final_cta.description')}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={route('register')}
                                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-purple-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <Star className="w-5 h-5" />
                                    {t('final_cta.button')}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a
                                    href="/guest-cv"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
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

// ============================================
// FOOTER
// ============================================
const Footer = () => {
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
                            <li><a href="/guest-cv" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.services.resume')}</a></li>
                            <li><Link href={route('pricing')} className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.services.pricing')}</Link></li>
                            <li><Link href={route('register')} className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.services.advisor')}</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">{t('footer.legal.title')}</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.privacy')}</Link></li>
                            <li><Link href="/terms-and-conditions" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.terms')}</Link></li>
                            <li><Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.cookies')}</Link></li>
                            <li><Link href="/refund-policy" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.refund')}</Link></li>
                            <li><Link href="/mentions-legales" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{t('footer.legal.mentions')}</Link></li>
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

// ============================================
// MAIN PAGE
// ============================================
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
                <HeroSection />
                <TrustSection />
                <FinalCTASection />
                <Footer />
            </div>
        </GuestLayout>
    );
}
