import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar, Sparkles, Zap, Target, Palette,
    Camera, Brush, Layers, Image, Play, Pause,
    Volume2, VolumeX, MousePointer, Move3D
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface ArtisticShowcaseDesignProps {
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
        : '245, 101, 101';
};

// Utility function to safely extract text from objects
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

// Interactive brush stroke component
const BrushStroke = ({
    delay = 0,
    duration = 2,
    className = "",
    color = "#f56565"
}: {
    delay?: number;
    duration?: number;
    className?: string;
    color?: string;
}) => {
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, []);

    return (
        <svg
            className={cn("absolute inset-0 pointer-events-none", className)}
            viewBox="0 0 200 200"
            fill="none"
        >
            <motion.path
                ref={pathRef}
                d="M20,50 Q100,20 180,50 Q150,100 120,150 Q80,180 40,150 Q10,100 20,50"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={pathLength}
                strokeDashoffset={pathLength}
                animate={{
                    strokeDashoffset: 0
                }}
                transition={{
                    delay,
                    duration,
                    ease: "easeInOut"
                }}
                opacity={0.6}
            />
        </svg>
    );
};

// Masonry layout component
const MasonryGrid = ({ children, columns = 3 }: { children: React.ReactNode; columns?: number }) => {
    return (
        <div
            className="grid gap-6"
            style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gridAutoRows: 'masonry'
            }}
        >
            {children}
        </div>
    );
};

// Artistic card with paint-like effects
const ArtisticCard = ({
    children,
    className = "",
    paintColor = "#f56565",
    delay = 0,
    height = "auto",
    ...props
}: any) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotate: -5 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{
                delay,
                duration: 0.8,
                type: "spring",
                stiffness: 100
            }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{
                y: -10,
                rotate: Math.random() * 4 - 2,
                transition: { duration: 0.3 }
            }}
            className={cn(
                "relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-transparent",
                "hover:border-orange-200 transition-all duration-500",
                className
            )}
            style={{ height }}
            {...props}
        >
            {/* Paint splash background */}
            <motion.div
                className="absolute top-0 right-0 w-32 h-32 opacity-10"
                animate={isHovered ? { scale: 1.2, rotate: 180 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.5 }}
            >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="20" r="15" fill={paintColor} />
                    <ellipse cx="60" cy="40" rx="20" ry="15" fill={paintColor} />
                    <circle cx="30" cy="60" r="10" fill={paintColor} />
                    <ellipse cx="70" cy="75" rx="15" ry="10" fill={paintColor} />
                </svg>
            </motion.div>

            {/* Brush stroke overlay */}
            {isHovered && (
                <BrushStroke
                    color={paintColor}
                    delay={0}
                    duration={1}
                    className="opacity-20"
                />
            )}

            {/* Content */}
            <div className="relative z-10 p-6">
                {children}
            </div>

            {/* Corner paint drip */}
            <div
                className="absolute bottom-0 left-0 w-8 h-16 opacity-30"
                style={{
                    background: `linear-gradient(to bottom, transparent, ${paintColor})`
                }}
            />
        </motion.div>
    );
};

