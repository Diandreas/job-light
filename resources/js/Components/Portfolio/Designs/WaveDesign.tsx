import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Waves, ArrowDown, FileText, ExternalLink } from 'lucide-react';
import { DesignProps } from './index';

const WaveDesign: React.FC<DesignProps> = ({ user, cvData, settings, isPreview = false }) => {
    const [scrollY, setScrollY] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const waveOffset = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -50]);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const WaveBackground = () => (
        <div className="absolute inset-0 overflow-hidden">
            {/* Wave Layer 1 - Slowest */}
            <motion.svg
                className="absolute bottom-0 w-full h-32 opacity-30"
                style={{ y: parallaxY }}
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z"
                    fill="rgba(59, 130, 246, 0.3)"
                    animate={{
                        d: [
                            "M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z",
                            "M0,80 C300,40 600,100 900,40 C1050,20 1200,80 1200,40 L1200,120 L0,120 Z",
                            "M0,60 C300,100 600,20 900,60 C1050,80 1200,40 1200,60 L1200,120 L0,120 Z"
                        ]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.svg>

            {/* Wave Layer 2 - Medium */}
            <motion.svg
                className="absolute bottom-0 w-full h-28 opacity-40"
                style={{ y: useTransform(scrollYProgress, [0, 1], [0, -30]) }}
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1200,40 L1200,120 L0,120 Z"
                    fill="rgba(168, 85, 247, 0.4)"
                    animate={{
                        d: [
                            "M0,40 C240,80 480,0 720,40 C960,80 1200,0 1200,40 L1200,120 L0,120 Z",
                            "M0,20 C240,60 480,40 720,80 C960,20 1200,60 1200,80 L1200,120 L0,120 Z",
                            "M0,40 C240,80 480,0 720,40 C960,80 1200,0 1200,40 L1200,120 L0,120 Z"
                        ]
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.svg>

            {/* Wave Layer 3 - Fastest */}
            <motion.svg
                className="absolute bottom-0 w-full h-24 opacity-50"
                style={{ y: useTransform(scrollYProgress, [0, 1], [0, -20]) }}
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M0,80 C400,40 800,120 1200,80 L1200,120 L0,120 Z"
                    fill="rgba(236, 72, 153, 0.5)"
                    animate={{
                        d: [
                            "M0,80 C400,40 800,120 1200,80 L1200,120 L0,120 Z",
                            "M0,100 C400,60 800,40 1200,100 L1200,120 L0,120 Z",
                            "M0,80 C400,40 800,120 1200,80 L1200,120 L0,120 Z"
                        ]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </motion.svg>
        </div>
    );

    const FloatingBubbles = () => (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-t from-blue-400/20 to-purple-400/20 border border-white/10"
                    style={{
                        width: Math.random() * 60 + 20,
                        height: Math.random() * 60 + 20,
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 40 - 20, 0],
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );

    const WaveCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 0.8,
                delay,
                type: "spring",
                bounce: 0.3
            }}
            whileHover={{
                scale: 1.02,
                y: -10,
                rotateX: -5,
                transition: { duration: 0.4 }
            }}
            className={`relative backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5
                       border border-white/20 rounded-3xl shadow-2xl overflow-hidden ${className}`}
        >
            {/* Liquid border effect */}
            <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)',
                }}
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Inner wave decoration */}
            <div className="absolute top-0 left-0 w-full h-16 overflow-hidden rounded-t-3xl">
                <motion.svg
                    className="absolute -top-2 w-full h-20 opacity-20"
                    viewBox="0 0 400 40"
                    preserveAspectRatio="none"
                >
                    <motion.path
                        d="M0,20 C100,35 200,5 300,20 C350,30 400,15 400,20 L400,40 L0,40 Z"
                        fill="rgba(255, 255, 255, 0.2)"
                        animate={{
                            d: [
                                "M0,20 C100,35 200,5 300,20 C350,30 400,15 400,20 L400,40 L0,40 Z",
                                "M0,15 C100,5 200,35 300,15 C350,5 400,30 400,15 L400,40 L0,40 Z",
                                "M0,20 C100,35 200,5 300,20 C350,30 400,15 400,20 L400,40 L0,40 Z"
                            ]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.svg>
            </div>

            {children}
        </motion.div>
    );

    const experiences = cvData?.experiences || [];
    const skills = cvData?.competences || [];
    const hobbies = cvData?.hobbies || [];

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-hidden">
            {/* Ocean Gradient Background */}
            <motion.div
                className="fixed inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900"
                style={{ y: parallaxY }}
            />

            {/* Underwater light rays */}
            <div className="fixed inset-0 opacity-30">
                {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-gradient-to-b from-cyan-400/20 via-blue-400/10 to-transparent"
                        style={{
                            left: `${i * 20 + 10}%`,
                            width: '8%',
                            height: '100%',
                            transform: 'skewX(-10deg)',
                        }}
                        animate={{
                            opacity: [0.2, 0.4, 0.2],
                            scaleY: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <WaveBackground />
            <FloatingBubbles />

            {/* Content */}
            <div className="relative z-10 p-8 max-w-6xl mx-auto">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center">
                    <WaveCard className="p-12 text-center max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2 }}
                        >
                            {cvData?.profile_picture && (
                                <motion.div
                                    initial={{ scale: 0, y: 100 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{
                                        duration: 1.5,
                                        type: "spring",
                                        bounce: 0.5,
                                        delay: 0.5
                                    }}
                                    className="relative mb-8 mx-auto w-40 h-40"
                                >
                                    {/* Ripple effect */}
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                                            animate={{
                                                scale: [1, 1.5, 2],
                                                opacity: [0.6, 0.3, 0],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: i * 1,
                                                ease: "easeOut",
                                            }}
                                        />
                                    ))}

                                    <img
                                        src={cvData.profile_picture}
                                        alt={user?.name}
                                        className="relative z-10 w-full h-full rounded-full object-cover border-4 border-white/30 shadow-2xl"
                                    />

                                    {/* Floating water drops */}
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-3 h-3 bg-gradient-to-b from-cyan-300 to-blue-500 rounded-full"
                                            style={{
                                                top: `${Math.random() * 100}%`,
                                                left: `${Math.random() * 100}%`,
                                            }}
                                            animate={{
                                                y: [0, -40, 0],
                                                opacity: [0, 1, 0],
                                                scale: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: 2 + Math.random() * 2,
                                                repeat: Infinity,
                                                delay: Math.random() * 2,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            <motion.h1
                                className="text-5xl md:text-6xl font-bold text-white mb-6"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.8 }}
                            >
                                <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                                    {user?.name || 'Nom Utilisateur'}
                                </span>
                            </motion.h1>

                            <motion.p
                                className="text-2xl text-blue-200 mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3, duration: 0.8 }}
                            >
                                {cvData?.professional_title || 'Professionnel'}
                            </motion.p>

                            {settings.show_summary && cvData?.summary && (
                                <motion.p
                                    className="text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.6, duration: 0.8 }}
                                >
                                    {typeof cvData.summary === 'string' ? cvData.summary : cvData.summaries?.[0]?.description}
                                </motion.p>
                            )}

                            {/* Scroll indicator */}
                            <motion.div
                                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                                animate={{
                                    y: [0, 10, 0],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <ArrowDown className="w-8 h-8 text-cyan-300" />
                            </motion.div>
                        </motion.div>
                    </WaveCard>
                </section>

                {/* Contact Section */}
                <section className="py-20">
                    <WaveCard className="p-8" delay={0.2}>
                        <motion.h2
                            className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <Waves className="w-8 h-8 mr-3 text-cyan-400" />
                            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                                Contact
                            </span>
                        </motion.h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {cvData?.email && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                        y: -5,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Mail className="w-6 h-6 text-cyan-400" />
                                    <span className="text-white">{cvData.email}</span>
                                </motion.div>
                            )}
                            {cvData?.phone && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(168, 85, 247, 0.1)",
                                        y: -5,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Phone className="w-6 h-6 text-purple-400" />
                                    <span className="text-white">{cvData.phone}</span>
                                </motion.div>
                            )}
                            {cvData?.address && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                                    whileHover={{
                                        scale: 1.05,
                                        backgroundColor: "rgba(236, 72, 153, 0.1)",
                                        y: -5,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <MapPin className="w-6 h-6 text-pink-400" />
                                    <span className="text-white">{cvData.address}</span>
                                </motion.div>
                            )}
                        </div>
                    </WaveCard>
                </section>

                {/* Experiences Section */}
                {settings.show_experiences && experiences.length > 0 && (
                    <section className="py-20">
                        <WaveCard className="p-8" delay={0.4}>
                            <motion.h2
                                className="text-3xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
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
                                            x: 20,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="relative p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/20 backdrop-blur-sm"
                                    >
                                        {/* Wave indicator */}
                                        <motion.div
                                            className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.7, 1, 0.7],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: index * 0.3,
                                            }}
                                        />

                                        <div className="ml-8">
                                            <h3 className="text-xl font-semibold text-white mb-2">{exp.name}</h3>
                                            <p className="text-cyan-300 mb-2">{exp.InstitutionName}</p>
                                            <p className="text-blue-200 mb-4 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {exp.date_start} - {exp.date_end || 'Présent'}
                                            </p>
                                            {exp.description && (
                                                <p className="text-blue-100 leading-relaxed">{exp.description}</p>
                                            )}
                                            {exp.attachment_path && (
                                                <div className="mt-4">
                                                    <a
                                                        href={exp.attachment_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-cyan-400/20 border border-white/20 rounded-2xl text-sm text-cyan-300 backdrop-blur-sm transition-all duration-300"
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
                        </WaveCard>
                    </section>
                )}

                {/* Skills Section */}
                {settings.show_competences && skills.length > 0 && (
                    <section className="py-20">
                        <WaveCard className="p-8" delay={0.6}>
                            <motion.h2
                                className="text-3xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                                    Compétences
                                </span>
                            </motion.h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {skills.map((skill: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8, y: 30 }}
                                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.6,
                                            type: "spring",
                                            bounce: 0.4
                                        }}
                                        whileHover={{
                                            scale: 1.1,
                                            y: -10,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm relative overflow-hidden"
                                    >
                                        {/* Bubble effect */}
                                        <motion.div
                                            className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 rounded-full"
                                            animate={{
                                                y: [0, -20, 0],
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: index * 0.1,
                                            }}
                                        />

                                        <div className="flex items-center justify-center mb-2">
                                            <span className="text-white font-medium">{skill.name}</span>
                                        </div>
                                        {skill.level && (
                                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full"
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
                        </WaveCard>
                    </section>
                )}

                {/* Hobbies Section */}
                {settings.show_hobbies && hobbies.length > 0 && (
                    <section className="py-20">
                        <WaveCard className="p-8" delay={0.8}>
                            <motion.h2
                                className="text-3xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-pink-300 to-orange-300 bg-clip-text text-transparent">
                                    Centres d'Intérêt
                                </span>
                            </motion.h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hobbies.map((hobby: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30, rotateY: -30 }}
                                        whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.6,
                                            type: "spring"
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotateY: 10,
                                            transition: { duration: 0.3 }
                                        }}
                                        className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center backdrop-blur-sm relative"
                                    >
                                        {/* Water drop decoration */}
                                        <motion.div
                                            className="absolute top-3 left-3 w-3 h-4 bg-gradient-to-b from-cyan-300 to-blue-500 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.6, 1, 0.6],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: index * 0.2,
                                            }}
                                        />

                                        <h3 className="text-lg font-semibold text-white mb-2">{hobby.name}</h3>
                                        {hobby.description && (
                                            <p className="text-blue-200">{hobby.description}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </WaveCard>
                    </section>
                )}
            </div>
        </div>
    );
};

export default WaveDesign;