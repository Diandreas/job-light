import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/Components/ui/use-toast';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";

import { useTranslation } from 'react-i18next';

interface Props {
    text: string;
    onRephrased: (text: string) => void;
    className?: string;
}

const AIRephraseButton: React.FC<Props> = ({ text, onRephrased, className }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();

    const handleRephrase = async (tone: string) => {
        if (!text || text.trim().length < 10) {
            toast({
                title: t('ai.error.too_short_title') || "Texte trop court",
                description: t('ai.error.too_short_desc') || "Le texte doit contenir au moins 10 caractères pour être reformulé.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/api/cv/rephrase', {
                text,
                tone
            });

            if (response.data.success) {
                onRephrased(response.data.rephrased);
                setIsOpen(false);
                toast({
                    title: t('ai.success.title') || "Reformulation réussie",
                    description: t('ai.success.desc') || "Le texte a été amélioré par l'IA.",
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: t('common.error') || "Erreur",
                description: t('ai.error.generic') || "Impossible de reformuler le texte pour le moment.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 cursor-pointer ${className}`}
                >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {t('ai.improve_button') || "Améliorer avec IA"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 z-[9999]" align="start">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 px-2 py-1">{t('ai.choose_tone') || "Choisir le ton :"}</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8 cursor-pointer"
                        onClick={() => handleRephrase('professional')}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : (t('ai.tone.professional') || "👔 Professionnel")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8 cursor-pointer"
                        onClick={() => handleRephrase('concise')}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : (t('ai.tone.concise') || "⚡ Concis")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8 cursor-pointer"
                        onClick={() => handleRephrase('creative')}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : (t('ai.tone.creative') || "✨ Créatif")}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AIRephraseButton;
