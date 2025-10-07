import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Globe, ChevronDown, Star, FileText, ExternalLink } from 'lucide-react';
import { DesignProps } from './index';

const GlassDesign: React.FC<DesignProps> = ({ user, cvData, settings, isPreview = false }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [currentSection, setCurrentSection] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const glassOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.1, 0.2, 0.15, 0.1]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const FloatingParticles = () => {
        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                        }}
                        animate={{
                            y: [null, -100, window.innerHeight + 100],
                            x: [null, Math.random() * window.innerWidth],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>
        );
    };

    const GlassCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, type: "spring", bounce: 0.3 }}
            whileHover={{
                scale: 1.02,
                rotateY: 5,
                transition: { duration: 0.3 }
            }}
            className={`glass-card backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5
                       border border-white/20 rounded-3xl shadow-2xl ${className}`}
            style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}
        >
            {children}
        </motion.div>
    );

    const experiences = cvData?.experiences || [];
    const skills = cvData?.competences || [];
    const hobbies = cvData?.hobbies || [];

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <motion.div
                className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
                style={{ y: backgroundY }}
            />

            {/* Dynamic Glass Overlay */}
            <motion.div
                className="fixed inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"
                style={{
                    opacity: glassOpacity,
                    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%,
                                rgba(255,255,255,0.2) 0%, transparent 50%)`
                }}
            />

            <FloatingParticles />

            {/* Content */}
            <div className="relative z-10 p-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center">
                    <GlassCard className="p-12 text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                            className="relative"
                        >
                            {cvData?.profile_picture && (
                                <div className="relative mb-8">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 p-1"
                                    />
                                    <img
                                        src={cvData.profile_picture}
                                        alt={user?.name}
                                        className="w-32 h-32 rounded-full object-cover mx-auto relative z-10 border-4 border-white/30"
                                    />
                                </div>
                            )}

                            <motion.h1
                                className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                {user?.name || 'Nom Utilisateur'}
                            </motion.h1>

                            <motion.p
                                className="text-2xl text-white/80 mb-8 font-light"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                {cvData?.professional_title || 'Professionnel'}
                            </motion.p>

                            {settings.show_summary && cvData?.summary && (
                                <motion.p
                                    className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                >
                                    {typeof cvData.summary === 'string' ? cvData.summary : cvData.summaries?.[0]?.description}
                                </motion.p>
                            )}
                        </motion.div>
                    </GlassCard>

                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    >
                        <ChevronDown className="w-8 h-8 text-white/60" />
                    </motion.div>
                </section>

                {/* Contact Section */}
                <section className="py-20">
                    <GlassCard className="p-8" delay={0.2}>
                        <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                            Contact
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {cvData?.email && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                >
                                    <Mail className="w-6 h-6 text-cyan-400" />
                                    <span className="text-white">{cvData.email}</span>
                                </motion.div>
                            )}
                            {cvData?.phone && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                >
                                    <Phone className="w-6 h-6 text-purple-400" />
                                    <span className="text-white">{cvData.phone}</span>
                                </motion.div>
                            )}
                            {cvData?.address && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                                >
                                    <MapPin className="w-6 h-6 text-pink-400" />
                                    <span className="text-white">{cvData.address}</span>
                                </motion.div>
                            )}
                        </div>
                    </GlassCard>
                </section>

                {/* Experiences Section */}
                {settings.show_experiences && experiences.length > 0 && (
                    <section className="py-20">
                        <GlassCard className="p-8" delay={0.4}>
                            <h2 className="text-3xl font-bold text-white mb-12 text-center bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                Expériences Professionnelles
                            </h2>
                            <div className="space-y-8">
                                {experiences.map((exp: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/20"
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
                                        }}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 rounded-full" />
                                        <div className="ml-6">
                                            <h3 className="text-xl font-semibold text-white mb-2">{exp.name}</h3>
                                            <p className="text-cyan-300 mb-2 flex items-center">
                                                <Globe className="w-4 h-4 mr-2" />
                                                {exp.InstitutionName}
                                            </p>
                                            <p className="text-white/60 mb-4 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {exp.date_start} - {exp.date_end || 'Présent'}
                                            </p>
                                            {exp.description && (
                                                <p className="text-white/80 leading-relaxed">{exp.description}</p>
                                            )}
                                            {exp.attachment_path && (
                                                <div className="mt-4">
                                                    <a
                                                        href={exp.attachment_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm text-cyan-300 transition-all duration-300"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        {exp.attachment_name || 'Voir le document'}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </section>
                )}

                {/* Skills Section */}
                {settings.show_competences && skills.length > 0 && (
                    <section className="py-20">
                        <GlassCard className="p-8" delay={0.6}>
                            <h2 className="text-3xl font-bold text-white mb-12 text-center bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                Compétences
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {skills.map((skill: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{
                                            scale: 1.1,
                                            rotateY: 10,
                                            backgroundColor: "rgba(255,255,255,0.15)"
                                        }}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm"
                                    >
                                        <div className="flex items-center justify-center mb-2">
                                            <Star className="w-5 h-5 text-yellow-400 mr-2" />
                                            <span className="text-white font-medium">{skill.name}</span>
                                        </div>
                                        {skill.level && (
                                            <div className="w-full bg-white/10 rounded-full h-2">
                                                <motion.div
                                                    className="h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.level}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1, delay: index * 0.05 }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </section>
                )}

                {/* Hobbies Section */}
                {settings.show_hobbies && hobbies.length > 0 && (
                    <section className="py-20">
                        <GlassCard className="p-8" delay={0.8}>
                            <h2 className="text-3xl font-bold text-white mb-12 text-center bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                                Centres d'Intérêt
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hobbies.map((hobby: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotateX: 5,
                                            backgroundColor: "rgba(255,255,255,0.1)"
                                        }}
                                        className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm"
                                    >
                                        <h3 className="text-lg font-semibold text-white mb-2">{hobby.name}</h3>
                                        {hobby.description && (
                                            <p className="text-white/70">{hobby.description}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </GlassCard>
                    </section>
                )}
            </div>

            {/* Ambient Light Effect */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    className="absolute inset-0 bg-gradient-radial from-cyan-500/20 via-transparent to-transparent"
                    style={{
                        transform: `translate(${mousePosition.x / 5}px, ${mousePosition.y / 5}px)`,
                    }}
                />
            </div>

            <style>{`
                .glass-card {
                    box-shadow:
                        0 8px 32px rgba(31, 38, 135, 0.37),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        inset 0 -1px 0 rgba(255, 255, 255, 0.05);
                }

                .bg-gradient-radial {
                    background: radial-gradient(circle, var(--tw-gradient-stops));
                }
            `}</style>
        </div>
    );
};

export default GlassDesign;