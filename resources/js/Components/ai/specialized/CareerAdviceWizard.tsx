import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import {
    Brain, Target, TrendingUp, MapPin, Clock, Users,
    ChevronRight, ChevronLeft, Sparkles, CheckCircle,
    ArrowRight, Lightbulb, Rocket, Award, Loader2
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface CareerAdviceWizardProps {
    onSubmit: (data: CareerAdviceData) => void;
    userInfo: any;
    isLoading: boolean;
}

interface CareerAdviceData {
    currentSituation: string;
    careerGoals: string;
    timeframe: string;
    industry: string;
    experience_level: string;
    challenges: string[];
    priorities: string[];
    location_preference: string;
    salary_expectations: string;
    skills_to_develop: string[];
}

// Wizard steps - will be translated in component

// Industries - will be translated in component

// Experience levels - will be translated in component

// Common challenges - will be translated in component

// Career priorities - will be translated in component

export default function CareerAdviceWizard({ onSubmit, userInfo, isLoading }: CareerAdviceWizardProps) {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    // Translated constants
    const WIZARD_STEPS = [
        { id: 'situation', title: t('career_advice_wizard.steps.situation') || 'Situation Actuelle', icon: Users },
        { id: 'goals', title: t('career_advice_wizard.steps.goals') || 'Objectifs', icon: Target },
        { id: 'constraints', title: t('career_advice_wizard.steps.constraints') || 'Contraintes', icon: MapPin },
        { id: 'development', title: t('career_advice_wizard.steps.development') || 'Développement', icon: TrendingUp },
        { id: 'summary', title: t('career_advice_wizard.steps.summary') || 'Résumé', icon: CheckCircle }
    ];

    const INDUSTRIES = [
        t('career_advice_wizard.industries.technology') || 'Technologie',
        t('career_advice_wizard.industries.finance') || 'Finance',
        t('career_advice_wizard.industries.health') || 'Santé',
        t('career_advice_wizard.industries.education') || 'Éducation',
        t('career_advice_wizard.industries.marketing') || 'Marketing',
        t('career_advice_wizard.industries.hr') || 'Ressources Humaines',
        t('career_advice_wizard.industries.sales') || 'Vente',
        t('career_advice_wizard.industries.consulting') || 'Consulting',
        t('career_advice_wizard.industries.media') || 'Média',
        t('career_advice_wizard.industries.archives') || 'Archives/Documentation'
    ];

    const EXPERIENCE_LEVELS = [
        t('career_advice_wizard.experience.beginner') || 'Débutant (0-2 ans)',
        t('career_advice_wizard.experience.intermediate') || 'Intermédiaire (2-5 ans)',
        t('career_advice_wizard.experience.senior') || 'Senior (5-10 ans)',
        t('career_advice_wizard.experience.expert') || 'Expert (10+ ans)'
    ];

    const COMMON_CHALLENGES = [
        t('career_advice_wizard.challenges.lack_experience') || 'Manque d\'expérience',
        t('career_advice_wizard.challenges.career_change') || 'Reconversion professionnelle',
        t('career_advice_wizard.challenges.salary_growth') || 'Évolution salariale',
        t('career_advice_wizard.challenges.work_life_balance') || 'Équilibre vie pro/perso',
        t('career_advice_wizard.challenges.skill_development') || 'Développement de compétences',
        t('career_advice_wizard.challenges.networking') || 'Networking',
        t('career_advice_wizard.challenges.salary_negotiation') || 'Négociation salariale',
        t('career_advice_wizard.challenges.leadership') || 'Leadership',
        t('career_advice_wizard.challenges.professional_visibility') || 'Visibilité professionnelle'
    ];

    const CAREER_PRIORITIES = [
        t('career_advice_wizard.priorities.salary_growth') || 'Croissance salariale',
        t('career_advice_wizard.priorities.work_life_balance') || 'Équilibre vie privée',
        t('career_advice_wizard.priorities.continuous_learning') || 'Apprentissage continu',
        t('career_advice_wizard.priorities.social_impact') || 'Impact social',
        t('career_advice_wizard.priorities.autonomy') || 'Autonomie',
        t('career_advice_wizard.priorities.job_security') || 'Sécurité d\'emploi',
        t('career_advice_wizard.priorities.innovation') || 'Innovation',
        t('career_advice_wizard.priorities.team_management') || 'Management d\'équipe',
        t('career_advice_wizard.priorities.recognition') || 'Reconnaissance'
    ];
    const [formData, setFormData] = useState<CareerAdviceData>({
        currentSituation: '',
        careerGoals: '',
        timeframe: '1-2 ans',
        industry: userInfo?.profession || '',
        experience_level: 'Intermédiaire (2-5 ans)',
        challenges: [],
        priorities: [],
        location_preference: '',
        salary_expectations: '',
        skills_to_develop: []
    });

    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
    const currentStepData = WIZARD_STEPS[currentStep];

    const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
        if (array.includes(item)) {
            setter(array.filter(i => i !== item));
        } else {
            setter([...array, item]);
        }
    };

    const handleNext = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Générer le prompt final et soumettre
            const finalPrompt = generateCareerAdvicePrompt(formData);
            // @ts-ignore

            onSubmit({ ...formData, finalPrompt });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateCareerAdvicePrompt = (data: CareerAdviceData) => {
        return `Voici ma situation professionnelle actuelle :

**Situation actuelle :** ${data.currentSituation}

**Objectifs de carrière :** ${data.careerGoals}
**Délai souhaité :** ${data.timeframe}
**Secteur d'activité :** ${data.industry}
**Niveau d'expérience :** ${data.experience_level}

**Défis principaux :** ${data.challenges.join(', ')}
**Priorités :** ${data.priorities.join(', ')}

**Contraintes géographiques :** ${data.location_preference}
**Attentes salariales :** ${data.salary_expectations}
**Compétences à développer :** ${data.skills_to_develop.join(', ')}

Pouvez-vous me donner des conseils personnalisés pour atteindre mes objectifs de carrière ?`;
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0: return formData.currentSituation.length > 20;
            case 1: return formData.careerGoals.length > 20;
            case 2: return formData.location_preference.length > 0;
            case 3: return formData.skills_to_develop.length > 0;
            case 4: return true;
            default: return false;
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header with modernized progress */}
            <div className="mb-8">
                {/* Modern circular progress indicators */}
                <div className="text-center mb-6">
                    <div className="flex justify-center items-center gap-2 mb-6">
                        {WIZARD_STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <React.Fragment key={step.id}>
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{
                                            scale: isActive ? 1.15 : 1,
                                            backgroundColor: isActive ? '#f59e0b' : isCompleted ? '#fbbf24' : '#e5e7eb'
                                        }}
                                        transition={{ duration: 0.3 }}
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full transition-all duration-500",
                                            isActive ? 'bg-amber-500 ring-4 ring-amber-500/20' :
                                                isCompleted ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-800'
                                        )}
                                    >
                                    </motion.div>
                                    {index < WIZARD_STEPS.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-0.5 transition-colors duration-500 rounded-full mx-1",
                                            isCompleted ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-800'
                                        )} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <h3 className="text-2xl font-serif text-gray-900 dark:text-gray-100 flex items-center justify-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-500 border border-amber-100 dark:border-amber-800">
                                <currentStepData.icon className="w-5 h-5" />
                            </div>
                            {currentStepData.title}
                        </h3>
                        <div className="flex items-center justify-center gap-3 text-sm text-amber-600/60 dark:text-amber-500/40">
                            <span className="bg-amber-500/5 dark:bg-amber-500/10 px-2 py-0.5 rounded-md font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tighter">Étape {currentStep + 1} / {WIZARD_STEPS.length}</span>
                            <div className="w-1.5 h-1.5 bg-amber-500/40 rounded-full" />
                            <div className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>~2 min restantes</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Minimal linear progress */}
                    <div className="mt-6 mx-auto max-w-sm">
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, ease: "anticipate" }}
                                className="bg-amber-500 h-full rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Wizard Content */}
            <Card className="min-h-[500px] border border-gray-100 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Étape 1: Situation actuelle */}
                            {currentStep === 0 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentSituation" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('career_advice_wizard.form.current_situation') || 'Décrivez votre situation professionnelle actuelle *'}
                                        </Label>
                                        <Textarea
                                            id="currentSituation"
                                            value={formData.currentSituation}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                currentSituation: e.target.value
                                            }))}
                                            placeholder={t('career_advice_wizard.form.current_situation_placeholder') || 'Ex: Je suis développeur junior depuis 2 ans dans une startup. Je souhaite évoluer vers un poste de tech lead...'}
                                            rows={4}
                                            className="resize-none rounded-xl border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-amber-500/20"
                                        />
                                        <div className="text-xs text-amber-600/60 flex justify-between font-medium">
                                            <span>{formData.currentSituation.length}/500 {t('career_advice_wizard.form.characters_min_20') || 'caractères (minimum 20)'}</span>
                                            {formData.currentSituation.length >= 20 && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="industry" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                {t('career_advice_wizard.form.industry') || 'Secteur d\'activité'}
                                            </Label>
                                            <Select
                                                value={formData.industry}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                                            >
                                                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-amber-500/20">
                                                    <SelectValue placeholder={t('career_advice_wizard.form.select_industry') || 'Sélectionnez votre secteur'} />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700">
                                                    {INDUSTRIES.map(industry => (
                                                        <SelectItem key={industry} value={industry} className="rounded-lg m-1">
                                                            {industry}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="experience" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                {t('career_advice_wizard.form.experience_level') || 'Niveau d\'expérience'}
                                            </Label>
                                            <Select
                                                value={formData.experience_level}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
                                            >
                                                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-amber-500/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700">
                                                    {EXPERIENCE_LEVELS.map(level => (
                                                        <SelectItem key={level} value={level} className="rounded-lg m-1">
                                                            {level}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Étape 2: Objectifs */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="careerGoals" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('career_advice_wizard.form.career_goals') || 'Quels sont vos objectifs de carrière ? *'}
                                        </Label>
                                        <Textarea
                                            id="careerGoals"
                                            value={formData.careerGoals}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                careerGoals: e.target.value
                                            }))}
                                            placeholder={t('career_advice_wizard.form.career_goals_placeholder') || 'Ex: Je veux devenir CTO d\'une scale-up tech d\'ici 3 ans, manager une équipe de 10+ développeurs...'}
                                            rows={4}
                                            className="resize-none rounded-xl border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-amber-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timeframe" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('career_advice_wizard.form.timeframe') || 'Dans quel délai ?'}
                                        </Label>
                                        <Select
                                            value={formData.timeframe}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}
                                        >
                                            <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-amber-500/20">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-200 dark:border-gray-700">
                                                <SelectItem value="6 mois" className="rounded-lg m-1">6 mois</SelectItem>
                                                <SelectItem value="1 an" className="rounded-lg m-1">1 an</SelectItem>
                                                <SelectItem value="1-2 ans" className="rounded-lg m-1">1-2 ans</SelectItem>
                                                <SelectItem value="2-5 ans" className="rounded-lg m-1">2-5 ans</SelectItem>
                                                <SelectItem value="5+ ans" className="rounded-lg m-1">5+ ans</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {t('career_advice_wizard.form.priorities') || 'Vos priorités principales (sélectionnez 2-3)'}
                                        </Label>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
                                            {CAREER_PRIORITIES.map(priority => (
                                                <button
                                                    key={priority}
                                                    type="button"
                                                    onClick={() => toggleArrayItem(
                                                        formData.priorities,
                                                        priority,
                                                        (items) => setFormData(prev => ({ ...prev, priorities: items }))
                                                    )}
                                                    className={cn(
                                                        "p-3 text-[11px] font-medium rounded-xl border transition-all duration-200",
                                                        formData.priorities.includes(priority)
                                                            ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300 shadow-sm'
                                                            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-amber-200'
                                                    )}
                                                >
                                                    {priority}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Étape 3: Contraintes */}
                            {currentStep === 2 && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Préférences géographiques</Label>
                                        <Input
                                            id="location"
                                            value={formData.location_preference}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                location_preference: e.target.value
                                            }))}
                                            placeholder="Ex: Paris, télétravail, international..."
                                            className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-amber-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="salary" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attentes salariales (optionnel)</Label>
                                        <Input
                                            id="salary"
                                            value={formData.salary_expectations}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                salary_expectations: e.target.value
                                            }))}
                                            placeholder="Ex: 50-60k€, négociable selon projet..."
                                            className="rounded-xl border-gray-200 dark:border-gray-800 focus:border-amber-500 focus:ring-amber-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Principaux défis à surmonter</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2">
                                            {COMMON_CHALLENGES.map(challenge => (
                                                <button
                                                    key={challenge}
                                                    type="button"
                                                    onClick={() => toggleArrayItem(
                                                        formData.challenges,
                                                        challenge,
                                                        (items) => setFormData(prev => ({ ...prev, challenges: items }))
                                                    )}
                                                    className={cn(
                                                        "p-3 text-[11px] font-medium rounded-xl border transition-all duration-200 text-left",
                                                        formData.challenges.includes(challenge)
                                                            ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300 shadow-sm'
                                                            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-amber-200'
                                                    )}
                                                >
                                                    {challenge}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Étape 4: Développement */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Compétences que vous souhaitez développer</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                            {['Leadership', 'Communication', 'Gestion de projet', 'Analyse de données',
                                                'Négociation', 'Innovation', 'Stratégie', 'Coaching', 'Vente'].map(skill => (
                                                    <button
                                                        key={skill}
                                                        type="button"
                                                        onClick={() => toggleArrayItem(
                                                            formData.skills_to_develop,
                                                            skill,
                                                            (items) => setFormData(prev => ({ ...prev, skills_to_develop: items }))
                                                        )}
                                                        className={cn(
                                                            "p-4 text-sm font-medium rounded-xl border transition-all duration-200 text-left flex items-center justify-between",
                                                            formData.skills_to_develop.includes(skill)
                                                                ? 'bg-amber-500 border-amber-600 text-white shadow-lg shadow-amber-500/20'
                                                                : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-amber-200'
                                                        )}
                                                    >
                                                        <span>{skill}</span>
                                                        {formData.skills_to_develop.includes(skill) && (
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        )}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Étape 5: Résumé */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/50 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Sparkles className="w-16 h-16 text-amber-500" />
                                        </div>
                                        <h3 className="font-bold text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-2">
                                            <Rocket className="w-5 h-5" />
                                            Votre Profil de Carrière
                                        </h3>
                                        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                            <div className="flex gap-2">
                                                <strong className="text-amber-600 dark:text-amber-500 shrink-0">Situation :</strong>
                                                <span className="line-clamp-2">{formData.currentSituation}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <strong className="text-amber-600 dark:text-amber-500 shrink-0">Objectif :</strong>
                                                <span className="line-clamp-2">{formData.careerGoals}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <strong className="text-amber-600 dark:text-amber-500 block mb-1">Délai :</strong>
                                                    <Badge variant="outline" className="border-amber-200 bg-white dark:bg-gray-900">{formData.timeframe}</Badge>
                                                </div>
                                                <div>
                                                    <strong className="text-amber-600 dark:text-amber-500 block mb-1">Secteur :</strong>
                                                    <Badge variant="outline" className="border-amber-200 bg-white dark:bg-gray-900">{formData.industry}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-4 py-4">
                                        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                            <Award className="w-10 h-10 text-amber-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white">Prêt à décoller !</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Cliquez sur le bouton ci-dessous pour recevoir vos conseils personnalisés basés sur votre profil.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Desktop Navigation */}
                    <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 px-6 h-12 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-30 transition-all font-medium"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            {t('common.previous') || 'Précédent'}
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={!isStepValid() || isLoading}
                            className={cn(
                                "flex items-center gap-2 px-8 h-12 rounded-xl shadow-lg transition-all font-bold text-white",
                                "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 hover:shadow-amber-500/30",
                                (isLoading || !isStepValid()) && "opacity-50"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('common.processing') || 'Analyse...'}
                                </>
                            ) : currentStep === WIZARD_STEPS.length - 1 ? (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    {t('career_advice_wizard.generate_advice') || 'Générer mon plan'}
                                </>
                            ) : (
                                <>
                                    {t('common.next') || 'Étape suivante'}
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}