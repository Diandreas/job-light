import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Roadmap, Phase, Milestone } from '@/stores/careerAdvisorStore';
import { useCareerAdvisorStore } from '@/stores/careerAdvisorStore';
import {
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  BookOpen,
  Plus,
  Play,
  CheckCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface InteractiveTimelineProps {
  roadmap: Roadmap;
}

export function InteractiveTimeline({ roadmap }: InteractiveTimelineProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>(
    roadmap.currentPhaseId
  );
  const { updateMilestone } = useCareerAdvisorStore();

  const selectedPhase = roadmap.phases.find((p) => p.id === selectedPhaseId);

  const totalPhases = roadmap.phases.length;
  const completedPhases = roadmap.phases.filter((p) => p.progress === 100).length;

  const handleMilestoneToggle = (milestoneId: string, currentStatus: Milestone['status']) => {
    const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    updateMilestone(milestoneId, {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Progression</div>
            <div className="text-2xl font-bold">{roadmap.overallProgress}%</div>
            <Progress value={roadmap.overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Timeline</div>
            <div className="text-2xl font-bold">{roadmap.timeline}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Valeur Marché</div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {roadmap.marketValueCurrent ? (
                <>
                  {Math.round(roadmap.marketValueCurrent / 1000)}k€
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  {Math.round((roadmap.marketValueTarget! - roadmap.marketValueCurrent) / roadmap.marketValueCurrent * 100)}%
                </>
              ) : (
                'N/A'
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Difficulté</div>
            <div className="text-2xl font-bold flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={i < roadmap.difficulty ? 'text-yellow-500' : 'text-gray-300'}
                >
                  ⭐
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Visualization */}
      <Card>
        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-1">{roadmap.title}</h3>
            <p className="text-sm text-muted-foreground">
              Phases: {completedPhases}/{totalPhases} complétées
            </p>
          </div>

          <div className="relative">
            {/* Timeline Bar */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${roadmap.overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              />
            </div>

            {/* Phase Nodes */}
            <div className="relative flex justify-between items-start pt-4 pb-8">
              {roadmap.phases.map((phase, index) => (
                <PhaseNode
                  key={phase.id}
                  phase={phase}
                  isSelected={selectedPhaseId === phase.id}
                  onClick={() => setSelectedPhaseId(phase.id)}
                  position={index === 0 ? 'start' : index === totalPhases - 1 ? 'end' : 'middle'}
                />
              ))}
            </div>

            {/* Timeline Labels */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Maintenant</span>
              {roadmap.phases.slice(1, -1).map((phase, i) => (
                <span key={i}>{phase.duration}</span>
              ))}
              <span>Objectif</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Phase Detail */}
      {selectedPhase && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Phase {selectedPhase.order}: {selectedPhase.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedPhase.description}
                </p>
              </div>
              <Badge variant={selectedPhase.progress === 100 ? 'default' : 'secondary'}>
                {selectedPhase.progress}% complété
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={selectedPhase.progress} />

            {/* Milestones */}
            <div className="space-y-3">
              {selectedPhase.milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onToggle={() => handleMilestoneToggle(milestone.id, milestone.status)}
                />
              ))}
            </div>

            <Button variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un Milestone Personnalisé
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats & Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Stats & Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Temps Investi</div>
              <div className="text-xl font-bold">42 heures</div>
              <p className="text-xs text-muted-foreground">sur ~200 estimées</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Skills Gap</div>
              <div className="text-xl font-bold">12 compétences</div>
              <p className="text-xs text-muted-foreground">à acquérir</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">État</div>
              <div className="text-xl font-bold text-green-600">Sur la bonne voie ✓</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              📊 Analytics Détaillées
            </Button>
            <Button variant="outline" className="flex-1">
              🎯 Ajuster Objectifs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PhaseNode({
  phase,
  isSelected,
  onClick,
  position,
}: {
  phase: Phase;
  isSelected: boolean;
  onClick: () => void;
  position: 'start' | 'middle' | 'end';
}) {
  const isComplete = phase.progress === 100;

  return (
    <motion.button
      onClick={onClick}
      className={`relative flex flex-col items-center group ${
        position === 'start' ? 'items-start' : position === 'end' ? 'items-end' : ''
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Node Circle */}
      <div
        className={`
          w-16 h-16 rounded-full border-4 flex items-center justify-center
          transition-all duration-300 relative z-10
          ${
            isComplete
              ? 'bg-green-500 border-green-600'
              : phase.progress > 0
              ? 'bg-blue-500 border-blue-600'
              : 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600'
          }
          ${isSelected ? 'ring-4 ring-primary/50 scale-110' : ''}
        `}
      >
        {isComplete ? (
          <CheckCircle2 className="w-8 h-8 text-white" />
        ) : phase.progress > 0 ? (
          <Circle className="w-8 h-8 text-white fill-current" />
        ) : (
          <Circle className="w-8 h-8 text-gray-600" />
        )}
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
          {phase.title}
        </div>
        <div className="text-xs text-muted-foreground">{phase.duration}</div>
        {phase.progress > 0 && phase.progress < 100 && (
          <Badge variant="secondary" className="mt-1 text-xs">
            {phase.progress}%
          </Badge>
        )}
      </div>
    </motion.button>
  );
}

function MilestoneCard({
  milestone,
  onToggle,
}: {
  milestone: Milestone;
  onToggle: () => void;
}) {
  const isComplete = milestone.status === 'completed';
  const isInProgress = milestone.status === 'in_progress';

  return (
    <motion.div
      layout
      className={`
        p-4 rounded-lg border-2 transition-all
        ${
          isComplete
            ? 'bg-green-500/10 border-green-500/30'
            : isInProgress
            ? 'bg-blue-500/10 border-blue-500/30'
            : 'bg-card border-border'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="mt-1 flex-shrink-0"
        >
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-medium ${isComplete ? 'line-through text-muted-foreground' : ''}`}>
                {milestone.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {milestone.description}
              </p>
            </div>
            <Badge variant="secondary">
              Impact: +{milestone.impact} pts
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
            {milestone.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Échéance: {new Date(milestone.dueDate).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
            {milestone.estimatedHours && (
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{milestone.estimatedHours}h estimées</span>
              </div>
            )}
            {milestone.difficulty && (
              <Badge variant="outline" className="text-xs">
                {milestone.difficulty === 'easy' && '🟢 Facile'}
                {milestone.difficulty === 'medium' && '🟡 Moyen'}
                {milestone.difficulty === 'hard' && '🔴 Difficile'}
              </Badge>
            )}
          </div>

          {milestone.resources && milestone.resources.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-1">Ressources:</p>
              <div className="flex flex-wrap gap-2">
                {milestone.resources.map((resource, i) => (
                  <a
                    key={i}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {resource.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {!isComplete && (
            <div className="flex gap-2 mt-3">
              {!isInProgress && (
                <Button size="sm" variant="outline" className="text-xs">
                  <Play className="w-3 h-3 mr-1" />
                  Commencer
                </Button>
              )}
              {isInProgress && (
                <Button size="sm" onClick={onToggle} className="text-xs">
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Marquer Terminé
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
