import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/Components/ui/select";
import { useToast } from '@/Components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import {
    Briefcase,
    GraduationCap,
    FileText,
    Building2,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    BookOpen,
    Users,
    Award,
    PencilRuler
} from 'lucide-react';
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";

// Types et interfaces
interface Reference {
    id?: number;
    name: string;
    function: string;
    email: string;
    telephone: string;
}

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
    attachment_size?: number;
    references?: Reference[];
}

interface Category {
    id: number;
    name: string;
}

interface AttachmentSummary {
    total_size: number;
    max_size: number;
    files_count: number;
}

interface Props {
    auth: { user: { id: number } };
    experiences: Experience[];
    categories: Category[];
    onUpdate: (experiences: Experience[]) => void;
}

// Templates pour les différents types d'expériences
const experienceData = {
    academic: {
        names: [
            "Baccalauréat",
            "Probatoire",
            "BEPC",
            "Formation en Informatique",
            "Certification en Bureautique",
            "Formation en Archivage Numérique",
            "Stage académique",
            "Projet d'études"
        ],
        institutions: [
            "Lycée Classique",
            "Lycée Technique",
            "Collège",
            "Centre de Formation Professionnelle",
            "Institut de Formation",
            "École de Commerce",
            "Université",
            "Centre de Formation Continue"
        ],
        descriptions: [
            "Acquisition des connaissances fondamentales et préparation aux études supérieures",
            "Formation aux outils bureautiques et à la gestion documentaire",
            "Apprentissage des techniques de classement et d'organisation",
            "Initiation aux méthodes d'archivage moderne",
            "Développement des compétences en communication et travail d'équipe",
            "Formation pratique aux outils informatiques essentiels",
            "Participation à des projets de groupe et présentations"
        ]
    },
    internship: {
        names: [
            "Stage en Archivage",
            "Stage en Bibliothèque",
            "Stage en Administration",
            "Assistant Documentaliste",
            "Stage en Gestion de Documents",
            "Stage en Secrétariat",
            "Stage en Saisie de Données",
            "Stage en Numérisation"
        ],
        companies: [
            "Bibliothèque Municipale",
            "Centre d'Archives",
            "Administration Publique",
            "Cabinet Comptable",
            "École",
            "ONG Locale",
            "PME",
            "Service Municipal"
        ],
        descriptions: [
            "Classement et organisation de documents administratifs",
            "Assistance dans la gestion quotidienne des archives",
            "Participation à la numérisation des documents",
            "Accueil et orientation des utilisateurs",
            "Saisie et mise à jour des bases de données",
            "Support aux tâches administratives courantes",
            "Aide à l'organisation d'événements"
        ],
        achievements: [
            "Amélioration du système de classement",
            "Participation à la transition numérique",
            "Création d'un nouveau système d'organisation",
            "Aide à la mise en place d'une base de données",
            "Contribution à l'efficacité du service",
            "Acquisition d'expérience pratique",
            "Développement de compétences professionnelles"
        ]
    },
    volunteer: {
        names: [
            "Bénévolat en Bibliothèque",
            "Assistant Archiviste Volontaire",
            "Soutien Administratif",
            "Aide à l'Organisation",
            "Participation Associative",
            "Support Communautaire",
            "Projet Social"
        ],
        institutions: [
            "Association Locale",
            "Centre Communautaire",
            "Organisation Caritative",
            "École Primaire",
            "Centre Culturel",
            "Maison de Quartier",
            "ONG"
        ],
        descriptions: [
            "Aide à l'organisation d'événements communautaires",
            "Soutien aux activités administratives",
            "Participation à des projets de classement",
            "Assistance aux membres de la communauté",
            "Contribution à la gestion documentaire",
            "Aide à la coordination d'activités",
            "Support aux tâches organisationnelles"
        ],
        outputs: [
            "Amélioration de l'organisation",
            "Contribution au développement local",
            "Mise en place de nouvelles méthodes",
            "Soutien efficace aux activités",
            "Développement personnel",
            "Acquisition d'expérience pratique",
            "Renforcement des compétences sociales"
        ]
    }
};