// Creative parallax section
const ParallaxSection = ({
    children,
    className = "",
    speed = 0.5,
    ...props
}: any) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [0, -100 * speed]);

    return (
        <motion.div
            ref={ref}
            style={{ y }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
};

// Creative floating elements
const FloatingArtElements = () => {
    const elements = [
        { icon: Palette, color: "#f56565", size: "w-8 h-8" },
        { icon: Brush, color: "#48bb78", size: "w-6 h-6" },
        { icon: Camera, color: "#4299e1", size: "w-7 h-7" },
        { icon: Sparkles, color: "#ed8936", size: "w-5 h-5" },
        { icon: Heart, color: "#e53e3e", size: "w-6 h-6" },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {elements.map((element, index) => (
                <motion.div
                    key={index}
                    className="absolute"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        x: [0, 50, -50, 0],
                        y: [0, -50, 50, 0],
                        rotate: [0, 180, 360, 0],
                        scale: [1, 1.2, 0.8, 1],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "easeInOut"
                    }}
                >
                    <div
                        className={`${element.size} rounded-full flex items-center justify-center opacity-20`}
                        style={{ backgroundColor: element.color }}
                    >
                        <element.icon className="w-4 h-4 text-white" />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default function ArtisticShowcaseDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: ArtisticShowcaseDesignProps) {
    const { t } = useTranslation();
    const { scrollY } = useScroll();
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#f56565';
    const secondaryColor = settings.secondary_color || '#48bb78';

    // Mouse tracking for interactive elements
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Parallax effects
    const backgroundY = useTransform(scrollY, [0, 1000], [0, -200]);
    const heroY = useTransform(scrollY, [0, 500], [0, -100]);

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
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 relative overflow-hidden">
            {/* Custom cursor */}
            <motion.div
                className="fixed w-8 h-8 rounded-full border-2 border-orange-400 pointer-events-none z-50 mix-blend-difference"
                animate={{
                    x: cursorPosition.x - 16,
                    y: cursorPosition.y - 16,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 28
                }}
            />

            {/* Floating artistic elements */}
            <FloatingArtElements />

            {/* Artistic background pattern */}
            <motion.div
                className="fixed inset-0 opacity-30"
                style={{ y: backgroundY }}
            >
                <svg className="w-full h-full" viewBox="0 0 1000 1000">
                    <defs>
                        <radialGradient id="paint-splash" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.1" />
                        </radialGradient>
                    </defs>
                    <circle cx="200" cy="200" r="100" fill="url(#paint-splash)" />
                    <circle cx="800" cy="300" r="150" fill="url(#paint-splash)" />
                    <circle cx="500" cy="700" r="120" fill="url(#paint-splash)" />
                    <circle cx="100" cy="600" r="80" fill="url(#paint-splash)" />
                    <circle cx="900" cy="800" r="200" fill="url(#paint-splash)" />
                </svg>
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
                    className="min-h-[60vh] md:min-h-[80vh] flex items-center px-2 md:px-4 py-6 md:py-12"
                    style={{ y: heroY }}
                >
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="grid lg:grid-cols-2 gap-4 md:gap-8 items-center">
                            {/* Artistic Profile */}
                            <motion.div variants={itemVariants} className="text-center lg:text-left relative">
                                {/* Artistic frame for profile */}
                                <motion.div
                                    className="relative w-48 h-48 md:w-64 md:h-64 mx-auto lg:mx-0 mb-4 md:mb-8"
                                    whileHover={{ rotate: 3, scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {/* Artistic border */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 rounded-[2rem] transform rotate-3"></div>
                                    <div className="absolute inset-2 bg-white rounded-[1.5rem] transform -rotate-2"></div>
                                    <div className="absolute inset-4 bg-gradient-to-br from-orange-100 to-pink-100 rounded-[1rem]"></div>

                                    {/* Profile image */}
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt={user.name}
                                            className="absolute inset-3 md:inset-4 w-40 h-40 md:w-56 md:h-56 rounded-[0.75rem] object-cover filter saturate-110 contrast-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-3 md:inset-4 w-40 h-40 md:w-56 md:h-56 rounded-[0.75rem] bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center">
                                            <User className="w-16 h-16 md:w-24 md:h-24 text-white" />
                                        </div>
                                    )}

                                    {/* Paint splatters */}
                                    <motion.div
                                        className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full opacity-80"
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="absolute -bottom-6 -left-6 w-8 h-8 bg-pink-400 rounded-full opacity-80"
                                        animate={{ scale: [1, 0.8, 1], y: [0, -10, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                                    />
                                    <motion.div
                                        className="absolute top-1/2 -right-8 w-6 h-6 bg-blue-400 rounded-full opacity-80"
                                        animate={{ x: [0, 10, 0], rotate: [0, 90, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                                    />
                                </motion.div>

                                {/* Artistic name with paint effect */}
                                <motion.div
                                    className="relative mb-6"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                >
                                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 relative">
                                        {user.name}
                                    </h1>
                                </motion.div>

                                {/* Artistic title */}
                                <motion.p
                                    className="text-base md:text-lg lg:text-xl text-gray-700 mb-3 md:mb-6 font-light relative"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.8 }}
                                >
                                    {cvData?.professional_title || user.full_profession || t('portfolio.designs.artistic.subtitle')}
                                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full"></span>
                                </motion.p>

                                {/* Creative tagline */}
                                {settings.tagline && (
                                    <motion.p
                                        className="text-sm md:text-base text-gray-600 mb-3 md:mb-6 max-w-lg mx-auto lg:mx-0 italic"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7, duration: 0.8 }}
                                    >
                                        "{settings.tagline}"
                                    </motion.p>
                                )}

                                {/* Artistic contact buttons */}
                                <motion.div
                                    className="flex justify-center lg:justify-start gap-2 md:gap-3 mb-3 md:mb-6"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.8 }}
                                >
                                    {[
                                        { icon: Mail, href: `mailto:${user.email}`, color: '#f56565', label: 'Email' },
                                        { icon: Phone, href: `tel:${user.phone}`, color: '#48bb78', label: 'Phone' },
                                        { icon: Linkedin, href: user.linkedin, color: '#4299e1', label: 'LinkedIn' },
                                        { icon: Github, href: user.github, color: '#805ad5', label: 'GitHub' }
                                    ].filter(item => item.href).map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative"
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: Math.random() * 10 - 5
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div
                                                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-all duration-300 shadow-lg"
                                                style={{ backgroundColor: item.color }}
                                            >
                                                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                            </div>
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {item.label}
                                            </div>
                                        </motion.a>
                                    ))}
                                </motion.div>
                            </motion.div>

                            {/* Creative showcase cards */}
                            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 md:gap-4">
                                <ArtisticCard
                                    paintColor="#f56565"
                                    delay={0.3}
                                    height="100px"
                                    className="col-span-2"
                                >
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl flex items-center justify-center transform -rotate-12">
                                            <Briefcase className="w-4 h-4 md:w-6 md:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900">
                                                {cvData?.experiences?.length || 0}+ Projets
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-600">{t('portfolio.designs.artistic.projectsCompleted')}</p>
                                        </div>
                                    </div>
                                </ArtisticCard>

                                <ArtisticCard
                                    paintColor="#48bb78"
                                    delay={0.4}
                                    height="120px"
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-3 transform rotate-12">
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {cvData?.skills?.length || 0}
                                        </h3>
                                        <p className="text-gray-600">{t('portfolio.designs.artistic.skillsMastered')}</p>
                                    </div>
                                </ArtisticCard>

                                <ArtisticCard
                                    paintColor="#4299e1"
                                    delay={0.5}
                                    height="120px"
                                >
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-3 transform -rotate-12">
                                            <Heart className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {cvData?.hobbies?.length || 0}
                                        </h3>
                                        <p className="text-gray-600">{t('portfolio.designs.artistic.artisticPassions')}</p>
                                    </div>
                                </ArtisticCard>

                                <ArtisticCard
                                    paintColor="#ed8936"
                                    delay={0.6}
                                    height="80px"
                                    className="col-span-2"
                                >
                                    <div className="flex items-center justify-center gap-2 md:gap-4">
                                        <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-orange-500" />
                                        <h3 className="text-sm md:text-lg font-bold text-gray-900">
                                            {t('portfolio.designs.artistic.creativePortfolio')}
                                        </h3>
                                        <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-orange-500" />
                                    </div>
                                </ArtisticCard>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* About Section with Artistic Layout */}
                {(settings.show_summary && (cvData?.summary || cvData?.summaries?.[0])) && (
                    <ParallaxSection speed={0.3} className="py-8 md:py-16 px-2 md:px-4">
                        <div className="max-w-5xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <ArtisticCard paintColor="#805ad5" className="p-4 md:p-8 text-center">
                                    <p className="text-sm md:text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
                                        {safeText(cvData?.summary || cvData?.summaries?.[0])}
                                    </p>
                                </ArtisticCard>
                            </motion.div>
                        </div>
                    </ParallaxSection>
                )}

                {/* Experience Gallery */}
                {(settings.show_experiences && cvData?.experiences?.length > 0) && (
                    <section className="py-8 md:py-16 px-2 md:px-4 bg-gradient-to-r from-orange-100 to-pink-100">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12 text-gray-900 relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                Expériences
                            </motion.h2>

                            <div className="columns-1 md:columns-2 lg:columns-3 gap-2 md:gap-4 space-y-2 md:space-y-4">
                                {cvData.experiences.map((exp: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 50 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.8 }}
                                        viewport={{ once: true }}
                                        className="break-inside-avoid"
                                    >
                                        <ArtisticCard
                                            paintColor={['#f56565', '#48bb78', '#4299e1', '#ed8936', '#805ad5'][index % 5]}
                                            delay={index * 0.05}
                                            className="mb-2 md:mb-4"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center transform rotate-12 flex-shrink-0"
                                                    style={{
                                                        backgroundColor: ['#f56565', '#48bb78', '#4299e1', '#ed8936', '#805ad5'][index % 5]
                                                    }}
                                                >
                                                    <Briefcase className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                        {exp.name}
                                                    </h3>
                                                    <p className="text-gray-700 font-semibold mb-1 text-sm">
                                                        {exp.InstitutionName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {exp.date_start && exp.date_end ?
                                                            `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                                            exp.date_start ?
                                                                `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - Présent` :
                                                                'Période non spécifiée'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            {exp.description && (
                                                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                                    {safeText(exp.description)}
                                                </p>
                                            )}

                                            {/* Informations détaillées */}
                                            <div className="space-y-2 mb-3">
                                                {exp.output && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>Résultats: {exp.output}</span>
                                                    </div>
                                                )}

                                                {exp.category_name && (
                                                    <div className="mb-3">
                                                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                                                            {exp.category_name}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Références */}
                                            {exp.references && exp.references.length > 0 && (
                                                <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                                    <h4 className="text-sm font-medium text-purple-700 mb-2">Références :</h4>
                                                    <div className="space-y-2">
                                                        {exp.references.map((ref, refIndex) => (
                                                            <div key={refIndex} className="text-xs text-gray-600">
                                                                <div className="font-medium text-purple-700">{ref.name}</div>
                                                                {ref.function && <div>Fonction: {ref.function}</div>}
                                                                {ref.email && <div>Email: {ref.email}</div>}
                                                                {ref.telephone && <div>Tél: {ref.telephone}</div>}
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
                                                        className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm text-purple-700 transition-all duration-300"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        {exp.attachment_name || 'Voir le document'}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </ArtisticCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Skills Palette */}
                {(settings.show_competences && cvData?.competences?.length > 0) && (
                    <ParallaxSection speed={0.4} className="py-8 md:py-16 px-2 md:px-4">
                        <div className="max-w-5xl mx-auto">
                            <motion.h2
                                className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-12 text-gray-900 relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                Compétences
                            </motion.h2>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {cvData.competences.map((competence: any, index: number) => {
                                    const colors = ['#f56565', '#48bb78', '#4299e1', '#ed8936', '#805ad5', '#ec4899'];
                                    const color = colors[index % colors.length];

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 50, rotate: -10 }}
                                            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.8 }}
                                            viewport={{ once: true }}
                                        >
                                            <ArtisticCard
                                                paintColor={color}
                                                delay={index * 0.05}
                                                className="h-full"
                                            >
                                                <div className="text-center">
                                                    <div
                                                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transform -rotate-12"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        <Brush className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                        {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                                    </h3>
                                                    {competence.level && (
                                                        <div className="space-y-2">
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                Maîtrise: {competence.level}%
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                                <motion.div
                                                                    className="h-full rounded-full"
                                                                    style={{ backgroundColor: color }}
                                                                    initial={{ width: 0 }}
                                                                    whileInView={{ width: `${competence.level}%` }}
                                                                    transition={{ delay: index * 0.1 + 0.5, duration: 1.5 }}
                                                                    viewport={{ once: true }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </ArtisticCard>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </ParallaxSection>
                )}

                {/* Hobbies Collage */}
                {(settings.show_hobbies && cvData?.hobbies?.length > 0) && (
                    <section className="py-8 md:py-24 px-2 md:px-4 bg-gradient-to-r from-purple-100 to-pink-100">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-xl md:text-5xl font-bold text-center mb-6 md:mb-16 text-gray-900 relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                Loisirs
                            </motion.h2>

                            <div className="flex flex-wrap justify-center gap-2 md:gap-6">
                                {cvData.hobbies.map((hobby: any, index: number) => {
                                    const colors = ['#f56565', '#48bb78', '#4299e1', '#ed8936', '#805ad5', '#ec4899'];
                                    const color = colors[index % colors.length];

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0, rotate: Math.random() * 360 }}
                                            whileInView={{ opacity: 1, scale: 1, rotate: Math.random() * 20 - 10 }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            viewport={{ once: true }}
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: Math.random() * 40 - 20,
                                                zIndex: 10
                                            }}
                                        >
                                            <div
                                                className="px-3 py-2 md:px-6 md:py-4 rounded-2xl font-bold text-white shadow-lg transform transition-all duration-300 text-sm md:text-base"
                                                style={{ backgroundColor: color }}
                                            >
                                                {safeText(hobby.name || hobby)}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Contact Canvas */}
                {settings.show_contact_info && (
                    <section className="py-8 md:py-24 px-2 md:px-4 bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
                        <div className="max-w-4xl mx-auto text-center relative z-10">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-2xl md:text-5xl font-bold mb-4 md:mb-8 relative">
                                    Contact
                                </h2>
                                <p className="text-sm md:text-xl text-purple-200 mb-6 md:mb-12 max-w-2xl mx-auto">
                                    Collaborons ensemble
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center">
                                    {user.email && (
                                        <Button
                                            size="sm"
                                            asChild
                                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-4 py-2 md:px-8 md:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            <a href={`mailto:${user.email}`}>
                                                <Mail className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                                <span className="text-sm md:text-base">Email</span>
                                            </a>
                                        </Button>
                                    )}
                                    {user.phone && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                            className="border-2 border-white text-white hover:bg-white hover:text-purple-900 font-bold px-4 py-2 md:px-8 md:py-4 rounded-full transition-all duration-300"
                                        >
                                            <a href={`tel:${user.phone}`}>
                                                <Phone className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                                <span className="text-sm md:text-base">Téléphone</span>
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Artistic background elements */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 1000 1000">
                                <circle cx="100" cy="100" r="50" fill="#f56565" />
                                <circle cx="900" cy="200" r="80" fill="#48bb78" />
                                <circle cx="200" cy="800" r="60" fill="#4299e1" />
                                <circle cx="800" cy="900" r="100" fill="#ed8936" />
                                <circle cx="500" cy="500" r="40" fill="#805ad5" />
                            </svg>
                        </div>
                    </section>
                )}

                {/* Artistic Footer */}
                <footer className="relative py-6 md:py-16 bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 1000 400">
                            <circle cx="100" cy="100" r="30" fill="#f56565" />
                            <circle cx="900" cy="300" r="50" fill="#48bb78" />
                            <circle cx="500" cy="200" r="40" fill="#4299e1" />
                            <circle cx="750" cy="100" r="35" fill="#ed8936" />
                        </svg>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="relative z-10 max-w-4xl mx-auto px-2 md:px-4 text-center"
                    >
                        <ArtisticCard paintColor="#805ad5" className="p-4 md:p-8">
                            <motion.div
                                className="space-y-2 md:space-y-4"
                            >
                                <h3 className="text-lg md:text-3xl font-bold text-white mb-2 md:mb-4">
                                    Portfolio {user.name}
                                </h3>
                                <p className="text-purple-200 text-sm md:text-lg font-medium">
                                    Créé avec <span className="text-yellow-300 font-bold">Guidy</span>
                                </p>
                                <div className="text-xs md:text-sm text-purple-300">
                                    © {new Date().getFullYear()}
                                </div>
                            </motion.div>
                        </ArtisticCard>
                    </motion.div>
                </footer>
            </motion.div>
        </div>
    );
}
