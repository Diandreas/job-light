import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { 
    Edit, 
    Save, 
    X, 
    Plus, 
    Trash2, 
    GripVertical,
    Eye,
    EyeOff,
    Palette
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

interface CustomSectionData {
    id?: number;
    title: string;
    type: string;
    content: string;
    settings?: any;
    order_index: number;
    is_active: boolean;
    icon?: string;
    background_color?: string;
    text_color?: string;
}

interface CustomSectionProps {
    section: CustomSectionData;
    availableTypes: Record<string, string>;
    availableIcons: Record<string, string>;
    onUpdate: (section: CustomSectionData) => void;
    onDelete: (sectionId: number) => void;
    onToggleActive: (sectionId: number, isActive: boolean) => void;
    isEditing?: boolean;
    dragHandleProps?: any;
}

const iconComponents: Record<string, any> = {
    Edit,
    Save,
    X,
    Plus,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    Palette
};

export default function CustomSection({
    section,
    availableTypes,
    availableIcons,
    onUpdate,
    onDelete,
    onToggleActive,
    isEditing = false,
    dragHandleProps
}: CustomSectionProps) {
    const [editMode, setEditMode] = useState(isEditing);
    const [formData, setFormData] = useState<CustomSectionData>(section);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const handleSave = () => {
        onUpdate(formData);
        setEditMode(false);
    };

    const handleCancel = () => {
        setFormData(section);
        setEditMode(false);
    };

    const handleDelete = () => {
        if (section.id && confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) {
            onDelete(section.id);
        }
    };

    const handleToggleActive = () => {
        const newActiveState = !section.is_active;
        onToggleActive(section.id!, newActiveState);
    };

    const getIconComponent = (iconName: string) => {
        return iconComponents[iconName] || Edit;
    };

    const IconComponent = getIconComponent(formData.icon || availableIcons[formData.type] || 'Edit');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
        >
            <Card className={cn(
                "transition-all duration-200",
                !section.is_active && "opacity-50 border-dashed",
                editMode && "ring-2 ring-primary/50"
            )}>
                {/* Header avec actions */}
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {dragHandleProps && (
                                <div {...dragHandleProps} className="cursor-grab hover:cursor-grabbing">
                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                                <div className={cn(
                                    "p-2 rounded-lg flex items-center justify-center",
                                    formData.background_color 
                                        ? `bg-[${formData.background_color}]` 
                                        : "bg-primary/10"
                                )}>
                                    <IconComponent 
                                        className={cn(
                                            "h-4 w-4",
                                            formData.text_color 
                                                ? `text-[${formData.text_color}]`
                                                : "text-primary"
                                        )} 
                                    />
                                </div>
                                
                                {editMode ? (
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="font-semibold text-lg border-none p-0 focus:ring-0 h-auto"
                                        placeholder="Titre de la section"
                                    />
                                ) : (
                                    <CardTitle className="text-lg">{section.title}</CardTitle>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-1">
                            {/* Indicateur du type */}
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                                {availableTypes[section.type] || section.type}
                            </span>
                            
                            {/* Bouton visibilité */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleToggleActive}
                                className="h-8 w-8 p-0"
                            >
                                {section.is_active ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <EyeOff className="h-4 w-4" />
                                )}
                            </Button>

                            {/* Actions */}
                            {editMode ? (
                                <div className="flex space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSave}
                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                    >
                                        <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancel}
                                        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditMode(true)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                {/* Contenu */}
                <CardContent>
                    <AnimatePresence mode="wait">
                        {editMode ? (
                            <motion.div
                                key="edit"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {/* Type de section */}
                                <div>
                                    <Label htmlFor="type">Type de section</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(availableTypes).map(([value, label]) => (
                                                <SelectItem key={value} value={value}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Contenu */}
                                <div>
                                    <Label htmlFor="content">Contenu</Label>
                                    <Textarea
                                        value={formData.content || ''}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Décrivez le contenu de cette section..."
                                        rows={4}
                                    />
                                </div>

                                {/* Options de style */}
                                <div className="flex space-x-4">
                                    <div className="flex-1">
                                        <Label htmlFor="bg-color">Couleur d'arrière-plan</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="color"
                                                value={formData.background_color || '#f8fafc'}
                                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                                className="w-12 h-8 p-1 border rounded"
                                            />
                                            <Input
                                                type="text"
                                                value={formData.background_color || ''}
                                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                                placeholder="#f8fafc"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <Label htmlFor="text-color">Couleur du texte</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                type="color"
                                                value={formData.text_color || '#1f2937'}
                                                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                                                className="w-12 h-8 p-1 border rounded"
                                            />
                                            <Input
                                                type="text"
                                                value={formData.text_color || ''}
                                                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                                                placeholder="#1f2937"
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-2"
                            >
                                {section.content && (
                                    <div 
                                        className="prose prose-sm max-w-none"
                                        style={{
                                            backgroundColor: section.background_color,
                                            color: section.text_color,
                                            padding: section.background_color ? '1rem' : '0',
                                            borderRadius: section.background_color ? '0.5rem' : '0'
                                        }}
                                    >
                                        <p>{section.content}</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}