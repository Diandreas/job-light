import React, { useState, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, FileText, Briefcase, Code, GraduationCap, Heart,
    ChevronRight, ChevronLeft, Mail, Phone, MapPin, Linkedin,
    Github, PencilIcon, Sparkles, CircleChevronRight, Star, Camera, Upload
} from 'lucide-react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { Separator } from "@/Components/ui/separator";

import PersonalInformationEdit from './PersonalInformation/Edit';
import CompetenceManager from '@/Components/CompetenceManager';
import HobbyManager from '@/Components/HobbyManager';
import ProfessionManager from '@/Components/ProfessionManager';
import ExperienceManager from "@/Components/ExperienceManager";
import SummaryManager from '@/Components/SummaryManager';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const SIDEBAR_ITEMS = [
    { id: 'personalInfo', label: 'Informations Personnelles', icon: User, color: 'text-amber-500' },
    { id: 'summary', label: 'Résumé', icon: FileText, color: 'text-purple-500' },
    { id: 'experience', label: 'Expériences', icon: Briefcase, color: 'text-amber-600' },
    { id: 'competence', label: 'Compétences', icon: Code, color: 'text-purple-600' },
    { id: 'profession', label: 'Formation', icon: GraduationCap, color: 'text-amber-500' },
    { id: 'hobby', label: "Centres d'Intérêt", icon: Heart, color: 'text-purple-500' }
];

const PERSONAL_INFO_FIELDS = [
    { label: "Email", key: "email", icon: Mail },
    { label: "Téléphone", key: "phone", icon: Phone },
    { label: "Adresse", key: "address", icon: MapPin },
    { label: "LinkedIn", key: "linkedin", icon: Linkedin },
    { label: "GitHub", key: "github", icon: Github }
];

