import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Zap, Maximize2, Minimize2 } from 'lucide-react';
import { DesignProps } from './index';

const MorphingDesign: React.FC<DesignProps> = ({ user, cvData, settings, isPreview = false }) => {
    const [activeSection, setActiveSection] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const morphProgress = useTransform(scrollYProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 1, 2, 3, 4, 5]);
    const backgroundMorph = useTransform(scrollYProgress, [0, 1], [0, 360]);

    useEffect(() => {
        const unsubscribe = morphProgress.onChange(value => {
            setActiveSection(Math.floor(value));
        });
        return () => unsubscribe();
    }, [morphProgress]);

    const MorphingShape = ({ variant = 'circle', className = '', children }: { variant?: string; className?: string; children?: React.ReactNode }) => {
        const shapes = {
            circle: "50%",
            square: "0%",
            diamond: "50% 0% 50% 0%",
            star: "50% 0% 61% 35% 98% 35% 68% 57% 79% 91% 50% 70% 21% 91% 32% 57% 2% 35% 39% 35%",
            hexagon: "30% 0% 70% 0% 100% 50% 70% 100% 30% 100% 0% 50%",
        };

        return (
            <motion.div
                className={`relative overflow-hidden ${className}`}
                animate={{
                    borderRadius: Object.values(shapes),
                    rotate: [0, 90, 180, 270, 360],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {children}
            </motion.div>
        );
    };

    const FluidBackground = () => (
        <motion.div
            className="fixed inset-0"
            style={{
                background: `conic-gradient(from ${backgroundMorph}deg,
                    #1e40af, #7c3aed, #db2777, #dc2626, #ea580c, #d97706, #1e40af)`,
            }}
        >
            {/* Morphing blob overlays */}
            {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute"
                    style={{
                        width: '40%',
                        height: '40%',
                        left: `${i * 30 + 10}%`,
                        top: `${i * 25 + 15}%`,
                        background: `radial-gradient(circle,
                            rgba(${i * 80 + 100}, ${i * 50 + 200}, 255, 0.3) 0%,
                            transparent 70%)`,
                    }}
                    animate={{
                        borderRadius: [
                            "60% 40% 30% 70%/60% 30% 70% 40%",
                            "30% 60% 70% 40%/50% 60% 30% 60%",
                            "50% 40% 60% 30%/70% 50% 40% 30%",
                            "60% 40% 30% 70%/60% 30% 70% 40%"
                        ],
                        scale: [1, 1.1, 0.9, 1],
                        x: [0, 50, -30, 0],
                        y: [0, -40, 30, 0],
                    }}
                    transition={{
                        duration: 8 + i * 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 1.5,
                    }}
                />
            ))}
        </motion.div>
    );

    const MorphingCard = ({ children, className = '', delay = 0, shapeVariant = 'circle' }: {
        children: React.ReactNode;
        className?: string;
        delay?: number;
        shapeVariant?: string;
    }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{
                duration: 1,
                delay,
                type: "spring",
                bounce: 0.4
            }}
            whileHover={{
                scale: 1.05,
                rotateY: 15,
                rotateX: 5,
            }}
            className={`relative backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5
                       border border-white/30 shadow-2xl overflow-hidden ${className}`}
            style={{
                borderRadius: "20px",
            }}
        >
            {/* Morphing border effect */}
            <motion.div
                className="absolute inset-0 border-4 border-transparent"
                style={{
                    background: "linear-gradient(45deg, #ff006e, #3a86ff, #06ffa5, #ffbe0b) border-box",
                    WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "exclude",
                }}
                animate={{
                    borderRadius: [
                        "20px",
                        "50% 20% 20% 50%",
                        "20% 50% 50% 20%",
                        "50px",
                        "20px"
                    ],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Inner morphing decoration */}
            <motion.div
                className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-pink-400 to-blue-400"
                animate={{
                    borderRadius: [
                        "50%",
                        "20% 50% 50% 20%",
                        "50% 20% 20% 50%",
                        "0%",
                        "50%"
                    ],
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.2, 0.8, 1.1, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {children}
        </motion.div>
    );

    const experiences = cvData?.experiences || [];
    const skills = cvData?.skills || [];
    const hobbies = cvData?.hobbies || [];

    return (
        <div ref={containerRef} className="min-h-screen relative overflow-hidden">
            <FluidBackground />

            {/* Morphing geometric elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute opacity-20"
                        style={{
                            width: `${50 + i * 20}px`,
                            height: `${50 + i * 20}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: `linear-gradient(45deg,
                                hsl(${i * 60}, 70%, 60%),
                                hsl(${i * 60 + 120}, 70%, 60%))`,
                        }}
                        animate={{
                            borderRadius: [
                                "50%",
                                "0%",
                                "50% 0% 50% 0%",
                                "25%",
                                "50%"
                            ],
                            rotate: [0, 180, 360],
                            scale: [1, 1.5, 0.5, 1.2, 1],
                            x: [0, 100, -50, 0],
                            y: [0, -80, 60, 0],
                        }}
                        transition={{
                            duration: 8 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.8,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 max-w-6xl mx-auto">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center">
                    <MorphingCard className="p-12 text-center max-w-4xl" shapeVariant="circle">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2 }}
                        >
                            {cvData?.profile_picture && (
                                <motion.div
                                    className="relative mb-8 mx-auto w-48 h-48"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        duration: 1.5,
                                        type: "spring",
                                        bounce: 0.6,
                                        delay: 0.5
                                    }}
                                >
                                    <MorphingShape variant="circle" className="w-full h-full">
                                        <img
                                            src={cvData.profile_picture}
                                            alt={user?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </MorphingShape>

                                    {/* Orbiting morphing shapes */}
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-6 h-6 bg-gradient-to-r from-yellow-400 to-red-500"
                                            style={{
                                                top: '50%',
                                                left: '50%',
                                                transformOrigin: `0 ${80 + i * 10}px`,
                                            }}
                                            animate={{
                                                rotate: 360,
                                                borderRadius: [
                                                    "50%",
                                                    "0%",
                                                    "50% 0% 50% 0%",
                                                    "50%"
                                                ],
                                            }}
                                            transition={{
                                                rotate: {
                                                    duration: 6 + i,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                },
                                                borderRadius: {
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: i * 0.5,
                                                }
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            <motion.h1
                                className="text-6xl md:text-7xl font-bold text-white mb-6"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 1 }}
                            >
                                <motion.span
                                    className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
                                    animate={{
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    style={{
                                        backgroundSize: "200% 200%",
                                    }}
                                >
                                    {user?.name || 'Nom Utilisateur'}
                                </motion.span>
                            </motion.h1>

                            <motion.p
                                className="text-3xl text-gray-200 mb-8"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.3, duration: 0.8 }}
                            >
                                {cvData?.professional_title || 'Professionnel'}
                            </motion.p>

                            {settings.show_summary && cvData?.summary && (
                                <motion.p
                                    className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.6, duration: 0.8 }}
                                >
                                    {typeof cvData.summary === 'string' ? cvData.summary : cvData.summaries?.[0]?.description}
                                </motion.p>
                            )}

                            {/* Interactive morphing button */}
                            <motion.button
                                className="mt-8 px-8 py-4 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-full"
                                whileHover={{
                                    scale: 1.1,
                                    borderRadius: "20px",
                                    background: "linear-gradient(45deg, #ff006e, #3a86ff)",
                                }}
                                whileTap={{
                                    scale: 0.95,
                                    borderRadius: "50%",
                                }}
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                <span className="flex items-center">
                                    {isExpanded ? <Minimize2 className="w-5 h-5 mr-2" /> : <Maximize2 className="w-5 h-5 mr-2" />}
                                    {isExpanded ? 'Réduire' : 'Explorer'}
                                </span>
                            </motion.button>
                        </motion.div>
                    </MorphingCard>
                </section>

                {/* Contact Section */}
                <section className="py-20">
                    <MorphingCard className="p-8" delay={0.2}>
                        <motion.h2
                            className="text-4xl font-bold text-white mb-8 text-center"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <motion.span
                                className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                style={{
                                    backgroundSize: "200% 200%",
                                }}
                            >
                                Contact
                            </motion.span>
                        </motion.h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {cvData?.email && (
                                <motion.div
                                    className="flex items-center space-x-3 p-6 rounded-2xl bg-white/5 border border-white/10"
                                    whileHover={{
                                        scale: 1.05,
                                        borderRadius: "30px",
                                        backgroundColor: "rgba(168, 85, 247, 0.1)",
                                        rotateY: 5,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Mail className="w-6 h-6 text-purple-400" />
                                    </motion.div>
                                    <span className="text-white">{cvData.email}</span>
                                </motion.div>
                            )}
                            {cvData?.phone && (
                                <motion.div
                                    className="flex items-center space-x-3 p-6 rounded-2xl bg-white/5 border border-white/10"
                                    whileHover={{
                                        scale: 1.05,
                                        borderRadius: "30px",
                                        backgroundColor: "rgba(236, 72, 153, 0.1)",
                                        rotateY: 5,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <Phone className="w-6 h-6 text-pink-400" />
                                    </motion.div>
                                    <span className="text-white">{cvData.phone}</span>
                                </motion.div>
                            )}
                            {cvData?.address && (
                                <motion.div
                                    className="flex items-center space-x-3 p-6 rounded-2xl bg-white/5 border border-white/10"
                                    whileHover={{
                                        scale: 1.05,
                                        borderRadius: "30px",
                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                        rotateY: 5,
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <MapPin className="w-6 h-6 text-blue-400" />
                                    </motion.div>
                                    <span className="text-white">{cvData.address}</span>
                                </motion.div>
                            )}
                        </div>
                    </MorphingCard>
                </section>

                {/* Experiences Section */}
                {settings.show_experiences && experiences.length > 0 && (
                    <section className="py-20">
                        <MorphingCard className="p-8" delay={0.4}>
                            <motion.h2
                                className="text-4xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                                    Expériences
                                </span>
                            </motion.h2>
                            <div className="space-y-8">
                                {experiences.map((exp: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -100, rotateY: -45 }}
                                        whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.8 }}
                                        whileHover={{
                                            scale: 1.02,
                                            x: 20,
                                            rotateY: 5,
                                            borderRadius: "30px",
                                        }}
                                        className="relative p-6 rounded-2xl bg-gradient-to-r from-white/5 to-white/10 border border-white/20"
                                    >
                                        {/* Morphing timeline indicator */}
                                        <motion.div
                                            className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500"
                                            animate={{
                                                borderRadius: [
                                                    "50%",
                                                    "25%",
                                                    "50% 0%",
                                                    "0%",
                                                    "50%"
                                                ],
                                                rotate: [0, 90, 180, 270, 360],
                                            }}
                                            transition={{
                                                duration: 5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: index * 0.5,
                                            }}
                                        />

                                        <div className="ml-8">
                                            <h3 className="text-2xl font-semibold text-white mb-2">{exp.position}</h3>
                                            <p className="text-blue-300 mb-2 text-lg">{exp.company}</p>
                                            <p className="text-gray-300 mb-4 flex items-center">
                                                <Calendar className="w-5 h-5 mr-2" />
                                                {exp.start_date} - {exp.end_date || 'Présent'}
                                            </p>
                                            {exp.description && (
                                                <p className="text-gray-200 leading-relaxed text-lg">{exp.description}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </MorphingCard>
                    </section>
                )}

                {/* Skills Section */}
                {settings.show_competences && skills.length > 0 && (
                    <section className="py-20">
                        <MorphingCard className="p-8" delay={0.6}>
                            <motion.h2
                                className="text-4xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                                    Compétences
                                </span>
                            </motion.h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {skills.map((skill: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.5, rotateZ: -90 }}
                                        whileInView={{ opacity: 1, scale: 1, rotateZ: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.05,
                                            duration: 0.8,
                                            type: "spring",
                                            bounce: 0.5
                                        }}
                                        whileHover={{
                                            scale: 1.15,
                                            rotateZ: 5,
                                            borderRadius: "25px",
                                        }}
                                        className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center relative overflow-hidden"
                                    >
                                        {/* Morphing skill indicator */}
                                        <motion.div
                                            className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500"
                                            animate={{
                                                borderRadius: [
                                                    "50%",
                                                    "0%",
                                                    "50% 20%",
                                                    "20% 50%",
                                                    "50%"
                                                ],
                                                rotate: [0, 180, 360],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: index * 0.1,
                                            }}
                                        />

                                        <div className="flex items-center justify-center mb-3">
                                            <motion.span
                                                className="text-white font-medium text-lg"
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: index * 0.1,
                                                }}
                                            >
                                                {skill.name}
                                            </motion.span>
                                        </div>
                                        {skill.level && (
                                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                                <motion.div
                                                    className="h-3 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.level}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{
                                                        duration: 2,
                                                        delay: index * 0.05,
                                                        ease: "easeOut"
                                                    }}
                                                    animate={{
                                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                                    }}
                                                    style={{
                                                        backgroundSize: "200% 200%",
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </MorphingCard>
                    </section>
                )}

                {/* Hobbies Section */}
                {settings.show_hobbies && hobbies.length > 0 && (
                    <section className="py-20">
                        <MorphingCard className="p-8" delay={0.8}>
                            <motion.h2
                                className="text-4xl font-bold text-white mb-12 text-center"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                    Centres d'Intérêt
                                </span>
                            </motion.h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hobbies.map((hobby: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 50, rotateX: -45 }}
                                        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.8,
                                            type: "spring"
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotateX: 5,
                                            rotateY: 5,
                                            borderRadius: "30px",
                                        }}
                                        className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center relative"
                                    >
                                        {/* Morphing hobby decoration */}
                                        <motion.div
                                            className="absolute top-3 left-3 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500"
                                            animate={{
                                                borderRadius: [
                                                    "50%",
                                                    "20% 50% 50% 20%",
                                                    "50% 20% 20% 50%",
                                                    "0%",
                                                    "50%"
                                                ],
                                                scale: [1, 1.2, 0.8, 1.1, 1],
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: index * 0.2,
                                            }}
                                        />

                                        <h3 className="text-xl font-semibold text-white mb-3">{hobby.name}</h3>
                                        {hobby.description && (
                                            <p className="text-gray-300 text-lg">{hobby.description}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </MorphingCard>
                    </section>
                )}
            </div>
        </div>
    );
};

export default MorphingDesign;