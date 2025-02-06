import React, { useState, useEffect, useCallback } from 'react';
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
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle} from "@/Components/ui/sheet";
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

// Interfaces
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

// Fonction utilitaire pour formater les tailles de fichiers
const formatBytes = (bytes: number | undefined): string => {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];

    const posBytes = Math.abs(bytes);
    const i = Math.floor(Math.log(posBytes) / Math.log(k));
    const sizeIndex = Math.min(i, sizes.length - 1);

    const formattedValue = (posBytes / Math.pow(k, sizeIndex)).toFixed(2);

    return `${formattedValue} ${sizes[sizeIndex]}`;
};
// experienceData.ts
export const experienceData = {
    academic: {
        names: [
            "Formation en Développement Web",
            "Master en Informatique",
            "Certification en Gestion de Projet",
            "Licence en Technologies Numériques",
            "Formation en Cybersécurité",
            "Programme Data Science",
            "Certification Cloud Computing",
            "Formation en Intelligence Artificielle"
        ],
        institutions: [
            "École Supérieure du Digital",
            "Institut des Technologies Avancées",
            "Centre de Formation Tech",
            "Université des Sciences Appliquées",
            "Académie du Numérique",
            "Institut de Formation Professionnelle",
            "École d'Ingénierie Digitale"
        ],
        descriptions: [
            "Programme intensif combinant théorie et pratique. Réalisation de projets concrets en utilisant les technologies les plus récentes. Développement de compétences techniques et méthodologiques avancées.",
            "Formation approfondie axée sur les technologies émergentes. Participation à des projets innovants et acquisition d'une expertise technique pointue. Travail en équipe sur des cas réels.",
            "Apprentissage des meilleures pratiques et méthodologies actuelles. Développement de compétences techniques et soft skills essentielles. Réalisation de projets pratiques avec des technologies modernes.",
            "Programme complet couvrant les aspects théoriques et pratiques du domaine. Acquisition d'une expertise technique approfondie et développement de compétences transversales."
        ]
    },
    internship: {
        names: [
            "Stage Développeur Full-Stack",
            "Stage DevOps",
            "Stage Data Analyst",
            "Stage en Cybersécurité",
            "Stage Développeur Mobile",
            "Stage en Intelligence Artificielle",
            "Stage UX/UI Designer",
            "Stage Chef de Projet Digital"
        ],
        companies: [
            "TechStart Solutions",
            "Digital Innovation Lab",
            "NextGen Technologies",
            "SmartTech Solutions",
            "DataCraft Systems",
            "InnovateTech",
            "WebSphere Solutions",
            "FutureTech Industries"
        ],
        descriptions: [
            "Participation active au développement de projets innovants. Collaboration étroite avec les équipes techniques et métier. Mise en œuvre de solutions techniques avancées.",
            "Implication dans la conception et le développement de nouvelles fonctionnalités. Travail sur des projets d'envergure utilisant les dernières technologies. Participation aux phases d'analyse, développement et déploiement.",
            "Contribution au développement de solutions techniques innovantes. Participation à l'amélioration continue des processus et méthodes. Collaboration avec des équipes pluridisciplinaires.",
            "Participation à des projets techniques complexes. Utilisation des méthodologies agiles et des meilleures pratiques de développement. Travail en étroite collaboration avec les experts du domaine."
        ],
        achievements: [
            "Développement et déploiement réussi de nouvelles fonctionnalités clés",
            "Optimisation significative des performances du système",
            "Mise en place d'une nouvelle architecture technique",
            "Amélioration de la qualité du code et réduction de la dette technique",
            "Implémentation de solutions innovantes pour des problèmes complexes",
            "Création d'outils et frameworks réutilisables",
            "Contribution majeure à la réussite de projets stratégiques"
        ]
    },
    volunteer: {
        names: [
            "Mentor Tech pour Débutants",
            "Organisateur d'Ateliers Coding",
            "Formateur Bénévole en Informatique",
            "Contributeur Open Source",
            "Animateur Club Robotique",
            "Support Technique Associatif",
            "Coach Digital pour Seniors",
            "Organisateur Hackathon Solidaire"
        ],
        institutions: [
            "TechForAll Association",
            "CodeCommunity",
            "DigitalForGood",
            "TechHelpers",
            "AssociaTech",
            "OpenSourceCommunity",
            "DigitalSolidaire",
            "TechEducation"
        ],
        descriptions: [
            "Animation d'ateliers d'initiation aux technologies numériques. Accompagnement personnalisé des apprenants dans leur montée en compétences. Création de contenu pédagogique adapté.",
            "Organisation et animation de sessions de formation technique. Accompagnement de projets digitaux à impact social. Développement de solutions numériques pour associations.",
            "Participation active à des projets technologiques communautaires. Contribution au développement de solutions open source. Partage de connaissances et support technique.",
            "Mise en place d'initiatives d'éducation numérique. Animation de communautés tech et partage d'expertise. Développement de projets collaboratifs à impact social."
        ],
        outputs: [
            "Création d'une communauté d'entraide technique active",
            "Développement de ressources pédagogiques open source",
            "Mise en place d'un programme de mentorat tech",
            "Organisation réussie d'événements tech communautaires",
            "Contribution significative à des projets open source",
            "Accompagnement de projets digitaux solidaires",
            "Formation réussie de nouveaux développeurs"
        ]
    }
};

