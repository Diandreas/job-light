import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { useCareerAdvisorStore, CVSection } from '@/stores/careerAdvisorStore';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Edit,
  TrendingUp,
  Users,
  Sparkles,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface HeatmapProps {
  auth: any;
  sections: CVSection[];
  overallScore: number;
  benchmarks?: {
    average: number;
    top10: number;
  };
}

export default function Heatmap({
  auth,
  sections: initialSections,
  overallScore: initialScore,
  benchmarks,
}: HeatmapProps) {
  const { cvSections, setCVSections, updateCVSection } = useCareerAdvisorStore();
  const [selectedSection, setSelectedSection] = useState<CVSection | null>(null);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'editor' | 'compare'>('heatmap');

  React.useEffect(() => {
    if (initialSections.length > 0) {
      setCVSections(initialSections);
    }
  }, [initialSections]);

  const sections = cvSections.length > 0 ? cvSections : initialSections;
  const overallScore = sections.length > 0
    ? Math.round(sections.reduce((sum, s) => sum + (s.score || 0), 0) / sections.length)
    : initialScore;

  const handleBack = () => {
    router.visit('/career-advisor');
  };

  const getSectionColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSectionIcon = (score: number) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Analyse CV - Heatmap Interactive" />

      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Analyse CV</h1>
              <p className="text-sm text-muted-foreground">
                Score Global: <span className={`font-bold ${getSectionColor(overallScore)}`}>
                  {overallScore}/100
                </span>
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList>
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="editor">Éditeur</TabsTrigger>
              <TabsTrigger value="compare">Comparer</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Heatmap View */}
        {activeTab === 'heatmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CV Preview with Sections */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Votre CV</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <SectionCard
                        section={section}
                        onClick={() => setSelectedSection(section)}
                        isSelected={selectedSection?.id === section.id}
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Section Detail Panel */}
            <div className="space-y-4">
              {selectedSection ? (
                <SectionDetailPanel
                  section={selectedSection}
                  onClose={() => setSelectedSection(null)}
                />
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Cliquez sur une section pour voir les détails
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Editor View */}
        {activeTab === 'editor' && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Éditeur de section - À implémenter
              </p>
            </CardContent>
          </Card>
        )}

        {/* Compare View */}
        {activeTab === 'compare' && benchmarks && (
          <CompareView
            yourScore={overallScore}
            avgScore={benchmarks.average}
            top10Score={benchmarks.top10}
            sections={sections}
          />
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span>Légende:</span>
          <span>🔴 {'<'}60</span>
          <span>🟡 60-79</span>
          <span>🟢 ≥80</span>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function SectionCard({
  section,
  onClick,
  isSelected,
}: {
  section: CVSection;
  onClick: () => void;
  isSelected: boolean;
}) {
  const score = section.score || 0;
  const icon = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';

  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-lg border-2 transition-all text-left
        ${isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-accent'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold capitalize">{section.type}</h3>
            <p className="text-sm text-muted-foreground">
              Score: {score}/100
            </p>
          </div>
        </div>
        <Edit className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
}

function SectionDetailPanel({
  section,
  onClose,
}: {
  section: CVSection;
  onClose: () => void;
}) {
  const score = section.score || 0;
  const issues = section.issues || [];
  const recommendations = section.recommendations || [];

  const potentialScore = score + recommendations.reduce((sum, rec) => {
    const match = rec.match(/\+(\d+)\s*pts?/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="capitalize">{section.type} Section</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score</span>
              <span className="text-2xl font-bold">{score}/100</span>
            </div>
            <Progress value={score} />
            <p className="text-xs text-muted-foreground mt-1">
              {score >= 80 && 'Excellent'}
              {score >= 60 && score < 80 && 'Besoin d\'amélioration'}
              {score < 60 && 'Nécessite du travail'}
            </p>
          </div>

          {/* Issues */}
          {issues.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Problèmes ({issues.length})
              </h4>
              <ul className="space-y-2">
                {issues.map((issue, i) => (
                  <li
                    key={i}
                    className="text-sm p-2 rounded bg-red-500/10 text-red-700 dark:text-red-300"
                  >
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                Recommandations
              </h4>
              <ul className="space-y-2">
                {recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="text-sm p-2 rounded bg-yellow-500/10"
                  >
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Potential Impact */}
          {potentialScore > score && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Impact Total</span>
                <Badge variant="secondary" className="bg-green-500/20">
                  +{potentialScore - score} pts
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Nouveau score: {potentialScore}/100
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" size="sm">
              🔧 Corriger
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              💡 Suggestions IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CompareView({
  yourScore,
  avgScore,
  top10Score,
  sections,
}: {
  yourScore: number;
  avgScore: number;
  top10Score: number;
  sections: CVSection[];
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Votre CV vs Benchmarks du Marché
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Comparison */}
          <div>
            <h3 className="font-semibold mb-4">Score Global</h3>
            <div className="space-y-3">
              <CompareBar label="Vous" value={yourScore} color="blue" />
              <CompareBar label="Moyenne" value={avgScore} color="gray" />
              <CompareBar label="Top 10%" value={top10Score} color="green" />
            </div>
          </div>

          {/* Section Breakdown */}
          <div>
            <h3 className="font-semibold mb-4">Par Section</h3>
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize">{section.type}</span>
                    <span className="font-medium">{section.score}/100</span>
                  </div>
                  <Progress value={section.score} />
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers Do */}
          <div className="p-4 rounded-lg bg-primary/5 border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Les Meilleurs Profils Font:
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                <span>Incluent 5+ accomplissements quantifiés (vous: 2)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                <span>Listent 8-12 compétences clés (vous: 5)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                <span>Ajoutent des certifications (vous: 0)</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1">
              Voir Profils Similaires
            </Button>
            <Button variant="outline" className="flex-1">
              Conseils Personnalisés
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompareBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'blue' | 'gray' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    gray: 'bg-gray-500',
    green: 'bg-green-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-bold">{value}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${colorClasses[color]}`}
        />
      </div>
    </div>
  );
}
