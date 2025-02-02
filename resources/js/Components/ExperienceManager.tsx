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