// Fonction utilitaire pour générer des dates cohérentes
export const generateDates = (type: 'academic' | 'internship' | 'volunteer') => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    let startDate, endDate;

    switch(type) {
        case 'academic':
            // Format année scolaire/universitaire
            startDate = `${currentYear-1}-09-01`;
            endDate = `${currentYear}-06-30`;
            break;
        case 'internship':
            // Format 6 mois
            startDate = `${currentYear}-01-01`;
            endDate = `${currentYear}-06-30`;
            break;
        case 'volunteer':
            // Format année civile
            startDate = `${currentYear-1}-01-01`;
            endDate = `${currentYear}-12-31`;
            break;
    }

    return { startDate, endDate };
};

// Fonction utilitaire pour obtenir un élément aléatoire d'un tableau
export const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

// Fonction principale pour générer une expérience prédéfinie
export const generatePredefinedExperience = (type: 'academic' | 'internship' | 'volunteer') => {
    const data = experienceData[type];
    const dates = generateDates(type);

    const baseData = {
        experience_categories_id: type === 'academic' ? '2' : type === 'internship' ? '1' : '3',
        date_start: dates.startDate,
        date_end: dates.endDate,
        comment: "Cette expérience m'a permis de développer de nouvelles compétences et d'acquérir une expertise précieuse dans le domaine.",
        references: [{
            name: "Jean Dupont",
            function: "Responsable Technique",
            email: "contact@example.com",
            telephone: "+33 1 23 45 67 89"
        }]
    };

    switch(type) {
        case 'academic':
            return {
                ...baseData,
                name: getRandomItem(data.names),
                InstitutionName: getRandomItem(data.institutions),
                description: getRandomItem(data.descriptions),
                output: "Acquisition des compétences techniques et validation du programme avec succès",
            };
        case 'internship':
            return {
                ...baseData,
                name: getRandomItem(data.names),
                InstitutionName: getRandomItem(data.companies),
                description: getRandomItem(data.descriptions),
                output: getRandomItem(data.achievements),
            };
        case 'volunteer':
            return {
                ...baseData,
                name: getRandomItem(data.names),
                InstitutionName: getRandomItem(data.institutions),
                description: getRandomItem(data.descriptions),
                output: getRandomItem(data.outputs),
            };
    }
};

