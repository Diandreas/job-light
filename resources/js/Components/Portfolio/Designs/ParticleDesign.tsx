import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Sparkles, Star, Circle, FileText, ExternalLink } from 'lucide-react';
import { DesignProps } from './index';

const ParticleDesign: React.FC<DesignProps> = ({ user, cvData, settings, isPreview = false }) => {
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const FloatingParticles = () => {
        if (!mounted) return null;

        return (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Large floating particles */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={`large-${i}`}
                        className="absolute w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        }}
                        animate={{
                            y: [null, -20, 20, -20],
                            x: [null, -30, 30, -30],
                            scale: [1, 1.2, 0.8, 1],
                            opacity: [0.6, 0.8, 0.4, 0.6],
                        }}
                        transition={{
                            duration: 6 + Math.random() * 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random() * 2,
                        }}
                    />
                ))}

                {/* Medium floating particles */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={`medium-${i}`}
                        className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-40"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        }}
                        animate={{
                            y: [null, -40, 40, -40],
                            x: [null, -20, 20, -20],
                            scale: [0.5, 1, 0.5, 1],
                        }}
                        transition={{
                            duration: 8 + Math.random() * 3,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 3,
                        }}
                    />
                ))}

                {/* Small twinkling particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={`small-${i}`}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 4,
                        }}
                    />
                ))}
            </div>
        );
    };

    const ParticleCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                delay,
                type: "spring",
                bounce: 0.4
            }}
            whileHover={{
                scale: 1.02,
                y: -5,
                transition: { duration: 0.3 }
            }}
            className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md
                       border border-white/20 rounded-2xl shadow-2xl overflow-hidden ${className}`}
        >
            {/* Particle trail effect on hover */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />

            {/* Corner sparkles */}
            <div className="absolute top-2 right-2 w-3 h-3">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                >
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                </motion.div>
            </div>

            {children}
        </motion.div>
    );

    const experiences = cvData?.experiences || [];
    const skills = cvData?.competences || [];
    const hobbies = cvData?.hobbies || [];

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-hidden">
            {/* Gradient Background */}
            <motion.div
                className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
                style={{ y, opacity }}
            />

            {/* Animated mesh background */}
            <div className="fixed inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.4) 0%, transparent 50%),
                                     radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.4) 0%, transparent 50%),
                                     radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)`,
                    backgroundSize: '100% 100%',
                    animation: 'mesh-move 20s ease-in-out infinite'
                }} />
            </div>

            <FloatingParticles />

            {/* Content */}
            <div className="relative z-10 p-8 max-w-6xl mx-auto">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center">
                    <ParticleCard className="p-12 text-center max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                        >
                            {cvData?.profile_picture && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        duration: 1.2,
                                        type: "spring",
                                        bounce: 0.6,
                                        delay: 0.3
                                    }}
                                    className="relative mb-8 mx-auto w-32 h-32"
                                >
                                    {/* Rotating rings */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/50"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-2 rounded-full border border-pink-400/50"
                                    />

                                    <img
                                        src={cvData.profile_picture}
                                        alt={user?.name}
                                        className="absolute inset-4 rounded-full object-cover shadow-2xl"
                                    />

                                    {/* Orbiting particles */}
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                                            style={{
                                                top: '50%',
                                                left: '50%',
                                                transformOrigin: '0 0',
                                            }}
                                            animate={{
                                                rotate: 360,
                                                x: 60 * Math.cos((i * 60 * Math.PI) / 180),
                                                y: 60 * Math.sin((i * 60 * Math.PI) / 180),
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "linear",
                                                delay: i * 0.2,
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            <motion.h1
                                className="text-5xl md:text-6xl font-bold text-white mb-4"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                            >
                                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                    {user?.name || 'Nom Utilisateur'}
                                </span>
                            </motion.h1>

                            <motion.p
                                className="text-2xl text-gray-300 mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.8 }}
                            >
                                {cvData?.professional_title || 'Professionnel'}
                            </motion.p>

                            {settings.show_summary && cvData?.summary && (
                                <motion.p
                                    className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                >
                                    {typeof cvData.summary === 'string' ? cvData.summary : cvData.summaries?.[0]?.description}
                                </motion.p>
                            )}
                        </motion.div>
                    </ParticleCard>
                </section>

                {/* Contact Section */}
                <section className="py-20">
                    <ParticleCard className="p-8" delay={0.2}>
                        <motion.h2
                            className="text-3xl font-bold text-white mb-8 text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Contact
                            </span>
                        </motion.h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {cvData?.email && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10"
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(168, 85, 247, 0.1)",
                                        borderColor: "rgba(168, 85, 247, 0.3)"
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Mail className="w-6 h-6 text-purple-400" />
                                    <span className="text-white">{cvData.email}</span>
                                </motion.div>
                            )}
                            {cvData?.phone && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10"
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(236, 72, 153, 0.1)",
                                        borderColor: "rgba(236, 72, 153, 0.3)"
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Phone className="w-6 h-6 text-pink-400" />
                                    <span className="text-white">{cvData.phone}</span>
                                </motion.div>
                            )}
                            {cvData?.address && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 border border-white/10"
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                        borderColor: "rgba(59, 130, 246, 0.3)"
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <MapPin className="w-6 h-6 text-blue-400" />
                                    <span className="text-white">{cvData.address}</span>
                                </motion.div>
                            )}
                        </div>
                    </ParticleCard>
                </section>

                {/* Experiences Section */}
                {settings.show_experiences && experiences.length > 0 && (
                    <section className="py-20">
                        <ParticleCard className="p-8" delay={0.4}>
                            <motion.h2
                                className="text-3xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                    Expériences
                                </span>
                            </motion.h2>
                            <div className="space-y-8">
                                {experiences.map((exp: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                        whileHover={{
                                            scale: 1.02,
                                            x: 10,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="relative p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/20"
                                    >
                                        {/* Timeline dot */}
                                        <motion.div
                                            className="absolute -left-2 top-6 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white"
                                            whileHover={{ scale: 1.3 }}
                                        />

                                        <div className="ml-8">
                                            <h3 className="text-xl font-semibold text-white mb-2">{exp.name}</h3>
                                            <p className="text-purple-300 mb-2">{exp.InstitutionName}</p>
                                            <p className="text-gray-400 mb-4 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {exp.date_start} - {exp.date_end || 'Présent'}
                                            </p>
                                            {exp.description && (
                                                <p className="text-gray-300 leading-relaxed">{exp.description}</p>
                                            )}
                                            {exp.attachment_path && (
                                                <div className="mt-4">
                                                    <a
                                                        href={exp.attachment_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-lg text-sm text-purple-300 transition-all duration-300"
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
                        </ParticleCard>
                    </section>
                )}

                {/* Skills Section */}
                {settings.show_competences && skills.length > 0 && (
                    <section className="py-20">
                        <ParticleCard className="p-8" delay={0.6}>
                            <motion.h2
                                className="text-3xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Compétences
                                </span>
                            </motion.h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {skills.map((skill: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.6,
                                            type: "spring",
                                            bounce: 0.4
                                        }}
                                        whileHover={{
                                            scale: 1.1,
                                            rotateY: 10,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 text-center relative overflow-hidden"
                                    >
                                        {/* Skill sparkle effect */}
                                        <motion.div
                                            className="absolute top-1 right-1"
                                            animate={{
                                                rotate: [0, 180, 360],
                                                scale: [1, 1.2, 1],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: index * 0.1,
                                            }}
                                        >
                                            <Star className="w-3 h-3 text-yellow-400" />
                                        </motion.div>

                                        <div className="flex items-center justify-center mb-2">
                                            <span className="text-white font-medium">{skill.name}</span>
                                        </div>
                                        {skill.level && (
                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    className="h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.level}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{
                                                        duration: 1.5,
                                                        delay: index * 0.05,
                                                        ease: "easeOut"
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </ParticleCard>
                    </section>
                )}

                {/* Hobbies Section */}
                {settings.show_hobbies && hobbies.length > 0 && (
                    <section className="py-20">
                        <ParticleCard className="p-8" delay={0.8}>
                            <motion.h2
                                className="text-3xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                                    Centres d'Intérêt
                                </span>
                            </motion.h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hobbies.map((hobby: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30, rotateX: -30 }}
                                        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.6,
                                            type: "spring"
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotateX: 5,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="p-6 rounded-xl bg-white/5 border border-white/10 text-center relative"
                                    >
                                        {/* Floating circle decoration */}
                                        <motion.div
                                            className="absolute top-2 left-2"
                                            animate={{
                                                y: [-5, 5, -5],
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: index * 0.2,
                                            }}
                                        >
                                            <Circle className="w-4 h-4 text-pink-400 fill-current" />
                                        </motion.div>

                                        <h3 className="text-lg font-semibold text-white mb-2">{hobby.name}</h3>
                                        {hobby.description && (
                                            <p className="text-gray-400">{hobby.description}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </ParticleCard>
                    </section>
                )}
            </div>

            <style>{`
                @keyframes mesh-move {
                    0%, 100% {
                        transform: translate(0%, 0%) rotate(0deg);
                    }
                    33% {
                        transform: translate(30%, -30%) rotate(120deg);
                    }
                    66% {
                        transform: translate(-20%, 20%) rotate(240deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default ParticleDesign;