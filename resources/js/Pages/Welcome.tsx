import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    FileText, Brain, PenTool, MessageSquare,
    Sparkles, ArrowRight, Star, ChevronRight,
    Users, Award, Trophy, Terminal
} from 'lucide-react';

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

const FeatureCard = ({ icon: Icon, title, description, action, link }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 transform group-hover:rotate-6 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-600 transition-colors">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={link} className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
                {action}
                <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    </motion.div>
);

const StatisticCard = ({ icon: Icon, value, label }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
    >
        <Icon className="w-8 h-8 text-amber-500 mb-4" />
        <div className="text-3xl font-bold text-gray-800 mb-2">
            <AnimatedCounter target={value} />
        </div>
        <p className="text-gray-600">{label}</p>
    </motion.div>
);

export default function Welcome() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-8 h-8 text-amber-500" />
                            </motion.div>
                            <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                Guidy
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href={route('login')} className="text-gray-600 hover:text-amber-600 transition-colors">
                                Connexion
                            </Link>
                            <Link
                                href={route('register')}
                                className="bg-gradient-to-r from-amber-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-amber-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all"
                            >
                                Démarrer Gratuitement
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        className="text-center mb-16"
                        style={{ opacity, y }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6"
                        >
                            <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                                🚀 Propulsez votre carrière avec l'IA
                            </span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-6xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text"
                        >
                            Votre guide professionnel intelligent
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                        >
                            Créez des CVs percutants, obtenez des conseils carrière personnalisés et préparez vos entretiens avec notre assistant IA de dernière génération
                        </motion.p>
                        <motion.div
                            className="flex justify-center space-x-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Link
                                href={route('register')}
                                className="inline-flex items-center px-8 py-4 rounded-full text-lg font-medium bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Commencer maintenant
                            </Link>
                        </motion.div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        <FeatureCard
                            icon={FileText}
                            title="CV Designer Pro"
                            description="Créez des CV professionnels avec nos modèles premium et exportez en PDF haute qualité."
                            action="Créer mon CV"
                            link={route('register')}
                        />
                        <FeatureCard
                            icon={Brain}
                            title="Conseiller Carrière IA"
                            description="Obtenez des conseils personnalisés pour votre développement professionnel."
                            action="Consulter l'assistant"
                            link={route('register')}
                        />
                        <FeatureCard
                            icon={PenTool}
                            title="Lettre de Motivation"
                            description="Générez des lettres de motivation impactantes adaptées à vos candidatures."
                            action="Rédiger ma lettre"
                            link={route('register')}
                        />
                        <FeatureCard
                            icon={MessageSquare}
                            title="Coach Entretien"
                            description="Préparez vos entretiens avec notre simulation interactive intelligente."
                            action="Préparer mon entretien"
                            link={route('register')}
                        />
                    </div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <StatisticCard
                            icon={Users}
                            value={50000}
                            label="Utilisateurs actifs"
                        />
                        <StatisticCard
                            icon={Award}
                            value={95}
                            label="% de satisfaction"
                        />
                        <StatisticCard
                            icon={Trophy}
                            value={75000}
                            label="CVs générés"
                        />
                        <StatisticCard
                            icon={Terminal}
                            value={99}
                            label="% de disponibilité"
                        />
                    </motion.div>

                    <div className="text-center pb-16">
                        <motion.div
                            className="mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                                L'assistant qui vous guide vers le succès
                            </span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={route('register')}
                                className="inline-flex items-center bg-gradient-to-r from-amber-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-amber-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                            >
                                <Star className="w-5 h-5 mr-2" />
                                Débloquez votre potentiel
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
