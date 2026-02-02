import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/Components/ui/resizable';
import { LivePreview } from '@/Components/ai/immersive/cover-letter/LivePreview';
import { ATSScoreLive } from '@/Components/ai/immersive/cover-letter/ATSScoreLive';
import { useCoverLetterDraft } from '@/Components/ai/hooks/useCoverLetterDraft';
import { useATSScoring } from '@/Components/ai/hooks/useATSScoring';
import { useCoverLetterAI } from '@/Components/ai/hooks/useAIStream';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Download,
  FileText,
  Loader2,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface EditorProps {
  auth: any;
  jobKeywords?: string[];
}

export default function Editor({ auth, jobKeywords = [] }: EditorProps) {
  const { draft, updateDraft, initializeDraft } = useCoverLetterDraft();
  const [previousScore, setPreviousScore] = useState<number | undefined>();

  useEffect(() => {
    initializeDraft();
  }, []);

  const { score, isCalculating } = useATSScoring(
    draft?.content || '',
    jobKeywords
  );

  const {
    content: aiContent,
    isStreaming,
    startStream,
    reset: resetAI,
  } = useCoverLetterAI();

  useEffect(() => {
    if (score && draft?.content) {
      setPreviousScore(score.overall);
    }
  }, [score?.overall]);

  useEffect(() => {
    if (aiContent && !isStreaming) {
      updateDraft({ content: aiContent });
      toast.success('Contenu généré avec succès');
      resetAI();
    }
  }, [aiContent, isStreaming]);

  const handleGenerateWithAI = async () => {
    if (!draft) return;

    const context = {
      yourName: draft.yourName,
      companyName: draft.companyName,
      recipientName: draft.recipientName,
      subject: draft.subject,
      jobKeywords: jobKeywords,
      currentContent: draft.content,
    };

    try {
      await startStream(context);
    } catch (error) {
      toast.error('Erreur lors de la génération');
      console.error(error);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Brouillon sauvegardé');
  };

  const handleBack = () => {
    router.visit('/career-advisor');
  };

  if (!draft) {
    return (
      <AuthenticatedLayout user={auth.user}>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Éditeur de Lettre de Motivation" />

      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h1 className="font-semibold">Lettre de Motivation</h1>
              </div>
              {score && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Score ATS:
                    </span>
                    <span
                      className={`font-bold ${
                        score.overall >= 80
                          ? 'text-green-600 dark:text-green-400'
                          : score.overall >= 60
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {score.overall}%
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateWithAI}
                disabled={isStreaming}
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer avec l'IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Panel - Editor */}
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full overflow-auto p-6 space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="yourName">Votre nom</Label>
                      <Input
                        id="yourName"
                        value={draft.yourName}
                        onChange={(e) => updateDraft({ yourName: e.target.value })}
                        placeholder="Jean Dupont"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yourAddress">Votre adresse</Label>
                      <Input
                        id="yourAddress"
                        value={draft.yourAddress}
                        onChange={(e) => updateDraft({ yourAddress: e.target.value })}
                        placeholder="123 Rue de la République, 75001 Paris"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="yourEmail">Email</Label>
                        <Input
                          id="yourEmail"
                          type="email"
                          value={draft.yourEmail}
                          onChange={(e) => updateDraft({ yourEmail: e.target.value })}
                          placeholder="jean.dupont@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="yourPhone">Téléphone</Label>
                        <Input
                          id="yourPhone"
                          type="tel"
                          value={draft.yourPhone}
                          onChange={(e) => updateDraft({ yourPhone: e.target.value })}
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Entreprise</Label>
                      <Input
                        id="companyName"
                        value={draft.companyName}
                        onChange={(e) => updateDraft({ companyName: e.target.value })}
                        placeholder="TechCorp France"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipientName">Contact recruteur</Label>
                      <Input
                        id="recipientName"
                        value={draft.recipientName}
                        onChange={(e) => updateDraft({ recipientName: e.target.value })}
                        placeholder="M. Martin, Responsable RH"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="subject">Objet</Label>
                      <Input
                        id="subject"
                        value={draft.subject}
                        onChange={(e) => updateDraft({ subject: e.target.value })}
                        placeholder="Candidature au poste de Développeur Full-Stack"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <Label htmlFor="content">Contenu de la lettre</Label>
                      <Textarea
                        id="content"
                        value={draft.content}
                        onChange={(e) => updateDraft({ content: e.target.value })}
                        placeholder="Madame, Monsieur,

Actuellement [votre situation], je me permets de vous adresser ma candidature pour le poste de [poste] au sein de [entreprise].

[Développez votre expérience et compétences...]

[Expliquez votre motivation...]

[Conclusion]

Cordialement,"
                        className="min-h-[400px] font-mono text-sm"
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {draft.content.split(/\s+/).filter((w) => w.trim()).length}{' '}
                        mots • Vous pouvez utiliser Markdown pour la mise en forme
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Center Panel - Preview */}
            <ResizablePanel defaultSize={35} minSize={25}>
              <div className="h-full overflow-auto p-6">
                <LivePreview draft={draft} template={draft.template} />
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* Right Panel - Scoring */}
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="h-full overflow-auto p-6">
                <ATSScoreLive
                  score={score}
                  isCalculating={isCalculating}
                  previousScore={previousScore}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
