import React, { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar, Sparkles, Zap, Target, Eye, Download,
    Star, Code, Palette, Music, Camera, Coffee, Layers,
    Hexagon, Diamond, Triangle, Circle, Square
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface GlassmorphismDesignProps {
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
        : '59, 130, 246';
};

// Utility function to safely extract text from objects
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

// Interactive 3D Glass Orbs
const InteractiveOrbs = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
    };

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" onMouseMove={handleMouseMove}>
            {[...Array(8)].map((_, i) => {
                const x = useTransform(mouseX, [0, window.innerWidth || 1920], [i * 200, i * 200 + 100]);
                const y = useTransform(mouseY, [0, window.innerHeight || 1080], [i * 150, i * 150 + 50]);

                return (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            x,
                            y,
                            width: 120 + i * 30,
                            height: 120 + i * 30,
                        }}
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.2, 0.8, 1],
                        }}
                        transition={{
                            duration: 20 + i * 5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        <div
                            className="w-full h-full rounded-full opacity-20"
                            style={{
                                background: `conic-gradient(from ${i * 45}deg, 
                                    rgba(59, 130, 246, 0.3), 
                                    rgba(139, 92, 246, 0.3), 
                                    rgba(236, 72, 153, 0.3), 
                                    rgba(59, 130, 246, 0.3))`,
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
};

// Morphing Crystal Card
const CrystalCard = ({ children, className = "", delay = 0, morphing = false }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ delay, duration: 0.8, type: "spring" }}
            whileHover={{
                scale: 1.02,
                rotateX: 5,
                rotateY: morphing ? 5 : 0,
                transition: { duration: 0.3 }
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
                "relative group perspective-1000",
                className
            )}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Crystal facets background */}
            <div className="absolute inset-0 rounded-2xl opacity-60">
                <div
                    className="absolute inset-0 rounded-2xl"
                    style={{
                        background: `linear-gradient(135deg, 
                            rgba(255, 255, 255, 0.25) 0%, 
                            rgba(255, 255, 255, 0.1) 25%,
                            rgba(255, 255, 255, 0.05) 50%,
                            rgba(255, 255, 255, 0.15) 75%,
                            rgba(255, 255, 255, 0.2) 100%)`,
                        backdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                />

                {/* Animated crystal facets */}
                <motion.div
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    animate={isHovered ? {
                        background: [
                            'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                            'linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
                            'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))',
                        ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            {/* Crystal edge highlights */}
            <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={isHovered ? {
                    boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                        '0 0 40px rgba(139, 92, 246, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.2)',
                        '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                    ]
                } : {
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

// Holographic Text Component
const HolographicText = ({ children, className = "", animated = true }) => {
    return (
        <motion.div
            className={cn("relative", className)}
            animate={animated ? {
                textShadow: [
                    '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 20px rgba(139, 92, 246, 0.5), 0 0 30px rgba(236, 72, 153, 0.3)',
                    '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
                ]
            } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <span
                className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold"
                style={{
                    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))',
                }}
            >
                {children}
            </span>
        </motion.div>
    );
};

// Liquid Crystal Progress Bar
const LiquidCrystalProgress = ({ value, label, color = "blue" }) => {
    const colors = {
        blue: 'from-blue-400 to-cyan-400',
        purple: 'from-purple-400 to-pink-400',
        green: 'from-green-400 to-emerald-400',
        amber: 'from-amber-400 to-orange-400',
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-white/80 font-medium">{label}</span>
                <span className="text-white font-bold">{value}%</span>
            </div>
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                    className={`h-full bg-gradient-to-r ${colors[color]} relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                >
                    {/* Liquid crystal effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                            x: ['-100%', '200%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

// Prismatic Section Divider
const PrismaticDivider = () => {
    return (
        <div className="relative py-16 flex justify-center">
            <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <div
                    className="w-24 h-24 relative"
                    style={{
                        background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #10b981, #3b82f6)',
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        filter: 'blur(1px)',
                    }}
                />
                <motion.div
                    className="absolute inset-0"
                    animate={{
                        boxShadow: [
                            '0 0 20px rgba(59, 130, 246, 0.5)',
                            '0 0 40px rgba(139, 92, 246, 0.5)',
                            '0 0 20px rgba(236, 72, 153, 0.5)',
                            '0 0 40px rgba(16, 185, 129, 0.5)',
                            '0 0 20px rgba(59, 130, 246, 0.5)',
                        ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            </motion.div>
        </div>
    );
};

export default function GlassmorphismDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: GlassmorphismDesignProps) {
    const { t } = useTranslation();
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#3b82f6';
    const secondaryColor = settings.secondary_color || '#8b5cf6';

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, type: "spring" }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Dynamic Crystal Background */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    background: `
                        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 40%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
                        linear-gradient(135deg, 
                            rgba(15, 23, 42, 0.95) 0%,
                            rgba(30, 41, 59, 0.95) 25%,
                            rgba(51, 65, 85, 0.95) 50%,
                            rgba(30, 41, 59, 0.95) 75%,
                            rgba(15, 23, 42, 0.95) 100%
                        )
                    `,
                }}
            />

            {/* Interactive Glass Orbs */}
            <InteractiveOrbs />

            {/* Hero Section with Holographic Elements */}
            <motion.section
                className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20"
                style={{ opacity }}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Holographic Profile Section */}
                        <motion.div variants={itemVariants} className="text-center lg:text-left space-y-8">

                            {/* Holographic Avatar */}
                            <div className="relative inline-block">
                                <motion.div
                                    className="relative"
                                    animate={{
                                        rotateY: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {/* Holographic rings */}
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                                            style={{
                                                width: `${120 + i * 40}%`,
                                                height: `${120 + i * 40}%`,
                                                left: `${-10 - i * 20}%`,
                                                top: `${-10 - i * 20}%`,
                                            }}
                                            animate={{
                                                rotate: i % 2 === 0 ? 360 : -360,
                                                opacity: [0.3, 0.6, 0.3]
                                            }}
                                            transition={{
                                                duration: 10 + i * 2,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        />
                                    ))}

                                    <div
                                        className="w-48 h-48 lg:w-64 lg:h-64 rounded-full relative overflow-hidden"
                                        style={{
                                            background: `conic-gradient(from 0deg, 
                                                rgba(59, 130, 246, 0.3), 
                                                rgba(139, 92, 246, 0.3), 
                                                rgba(236, 72, 153, 0.3), 
                                                rgba(59, 130, 246, 0.3))`,
                                            backdropFilter: 'blur(20px)',
                                            border: '2px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                    >
                                        {profilePhoto ? (
                                            <img
                                                src={profilePhoto}
                                                alt={`${user.name} - Photo de profil`}
                                                className="w-full h-full object-cover relative z-10"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center relative z-10">
                                                <User className="w-24 h-24 text-white/60" />
                                            </div>
                                        )}

                                        {/* Holographic overlay */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-transparent to-purple-400/20"
                                            animate={{
                                                opacity: [0.2, 0.4, 0.2],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Holographic Name */}
                            <HolographicText className="text-5xl lg:text-7xl font-bold mb-4">
                                {user.name}
                            </HolographicText>

                            {/* Professional Title with Crystal Effect */}
                            <motion.div
                                className="relative inline-block"
                                variants={itemVariants}
                            >
                                <div
                                    className="px-8 py-4 rounded-full text-xl lg:text-2xl font-semibold text-white"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    <Sparkles className="w-6 h-6 inline mr-3 text-yellow-400" />
                                    {cvData?.professional_title || user.full_profession || 'Professionnel'}
                                </div>
                            </motion.div>

                            {/* Holographic Contact Portals */}
                            <motion.div
                                className="flex justify-center lg:justify-start gap-6"
                                variants={itemVariants}
                            >
                                {[
                                    { icon: Mail, href: `mailto:${user.email}`, label: 'Email', color: 'blue' },
                                    { icon: Phone, href: `tel:${user.phone}`, label: 'Phone', color: 'green' },
                                    { icon: Github, href: user.github, label: 'GitHub', color: 'purple' },
                                    { icon: Linkedin, href: user.linkedin, label: 'LinkedIn', color: 'cyan' }
                                ].filter(item => item.href).map((item, index) => (
                                    <motion.a
                                        key={index}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative p-4 rounded-2xl"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                        whileHover={{
                                            scale: 1.1,
                                            rotateY: 15,
                                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)'
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <item.icon className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors duration-300" />

                                        {/* Holographic glow effect */}
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
                                            style={{
                                                background: `linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))`,
                                                filter: 'blur(10px)',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </motion.a>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Crystal Statistics Dashboard */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <CrystalCard className="p-8" morphing>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                                            <Briefcase className="w-8 h-8 text-white" />
                                        </div>
                                        <HolographicText className="text-3xl font-bold">
                                            {cvData?.experiences?.length || 0}
                                        </HolographicText>
                                        <p className="text-white/80 font-medium">Expériences</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                                            <Award className="w-8 h-8 text-white" />
                                        </div>
                                        <HolographicText className="text-3xl font-bold">
                                            {cvData?.competences?.length || 0}
                                        </HolographicText>
                                        <p className="text-white/80 font-medium">Compétences</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                                            <Globe className="w-8 h-8 text-white" />
                                        </div>
                                        <HolographicText className="text-3xl font-bold">
                                            {cvData?.languages?.length || 0}
                                        </HolographicText>
                                        <p className="text-white/80 font-medium">Langues</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center">
                                            <Heart className="w-8 h-8 text-white" />
                                        </div>
                                        <HolographicText className="text-3xl font-bold">
                                            {cvData?.hobbies?.length || 0}
                                        </HolographicText>
                                        <p className="text-white/80 font-medium">Passions</p>
                                    </div>
                                </div>
                            </CrystalCard>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            <PrismaticDivider />

            {/* About Section with Crystal Morphing */}
            {(settings.show_summary && (cvData?.summary || cvData?.summaries?.[0])) && (
                <section className="py-20 px-4 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                        >
                            <CrystalCard className="p-10" morphing>
                                <div className="text-center mb-8">
                                    <HolographicText className="text-4xl font-bold mb-4">
                                        À Propos
                                    </HolographicText>
                                    <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                                </div>
                                <p className="text-white/90 text-lg leading-relaxed text-center">
                                    {safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                                </p>
                            </CrystalCard>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Experiences with Pure Glassmorphism Timeline */}
            {settings.show_experiences && cvData?.experiences?.length > 0 && (
                <section className="py-20 px-4 relative z-10">
                    <div className="max-w-6xl mx-auto relative">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <HolographicText className="text-5xl font-bold mb-6">
                                Mon Parcours Professionnel
                            </HolographicText>

                            {/* Simple elegant divider */}
                            <div
                                className="w-32 h-1 mx-auto rounded-full"
                                style={{
                                    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8))',
                                }}
                            />
                        </motion.div>

                        <div className="relative">
                            {/* Clean Glassmorphism Timeline */}
                            <div
                                className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full rounded-full"
                                style={{
                                    background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6), rgba(236, 72, 153, 0.6))',
                                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                                }}
                            />

                            {cvData.experiences.map((exp: any, index: number) => (
                                <motion.div
                                    key={index}
                                    className={`relative mb-16 ${index % 2 === 0 ? 'pr-1/2' : 'pl-1/2 ml-auto'}`}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    {/* Simple Glassmorphism Timeline Node */}
                                    <motion.div
                                        className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full z-10"
                                        style={{
                                            background: `linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))`,
                                            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                        }}
                                        whileHover={{ scale: 1.2 }}
                                    >
                                        <div className="absolute inset-2 rounded-full bg-white/30 flex items-center justify-center">
                                            <Briefcase className="w-3 h-3 text-white" />
                                        </div>
                                    </motion.div>

                                    {/* Pure Crystal Experience Card */}
                                    <CrystalCard className={`p-8 ${index % 2 === 0 ? 'mr-12' : 'ml-12'}`} morphing>
                                        <div className="flex items-start gap-6">
                                            {/* Clean company icon */}
                                            <div
                                                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)',
                                                }}
                                            >
                                                <Briefcase className="w-8 h-8 text-white" />
                                            </div>

                                            <div className="flex-1">
                                                <HolographicText className="text-2xl font-bold mb-3">
                                                    {exp.name}
                                                </HolographicText>

                                                <p className="text-blue-300 font-semibold text-lg mb-2">
                                                    {exp.InstitutionName}
                                                </p>

                                                <div className="flex items-center gap-3 mb-4">
                                                    <Calendar className="w-5 h-5 text-purple-400" />
                                                    <span className="text-white/80 font-medium">
                                                        {exp.date_start && exp.date_end ?
                                                            `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                                            exp.date_start ?
                                                                `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${t('portfolio.dates.present')}` :
                                                                t('portfolio.dates.periodNotSpecified')
                                                        }
                                                    </span>
                                                </div>


                                                {exp.description && (
                                                    <p className="text-white/90 leading-relaxed mb-4">
                                                        {safeText(exp.description)}
                                                    </p>
                                                )}

                                                {/* Additional Info */}
                                                <div className="space-y-3">
                                                    {exp.output && (
                                                        <div className="flex items-center gap-2 text-sm text-white/70">
                                                            <MapPin className="w-4 h-4 text-green-400" />
                                                            <span>Résultats: {exp.output}</span>
                                                        </div>
                                                    )}

                                                    {exp.category_name && (
                                                        <Badge
                                                            className="bg-white/10 text-blue-300 border-blue-400/30 backdrop-blur-sm"
                                                        >
                                                            {exp.category_name}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* References */}
                                                {exp.references && exp.references.length > 0 && (
                                                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                                        <h4 className="text-sm font-semibold text-white mb-3">{t('portfolio.references.title')}</h4>
                                                        <div className="space-y-2">
                                                            {exp.references.map((ref, refIndex) => (
                                                                <div key={refIndex} className="text-sm text-white/80">
                                                                    <div className="font-medium text-blue-300">{ref.name}</div>
                                                                    {ref.function && <div>Fonction: {ref.function}</div>}
                                                                    {ref.email && <div>Email: {ref.email}</div>}
                                                                    {ref.telephone && <div>Téléphone: {ref.telephone}</div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Attachments */}
                                                {exp.attachment_path && (
                                                    <div className="mt-4">
                                                        <a
                                                            href={exp.attachment_path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            {exp.attachment_name || t('portfolio.attachments.viewDocument')}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CrystalCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <PrismaticDivider />

            {/* Skills with Liquid Crystal Progress */}
            {settings.show_competences && cvData?.competences?.length > 0 && (
                <section className="py-20 px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <HolographicText className="text-5xl font-bold mb-4">
                                Compétences Techniques
                            </HolographicText>
                            <div className="w-32 h-1 mx-auto bg-gradient-to-r from-green-400 to-blue-400 rounded-full" />
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {cvData.competences.map((competence: any, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                >
                                    <CrystalCard className="p-6 h-full" morphing>
                                        <div className="text-center">
                                            <div
                                                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                                style={{
                                                    background: `conic-gradient(from ${index * 45}deg, 
                                                        rgba(59, 130, 246, 0.8), 
                                                        rgba(139, 92, 246, 0.8), 
                                                        rgba(16, 185, 129, 0.8), 
                                                        rgba(59, 130, 246, 0.8))`,
                                                }}
                                            >
                                                <Code className="w-8 h-8 text-white" />
                                            </div>
                                            <HolographicText className="text-xl font-bold mb-4">
                                                {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                            </HolographicText>

                                            {competence.level && (
                                                <LiquidCrystalProgress
                                                    value={competence.level}
                                                    label="Maîtrise"
                                                    color={['blue', 'purple', 'green', 'amber'][index % 4]}
                                                />
                                            )}
                                        </div>
                                    </CrystalCard>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Other sections with crystal styling */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 py-20">
                {/* Languages */}
                {settings.show_languages && cvData?.languages?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <CrystalCard className="p-8 h-full" morphing>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center">
                                    <Globe className="w-8 h-8 text-white" />
                                </div>
                                <HolographicText className="text-2xl font-bold">
                                    {t('portfolio.sections.languages')}
                                </HolographicText>
                            </div>

                            <div className="space-y-4">
                                {cvData.languages.map((lang, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                        <span className="font-medium text-white">{lang.name}</span>
                                        {lang.pivot?.language_level && (
                                            <span className="px-3 py-1 bg-blue-400/20 text-blue-300 rounded-full text-sm font-medium">
                                                {lang.pivot.language_level}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CrystalCard>
                    </motion.div>
                )}

                {/* Hobbies */}
                {settings.show_hobbies && cvData?.hobbies?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <CrystalCard className="p-8 h-full" morphing>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <HolographicText className="text-2xl font-bold">
                                    {t('portfolio.sections.hobbies')}
                                </HolographicText>
                            </div>

                            <div className="space-y-3">
                                {cvData.hobbies.map((hobby, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                        whileHover={{ x: 5 }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-pink-400" />
                                        <span className="text-white/90 font-medium">
                                            {typeof hobby === 'string' ? hobby : hobby.name || hobby.hobby}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </CrystalCard>
                    </motion.div>
                )}

                {/* Contact */}
                {settings.show_contact_info && (cvData?.email || cvData?.phone || cvData?.address) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <CrystalCard className="p-8 h-full" morphing>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center">
                                    <Contact className="w-8 h-8 text-white" />
                                </div>
                                <HolographicText className="text-2xl font-bold">
                                    {t('portfolio.sections.contact')}
                                </HolographicText>
                            </div>

                            <div className="space-y-4">
                                {(cvData?.email || user.email) && (
                                    <motion.a
                                        href={`mailto:${cvData?.email || user.email}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                                        whileHover={{ x: 5 }}
                                    >
                                        <Mail className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-white/90 font-medium">{cvData?.email || user.email}</span>
                                    </motion.a>
                                )}
                                {cvData?.phone && (
                                    <motion.a
                                        href={`tel:${cvData.phone}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                                        whileHover={{ x: 5 }}
                                    >
                                        <Phone className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                                        <span className="text-white/90 font-medium">{cvData.phone}</span>
                                    </motion.a>
                                )}
                                {cvData?.address && (
                                    <motion.div
                                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5"
                                        whileHover={{ x: 5 }}
                                    >
                                        <MapPin className="w-5 h-5 text-purple-400" />
                                        <span className="text-white/90 font-medium">{cvData.address}</span>
                                    </motion.div>
                                )}
                            </div>
                        </CrystalCard>
                    </motion.div>
                )}
            </div>

            {/* Holographic Footer */}
            <footer className="relative z-10 py-12 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <div
                        className="inline-block px-8 py-4 rounded-full"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                    >
                        <HolographicText className="text-lg">
                            ✨ Portfolio Holographique de {user.name} • Généré par Guidy ✨
                        </HolographicText>
                    </div>
                </motion.div>
            </footer>
        </div>
    );
}