const PersonalInfoCard = ({ item, onEdit, updateCvInformation }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imageRef, setImageRef] = useState(null);
    const { toast } = useToast();

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Fichier trop volumineux",
                    description: "La taille maximum autorisée est de 5MB",
                    variant: "destructive"
                });
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => setUploadedImage(reader.result));
            reader.readAsDataURL(file);
            setIsOpen(true);
        }
    };

    const getCroppedImg = useCallback(() => {
        if (!imageRef || !completedCrop) return;

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imageRef,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    }, [imageRef, completedCrop]);

    const handleSave = async () => {
        try {
            setIsUploading(true);
            const croppedImage = await getCroppedImg();
            const formData = new FormData();
            //@ts-ignore
            formData.append('photo', croppedImage, 'profile.jpg');

            const response = await axios.post(route('personal-information.update-photo'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                updateCvInformation('personalInformation', {
                    ...item,
                    photo: response.data.photo_url
                });
                setIsOpen(false);
                toast({
                    title: "Succès",
                    description: "Photo mise à jour avec succès"
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Échec de la mise à jour de la photo",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const onImageLoad = (e) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Informations Personnelles</h2>
                <Button
                    onClick={onEdit}
                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white mt-4 md:mt-0"
                >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modifier
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 border-b pb-4">
                        <div className="relative h-20 w-20">
                            {item.photo ? (
                                <img
                                    src={item.photo}
                                    alt="Profile"
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10 flex items-center justify-center">
                                    <Camera className="h-8 w-8 text-amber-500" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={onSelectFile}
                                    disabled={isUploading}
                                />
                                <Upload className={`h-4 w-4 ${isUploading ? 'text-gray-400 animate-pulse' : 'text-amber-500'}`} />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {item.firstName}
                            </h3>
                            <p className="text-gray-500 text-lg">
                                {item.profession || 'Non spécifié'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {PERSONAL_INFO_FIELDS.map(({ label, key, icon: Icon }) => (
                            <div key={label} className="flex items-start gap-3">
                                <div className="mt-1">
                                    <Icon className="h-5 w-5 text-amber-500" />
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

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>Ajuster la photo</SheetTitle>
                        <SheetDescription>
                            Rognez votre photo pour l'adapter au format carré
                        </SheetDescription>
                    </SheetHeader>

                    <Separator className="my-4" />

                    <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
                        <div className="space-y-4">
                            {uploadedImage && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={c => setCrop(c)}
                                    onComplete={c => setCompletedCrop(c)}
                                    aspect={1}
                                    className="max-w-full"
                                >
                                    <img
                                        ref={setImageRef}
                                        src={uploadedImage}
                                        alt="Upload"
                                        className="max-w-full h-auto"
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="flex justify-end gap-2 mt-4 sticky bottom-0 bg-white pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!completedCrop || isUploading}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                        >
                            {isUploading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

// Remaining components stay the same
const ProgressIndicator = ({ percentage }) => (
    <div className="flex items-center gap-4">
        <div className="text-right">
            <p className="text-sm text-gray-500">Progression</p>
            <p className="text-xl font-bold text-amber-500">{percentage}%</p>
        </div>
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold">{percentage}%</span>
        </div>
    </div>
);

const SidebarButton = ({ item, isActive, isComplete, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-center md:justify-between p-2 md:p-3 rounded-lg transition-all ${
            isActive ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-lg' : 'hover:bg-amber-50'
        }`}
    >
        <div className="flex items-center gap-3">
            <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
            <span className="hidden md:block font-medium">{item.label}</span>
        </div>
        <div className="hidden md:flex items-center gap-2">
            {isComplete && <div className="w-2 h-2 rounded-full bg-green-400" />}
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
                className="flex items-center gap-2 w-full md:w-auto mb-2 md:mb-0 border-amber-200 hover:bg-amber-50"
            >
                <ChevronLeft className="w-4 h-4" />
                {prevSection.label}
            </Button>
        )}
        {nextSection && (
            <Button
                onClick={() => onNavigate(nextSection.id)}
                disabled={!canProgress}
                className="flex items-center gap-2 w-full md:w-auto ml-auto bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
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
    const { toast } = useToast();

    const updateCvInformation = useCallback((section, data) => {
        setCvInformation(prev => {
            const newState = { ...prev };

            // Gestion spéciale pour les résumés
            if (section === 'summaries') {
                newState.summaries = data;
                // Mettre à jour aussi allsummaries si nécessaire
                if (Array.isArray(data) && data.length > 0) {
                    const existingIds = new Set(newState.allsummaries.map(s => s.id));
                    data.forEach(summary => {
                        if (!existingIds.has(summary.id)) {
                            newState.allsummaries.push(summary);
                        } else {
                            // Mettre à jour le résumé existant dans allsummaries
                            const index = newState.allsummaries.findIndex(s => s.id === summary.id);
                            if (index !== -1) {
                                newState.allsummaries[index] = summary;
                            }
                        }
                    });
                }
            } else {
                newState[section] = Array.isArray(data) ? [...data] : { ...data };
            }

            return newState;
        });
    }, []);

    const completionStatus = {
        personalInfo: Boolean(cvInformation.personalInformation?.firstName),
        summary: cvInformation.summaries?.length > 0,
        experience: cvInformation.experiences?.length > 0,
        competence: cvInformation.competences?.length > 0,
        profession: Boolean(cvInformation.myProfession),
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
            title: "Mise à jour réussie",
            description: "Vos informations ont été enregistrées avec succès."
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
                    updateCvInformation={updateCvInformation}
                />
            ),
            summary: (
                <SummaryManager
                    auth={auth}
                    summaries={cvInformation.allsummaries}
                    selectedSummary={cvInformation.summaries}
                    onUpdate={(summaries) => {
                        updateCvInformation('summaries', summaries);
                    }}
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
        <AuthenticatedLayout user={auth.user}>
            <Head title="CV Professionnel" />

            <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-purple-50/50">
                <div className="container mx-auto py-6 px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-amber-500" />
                            <h2 className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                Mon CV Guidy
                            </h2>
                        </div>
                        <Link href={route('userCvModels.index')}>
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white">
                                <Star className="mr-2 h-4 w-4" />
                                Choisir un design
                                <CircleChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <Card className="shadow-xl border border-amber-100">
                        <CardHeader className="bg-white border-b border-amber-100">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                        Créez votre CV professionnel
                                    </CardTitle>
                                    <p className="text-gray-500 mt-1">
                                        Complétez votre profil pour un CV qui vous ressemble
                                    </p>
                                </div>
                                <ProgressIndicator percentage={getCompletionPercentage()} />
                            </div>

                            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-amber-500 to-purple-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getCompletionPercentage()}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </CardHeader>

                        <div className="flex flex-row min-h-[600px]">
                            <div className="w-14 md:w-64 flex-shrink-0 border-r border-amber-100 bg-white/50 transition-all duration-300">
                                <ScrollArea className="h-full py-2">
                                    <nav className="sticky top-0 p-2 md:p-4 space-y-1 md:space-y-3">
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
                                </ScrollArea>
                            </div>

                            <div className="flex-grow p-4 md:p-6 overflow-x-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
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

                    <div className="mt-8 text-center">
                        <Link href={route('userCvModels.index')}>
                            <Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white p-6 rounded-xl shadow-lg group">
                                <div className="flex flex-col items-center gap-2">
                                    <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                                    <span className="text-lg font-medium">Donnez vie à votre CV avec nos designs professionnels</span>
                                    <span className="text-sm opacity-90">Choisissez parmi nos modèles premium</span>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
