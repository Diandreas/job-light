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
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedModel, setSelectedModel] = useState<number | null>(null);
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

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
                if (currentStep < STEPS.length - 1) {
                    setCurrentStep(STEPS.length - 1); // Aller à l'étape aperçu
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

    const currentStepData = STEPS[currentStep];
    const completionPercentage = getCompletionPercentage();

    return (
        <GuestLayout>
            <Head>
                <title>Créer mon CV gratuitement - Guidy</title>
                <meta name="description" content="Créez votre CV professionnel gratuitement sans inscription. Prévisualisez votre CV et téléchargez-le en PDF." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
                {/* Header avec progression */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-purple-600 bg-clip-text text-transparent">
                                    Créateur de CV Gratuit
                                </h1>
                                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                                    <Star className="w-3 h-3 mr-1" />
                                    Sans inscription
                                </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    Progression: {completionPercentage}%
                                </div>
                                <Progress value={completionPercentage} className="w-32" />
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

                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                />
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {cvData.summary.length}/500 caractères
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation */}
                                    <div className="flex justify-between mt-6 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                            disabled={currentStep === 0}
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
                                        >
                                            {currentStep === STEPS.length - 1 ? (
                                                <>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Générer aperçu
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
                                <CardContent>
                                    {!selectedModel ? (
                                        <div className="text-center py-12">
                                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-4">Choisissez un modèle pour voir l'aperçu</p>
                                            <Button onClick={() => setIsModelSelectorOpen(true)}>
                                                Choisir un modèle
                                            </Button>
                                        </div>
                                    ) : previewHtml ? (
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div 
                                                className="w-full h-96 overflow-y-auto bg-white"
                                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                                                style={{ zoom: 0.5 }}
                                            />
                                            <div className="bg-gray-50 p-4 border-t">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-sm text-gray-600">
                                                        Aperçu généré • Zoom 50%
                                                    </div>
                                                    <Button 
                                                        onClick={() => setShowPaymentDialog(true)}
                                                        className="bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Télécharger PDF - 5€
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-600 mb-4">Cliquez sur "Aperçu" pour générer votre CV</p>
                                            <Button onClick={generatePreview} disabled={isGeneratingPreview}>
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
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Choisir un modèle de CV</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {availableCvModels.map((model) => (
                                <motion.div
                                    key={model.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                        selectedModel === model.id 
                                            ? 'border-amber-500 bg-amber-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        setIsModelSelectorOpen(false);
                                        // Régénérer l'aperçu automatiquement
                                        setTimeout(generatePreview, 100);
                                    }}
                                >
                                    <div className="aspect-[3/4] bg-gray-100 rounded mb-3 flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="font-medium text-sm mb-1">{model.name}</h3>
                                    <p className="text-xs text-gray-600 line-clamp-2">{model.description}</p>
                                    {model.price === 0 && (
                                        <Badge className="mt-2 bg-green-100 text-green-800">Gratuit</Badge>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog paiement */}
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Télécharger votre CV
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lock className="w-4 h-4 text-amber-600" />
                                    <span className="font-medium text-amber-800">Paiement unique</span>
                                </div>
                                <p className="text-sm text-amber-700">
                                    Téléchargez votre CV professionnel en PDF haute qualité pour seulement 5€.
                                    Aucun abonnement, paiement unique.
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-800 mb-2">5,00 €</div>
                                <div className="text-sm text-gray-600">Téléchargement PDF + Accès 24h</div>
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