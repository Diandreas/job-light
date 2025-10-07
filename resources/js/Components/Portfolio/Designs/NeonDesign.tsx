import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Code, Zap, Terminal, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { DesignProps } from './index';

const NeonDesign: React.FC<DesignProps> = ({ user, cvData, settings, isPreview = false }) => {
    const [glitchText, setGlitchText] = useState(user?.name || 'User Name');
    const [scanlinePosition, setScanlinePosition] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const neonGlow = useTransform(scrollYProgress, [0, 1], [0, 100]);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanlinePosition(prev => (prev + 1) % 100);
        }, 50);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const originalName = user?.name || 'User Name';

        const glitchInterval = setInterval(() => {
            const glitchChars = '█▓▒░@#$%&*';
            const glitched = originalName
                .split('')
                .map(char => Math.random() < 0.1 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char)
                .join('');

            setGlitchText(glitched);

            setTimeout(() => setGlitchText(originalName), 100);
        }, 3000);

        return () => clearInterval(glitchInterval);
    }, [user?.name]);

    const NeonText = ({ children, className = '', color = 'cyan' }: { children: React.ReactNode; className?: string; color?: string }) => {
        const colorClasses = {
            cyan: 'text-cyan-400 drop-shadow-[0_0_10px_#00ffff]',
            pink: 'text-pink-400 drop-shadow-[0_0_10px_#ff00ff]',
            yellow: 'text-yellow-400 drop-shadow-[0_0_10px_#ffff00]',
            green: 'text-green-400 drop-shadow-[0_0_10px_#00ff00]',
        };

        return (
            <span className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.cyan} ${className}`}>
                {children}
            </span>
        );
    };

    const NeonCard = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
        <motion.div
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay, type: "spring" }}
            whileHover={{
                scale: 1.02,
                rotateX: 5,
                boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)"
            }}
            className={`relative bg-black/80 border border-cyan-500/30 rounded-lg overflow-hidden ${className}`}
            style={{
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.05)'
            }}
        >
            {/* Neon border animation */}
            <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.4), transparent)',
                }}
                animate={{
                    x: ['-100%', '100%']
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'loop'
                }}
            />
            {children}
        </motion.div>
    );

    const TerminalLine = ({ prefix, text, delay = 0 }: { prefix: string; text: string; delay?: number }) => (
        <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay }}
            className="flex items-center font-mono text-green-400 mb-2"
        >
            <NeonText color="green">{prefix}</NeonText>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.5 }}
                className="ml-2"
            >
                {text}
            </motion.span>
            <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="ml-1"
            >
                |
            </motion.span>
        </motion.div>
    );

    const experiences = cvData?.experiences || [];
    const skills = cvData?.competences || [];
    const hobbies = cvData?.hobbies || [];

    return (
        <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
            {/* Cyberpunk Grid Background */}
            <div className="fixed inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Animated Scanlines */}
            <motion.div
                className="fixed inset-0 pointer-events-none"
                style={{ y: `${scanlinePosition}%` }}
            >
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            </motion.div>

            {/* Glitch Effect Overlay */}
            <motion.div
                className="fixed inset-0 pointer-events-none mix-blend-overlay"
                animate={{
                    opacity: [0, 0.1, 0, 0.05, 0]
                }}
                transition={{
                    duration: 0.1,
                    repeat: Infinity,
                    repeatDelay: 5
                }}
                style={{
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 0, 255, 0.1) 2px, rgba(255, 0, 255, 0.1) 4px)'
                }}
            />

            <div className="relative z-10 p-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center justify-center">
                    <NeonCard className="p-12 text-center max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 2 }}
                        >
                            {/* Terminal-style Header */}
                            <div className="mb-8 text-left font-mono text-sm">
                                <div className="flex items-center mb-2">
                                    <Terminal className="w-4 h-4 mr-2 text-green-400" />
                                    <NeonText color="green">root@portfolio:~$</NeonText>
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="ml-1 text-green-400"
                                    >
                                        _
                                    </motion.span>
                                </div>
                                <TerminalLine prefix=">" text="Initializing portfolio..." delay={0.5} />
                                <TerminalLine prefix=">" text="Loading user data..." delay={1} />
                                <TerminalLine prefix=">" text="Establishing neural link..." delay={1.5} />
                                <TerminalLine prefix=">" text="Welcome to the matrix." delay={2} />
                            </div>

                            {cvData?.profile_picture && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ duration: 1, delay: 2.5 }}
                                    className="relative mb-8 mx-auto w-40 h-40"
                                >
                                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/50 animate-spin" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-2 rounded-full border-2 border-pink-500/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                                    <img
                                        src={cvData.profile_picture}
                                        alt={user?.name}
                                        className="absolute inset-4 rounded-full object-cover border-2 border-yellow-500/50"
                                        style={{
                                            filter: 'contrast(1.2) brightness(1.1) hue-rotate(10deg)'
                                        }}
                                    />
                                </motion.div>
                            )}

                            <motion.h1
                                className="text-6xl font-bold mb-4 font-mono glitch-text"
                                data-text={glitchText}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 3 }}
                            >
                                <NeonText color="cyan">{glitchText}</NeonText>
                            </motion.h1>

                            <motion.div
                                className="text-2xl mb-8 font-mono"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 3.5 }}
                            >
                                <span className="text-gray-500">{'<'}</span>
                                <NeonText color="pink">{cvData?.professional_title || 'Digital Professional'}</NeonText>
                                <span className="text-gray-500">{' />'}</span>
                            </motion.div>

                            {settings.show_summary && cvData?.summary && (
                                <motion.div
                                    className="text-lg text-gray-300 max-w-2xl mx-auto font-mono leading-relaxed"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 4 }}
                                >
                                    <span className="text-yellow-400">// </span>
                                    {typeof cvData.summary === 'string' ? cvData.summary : cvData.summaries?.[0]?.description}
                                </motion.div>
                            )}
                        </motion.div>
                    </NeonCard>
                </section>

                {/* Contact Section */}
                <section className="py-20">
                    <NeonCard className="p-8" delay={0.2}>
                        <h2 className="text-3xl font-bold mb-8 text-center font-mono">
                            <NeonText color="cyan">{'{ CONTACT_INFO }'}</NeonText>
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {cvData?.email && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded bg-gray-900/50 border border-cyan-500/30 font-mono"
                                    whileHover={{
                                        scale: 1.05,
                                        borderColor: 'rgba(0, 255, 255, 0.8)',
                                        boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                                    }}
                                >
                                    <Mail className="w-6 h-6 text-cyan-400" />
                                    <span className="text-gray-300">{cvData.email}</span>
                                </motion.div>
                            )}
                            {cvData?.phone && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded bg-gray-900/50 border border-pink-500/30 font-mono"
                                    whileHover={{
                                        scale: 1.05,
                                        borderColor: 'rgba(255, 0, 255, 0.8)',
                                        boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)'
                                    }}
                                >
                                    <Phone className="w-6 h-6 text-pink-400" />
                                    <span className="text-gray-300">{cvData.phone}</span>
                                </motion.div>
                            )}
                            {cvData?.address && (
                                <motion.div
                                    className="flex items-center space-x-3 p-4 rounded bg-gray-900/50 border border-yellow-500/30 font-mono"
                                    whileHover={{
                                        scale: 1.05,
                                        borderColor: 'rgba(255, 255, 0, 0.8)',
                                        boxShadow: '0 0 20px rgba(255, 255, 0, 0.3)'
                                    }}
                                >
                                    <MapPin className="w-6 h-6 text-yellow-400" />
                                    <span className="text-gray-300">{cvData.address}</span>
                                </motion.div>
                            )}
                        </div>
                    </NeonCard>
                </section>

                {/* Experiences Section */}
                {settings.show_experiences && experiences.length > 0 && (
                    <section className="py-20">
                        <NeonCard className="p-8" delay={0.4}>
                            <h2 className="text-3xl font-bold mb-12 text-center font-mono">
                                <NeonText color="green">{'[ WORK_HISTORY ]'}</NeonText>
                            </h2>
                            <div className="space-y-6">
                                {experiences.map((exp: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -100 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.2 }}
                                        className="relative p-6 bg-gray-900/30 border border-green-500/30 rounded font-mono"
                                        whileHover={{
                                            borderColor: 'rgba(0, 255, 0, 0.8)',
                                            boxShadow: '0 0 30px rgba(0, 255, 0, 0.2)'
                                        }}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <ChevronRight className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold mb-2">
                                                    <NeonText color="cyan">{exp.name}</NeonText>
                                                </h3>
                                                <p className="text-pink-400 mb-2">
                                                    @ {exp.InstitutionName}
                                                </p>
                                                <p className="text-yellow-400 mb-4 flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {exp.date_start} - {exp.date_end || 'CURRENT'}
                                                </p>
                                                {exp.description && (
                                                    <p className="text-gray-300 leading-relaxed">
                                                        <span className="text-gray-500">// </span>
                                                        {exp.description}
                                                    </p>
                                                )}
                                                {exp.attachment_path && (
                                                    <div className="mt-4">
                                                        <a
                                                            href={exp.attachment_path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2 bg-black/80 hover:bg-green-400/10 border-2 border-green-400 rounded text-sm text-green-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                            {exp.attachment_name || 'view_document.exe'}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </NeonCard>
                    </section>
                )}

                {/* Skills Section */}
                {settings.show_competences && skills.length > 0 && (
                    <section className="py-20">
                        <NeonCard className="p-8" delay={0.6}>
                            <h2 className="text-3xl font-bold mb-12 text-center font-mono">
                                <NeonText color="pink">{'{ SKILL_MATRIX }'}</NeonText>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {skills.map((skill: any, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{
                                            scale: 1.1,
                                            backgroundColor: 'rgba(0, 255, 255, 0.1)'
                                        }}
                                        className="p-4 bg-gray-900/50 border border-cyan-500/30 rounded text-center font-mono"
                                    >
                                        <div className="flex items-center justify-center mb-2">
                                            <Code className="w-5 h-5 text-cyan-400 mr-2" />
                                            <NeonText color="cyan">{skill.name}</NeonText>
                                        </div>
                                        {skill.level && (
                                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    className="h-2 bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 rounded-full"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${skill.level}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 1.5, delay: index * 0.05 }}
                                                    style={{
                                                        boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </NeonCard>
                    </section>
                )}

                {/* Hobbies Section */}
                {settings.show_hobbies && hobbies.length > 0 && (
                    <section className="py-20">
                        <NeonCard className="p-8" delay={0.8}>
                            <h2 className="text-3xl font-bold mb-12 text-center font-mono">
                                <NeonText color="yellow">{'[ INTERESTS_LOG ]'}</NeonText>
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
                                            borderColor: 'rgba(255, 255, 0, 0.8)'
                                        }}
                                        className="p-6 bg-gray-900/50 border border-yellow-500/30 rounded font-mono"
                                    >
                                        <div className="flex items-center mb-2">
                                            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                                            <h3 className="text-lg font-semibold">
                                                <NeonText color="yellow">{hobby.name}</NeonText>
                                            </h3>
                                        </div>
                                        {hobby.description && (
                                            <p className="text-gray-300">
                                                <span className="text-gray-500">// </span>
                                                {hobby.description}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </NeonCard>
                    </section>
                )}
            </div>

            <style>{`
                .glitch-text {
                    position: relative;
                    z-index: 1;
                }

                .glitch-text::before,
                .glitch-text::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                .glitch-text::before {
                    animation: glitch 0.3s infinite;
                    color: #ff00ff;
                    z-index: 0;
                    transform: translate(-2px, 0);
                }

                .glitch-text::after {
                    animation: glitch 0.3s infinite reverse;
                    color: #00ffff;
                    z-index: 0;
                    transform: translate(2px, 0);
                }

                @keyframes glitch {
                    0% { transform: translate(0); }
                    20% { transform: translate(-2px, 2px); }
                    40% { transform: translate(-2px, -2px); }
                    60% { transform: translate(2px, 2px); }
                    80% { transform: translate(2px, -2px); }
                    100% { transform: translate(0); }
                }
            `}</style>
        </div>
    );
};

export default NeonDesign;