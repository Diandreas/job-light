import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useAnimation, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, Briefcase, Award, Heart, FileText, Contact,
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar, Sparkles, Zap, Target, Cpu,
    Wifi, Smartphone, Monitor, Server, Database,
    Code, Binary, Activity, TrendingUp, BarChart3,
    Play, Pause, Volume2, VolumeX, Settings,
    ChevronRight, ArrowUpRight, Layers, Box
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface DynamicTechDesignProps {
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
        : '34, 197, 94';
};

// Utility function to safely extract text from objects
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

// Interactive circuit board background
const CircuitBoard = () => {
    const [nodes, setNodes] = useState<Array<{ x: number; y: number; id: number }>>([]);

    useEffect(() => {
        const generateNodes = () => {
            const newNodes = [];
            for (let i = 0; i < 20; i++) {
                newNodes.push({
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    id: i
                });
            }
            setNodes(newNodes);
        };
        generateNodes();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                </defs>

                {/* Circuit connections */}
                {nodes.map((node, index) =>
                    nodes.slice(index + 1).map((targetNode, targetIndex) => {
                        const distance = Math.sqrt(
                            Math.pow(node.x - targetNode.x, 2) + Math.pow(node.y - targetNode.y, 2)
                        );
                        if (distance < 30) {
                            return (
                                <motion.line
                                    key={`${node.id}-${targetNode.id}`}
                                    x1={node.x}
                                    y1={node.y}
                                    x2={targetNode.x}
                                    y2={targetNode.y}
                                    stroke="url(#circuit-gradient)"
                                    strokeWidth="0.1"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{
                                        duration: 2,
                                        delay: (index + targetIndex) * 0.1,
                                        repeat: Infinity,
                                        repeatType: "reverse"
                                    }}
                                />
                            );
                        }
                        return null;
                    })
                )}

                {/* Circuit nodes */}
                {nodes.map((node) => (
                    <motion.circle
                        key={node.id}
                        cx={node.x}
                        cy={node.y}
                        r="0.3"
                        fill="url(#circuit-gradient)"
                        animate={{
                            r: [0.3, 0.6, 0.3],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 2,
                            delay: node.id * 0.1,
                            repeat: Infinity
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};

// Interactive tech card with hover effects
const TechCard = ({
    children,
    className = "",
    glowColor = "#22c55e",
    interactive = true,
    delay = 0,
    ...props
}: any) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
                delay,
                duration: 0.8,
                type: "spring",
                stiffness: 100
            }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={interactive ? handleMouseMove : undefined}
            whileHover={interactive ? {
                y: -10,
                rotateX: 5,
                rotateY: 5,
                transition: { duration: 0.3 }
            } : {}}
            className={cn(
                "relative group bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50",
                "hover:border-green-400/50 transition-all duration-500 overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Dynamic glow effect */}
            {isHovered && interactive && (
                <motion.div
                    className="absolute pointer-events-none rounded-full"
                    style={{
                        left: mousePosition.x - 100,
                        top: mousePosition.y - 100,
                        width: 200,
                        height: 200,
                        background: `radial-gradient(circle, ${glowColor}20 0%, transparent 70%)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}

            {/* Scanning line effect */}
            <motion.div
                className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent"
                animate={isHovered ? {
                    y: [0, 300, 0],
                    opacity: [0, 1, 0]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10 text-white">
                {children}
            </div>

            {/* Corner accents */}
            <div className="absolute top-2 right-2 w-4 h-4">
                <div className="w-full h-0.5 bg-green-400"></div>
                <div className="w-0.5 h-full bg-green-400 absolute top-0 right-0"></div>
            </div>
            <div className="absolute bottom-2 left-2 w-4 h-4">
                <div className="w-full h-0.5 bg-green-400 absolute bottom-0"></div>
                <div className="w-0.5 h-full bg-green-400"></div>
            </div>
        </motion.div>
    );
};

// Animated progress bar with tech styling
const TechProgressBar = ({
    value,
    label,
    color = "#22c55e",
    delay = 0
}: {
    value: number;
    label: string;
    color?: string;
    delay?: number;
}) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-mono">{label}</span>
                <span className="text-green-400 font-mono">{value}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <motion.div
                    className="h-full rounded-full relative"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${value}%` }}
                    transition={{ delay: delay + 0.5, duration: 1.5 }}
                    viewport={{ once: true }}
                >
                    {/* Animated glow */}
                    <motion.div
                        className="absolute top-0 right-0 w-4 h-full bg-white rounded-full opacity-60"
                        animate={{ x: [-20, 0, -20] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

// Real-time stats display
const LiveStats = () => {
    const [stats, setStats] = useState({
        cpu: 45,
        memory: 67,
        network: 23,
        uptime: '24h 17m'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => ({
                cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
                memory: Math.max(20, Math.min(80, prev.memory + (Math.random() - 0.5) * 5)),
                network: Math.max(5, Math.min(50, prev.network + (Math.random() - 0.5) * 15)),
                uptime: prev.uptime // Keep static for demo
            }));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <TechCard className="p-6" glowColor="#06b6d4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                {/* @ts-ignore */}
                <h3 className="text-lg font-bold font-mono">{t('portfolio.designs.tech.systemStatus')}</h3>
            </div>
            <div className="space-y-4">
                <TechProgressBar value={stats.cpu} label="CPU_USAGE" color="#22c55e" />
                <TechProgressBar value={stats.memory} label="MEMORY" color="#06b6d4" />
                <TechProgressBar value={stats.network} label="NETWORK" color="#8b5cf6" />
                <div className="flex justify-between text-sm font-mono">
                    <span className="text-gray-300">UPTIME:</span>
                    <span className="text-green-400">{stats.uptime}</span>
                </div>
            </div>
        </TechCard>
    );
};

// 3D rotating cube
const TechCube = ({ icon: Icon, label, color }: { icon: any; label: string; color: string }) => {
    return (
        <motion.div
            className="relative w-24 h-24 mx-auto perspective-1000"
            whileHover={{ scale: 1.1 }}
            animate={{ rotateY: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
            <div
                className="w-full h-full rounded-lg flex items-center justify-center transform-gpu preserve-3d"
                style={{ backgroundColor: color }}
            >
                <Icon className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-mono whitespace-nowrap">
                {label}
            </div>
        </motion.div>
    );
};

export default function DynamicTechDesign({
    user,
    cvData,
    settings,
    isPreview = false
}: DynamicTechDesignProps) {
    const { t } = useTranslation();
    const { scrollY } = useScroll();
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume, setVolume] = useState(true);

    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#22c55e';
    const secondaryColor = settings.secondary_color || '#06b6d4';

    // Parallax effects
    const backgroundY = useTransform(scrollY, [0, 1000], [0, -300]);
    const heroY = useTransform(scrollY, [0, 500], [0, -150]);

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
        hidden: { opacity: 0, y: 30, scale: 0.8 },
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
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Circuit board background */}
            <CircuitBoard />

            {/* Dynamic matrix rain effect */}
            <div className="fixed inset-0 pointer-events-none opacity-10">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-px bg-gradient-to-b from-green-400 via-green-400 to-transparent"
                        style={{
                            left: `${Math.random() * 100}%`,
                            height: `${Math.random() * 300 + 100}px`
                        }}
                        animate={{
                            y: ['-100%', '100vh'],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* Control Panel */}
            <motion.div
                className="fixed top-4 right-4 z-50 flex gap-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
            >
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVolume(!volume)}
                    className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                >
                    {volume ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
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
                            {/* Profile & Info */}
                            <motion.div variants={itemVariants} className="text-center lg:text-left">
                                {/* Holographic profile frame */}
                                <motion.div
                                    className="relative w-72 h-72 mx-auto lg:mx-0 mb-12"
                                    whileHover={{ scale: 1.05, rotateY: 15 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {/* Holographic border */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 p-1">
                                        <div className="w-full h-full bg-gray-900 rounded-2xl p-4">
                                            {profilePhoto ? (
                                                <img
                                                    src={profilePhoto}
                                                    alt={user.name}
                                                    className="w-full h-full rounded-xl object-cover filter contrast-125"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                                                    <User className="w-32 h-32 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Scanning overlay */}
                                    <motion.div
                                        className="absolute inset-4 border-2 border-green-400 rounded-xl"
                                        animate={{
                                            borderColor: ['#22c55e', '#06b6d4', '#8b5cf6', '#22c55e']
                                        }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />

                                    {/* Corner brackets */}
                                    {[
                                        { top: '0.5rem', left: '0.5rem', rotate: '0deg' },
                                        { top: '0.5rem', right: '0.5rem', rotate: '90deg' },
                                        { bottom: '0.5rem', right: '0.5rem', rotate: '180deg' },
                                        { bottom: '0.5rem', left: '0.5rem', rotate: '270deg' }
                                    ].map((pos, index) => (
                                        <motion.div
                                            key={index}
                                            className="absolute w-6 h-6"
                                            style={pos}
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                        >
                                            <div className="w-4 h-1 bg-green-400"></div>
                                            <div className="w-1 h-4 bg-green-400"></div>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Terminal-style name display */}
                                <motion.div
                                    className="bg-black/80 rounded-lg p-4 mb-6 font-mono text-left border border-green-400/30"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="text-green-400 text-sm mb-2">
                                        {'>'} USER_PROFILE.load()
                                    </div>
                                    <div className="text-white text-2xl lg:text-4xl font-bold mb-2">
                                        {user.name}
                                    </div>
                                    <div className="text-blue-400">
                                        {'>'} ROLE: {cvData?.professional_title || user.full_profession || 'Tech Professional'}
                                    </div>
                                    <div className="text-green-400 text-sm mt-2">
                                        STATUS: ONLINE • AVAILABLE • SECURE
                                    </div>
                                </motion.div>

                                {/* Tech stack indicators */}
                                <motion.div
                                    className="grid grid-cols-4 gap-4 mb-8"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <TechCube icon={Code} label="DEV" color="#22c55e" />
                                    <TechCube icon={Database} label="DATA" color="#06b6d4" />
                                    <TechCube icon={Server} label="CLOUD" color="#8b5cf6" />
                                    <TechCube icon={Cpu} label="AI/ML" color="#f59e0b" />
                                </motion.div>

                                {/* Connection links */}
                                <motion.div
                                    className="flex justify-center lg:justify-start gap-4"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    {[
                                        { icon: Mail, href: `mailto:${user.email}`, label: 'EMAIL_PROTOCOL' },
                                        { icon: Phone, href: `tel:${user.phone}`, label: 'VOICE_CHANNEL' },
                                        { icon: Linkedin, href: user.linkedin, label: 'LINKEDIN_API' },
                                        { icon: Github, href: user.github, label: 'GIT_REPO' }
                                    ].filter(item => item.href).map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative"
                                            whileHover={{ scale: 1.1, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <TechCard className="p-4" interactive={false}>
                                                <item.icon className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                                <div className="text-xs font-mono text-gray-400 whitespace-nowrap">
                                                    {item.label}
                                                </div>
                                            </TechCard>
                                        </motion.a>
                                    ))}
                                </motion.div>
                            </motion.div>

                            {/* System Dashboard */}
                            <motion.div variants={itemVariants} className="space-y-6">
                                {/* Live stats */}
                                <LiveStats />

                                {/* Data visualization */}
                                <TechCard className="p-6" glowColor="#8b5cf6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <BarChart3 className="w-6 h-6 text-purple-400" />
                                        <h3 className="text-lg font-bold font-mono">{t('portfolio.designs.tech.performanceMetrics')}</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-green-400 font-mono">
                                                {cvData?.experiences?.length || 0}+
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono">PROJECTS</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-blue-400 font-mono">
                                                {cvData?.skills?.length || 0}+
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono">SKILLS</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-purple-400 font-mono">
                                                99.9%
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono">UPTIME</div>
                                        </div>
                                    </div>
                                </TechCard>

                                {/* Network status */}
                                <TechCard className="p-6" glowColor="#f59e0b">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Wifi className="w-6 h-6 text-orange-400" />
                                        <h3 className="text-lg font-bold font-mono">{t('portfolio.designs.tech.networkStatus')}</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-mono text-gray-300">CONNECTION:</span>
                                            <span className="text-green-400 font-mono">SECURE</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-mono text-gray-300">LATENCY:</span>
                                            <span className="text-blue-400 font-mono">12ms</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-mono text-gray-300">BANDWIDTH:</span>
                                            <span className="text-purple-400 font-mono">1Gbps</span>
                                        </div>
                                    </div>
                                </TechCard>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>

                {/* About Section */}
                {(settings.show_summary && (cvData?.summary || cvData?.summaries?.[0])) && (
                    <section className="py-24 px-4 bg-gray-800/50">
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <TechCard className="p-8" glowColor="#22c55e">
                                    <div className="flex items-center gap-3 mb-6">
                                        <FileText className="w-8 h-8 text-green-400" />
                                        <h2 className="text-3xl font-bold font-mono">README.md</h2>
                                    </div>
                                    <div className="bg-black/50 rounded-lg p-6 font-mono">
                                        <div className="text-green-400 text-sm mb-4">
                                            # About Me
                                        </div>
                                        <div className="text-blue-400 text-sm mb-2">
                                            ```markdown
                                        </div>
                                        <p className="text-gray-300 leading-relaxed pl-4 border-l-2 border-green-400">
                                            {safeText(cvData?.summary || cvData?.summaries?.[0])}
                                        </p>
                                        <div className="text-blue-400 text-sm mt-2">
                                            ```
                                        </div>
                                    </div>
                                </TechCard>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* Experience Timeline */}
                {(settings.show_experiences && cvData?.experiences?.length > 0) && (
                    <section className="py-24 px-4">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-12 font-mono flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Activity className="w-10 h-10 text-green-400" />
                                {t('portfolio.designs.tech.experienceLog')}
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
                                        <TechCard
                                            className="p-6"
                                            glowColor={['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b'][index % 4]}
                                            delay={index * 0.05}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-blue-400 flex items-center justify-center flex-shrink-0">
                                                    <Binary className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-green-400 font-mono text-sm">
                                                            {'{'}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-white font-mono">
                                                            "{exp.name}"
                                                        </h3>
                                                    </div>
                                                    <div className="pl-4 space-y-1">
                                                        <div className="text-blue-400 font-mono">
                                                            "company": "{exp.InstitutionName}",
                                                        </div>
                                                        <div className="text-purple-400 font-mono text-sm">
                                                            "period": "{exp.date_start && exp.date_end ? `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} → ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` : exp.date_start ? `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} → CURRENT` : 'UNDEFINED'}",
                                                        </div>
                                                        <div className="text-gray-300 font-mono">
                                                            "description": "{safeText(exp.description)}"
                                                        </div>

                                                        {/* Informations supplémentaires */}
                                                        {exp.output && (
                                                            <div className="text-cyan-400 font-mono text-sm">
                                                                "output": "{exp.output}",
                                                            </div>
                                                        )}

                                                        {exp.category_name && (
                                                            <div className="text-yellow-400 font-mono text-sm">
                                                                "category": "{exp.category_name}",
                                                            </div>
                                                        )}

                                                        {/* Références */}
                                                        {exp.references && exp.references.length > 0 && (
                                                            <div className="text-pink-400 font-mono text-sm">
                                                                "references": [
                                                                {exp.references.map((ref, refIndex) => (
                                                                    <div key={refIndex} className="pl-4 text-xs">
                                                                        {'{'}"{ref.name}"{ref.function && `, "role": "${ref.function}"`}{ref.email && `, "email": "${ref.email}"`}{ref.telephone && `, "phone": "${ref.telephone}"`}{'}'}
                                                                        {refIndex < exp.references.length - 1 && ','}
                                                                    </div>
                                                                ))}
                                                                ]
                                                            </div>
                                                        )}

                                                        {/* Pièces jointes */}
                                                        {exp.attachment_path && (
                                                            <div className="text-green-400 font-mono text-sm">
                                                                "attachment": "{exp.attachment_name || 'document.pdf'}"
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-green-400 font-mono text-sm">
                                                        {'}'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TechCard>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Skills Matrix */}
                {(settings.show_competences && cvData?.competences?.length > 0) && (
                    <section className="py-24 px-4 bg-gray-800/50">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-12 font-mono flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Layers className="w-10 h-10 text-blue-400" />
                                {t('portfolio.designs.tech.skillMatrix')}
                            </motion.h2>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cvData.competences.map((competence: any, index: number) => {
                                    const colors = ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];
                                    const color = colors[index % colors.length];

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 50, rotateX: -90 }}
                                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.6 }}
                                            viewport={{ once: true }}
                                        >
                                            <TechCard
                                                className="p-6"
                                                glowColor={color}
                                                delay={index * 0.02}
                                            >
                                                <div className="text-center">
                                                    <div
                                                        className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        <Code className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white font-mono mb-3">
                                                        {typeof competence === 'string' ? competence : competence.name || competence.skill}
                                                    </h3>
                                                    {competence.level && (
                                                        <TechProgressBar
                                                            value={competence.level}
                                                            label="PROFICIENCY"
                                                            color={color}
                                                            delay={index * 0.05}
                                                        />
                                                    )}
                                                    <div className="text-xs text-gray-400 font-mono mt-2">
                                                        STATUS: LOADED ✓
                                                    </div>
                                                </div>
                                            </TechCard>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Interests Cloud */}
                {(settings.show_hobbies && cvData?.hobbies?.length > 0) && (
                    <section className="py-24 px-4">
                        <div className="max-w-6xl mx-auto">
                            <motion.h2
                                className="text-4xl font-bold text-center mb-12 font-mono flex items-center justify-center gap-3"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <Box className="w-10 h-10 text-purple-400" />
                                {t('portfolio.designs.tech.interestCloud')}
                            </motion.h2>

                            <div className="flex flex-wrap justify-center gap-4">
                                {cvData.hobbies.map((hobby: any, index: number) => {
                                    const colors = ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];
                                    const color = colors[index % colors.length];

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.5 }}
                                            viewport={{ once: true }}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            <div
                                                className="px-6 py-3 rounded-lg font-mono text-white border-2 border-transparent hover:border-opacity-50 transition-all duration-300"
                                                style={{
                                                    backgroundColor: color,
                                                    borderColor: color
                                                }}
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

                {/* Contact Terminal */}
                {settings.show_contact_info && (
                    <section className="py-24 px-4 bg-black/80">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <TechCard className="p-8" glowColor="#22c55e">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Contact className="w-8 h-8 text-green-400" />
                                        <h2 className="text-3xl font-bold font-mono">{t('portfolio.designs.tech.contactInterface')}</h2>
                                    </div>

                                    <div className="bg-black rounded-lg p-6 font-mono mb-6">
                                        <div className="text-green-400 mb-2">$ ./initialize_contact.sh</div>
                                        <div className="text-blue-400 mb-2">Scanning for available communication channels...</div>
                                        <div className="text-yellow-400 mb-2">Establishing secure connection...</div>
                                        <div className="text-green-400">Ready to receive transmission.</div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        {user.email && (
                                            <Button
                                                size="lg"
                                                asChild
                                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-mono border-0"
                                            >
                                                <a href={`mailto:${user.email}`}>
                                                    <Mail className="w-5 h-5 mr-2" />
                                                    EMAIL_PROTOCOL.send()
                                                </a>
                                            </Button>
                                        )}
                                        {user.phone && (
                                            <Button
                                                size="lg"
                                                variant="outline"
                                                asChild
                                                className="border-green-400 text-green-400 hover:bg-green-400/10 font-mono"
                                            >
                                                <a href={`tel:${user.phone}`}>
                                                    <Phone className="w-5 h-5 mr-2" />
                                                    VOICE_CHANNEL.connect()
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </TechCard>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* Tech Footer */}
                <footer className="relative py-16 bg-black border-t border-green-400/30">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto px-4 text-center"
                    >
                        <TechCard className="p-8" glowColor="#22c55e">
                            <div className="space-y-4">
                                <div className="font-mono text-green-400 text-lg">
                                    ⚡ DYNAMIC_TECH_PORTFOLIO.sys • USER_ID: {user.name} • FRAMEWORK: Guidy ⚡
                                </div>
                                <div className="bg-black/50 rounded p-4 font-mono text-sm">
                                    <div className="text-blue-400 mb-1">$ cat system_info.log</div>
                                    <div className="text-gray-300">
                                        © {new Date().getFullYear()} • STATUS: ONLINE • PERFORMANCE: OPTIMAL
                                    </div>
                                    <div className="text-green-400">POWERED_BY: Guidy.framework()</div>
                                </div>
                            </div>
                        </TechCard>
                    </motion.div>
                </footer>
            </motion.div>
        </div>
    );
}
