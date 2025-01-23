import React, { useState, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, FileText, Briefcase, Code, GraduationCap, Heart,
    ChevronRight, ChevronLeft, Mail, Phone, MapPin, Linkedin,
    Github, PencilIcon, Paintbrush, CircleChevronRight
} from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';

import PersonalInformationEdit from './PersonalInformation/Edit';
import CompetenceManager from '@/Components/CompetenceManager';
import HobbyManager from '@/Components/HobbyManager';
import ProfessionManager from '@/Components/ProfessionManager';
import ExperienceManager from "@/Components/ExperienceManager";
import SummaryManager from '@/Components/SummaryManager';

const SIDEBAR_ITEMS = [
    {
        id: 'personalInfo',
        label: 'Informations Personnelles',
        icon: User,
        color: 'text-blue-500',
    },
    {
        id: 'summary',
        label: 'Résumé',
        icon: FileText,
        color: 'text-green-500',
    },
    {
        id: 'experience',
        label: 'Expériences',
        icon: Briefcase,
        color: 'text-purple-500',
    },
    {
        id: 'competence',
        label: 'Compétences',
        icon: Code,
        color: 'text-yellow-500',
    },
    {
        id: 'profession',
        label: 'Formation',
        icon: GraduationCap,
        color: 'text-red-500',
    },
    {
        id: 'hobby',
        label: 'Centres d\'Intérêt',
        icon: Heart,
        color: 'text-pink-500',
    }
];

const PERSONAL_INFO_FIELDS = [
    { label: "Email", key: "email", icon: Mail },
    { label: "Téléphone", key: "phone", icon: Phone },
    { label: "Adresse", key: "address", icon: MapPin },
    { label: "LinkedIn", key: "linkedin", icon: Linkedin },
    { label: "GitHub", key: "github", icon: Github }
];

