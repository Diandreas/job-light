import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useToast } from '@/Components/ui/use-toast';
import { Textarea } from "@/Components/ui/textarea";
import { TrashIcon, PencilIcon, PlusIcon, XIcon, Wand2 } from 'lucide-react';
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

// Base de données simplifiée pour génération de résumés
const generalProfiles = {
    skills: [
        "travail en équipe",
        "communication",
        "organisation",
        "adaptation",
        "capacité d'apprentissage",
        "sens du service",
        "rigueur",
        "ponctualité",
        "polyvalence",
        "esprit d'initiative",
        "sens des responsabilités",
        "gestion du temps",
        "efficacité",
        "relation client",
        "respect des procédures",
        "capacité d'écoute"
    ],

    experiences: [
        "stage en entreprise",
        "job étudiant",
        "bénévolat",
        "projet personnel",
        "formation pratique",
        "projet d'études",
        "service civique",
        "aide familiale",
        "projet associatif",
        "travail saisonnier",
        "alternance",
        "première expérience professionnelle"
    ],

    qualities: [
        "motivé",
        "dynamique",
        "sérieux",
        "à l'écoute",
        "impliqué",
        "fiable",
        "enthousiaste",
        "sociable",
        "ponctuel",
        "consciencieux",
        "autonome",
        "rigoureux"
    ],

    objectives: [
        "acquérir de l'expérience professionnelle",
        "développer mes compétences",
        "intégrer une équipe dynamique",
        "contribuer au succès de l'entreprise",
        "évoluer professionnellement",
        "apprendre de nouvelles méthodes de travail",
        "mettre en pratique mes connaissances",
        "participer à des projets enrichissants",
        "progresser dans mon domaine",
        "m'investir dans de nouveaux défis"
    ],

    domains: [
        "commercial",
        "administratif",
        "service client",
        "vente",
        "accueil",
        "logistique",
        "assistance",
        "support",
        "restauration",
        "hôtellerie",
        "commerce",
        "distribution"
    ]
};

const generateSimpleResume = (userTitle = '') => {
    const getRandomItems = (array, count) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    const qualities = getRandomItems(generalProfiles.qualities, 2);
    const skills = getRandomItems(generalProfiles.skills, 3);
    const experience = getRandomItems(generalProfiles.experiences, 1)[0];
    const objective = getRandomItems(generalProfiles.objectives, 1)[0];
    const domain = getRandomItems(generalProfiles.domains, 1)[0];

    let title = userTitle || `${domain.charAt(0).toUpperCase() + domain.slice(1)}`;

    const introTemplates = [
        `Profil ${qualities.join(" et ")} avec une première expérience en tant que ${experience}.`,
        `Jeune professionnel ${qualities.join(" et ")} ayant découvert le domaine via ${experience}.`,
        `Candidat ${qualities.join(" et ")} avec une expérience enrichissante en ${experience}.`
    ];

    const skillsTemplates = [
        `Possède de solides compétences en ${skills.join(", ")}.`,
        `Fait preuve d'aptitudes en ${skills.join(", ")}.`,
        `Démontre des capacités en ${skills.join(", ")}.`
    ];

    const objectiveTemplates = [
        `Souhaite ${objective} pour développer mon potentiel.`,
        `Motivé à ${objective} au sein d'une entreprise dynamique.`,
        `Cherche à ${objective} dans un environnement stimulant.`
    ];

    const description = `${getRandomItems(introTemplates, 1)[0]} ${getRandomItems(skillsTemplates, 1)[0]} ${getRandomItems(objectiveTemplates, 1)[0]}`;

    return {
        name: title,
        description: description
    };
};

