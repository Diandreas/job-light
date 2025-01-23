import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Components/ui/card";
import { Head } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { motion } from 'framer-motion';

import CompetenceManager from '@/Components/CompetenceManager';
import HobbyManager from '@/Components/HobbyManager';
import ProfessionManager from '@/Components/ProfessionManager';
import ExperienceManager from "@/Components/ExperienceManager";
import SummaryManager from '@/Components/SummaryManager';
import PersonalInformationEdit from "@/Pages/CvInfos/PersonalInformation/Edit";


interface CvInformation {
    selectedSummary: any;
    hobbies: { id: number; name: string }[];
    competences: { id: number; name: string }[];
    experiences: {
        id: number;
        title: string;
        company_name: string;
        date_start: string;
        date_end: string | null;
        category_name: string;
        description: string;
        output: string;
    }[];
    experienceCategories: { name: string; description: string; ranking: number }[];
    professions: { id: number; name: string }[];
    myProfession: { id: number; name: string }[];
    summaries: { id: number; description: string }[];
    allsummaries: { id: number; description: string }[];
    personalInformation: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        linkedin: string;
        github: string;
    };
}

interface Props {
    auth: any;
    cvInformation: CvInformation;
}
export default function Show({ auth, cvInformation }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [personalInfo, setPersonalInfo] = useState(cvInformation.personalInformation);
    const [selectedSummary, setSelectedSummary] = useState<{ id: number; description: string } | null>(null);

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => setIsEditing(false);
    const handleUpdate = (updatedInfo) => {
        setPersonalInfo(updatedInfo);
        setIsEditing(false);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Mon Portfolio Professionnel</h2>}
        >
            <Head title="Portfolio Professionnel" />

            <motion.div
                className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <Tabs defaultValue="personalInfo">
                            <TabsList className="mb-6">
                                <TabsTrigger value="personalInfo">Informations Personnelles</TabsTrigger>
                                <TabsTrigger value="summary">Résumé</TabsTrigger>
                                <TabsTrigger value="experience">Expériences</TabsTrigger>
                                <TabsTrigger value="competence">Compétences</TabsTrigger>
                                <TabsTrigger value="profession">Formations</TabsTrigger>
                                <TabsTrigger value="hobby">Centres d'Intérêt</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personalInfo">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {isEditing ? (
                                        <PersonalInformationEdit
                                            user={personalInfo}
                                            onUpdate={handleUpdate}
                                            onCancel={handleCancel}
                                        />
                                    ) : (
                                        <PersonalInfoCard item={personalInfo} onEdit={handleEdit} />
                                    )}
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="summary">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <SummaryManager
                                        auth={auth}
                                        summaries={cvInformation.allsummaries}
                                        selectedSummary={cvInformation.summaries}
                                        // onSelectSummary={handleSelectSummary}
                                    />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="experience">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <ExperienceManager
                                        auth={auth}
                                        experiences={cvInformation.experiences}
                                        // @ts-ignore
                                        categories={cvInformation.experienceCategories}
                                    />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="competence">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <CompetenceManager
                                        // @ts-ignore
                                        auth={auth} availableCompetences={cvInformation.availableCompetences} initialUserCompetences={cvInformation.competences} />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="profession">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <ProfessionManager
                                        // @ts-ignore
                                        auth={auth} availableProfessions={cvInformation.availableProfessions} initialUserProfession={cvInformation.myProfession} />
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="hobby">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <HobbyManager
                                        // @ts-ignore
                                        auth={auth} availableHobbies={cvInformation.availableHobbies} initialUserHobbies={cvInformation.hobbies} />
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </AuthenticatedLayout>
    );
}

// ... (keep the PersonalInfoCard component from your original code)

function PersonalInfoCard({ item, onEdit }: { item: CvInformation['personalInformation']; onEdit: () => void }) {
    return (
        <Card className="mb-8">
            <CardHeader className="bg-gray-100">
                <CardTitle className="text-3xl font-bold">{item.firstName} {item.lastName}</CardTitle>
                <p className="text-xl text-gray-600">Développeur Web Full Stack</p>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { value: item.email, label: "Email" },
                        { value: item.phone, label: "Téléphone" },
                        { value: item.address, label: "Adresse" },
                        { value: item.linkedin, label: "LinkedIn" },
                        { value: item.github, label: "GitHub" }
                    ].map(({ value, label }) => (
                        <div key={label} className="flex items-center">
                            <span className="font-semibold">{label}:</span>
                            <span className="ml-2">{value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={onEdit}>Modifier</Button>
            </CardFooter>
        </Card>
    );
}
