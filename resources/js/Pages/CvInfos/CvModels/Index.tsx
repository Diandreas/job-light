import React, { useState, useCallback, memo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Search, CheckCircle } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Dialog, DialogContent } from '@/Components/ui/dialog';

interface CvModel {
    id: number;
    name: string;
    previewImagePath: string;
    price: number;
    category: string;
}

const ModelCard = memo(({
                            model,
                            isActive,
                            onSelect,
                            onPreview,
                            loading,
                            actionLabel,
                            actionVariant = "outline"
                        }: {
    model: CvModel;
    isActive?: boolean;
    onSelect: (id: number) => void;
    onPreview: (model: CvModel) => void;
    loading: boolean;
    actionLabel: string;
    actionVariant?: "outline" | "secondary";
}) => (
    <div className={`p-4 rounded-lg border transition-all ${
        isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
        <div className="relative aspect-video mb-4 overflow-hidden rounded-md">
            <img
                src={`/storage/${model.previewImagePath}`}
                alt={model.name}
                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onPreview(model)}
            />
        </div>
        <div className="flex items-start justify-between gap-4">
            <div>
                <h3 className="font-medium">{model.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{model.category}</p>
                {model.price > 0 && (
                    <p className="text-sm font-medium mt-2">{model.price.toLocaleString()} FCFA</p>
                )}
            </div>
            <Button
                variant={actionVariant}
                size="sm"
                disabled={isActive || loading}
                onClick={() => onSelect(model.id)}
            >
                {actionLabel}
            </Button>
        </div>
    </div>
));

const PreviewModal = memo(({ model, onClose }: { model: CvModel | null; onClose: () => void }) => (
    <Dialog open={!!model} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
            {model && (
                <>
                    <img
                        src={`/storage/${model.previewImagePath}`}
                        alt={model.name}
                        className="w-full rounded-lg"
                    />
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Fermer
                        </Button>
                    </div>
                </>
            )}
        </DialogContent>
    </Dialog>
));

const CvModelsIndex = ({ auth, userCvModels, availableCvModels, maxAllowedModels }: Props) => {
    const { toast } = useToast();
    const [selectedModelId, setSelectedModelId] = useState<number>(auth.user.selected_cv_model_id);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [previewModel, setPreviewModel] = useState<CvModel | null>(null);

    const handleSelectModel = useCallback(async (cvModelId: number) => {
        try {
            setLoading(true);
            await axios.post('/user-cv-models/select-active', {
                user_id: auth.user.id,
                cv_model_id: cvModelId,
            });
            setSelectedModelId(cvModelId);
            toast({
                title: 'Success',
                description: 'CV model updated successfully.'
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'An error occurred.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [auth.user.id, toast]);

    const handleAddModel = useCallback(async (cvModel: CvModel) => {
        if (userCvModels.length >= maxAllowedModels) {
            toast({
                title: 'Limit Reached',
                description: `Maximum ${maxAllowedModels} models allowed.`,
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
                title: 'Error',
                description: error.response?.data?.message || 'An error occurred.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [userCvModels.length, maxAllowedModels, auth.user.id, toast]);

    const filteredModels = useCallback((models: CvModel[]) => {
        const searchLower = searchTerm.toLowerCase();
        return models.filter(model =>
            model.name.toLowerCase().includes(searchLower) ||
            model.category.toLowerCase().includes(searchLower)
        );
    }, [searchTerm]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="CV Models" />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold">My CV Models</h1>
                    <div className="flex items-center gap-2">
                        <Search className="text-gray-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search models..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                        />
                    </div>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium flex items-center gap-2">
                            <CheckCircle className="text-green-500 w-5 h-5" />
                            Active Models
                        </h2>
                        <span className="text-sm text-gray-500">
                            {userCvModels.length}/{maxAllowedModels} models
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModels(userCvModels).map((model) => (
                            <ModelCard
                                key={model.id}
                                model={model}
                                isActive={selectedModelId === model.id}
                                onSelect={handleSelectModel}
                                onPreview={setPreviewModel}
                                loading={loading}
                                actionLabel={selectedModelId === model.id ? 'Active' : 'Use'}
                                actionVariant={selectedModelId === model.id ? "secondary" : "outline"}
                            />
                        ))}
                    </div>
                </div>

                {availableCvModels.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-medium">Available Models</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModels(availableCvModels).map((model) => (
                                <ModelCard
                                    key={model.id}
                                    model={model}
                                    onSelect={() => handleAddModel(model)}
                                    onPreview={setPreviewModel}
                                    loading={loading}
                                    actionLabel="Add"
                                />
                            ))}
                        </div>
                    </div>
                )}

                <PreviewModal
                    model={previewModel}
                    onClose={() => setPreviewModel(null)}
                />
            </div>
        </AuthenticatedLayout>
    );
};

export default CvModelsIndex;
