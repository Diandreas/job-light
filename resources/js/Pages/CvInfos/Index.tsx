import React, { useState, useCallback } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    User, FileText, Briefcase, Code, GraduationCap, Heart,
    ChevronRight, ChevronLeft, Mail, Phone, MapPin, Linkedin,
    Github, PencilIcon, Sparkles, CircleChevronRight, Star,
    Camera, Upload, FileUp, Bot, AlertCircle, X, Plus, Menu, Coins
} from 'lucide-react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import { Progress } from "@/Components/ui/progress";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Separator } from "@/Components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

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

const WelcomeCard = ({ percentage, onImport }) => {
    const { t } = useTranslation();

    return (
        <Card className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-none mb-4 md:mb-6">
            <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    <div className="space-y-2 w-full md:w-auto">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                            {t('cv.interface.welcome.title')}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                            {t('cv.interface.welcome.subtitle')}
                        </p>
                        <div className="flex items-center gap-4">
                            <Progress value={percentage} className="w-32"/>
                            <span className="text-sm font-medium">
                                {percentage}% {t('cv.interface.welcome.complete')}
                            </span>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/50">
                                <FileUp className="w-4 h-4 mr-2" />
                                {t('cv.interface.import.button')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onImport('pdf')} className="cursor-pointer">
                                <FileText className="w-4 h-4 mr-2" />
                                {t('cv.interface.import.pdf')}( - 5 <Coins/>)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onImport('docx')} className="cursor-pointer">
                                <FileText className="w-4 h-4 mr-2" />
                                {t('cv.interface.import.word')}( - 5 <Coins/>)
                            </DropdownMenuItem>
                            {/*<DropdownMenuItem onClick={() => onImport('ai')} className="cursor-pointer">*/}
                            {/*    <Bot className="w-4 h-4 mr-2" />*/}
                            {/*    {t('cv.interface.import.ai')}*/}
                            {/*</DropdownMenuItem>*/}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

const PersonalInfoCard = ({ item, onEdit, updateCvInformation }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imageRef, setImageRef] = useState(null);
    const { toast } = useToast();
    const { t } = useTranslation();

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: t('cv.interface.personal.photo.sizeError.title'),
                    description: t('cv.interface.personal.photo.sizeError.description'),
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
                    title: t('cv.interface.personal.photo.success.title'),
                    description: t('cv.interface.personal.photo.success.description')
                });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: t('cv.interface.personal.photo.error.title'),
                description: error.response?.data?.message || t('cv.interface.personal.photo.error.description'),
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
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                    {t('cv.interface.personal.title')}
                </h2>
                <Button
                    onClick={onEdit}
                    className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 text-white"
                >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    {t('cv.interface.personal.edit')}
                </Button>
            </div>

            <Card>
                <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                    <div className="flex flex-col md:flex-row items-center gap-4 border-b border-amber-100 dark:border-amber-800 pb-4">
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
                            <label className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg cursor-pointer">
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
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white text-center md:text-left">
                                {item.firstName}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg text-center md:text-left">
                                {item.profession || t('cv.interface.personal.fields.notSpecified')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {PERSONAL_INFO_FIELDS.map(({ label, key, icon: Icon }) => (
                            <div key={label} className="flex items-start gap-3">
                                <div className="mt-1">
                                    <Icon className="h-5 w-5 text-amber-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        {t(`cv.interface.personal.fields.${key}`)}
                                    </p>
                                    <p className="text-gray-900 dark:text-white font-medium break-all">
                                        {item[key] || t('cv.interface.personal.fields.notSpecified')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl">
                    <SheetHeader>
                        <SheetTitle>{t('cv.interface.personal.photo.crop')}</SheetTitle>
                        <SheetDescription>
                            {t('cv.interface.personal.photo.cropDescription')}
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
                                </ReactCrop>)}
                        </div>
                    </ScrollArea>

                    <div className="flex justify-end gap-2 mt-4 sticky bottom-0 bg-white dark:bg-gray-900 pt-4 border-t border-amber-100 dark:border-amber-800">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            {t('cv.interface.personal.photo.cancel')}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!completedCrop || isUploading}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400"
                        >
                            {isUploading ? t('cv.interface.personal.photo.saving') : t('cv.interface.personal.photo.save')}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

const SidebarButton = ({ item, isActive, isComplete, onClick, isMobile }) => {
    const activeClass = "bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-white shadow-lg";
    const inactiveClass = "hover:bg-amber-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200";

    return (
        <motion.button
            onClick={onClick}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${isActive ? activeClass : inactiveClass} ${isMobile ? 'w-12' : 'w-full'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3">
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : item.color}`} />
                {!isMobile && <span className="font-medium">{item.label}</span>}
            </div>
            {!isMobile && (
                <div className="flex items-center gap-2">
                    {isComplete && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-green-400"
                        />
                    )}
                    <ChevronRight className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
            )}
        </motion.button>
    );
}
const SectionNavigation = ({ currentSection, nextSection, prevSection, canProgress, onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-amber-100 dark:border-amber-800">
            {prevSection && (
                <Button
                    variant="outline"
                    onClick={() => onNavigate(prevSection.id)}
                    className="w-full md:w-auto flex items-center gap-2 border-amber-200 dark:border-amber-800"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {prevSection.label}
                </Button>
            )}
            {nextSection && (
                <Button
                    onClick={() => onNavigate(nextSection.id)}
                    disabled={!canProgress}
                    className="w-full md:w-auto flex items-center gap-2 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 text-white"
                >
                    {nextSection.label}
                    <ChevronRight className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
};

export default function CvInterface({ auth, cvInformation: initialCvInformation }) {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('personalInfo');
    const [cvInformation, setCvInformation] = useState(initialCvInformation);
    const [isEditing, setIsEditing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { toast } = useToast();

    const updateCvInformation = useCallback((section, data) => {
        setCvInformation(prev => {
            const newState = { ...prev };
            if (section === 'summaries') {
                newState.summaries = data;
                if (Array.isArray(data) && data.length > 0) {
                    const existingIds = new Set(newState.allsummaries.map(s => s.id));
                    data.forEach(summary => {
                        if (!existingIds.has(summary.id)) {
                            newState.allsummaries.push(summary);
                        } else {
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
            title: t('cv.interface.update.success'),
            description: t('cv.interface.update.successDetail')
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

    const handleImport = async (type) => {
        if (type === 'ai' && auth.user.wallet_balance < 5) {
            toast({
                title: t('cv.interface.import.error'),
                description: t('cv.interface.import.insufficient'),
                variant: "destructive"
            });
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'pdf' ? '.pdf' : '.docx';

        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                setIsImporting(true);
                const formData = new FormData();
                formData.append('cv', file);

                const response = await axios.post(
                    type === 'ai' ? '/api/analyze-cv' : '/api/import-cv',
                    formData
                );

                if (response.data.success) {
                    updateCvInformation(response.data.cvData);
                    toast({
                        title: t('cv.interface.import.success'),
                        description: t('cv.interface.import.successDetail')
                    });
                }
            } catch (error) {
                toast({
                    title: t('cv.interface.import.error'),
                    description: error.response?.data?.message || t('cv.interface.import.errorDetail'),
                    variant: "destructive"
                });
            } finally {
                setIsImporting(false);
            }
        };

        input.click();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('cv.interface.title')} />

            <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto py-4 px-4 md:py-6">
                    {/* Header with improved mobile layout */}
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-amber-500 dark:text-amber-400" />
                            <h2 className="font-bold text-xl md:text-2xl bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                {t('cv.interface.title')}
                            </h2>
                        </div>
                        <Link href={route('userCvModels.index')}>
                            <Button className="hidden md:flex bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 text-white">
                                <Star className="mr-2 h-4 w-4" />
                                {t('cv.interface.chooseDesign')}
                                <CircleChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <WelcomeCard
                        percentage={getCompletionPercentage()}
                        onImport={handleImport}
                    />

                    <Card className="shadow-xl border border-amber-100 dark:border-amber-800">
                        <CardHeader className="bg-white dark:bg-gray-900 border-b border-amber-100 dark:border-amber-800 p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                        {t('cv.interface.sections.title')}
                                    </CardTitle>
                                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
                                        {t('cv.interface.sections.description')}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="flex flex-row min-h-[600px]">
                            {/* Sidebar Desktop */}
                            <div className="hidden md:block w-64 flex-shrink-0 border-r border-amber-100 dark:border-amber-800 bg-white/50 dark:bg-gray-900/50">
                                <ScrollArea className="h-full py-2">
                                    <nav className="sticky top-0 p-4 space-y-3">
                                        {SIDEBAR_ITEMS.map(item => (
                                            <SidebarButton
                                                key={item.id}
                                                item={item}
                                                isActive={activeSection === item.id}
                                                isComplete={completionStatus[item.id]}
                                                onClick={() => setActiveSection(item.id)}
                                                isMobile={false}
                                            />
                                        ))}
                                    </nav>
                                </ScrollArea>
                            </div>

                            {/* Sidebar Mobile (Icon Only) */}
                            <div className="md:hidden w-14 flex-shrink-0 border-r border-amber-100 dark:border-amber-800 bg-white/50 dark:bg-gray-900/50">
                                <ScrollArea className="h-full py-2">
                                    <nav className="sticky top-0 p-2 space-y-2">
                                        {SIDEBAR_ITEMS.map(item => (
                                            <SidebarButton
                                                key={item.id}
                                                item={item}
                                                isActive={activeSection === item.id}
                                                isComplete={completionStatus[item.id]}
                                                onClick={() => setActiveSection(item.id)}
                                                isMobile={true}
                                            />
                                        ))}
                                    </nav>
                                </ScrollArea>
                            </div>

                            {/* Main content */}
                            <div className="flex-grow p-4 md:p-6 overflow-x-hidden bg-white dark:bg-gray-900">
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

                    {/* Call-to-action with improved mobile responsiveness */}
                    <div className="mt-6 md:mt-8 text-center">
                        <Link href={route('userCvModels.index')}>
                            <Button className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 text-white p-4 md:p-6 rounded-xl shadow-lg group">
                                <div className="flex flex-col items-center gap-2">
                                    <Sparkles className="h-5 w-5 md:h-6 md:w-6 group-hover:animate-spin" />
                                    <span className="text-base md:text-lg font-medium">
                                        {t('cv.interface.cta.title')}
                                    </span>
                                    <span className="text-xs md:text-sm opacity-90">
                                        {t('cv.interface.cta.subtitle')}
                                    </span>
                                </div>
                            </Button>
                        </Link>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
);
}
