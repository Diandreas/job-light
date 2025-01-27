import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Textarea } from "@/Components/ui/textarea";
import {
    TrashIcon, PencilIcon, PlusIcon, XIcon,
    Wand2, BookOpen, ChevronRight, CheckCircle
} from 'lucide-react';
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Alert, AlertDescription } from "@/Components/ui/alert";

// Réduire les templates à 3 options plus générales
const templates = {
    etudiant: {
        name: "Étudiant",
        description: "Jeune diplômé motivé, à l'écoute et dynamique. Formation académique solide avec une première expérience via des stages et projets étudiants. Maîtrise des outils informatiques et capacité d'apprentissage rapide."
    },
    archiviste: {
        name: "Assistant Archiviste",
        description: "Passionné par l'organisation et la préservation des documents. Méthodique et rigoureux, avec une bonne maîtrise des outils numériques. Capable de travailler en autonomie et en équipe."
    },
    debutant: {
        name: "Premier Emploi",
        description: "Bachelier enthousiaste et polyvalent, prêt à mettre en pratique mes connaissances. Forte capacité d'adaptation et volonté d'apprendre. Maîtrise des outils bureautiques de base."
    }
};

interface Summary {
    id: number;
    name: string;
    description: string;
}

interface Props {
    auth: any;
    summaries: Summary[];
    selectedSummary: Summary[];
    onUpdate: (summaries: Summary[]) => void;
}

