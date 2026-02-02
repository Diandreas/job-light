import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { InteractiveTimeline } from '@/Components/ai/immersive/roadmap/Timeline';
import { useCareerAdvisorStore } from '@/stores/careerAdvisorStore';
import { useRoadmapAI } from '@/Components/ai/hooks/useAIStream';
import { ArrowLeft, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratorProps {
  auth: any;
  profile?: {
    currentRole: string;
    targetRole: string;
    experience: number;
    skills: string[];
  };
}

export default function Generator({ auth, profile }: GeneratorProps) {
  const { roadmap, setRoadmap } = useCareerAdvisorStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [streamedContent, setStreamedContent] = useState<string>('');

  const {
    content: aiContent,
    isStreaming,
    startStream,
    reset: resetAI,
  } = useRoadmapAI();

  useEffect(() => {
    if (aiContent) {
      setStreamedContent(aiContent);
    }
  }, [aiContent]);

  const handleGenerate = async () => {
    if (!profile) return;

    setIsGenerating(true);
    setGenerationStep('Analyse de votre profil...');

    try {
      await startStream({
        currentRole: profile.currentRole,
        targetRole: profile.targetRole,
        experience: profile.experience,
        skills: profile.skills,
      });

      // Parse the generated content and create roadmap
      // This is simplified - in reality would parse structured JSON from AI
      setTimeout(() => {
        const mockRoadmap = createMockRoadmap(profile);
        setRoadmap(mockRoadmap);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    router.visit('/career-advisor');
  };

  if (isGenerating || isStreaming) {
    return (
      <AuthenticatedLayout user={auth.user}>
        <Head title="Génération de votre Roadmap" />
        <GenerationWizard
          step={generationStep}
          content={streamedContent}
          onSkip={() => {
            setIsGenerating(false);
            resetAI();
          }}
        />
      </AuthenticatedLayout>
    );
  }

  if (roadmap) {
    return (
      <AuthenticatedLayout user={auth.user}>
        <Head title="Votre Roadmap Carrière" />
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{roadmap.title}</h1>
              <p className="text-sm text-muted-foreground">
                {roadmap.currentRole} → {roadmap.targetRole}
              </p>
            </div>
          </div>
          <InteractiveTimeline roadmap={roadmap} />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Créer votre Roadmap Carrière" />

      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">
            Créez Votre Roadmap Carrière Personnalisée
          </h1>
          <p className="text-lg text-muted-foreground">
            L'IA va analyser votre profil et créer un plan d'action détaillé pour
            atteindre vos objectifs professionnels.
          </p>

          {profile && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">De:</span>
                  <p className="font-semibold">{profile.currentRole}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Vers:</span>
                  <p className="font-semibold">{profile.targetRole}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Expérience:</span>
                  <p className="font-semibold">{profile.experience} ans</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Button size="lg" onClick={handleGenerate} className="w-full max-w-md">
            <Sparkles className="w-5 h-5 mr-2" />
            Générer Ma Roadmap avec l'IA
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function GenerationWizard({
  step,
  content,
  onSkip,
}: {
  step: string;
  content: string;
  onSkip: () => void;
}) {
  const steps = [
    { id: 1, text: '📋 Analyse de votre profil...', done: true },
    { id: 2, text: '🎯 Création de votre parcours...', done: content.includes('Phase') },
    { id: 3, text: '📚 Identification des compétences...', done: content.includes('compétences') },
    { id: 4, text: '⏱️ Estimation des délais...', done: content.includes('mois') },
    { id: 5, text: '✨ Finalisation...', done: content.length > 500 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardContent className="p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Génération de votre roadmap personnalisée
            </h2>
            <p className="text-muted-foreground">
              L'IA analyse votre profil et crée votre plan d'action...
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3">
            {steps.map((s, index) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-3"
              >
                {s.done ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                )}
                <span className={s.done ? 'text-muted-foreground' : 'font-medium'}>
                  {s.text}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Streaming Content */}
          <div className="min-h-[300px] max-h-[400px] overflow-auto p-6 rounded-lg bg-muted/50 border">
            <AnimatePresence>
              {content ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-sm dark:prose-invert max-w-none"
                >
                  {content.split('\n').map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip} className="flex-1">
              Passer l'animation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function createMockRoadmap(profile: any) {
  return {
    id: `roadmap-${Date.now()}`,
    title: `Roadmap: ${profile.currentRole} → ${profile.targetRole}`,
    currentRole: profile.currentRole,
    targetRole: profile.targetRole,
    timeline: '18-24 mois',
    difficulty: 4,
    currentPhaseId: 'phase-1',
    overallProgress: 35,
    marketValueCurrent: 65000,
    marketValueTarget: 80000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phases: [
      {
        id: 'phase-1',
        title: 'Renforcement Technique',
        description: 'Acquérir les compétences techniques essentielles',
        duration: '6 mois',
        order: 1,
        progress: 35,
        milestones: [
          {
            id: 'milestone-1',
            phaseId: 'phase-1',
            title: 'Maîtriser Kubernetes',
            description: 'Apprendre les bases de l\'orchestration de conteneurs',
            status: 'completed' as const,
            dueDate: '2026-03-01',
            completedAt: '2026-01-28',
            resources: [
              { title: 'Kubernetes Official Docs', url: 'https://kubernetes.io' },
            ],
            impact: 15,
            difficulty: 'medium' as const,
            estimatedHours: 40,
          },
          {
            id: 'milestone-2',
            phaseId: 'phase-1',
            title: 'Certification AWS Solutions Architect',
            description: 'Obtenir la certification AWS SA Associate',
            status: 'in_progress' as const,
            dueDate: '2026-03-15',
            startedAt: '2026-01-15',
            resources: [
              { title: 'AWS Training', url: 'https://aws.training' },
              { title: 'Practice Exams', url: '#' },
            ],
            impact: 20,
            difficulty: 'hard' as const,
            estimatedHours: 80,
          },
          {
            id: 'milestone-3',
            phaseId: 'phase-1',
            title: 'Projet CI/CD complet',
            description: 'Créer un pipeline CI/CD de A à Z',
            status: 'not_started' as const,
            dueDate: '2026-04-01',
            resources: [],
            impact: 12,
            difficulty: 'medium' as const,
            estimatedHours: 30,
          },
        ],
      },
      {
        id: 'phase-2',
        title: 'Développement Leadership',
        description: 'Acquérir les compétences de management et leadership',
        duration: '6-12 mois',
        order: 2,
        progress: 0,
        milestones: [
          {
            id: 'milestone-4',
            phaseId: 'phase-2',
            title: 'Formation Management',
            description: 'Suivre une formation en management d\'équipe',
            status: 'not_started' as const,
            dueDate: '2026-07-01',
            resources: [],
            impact: 18,
            difficulty: 'medium' as const,
            estimatedHours: 60,
          },
          {
            id: 'milestone-5',
            phaseId: 'phase-2',
            title: 'Mentoring juniors',
            description: 'Mentorer 2-3 développeurs juniors',
            status: 'not_started' as const,
            dueDate: '2026-09-01',
            resources: [],
            impact: 15,
            difficulty: 'easy' as const,
            estimatedHours: 40,
          },
        ],
      },
      {
        id: 'phase-3',
        title: 'Position Senior',
        description: 'Obtenir un poste senior ou lead',
        duration: '6 mois',
        order: 3,
        progress: 0,
        milestones: [
          {
            id: 'milestone-6',
            phaseId: 'phase-3',
            title: 'Lead technique sur projet majeur',
            description: 'Prendre le lead technique sur un projet important',
            status: 'not_started' as const,
            dueDate: '2026-12-01',
            resources: [],
            impact: 25,
            difficulty: 'hard' as const,
            estimatedHours: 160,
          },
        ],
      },
    ],
  };
}