const PersonalInfoCard = ({ item, onEdit }) => (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Informations Personnelles</h2>
            <Button onClick={onEdit} className="bg-primary hover:bg-primary/90 text-white mt-4 md:mt-0">
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
            </Button>
        </div>

        <Card>
            <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-4 border-b pb-4">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {item.firstName} {item.lastName}
                        </h3>
                        <p className="text-gray-500 text-lg">Développeur Web Full Stack</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {PERSONAL_INFO_FIELDS.map(({ label, key, icon: Icon }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="mt-1">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 font-medium">{label}</p>
                                <p className="text-gray-900 font-medium">{item[key] || 'Non renseigné'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);

const ProgressIndicator = ({ percentage }) => (
    <div className="flex items-center gap-4">
        <div className="text-right">
            <p className="text-sm text-gray-500">Progression</p>
            <p className="text-xl font-bold text-primary">{percentage}%</p>
        </div>
        <div className="h-12 w-12 rounded-full border-4 border-primary flex items-center justify-center">
            <span className="text-primary font-bold">{percentage}%</span>
        </div>
    </div>
);

const SidebarButton = ({ item, isActive, isComplete, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center md:justify-between p-2 md:p-3 rounded-lg transition-all ${
            isActive ? 'bg-primary text-white shadow-md' : 'hover:bg-gray-100'
        }`}
    >
        <div className="flex items-center gap-3">
            <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
            <span className="hidden md:block font-medium">{item.label}</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
            {isComplete && <div className="w-2 h-2 rounded-full bg-green-500" />}
            <ChevronRight className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
        </div>
    </button>
);

const SectionNavigation = ({ currentSection, nextSection, prevSection, canProgress, onNavigate }) => (
    <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t">
        {prevSection && (
            <Button
                variant="outline"
                onClick={() => onNavigate(prevSection.id)}
                className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0"
            >
                <ChevronLeft className="w-4 h-4" />
                {prevSection.label}
            </Button>
        )}
        {nextSection && (
            <Button
                onClick={() => onNavigate(nextSection.id)}
                disabled={!canProgress}
                className="flex items-center gap-2 w-full md:w-auto ml-auto"
            >
                {nextSection.label}
                <ChevronRight className="w-4 h-4" />
            </Button>
        )}
    </div>
);

export default function CvInterface({ auth, cvInformation: initialCvInformation }) {
    const [activeSection, setActiveSection] = useState('personalInfo');
    const [cvInformation, setCvInformation] = useState(initialCvInformation);
    const [isEditing, setIsEditing] = useState(false);
    const {toast} = useToast();

    const updateCvInformation = useCallback((section, data) => {
        setCvInformation(prev => ({
            ...prev,
            [section]: Array.isArray(data) ? [...data] : {...data}
        }));
    }, []);

    const completionStatus = {
        personalInfo: true,
        summary: cvInformation.summaries?.length > 0,
        experience: cvInformation.experiences?.length > 0,
        competence: cvInformation.competences?.length > 0,
        profession: true,
        hobby: cvInformation.hobbies?.length > 0,
    };

    const getCompletionPercentage = () => {
        const completed = Object.values(completionStatus).filter(status => status).length;
        return Math.round((completed / Object.keys(completionStatus).length) * 100);
    };

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => setIsEditing(false);
    const handleUpdate = (updatedInfo) => {
        updateCvInformation('personalInformation', updatedInfo);
        setIsEditing(false);
        toast({
            title: "Informations mises à jour",
            description: "Vos informations personnelles ont été enregistrées."
        });
    };

    const getSectionComponent = (sectionId) => {
        const components = {
            personalInfo: isEditing ? (
                <PersonalInformationEdit
                    user={cvInformation.personalInformation}
                    onUpdate={handleUpdate}
                    onCancel={handleCancel}
                />
            ) : (
                <PersonalInfoCard
                    item={cvInformation.personalInformation}
                    onEdit={handleEdit}
                />
            ),
            summary: (
                <SummaryManager
                    auth={auth}
                    summaries={cvInformation.allsummaries}
                    selectedSummary={cvInformation.summaries}
                    onUpdate={(summaries) => updateCvInformation('summaries', summaries)}
                />
            ),
            experience: (
                <ExperienceManager
                    auth={auth}
                    experiences={cvInformation.experiences}
                    categories={cvInformation.experienceCategories}
                    onUpdate={(experiences) => updateCvInformation('experiences', experiences)}
                />
            ),
            competence: (
                <CompetenceManager
                    auth={auth}
                    availableCompetences={cvInformation.availableCompetences}
                    initialUserCompetences={cvInformation.competences}
                    onUpdate={(competences) => updateCvInformation('competences', competences)}
                />
            ),
            profession: (
                <ProfessionManager
                    auth={auth}
                    availableProfessions={cvInformation.availableProfessions}
                    initialUserProfession={cvInformation.myProfession}
                    onUpdate={(profession) => updateCvInformation('myProfession', profession)}
                />
            ),
            hobby: (
                <HobbyManager
                    auth={auth}
                    availableHobbies={cvInformation.availableHobbies}
                    initialUserHobbies={cvInformation.hobbies}
                    onUpdate={(hobbies) => updateCvInformation('hobbies', hobbies)}
                />
            ),
        };
        return components[sectionId];
    };

    const currentSectionIndex = SIDEBAR_ITEMS.findIndex(item => item.id === activeSection);
    const nextSection = SIDEBAR_ITEMS[currentSectionIndex + 1];
    const prevSection = SIDEBAR_ITEMS[currentSectionIndex - 1];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Mon CV Professionnel</h2>}
        >
            <Head title="CV Professionnel"/>

            <div className="min-h-screen bg-gray-50">
                <div className="mb-6 flex justify-end">
                    <Link href={route('userCvModels.index')}>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Paintbrush className="mr-2 h-4 w-4"/>
                            Choisissez le design de CV
                            <CircleChevronRight/>
                        </Button>
                    </Link>
                </div>
                <div className="container mx-auto py-6 px-4">
                    <Card className="shadow-lg">
                        <CardHeader className="bg-white border-b">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-bold">Mon CV Professionnel</CardTitle>
                                    <p className="text-gray-500 mt-1">Complétez votre profil pour créer un CV
                                        percutant</p>
                                </div>
                                <ProgressIndicator percentage={getCompletionPercentage()}/>
                            </div>

                            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{width: 0}}
                                    animate={{width: `${getCompletionPercentage()}%`}}
                                    transition={{duration: 0.5}}
                                />
                            </div>
                        </CardHeader>

                        <div className="flex flex-row min-h-[600px]">
                            <div className="w-14 md:w-64 flex-shrink-0 border-r bg-gray-50 transition-all duration-300">
                                <nav className="sticky top-0 p-2 md:p-4 space-y-1 md:space-y-2">
                                    {SIDEBAR_ITEMS.map(item => (
                                        <SidebarButton
                                            key={item.id}
                                            item={item}
                                            isActive={activeSection === item.id}
                                            isComplete={completionStatus[item.id]}
                                            onClick={() => setActiveSection(item.id)}
                                        />
                                    ))}
                                </nav>
                            </div>

                            <div className="flex-grow p-4 md:p-6 overflow-x-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSection}
                                        initial={{opacity: 0, x: 20}}
                                        animate={{opacity: 1, x: 0}}
                                        exit={{opacity: 0, x: -20}}
                                        transition={{duration: 0.3}}
                                        className="space-y-6"
                                    >
                                        {getSectionComponent(activeSection)}

                                        <SectionNavigation
                                            currentSection={activeSection}
                                            nextSection={nextSection}
                                            prevSection={prevSection}
                                            canProgress={completionStatus[activeSection]}
                                            onNavigate={setActiveSection}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
