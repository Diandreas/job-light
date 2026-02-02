import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { CoverLetterScore } from '@/utils/coverLetterScorer';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Lightbulb,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ATSScoreLiveProps {
  score: CoverLetterScore | null;
  isCalculating: boolean;
  previousScore?: number;
}

export function ATSScoreLive({
  score,
  isCalculating,
  previousScore,
}: ATSScoreLiveProps) {
  if (!score) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Commencez à écrire pour voir votre score ATS
          </div>
        </CardContent>
      </Card>
    );
  }

  const scoreDiff = previousScore ? score.overall - previousScore : 0;
  const scoreColor =
    score.overall >= 80
      ? 'text-green-600 dark:text-green-400'
      : score.overall >= 60
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Score ATS Global</h3>
            {isCalculating && (
              <Badge variant="secondary" className="animate-pulse">
                Calcul...
              </Badge>
            )}
          </div>

          <div className="flex items-end gap-3 mb-2">
            <div className={`text-5xl font-bold ${scoreColor}`}>
              {score.overall}
            </div>
            <div className="text-2xl text-muted-foreground pb-2">/100</div>
            {scoreDiff !== 0 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 pb-2"
              >
                {scoreDiff > 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      +{scoreDiff}
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {scoreDiff}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </div>

          <Progress value={score.overall} className="h-2" />

          <div className="mt-4 text-sm text-muted-foreground">
            {score.overall >= 80 && 'Excellent ! Votre lettre est bien optimisée.'}
            {score.overall >= 60 && score.overall < 80 && 'Bon travail ! Quelques améliorations possibles.'}
            {score.overall < 60 && 'Des améliorations significatives sont recommandées.'}
          </div>
        </CardContent>
      </Card>

      {/* Structure Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Score</span>
            <span className="font-semibold">{score.structure.score}/100</span>
          </div>
          <Progress value={score.structure.score} className="h-1" />

          <div className="space-y-2 text-sm">
            <StructureItem
              label="Formule d'appel"
              checked={score.structure.hasGreeting}
            />
            <StructureItem
              label="Introduction"
              checked={score.structure.hasIntro}
            />
            <StructureItem
              label={`Corps (${score.structure.bodyParagraphCount} §)`}
              checked={score.structure.hasBody}
              warning={score.structure.bodyParagraphCount < 2}
            />
            <StructureItem
              label="Conclusion"
              checked={score.structure.hasConclusion}
            />
            <StructureItem
              label="Formule finale"
              checked={score.structure.hasClosing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mots-clés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Correspondance</span>
            <span className="font-semibold">
              {score.keywords.matched}/{score.keywords.total}
            </span>
          </div>

          {score.keywords.detected.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Détectés</div>
              <div className="flex flex-wrap gap-1">
                {score.keywords.detected.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="text-xs bg-green-500/10 text-green-700 dark:text-green-300"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {score.keywords.missing.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Manquants</div>
              <div className="flex flex-wrap gap-1">
                {score.keywords.missing.slice(0, 8).map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tone Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analyse du ton</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToneBar label="Professionnalisme" value={score.tone.professionalism} />
          <ToneBar label="Enthousiasme" value={score.tone.enthusiasm} />
          <ToneBar label="Confiance" value={score.tone.confidence} />
        </CardContent>
      </Card>

      {/* Length Info */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Longueur</span>
            </div>
            <span className="font-medium">
              {score.length.wordCount} mots
              {score.length.optimal && (
                <CheckCircle2 className="w-4 h-4 inline ml-1 text-green-500" />
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Temps de lecture</span>
            </div>
            <span>{score.length.readingTime} min</span>
          </div>
          {!score.length.optimal && (
            <div className="text-xs text-muted-foreground">
              Optimal: 250-400 mots
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {score.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Suggestions IA ({score.suggestions.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {score.suggestions.slice(0, 5).map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SuggestionCard suggestion={suggestion} />
                </motion.div>
              ))}
            </AnimatePresence>

            {score.suggestions.length > 5 && (
              <Button variant="ghost" size="sm" className="w-full">
                Voir toutes les suggestions ({score.suggestions.length})
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StructureItem({
  label,
  checked,
  warning,
}: {
  label: string;
  checked: boolean;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      {checked ? (
        <CheckCircle2
          className={`w-4 h-4 ${
            warning ? 'text-yellow-500' : 'text-green-500'
          }`}
        />
      ) : (
        <X className="w-4 h-4 text-red-500" />
      )}
    </div>
  );
}

function ToneBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-1" />
    </div>
  );
}

function SuggestionCard({
  suggestion,
}: {
  suggestion: CoverLetterScore['suggestions'][0];
}) {
  const icon =
    suggestion.type === 'critical' ? (
      <AlertCircle className="w-4 h-4 text-red-500" />
    ) : suggestion.type === 'recommended' ? (
      <AlertCircle className="w-4 h-4 text-yellow-500" />
    ) : (
      <Lightbulb className="w-4 h-4 text-blue-500" />
    );

  return (
    <div className="p-3 rounded-lg border bg-card text-card-foreground">
      <div className="flex gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <p className="text-sm">{suggestion.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Impact: +{suggestion.impact} pts
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
