import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { Badge } from "@/Components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown,
    Briefcase, Award, Heart, FileText, Contact, Settings, 
    Zap, Globe, Sparkles, Star, MessageSquare, Wrench,
    GraduationCap, FolderOpen, User
} from 'lucide-react';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import axios from 'axios';

interface Section {
    id?: number;
    type: string;
    title: string;
    content?: string;
    is_active: boolean;
    order_index: number;
    count?: number;
}

interface Props {
    sections: Section[];
    onSectionUpdate?: (sections: Section[]) => void;
}

const SECTION_ICONS = {
    custom: User,
    about: User,
    experiences: Briefcase,
    competences: Award,
    hobbies: Heart,
    projects: FolderOpen,
    education: GraduationCap,
    languages: Globe,
    awards: Star,
    testimonials: MessageSquare,
    services: Wrench,
};

const SECTION_LABELS = {
    custom: 'Section personnalisée',
    about: 'À propos',
    experiences: 'Expériences',
    competences: 'Compétences',
    hobbies: 'Centres d\'intérêt',
    projects: 'Projets',
    education: 'Formation',
    languages: 'Langues',
    awards: 'Prix et distinctions',
    testimonials: 'Témoignages',
    services: 'Services',
};

export default function SectionManager({ sections: initialSections, onSectionUpdate }: Props) {
    const [sections, setSections] = useState<Section[]>(initialSections || []);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [formData, setFormData] = useState({
        type: 'custom',
        title: '',
        content: '',
        is_active: true,
    });

    const handleMoveSection = async (sectionId: number, direction: 'up' | 'down') => {
        const currentIndex = sections.findIndex(s => s.id === sectionId);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= sections.length) return;

        const newSections = [...sections];
        const [movedSection] = newSections.splice(currentIndex, 1);
        newSections.splice(newIndex, 0, movedSection);

        const updatedSections = newSections.map((section, index) => ({
            ...section,
            order_index: index
        }));

        setSections(updatedSections);
        onSectionUpdate?.(updatedSections);

        // Sauvegarder l'ordre
        try {
            await axios.post(route('portfolio.sections.order'), {
                sections: updatedSections.map(s => ({ id: s.id, order_index: s.order_index }))
            });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'ordre:', error);
        }
    };

    const handleToggleActive = async (section: Section) => {
        const updatedSections = sections.map(s => 
            s.id === section.id ? { ...s, is_active: !s.is_active } : s
        );
        setSections(updatedSections);
        onSectionUpdate?.(updatedSections);

        try {
            await axios.put(route('portfolio.sections.toggle', section.id), {
                is_active: !section.is_active
            });
        } catch (error) {
            console.error('Erreur lors du basculement:', error);
        }
    };

    const handleCreateSection = async () => {
        try {
            const response = await axios.post(route('portfolio.sections.create'), formData);
            const newSection = response.data.section;
            const updatedSections = [...sections, newSection];
            setSections(updatedSections);
            onSectionUpdate?.(updatedSections);
            setShowCreateDialog(false);
            resetForm();
        } catch (error) {
            console.error('Erreur lors de la création:', error);
        }
    };

    const handleEditSection = async () => {
        if (!editingSection) return;
        
        try {
            const response = await axios.put(route('portfolio.sections.update', editingSection.id), formData);
            const updatedSection = response.data.section;
            const updatedSections = sections.map(s => 
                s.id === editingSection.id ? updatedSection : s
            );
            setSections(updatedSections);
            onSectionUpdate?.(updatedSections);
            setEditingSection(null);
            resetForm();
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
        }
    };

    const handleDeleteSection = async (section: Section) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;

        try {
            await axios.delete(route('portfolio.sections.delete', section.id));
            const updatedSections = sections.filter(s => s.id !== section.id);
            setSections(updatedSections);
            onSectionUpdate?.(updatedSections);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const openEditDialog = (section: Section) => {
        setEditingSection(section);
        setFormData({
            type: section.type,
            title: section.title,
            content: section.content || '',
            is_active: section.is_active,
        });
    };

    const resetForm = () => {
        setFormData({
            type: 'custom',
            title: '',
            content: '',
            is_active: true,
        });
    };

    return (
        <Card className="border-l-4 border-l-purple-400">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-purple-600" />
                        <CardTitle className="text-sm text-gray-900">Sections du Portfolio</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Réorganisable
                        </Badge>
                    </div>
                    
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-8 px-3">
                                <Plus className="h-3 w-3 mr-1" />
                                Ajouter
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nouvelle section</DialogTitle>
                                <DialogDescription>
                                    Ajoutez une nouvelle section à votre portfolio
                                </DialogDescription>
                            </DialogHeader>
                            <SectionForm 
                                data={formData}
                                onChange={setFormData}
                                onSubmit={handleCreateSection}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                {sections.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune section personnalisée</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sections.map((section, index) => {
                            const IconComponent = SECTION_ICONS[section.type] || User;
                            return (
                                <div
                                    key={section.id || index}
                                    className={cn(
                                        "flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50/50 to-purple-50/50 rounded-lg border border-amber-200/50 transition-all",
                                        !section.is_active && "opacity-60"
                                    )}
                                >
                                    <div className="flex flex-col gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => section.id && handleMoveSection(section.id, 'up')}
                                            disabled={index === 0}
                                            className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                                        >
                                            <ArrowUp className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => section.id && handleMoveSection(section.id, 'down')}
                                            disabled={index === sections.length - 1}
                                            className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                                        >
                                            <ArrowDown className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    
                                    <IconComponent className="w-4 h-4 text-amber-600" />
                                    
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-800">
                                            {section.title}
                                        </span>
                                        {section.count !== undefined && section.count > 0 && (
                                            <Badge className="ml-2 bg-green-500 text-white px-1.5 py-0 text-xs rounded-full">
                                                {section.count}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggleActive(section)}
                                            className="h-6 w-6 p-0"
                                        >
                                            {section.is_active ? (
                                                <Eye className="h-3 w-3 text-green-600" />
                                            ) : (
                                                <EyeOff className="h-3 w-3 text-gray-400" />
                                            )}
                                        </Button>
                                        
                                        {section.id && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => openEditDialog(section)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteSection(section)}
                                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Dialog d'édition */}
                <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier la section</DialogTitle>
                            <DialogDescription>
                                Modifiez les informations de cette section
                            </DialogDescription>
                        </DialogHeader>
                        <SectionForm 
                            data={formData}
                            onChange={setFormData}
                            onSubmit={handleEditSection}
                            isEditing={true}
                        />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

function SectionForm({ data, onChange, onSubmit, isEditing = false }) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="type">Type de section</Label>
                <Select 
                    value={data.type} 
                    onValueChange={(value) => onChange({ ...data, type: value })}
                    disabled={isEditing}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(SECTION_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="title">Titre de la section</Label>
                <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                    placeholder="Ex: Mes réalisations"
                />
            </div>

            <div>
                <Label htmlFor="content">Contenu (optionnel)</Label>
                <Textarea
                    id="content"
                    value={data.content}
                    onChange={(e) => onChange({ ...data, content: e.target.value })}
                    rows={3}
                    placeholder="Description ou contenu de la section"
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    checked={data.is_active}
                    onCheckedChange={(checked) => onChange({ ...data, is_active: checked })}
                />
                <Label>Section visible</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button onClick={onSubmit}>
                    {isEditing ? 'Mettre à jour' : 'Créer'}
                </Button>
            </div>
        </div>
    );
}