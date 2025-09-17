import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar, Sparkles, Zap, Target, Terminal,
    Code, Cpu, Shield, Wifi, Database, Binary
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface NeonCyberDesignProps {
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
        : '0, 255, 255';
};

// Utility function to safely extract text from objects
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

// Cyber grid background
const CyberGrid = () => {
    return (
        <div className="fixed inset-0 pointer-events-none opacity-20">
            <svg
                className="w-full h-full"
                viewBox="0 0 1000 1000"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern
                        id="cyber-grid"
                        x="0"
                        y="0"
                        width="50"
                        height="50"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 50 0 L 0 0 0 50"
                            fill="none"
                            stroke="url(#cyber-gradient)"
                            strokeWidth="1"
                        />
                    </pattern>
                    <linearGradient id="cyber-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ffff" />
                        <stop offset="50%" stopColor="#ff00ff" />
                        <stop offset="100%" stopColor="#ffff00" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#cyber-grid)" />
            </svg>
        </div>
    );
};

// Glitch text effect
const GlitchText = ({ children, className = "", ...props }: any) => {
    const [isGlitching, setIsGlitching] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsGlitching(true);
            setTimeout(() => setIsGlitching(false), 150);
        }, 3000 + Math.random() * 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("relative", className)} {...props}>
            <span className={cn("relative z-10", isGlitching && "animate-pulse")}>
                {children}
            </span>
            {isGlitching && (
                <>
                    <span
                        className="absolute top-0 left-0 text-cyan-400 opacity-70"
                        style={{ transform: 'translate(-2px, -1px)' }}
                    >
                        {children}
                    </span>
                    <span
                        className="absolute top-0 left-0 text-pink-400 opacity-70"
                        style={{ transform: 'translate(2px, 1px)' }}
                    >
                        {children}
                    </span>
                </>
            )}
        </div>
    );
};

// Neon border component
const NeonCard = ({ children, className = "", glow = "cyan", ...props }: any) => {
    const glowColors = {
        cyan: 'shadow-cyan-400/50 border-cyan-400',
        pink: 'shadow-pink-400/50 border-pink-400',
        yellow: 'shadow-yellow-400/50 border-yellow-400',
        green: 'shadow-green-400/50 border-green-400',
        purple: 'shadow-purple-400/50 border-purple-400'
    };

    return (
        <motion.div
            className={cn(
                "relative bg-black/80 backdrop-blur-sm border-2 rounded-lg",
                "hover:shadow-2xl transition-all duration-300",
                glowColors[glow as keyof typeof glowColors] || glowColors.cyan,
                className
            )}
            whileHover={{
                scale: 1.02,
                boxShadow: `0 0 30px rgba(0, 255, 255, 0.6)`
            }}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-pink-400/10 rounded-lg" />
            {children}
        </motion.div>
    );
};

// Terminal typing effect
const TerminalText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex < text.length) {
                setDisplayText(text.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }
        }, 50 + Math.random() * 50);

        return () => clearTimeout(timer);
    }, [currentIndex, text]);

    return (
        <span className="font-mono">
            {displayText}
            <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-cyan-400"
            >
                _
            </motion.span>
        </span>
    );
};

