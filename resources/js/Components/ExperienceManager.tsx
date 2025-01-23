import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { useToast } from '@/Components/ui/use-toast';
import {
    Briefcase, Edit, Trash2, Eye, FileUp, Search,
    GraduationCap, Building2, Flag, X, ChevronRight,
    Menu, Plus
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import axios from "axios";
import Swal from 'sweetalert2';
import { Badge } from "@/Components/ui/badge";
import { Skeleton } from "@/Components/ui/skeleton";
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces
interface Experience {
    id: number;
    name: string;
    description: string;
    date_start: string;
    date_end: string | null;
    output: string;
    experience_categories_id: string;
    comment: string;
    InstitutionName: string;
    attachment_path?: string;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    auth: { user: { id: number } };
    experiences: Experience[];
    categories: Category[];
    onUpdate: (experiences: Experience[]) => void;
}

// Experience Database for Templates
const experienceData = {
    academic: {
        names: [
            "Licence en Informatique",
            "Master en Génie Logiciel",
            "Doctorat en Intelligence Artificielle",
            "BTS en Réseaux et Systèmes",
            "DUT en Informatique"
        ],
        institutions: [
            "Université de Yaoundé I",
            "École Polytechnique de Yaoundé",
            "Institut Saint Jean",
            "IUT de Bandjoun",
            "Université de Douala"
        ],
        descriptions: [
            "Formation approfondie en développement logiciel",
            "Spécialisation en intelligence artificielle",
            "Programme intensif en génie logiciel",
            "Formation en administration système et réseaux",
            "Cursus orienté data science et analyse de données"
        ]
    },
    professional: {
        titles: [
            "Développeur Full Stack",
            "Ingénieur DevOps",
            "Chef de Projet IT",
            "Architecte Logiciel",
            "Analyste Programmeur"
        ],
        companies: [
            "Orange Cameroun",
            "MTN Cameroun",
            "CAMTEL",
            "Total Energies Cameroun",
            "UBA Cameroun"
        ],
        descriptions: [
            "Développement et maintenance d'applications d'entreprise",
            "Mise en place de solutions cloud et DevOps",
            "Gestion de projets informatiques critiques",
            "Conception d'architectures logicielles scalables",
            "Analyse et développement de solutions métier"
        ],
        achievements: [
            "Réduction de 40% du temps de déploiement",
            "Amélioration de la performance des applications",
            "Mise en place réussie d'une architecture microservices",
            "Optimisation des processus de développement",
            "Implémentation de CI/CD pipelines"
        ]
    },
    research: {
        titles: [
            "Chercheur en IA",
            "Assistant de Recherche",
            "Doctorant Chercheur",
            "Chercheur en Big Data",
            "Analyste de Données de Recherche"
        ],
        institutions: [
            "Laboratoire d'IA - UY1",
            "Centre de Recherche en Informatique",
            "Institut de Recherche Technologique",
            "Département R&D - Orange Labs",
            "Centre d'Innovation MTN"
        ],
        descriptions: [
            "Recherche sur les algorithmes d'apprentissage profond",
            "Analyse de données massives pour la prise de décision",
            "Développement de modèles prédictifs innovants",
            "Étude des systèmes de recommandation",
            "Recherche en traitement du langage naturel"
        ],
        outputs: [
            "Publication dans une revue internationale",
            "Présentation à une conférence majeure",
            "Développement d'un nouveau modèle d'IA",
            "Dépôt de brevet technologique",
            "Prix de meilleure recherche"
        ]
    }
};

const ExperienceManager: React.FC<Props> = ({ auth, experiences: initialExperiences, categories, onUpdate }) => {
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>(initialExperiences);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { toast } = useToast();

    const { data, setData, reset, errors } = useForm({
        id: '',
        name: '',
        description: '',
        date_start: '',
        date_end: '',
        output: '',
        experience_categories_id: '',
        comment: '',
        InstitutionName: '',
        attachment: null as File | null,
    });

    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    useEffect(() => {
        let filtered = experiences;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(exp =>
                exp.name?.toLowerCase().includes(searchLower) ||
                exp.description?.toLowerCase().includes(searchLower) ||
                exp.InstitutionName?.toLowerCase().includes(searchLower)
            );
        }
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(exp =>
                exp.experience_categories_id.toString() === selectedCategory
            );
        }
        setFilteredExperiences(filtered);
    }, [searchTerm, experiences, selectedCategory]);

    const getRandomItem = <T,>(array: T[]): T => {
        return array[Math.floor(Math.random() * array.length)];
    };

    const generatePredefinedExperience = (type: 'academic' | 'professional' | 'research') => {
        const currentYear = new Date().getFullYear();
        const data = experienceData[type];
        const baseData = {
            experience_categories_id: type === 'academic' ? '2' : type === 'professional' ? '1' : '3',
            date_start: `${currentYear - 2}-01-01`,
            date_end: `${currentYear}-12-31`,
            comment: "Expérience enrichissante",
        };

        switch(type) {
            case 'academic':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    InstitutionName: getRandomItem(data.institutions),
                    description: getRandomItem(data.descriptions),
                    output: "Diplôme obtenu avec mention",
                };
            case 'professional':
                return {
                    ...baseData,
                    name: getRandomItem(data.titles),
                    InstitutionName: getRandomItem(data.companies),
                    description: getRandomItem(data.descriptions),
                    output: getRandomItem(data.achievements),
                };
            case 'research':
                return {
                    ...baseData,
                    name: getRandomItem(data.titles),
                    InstitutionName: getRandomItem(data.institutions),
                    description: getRandomItem(data.descriptions),
                    output: getRandomItem(data.outputs),
                };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'attachment' && value instanceof File) {
                        formData.append('attachment', value);
                    } else if (key !== 'attachment') {
                        formData.append(key, value.toString());
                    }
                }
            });

            const response = data.id
                ? await axios.post(`/experiences/${data.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { _method: 'PUT' }
                })
                : await axios.post('/experiences', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            const updatedExperiences = data.id
                ? experiences.map(exp => exp.id === response.data.experience.id ? response.data.experience : exp)
                : [...experiences, response.data.experience];

            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);

            toast({
                title: data.id ? "Expérience mise à jour" : "Expérience créée",
                description: "L'opération a été effectuée avec succès.",
            });

            resetForm();
            setIsFormOpen(false);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Une erreur est survenue.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (experience: Experience) => {
        setData({
            ...experience,
            experience_categories_id: experience.experience_categories_id.toString(),
            attachment: null
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (experienceId: number) => {
        const result = await Swal.fire({
            title: 'Voulez-vous supprimer cette expérience ?',
            text: "Cette action est irréversible",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/experiences/${experienceId}`);
                const updatedExperiences = experiences.filter(exp => exp.id !== experienceId);
                setExperiences(updatedExperiences);
                onUpdate(updatedExperiences);
                toast({
                    title: "Succès",
                    description: "L'expérience a été supprimée.",
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Erreur",
                    description: "La suppression a échoué.",
                    variant: "destructive",
                });
            }
        }
    };

    const resetForm = () => {
        reset();
        setData('id', null);
        setIsFormOpen(false);
    };

    const handlePreviewPDF = (attachmentUrl?: string) => {
        if (!attachmentUrl) {
            toast({
                title: 'Pas de fichier',
                description: 'Aucune pièce jointe disponible.',
                variant: 'destructive',
            });
            return;
        }
        window.open(attachmentUrl, '_blank')?.focus();
    };

    const handleTemplateSelection = (type: 'academic' | 'professional' | 'research') => {
        const template = generatePredefinedExperience(type);
        if (template) {
            setData(prev => ({
                ...prev,
                ...template
            }));
            toast({
                title: "Modèle appliqué",
                description: "Vous pouvez maintenant personnaliser les informations.",
            });
        }
    };

    const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience: exp }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="transition-all hover:shadow-md">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold">{exp.name}</h3>
                                <Badge variant="outline" className="hidden sm:inline-flex">
                                    {categories.find(c => c.id === parseInt(exp.experience_categories_id))?.name}
                                </Badge>
                            </div>

                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Building2 className="w-4 h-4 mr-2" />
                                <span>{exp.InstitutionName}</span>
                            </div>

                            <div className="text-sm text-muted-foreground mt-1">
                                {new Date(exp.date_start).toLocaleDateString('fr-FR')} -
                                {exp.date_end ? new Date(exp.date_end).toLocaleDateString('fr-FR') : 'Présent'}
                            </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-start">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(exp)}
                                className="hover:bg-primary/10"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="sr-only">Modifier</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(exp.id)}
                                className="hover:bg-destructive/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">Supprimer</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <p className="text-sm line-clamp-3">{exp.description}</p>

                        {exp.output && (
                            <div className="bg-primary/5 p-3 rounded-md">
                                <p className="text-sm font-medium">Résultat:</p>
                                <p className="text-sm">{
                                    exp.output}</p>
                            </div>
                        )}

                        {exp.attachment_path && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreviewPDF(exp.attachment_path)}
                                className="w-full sm:w-auto"
                            >
                                <FileUp className="w-4 h-4 mr-2" />
                                Voir la pièce jointe
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Briefcase className="text-primary hidden sm:block" />
                    <h1 className="text-2xl font-bold">Expériences</h1>
                </div>

                <div className="w-full sm:w-auto flex gap-2">
                    <div className="flex-1 sm:w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <SheetTrigger asChild>
                            <Button className="whitespace-nowrap">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>{data.id ? 'Modifier l\'expérience' : 'Nouvelle expérience'}</SheetTitle>
                            </SheetHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 p-4">
                                {/* Section des modèles */}
                                <div className="mb-6 space-y-4 border-b pb-4">
                                    <div className="space-y-2">
                                        <Label>Choisir un modèle</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleTemplateSelection('professional')}
                                                className="flex items-center justify-start"
                                            >
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                Expérience Professionnelle
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleTemplateSelection('academic')}
                                                className="flex items-center justify-start"
                                            >
                                                <GraduationCap className="w-4 h-4 mr-2" />
                                                Expérience Académique
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleTemplateSelection('research')}
                                                className="flex items-center justify-start"
                                            >
                                                <Flag className="w-4 h-4 mr-2" />
                                                Expérience de Recherche
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Formulaire */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Intitulé</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ex: Développeur Full Stack..."
                                        />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="InstitutionName">Établissement/Entreprise</Label>
                                        <Input
                                            id="InstitutionName"
                                            value={data.InstitutionName}
                                            onChange={(e) => setData('InstitutionName', e.target.value)}
                                            placeholder="Nom de l'établissement"
                                        />
                                        {errors.InstitutionName && (
                                            <p className="text-sm text-destructive">{errors.InstitutionName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_start">Date de début</Label>
                                        <Input
                                            id="date_start"
                                            type="date"
                                            value={data.date_start}
                                            onChange={(e) => setData('date_start', e.target.value)}
                                        />
                                        {errors.date_start && (
                                            <p className="text-sm text-destructive">{errors.date_start}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_end">Date de fin</Label>
                                        <Input
                                            id="date_end"
                                            type="date"
                                            value={data.date_end || ''}
                                            onChange={(e) => setData('date_end', e.target.value)}
                                        />
                                        {errors.date_end && <p className="text-sm text-destructive">{errors.date_end}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Décrivez l'expérience..."
                                        rows={4}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="output">Résultat/Réalisation</Label>
                                    <Input
                                        id="output"
                                        value={data.output}
                                        onChange={(e) => setData('output', e.target.value)}
                                        placeholder="Ex: Diplôme obtenu, Projet livré..."
                                    />
                                    {errors.output && <p className="text-sm text-destructive">{errors.output}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experience_categories_id">Catégorie</Label>
                                    <Select
                                        value={data.experience_categories_id}
                                        onValueChange={(value) => setData('experience_categories_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez une catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.experience_categories_id && (
                                        <p className="text-sm text-destructive">{errors.experience_categories_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="comment">Commentaire additionnel</Label>
                                    <Textarea
                                        id="comment"
                                        value={data.comment}
                                        onChange={(e) => setData('comment', e.target.value)}
                                        placeholder="Informations complémentaires..."
                                    />
                                    {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="attachment">Pièce jointe</Label>
                                    <Input
                                        id="attachment"
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setData('attachment', file);
                                        }}
                                        className="cursor-pointer"
                                    />
                                    {errors.attachment && (
                                        <p className="text-sm text-destructive">{errors.attachment}</p>
                                    )}
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Chargement...' : data.id ? 'Mettre à jour' : 'Enregistrer'}
                                    </Button>
                                    {data.id && (
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Annuler
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={selectedCategory === 'all' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                    >
                        Toutes
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id.toString() ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedCategory(cat.id.toString())}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i}>
                                    <CardContent className="p-6">
                                        <Skeleton className="h-6 w-2/3 mb-4" />
                                        <Skeleton className="h-4 w-1/3 mb-2" />
                                        <Skeleton className="h-20 w-full" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : filteredExperiences.length > 0 ? (
                            filteredExperiences.map((exp) => (
                                <ExperienceCard key={exp.id} experience={exp} />
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <p className="text-muted-foreground">
                                        {searchTerm
                                            ? "Aucune expérience ne correspond à votre recherche"
                                            : "Commencez par ajouter votre première expérience"
                                        }
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ExperienceManager;