const SummaryManager: React.FC<Props> = ({ auth, summaries: initialSummaries, selectedSummary: initialSelectedSummary, onUpdate }) => {
    const [summaries, setSummaries] = useState(initialSummaries);
    const [selectedSummary, setSelectedSummary] = useState(initialSelectedSummary);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filteredSummaries, setFilteredSummaries] = useState(initialSummaries);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    const { data, setData, processing, reset } = useForm({
        id: null,
        name: '',
        description: '',
    });

    useEffect(() => {
        setFilteredSummaries(
            summaries.filter((summary) =>
                summary.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [summaries, searchQuery]);

    useEffect(() => {
        setSummaries(initialSummaries);
        setSelectedSummary(initialSelectedSummary);
    }, [initialSummaries, initialSelectedSummary]);

    const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
            title,
            description,
            variant,
        });
    };

    const handleTemplateSelect = (template) => {
        setData({
            ...data,
            name: template.name,
            description: template.description
        });
    };

    const handleSelectSummary = async (summaryId) => {
        try {
            const response = await axios.post(route('summaries.select', summaryId));
            const updatedSummary = response.data.summary;
            const newSelectedSummary = [updatedSummary];

            setSelectedSummary(newSelectedSummary);
            setSummaries(prev => prev.map(summary =>
                summary.id === updatedSummary.id ? updatedSummary : summary
            ));

            onUpdate(newSelectedSummary);
            showToast("Succès", "Résumé sélectionné avec succès");
        } catch (error) {
            showToast("Erreur", "Impossible de sélectionner le résumé", "destructive");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(route('summaries.store'), data);
            const newSummary = response.data.summary;
            const updatedSummaries = [...summaries, newSummary];

            // Mettre à jour l'état local
            setSummaries(updatedSummaries);

            // Sélectionner automatiquement le nouveau résumé
            const newSelectedSummary = [newSummary];
            setSelectedSummary(newSelectedSummary);

            // Mettre à jour le parent
            onUpdate(newSelectedSummary);

            showToast("Succès", "Résumé créé avec succès");
            resetForm();
        } catch (error) {
            showToast("Erreur", error.response.data.message, "destructive");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(route('summaries.update', data.id), data);
            const updatedSummary = response.data.summary;

            // Mettre à jour la liste des résumés
            const updatedSummaries = summaries.map(summary =>
                summary.id === updatedSummary.id ? updatedSummary : summary
            );
            setSummaries(updatedSummaries);

            // Mettre à jour la sélection si le résumé modifié était sélectionné
            if (selectedSummary.some(s => s.id === updatedSummary.id)) {
                const newSelectedSummary = [updatedSummary];
                setSelectedSummary(newSelectedSummary);
                // Propager la mise à jour au parent
                onUpdate(newSelectedSummary);
            } else {
                // Si le résumé n'était pas sélectionné, le sélectionner automatiquement
                const newSelectedSummary = [updatedSummary];
                setSelectedSummary(newSelectedSummary);
                onUpdate(newSelectedSummary);
            }

            showToast("Succès", "Résumé mis à jour avec succès");
            resetForm();
        } catch (error) {
            showToast("Erreur", error.response.data.message, "destructive");
        }
    };

    const handleDelete = async (summaryId) => {
        try {
            await axios.delete(route('summaries.destroy', summaryId));
            const updatedSummaries = summaries.filter(summary => summary.id !== summaryId);
            setSummaries(updatedSummaries);

            if (selectedSummary.some(s => s.id === summaryId)) {
                setSelectedSummary([]);
                onUpdate([]);
            }

            showToast("Succès", "Résumé supprimé avec succès");
        } catch (error) {
            showToast("Erreur", "Impossible de supprimer le résumé", "destructive");
        }
    };

    const handleSelect = (summary) => {
        setData({
            id: summary.id,
            name: summary.name,
            description: summary.description,
        });
        setIsFormVisible(true);
    };

    const resetForm = () => {
        reset();
        setData('id', null);
        setIsFormVisible(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mes Résumés</h2>
                    <p className="text-gray-500">Gérez vos résumés professionnels</p>
                </div>
                <Button
                    onClick={() => setIsFormVisible(!isFormVisible)}
                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                >
                    {isFormVisible ? (
                        <><XIcon className="w-4 h-4 mr-2" /> Fermer</>
                    ) : (
                        <><PlusIcon className="w-4 h-4 mr-2" /> Nouveau résumé</>
                    )}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {isFormVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="border-amber-100 shadow-md">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    {data.id ? 'Modifier le résumé' : 'Créer un nouveau résumé'}
                                </CardTitle>
                                <CardDescription>
                                    Décrivez votre profil professionnel ou choisissez un modèle
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={data.id ? handleUpdate : handleCreate} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        {Object.entries(templates).map(([key, template]) => (
                                            <Card
                                                key={key}
                                                className="cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => handleTemplateSelect(template)}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-medium">
                                                        <BookOpen className="w-4 h-4 inline-block mr-2 text-amber-500"/>
                                                        {template.name}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-xs text-gray-500">{template.description}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Titre du poste</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="Ex: Commercial, Assistant administratif..."
                                                className="border-amber-200 focus:ring-amber-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                placeholder="Décrivez votre profil..."
                                                rows={6}
                                                className="border-amber-200 focus:ring-amber-500"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                            >
                                                {data.id ? 'Modifier' : 'Créer'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={resetForm}
                                                className="border-amber-200 hover:bg-amber-50"
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                <div className="relative">
                    <Input
                        type="text"
                        placeholder="Rechercher un résumé..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="max-w-md border-amber-200 focus:ring-amber-500"
                    />
                </div>

                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredSummaries.map((summary) => (
                                <motion.div
                                    key={summary.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="group"
                                >
                                    <Card className={`
                                        border-amber-100 transition-all duration-200
                                        ${selectedSummary.some(s => s.id === summary.id)
                                        ? 'shadow-md bg-gradient-to-r from-amber-50 to-purple-50'
                                        : 'hover:shadow-md'
                                    }
                                    `}>
                                        <CardHeader className="flex flex-row justify-between items-start space-y-0">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg">
                                                    {summary.name}
                                                </CardTitle>
                                                {selectedSummary.some(s => s.id === summary.id) && (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleSelect(summary)}
                                                    className="hover:bg-amber-50"
                                                >
                                                    <PencilIcon className="h-4 w-4 text-amber-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(summary.id)}
                                                    className="hover:bg-red-50"
                                                >
                                                    <TrashIcon className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="text-sm text-gray-600">{summary.description}</p>
                                            <Button
                                                variant={selectedSummary.some(s => s.id === summary.id) ? "default" : "outline"}
                                                onClick={() => handleSelectSummary(summary.id)}
                                                className={`w-full group ${
                                                    selectedSummary.some(s => s.id === summary.id)
                                                        ? 'bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white'
                                                        : 'border-amber-200 hover:bg-amber-50'
                                                }`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    {selectedSummary.some(s => s.id === summary.id)
                                                        ? 'Sélectionné'
                                                        : 'Sélectionner'}
                                                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                                                        selectedSummary.some(s => s.id === summary.id) ? 'text-white' : 'text-amber-500'
                                                    }`} />
                                                </div>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredSummaries.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <Alert variant="default" className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-100">
                                    <AlertDescription className="text-center py-4">
                                        {searchQuery
                                            ? "Aucun résumé ne correspond à votre recherche."
                                            : "Créez votre premier résumé professionnel !"}
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default SummaryManager;
