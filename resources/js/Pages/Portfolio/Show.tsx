import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { User, GraduationCap, Briefcase, Heart, Mail, Phone, MapPin, Github, Linkedin, FileText, Eye } from 'lucide-react';
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
        intuitive: "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900",
        professional: "bg-gray-100 text-gray-900",
        "user-friendly": "bg-green-50 text-green-900",
    };

    return (
        <div className={`min-h-screen ${layouts[design]}`}>
            <main className={`container mx-auto py-6 px-4 ${design === 'intuitive' ? 'max-w-4xl' : 'max-w-7xl'}`}>
                {children}
            </main>
        </div>
    );
};

const Section = ({ title, icon, children, design }) => {
    const sectionStyles = {
        intuitive: "bg-white shadow-lg rounded-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300 transform hover:scale-105",
        professional: "bg-white shadow rounded-lg p-6 mb-6",
        "user-friendly": "bg-white shadow-md rounded-2xl p-6 mb-6 border-2 border-green-200 hover:border-green-400 transition-colors duration-300",
    };

    return (
        <motion.section
            className={sectionStyles[design]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
                {React.createElement(icon, { className: "mr-2" })} {title}
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
    const { personalInfo, experiences, competences, hobbies, summary, design } = portfolio;
    const [previewPDF, setPreviewPDF] = useState(null);

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
                {personalInfo.profile_picture && (
                    <img
                        src={personalInfo.profile_picture}
                        alt={`Photo de profil de ${identifier}`}
                        className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-blue-300"
                    />
                )}
                <h1 className="text-4xl font-bold mb-2">{personalInfo.name}</h1>
                <p className="text-xl text-blue-600">{personalInfo.title}</p>
            </motion.div>

            <Section title="À propos de moi" icon={User} design={design}>
                <p>{summary?.description}</p>
            </Section>

            {portfolio.show_experiences && experiences?.length > 0 && (
                <Section title="Parcours professionnel" icon={Briefcase} design={design}>
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={index}
                            className="mb-4 p-4 bg-blue-50 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                        >
                            <h3 className="text-xl font-medium text-blue-700">{exp.title}</h3>
                            <p className="text-sm text-blue-600">{exp.company_name}</p>
                            <p className="text-sm text-blue-500">{exp.date_start} - {exp.date_end || 'Present'}</p>
                            <p className="mt-2">{exp.description}</p>
                            {exp.attachment_id && (
                                <Button variant="ghost" size="sm" onClick={() => handlePreviewPDF(exp.attachment_path)}>
                                    <Eye className="w-4 h-4 mr-2" /> Prévisualiser
                                </Button>
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

    const renderUserFriendlyLayout = () => (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center bg-white p-8 rounded-3xl shadow-lg"
            >
                {personalInfo.profile_picture && (
                    <img
                        src={personalInfo.profile_picture}
                        alt={`Photo de profil de ${identifier}`}
                        className="w-48 h-48 rounded-full mx-auto mb-4 border-4 border-green-300"
                    />
                )}
                <h1 className="text-4xl font-bold mb-2">{personalInfo.name}</h1>
                <p className="text-xl text-green-600">{personalInfo.title}</p>
                {portfolio.show_contact_info && (
                    <div className="mt-4 space-y-2">
                        <p className="flex items-center justify-center"><Mail className="mr-2" /> {personalInfo.email}</p>
                        <p className="flex items-center justify-center"><Phone className="mr-2" /> {personalInfo.phone}</p>
                    </div>
                )}
            </motion.div>

            <Section title="Mon histoire" icon={User} design={design}>
                <p className="text-lg">{summary?.description}</p>
            </Section>

            {portfolio.show_experiences && experiences?.length > 0 && (
                <Section title="Mon parcours" icon={Briefcase} design={design}>
                    <div className="space-y-6">
                        {experiences.map((exp, index) => (
                            <motion.div
                                key={index}
                                className="bg-green-50 p-6 rounded-xl"
                                whileHover={{ scale: 1.02 }}
                            >
                                <h3 className="text-2xl font-medium text-green-700">{exp.title}</h3>
                                <p className="text-green-600">{exp.company_name}</p>
                                <p className="text-green-500">{exp.date_start} - {exp.date_end || 'Present'}</p>
                                <p className="mt-2">{exp.description}</p>
                                {exp.attachment_id && (
                                    <Button variant="outline" size="sm" onClick={() => handlePreviewPDF(exp.attachment_path)} className="mt-2">
                                        <Eye className="w-4 h-4 mr-2" /> Voir le document
                                    </Button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Section>
            )}

            {portfolio.show_competences && competences?.length > 0 && (
                <Section title="Ce que je sais faire" icon={GraduationCap} design={design}>
                    <div className="flex flex-wrap gap-3">
                        {competences.map((comp, index) => (
                            <span key={index} className="bg-green-200 text-green-800 px-4 py-2 rounded-full text-lg">
                                {comp.name}
                            </span>
                        ))}
                    </div>
                </Section>
            )}

            {portfolio.show_hobbies && hobbies?.length > 0 && (
                <Section title="Ce que j'aime" icon={Heart} design={design}>
                    <div className="flex flex-wrap gap-3">
                        {hobbies.map((hobby, index) => (
                            <span key={index} className="bg-pink-200 text-pink-800 px-4 py-2 rounded-full text-lg">
                                {hobby.name}
                            </span>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );

    return (
        <PortfolioLayout design={design}>
            <Head title={`Portfolio de ${identifier}`} />

            {design === 'intuitive' && renderIntuitiveLayout()}
            {design === 'professional' && renderProfessionalLayout()}
            {design === 'user-friendly' && renderUserFriendlyLayout()}

            <PDFPreviewModal
                isOpen={!!previewPDF}
                onClose={() => setPreviewPDF(null)}
                pdfPath={previewPDF}
            />
        </PortfolioLayout>
    );
}