export default function NeonCyberDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: NeonCyberDesignProps) {
    const { t } = useTranslation();
    const { scrollY } = useScroll();

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#00ffff';
    const secondaryColor = settings.secondary_color || '#ff00ff';

    // Parallax effects
    const backgroundY = useTransform(scrollY, [0, 500], [0, -100]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                duration: 1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Cyber Grid Background */}
            <CyberGrid />

            {/* Animated Neon Lines */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    animate={{
                        x: ['-100%', '100%'],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2
                    }}
                />
                <motion.div
                    className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent"
                    animate={{
                        x: ['100%', '-100%'],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatDelay: 1
                    }}
                />
            </div>

            {/* Main Content */}
            <motion.div
                className="relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Hero Section */}
                <motion.section className="min-h-screen flex items-center justify-center px-4 py-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            {/* Profile Info */}
                            <motion.div variants={itemVariants} className="text-center lg:text-left">
                                {/* Terminal Header */}
                                <div className="mb-8">
                                    <NeonCard className="p-4 font-mono text-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex gap-1">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                            <span className="text-gray-400">cyberterminal.exe</span>
                                        </div>
                                        <div className="text-green-400">
                                            <div>$ whoami</div>
                                            <div className="text-cyan-400">
                                                <TerminalText text={user.name} />
                                            </div>
                                            <div>$ cat profession.txt</div>
                                            <div className="text-pink-400">
                                                <TerminalText
                                                    text={cvData?.professional_title || user.full_profession || 'Cyber Professional'}
                                                    delay={2000}
                                                />
                                            </div>
                                        </div>
                                    </NeonCard>
                                </div>

                                {/* Profile Image */}
                                <motion.div
                                    className="relative w-48 h-48 mx-auto lg:mx-0 mb-8"
                                    whileHover={{
                                        scale: 1.1,
                                        filter: 'hue-rotate(90deg)'
                                    }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 animate-spin"
                                        style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-2 rounded-full bg-black" />
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt={user.name}
                                            className="absolute inset-4 w-40 h-40 rounded-full object-cover filter contrast-125 saturate-125"
                                        />
                                    ) : (
                                        <div className="absolute inset-4 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400 to-pink-600 flex items-center justify-center">
                                            <User className="w-20 h-20 text-black" />
                                        </div>
                                    )}

                                    {/* Scanning effect */}
                                    <motion.div
                                        className="absolute inset-4 rounded-full border-2 border-cyan-400"
                                        animate={{
                                            rotate: 360,
                                            borderColor: ['#00ffff', '#ff00ff', '#ffff00', '#00ffff']
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    />
                                </motion.div>

                                {/* Glitch Name */}
                                <GlitchText className="text-5xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                                    {user.name}
                                </GlitchText>

                                {/* Profession */}
                                <motion.p
                                    className="text-xl lg:text-2xl text-cyan-400 mb-8 font-mono"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {'>'} {cvData?.professional_title || user.full_profession || 'Cyber Professional'}
                                </motion.p>

                                {/* Status Indicators */}
                                <motion.div
                                    className="flex justify-center lg:justify-start gap-4 mb-8 font-mono text-sm"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-green-400">ONLINE</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                        <span className="text-cyan-400">AVAILABLE</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                        <span className="text-yellow-400">SECURE</span>
                                    </div>
                                </motion.div>

                                {/* Contact Matrix */}
                                <motion.div
                                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    {[
                                        { icon: Mail, href: `mailto:${user.email}`, label: 'EMAIL', color: 'cyan' },
                                        { icon: Phone, href: `tel:${user.phone}`, label: 'PHONE', color: 'pink' },
                                        { icon: Github, href: user.github, label: 'GITHUB', color: 'yellow' },
                                        { icon: Linkedin, href: user.linkedin, label: 'LINKEDIN', color: 'green' }
                                    ].filter(item => item.href).map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <NeonCard glow={item.color} className="p-3 text-center">
                                                <item.icon className="w-6 h-6 mx-auto mb-1 text-cyan-400 group-hover:text-pink-400 transition-colors" />
                                                <div className="text-xs font-mono text-gray-400 group-hover:text-white transition-colors">
                                                    {item.label}
                                                </div>
                                            </NeonCard>
                                        </motion.a>
                                    ))}
                                </motion.div>
                            </motion.div>

                            {/* System Stats */}
                            <motion.div variants={itemVariants} className="space-y-6">
                                <NeonCard glow="cyan" className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-black" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-cyan-400 font-mono">EXPERIENCES.EXE</h3>
                                            <p className="text-gray-400 font-mono text-sm">{cvData?.experiences?.length || 0} modules loaded</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <motion.div
                                            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: '85%' }}
                                            transition={{ delay: 1, duration: 1.5 }}
                                        />
                                    </div>
                                </NeonCard>

                                <NeonCard glow="pink" className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center">
                                            <Cpu className="w-6 h-6 text-black" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-pink-400 font-mono">SKILLS.SYS</h3>
                                            <p className="text-gray-400 font-mono text-sm">{cvData?.skills?.length || 0} processes running</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <motion.div
                                            className="h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: '92%' }}
                                            transition={{ delay: 1.2, duration: 1.5 }}
                                        />
                                    </div>
                                </NeonCard>

                                <NeonCard glow="yellow" className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                                            <Heart className="w-6 h-6 text-black" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-yellow-400 font-mono">INTERESTS.DAT</h3>
                                            <p className="text-gray-400 font-mono text-sm">{cvData?.hobbies?.length || 0} files encrypted</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2">
                                        <motion.div
                                            className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: '78%' }}
                                            transition={{ delay: 1.4, duration: 1.5 }}
                                        />
                                    </div>
                                </NeonCard>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* About Section */}
                {(settings.show_summary && (cvData?.summary || cvData?.summaries?.[0])) && (
                    <section className="py-20 px-4">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <NeonCard glow="green" className="p-8">
                                    <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3 font-mono">
                                        <Terminal className="w-8 h-8" />
                                        README.md
                                    </h2>
                                    <div className="font-mono text-gray-300 leading-relaxed">
                                        <div className="text-green-400 mb-2"># About Me</div>
                                        <div className="text-cyan-400 mb-4">```bash</div>
                                        <p className="pl-4 border-l-2 border-cyan-400 text-gray-300">
                                            {safeText(cvData?.summary || cvData?.summaries?.[0])}
                                        </p>
                                        <div className="text-cyan-400 mt-4">```</div>
                                    </div>
                                </NeonCard>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* Experience Section */}
                {(settings.show_experiences && cvData?.experiences?.length > 0) && (
                    <section className="py-20 px-4">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-12 font-mono flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Database className="w-10 h-10 text-cyan-400" />
                                <GlitchText>EXPERIENCE_LOG.DB</GlitchText>
                            </motion.h2>

                            <div className="space-y-8">
                                {cvData.experiences.map((exp: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -100 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <NeonCard
                                            glow={index % 2 === 0 ? 'cyan' : 'pink'}
                                            className="p-6"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                                                    <Binary className="w-6 h-6 text-black" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-mono text-sm text-gray-400 mb-2">
                                                        {'>'} EXECUTING: experience_{index + 1}.exe
                                                    </div>
                                                    <h3 className="text-xl font-bold text-cyan-400 mb-2 font-mono">
                                                        {exp.name}
                                                    </h3>
                                                    <p className="text-pink-400 font-medium mb-1 font-mono">
                                                        @ {exp.InstitutionName}
                                                    </p>
                                                    <p className="text-yellow-400 text-sm mb-3 flex items-center gap-2 font-mono">
                                                        <Calendar className="w-4 h-4" />
                                                        {exp.date_start && exp.date_end ?
                                                            `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} → ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                                            exp.date_start ?
                                                                `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} → ACTIVE` :
                                                                'PERIOD_NOT_SPECIFIED'
                                                        }
                                                    </p>

                                                    {/* Description */}
                                                    {exp.description && (
                                                        <div className="text-gray-300 font-mono text-sm leading-relaxed bg-black/50 p-3 rounded border border-cyan-400/30 mb-3">
                                                            <div className="text-green-400 mb-1">$ cat description.txt</div>
                                                            {safeText(exp.description)}
                                                        </div>
                                                    )}

                                                    {/* Informations détaillées */}
                                                    <div className="space-y-2 mb-3">
                                                        {(exp.date_start || exp.date_end) && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>FULL_DATE: {exp.date_start && new Date(exp.date_start).toLocaleDateString('fr-FR')}
                                                                    {exp.date_start && exp.date_end && ' - '}
                                                                    {exp.date_end && new Date(exp.date_end).toLocaleDateString('fr-FR')}</span>
                                                            </div>
                                                        )}

                                                        {exp.output && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>OUTPUT: {exp.output}</span>
                                                            </div>
                                                        )}

                                                        {exp.category_name && (
                                                            <div className="inline-block px-2 py-1 bg-cyan-400/20 border border-cyan-400/50 rounded text-xs text-cyan-400 font-mono">
                                                                {exp.category_name}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Références */}
                                                    {exp.references && exp.references.length > 0 && (
                                                        <div className="mt-3 p-3 bg-black/50 border border-pink-400/30 rounded">
                                                            <div className="text-green-400 font-mono text-xs mb-2">$ ls references/</div>
                                                            <div className="space-y-2">
                                                                {exp.references.map((ref, refIndex) => (
                                                                    <div key={refIndex} className="text-xs text-gray-300 font-mono">
                                                                        <div className="text-pink-400 font-medium">{ref.name}</div>
                                                                        {ref.function && <div className="text-cyan-400">function: {ref.function}</div>}
                                                                        {ref.email && <div className="text-yellow-400">email: {ref.email}</div>}
                                                                        {ref.telephone && <div className="text-green-400">phone: {ref.telephone}</div>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Pièces jointes */}
                                                    {exp.attachment_path && (
                                                        <div className="mt-3">
                                                            <a
                                                                href={exp.attachment_path}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-cyan-400/20 border border-cyan-400/50 rounded text-sm text-cyan-400 font-mono transition-all duration-300"
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                {exp.attachment_name || 'view_document.pdf'}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </NeonCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Skills Section */}
                {(settings.show_competences && cvData?.competences?.length > 0) && (
                    <section className="py-20 px-4">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-12 font-mono flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Shield className="w-10 h-10 text-green-400" />
                                <GlitchText>SKILL_MATRIX.EXE</GlitchText>
                            </motion.h2>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cvData.competences.map((competence: any, index: number) => {
                                    const colors = ['cyan', 'pink', 'yellow', 'green', 'purple'];
                                    const glow = colors[index % colors.length];

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.6 }}
                                            viewport={{ once: true }}
                                        >
                                            <NeonCard glow={glow} className="p-6 group">
                                                <div className="font-mono">
                                                    <div className="text-xs text-gray-400 mb-2">
                                                        skill_{index + 1}.dll
                                                    </div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`w-8 h-8 rounded bg-gradient-to-r from-${glow}-400 to-${glow}-600 flex items-center justify-center`}>
                                                            <Code className="w-4 h-4 text-black" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-white">
                                                            {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                                        </h3>
                                                    </div>
                                                    {competence.level && (
                                                        <>
                                                            <div className="text-xs text-gray-400 mb-1">
                                                                PROFICIENCY: {competence.level}%
                                                            </div>
                                                            <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                                                                <motion.div
                                                                    className={`h-2 rounded-full bg-gradient-to-r from-${glow}-400 to-${glow}-600`}
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: `${competence.level}%` }}
                                                                    transition={{ delay: index * 0.05 + 0.5, duration: 1.5 }}
                                                                    viewport={{ once: true }}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="text-xs text-green-400">
                                                        STATUS: LOADED ✓
                                                    </div>
                                                </div>
                                            </NeonCard>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Hobbies Section */}
                {(settings.show_hobbies && cvData?.hobbies?.length > 0) && (
                    <section className="py-20 px-4">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-12 font-mono flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Wifi className="w-10 h-10 text-purple-400" />
                                <GlitchText>PASSION_NET.SYS</GlitchText>
                            </motion.h2>

                            <div className="flex flex-wrap justify-center gap-4">
                                {cvData.hobbies.map((hobby: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.5 }}
                                        viewport={{ once: true }}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                    >
                                        <NeonCard glow="purple" className="p-4">
                                            <div className="font-mono text-center">
                                                <div className="text-xs text-gray-400 mb-1">
                                                    hobby_{index + 1}.exe
                                                </div>
                                                <div className="text-purple-400 font-semibold">
                                                    {safeText(hobby.name || hobby)}
                                                </div>
                                                <div className="text-xs text-green-400 mt-1">
                                                    ACTIVE
                                                </div>
                                            </div>
                                        </NeonCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact Section */}
                {settings.show_contact_info && (
                    <section className="py-20 px-4">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <NeonCard glow="green" className="p-8 text-center">
                                    <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center justify-center gap-3 font-mono">
                                        <Contact className="w-8 h-8" />
                                        <GlitchText>{t('portfolio.designs.neon.contact')}</GlitchText>
                                    </h2>
                                    <div className="font-mono text-gray-300 mb-8">
                                        <div className="text-cyan-400">$ ./initiate_contact.sh</div>
                                        <div className="text-green-400">Establishing secure connection...</div>
                                        <div className="text-yellow-400">Ready to receive transmission.</div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {user.email && (
                                            <Button
                                                asChild
                                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-mono border-0"
                                            >
                                                <a href={`mailto:${user.email}`}>
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    SEND_EMAIL.exe
                                                </a>
                                            </Button>
                                        )}
                                        {user.phone && (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-mono"
                                            >
                                                <a href={`tel:${user.phone}`}>
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    CALL_NOW.exe
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </NeonCard>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* Cyberpunk Footer */}
                <footer className="relative z-10 py-12 text-center border-t border-cyan-400/30">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto px-4"
                    >
                        <NeonCard className="p-6" glow="cyan">
                            <div className="font-mono text-center">
                                <GlitchText>
                                    🌐 CYBERPUNK_PORTFOLIO.sys • USER: {user.name} • POWERED_BY: Guidy 🌐
                                </GlitchText>
                                <div className="text-xs text-gray-500 mt-2 font-mono">
                                    © {new Date().getFullYear()} • SYSTEM_ONLINE • SECURITY_LEVEL: MAXIMUM
                                </div>
                            </div>
                        </NeonCard>
                    </motion.div>
                </footer>
            </motion.div>
        </div>
    );
}