// Fonction utilitaire pour formater les tailles de fichiers
const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Fonction utilitaire pour obtenir un élément aléatoire d'un tableau
const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};
const ExperienceManager: React.FC<Props> = ({ auth, experiences: initialExperiences, categories, onUpdate }) => {
    // États
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>(initialExperiences);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [attachmentSummary, setAttachmentSummary] = useState<AttachmentSummary>({
        total_size: 0,
        max_size: 104857600, // 100MB par défaut
        files_count: 0
    });

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
        references: [] as Reference[]
    });

    // Effets
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
                exp.InstitutionName?.toLowerCase().includes(searchLower) ||
                exp.references?.some(ref =>
                    ref.name.toLowerCase().includes(searchLower) ||
                    ref.function.toLowerCase().includes(searchLower)
                )
            );
        }
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(exp =>
                exp.experience_categories_id.toString() === selectedCategory
            );
        }
        setFilteredExperiences(filtered);
    }, [searchTerm, experiences, selectedCategory]);

    useEffect(() => {
        fetchAttachmentStats();
    }, [experiences]);

    // Fonctions de gestion des données
    const fetchAttachmentStats = async () => {
        try {
            const totalSize = experiences.reduce((acc, exp) => acc + (exp.attachment_size || 0), 0);
            const filesCount = experiences.filter(exp => exp.attachment_path).length;
            setAttachmentSummary({
                total_size: totalSize,
                max_size: 104857600,
                files_count: filesCount
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
        }
    };

    const generatePredefinedExperience = (type: 'academic' | 'internship' | 'volunteer') => {
        const currentYear = new Date().getFullYear();
        const data = experienceData[type];
        const baseData = {
            experience_categories_id: type === 'academic' ? '2' : type === 'internship' ? '1' : '3',
            date_start: `${currentYear - 1}-09-01`,
            date_end: type === 'academic' ? `${currentYear}-06-30` : `${currentYear}-12-31`,
            comment: "Une expérience enrichissante qui m'a permis de développer mes compétences",
        };

        switch(type) {
            case 'academic':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    //@ts-ignore
                    InstitutionName: getRandomItem(data.institutions),
                    description: getRandomItem(data.descriptions),
                    output: "Formation complétée avec succès",
                };
            case 'internship':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    //@ts-ignore
                    InstitutionName: getRandomItem(data.companies),
                    description: getRandomItem(data.descriptions),
                    //@ts-ignore
                    output: getRandomItem(data.achievements),
                };
            case 'volunteer':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    //@ts-ignore
                    InstitutionName: getRandomItem(data.institutions),
                    //@ts-ignore
                    description: getRandomItem(data.descriptions),
                    //@ts-ignore
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
                    } else if (key === 'references' && Array.isArray(value)) {
                        formData.append('references', JSON.stringify(value));
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
            fetchAttachmentStats();

            toast({
                title: data.id ? "Expérience mise à jour" : "Expérience créée",
                description: "L'opération a été effectuée avec succès.",
            });

            resetForm();
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
        //@ts-ignore
        setData({
            ...experience,
            experience_categories_id: experience.experience_categories_id.toString(),
            attachment: null,
            references: experience.references || []
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (experienceId: number) => {
        try {
            await axios.delete(`/experiences/${experienceId}`);
            const updatedExperiences = experiences.filter(exp => exp.id !== experienceId);
            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);
            fetchAttachmentStats();

            toast({
                title: "Succès",
                description: "L'expérience a été supprimée.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "La suppression a échoué.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteAttachment = async (experienceId: number) => {
        try {
            await axios.delete(`/experiences/${experienceId}/attachment`);
            const updatedExperiences = experiences.map(exp => {
                if (exp.id === experienceId) {
                    return { ...exp, attachment_path: undefined, attachment_size: 0 };
                }
                return exp;
            });
            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);
            fetchAttachmentStats();

            toast({
                title: "Pièce jointe supprimée",
                description: "La pièce jointe a été supprimée avec succès.",
            });
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Impossible de supprimer la pièce jointe.",
                variant: "destructive",
            });
        }
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

    const resetForm = () => {
        reset();
        setData('id', '');
        setData('references', []);
        setIsFormOpen(false);
    };

    const handleTemplateSelection = (type: 'academic' | 'internship' | 'volunteer') => {
        const template = generatePredefinedExperience(type);
        if (template) {
            //@ts-ignore
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
    // Composant Card pour l'expérience
    const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience: exp }) => {
        const getCategoryIcon = (categoryId: string) => {
            switch(categoryId) {
                case '1': return <Briefcase className="w-4 h-4" />;  // Stage/Pro
                case '2': return <GraduationCap className="w-4 h-4" />; // Académique
                case '3': return <Users className="w-4 h-4" />; // Bénévolat
                default: return <Award className="w-4 h-4" />;
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
            >
                <Card className="border-amber-100 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-lg font-semibold">{exp.name}</h3>
                                    <Badge
                                        variant="secondary"
                                        className="bg-gradient-to-r from-amber-100 to-purple-100 flex items-center gap-1"
                                    >
                                        {getCategoryIcon(exp.experience_categories_id)}
                                        {categories.find(c => c.id === parseInt(exp.experience_categories_id))?.name}
                                    </Badge>
                                </div>

                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Building2 className="w-4 h-4 mr-2 text-amber-500" />
                                    <span>{exp.InstitutionName}</span>
                                </div>

                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                                    <span>
                                        {new Date(exp.date_start).toLocaleDateString('fr-FR')} -
                                        {exp.date_end ? new Date(exp.date_end).toLocaleDateString('fr-FR') : 'Présent'}
                                    </span>
                                </div>

                                {exp.references && exp.references.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-sm font-medium text-gray-700">Références:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {exp.references.map((ref, index) => (
                                                <div key={index} className="text-sm bg-gray-50 p-2 rounded-md">
                                                    <p className="font-medium">{ref.name}</p>
                                                    <p className="text-gray-600">{ref.function}</p>
                                                    {ref.email && (
                                                        <p className="text-gray-500 text-xs">{ref.email}</p>
                                                    )}
                                                    {ref.telephone && (
                                                        <p className="text-gray-500 text-xs">{ref.telephone}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 self-end sm:self-start">
                                {exp.attachment_path && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handlePreviewPDF(exp.attachment_path)}
                                        className="hover:bg-amber-50"
                                    >
                                        <Eye className="w-4 h-4 text-amber-500" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(exp)}
                                    className="hover:bg-purple-50"
                                >
                                    <Edit className="w-4 h-4 text-purple-500" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(exp.id)}
                                    className="hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-gray-600">{exp.description}</p>

                            {exp.output && (
                                <div className="bg-gradient-to-r from-amber-50 to-purple-50 p-3 rounded-md">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <p className="text-sm font-medium text-gray-700">Résultat obtenu:</p>
                                    </div>
                                    <p className="text-sm text-gray-600">{exp.output}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    // Composant pour le formulaire de référence
    const ReferenceForm: React.FC<{
        reference: Reference | null;
        onSave: (reference: Reference) => void;
        onCancel: () => void;
    }> = ({ reference, onSave, onCancel }) => {
        const [formData, setFormData] = useState<Reference>({
            name: reference?.name || '',
            function: reference?.function || '',
            email: reference?.email || '',
            telephone: reference?.telephone || '',
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="ref-name">Nom</Label>
                    <Input
                        id="ref-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-amber-200 focus:ring-amber-500"
                        placeholder="Nom de la référence"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ref-function">Fonction</Label>
                    <Input
                        id="ref-function"
                        value={formData.function}
                        onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                        className="border-amber-200 focus:ring-amber-500"
                        placeholder="Fonction de la référence"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ref-email">Email</Label>
                    <Input
                        id="ref-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="border-amber-200 focus:ring-amber-500"
                        placeholder="Email de la référence"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="ref-telephone">Téléphone</Label>
                    <Input
                        id="ref-telephone"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        className="border-amber-200 focus:ring-amber-500"
                        placeholder="Téléphone de la référence"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="border-amber-200 hover:bg-amber-50"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                    >
                        Enregistrer
                    </Button>
                </div>
            </form>
        );
    };
    // Rendu principal
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Mes Expériences</h2>
                    <p className="text-gray-500">
                        Partagez vos expériences académiques, stages et engagements
                    </p>
                </div>
            </div>

            <Tabs defaultValue="experiences" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="experiences" className="flex items-center gap-2">
                        <PencilRuler className="w-4 h-4" />
                        Liste des expériences
                    </TabsTrigger>
                    <TabsTrigger value="attachments" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Pièces jointes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="experiences">
                    <Card className="border-amber-100">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" />
                                        <Input
                                            type="text"
                                            placeholder="Rechercher une expérience..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 border-amber-200 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsFormOpen(true)}
                                    className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter une expérience
                                </Button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto py-4">
                                <Button
                                    variant={selectedCategory === 'all' ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setSelectedCategory('all')}
                                    className={selectedCategory === 'all' ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white' : ''}
                                >
                                    <PencilRuler className="w-4 h-4 mr-2" />
                                    Toutes
                                </Button>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedCategory === cat.id.toString() ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat.id.toString())}
                                        className={selectedCategory === cat.id.toString() ? 'bg-gradient-to-r from-amber-500 to-purple-500 text-white' : ''}
                                    >
                                        {cat.id === 1 && <Briefcase className="w-4 h-4 mr-2" />}
                                        {cat.id === 2 && <GraduationCap className="w-4 h-4 mr-2" />}
                                        {cat.id === 3 && <Users className="w-4 h-4 mr-2" />}
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                            <AnimatePresence mode="wait">
                                {filteredExperiences.length > 0 ? (
                                    filteredExperiences.map((exp) => (
                                        <ExperienceCard key={exp.id} experience={exp} />
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Card className="border-amber-100">
                                            <CardContent className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <PencilRuler className="w-12 h-12 text-amber-500" />
                                                    <p className="text-gray-500">
                                                        {searchTerm
                                                            ? "Aucune expérience ne correspond à votre recherche"
                                                            : "Commencez par ajouter votre première expérience !"
                                                        }
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="attachments">
                    <Card className="border-amber-100">
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {/* Statistiques des pièces jointes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-none">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        Espace utilisé
                                                    </p>
                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                        {formatBytes(attachmentSummary.total_size)}
                                                    </h3>
                                                </div>
                                                <FileText className="w-8 h-8 text-amber-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-none">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        Fichiers
                                                    </p>
                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                        {attachmentSummary.files_count}
                                                    </h3>
                                                </div>
                                                <FileText className="w-8 h-8 text-purple-500" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-none">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">
                                                        Espace disponible
                                                    </p>
                                                    <h3 className="text-2xl font-bold text-gray-900">
                                                        {formatBytes(attachmentSummary.max_size - attachmentSummary.total_size)}
                                                    </h3>
                                                </div>
                                                <FileText className="w-8 h-8 text-amber-500" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Liste des pièces jointes */}
                                <div className="space-y-4">
                                    {experiences
                                        .filter(exp => exp.attachment_path)
                                        .map(exp => (
                                            <Card key={exp.id} className="hover:shadow-md transition-all">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold">{exp.name}</h4>
                                                            <p className="text-sm text-gray-500">{exp.InstitutionName}</p>
                                                            {exp.attachment_size && (
                                                                <Badge variant="outline" className="mt-2">
                                                                    {formatBytes(exp.attachment_size)}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handlePreviewPDF(exp.attachment_path)}
                                                                className="hover:bg-amber-50"
                                                            >
                                                                <Eye className="w-4 h-4 text-amber-500" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(exp)}
                                                                className="hover:bg-purple-50"
                                                            >
                                                                <Edit className="w-4 h-4 text-purple-500" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteAttachment(exp.id)}
                                                                className="hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                    {experiences.filter(exp => exp.attachment_path).length === 0 && (
                                        <Card>
                                            <CardContent className="p-12 text-center">
                                                <FileText className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                                <p className="text-gray-500">
                                                    Aucune pièce jointe disponible. Ajoutez des documents à vos expériences !
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <PencilRuler className="w-5 h-5 text-amber-500" />
                            {data.id ? "Modifier l'expérience" : 'Nouvelle expérience'}
                        </SheetTitle>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                        <Card className="border-amber-100">
                            <CardHeader>
                                <CardTitle className="text-base">Modèles d'expérience</CardTitle>
                                <CardDescription>
                                    Sélectionnez un modèle pour démarrer rapidement
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleTemplateSelection('academic')}
                                    className="justify-start border-amber-200 hover:bg-amber-50"
                                >
                                    <GraduationCap className="w-4 h-4 mr-2 text-amber-500" />
                                    Formation Académique
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleTemplateSelection('internship')}
                                    className="justify-start border-amber-200 hover:bg-amber-50"
                                >
                                    <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                                    Stage Professionnel
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleTemplateSelection('volunteer')}
                                    className="justify-start border-amber-200 hover:bg-amber-50"
                                >
                                    <Users className="w-4 h-4 mr-2 text-amber-500" />
                                    Expérience Bénévole
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Intitulé</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ex: Stage en bibliothèque..."
                                    className="border-amber-200 focus:ring-amber-500"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="InstitutionName">Établissement</Label>
                                <Input
                                    id="InstitutionName"
                                    value={data.InstitutionName}
                                    onChange={(e) => setData('InstitutionName', e.target.value)}
                                    placeholder="Nom de l'établissement ou de l'organisation"
                                    className="border-amber-200 focus:ring-amber-500"
                                />
                                {errors.InstitutionName && (
                                    <p className="text-sm text-red-500">{errors.InstitutionName}</p>
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
                                    className="border-amber-200 focus:ring-amber-500"
                                />
                                {errors.date_start && (
                                    <p className="text-sm text-red-500">{errors.date_start}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_end">Date de fin</Label>
                                <Input
                                    id="date_end"
                                    type="date"
                                    value={data.date_end || ''}
                                    onChange={(e) => setData('date_end', e.target.value)}
                                    className="border-amber-200 focus:ring-amber-500"
                                />
                                <p className="text-xs text-gray-500">
                                    Laissez vide si en cours
                                </p>
                                {errors.date_end && <p className="text-sm text-red-500">{errors.date_end}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience_categories_id">Type d'expérience</Label>
                            <Select
                                value={data.experience_categories_id}
                                onValueChange={(value) => setData('experience_categories_id', value)}
                            >
                                <SelectTrigger className="border-amber-200 focus:ring-amber-500">
                                    <SelectValue placeholder="Sélectionnez un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            <div className="flex items-center gap-2">
                                                {cat.id === 1 && <Briefcase className="w-4 h-4 text-amber-500" />}
                                                {cat.id === 2 && <GraduationCap className="w-4 h-4 text-purple-500" />}
                                                {cat.id === 3 && <Users className="w-4 h-4 text-amber-500" />}
                                                {cat.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.experience_categories_id && (
                                <p className="text-sm text-red-500">{errors.experience_categories_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Décrivez vos responsabilités, tâches et apprentissages..."
                                rows={4}
                                className="border-amber-200 focus:ring-amber-500"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="output">Résultat/Réalisation</Label>
                            <Input
                                id="output"
                                value={data.output}
                                onChange={(e) => setData('output', e.target.value)}
                                placeholder="Ex: Compétences acquises, certificat obtenu..."
                                className="border-amber-200 focus:ring-amber-500"
                            />
                            {errors.output && <p className="text-sm text-red-500">{errors.output}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comment">Commentaire additionnel</Label>
                            <Textarea
                                id="comment"
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                placeholder="Autres informations pertinentes..."
                                className="border-amber-200 focus:ring-amber-500"
                            />
                            {errors.comment && <p className="text-sm text-red-500">{errors.comment}</p>}
                        </div>

                        {/* Section des références */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Références</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const references = [...(data.references || [])];
                                        references.push({ name: '', function: '', email: '', telephone: '' });
                                        setData('references', references);
                                    }}
                                    className="border-amber-200 hover:bg-amber-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ajouter une référence
                                </Button>
                            </div>

                            {data.references?.map((reference, index) => (
                                <Card key={index} className="border-amber-100">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    const references = [...data.references];
                                                    references.splice(index, 1);
                                                    setData('references', references);
                                                }}
                                                className="hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nom</Label>
                                                <Input
                                                    value={reference.name}
                                                    onChange={(e) => {
                                                        const references = [...data.references];
                                                        references[index] = {
                                                            ...reference,
                                                            name: e.target.value
                                                        };
                                                        setData('references', references);
                                                    }}
                                                    className="border-amber-200 focus:ring-amber-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Fonction</Label>
                                                <Input
                                                    value={reference.function}
                                                    onChange={(e) => {
                                                        const references = [...data.references];
                                                        references[index] = {
                                                            ...reference,
                                                            function: e.target.value
                                                        };
                                                        setData('references', references);
                                                    }}
                                                    className="border-amber-200 focus:ring-amber-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input
                                                    type="email"
                                                    value={reference.email}
                                                    onChange={(e) => {
                                                        const references = [...data.references];
                                                        references[index] = {
                                                            ...reference,
                                                            email: e.target.value
                                                        };
                                                        setData('references', references);
                                                    }}
                                                    className="border-amber-200 focus:ring-amber-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Téléphone</Label>
                                                <Input
                                                    value={reference.telephone}
                                                    onChange={(e) => {
                                                        const references = [...data.references];
                                                        references[index] = {
                                                            ...reference,
                                                            telephone: e.target.value
                                                        };
                                                        setData('references', references);
                                                    }}
                                                    className="border-amber-200 focus:ring-amber-500"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label>
                                <div className="flex items-center gap-2">
                                    <span>Pièce jointe</span>
                                    <Badge
                                        variant="secondary"
                                        className="bg-gradient-to-r from-amber-100 to-purple-100"
                                    >
                                        Max 5MB
                                    </Badge>
                                </div>
                            </Label>
                            <Input
                                id="attachment"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setData('attachment', file);
                                }}
                                className="border-amber-200 focus:ring-amber-500 cursor-pointer"
                                accept=".pdf,.doc,.docx"
                            />
                            {errors.attachment && (
                                <p className="text-sm text-red-500">{errors.attachment}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Formats acceptés: PDF, DOC, DOCX (Certificats, attestations...)
                            </p>
                        </div>

                        <div className="flex justify-between gap-2 sticky bottom-0 bg-white pt-4 border-t">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Chargement...
                                    </div>
                                ) : data.id ? 'Mettre à jour' : 'Enregistrer'}
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
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
};

export default ExperienceManager;
