import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    MessageSquare, Clock, Users, Target, Brain, Mic,
    Play, Pause, RotateCcw, Star, Award, AlertCircle,
    CheckCircle, TrendingUp, Zap, Calendar, Building,
    User, FileText, Lightbulb, Timer
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface InterviewSimulatorProps {
    onSubmit: (data: InterviewData) => void;
    userInfo: any;
    isLoading: boolean;
}

interface InterviewData {
    jobTitle: string;
    companyName: string;
    interviewType: string;
    duration: string;
    difficulty: string;
    focusAreas: string[];
    preparationLevel: string;
    specificConcerns: string[];
    interviewFormat: string;
    companySize: string;
}

const INTERVIEW_TYPES = [
    { value: 'hr', label: 'Entretien RH', description: 'Motivation, culture, fit' },
    { value: 'technical', label: 'Entretien Technique', description: 'Compétences spécialisées' },
    { value: 'behavioral', label: 'Entretien Comportemental', description: 'Situations passées, STAR' },
    { value: 'case-study', label: 'Étude de Cas', description: 'Résolution de problèmes' },
    { value: 'panel', label: 'Entretien Panel', description: 'Plusieurs intervieweurs' },
    { value: 'final', label: 'Entretien Final', description: 'Direction, négociation' }
];

const FOCUS_AREAS = [
    'Présentation personnelle', 'Motivation pour le poste', 'Expériences passées',
    'Compétences techniques', 'Gestion d\'équipe', 'Résolution de problèmes',
    'Questions sur l\'entreprise', 'Négociation salariale', 'Questions difficiles',
    'Projets et réalisations', 'Points faibles', 'Vision de carrière'
];

const COMMON_CONCERNS = [
    'Stress et gestion du stress', 'Manque d\'expérience', 'Changement de secteur',
    'Période d\'inactivité', 'Échec professionnel', 'Prétentions salariales',
    'Questions pièges', 'Timidité', 'Surqualification', 'Langue étrangère'
];

const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Débutant', description: 'Questions standard', color: 'green' },
    { value: 'medium', label: 'Intermédiaire', description: 'Questions approfondies', color: 'blue' },
    { value: 'hard', label: 'Avancé', description: 'Questions complexes', color: 'orange' },
    { value: 'expert', label: 'Expert', description: 'Questions pièges', color: 'red' }
];

