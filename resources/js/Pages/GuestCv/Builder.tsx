import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/Components/ui/use-toast';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Progress } from '@/Components/ui/progress';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    User, FileText, Briefcase, Code, GraduationCap, Heart,
    Globe, Download, Eye, CreditCard, Lock, Star, Plus,
    Trash2, Save, RefreshCw, AlertCircle, CheckCircle,
    ArrowRight, ArrowLeft, Menu, X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface GuestCvBuilderProps {
    availableCompetences: Array<{id: number; name: string; name_en: string; description: string}>;
    availableHobbies: Array<{id: number; name: string; name_en: string}>;
    availableProfessions: Array<{id: number; name: string; name_en: string; description: string}>;
    availableLanguages: Array<{id: number; name: string; name_en: string}>;
    experienceCategories: Array<{id: number; name: string; name_en: string; ranking: number}>;
    availableCvModels: Array<{id: number; name: string; description: string; previewImagePath: string; price: number}>;
    isGuest: boolean;
}

const STEPS = [
    { id: 'personal', label: 'Informations Personnelles', icon: User },
    { id: 'summary', label: 'Résumé Professionnel', icon: FileText },
    { id: 'experience', label: 'Expériences', icon: Briefcase },
    { id: 'competences', label: 'Compétences', icon: Code },
    { id: 'formation', label: 'Formation', icon: GraduationCap },
    { id: 'languages', label: 'Langues', icon: Globe },
    { id: 'hobbies', label: 'Centres d\'Intérêt', icon: Heart },
    { id: 'preview', label: 'Aperçu & Téléchargement', icon: Eye }
];

