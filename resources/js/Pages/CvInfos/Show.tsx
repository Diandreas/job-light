import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Head } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Download, Eye, Printer } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";

interface CvModelProps {
    id: number;
    viewPath: string;
}

interface Props {
    auth: {
        user: any;
    };
    cvInformation: any;
    selectedCvModel: CvModelProps | null;
}

export default function Show({ auth, cvInformation, selectedCvModel }: Props) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    if (!selectedCvModel) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Mon CV Professionnel</h2>}
            >
                <Head title="CV Professionnel" />
                <div className="w-full p-6">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-center text-gray-600">
                                Veuillez sélectionner un modèle de CV dans la section "Mes designs" avant de continuer.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    const handlePreview = () => {
        const previewUrl = route('cv.preview', { id: selectedCvModel.id });
        window.open(previewUrl, '_blank');
    };

    const handlePrint = () => {
        const printUrl = route('cv.preview', { id: selectedCvModel.id });
        const printWindow = window.open(printUrl, '_blank');
        printWindow?.addEventListener('load', () => {
            printWindow.print();
        });
    };

    const handleDownload = async () => {
        try {
            setIsLoading(true);
            window.location.href = route('cv.download', { id: selectedCvModel.id });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors du téléchargement du CV.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Mon CV Professionnel</h2>}
        >
            <Head title="CV Professionnel" />
            <div className="w-full p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Exporter Mon CV</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Button
                                    onClick={handleDownload}
                                    className="bg-primary w-full md:w-auto"
                                    disabled={isLoading}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Téléchargement...' : 'Télécharger PDF'}
                                </Button>
                                <Button onClick={handlePreview} variant="outline" className="w-full md:w-auto">
                                    <Eye className="mr-2 h-4 w-4" />
                                    Prévisualiser
                                </Button>
                                <Button onClick={handlePrint} variant="outline" className="w-full md:w-auto">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimer
                                </Button>
                            </div>

                            <div className="w-full border rounded-lg bg-white shadow-sm overflow-auto">
                                <iframe
                                    src={route('cv.preview', { id: selectedCvModel.id })}
                                    className="w-full h-[800px] md:h-[600px] border-0 rounded-lg"
                                    title="CV Preview"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
