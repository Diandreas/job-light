// src/Components/ai/PresentationGenerator.tsx
import React, { useState } from 'react';
import { Presentation, Download, Loader, Check } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';
import { PowerPointService } from '@/Components/ai/PresentationService';

interface PresentationGeneratorProps {
    jsonContent: string;
    contextId: string;
}

const PresentationGenerator: React.FC<PresentationGeneratorProps> = ({
                                                                         jsonContent,
                                                                         contextId
                                                                     }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);

            // Essayer de parser le JSON pour validation
            let jsonData;
            try {
                jsonData = JSON.parse(jsonContent);
            } catch (error) {
                toast({
                    title: "Erreur de format",
                    description: "Le contenu JSON n'est pas valide. Veuillez réessayer.",
                    variant: "destructive"
                });
                setIsGenerating(false);
                return;
            }

            // Générer la présentation PowerPoint
            const pptxBlob = await PowerPointService.generateFromJSON(jsonContent);

            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(pptxBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `presentation-${contextId}.pptx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);

            toast({
                title: "Succès",
                description: "Votre présentation PowerPoint a été générée avec succès"
            });
        } catch (error) {
            console.error('Error generating presentation:', error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la génération de la présentation",
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || !jsonContent}
            className="border-amber-200 dark:border-gray-700 text-gray-700 dark:text-gray-300
                     hover:bg-amber-50 dark:hover:bg-gray-800 flex items-center gap-2"
        >
            {isGenerating ? (
                <Loader className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Presentation className="h-4 w-4" />
            )}
            <span>Générer PowerPoint</span>
            <Download className="h-4 w-4 ml-1" />
        </Button>
    );
};

export default PresentationGenerator;
