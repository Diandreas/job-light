import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    FileText, Upload, Sparkles, Target, Building,
    MapPin, Calendar, DollarSign, CheckCircle, AlertCircle,
    Lightbulb, Zap, Star, TrendingUp, Users, Loader2
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Components/ui/tabs';

interface CoverLetterGeneratorProps {
    onSubmit: (data: CoverLetterData) => void;
    userInfo: any;
    isLoading: boolean;
}

interface CoverLetterData {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    companyInfo: string;
    motivations: string[];
    tone: string;
    length: string;
    keyPoints: string[];
    callToAction: string;
    inputMethod: 'manual' | 'paste' | 'url';
}

// Constants will be defined in component with translations

export default function CoverLetterGenerator({ onSubmit, userInfo, isLoading }: CoverLetterGeneratorProps) {
    const { t } = useTranslation();

    // Translated constants
    const TONES = [
        {
            value: 'professional',
            label: t('cover_letter_generator.tones.professional.label') || 'Professionnel',
            description: t('cover_letter_generator.tones.professional.description') || 'Formel et respectueux'
        },
        {
            value: 'enthusiastic',
            label: t('cover_letter_generator.tones.enthusiastic.label') || 'Enthousiaste',
            description: t('cover_letter_generator.tones.enthusiastic.description') || 'Dynamique et motivé'
        },
        {
            value: 'confident',
            label: t('cover_letter_generator.tones.confident.label') || 'Confiant',
            description: t('cover_letter_generator.tones.confident.description') || 'Assertif et déterminé'
        },
        {
            value: 'creative',
            label: t('cover_letter_generator.tones.creative.label') || 'Créatif',
            description: t('cover_letter_generator.tones.creative.description') || 'Original et innovant'
        }
    ];

    const LENGTHS = [
        {
            value: 'short',
            label: t('cover_letter_generator.lengths.short.label') || 'Courte',
            description: t('cover_letter_generator.lengths.short.description') || '200-300 mots'
        },
        {
            value: 'medium',
            label: t('cover_letter_generator.lengths.medium.label') || 'Standard',
            description: t('cover_letter_generator.lengths.medium.description') || '300-400 mots'
        },
        {
            value: 'long',
            label: t('cover_letter_generator.lengths.long.label') || 'Détaillée',
            description: t('cover_letter_generator.lengths.long.description') || '400-500 mots'
        }
    ];

    const COMMON_MOTIVATIONS = [
        t('cover_letter_generator.motivations.company_mission') || 'Mission de l\'entreprise',
        t('cover_letter_generator.motivations.growth_opportunities') || 'Opportunités d\'évolution',
        t('cover_letter_generator.motivations.team_culture') || 'Équipe et culture',
        t('cover_letter_generator.motivations.innovative_projects') || 'Projets innovants',
        t('cover_letter_generator.motivations.technical_challenges') || 'Défis techniques',
        t('cover_letter_generator.motivations.social_impact') || 'Impact social',
        t('cover_letter_generator.motivations.learning') || 'Apprentissage',
        t('cover_letter_generator.motivations.company_reputation') || 'Réputation de l\'entreprise',
        t('cover_letter_generator.motivations.shared_values') || 'Valeurs partagées',
        t('cover_letter_generator.motivations.sector_growth') || 'Croissance du secteur'
    ];

    const [formData, setFormData] = useState<CoverLetterData>({
        jobTitle: '',
        companyName: '',
        jobDescription: '',
        companyInfo: '',
        motivations: [],
        tone: 'professional',
        length: 'medium',
        keyPoints: [],
        callToAction: 'standard',
        inputMethod: 'manual'
    });

    const [atsScore, setAtsScore] = useState<number | null>(null);
    const [keywordsExtracted, setKeywordsExtracted] = useState<string[]>([]);

    // Analyser l'offre d'emploi pour extraire les mots-clés
    const analyzeJobPosting = () => {
        if (!formData.jobDescription) return;

        // Simulation d'analyse ATS (à remplacer par vraie logique)
        const text = formData.jobDescription.toLowerCase();
        const commonKeywords = [
            'expérience', 'compétences', 'responsabilités', 'équipe',
            'projet', 'développement', 'gestion', 'communication'
        ];

        const found = commonKeywords.filter(keyword =>
            text.includes(keyword)
        );

        setKeywordsExtracted(found);
        setAtsScore(Math.min(95, 60 + (found.length * 5)));
    };

    useEffect(() => {
        if (formData.jobDescription.length > 100) {
            const timer = setTimeout(analyzeJobPosting, 1000);
            return () => clearTimeout(timer);
        }
    }, [formData.jobDescription]);

    const handleSubmit = () => {
        const prompt = generateCoverLetterPrompt(formData);
        // @ts-ignore
        onSubmit({ ...formData, prompt });
    };

    const generateCoverLetterPrompt = (data: CoverLetterData) => {
        return `Je souhaite créer une lettre de motivation personnalisée pour :

**Poste :** ${data.jobTitle}
**Entreprise :** ${data.companyName}

**Description du poste :**
${data.jobDescription}

**Informations sur l'entreprise :**
${data.companyInfo}

**Mes motivations principales :** ${data.motivations.join(', ')}
**Ton souhaité :** ${data.tone}
**Longueur :** ${data.length}
**Points clés à mettre en avant :** ${data.keyPoints.join(', ')}

**Contexte personnel :**
- Nom : ${userInfo?.name}
- Profession actuelle : ${userInfo?.profession}
- Expériences clés : ${userInfo?.experiences?.slice(0, 2).map(exp => exp.title).join(', ')}

Créez une lettre de motivation personnalisée qui met en valeur mon profil pour ce poste spécifique.`;
    };

    const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item));
        } else {
            setter([...array, item]);
        }
    };

    const isFormValid = () => {
        return formData.jobTitle.length > 0 &&
            formData.companyName.length > 0 &&
            formData.jobDescription.length > 50;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            {/* Score ATS si disponible */}
            {atsScore && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center"
                >
                    <Badge
                        variant="outline"
                        className={`${atsScore >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                            atsScore >= 60 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                'bg-red-50 text-red-700 border-red-200'}`}
                    >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Score ATS: {atsScore}%
                    </Badge>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulaire principal */}
                <div className="lg:col-span-2 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Informations sur le Poste
                                    </h3>
                                </div>
                            <Tabs value={formData.inputMethod} onValueChange={(value) =>
                                setFormData(prev => ({ ...prev, inputMethod: value as 'manual' | 'paste' | 'url' }))
                            }>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="manual">Saisie manuelle</TabsTrigger>
                                    <TabsTrigger value="paste">Coller l'annonce</TabsTrigger>
                                    <TabsTrigger value="url">URL de l'offre</TabsTrigger>
                                </TabsList>

                                <TabsContent value="manual" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="jobTitle">Intitulé du poste *</Label>
                                            <Input
                                                id="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    jobTitle: e.target.value
                                                }))}
                                                placeholder="Ex: Développeur Full-Stack Senior"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                                            <Input
                                                id="companyName"
                                                value={formData.companyName}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    companyName: e.target.value
                                                }))}
                                                placeholder="Ex: TechCorp"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="jobDescription">Description du poste *</Label>
                                        <Textarea
                                            id="jobDescription"
                                            value={formData.jobDescription}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                jobDescription: e.target.value
                                            }))}
                                            placeholder="Collez ici la description complète du poste..."
                                            rows={6}
                                            className="resize-none"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formData.jobDescription.length}/2000 caractères
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="paste" className="space-y-4 mt-4">
                                    <div>
                                        <Label htmlFor="fullJobPosting">Annonce complète</Label>
                                        <Textarea
                                            id="fullJobPosting"
                                            placeholder="Collez ici l'annonce d'emploi complète (titre + entreprise + description)..."
                                            rows={8}
                                            className="resize-none"
                                        />
                                        <Button variant="outline" size="sm" className="mt-2">
                                            <Zap className="w-4 h-4 mr-2" />
                                            Analyser automatiquement
                                        </Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="url" className="space-y-4 mt-4">
                                    <div>
                                        <Label htmlFor="jobUrl">URL de l'offre d'emploi</Label>
                                        <Input
                                            id="jobUrl"
                                            placeholder="https://exemple.com/jobs/123"
                                            type="url"
                                        />
                                        <Button variant="outline" size="sm" className="mt-2">
                                            <Upload className="w-4 h-4 mr-2" />
                                            Importer l'offre
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Personnalisation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Personnalisation
                                    </h3>
                                </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Ton de la lettre</Label>
                                    <Select
                                        value={formData.tone}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TONES.map(tone => (
                                                <SelectItem key={tone.value} value={tone.value}>
                                                    <div>
                                                        <div className="font-medium">{tone.label}</div>
                                                        <div className="text-xs text-gray-500">{tone.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Longueur souhaitée</Label>
                                    <Select
                                        value={formData.length}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, length: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LENGTHS.map(length => (
                                                <SelectItem key={length.value} value={length.value}>
                                                    <div>
                                                        <div className="font-medium">{length.label}</div>
                                                        <div className="text-xs text-gray-500">{length.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label>Vos motivations principales (sélectionnez 2-3)</Label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                    {COMMON_MOTIVATIONS.map(motivation => (
                                        <button
                                            key={motivation}
                                            type="button"
                                            onClick={() => toggleArrayItem(
                                                formData.motivations,
                                                motivation,
                                                (items) => setFormData(prev => ({ ...prev, motivations: items }))
                                            )}
                                            className={`p-2 text-xs rounded-lg border transition-all ${formData.motivations.includes(motivation)
                                                    ? 'bg-green-100 border-green-300 text-green-700'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50'
                                                }`}
                                        >
                                            {motivation}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Panneau latéral modernisé */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {/* Score ATS */}
                    {atsScore && (
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                            <CardContent className="p-4">
                                <div className="text-center mb-4">
                                    <div className={`text-3xl font-bold ${atsScore >= 80 ? 'text-green-600' :
                                            atsScore >= 60 ? 'text-orange-600' : 'text-red-600'
                                        }`}>
                                        {atsScore}%
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        Compatibilité ATS
                                    </div>
                                </div>

                                {keywordsExtracted.length > 0 && (
                                    <div>
                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Mots-clés détectés :
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {keywordsExtracted.map(keyword => (
                                                <Badge key={keyword} variant="secondary" className="text-xs">
                                                    {keyword}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Conseils personnalisés */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                                    <Lightbulb className="w-3 h-3 text-white" />
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                    Conseils IA
                                </h4>
                            </div>
                            <div className="text-xs space-y-2">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Mentionnez vos {userInfo?.experiences?.length || 0} expériences</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Mettez en avant vos compétences en {userInfo?.competences?.[0]?.name}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Adaptez le ton à la culture d'entreprise</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Aperçu des points clés */}
                    {formData.keyPoints.length > 0 && (
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-6 h-6 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Star className="w-3 h-3 text-white" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                        Points Clés
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    {formData.keyPoints.map((point, index) => (
                                        <div key={index} className="text-xs flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>

            {/* Bouton de génération modernisé */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center pt-6"
            >
                <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isLoading}
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 shadow-lg hover:shadow-xl disabled:opacity-50 transition-all px-8 py-3 rounded-xl font-medium"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Génération en cours...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Générer ma lettre de motivation
                        </>
                    )}
                </Button>
                {!isFormValid() && (
                    <p className="text-xs text-gray-500 mt-2">
                        Veuillez remplir tous les champs obligatoires
                    </p>
                )}
            </motion.div>
        </div>
    );
}