const SummaryManager = ({ auth, summaries: initialSummaries, selectedSummary: initialSelectedSummary }) => {
    const [summaries, setSummaries] = useState(initialSummaries);
    const [selectedSummary, setSelectedSummary] = useState(initialSelectedSummary);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filteredSummaries, setFilteredSummaries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, processing, errors, reset } = useForm({
        id: null,
        name: '',
        description: '',
    });

    const showAlert = (title, icon = 'success') => {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        // @ts-ignore
        Toast.fire({ icon, title });
    };

    useEffect(() => {
        setFilteredSummaries(
            summaries.filter((summary) =>
                summary.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [summaries, searchQuery]);

    const handleAutoFill = () => {
        const newSummary = generateSimpleResume(data.name);
        setData({
            ...data,
            name: data.name || newSummary.name,
            description: newSummary.description
        });
    };

    const handleSelectSummary = (summaryId) => {
        axios.post(route('summaries.select', summaryId))
            .then(response => {
                const updatedSummary = response.data.summary;
                setSelectedSummary([updatedSummary]);
                setSummaries(prevSummaries =>
                    prevSummaries.map(summary =>
                        summary.id === updatedSummary.id ? updatedSummary : summary
                    )
                );
                showAlert('Résumé sélectionné avec succès');
            })
            .catch(error => {
                console.error(error);
                showAlert('Erreur lors de la sélection du résumé', 'error');
            });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        axios.post(route('summaries.store'), data)
            .then(response => {
                setSummaries([...summaries, response.data.summary]);
                showAlert('Résumé créé avec succès');
                resetForm();
            })
            .catch(error => {
                handleValidationErrors(error.response.data.errors);
            });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        axios.put(route('summaries.update', data.id), data)
            .then(response => {
                setSummaries(prevSummaries =>
                    prevSummaries.map(summary =>
                        summary.id === response.data.summary.id ? response.data.summary : summary
                    )
                );
                showAlert('Résumé mis à jour avec succès');
                resetForm();
            })
            .catch(error => {
                handleValidationErrors(error.response.data.errors);
            });
    };

    const handleDelete = (summaryId) => {
        Swal.fire({
            title: 'Supprimer ce résumé ?',
            text: "Cette action est irréversible",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(route('summaries.destroy', summaryId))
                    .then(() => {
                        setSummaries(prevSummaries =>
                            prevSummaries.filter(summary => summary.id !== summaryId)
                        );
                        if (selectedSummary.some(s => s.id === summaryId)) {
                            setSelectedSummary([]);
                        }
                        showAlert('Résumé supprimé avec succès');
                    })
                    .catch(error => {
                        console.error(error);
                        showAlert('Erreur lors de la suppression', 'error');
                    });
            }
        });
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

    const handleValidationErrors = (errors) => {
        const errorMessages = Object.values(errors).join('\n');
        showAlert(errorMessages, 'error');
    };

    return (
        <div className="container mx-auto p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Mes Résumés</h1>
                <Button onClick={() => setIsFormVisible(!isFormVisible)}>
                    {isFormVisible ? (
                        <><XIcon className="w-4 h-4 mr-2" /> Fermer</>
                    ) : (
                        <><PlusIcon className="w-4 h-4 mr-2" /> Nouveau résumé</>
                    )}
                </Button>
            </div>

            {isFormVisible && (
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={data.id ? handleUpdate : handleCreate} className="space-y-4">
                            <div>
                                <div className="flex justify-end mb-4">
                                    <Button
                                        type="button"
                                        onClick={handleAutoFill}
                                        variant="outline"
                                        className="flex items-center"
                                    >
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Suggérer un résumé
                                    </Button>
                                </div>

                                <Label htmlFor="name">Poste ou titre</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Ex: Vendeur, Assistant administratif..."
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Décrivez votre profil..."
                                    rows={6}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="submit" disabled={processing}>
                                    {data.id ? 'Modifier' : 'Créer'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <Input
                    type="text"
                    placeholder="Rechercher un résumé..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="max-w-md"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSummaries.map((summary) => (
                        <Card key={summary.id} className={
                            selectedSummary.some(s => s.id === summary.id)
                                ? 'border-primary'
                                : ''
                        }>
                            <CardHeader className="flex flex-row justify-between items-start space-y-0">
                                <CardTitle className="text-lg">{summary.name}</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleSelect(summary)}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(summary.id)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">{summary.description}</p>
                                <Button
                                    variant={selectedSummary.some(s => s.id === summary.id) ? "default" : "outline"}
                                    onClick={() => handleSelectSummary(summary.id)}
                                    className="w-full"
                                >
                                    {selectedSummary.some(s => s.id === summary.id)
                                        ? 'Sélectionné'
                                        : 'Sélectionner'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredSummaries.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-6">
                            <p className="text-gray-500">
                                {searchQuery
                                    ? "Aucun résumé ne correspond à votre recherche."
                                    : "Aucun résumé disponible. Créez votre premier résumé !"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SummaryManager;
