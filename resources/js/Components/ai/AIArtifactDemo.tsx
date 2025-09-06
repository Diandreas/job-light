/**
 * Composant de démonstration du système d'artefacts IA
 * Montre toutes les possibilités du nouveau système
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Bot, Sparkles, Play, RotateCcw, Eye,
    FileText, BarChart3, CheckCircle, TrendingUp,
    Clock, Target, Zap, Brain
} from 'lucide-react';

import MessageBubbleWithAI from './MessageBubbleWithAI';

// Exemples de messages IA avec contenu riche
const DEMO_MESSAGES = {
    'resume-review': {
        id: 'demo-cv-1',
        content: `## 📊 Analyse de votre CV - Résultats détaillés

**Score global: 78/100** ⭐

### Évaluation par sections:
- **En-tête**: █████████░ 85%
- **Expérience**: ███████░░░ 72%  
- **Compétences**: ████████░░ 89%
- **Formation**: ██████████ 94%
- **Mise en page**: ██████░░░░ 65%

### ✅ Points forts identifiés:
• Expérience technique solide en développement web
• Progression de carrière cohérente
• Compétences modernes (React, TypeScript, Node.js)
• Formation de qualité reconnue

### ⚠️ Points d'amélioration:
• Manque de quantification des résultats (ex: +25% performance, 50k€ économisés)
• Format trop dense, difficile à scanner rapidement
• Absence de mots-clés sectoriels importants
• Section compétences trop générique

### 🎯 Recommandations prioritaires:
1. **Quantifier vos réalisations**: Ajoutez des chiffres concrets à vos expériences
2. **Optimiser la mise en page**: Utilisez plus d'espacement et de hiérarchie visuelle
3. **Intégrer les mots-clés ATS**: React, JavaScript, TypeScript, Agile, Scrum
4. **Personnaliser par poste**: Adapter le CV selon l'offre d'emploi ciblée

**Temps estimé d'amélioration: 3-4 heures** 
**Gain potentiel: +15 points sur votre score**`,
        role: 'assistant' as const,
        timestamp: new Date(),
        serviceId: 'resume-review'
    },

    'interview-prep': {
        id: 'demo-interview-1',
        content: `## 🎤 Préparation Entretien - Simulateur Interactif

**Durée estimée: 45 minutes**
**Niveau: Intermédiaire**
**Type: Entretien technique + comportemental**

### 📋 Questions préparées:

**Question 1 (5 min)**: Pouvez-vous vous présenter et expliquer votre parcours en vous concentrant sur vos expériences en développement web ?

**Question 2 (8 min)**: Décrivez-moi un projet technique complexe que vous avez mené. Quels défis avez-vous rencontrés et comment les avez-vous surmontés ?

**Question 3 (7 min)**: Comment gérez-vous les conflits au sein d'une équipe de développement ? Donnez-moi un exemple concret.

**Question 4 (10 min)**: Expliquez-moi la différence entre React hooks et les class components. Dans quel contexte utiliseriez-vous l'un plutôt que l'autre ?

**Question 5 (5 min)**: Où vous voyez-vous dans 3 ans professionnellement ?

### ✅ Points clés à retenir:
• Préparez des exemples concrets utilisant la méthode STAR
• Montrez votre passion pour le développement
• Posez des questions sur l'équipe et les projets
• Démontrez votre capacité d'apprentissage

### ⏰ Simulation recommandée:
- **Échauffement**: 5 min de présentation personnelle
- **Questions techniques**: 20 min d'exercices pratiques  
- **Questions comportementales**: 15 min de mise en situation
- **Questions du candidat**: 5 min pour vos questions

**Mode simulation disponible avec feedback temps réel !**`,
        role: 'assistant' as const,
        timestamp: new Date(),
        serviceId: 'interview-prep'
    },

    'salary-negotiation': {
        id: 'demo-salary-1',
        content: `## 💰 Stratégie de Négociation Salariale

**Analyse de marché complétée**

### 📊 Fourchette salariale recommandée:
- **Minimum acceptable**: 52k€
- **Objectif réaliste**: 58k€  
- **Plafond optimiste**: 65k€

### 🎯 Arguments de négociation:

**Vos atouts majeurs:**
• 4 ans d'expérience en développement React/Node.js
• Expertise en architecture microservices 
• Leadership technique sur 3 projets majeurs
• Certifications AWS et formation continue

**Valeur ajoutée quantifiée:**
• +30% d'efficacité équipe grâce à vos outils
• Réduction 25% des bugs en production  
• Formation de 6 développeurs juniors
• Économies estimées: 45k€/an pour l'entreprise

### 💡 Stratégies de négociation:

**Phase 1 - Préparation:**
- Rechercher les salaires du marché (52-65k€ pour votre profil)
- Documenter vos réalisations avec chiffres
- Identifier les alternatives (autres offres, freelance)

**Phase 2 - Négociation:**
- Commencer à 62k€ pour négocier vers 58k€
- Proposer des alternatives si budget serré (télétravail, formation, RTT)
- Rester professionnel et orienté valeur ajoutée

**Probabilité de succès: 78%**
**Moment optimal: Après évaluation annuelle ou nouveau projet**`,
        role: 'assistant' as const,
        timestamp: new Date(),
        serviceId: 'salary-negotiation'
    },

    'career-advice': {
        id: 'demo-career-1',
        content: `## 🚀 Plan de Carrière Personnalisé

**De Développeur Senior à Tech Lead**
**Objectif: 18-24 mois**

### 📈 Feuille de route détaillée:

**Phase 1 (0-6 mois): Consolidation technique**
├─ Maîtriser l'architecture distribuée
├─ Obtenir certification AWS Solutions Architect  
├─ Prendre le lead sur un projet critique
└─ Commencer à mentorer un développeur junior

**Phase 2 (6-12 mois): Développement du leadership**
├─ Former une équipe de 3-4 développeurs
├─ Implémenter des processus d'amélioration continue
├─ Participer aux décisions d'architecture système
└─ Présenter en conférence ou meetup technique

**Phase 3 (12-18 mois): Transition vers le management**  
├─ Gérer intégralement une équipe (recrutement, évaluation)
├─ Définir la roadmap technique du produit
├─ Collaborer directement avec le CTO
└─ Obtenir certification en management d'équipe

**Phase 4 (18-24 mois): Confirmation Tech Lead**
└─ Position officielle de Tech Lead confirmée

### 🎯 Compétences à développer:

**Techniques (60%):**
• Architecture microservices avancée
• DevOps et CI/CD automatisés  
• Performance et scalabilité
• Sécurité applicative

**Humaines (40%):**
• Communication inter-équipes
• Gestion de projet agile
• Recrutement technique
• Formation et développement d'équipe

**Probabilité de réussite: 82%**
**Investissement temps: 8-10h/semaine de formation**
**ROI estimé: +22k€ de salaire annuel**`,
        role: 'assistant' as const,
        timestamp: new Date(),
        serviceId: 'career-advice'
    }
};

export default function AIArtifactDemo() {
    const [selectedDemo, setSelectedDemo] = useState<keyof typeof DEMO_MESSAGES>('resume-review');
    const [showMessage, setShowMessage] = useState(false);
    const [analysisStats, setAnalysisStats] = useState<any>(null);

    const handleStartDemo = () => {
        setShowMessage(true);
        setAnalysisStats({
            analysisTime: '2.3s',
            artifactsGenerated: getExpectedArtifactsCount(selectedDemo),
            confidenceScore: getExpectedConfidence(selectedDemo),
            aiFeatures: getAIFeatures(selectedDemo)
        });
    };

    const handleResetDemo = () => {
        setShowMessage(false);
        setAnalysisStats(null);
    };

    const getExpectedArtifactsCount = (type: keyof typeof DEMO_MESSAGES): number => {
        const counts = {
            'resume-review': 2,
            'interview-prep': 1,
            'salary-negotiation': 1,
            'career-advice': 1
        };
        return counts[type];
    };

    const getExpectedConfidence = (type: keyof typeof DEMO_MESSAGES): number => {
        const confidence = {
            'resume-review': 94,
            'interview-prep': 89,
            'salary-negotiation': 78,
            'career-advice': 92
        };
        return confidence[type];
    };

    const getAIFeatures = (type: keyof typeof DEMO_MESSAGES): string[] => {
        const features = {
            'resume-review': ['Analyse sectorielle', 'Score ATS', 'Heatmap visuelle', 'Recommandations priorisées'],
            'interview-prep': ['Questions personnalisées', 'Simulateur temps réel', 'Feedback IA', 'Méthode STAR'],
            'salary-negotiation': ['Analyse de marché', 'Stratégies multiples', 'Calcul ROI', 'Probabilités de succès'],
            'career-advice': ['Roadmap personnalisée', 'Analyse compétences', 'Timeline réaliste', 'Métriques de progression']
        };
        return features[type];
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3"
                >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Système d'Artefacts IA
                        </h1>
                        <p className="text-gray-600">
                            Démonstration des capacités d'analyse et de génération automatique
                        </p>
                    </div>
                </motion.div>

                {/* Stats en temps réel */}
                {analysisStats && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center gap-4"
                    >
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            Analysé en {analysisStats.analysisTime}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {analysisStats.artifactsGenerated} artefacts générés
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {analysisStats.confidenceScore}% confiance
                        </Badge>
                    </motion.div>
                )}
            </div>

            {/* Sélection du type de démonstration */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Choisissez une démonstration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={selectedDemo} onValueChange={(value) => setSelectedDemo(value as any)}>
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="resume-review" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Analyse CV
                            </TabsTrigger>
                            <TabsTrigger value="interview-prep" className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Entretien
                            </TabsTrigger>
                            <TabsTrigger value="salary-negotiation" className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Négociation
                            </TabsTrigger>
                            <TabsTrigger value="career-advice" className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Carrière
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={selectedDemo} className="mt-4 space-y-4">
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Fonctionnalités IA pour ce service:</strong>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {getAIFeatures(selectedDemo).map((feature, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-2">
                                <Button onClick={handleStartDemo} className="flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Lancer la démonstration
                                </Button>
                                {showMessage && (
                                    <Button variant="outline" onClick={handleResetDemo} className="flex items-center gap-2">
                                        <RotateCcw className="w-4 h-4" />
                                        Réinitialiser
                                    </Button>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Zone de démonstration */}
            {showMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-amber-600" />
                                Démonstration en Direct - {selectedDemo.replace('-', ' ')}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    {/* Message avec analyse IA */}
                    <div className="bg-white rounded-lg p-4 border">
                        <MessageBubbleWithAI
                            message={DEMO_MESSAGES[selectedDemo]}
                            userContext={{ 
                                experienceLevel: 'senior',
                                targetRole: 'tech-lead',
                                industry: 'web-development' 
                            }}
                            showArtifacts={true}
                            enableAIAnalysis={true}
                        />
                    </div>

                    {/* Informations techniques */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-gray-700">
                                Informations Techniques de l'Analyse
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <strong>Type d'analyse:</strong> Intelligent Pattern Recognition
                                </div>
                                <div>
                                    <strong>Modèle IA:</strong> Spécialisé RH + NLP
                                </div>
                                <div>
                                    <strong>Données extraites:</strong> {getExpectedArtifactsCount(selectedDemo)} artefacts structurés
                                </div>
                                <div>
                                    <strong>Temps de traitement:</strong> {analysisStats?.analysisTime || 'N/A'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}