export default function GuestCvBuilder({ 
    availableCompetences, 
    availableHobbies, 
    availableProfessions,
    availableLanguages,
    experienceCategories,
    availableCvModels,
    isGuest 
}: GuestCvBuilderProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    
    // CSS pour scrollbar mobile
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            
            @media (max-width: 640px) {
                .cv-preview-zoom {
                    zoom: 0.25 !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedModel, setSelectedModel] = useState<number | null>(null);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [selectedModelData, setSelectedModelData] = useState<any>(null);
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    // État du CV guest stocké dans localStorage
    const [cvData, setCvData] = useState(() => {
        const saved = localStorage.getItem('guest_cv_data');
        return saved ? JSON.parse(saved) : {
            personalInformation: {
                firstName: '',
                email: '',
                phone: '',
                address: '',
                linkedin: '',
                github: '',
                profession: ''
            },
            summary: '',
            experiences: [],
            competences: [],
            formation: [],
            languages: [],
            hobbies: [],
            primaryColor: '#3498db'
        };
    });

    // Sauvegarder automatiquement dans localStorage
    useEffect(() => {
        localStorage.setItem('guest_cv_data', JSON.stringify(cvData));
    }, [cvData]);

    // Calculer le pourcentage de completion
    const getCompletionPercentage = useCallback(() => {
        let completed = 0;
        const total = 7;

        if (cvData.personalInformation.firstName && cvData.personalInformation.email) completed++;
        if (cvData.summary) completed++;
        if (cvData.experiences.length > 0) completed++;
        if (cvData.competences.length > 0) completed++;
        if (cvData.formation.length > 0) completed++;
        if (cvData.languages.length > 0) completed++;
        if (cvData.hobbies.length > 0) completed++;

        return Math.round((completed / total) * 100);
    }, [cvData]);

    // Générer l'aperçu
    const generatePreview = useCallback(async () => {
        if (!selectedModel) {
            setIsModelSelectorOpen(true);
            return;
        }

        setIsGeneratingPreview(true);
        try {
            const response = await fetch(route('guest-cv.preview'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    cvData: cvData,
                    modelId: selectedModel
                })
            });

            const result = await response.json();

            if (result.success) {
                setPreviewHtml(result.html);
                setSelectedModelData(result); // Sauvegarder les infos du modèle
                if (currentStep < STEPS.length - 1) {
                    setCurrentStep(STEPS.length - 1); // Aller à l'étape aperçu
                }
                
                // Afficher message pour modèle premium
                if (result.isPremium) {
                    toast({
                        title: "Modèle Premium",
                        description: `Ce modèle coûte ${result.price}€. Vous pouvez le prévisualiser gratuitement.`,
                        duration: 4000
                    });
                }
            } else {
                toast({
                    title: "Erreur",
                    description: result.message || "Impossible de générer l'aperçu",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Erreur de connexion lors de la génération de l'aperçu",
                variant: "destructive"
            });
        } finally {
            setIsGeneratingPreview(false);
        }
    }, [cvData, selectedModel, currentStep, toast]);

    // Ajouter une expérience
    const addExperience = () => {
        setCvData(prev => ({
            ...prev,
            experiences: [...prev.experiences, {
                id: Date.now(),
                name: '',
                InstitutionName: '',
                date_start: '',
                date_end: '',
                description: '',
                output: '',
                category_name: 'Professionnel',
                experience_categories_id: 1
            }]
        }));
    };

    // Supprimer une expérience
    const removeExperience = (id: number) => {
        setCvData(prev => ({
            ...prev,
            experiences: prev.experiences.filter(exp => exp.id !== id)
        }));
    };

    // Ajouter une compétence
    const addCompetence = (competenceName: string) => {
        if (!competenceName.trim()) return;
        
        setCvData(prev => ({
            ...prev,
            competences: [...prev.competences, {
                id: Date.now(),
                name: competenceName.trim(),
                name_en: competenceName.trim(),
                is_manual: true
            }]
        }));
    };

    // Télécharger PDF gratuit
    const handleFreePdfDownload = async () => {
        if (!selectedModel || !selectedModelData || selectedModelData.isPremium) return;
        
        setIsPaymentProcessing(true);
        try {
            const response = await fetch(route('guest-cv.generate-pdf'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    cvData: cvData,
                    modelId: selectedModel
                })
            });

            if (response.ok) {
                // Télécharger le fichier
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `${cvData.personalInformation.firstName || 'cv'}-gratuit.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                toast({
                    title: "Téléchargement réussi !",
                    description: "Votre CV a été téléchargé avec succès.",
                    duration: 3000
                });
            } else {
                const error = await response.json();
                toast({
                    title: "Erreur",
                    description: error.message || "Impossible de télécharger le PDF",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Erreur de connexion lors du téléchargement",
                variant: "destructive"
            });
        } finally {
            setIsPaymentProcessing(false);
        }
    };

    const currentStepData = STEPS[currentStep];
    const completionPercentage = getCompletionPercentage();

    return (
        <GuestLayout>
            <Head>
                <title>Créer mon CV gratuitement - Guidy</title>
                <meta name="description" content="Créez votre CV professionnel gratuitement sans inscription. Prévisualisez votre CV et téléchargez-le en PDF." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-purple-50/20">
                {/* Header moderne avec progression */}
                <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent">
                                            CV Builder
                                        </h1>
                                        <p className="text-xs text-gray-500 hidden sm:block">Créez votre CV professionnel</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                                        <Star className="w-3 h-3 mr-1" />
                                        <span className="hidden sm:inline">100% Gratuit</span>
                                        <span className="sm:hidden">Gratuit</span>
                                    </Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs hidden sm:inline-flex">
                                        Sans inscription
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <div className="text-xs sm:text-sm font-medium text-gray-700">
                                        Progression
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold text-amber-600">
                                        {completionPercentage}%
                                    </div>
                                </div>
                                <Progress 
                                    value={completionPercentage} 
                                    className="flex-1 sm:w-40 h-2" 
                                />
                            </div>
                        </div>

                        {/* Navigation des étapes */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = index === currentStep;
                                    const isCompleted = index < currentStep;
                                    
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => setCurrentStep(index)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                                isActive 
                                                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                                    : isCompleted
                                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{step.label}</span>
                                            {isCompleted && <CheckCircle className="w-3 h-3" />}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generatePreview}
                                    disabled={isGeneratingPreview || !selectedModel}
                                >
                                    {isGeneratingPreview ? (
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Eye className="w-4 h-4 mr-2" />
                                    )}
                                    Aperçu
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsModelSelectorOpen(true)}
                                >
                                    <Menu className="w-4 h-4 mr-2" />
                                    {selectedModel ? 'Changer modèle' : 'Choisir modèle'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Formulaire */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <currentStepData.icon className="w-5 h-5 text-amber-600" />
                                        {currentStepData.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Contenu des étapes sera rendu ici */}
                                    {currentStep === 0 && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <Label htmlFor="firstName">Prénom *</Label>
                                                    <Input
                                                        id="firstName"
                                                        value={cvData.personalInformation.firstName}
                                                        onChange={(e) => setCvData(prev => ({
                                                            ...prev,
                                                            personalInformation: {
                                                                ...prev.personalInformation,
                                                                firstName: e.target.value
                                                            }
                                                        }))}
                                                        placeholder="Votre prénom"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="email">Email *</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={cvData.personalInformation.email}
                                                        onChange={(e) => setCvData(prev => ({
                                                            ...prev,
                                                            personalInformation: {
                                                                ...prev.personalInformation,
                                                                email: e.target.value
                                                            }
                                                        }))}
                                                        placeholder="votre@email.com"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="profession">Profession</Label>
                                                <Input
                                                    id="profession"
                                                    value={cvData.personalInformation.profession}
                                                    onChange={(e) => setCvData(prev => ({
                                                        ...prev,
                                                        personalInformation: {
                                                            ...prev.personalInformation,
                                                            profession: e.target.value
                                                        }
                                                    }))}
                                                    placeholder="Ex: Développeur Web, Designer..."
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <Label htmlFor="phone">Téléphone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={cvData.personalInformation.phone}
                                                        onChange={(e) => setCvData(prev => ({
                                                            ...prev,
                                                            personalInformation: {
                                                                ...prev.personalInformation,
                                                                phone: e.target.value
                                                            }
                                                        }))}
                                                        placeholder="+33 6 12 34 56 78"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="address">Adresse</Label>
                                                    <Input
                                                        id="address"
                                                        value={cvData.personalInformation.address}
                                                        onChange={(e) => setCvData(prev => ({
                                                            ...prev,
                                                            personalInformation: {
                                                                ...prev.personalInformation,
                                                                address: e.target.value
                                                            }
                                                        }))}
                                                        placeholder="Ville, Pays"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                                    <Input
                                                        id="linkedin"
                                                        value={cvData.personalInformation.linkedin}
                                                        onChange={(e) => setCvData(prev => ({
                                                            ...prev,
                                                            personalInformation: {
                                                                ...prev.personalInformation,
                                                                linkedin: e.target.value
                                                            }
                                                        }))}
                                                        placeholder="https://linkedin.com/in/..."
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="github">GitHub</Label>
                                                    <Input
                                                        id="github"
                                                        value={cvData.personalInformation.github}
                                                        onChange={(e) => setCvData(prev => ({
                                                            ...prev,
                                                            personalInformation: {
                                                                ...prev.personalInformation,
                                                                github: e.target.value
                                                            }
                                                        }))}
                                                        placeholder="https://github.com/..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 1 && (
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="summary">Résumé professionnel</Label>
                                                <Textarea
                                                    id="summary"
                                                    value={cvData.summary}
                                                    onChange={(e) => setCvData(prev => ({
                                                        ...prev,
                                                        summary: e.target.value
                                                    }))}
                                                    placeholder="Décrivez votre profil professionnel en quelques lignes..."
                                                    rows={6}
                                                    maxLength={500}
                                                />
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {cvData.summary.length}/500 caractères
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Étape Expériences */}
                                    {currentStep === 2 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium">Expériences professionnelles</h3>
                                                <Button onClick={addExperience} size="sm" variant="outline">
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Ajouter
                                                </Button>
                                            </div>
                                            
                                            {cvData.experiences.map((exp, index) => (
                                                <div key={exp.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-sm">Expérience #{index + 1}</h4>
                                                        <Button 
                                                            onClick={() => removeExperience(exp.id)} 
                                                            size="sm" 
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <Label>Poste *</Label>
                                                            <Input
                                                                value={exp.name || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        experiences: prev.experiences.map(item => 
                                                                            item.id === exp.id ? { ...item, name: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                                placeholder="Ex: Développeur Web"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Entreprise *</Label>
                                                            <Input
                                                                value={exp.InstitutionName || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        experiences: prev.experiences.map(item => 
                                                                            item.id === exp.id ? { ...item, InstitutionName: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                                placeholder="Nom de l'entreprise"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Date de début</Label>
                                                            <Input
                                                                type="month"
                                                                value={exp.date_start || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        experiences: prev.experiences.map(item => 
                                                                            item.id === exp.id ? { ...item, date_start: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Date de fin</Label>
                                                            <Input
                                                                type="month"
                                                                value={exp.date_end || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        experiences: prev.experiences.map(item => 
                                                                            item.id === exp.id ? { ...item, date_end: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                                placeholder="Laisser vide si en cours"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <Label>Description</Label>
                                                        <Textarea
                                                            value={exp.description || ''}
                                                            onChange={(e) => {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    experiences: prev.experiences.map(item => 
                                                                        item.id === exp.id ? { ...item, description: e.target.value } : item
                                                                    )
                                                                }));
                                                            }}
                                                            placeholder="Décrivez vos missions et responsabilités..."
                                                            rows={3}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <Label>Réalisations (optionnel)</Label>
                                                        <Textarea
                                                            value={exp.output || ''}
                                                            onChange={(e) => {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    experiences: prev.experiences.map(item => 
                                                                        item.id === exp.id ? { ...item, output: e.target.value } : item
                                                                    )
                                                                }));
                                                            }}
                                                            placeholder="Vos réalisations, résultats obtenus..."
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {cvData.experiences.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>Aucune expérience ajoutée</p>
                                                    <Button onClick={addExperience} size="sm" className="mt-2">
                                                        Ajouter votre première expérience
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Étape Compétences */}
                                    {currentStep === 3 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium">Compétences</h3>
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="newSkill">Ajouter une compétence</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="newSkill"
                                                        placeholder="Ex: JavaScript, Gestion d'équipe, Photoshop..."
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const input = e.target as HTMLInputElement;
                                                                addCompetence(input.value);
                                                                input.value = '';
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        onClick={(e) => {
                                                            const input = document.getElementById('newSkill') as HTMLInputElement;
                                                            addCompetence(input.value);
                                                            input.value = '';
                                                        }}
                                                        size="sm"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {cvData.competences.map((comp, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {comp.name}
                                                        <button
                                                            onClick={() => {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    competences: prev.competences.filter((_, i) => i !== index)
                                                                }));
                                                            }}
                                                            className="ml-1 text-gray-500 hover:text-red-500"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            
                                            {cvData.competences.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>Aucune compétence ajoutée</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Étape Formation */}
                                    {currentStep === 4 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium">Formation & Éducation</h3>
                                                <Button 
                                                    onClick={() => {
                                                        setCvData(prev => ({
                                                            ...prev,
                                                            formation: [...prev.formation, {
                                                                id: Date.now(),
                                                                title: '',
                                                                institution: '',
                                                                date_start: '',
                                                                date_end: '',
                                                                description: ''
                                                            }]
                                                        }));
                                                    }}
                                                    size="sm" 
                                                    variant="outline"
                                                >
                                                    <Plus className="w-4 h-4 mr-1" />
                                                    Ajouter
                                                </Button>
                                            </div>
                                            
                                            {cvData.formation.map((edu, index) => (
                                                <div key={edu.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-sm">Formation #{index + 1}</h4>
                                                        <Button 
                                                            onClick={() => {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    formation: prev.formation.filter(item => item.id !== edu.id)
                                                                }));
                                                            }}
                                                            size="sm" 
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <Label>Diplôme/Formation *</Label>
                                                            <Input
                                                                value={edu.title || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        formation: prev.formation.map(item => 
                                                                            item.id === edu.id ? { ...item, title: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                                placeholder="Ex: Master en Informatique"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Établissement *</Label>
                                                            <Input
                                                                value={edu.institution || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        formation: prev.formation.map(item => 
                                                                            item.id === edu.id ? { ...item, institution: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                                placeholder="Nom de l'établissement"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Année de début</Label>
                                                            <Input
                                                                type="month"
                                                                value={edu.date_start || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        formation: prev.formation.map(item => 
                                                                            item.id === edu.id ? { ...item, date_start: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Année de fin</Label>
                                                            <Input
                                                                type="month"
                                                                value={edu.date_end || ''}
                                                                onChange={(e) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        formation: prev.formation.map(item => 
                                                                            item.id === edu.id ? { ...item, date_end: e.target.value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                                placeholder="Laisser vide si en cours"
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <Label>Description (optionnel)</Label>
                                                        <Textarea
                                                            value={edu.description || ''}
                                                            onChange={(e) => {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    formation: prev.formation.map(item => 
                                                                        item.id === edu.id ? { ...item, description: e.target.value } : item
                                                                    )
                                                                }));
                                                            }}
                                                            placeholder="Spécialité, mention, projets réalisés..."
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {cvData.formation.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>Aucune formation ajoutée</p>
                                                    <Button 
                                                        onClick={() => {
                                                            setCvData(prev => ({
                                                                ...prev,
                                                                formation: [{
                                                                    id: Date.now(),
                                                                    title: '',
                                                                    institution: '',
                                                                    date_start: '',
                                                                    date_end: '',
                                                                    description: ''
                                                                }]
                                                            }));
                                                        }}
                                                        size="sm" 
                                                        className="mt-2"
                                                    >
                                                        Ajouter votre première formation
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Étape Langues */}
                                    {currentStep === 5 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium">Langues</h3>
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="newLanguage">Ajouter une langue</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="newLanguage"
                                                        placeholder="Ex: Anglais, Espagnol, Allemand..."
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const input = e.target as HTMLInputElement;
                                                                const langName = input.value.trim();
                                                                if (langName) {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        languages: [...prev.languages, {
                                                                            id: Date.now(),
                                                                            name: langName,
                                                                            name_en: langName,
                                                                            level: 'Intermédiaire'
                                                                        }]
                                                                    }));
                                                                    input.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        onClick={(e) => {
                                                            const input = document.getElementById('newLanguage') as HTMLInputElement;
                                                            const langName = input.value.trim();
                                                            if (langName) {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    languages: [...prev.languages, {
                                                                        id: Date.now(),
                                                                        name: langName,
                                                                        name_en: langName,
                                                                        level: 'Intermédiaire'
                                                                    }]
                                                                }));
                                                                input.value = '';
                                                            }
                                                        }}
                                                        size="sm"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {cvData.languages.map((lang, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-sm">{lang.name}</div>
                                                            <Select 
                                                                value={lang.level || 'Intermédiaire'}
                                                                onValueChange={(value) => {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        languages: prev.languages.map((item, i) => 
                                                                            i === index ? { ...item, level: value } : item
                                                                        )
                                                                    }));
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Débutant">Débutant</SelectItem>
                                                                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                                                                    <SelectItem value="Avancé">Avancé</SelectItem>
                                                                    <SelectItem value="Courant">Courant</SelectItem>
                                                                    <SelectItem value="Natif">Natif</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button
                                                            onClick={() => {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    languages: prev.languages.filter((_, i) => i !== index)
                                                                }));
                                                            }}
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {cvData.languages.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Globe className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>Aucune langue ajoutée</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Étape Centres d'intérêt */}
                                    {currentStep === 6 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium">Centres d'intérêt</h3>
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="newHobby">Ajouter un centre d'intérêt</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="newHobby"
                                                        placeholder="Ex: Photographie, Sport, Lecture..."
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const input = e.target as HTMLInputElement;
                                                                const hobbyName = input.value.trim();
                                                                if (hobbyName) {
                                                                    setCvData(prev => ({
                                                                        ...prev,
                                                                        hobbies: [...prev.hobbies, {
                                                                            id: Date.now(),
                                                                            name: hobbyName,
                                                                            name_en: hobbyName
                                                                        }]
                                                                    }));
                                                                    input.value = '';
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        onClick={(e) => {
                                                            const input = document.getElementById('newHobby') as HTMLInputElement;
                                                            const hobbyName = input.value.trim();
                                                            if (hobbyName) {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    hobbies: [...prev.hobbies, {
                                                                        id: Date.now(),
                                                                        name: hobbyName,
                                                                        name_en: hobbyName
                                                                    }]
                                                                }));
                                                                input.value = '';
                                                            }
                                                        }}
                                                        size="sm"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                                {cvData.hobbies.map((hobby, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {hobby.name}
                                                        <button
                                                            onClick={() => {
                                                                setCvData(prev => ({
                                                                    ...prev,
                                                                    hobbies: prev.hobbies.filter((_, i) => i !== index)
                                                                }));
                                                            }}
                                                            className="ml-1 text-gray-500 hover:text-red-500"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            
                                            {cvData.hobbies.length === 0 && (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                    <p>Aucun centre d'intérêt ajouté</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Étape Aperçu final */}
                                    {currentStep === 7 && (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <Eye className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                                                <h3 className="text-xl font-bold mb-2">Votre CV est prêt !</h3>
                                                <p className="text-gray-600 mb-6">
                                                    Félicitations ! Vous avez terminé la création de votre CV.
                                                    Vous pouvez maintenant le prévisualiser et le télécharger.
                                                </p>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                                        <div className="font-medium text-green-800">Informations remplies</div>
                                                        <div className="text-green-600">{completionPercentage}% complet</div>
                                                    </div>
                                                    
                                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                                        <div className="font-medium text-blue-800">Modèle sélectionné</div>
                                                        <div className="text-blue-600">
                                                            {selectedModel ? availableCvModels.find(m => m.id === selectedModel)?.name : 'Aucun'}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {!selectedModel && (
                                                    <Alert className="mt-4">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <AlertDescription>
                                                            Veuillez sélectionner un modèle pour continuer.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    <div className="flex justify-between mt-6 pt-4 border-t gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                            disabled={currentStep === 0}
                                            className="flex-1 sm:flex-none"
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Précédent
                                        </Button>
                                        
                                        <Button
                                            onClick={() => {
                                                if (currentStep === STEPS.length - 1) {
                                                    generatePreview();
                                                } else {
                                                    setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1));
                                                }
                                            }}
                                            className="flex-1 sm:flex-none"
                                        >
                                            {currentStep === STEPS.length - 1 ? (
                                                <>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    <span className="hidden sm:inline">Générer aperçu</span>
                                                    <span className="sm:hidden">Aperçu</span>
                                                </>
                                            ) : (
                                                <>
                                                    Suivant
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alert inscription */}
                            {/* Info modèles gratuits vs premium */}
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <AlertDescription>
                                    <strong>Modèles gratuits disponibles !</strong> Certains modèles sont entièrement gratuits. 
                                    Les modèles premium offrent des designs plus avancés.
                                </AlertDescription>
                            </Alert>
                            
                            <Alert className="border-amber-200 bg-amber-50">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>
                                    <strong>Mode invité :</strong> Vos données sont sauvegardées localement. 
                                    <Link href={route('register')} className="text-amber-600 hover:text-amber-700 font-medium ml-1">
                                        Créez un compte
                                    </Link> pour sauvegarder définitivement.
                                </AlertDescription>
                            </Alert>
                        </div>

                        {/* Aperçu */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Eye className="w-5 h-5 text-purple-600" />
                                            Aperçu du CV
                                        </span>
                                        {selectedModel && (
                                            <Badge variant="outline">
                                                {availableCvModels.find(m => m.id === selectedModel)?.name}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 sm:p-4">
                                    {!selectedModel ? (
                                        <div className="text-center py-8 sm:py-12">
                                            <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-sm sm:text-base text-gray-600 mb-4">Choisissez un modèle pour voir l'aperçu</p>
                                            <Button onClick={() => setIsModelSelectorOpen(true)} size="sm">
                                                Choisir un modèle
                                            </Button>
                                        </div>
                                    ) : previewHtml ? (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div 
                                                className="w-full h-64 sm:h-96 overflow-y-auto bg-white cv-preview-zoom"
                                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                                                style={{ zoom: 0.5 }}
                                            />
                                            <div className="bg-gray-50 p-3 sm:p-4 border-t">
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                    <div className="text-xs sm:text-sm text-gray-600">
                                                        <div>Aperçu généré • Zoom 50%</div>
                                                        {selectedModelData?.isPremium && (
                                                            <div className="text-purple-600 font-medium mt-1">
                                                                Modèle Premium - {selectedModelData.price}€
                                                            </div>
                                                        )}
                                                    </div>
                                                    {selectedModelData?.isPremium ? (
                                                        <Button 
                                                            onClick={() => setShowPaymentDialog(true)}
                                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-full sm:w-auto"
                                                            size="sm"
                                                        >
                                                            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                                            <span className="text-xs sm:text-sm">PDF - {selectedModelData.price}€</span>
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            onClick={handleFreePdfDownload}
                                                            disabled={isPaymentProcessing}
                                                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-full sm:w-auto"
                                                            size="sm"
                                                        >
                                                            {isPaymentProcessing ? (
                                                                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                                            )}
                                                            <span className="text-xs sm:text-sm">PDF Gratuit</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 sm:py-12">
                                            <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-sm sm:text-base text-gray-600 mb-4">Cliquez sur "Aperçu" pour générer votre CV</p>
                                            <Button onClick={generatePreview} disabled={isGeneratingPreview} size="sm">
                                                {isGeneratingPreview ? 'Génération...' : 'Générer l\'aperçu'}
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Dialog sélection de modèle */}
                <Dialog open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
                    <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto" aria-describedby="model-selector-description">
                        <DialogHeader>
                            <DialogTitle>Choisir un modèle de CV</DialogTitle>
                            <p id="model-selector-description" className="text-sm text-gray-600 mt-2">
                                Sélectionnez un modèle pour votre CV. Les modèles gratuits peuvent être téléchargés immédiatement.
                            </p>
                        </DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
                            {availableCvModels.map((model) => (
                                <motion.div
                                    key={model.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                        selectedModel === model.id 
                                            ? 'border-amber-500 bg-amber-50 shadow-md' 
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        setIsModelSelectorOpen(false);
                                        // Régénérer l'aperçu automatiquement
                                        setTimeout(generatePreview, 100);
                                    }}
                                >
                                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden relative">
                                        <img 
                                            src={model.previewImagePath || `/images/cv-previews/${model.name.toLowerCase()}.png`} 
                                            alt={`Aperçu ${model.name}`}
                                            className="w-full h-full object-cover rounded transition-opacity duration-300"
                                            onError={(e) => {
                                                // Fallback vers notre SVG généré
                                                const target = e.currentTarget as HTMLImageElement;
                                                if (!target.src.includes('/images/cv-previews/')) {
                                                    target.src = `/images/cv-previews/${model.name.toLowerCase()}.png`;
                                                }
                                            }}
                                            onLoad={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.opacity = '1';
                                            }}
                                            style={{ opacity: 0 }}
                                        />
                                        
                                        {/* Overlay avec nom du modèle */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                                            <div className="p-3 text-white w-full">
                                                <div className="text-sm font-medium">{model.name}</div>
                                                {model.price > 0 && (
                                                    <div className="text-xs opacity-90 flex items-center mt-1">
                                                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                                        Premium - {model.price}€
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {selectedModel === model.id && (
                                            <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1">
                                                <CheckCircle className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-sm mb-1">{model.name}</h3>
                                    <p className="text-xs text-gray-600 line-clamp-2">{model.description}</p>
                                    <div className="mt-2 flex gap-2">
                                        {model.price === 0 ? (
                                            <Badge className="bg-green-100 text-green-800">Gratuit</Badge>
                                        ) : (
                                            <Badge className="bg-purple-100 text-purple-800">
                                                Premium - {model.price}€
                                            </Badge>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog paiement */}
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogContent aria-describedby="payment-dialog-description">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Télécharger votre CV
                            </DialogTitle>
                            <p id="payment-dialog-description" className="text-sm text-gray-600 mt-2">
                                Ce modèle premium nécessite un paiement unique pour le téléchargement.
                            </p>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock className="w-4 h-4 text-purple-600" />
                                    <span className="font-medium text-purple-800">Modèle Premium</span>
                                </div>
                                <p className="text-sm text-purple-700">
                                    Téléchargez votre CV avec ce modèle premium en PDF haute qualité.
                                    Paiement unique, aucun abonnement.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">{selectedModelData?.price || 5},00 €</div>
                                <div className="text-sm text-gray-600">Téléchargement PDF • {selectedModelData?.modelName || 'Modèle Premium'}</div>
                            </div>

                            <div className="space-y-3">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Payer avec CinetPay
                                </Button>
                                <Button variant="outline" className="w-full">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Payer avec PayPal
                                </Button>
                            </div>

                            <div className="text-center text-sm text-gray-500 pt-4 border-t">
                                <p>Ou <Link href={route('register')} className="text-amber-600 hover:text-amber-700 font-medium">créez un compte gratuit</Link> pour sauvegarder et télécharger vos CV</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </GuestLayout>
    );
}