export default function InterviewSimulator({ onSubmit, userInfo, isLoading }: InterviewSimulatorProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<InterviewData>({
        jobTitle: '',
        companyName: '',
        interviewType: 'hr',
        duration: '30-45 min',
        difficulty: 'medium',
        focusAreas: [],
        preparationLevel: 'intermediate',
        specificConcerns: [],
        interviewFormat: 'video',
        companySize: 'medium'
    });

    const [simulationStarted, setSimulationStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Timer pour simulation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const handleStartSimulation = () => {
        const prompt = generateInterviewPrompt(formData);
        // @ts-ignore
        onSubmit({ ...formData, prompt });
        setSimulationStarted(true);
        setIsTimerRunning(true);
    };

    const generateInterviewPrompt = (data: InterviewData) => {
        return `Simulez un entretien d'embauche avec les paramètres suivants :

**Contexte de l'entretien :**
- Poste : ${data.jobTitle}
- Entreprise : ${data.companyName}
- Type d'entretien : ${data.interviewType}
- Durée prévue : ${data.duration}
- Niveau de difficulté : ${data.difficulty}
- Format : ${data.interviewFormat}

**Zones de focus :** ${data.focusAreas.join(', ')}
**Préoccupations spécifiques :** ${data.specificConcerns.join(', ')}

**Mon profil :**
- Nom : ${userInfo?.name}
- Profession : ${userInfo?.profession}
- Expériences : ${userInfo?.experiences?.slice(0, 3).map(exp => `${exp.title} chez ${exp.company}`).join(', ')}
- Compétences clés : ${userInfo?.competences?.slice(0, 5).map(c => c.name).join(', ')}

Commencez par vous présenter comme recruteur, puis posez la première question. Adaptez vos questions selon mes réponses et donnez des feedbacks constructifs.`;
    };

    const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item));
        } else {
            setter([...array, item]);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getDifficultyColor = (difficulty: string) => {
        const level = DIFFICULTY_LEVELS.find(d => d.value === difficulty);
        return level?.color || 'blue';
    };

    const isFormValid = () => {
        return formData.jobTitle.length > 0 &&
            formData.companyName.length > 0 &&
            formData.focusAreas.length > 0;
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header avec timer */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500">
                        <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            Simulateur d'Entretien IA
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Préparez-vous avec des simulations réalistes
                        </p>
                    </div>
                </div>

                {simulationStarted && (
                    <div className="flex items-center justify-center gap-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(timeElapsed)}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                            Question {currentQuestion + 1}
                        </Badge>
                    </div>
                )}
            </div>

            {!simulationStarted ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    Détails du Poste
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                            placeholder="Ex: Product Manager Senior"
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
                                            placeholder="Ex: Google, Airbnb..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-purple-600" />
                                    Configuration de l'Entretien
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Type d'entretien</Label>
                                        <Select
                                            value={formData.interviewType}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, interviewType: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {INTERVIEW_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div>
                                                            <div className="font-medium">{type.label}</div>
                                                            <div className="text-xs text-gray-500">{type.description}</div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Durée prévue</Label>
                                        <Select
                                            value={formData.duration}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="15-30 min">15-30 min (Court)</SelectItem>
                                                <SelectItem value="30-45 min">30-45 min (Standard)</SelectItem>
                                                <SelectItem value="45-60 min">45-60 min (Approfondi)</SelectItem>
                                                <SelectItem value="60+ min">60+ min (Complet)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label>Niveau de difficulté</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                        {DIFFICULTY_LEVELS.map(level => {
                                            const isSelected = formData.difficulty === level.value;
                                            return (
                                                <button
                                                    key={level.value}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, difficulty: level.value }))}
                                                    className={`p-3 rounded-lg border transition-all text-center ${isSelected
                                                            ? `bg-${level.color}-100 border-${level.color}-300 text-${level.color}-700`
                                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    <div className="font-medium text-sm">{level.label}</div>
                                                    <div className="text-xs">{level.description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <Label>Zones de focus (sélectionnez 3-5)</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                        {FOCUS_AREAS.map(area => (
                                            <button
                                                key={area}
                                                type="button"
                                                onClick={() => toggleArrayItem(
                                                    formData.focusAreas,
                                                    area,
                                                    (items) => setFormData(prev => ({ ...prev, focusAreas: items }))
                                                )}
                                                className={`p-2 text-xs rounded-lg border transition-all text-left ${formData.focusAreas.includes(area)
                                                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {area}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Préoccupations spécifiques */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    Préoccupations Spécifiques
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {COMMON_CONCERNS.map(concern => (
                                        <button
                                            key={concern}
                                            type="button"
                                            onClick={() => toggleArrayItem(
                                                formData.specificConcerns,
                                                concern,
                                                (items) => setFormData(prev => ({ ...prev, specificConcerns: items }))
                                            )}
                                            className={`p-2 text-xs rounded-lg border transition-all text-left ${formData.specificConcerns.includes(concern)
                                                    ? 'bg-amber-100 border-amber-300 text-amber-700'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-amber-50'
                                                }`}
                                        >
                                            {concern}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Panneau de droite - Conseils et préparation */}
                    <div className="space-y-6">
                        {/* Conseils personnalisés */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                    Conseils Personnalisés
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-xs space-y-2">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                                        <span>Préparez des exemples STAR de vos {userInfo?.experiences?.length || 0} expériences</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                                        <span>Mettez en avant votre expertise en {userInfo?.competences?.[0]?.name}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                                        <span>Préparez 3-5 questions sur l'entreprise</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Métriques de préparation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <TrendingUp className="w-4 h-4" />
                                    Niveau de Préparation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs">Informations complètes</span>
                                        <Badge variant={isFormValid() ? "default" : "secondary"}>
                                            {isFormValid() ? '✓' : '○'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs">Zones de focus</span>
                                        <Badge variant={formData.focusAreas.length >= 3 ? "default" : "secondary"}>
                                            {formData.focusAreas.length}/5
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs">Préoccupations identifiées</span>
                                        <Badge variant={formData.specificConcerns.length > 0 ? "default" : "secondary"}>
                                            {formData.specificConcerns.length}
                                        </Badge>
                                    </div>
                                </div>

                                <Progress
                                    value={isFormValid() ?
                                        (50 + (formData.focusAreas.length * 10) + (formData.specificConcerns.length * 5))
                                        : 20
                                    }
                                    className="mt-3"
                                />
                            </CardContent>
                        </Card>

                        {/* Types de questions selon le type d'entretien */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Brain className="w-4 h-4 text-purple-600" />
                                    Questions Attendues
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs space-y-2">
                                    {formData.interviewType === 'hr' && (
                                        <>
                                            <div>• Parlez-moi de vous</div>
                                            <div>• Pourquoi ce poste ?</div>
                                            <div>• Vos points forts/faibles</div>
                                        </>
                                    )}
                                    {formData.interviewType === 'technical' && (
                                        <>
                                            <div>• Résolution de problèmes techniques</div>
                                            <div>• Architecture et design</div>
                                            <div>• Expérience avec les outils</div>
                                        </>
                                    )}
                                    {formData.interviewType === 'behavioral' && (
                                        <>
                                            <div>• Situations de conflit</div>
                                            <div>• Leadership et initiative</div>
                                            <div>• Gestion de l'échec</div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 p-8 rounded-2xl border border-orange-200"
                    >
                        <Mic className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            Simulation en Cours
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            L'IA va jouer le rôle du recruteur. Répondez naturellement aux questions.
                        </p>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsTimerRunning(!isTimerRunning)}
                            >
                                {isTimerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                {isTimerRunning ? 'Pause' : 'Reprendre'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSimulationStarted(false);
                                    setTimeElapsed(0);
                                    setIsTimerRunning(false);
                                    setCurrentQuestion(0);
                                }}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Recommencer
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Bouton de démarrage */}
            {!simulationStarted && (
                <div className="text-center">
                    <Button
                        onClick={handleStartSimulation}
                        disabled={!isFormValid() || isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 px-8"
                    >
                        {isLoading ? (
                            <>
                                <Timer className="w-5 h-5 mr-2 animate-pulse" />
                                Préparation...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5 mr-2" />
                                Commencer la Simulation
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-gray-500 mt-2">
                        Simulation interactive de {formData.duration}
                    </p>
                </div>
            )}
        </div>
    );
}