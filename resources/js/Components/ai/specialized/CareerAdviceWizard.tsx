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
import {
    Brain, Target, TrendingUp, MapPin, Clock, Users,
    ChevronRight, ChevronLeft, Sparkles, CheckCircle,
    ArrowRight, Lightbulb, Rocket, Award
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
        <div className="max-w-2xl mx-auto">
            {/* Header avec progression */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-500">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                {t('career_advice_wizard.title') || 'Assistant Carrière Personnalisé'}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('career_advice_wizard.step_progress', { current: currentStep + 1, total: WIZARD_STEPS.length }) || `Étape ${currentStep + 1} sur ${WIZARD_STEPS.length}`}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {t('career_advice_wizard.personalized_ai') || 'IA Personnalisée'}
                    </Badge>
                </div>

                <Progress value={progress} className="h-2 mb-2" />

                {/* Navigation des étapes */}
                <div className="flex items-center justify-between text-xs">
                    {WIZARD_STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-1 ${isActive ? 'text-blue-600 font-medium' :
                                        isCompleted ? 'text-green-600' : 'text-gray-400'
                                    }`}
                            >
                                <Icon className="w-3 h-3" />
                                <span className="hidden sm:inline">{step.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Contenu des étapes */}
            <Card className="min-h-[400px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <currentStepData.icon className="w-5 h-5 text-blue-600" />
                        {currentStepData.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
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
                                    <div>
                                        <Label htmlFor="currentSituation">
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
                                            className="resize-none"
                                        />
                                        <div className="text-xs text-gray-500 mt-1">
                                            {formData.currentSituation.length}/500 {t('career_advice_wizard.form.characters_min_20') || 'caractères (minimum 20)'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="industry">{t('career_advice_wizard.form.industry') || 'Secteur d\'activité'}</Label>
                                            <Select
                                                value={formData.industry}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('career_advice_wizard.form.select_industry') || 'Sélectionnez votre secteur'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {INDUSTRIES.map(industry => (
                                                        <SelectItem key={industry} value={industry}>
                                                            {industry}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="experience">{t('career_advice_wizard.form.experience_level') || 'Niveau d\'expérience'}</Label>
                                            <Select
                                                value={formData.experience_level}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, experience_level: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EXPERIENCE_LEVELS.map(level => (
                                                        <SelectItem key={level} value={level}>
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
                                    <div>
                                        <Label htmlFor="careerGoals">
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
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="timeframe">{t('career_advice_wizard.form.timeframe') || 'Dans quel délai ?'}</Label>
                                        <Select
                                            value={formData.timeframe}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, timeframe: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="6 mois">6 mois</SelectItem>
                                                <SelectItem value="1 an">1 an</SelectItem>
                                                <SelectItem value="1-2 ans">1-2 ans</SelectItem>
                                                <SelectItem value="2-5 ans">2-5 ans</SelectItem>
                                                <SelectItem value="5+ ans">5+ ans</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>{t('career_advice_wizard.form.priorities') || 'Vos priorités principales (sélectionnez 2-3)'}</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {CAREER_PRIORITIES.map(priority => (
                                                <button
                                                    key={priority}
                                                    type="button"
                                                    onClick={() => toggleArrayItem(
                                                        formData.priorities,
                                                        priority,
                                                        (items) => setFormData(prev => ({ ...prev, priorities: items }))
                                                    )}
                                                    className={`p-2 text-xs rounded-lg border transition-all ${formData.priorities.includes(priority)
                                                            ? 'bg-amber-100 border-amber-300 text-amber-700'
                                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-amber-50'
                                                        }`}
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
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="location">Préférences géographiques</Label>
                                        <Input
                                            id="location"
                                            value={formData.location_preference}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                location_preference: e.target.value
                                            }))}
                                            placeholder="Ex: Paris, télétravail, international..."
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="salary">Attentes salariales (optionnel)</Label>
                                        <Input
                                            id="salary"
                                            value={formData.salary_expectations}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                salary_expectations: e.target.value
                                            }))}
                                            placeholder="Ex: 50-60k€, négociable selon projet..."
                                        />
                                    </div>

                                    <div>
                                        <Label>Principaux défis à surmonter</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                            {COMMON_CHALLENGES.map(challenge => (
                                                <button
                                                    key={challenge}
                                                    type="button"
                                                    onClick={() => toggleArrayItem(
                                                        formData.challenges,
                                                        challenge,
                                                        (items) => setFormData(prev => ({ ...prev, challenges: items }))
                                                    )}
                                                    className={`p-2 text-xs rounded-lg border transition-all text-left ${formData.challenges.includes(challenge)
                                                            ? 'bg-orange-100 border-orange-300 text-orange-700'
                                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50'
                                                        }`}
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
                                    <div>
                                        <Label>Compétences que vous souhaitez développer</Label>
                                        <div className="space-y-2 mt-2">
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
                                                        className={`w-full p-3 text-sm rounded-lg border transition-all text-left flex items-center justify-between ${formData.skills_to_develop.includes(skill)
                                                                ? 'bg-green-100 border-green-300 text-green-700'
                                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50'
                                                            }`}
                                                    >
                                                        <span>{skill}</span>
                                                        {formData.skills_to_develop.includes(skill) && (
                                                            <CheckCircle className="w-4 h-4" />
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
                                    <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-xl border border-blue-200">
                                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                            <Rocket className="w-4 h-4" />
                                            Votre Profil de Carrière
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div><strong>Situation :</strong> {formData.currentSituation.substring(0, 100)}...</div>
                                            <div><strong>Objectif :</strong> {formData.careerGoals.substring(0, 100)}...</div>
                                            <div><strong>Délai :</strong> {formData.timeframe}</div>
                                            <div><strong>Secteur :</strong> {formData.industry}</div>
                                            <div><strong>Priorités :</strong> {formData.priorities.join(', ')}</div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="mb-4">
                                            <Award className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Prêt à recevoir vos conseils personnalisés !
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-8 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t('common.previous') || 'Précédent'}
                        </Button>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {t('career_advice_wizard.time_remaining') || '~2 min restantes'}
                        </div>

                        <Button
                            onClick={handleNext}
                            disabled={!isStepValid() || isLoading}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                        >
                            {currentStep === WIZARD_STEPS.length - 1 ? (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    {t('career_advice_wizard.generate_advice') || 'Générer conseils'}
                                </>
                            ) : (
                                <>
                                    {t('common.next') || 'Suivant'}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}