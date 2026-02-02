import React from 'react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { CoverLetterDraft } from '@/stores/careerAdvisorStore';
import { FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface LivePreviewProps {
  draft: CoverLetterDraft;
  template?: 'standard' | 'modern' | 'creative';
}

export function LivePreview({ draft, template = 'standard' }: LivePreviewProps) {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Export PDF');
  };

  const handleExportATS = () => {
    // TODO: Implement ATS-optimized export
    console.log('Export ATS PDF');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span className="font-semibold">Aperçu en direct</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF Standard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportATS}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF ATS
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-auto">
        <div
          className={`
            p-12 bg-white dark:bg-slate-900 min-h-[297mm] w-[210mm] mx-auto shadow-lg
            ${template === 'modern' ? 'font-sans' : ''}
            ${template === 'creative' ? 'border-l-4 border-primary' : ''}
          `}
          style={{
            fontSize: template === 'modern' ? '10pt' : '11pt',
            lineHeight: '1.6',
          }}
        >
          {/* Header - Sender Info */}
          <div className="mb-8">
            {draft.yourName && (
              <div className="font-bold text-lg mb-1">{draft.yourName}</div>
            )}
            {draft.yourAddress && (
              <div className="text-sm text-muted-foreground">
                {draft.yourAddress}
              </div>
            )}
            {(draft.yourEmail || draft.yourPhone) && (
              <div className="text-sm text-muted-foreground">
                {draft.yourEmail}
                {draft.yourEmail && draft.yourPhone && ' • '}
                {draft.yourPhone}
              </div>
            )}
          </div>

          {/* Recipient Info */}
          <div className="mb-8">
            <div className="text-sm text-muted-foreground mb-2">
              {currentDate}
            </div>
            {draft.companyName && (
              <div className="font-semibold">{draft.companyName}</div>
            )}
            {draft.recipientName && (
              <div className="text-sm">À l'attention de {draft.recipientName}</div>
            )}
          </div>

          {/* Subject */}
          {draft.subject && (
            <div className="mb-6">
              <div className="font-semibold underline">
                Objet : {draft.subject}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {draft.content ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-4 text-justify">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                }}
              >
                {draft.content}
              </ReactMarkdown>
            ) : (
              <div className="text-muted-foreground italic">
                Commencez à écrire votre lettre de motivation...
              </div>
            )}
          </div>

          {/* Closing */}
          {draft.content && (
            <div className="mt-12">
              <div className="mb-16 text-sm">Cordialement,</div>
              <div className="font-semibold">{draft.yourName || '[Votre nom]'}</div>
            </div>
          )}
        </div>
      </Card>

      {/* Template Selector */}
      <div className="mt-4 flex gap-2">
        <Badge
          variant={template === 'standard' ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          Standard
        </Badge>
        <Badge
          variant={template === 'modern' ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          Moderne
        </Badge>
        <Badge
          variant={template === 'creative' ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          Créatif
        </Badge>
      </div>
    </div>
  );
}
