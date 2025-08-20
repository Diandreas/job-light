import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { User, GraduationCap, Briefcase, Heart, Mail, Phone, MapPin, Github, Linkedin, FileText, Eye, Download, ExternalLink, File, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/Components/ui/dialog";

const PortfolioLayout = ({ children, design }) => {
    const layouts = {
        intuitive: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800",
        professional: "bg-gradient-to-b from-gray-50 to-white text-gray-900",
        "user-friendly": "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-green-900",
        creative: "bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 text-gray-800",
        modern: "bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white",
    };

    const containerStyles = {
        intuitive: 'max-w-5xl',
        professional: 'max-w-7xl',
        'user-friendly': 'max-w-6xl',
        creative: 'max-w-6xl',
        modern: 'max-w-5xl'
    };

    return (
        <div className={`min-h-screen ${layouts[design]}`}>
            <main className={`container mx-auto py-8 px-4 ${containerStyles[design] || 'max-w-7xl'}`}>
                {children}
            </main>
        </div>
    );
};

const Section = ({ title, icon, children, design }) => {
    const sectionStyles = {
        intuitive: "bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-8 mb-8 hover:shadow-2xl transition-all duration-300 border border-blue-100",
        professional: "bg-white shadow-lg rounded-lg p-6 mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300",
        "user-friendly": "bg-white shadow-lg rounded-3xl p-8 mb-8 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300",
        creative: "bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 mb-8 border-l-4 border-gradient-to-b from-purple-400 to-pink-400",
        modern: "bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-lg p-8 mb-8 border border-gray-700 hover:bg-gray-800/70 transition-all duration-300",
    };

    const titleStyles = {
        intuitive: "text-3xl font-bold mb-6 flex items-center text-indigo-700",
        professional: "text-2xl font-semibold mb-4 flex items-center text-gray-800",
        "user-friendly": "text-2xl font-bold mb-6 flex items-center text-emerald-700",
        creative: "text-3xl font-extrabold mb-6 flex items-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent",
        modern: "text-2xl font-bold mb-6 flex items-center text-white",
    };

    return (
        <motion.section
            className={sectionStyles[design] || sectionStyles.professional}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className={titleStyles[design] || titleStyles.professional}>
                {React.createElement(icon, { className: "mr-3 h-6 w-6" })} {title}
            </h2>
            {children}
        </motion.section>
    );
};

const PDFPreviewModal = ({ isOpen, onClose, pdfPath }) => {
    console.log("PDFPreviewModal rendered with:", { isOpen, pdfPath });

    if (!isOpen || !pdfPath) {
        console.log("PDFPreviewModal not showing because:", { isOpen, pdfPath });
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-4xl h-[80vh]">

                <DialogTitle>Prévisualisation du document</DialogTitle>
                <DialogDescription>
                    Si le document ne s'affiche pas, <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">cliquez ici pour l'ouvrir dans un nouvel onglet</a>.
                </DialogDescription>

                <iframe src={pdfPath} className="m-0 w-full h-full" />

            </DialogContent>
        </Dialog>
    );
};
export default function Show({ portfolio, identifier }) {
    console.log('Portfolio Show component loaded with:', { portfolio, identifier });

    if (!portfolio) {
        console.error('Portfolio data is missing!');
        return <div>Erreur: Données du portfolio manquantes</div>;
    }

    const { personalInfo, experiences, competences, hobbies, summary, design: rawDesign } = portfolio;
    const design = rawDesign === 'default' ? 'professional' : rawDesign;
    const [previewPDF, setPreviewPDF] = useState(null);

    const getFileIcon = (format) => {
        if (!format) return File;
        const fileType = format.toLowerCase();
        if (fileType.includes('pdf')) return FileText;
        if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) return ImageIcon;
        if (fileType.includes('doc') || fileType.includes('word')) return FileText;
        return File;
    };

    const getFileTypeColor = (format) => {
        if (!format) return 'bg-gray-500';
        const fileType = format.toLowerCase();
        if (fileType.includes('pdf')) return 'bg-red-500';
        if (fileType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) return 'bg-blue-500';
        if (fileType.includes('doc') || fileType.includes('word')) return 'bg-blue-600';
        return 'bg-gray-500';
    };

    const handlePreviewPDF = (pdfPath) => {
        setPreviewPDF(pdfPath);
    };

    const renderIntuitiveLayout = () => (
        <div className="grid grid-cols-1 gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="w-40 h-40 mx-auto mb-6">
                    {personalInfo.profile_picture ? (
                        <img
                            src={personalInfo.profile_picture}
                            alt={`Photo de profil de ${identifier}`}
                            className="w-full h-full rounded-full object-cover border-4 border-indigo-300 shadow-xl"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center border-4 border-indigo-300 shadow-xl">
                            <span className="text-white text-3xl font-bold">
                                {personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{personalInfo.name}</h1>
                <p className="text-2xl text-indigo-600 font-medium">{personalInfo.title}</p>
            </motion.div>

            <Section title="À propos de moi" icon={User} design={design}>
                <p>{summary?.description}</p>
            </Section>

            {portfolio.show_experiences && experiences?.length > 0 && (
                <Section title="Parcours professionnel" icon={Briefcase} design={design}>
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={index}
                            className="mb-6 p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-indigo-800 mb-2">{exp.title}</h3>
                                    <p className="text-lg text-indigo-600 font-medium">{exp.company_name}</p>
                                    <p className="text-sm text-indigo-500 mt-1">{exp.date_start} - {exp.date_end || 'Présent'}</p>
                                </div>
                                {exp.attachment_path && (
                                    <div className="ml-4">
                                        <div className={`w-12 h-12 rounded-lg ${getFileTypeColor(exp.attachment_format)} flex items-center justify-center shadow-lg`}>
                                            {React.createElement(getFileIcon(exp.attachment_format), {
                                                className: "w-6 h-6 text-white"
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-4">{exp.description}</p>

                            {exp.attachment_path && (
                                <div className="flex gap-3 pt-4 border-t border-indigo-100">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePreviewPDF(exp.attachment_path)}
                                        className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Prévisualiser
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                    >
                                        <a href={exp.attachment_path} download target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4" />
                                            Télécharger
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </Section>
            )}

            {portfolio.show_competences && competences?.length > 0 && (
                <Section title="Compétences" icon={GraduationCap} design={design}>
                    <div className="flex flex-wrap gap-2">
                        {competences.map((comp, index) => (
                            <span key={index} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full">
                                {comp.name}
                            </span>
                        ))}
                    </div>
                </Section>
            )}

            {portfolio.show_hobbies && hobbies?.length > 0 && (
                <Section title="Centres d'intérêt" icon={Heart} design={design}>
                    <div className="flex flex-wrap gap-2">
                        {hobbies.map((hobby, index) => (
                            <span key={index} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full">
                                {hobby.name}
                            </span>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );

    const renderProfessionalLayout = () => (
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1">
                <Section title="Profil" icon={User} design={design}>
                    {personalInfo.profile_picture && (
                        <img
                            src={personalInfo.profile_picture}
                            alt={`Photo de profil de ${identifier}`}
                            className="w-full rounded-lg mb-4"
                        />
                    )}
                    <h1 className="text-2xl font-bold mb-2">{personalInfo.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{personalInfo.title}</p>
                    {portfolio.show_contact_info && (
                        <div className="space-y-2">
                            <p className="flex items-center"><Mail className="mr-2" /> {personalInfo.email}</p>
                            <p className="flex items-center"><Phone className="mr-2" /> {personalInfo.phone}</p>
                            <p className="flex items-center"><MapPin className="mr-2" /> {personalInfo.address}</p>
                            <p className="flex items-center"><Github className="mr-2" /> {personalInfo.github}</p>
                            <p className="flex items-center"><Linkedin className="mr-2" /> {personalInfo.linkedin}</p>
                        </div>
                    )}
                </Section>

                {portfolio.show_competences && competences?.length > 0 && (
                    <Section title="Compétences" icon={GraduationCap} design={design}>
                        <ul className="list-disc list-inside">
                            {competences.map((comp, index) => (
                                <li key={index}>{comp.name}</li>
                            ))}
                        </ul>
                    </Section>
                )}

                {portfolio.show_hobbies && hobbies?.length > 0 && (
                    <Section title="Centres d'intérêt" icon={Heart} design={design}>
                        <ul className="list-disc list-inside">
                            {hobbies.map((hobby, index) => (
                                <li key={index}>{hobby.name}</li>
                            ))}
                        </ul>
                    </Section>
                )}
            </div>
            <div className="col-span-2">
                <Section title="Résumé" icon={FileText} design={design}>
                    <p>{summary?.description}</p>
                </Section>

                {portfolio.show_experiences && experiences?.length > 0 && (
                    <Section title="Expériences professionnelles" icon={Briefcase} design={design}>
                        {experiences.map((exp, index) => (
                            <div key={index} className="mb-4 border-b pb-4 last:border-b-0">
                                <h3 className="text-xl font-medium">{exp.title}</h3>
                                <p className="text-sm text-gray-600">{exp.company_name}</p>
                                <p className="text-sm text-gray-500">{exp.date_start} - {exp.date_end || 'Present'}</p>
                                <p className="mt-2">{exp.description}</p>
                                {exp.attachment_id && (
                                    <Button variant="outline" size="sm" onClick={() => handlePreviewPDF(exp.attachment_path)}>
                                        <Eye className="w-4 h-4 mr-2" /> Prévisualiser le document
                                    </Button>
                                )}
                            </div>
                        ))}
                    </Section>
                )}
            </div>
        </div>
    );



    const renderCreativeLayout = () => (
        <div className="space-y-8">
            {/* Hero Section Créatif */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-12 text-white"
            >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                    <div className="w-48 h-48">
                        {personalInfo.profile_picture ? (
                            <img
                                src={personalInfo.profile_picture}
                                alt={`Photo de profil de ${identifier}`}
                                className="w-full h-full rounded-full object-cover border-4 border-white/30 shadow-2xl"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl">
                                <span className="text-white text-4xl font-bold">
                                    {personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-6xl font-black mb-4 text-white drop-shadow-lg">{personalInfo.name}</h1>
                        <p className="text-2xl font-semibold text-white/90 mb-6">{personalInfo.title}</p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            {personalInfo.email && (
                                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <Mail className="w-5 h-5 mr-2" />
                                    {personalInfo.email}
                                </div>
                            )}
                            {personalInfo.phone && (
                                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <Phone className="w-5 h-5 mr-2" />
                                    {personalInfo.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Section À propos */}
            <Section title="À propos de moi" icon={User} design="creative">
                <p className="text-lg leading-relaxed text-gray-700">{summary?.description}</p>
            </Section>

            {/* Expériences en grille créative */}
            {experiences && experiences.length > 0 && (
                <Section title="Expériences" icon={Briefcase} design="creative">
                    <div className="grid md:grid-cols-2 gap-6">
                        {experiences.map((exp, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                            >
                                {exp.attachment_path && (
                                    <div className="absolute top-4 right-4">
                                        <div className={`w-10 h-10 rounded-full ${getFileTypeColor(exp.attachment_format)} flex items-center justify-center shadow-lg`}>
                                            {React.createElement(getFileIcon(exp.attachment_format), {
                                                className: "w-5 h-5 text-white"
                                            })}
                                        </div>
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-purple-800 mb-2 pr-12">{exp.title}</h3>
                                <p className="text-purple-600 font-medium mb-3">{exp.category_name}</p>
                                <p className="text-sm text-purple-500 mb-3">{exp.date_start} - {exp.date_end || 'Présent'}</p>
                                <p className="text-gray-700 mb-4">{exp.description}</p>

                                {exp.attachment_path && (
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            size="sm"
                                            onClick={() => handlePreviewPDF(exp.attachment_path)}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Voir
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                            className="border-purple-300 text-purple-600 hover:bg-purple-50 text-xs"
                                        >
                                            <a href={exp.attachment_path} download target="_blank" rel="noopener noreferrer">
                                                <Download className="w-3 h-3 mr-1" />
                                                Télécharger
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Compétences et Hobbies côte à côte */}
            <div className="grid md:grid-cols-2 gap-8">
                {competences && competences.length > 0 && (
                    <Section title="Compétences" icon={GraduationCap} design="creative">
                        <div className="flex flex-wrap gap-3">
                            {competences.map((competence, index) => (
                                <span key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                                    {competence.name}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}

                {hobbies && hobbies.length > 0 && (
                    <Section title="Hobbies" icon={Heart} design="creative">
                        <div className="flex flex-wrap gap-3">
                            {hobbies.map((hobby, index) => (
                                <span key={index} className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                                    {hobby.name}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );

    const renderModernLayout = () => (
        <div className="space-y-12">
            {/* Hero Modern Minimaliste */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg"></div>
                <div className="relative bg-gray-900/95 backdrop-blur-xl p-12 rounded-lg border border-gray-700">
                    <div className="flex flex-col lg:flex-row items-center space-y-8 lg:space-y-0 lg:space-x-12">
                        <div className="w-32 h-32">
                            {personalInfo.profile_picture ? (
                                <img
                                    src={personalInfo.profile_picture}
                                    alt={`Photo de profil de ${identifier}`}
                                    className="w-full h-full rounded-lg object-cover border border-gray-600 shadow-2xl"
                                />
                            ) : (
                                <div className="w-full h-full rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-gray-600 shadow-2xl">
                                    <span className="text-white text-2xl font-bold">
                                        {personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center lg:text-left">
                            <h1 className="text-5xl font-light mb-4 text-white tracking-wide">{personalInfo.name}</h1>
                            <p className="text-xl text-gray-300 mb-8 font-light">{personalInfo.title}</p>
                            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-gray-400">
                                {personalInfo.email && (
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {personalInfo.email}
                                    </div>
                                )}
                                {personalInfo.phone && (
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2" />
                                        {personalInfo.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Section À propos moderne */}
            <Section title="À propos" icon={User} design="modern">
                <p className="text-lg leading-relaxed text-gray-300">{summary?.description}</p>
            </Section>

            {/* Expériences en timeline moderne */}
            {experiences && experiences.length > 0 && (
                <Section title="Expériences" icon={Briefcase} design="modern">
                    <div className="space-y-8">
                        {experiences.map((exp, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="relative pl-12 border-l-2 border-blue-500 group"
                            >
                                <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    {exp.attachment_path && (
                                        <div className={`w-3 h-3 rounded-full ${getFileTypeColor(exp.attachment_format).replace('bg-', 'bg-opacity-80 bg-')}`}></div>
                                    )}
                                </div>

                                <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-medium text-white mb-2">{exp.title}</h3>
                                            <p className="text-blue-400 font-medium mb-1">{exp.category_name}</p>
                                            <p className="text-gray-500 text-sm">{exp.date_start} - {exp.date_end || 'Présent'}</p>
                                        </div>
                                        {exp.attachment_path && (
                                            <div className="ml-4">
                                                <div className={`w-10 h-10 rounded ${getFileTypeColor(exp.attachment_format)} flex items-center justify-center shadow-lg`}>
                                                    {React.createElement(getFileIcon(exp.attachment_format), {
                                                        className: "w-5 h-5 text-white"
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-gray-300 mb-4">{exp.description}</p>

                                    {exp.attachment_path && (
                                        <div className="flex gap-3 pt-4 border-t border-gray-700">
                                            <Button
                                                size="sm"
                                                onClick={() => handlePreviewPDF(exp.attachment_path)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Prévisualiser
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            >
                                                <a href={exp.attachment_path} download target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Télécharger
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Compétences et Hobbies modernes */}
            <div className="grid lg:grid-cols-2 gap-12">
                {competences && competences.length > 0 && (
                    <Section title="Compétences" icon={GraduationCap} design="modern">
                        <div className="space-y-3">
                            {competences.map((competence, index) => (
                                <div key={index} className="bg-gray-700/50 backdrop-blur-sm px-4 py-3 rounded border border-gray-600 text-gray-200">
                                    {competence.name}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {hobbies && hobbies.length > 0 && (
                    <Section title="Centres d'intérêt" icon={Heart} design="modern">
                        <div className="space-y-3">
                            {hobbies.map((hobby, index) => (
                                <div key={index} className="bg-gray-700/50 backdrop-blur-sm px-4 py-3 rounded border border-gray-600 text-gray-200">
                                    {hobby.name}
                                </div>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );


    const renderUserFriendlyLayout = () => (
        <div className="space-y-10">
            {/* Hero Section Convivial */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl p-8 text-white shadow-xl"
            >
                <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    <div className="w-40 h-40">
                        {personalInfo.profile_picture ? (
                            <img
                                src={personalInfo.profile_picture}
                                alt={`Photo de profil de ${identifier}`}
                                className="w-full h-full rounded-full object-cover border-4 border-white/30 shadow-lg"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-lg">
                                <span className="text-white text-3xl font-bold">
                                    {personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center lg:text-left">
                        <h1 className="text-5xl font-bold mb-4 text-white">{personalInfo.name}</h1>
                        <p className="text-2xl text-emerald-100 mb-6">{personalInfo.title}</p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            {personalInfo.email && (
                                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <Mail className="w-5 h-5 mr-2" />
                                    {personalInfo.email}
                                </div>
                            )}
                            {personalInfo.phone && (
                                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                                    <Phone className="w-5 h-5 mr-2" />
                                    {personalInfo.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Section À propos */}
            <Section title="À propos de moi" icon={User} design="user-friendly">
                <p className="text-lg leading-relaxed text-gray-700">{summary?.description}</p>
            </Section>

            {/* Expériences avec design convivial */}
            {experiences && experiences.length > 0 && (
                <Section title="Mon Parcours" icon={Briefcase} design="user-friendly">
                    <div className="space-y-6">
                        {experiences.map((exp, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-8 rounded-3xl border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                <div className="flex flex-wrap items-start gap-4 mb-6">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-bold text-emerald-800 mb-2">{exp.title}</h3>
                                        <p className="text-lg text-emerald-600 font-medium mb-1">{exp.category_name}</p>
                                        <p className="text-sm text-emerald-500">{exp.date_start} - {exp.date_end || 'Présent'}</p>
                                    </div>
                                    {exp.attachment_path && (
                                        <div className="flex-shrink-0">
                                            <div className={`w-16 h-16 rounded-2xl ${getFileTypeColor(exp.attachment_format)} flex items-center justify-center shadow-lg`}>
                                                {React.createElement(getFileIcon(exp.attachment_format), {
                                                    className: "w-8 h-8 text-white"
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-gray-700 text-lg leading-relaxed mb-6">{exp.description}</p>

                                {exp.attachment_path && (
                                    <div className="flex flex-wrap gap-3 pt-6 border-t-2 border-emerald-100">
                                        <Button
                                            onClick={() => handlePreviewPDF(exp.attachment_path)}
                                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full px-6 py-3"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Voir le document
                                        </Button>
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 rounded-full px-6 py-3"
                                        >
                                            <a href={exp.attachment_path} download target="_blank" rel="noopener noreferrer">
                                                <Download className="w-4 h-4 mr-2" />
                                                Télécharger
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Compétences et Hobbies convivials */}
            <div className="grid lg:grid-cols-2 gap-10">
                {competences && competences.length > 0 && (
                    <Section title="Mes Compétences" icon={GraduationCap} design="user-friendly">
                        <div className="flex flex-wrap gap-4">
                            {competences.map((competence, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-6 py-3 rounded-full text-lg font-medium shadow-lg"
                                >
                                    {competence.name}
                                </motion.span>
                            ))}
                        </div>
                    </Section>
                )}

                {hobbies && hobbies.length > 0 && (
                    <Section title="Mes Passions" icon={Heart} design="user-friendly">
                        <div className="flex flex-wrap gap-4">
                            {hobbies.map((hobby, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white px-6 py-3 rounded-full text-lg font-medium shadow-lg"
                                >
                                    {hobby.name}
                                </motion.span>
                            ))}
                        </div>
                    </Section>
                )}
            </div>
        </div>
    );

    return (
        <PortfolioLayout design={design}>
            <Head title={`Portfolio de ${identifier}`} />

            {design === 'intuitive' && renderIntuitiveLayout()}
            {design === 'professional' && renderProfessionalLayout()}
            {design === 'user-friendly' && renderUserFriendlyLayout()}
            {design === 'creative' && renderCreativeLayout()}
            {design === 'modern' && renderModernLayout()}

            <PDFPreviewModal
                isOpen={!!previewPDF}
                onClose={() => setPreviewPDF(null)}
                pdfPath={previewPDF}
            />
        </PortfolioLayout>
    );
}
