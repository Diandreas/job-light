import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, FileUp, AlertCircle } from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Progress } from "@/Components/ui/progress";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';

interface CVAnalyzerProps {
    walletBalance: number;
    onAnalysisComplete: (cvData: any) => void;
    className?: string;
}

const ANALYSIS_COST = 5;
const ACCEPTED_TYPES = {
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
};

const CVAnalyzer: React.FC<CVAnalyzerProps> = ({ walletBalance, onAnalysisComplete, className = '' }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();
    const inputId = React.useId();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const file = event.target.files?.[0];

        if (!file) {
            console.log('No file selected');
            return;
        }

        if (walletBalance < ANALYSIS_COST) {
            toast({
                title: "Solde insuffisant",
                description: `L'analyse coûte ${ANALYSIS_COST} jetons. Veuillez recharger votre compte.`,
                variant: "destructive"
            });
            return;
        }

        if (!ACCEPTED_TYPES[file.type]) {
            toast({
                title: "Format non supporté",
                description: "Veuillez uploader un fichier PDF ou Word (.doc, .docx)",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsAnalyzing(true);
            setProgress(10);

            const formData = new FormData();
            formData.append('cv', file);

            const response = await axios.post('/api/cv/analyze', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
                    setProgress(progress);
                }
            });

            if (response.data.success) {
                setProgress(100);
                onAnalysisComplete(response.data.cvData);

                toast({
                    title: "Analyse terminée",
                    description: "Les informations de votre CV ont été extraites avec succès"
                });
            }

        } catch (error: any) {
            console.error('CV analysis error:', error);
            toast({
                title: "Erreur d'analyse",
                description: error.response?.data?.message || "Une erreur est survenue lors de l'analyse",
                variant: "destructive"
            });
        } finally {
            setIsAnalyzing(false);
            setProgress(0);
            // Réinitialiser l'input file
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={className}
        >
            <Card className="bg-gradient-to-br from-amber-50/50 to-purple-50/50 dark:from-amber-950/50 dark:to-purple-950/50 border-dashed border-2 border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                                    <Bot className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Analyse IA de CV existant</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Coût: {ANALYSIS_COST} jetons
                                    </p>
                                </div>
                            </div>

                            <Alert className="max-w-md bg-amber-100/50 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800">
                                <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                <AlertDescription className="text-amber-800 dark:text-amber-200">
                                    L'IA analysera votre CV et extraira automatiquement vos informations
                                </AlertDescription>
                            </Alert>

                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id={inputId}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileUpload}
                                    disabled={isAnalyzing || walletBalance < ANALYSIS_COST}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleButtonClick}
                                    disabled={isAnalyzing || walletBalance < ANALYSIS_COST}
                                    className="border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900"
                                >
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                            Analyse en cours...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <FileUp className="w-4 h-4" />
                                            Importer mon CV
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {isAnalyzing && (
                            <div className="space-y-2">
                                <Progress value={progress} className="h-2" />
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                                    Analyse et extraction des données...
                                </p>
                            </div>
                        )}

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Formats supportés: PDF, Word (.doc, .docx) - Maximum 10MB
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default CVAnalyzer;