const ExperienceManager: React.FC<Props> = ({ auth, experiences: initialExperiences, categories, onUpdate }) => {
    // États
    const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
    const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>(initialExperiences);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentTab, setCurrentTab] = useState('experiences');
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

    // Calcul des statistiques des attachments
    const calculateAttachmentStats = useCallback(() => {
        const totalSize = experiences.reduce((acc, exp) => {
            const size = exp.attachment_size ? Number(exp.attachment_size) : 0;
            return acc + (isNaN(size) ? 0 : size);
        }, 0);

        const filesCount = experiences.filter(exp =>
            exp.attachment_path && exp.attachment_size && Number(exp.attachment_size) > 0
        ).length;

        setAttachmentSummary(prev => ({
            ...prev,
            total_size: totalSize,
            files_count: filesCount
        }));
    }, [experiences]);

    // Effets
    useEffect(() => {
        setExperiences(initialExperiences);
    }, [initialExperiences]);

    useEffect(() => {
        calculateAttachmentStats();
    }, [experiences, calculateAttachmentStats]);

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
    // Fonctions de gestion


    const handleEdit = (experience: Experience) => {
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
            calculateAttachmentStats(); // Recalculer les statistiques

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
        setIsLoading(true);
        try {
            const response = await axios.delete(`/experiences/${experienceId}/attachment`);

            if (response.status === 200) {
                // Mise à jour locale de l'état
                const updatedExperiences = experiences.map(exp => {
                    if (exp.id === experienceId) {
                        return {
                            ...exp,
                            attachment_path: undefined,
                            attachment_size: 0
                        };
                    }
                    return exp;
                });

                setExperiences(updatedExperiences);
                onUpdate(updatedExperiences);
                calculateAttachmentStats();

                toast({
                    title: "Succès",
                    description: "La pièce jointe a été supprimée avec succès.",
                });

                // Si nous sommes dans le formulaire d'édition, mettre à jour l'état du formulaire
                if (data.id === experienceId) {
                    setData(prev => ({
                        ...prev,
                        attachment_path: undefined,
                        attachment_size: 0,
                        attachment: null
                    }));
                }
            }
        } catch (error: any) {
            console.error('Erreur lors de la suppression:', error);

            // Message d'erreur plus détaillé
            let errorMessage = "Impossible de supprimer la pièce jointe. ";
            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            } else if (error.message) {
                errorMessage += error.message;
            }

            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData();

            // Gestion des données de base
            Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (key === 'attachment' && value instanceof File) {
                        formData.append('attachment', value);
                    } else if (key === 'references' && Array.isArray(value)) {
                        formData.append('references', JSON.stringify(value));
                    } else if (key !== 'attachment') {
                        formData.append(key, String(value));
                    }
                }
            });

            // Ajout d'un flag pour indiquer si une pièce jointe doit être supprimée
            if (data.id && !data.attachment && !data.attachment_path) {
                formData.append('remove_attachment', '1');
            }

            const response = data.id
                ? await axios.post(`/experiences/${data.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { _method: 'PUT' }
                })
                : await axios.post('/experiences', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

            const updatedExperience = {
                ...response.data.experience,
                attachment_path: response.data.experience.attachment_path,
                attachment_size: response.data.experience.attachment_size
            };

            const updatedExperiences = data.id
                ? experiences.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp)
                : [...experiences, updatedExperience];

            setExperiences(updatedExperiences);
            onUpdate(updatedExperiences);
            calculateAttachmentStats();

            toast({
                title: data.id ? "Expérience mise à jour" : "Expérience créée",
                description: "L'opération a été effectuée avec succès.",
            });

            resetForm();
        } catch (error: any) {
            console.error('Erreur complète:', error);

            let errorMessage = "Une erreur est survenue lors de la sauvegarde. ";
            if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
            }

            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
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
        setData({
            id: '',
            name: '',
            description: '',
            date_start: '',
            date_end: '',
            output: '',
            experience_categories_id: '',
            comment: '',
            InstitutionName: '',
            attachment: null,
            references: []
        });
        setIsFormOpen(false);
    };

    const handleTemplateSelection = (type: 'academic' | 'internship' | 'volunteer') => {
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

    // Fonction utilitaire pour générer des expériences prédéfinies
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
                    InstitutionName: getRandomItem(data.institutions),
                    description: getRandomItem(data.descriptions),
                    output: "Formation complétée avec succès",
                };
            case 'internship':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    InstitutionName: getRandomItem(data.companies),
                    description: getRandomItem(data.descriptions),
                    output: getRandomItem(data.achievements),
                };
            case 'volunteer':
                return {
                    ...baseData,
                    name: getRandomItem(data.names),
                    InstitutionName: getRandomItem(data.institutions),
                    description: getRandomItem(data.descriptions),
                    output: getRandomItem(data.outputs),
                };
        }
    };

    const getRandomItem = <T,>(array: T[]): T => {
        return array[Math.floor(Math.random() * array.length)];
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

                                {exp.attachment_path && (
                                    <Badge
                                        variant="outline"
                                        className="mt-2 bg-gradient-to-r from-amber-50 to-purple-50"
                                    >
                                        <FileText className="w-3 h-3 mr-1" />
                                        {formatBytes(exp.attachment_size)}
                                    </Badge>
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

                        {exp.references && exp.references.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold mb-2">Références</h4>
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
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    // Composant des statistiques des attachments
    const AttachmentStatistics: React.FC<{ summary: AttachmentSummary }> = ({ summary }) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-none">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Espace utilisé
                                </p>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {formatBytes(Number(summary.total_size))}
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
                                    {summary.files_count}
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
                                    {formatBytes(Math.max(0, summary.max_size - summary.total_size))}
                                </h3>
                            </div>
                            <FileText className="w-8 h-8 text-amber-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };// Rendu principal
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

            <Tabs defaultValue="experiences" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="experiences" className="flex items-center gap-2">
                        <PencilRuler className="w-4 h-4" />
                        Liste des expériences
                    </TabsTrigger>
                    <TabsTrigger value="attachments" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Pièces jointes {attachmentSummary.files_count > 0 && `(${attachmentSummary.files_count})`}
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

                    <ScrollArea className="h-[600px] pr-4 mt-4">
                        <div className="space-y-4">
                            <AnimatePresence mode="sync">
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
                                <AttachmentStatistics summary={attachmentSummary} />

                                <div className="space-y-4">
                                    <AnimatePresence mode="sync">
                                        {experiences
                                            .filter(exp => exp.attachment_path)
                                            .map(exp => (
                                                <motion.div
                                                    key={exp.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Card className="hover:shadow-md transition-all">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold">{exp.name}</h4>
                                                                    <p className="text-sm text-gray-500">{exp.InstitutionName}</p>
                                                                    {exp.attachment_size && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="mt-2 bg-gradient-to-r from-amber-50 to-purple-50"
                                                                        >
                                                                            {formatBytes(Number(exp.attachment_size))}
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
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                    </AnimatePresence>

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
                        <SheetDescription>
                            {data.id ? "Modifiez les détails de votre expérience" : "Ajoutez une nouvelle expérience à votre profil"}
                        </SheetDescription>
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
                                <p className="text-xs text-gray-500">Laissez vide si en cours</p>
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
                                                    placeholder="Nom de la référence"
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
                                                    placeholder="Fonction de la référence"
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
                                                    placeholder="Email de la référence"
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
                                                    placeholder="Téléphone de la référence"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Label>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span>Pièce jointe</span>
                                        <Badge
                                            variant="secondary"
                                            className="bg-gradient-to-r from-amber-100 to-purple-100"
                                        >
                                            Max 5MB
                                        </Badge>
                                    </div>
                                    {data.attachment_path && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteAttachment(data.id)}
                                            className="hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                            Supprimer le fichier
                                        </Button>
                                    )}
                                </div>
                            </Label>
                            <Input
                                id="attachment"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file && data.attachment_path) {
                                        // Supprimer l'ancien fichier avant d'en ajouter un nouveau
                                        handleDeleteAttachment(data.id);
                                    }
                                    setData('attachment', file);
                                }}
                                className="border-amber-200 focus:ring-amber-500 cursor-pointer"
                                accept=".pdf,.doc,.docx"
                            />
                            {data.attachment_path && (
                                <div className="flex items-center gap-2 mt-2">
                                    <FileText className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm text-gray-600">
                Fichier actuel: {data.attachment_path.split('/').pop()}
            </span>
                                </div>
                            )}
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
