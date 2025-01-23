import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { Search, CheckCircle } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from "@/Components/ui/alert";

interface CvModel {
    id: number;
    name: string;
    previewImagePath: string;
    price: number;
    category: string;
}

interface Props {
    auth: any;
    userCvModels: CvModel[];
    availableCvModels: CvModel[];
    maxAllowedModels: number;
}

const CvModelsIndex = ({ auth, userCvModels, availableCvModels, maxAllowedModels }: Props) => {
    const { toast } = useToast();
    const [selectedModelId, setSelectedModelId] = useState<number>(auth.user.selected_cv_model_id);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [previewModel, setPreviewModel] = useState<CvModel | null>(null);

    const handleSelectModel = async (cvModelId: number) => {
        try {
            setLoading(true);
            await axios.post('/user-cv-models/select-active', {
                user_id: auth.user.id,
                cv_model_id: cvModelId,
            });
            setSelectedModelId(cvModelId);
            toast({
                title: 'Modèle sélectionné',
                description: 'Votre modèle de CV actif a été mis à jour.'
            });
        } catch (error: any) {
            toast({
                title: 'Erreur',
                description: error.response?.data?.message || 'Une erreur est survenue.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddModel = async (cvModel: CvModel) => {
        if (userCvModels.length >= maxAllowedModels) {
            toast({
                title: 'Limite atteinte',
                description: `Vous ne pouvez pas ajouter plus de ${maxAllowedModels} modèles.`,
                variant: 'destructive'
            });
            return;
        }

        try {
            setLoading(true);
            await axios.post('/user-cv-models', {
                user_id: auth.user.id,
                cv_model_id: cvModel.id,
            });
            window.location.reload();
        } catch (error: any) {
            toast({
                title: 'Erreur',
                description: error.response?.data?.message || 'Une erreur est survenue.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredModels = (models: CvModel[]) => {
        return models.filter(model =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mes modèles de CV" />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold">Mes modèles de CV</h1>
                    <div className="flex items-center gap-2">
                        <Search className="text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Rechercher un modèle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                    </div>
                </div>

                {/* Modèles actifs */}
                <div className="space-y-6 mb-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium flex items-center gap-2">
                            <CheckCircle className="text-green-500 w-5 h-5" />
                            Modèles actifs
                        </h2>
                        <span className="text-sm text-gray-500">
                            {userCvModels.length}/{maxAllowedModels} modèles
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModels(userCvModels).map((model) => (
                            <div key={model.id}
                                 className={`p-4 rounded-lg border transition-all ${
                                     selectedModelId === model.id
                                         ? 'border-green-500 bg-green-50'
                                         : 'border-gray-200 hover:border-gray-300'
                                 }`}
                            >
                                <div className="relative aspect-video mb-4 overflow-hidden rounded-md">
                                    <img
                                        src={`/storage/${model.previewImagePath}`}
                                        alt={model.name}
                                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => setPreviewModel(model)}
                                    />
                                </div>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-medium">{model.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{model.category}</p>
                                    </div>
                                    <Button
                                        variant={selectedModelId === model.id ? "secondary" : "outline"}
                                        size="sm"
                                        disabled={selectedModelId === model.id || loading}
                                        onClick={() => handleSelectModel(model.id)}
                                    >
                                        {selectedModelId === model.id ? 'Actif' : 'Utiliser'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modèles disponibles */}
                {availableCvModels.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-medium">Modèles disponibles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModels(availableCvModels).map((model) => (
                                <div key={model.id} className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                                    <div className="relative aspect-video mb-4 overflow-hidden rounded-md">
                                        <img
                                            src={`/storage/${model.previewImagePath}`}
                                            alt={model.name}
                                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => setPreviewModel(model)}
                                        />
                                    </div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-medium">{model.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{model.category}</p>
                                            <p className="text-sm font-medium mt-2">
                                                {model.price === 0 ? 'Gratuit' : `${model.price.toLocaleString()} FCFA`}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={loading}
                                            onClick={() => handleAddModel(model)}
                                        >
                                            Ajouter
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal de prévisualisation */}
                {previewModel && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPreviewModel(null)}>
                        <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
                            <img
                                src={`/storage/${previewModel.previewImagePath}`}
                                alt={previewModel.name}
                                className="max-w-full h-auto"
                            />
                            <div className="mt-4 flex justify-end">
                                <Button variant="outline" onClick={() => setPreviewModel(null)}>
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
};

export default CvModelsIndex;
