import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import { Badge } from "@/Components/ui/badge";
import { __ } from '@/utils/translation';
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
    Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Star,
    Wrench, Image as ImageIcon, Upload, ArrowUp, ArrowDown
} from 'lucide-react';
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Service {
    id: number;
    title: string;
    description: string;
    short_description?: string;
    main_image_url?: string;
    icon?: string;
    price?: number;
    price_type: 'fixed' | 'hourly' | 'daily' | 'project';
    tags?: string[];
    is_featured: boolean;
    is_active: boolean;
    order_index: number;
    images?: ServiceImage[];
    formatted_price?: string;
}

interface ServiceImage {
    id: number;
    url: string;
    thumbnail_url: string;
    alt_text?: string;
    caption?: string;
    is_main: boolean;
}

interface Props {
    services: Service[];
    onServiceUpdate?: (services: Service[]) => void;
}

export default function ServiceManager({ services: initialServices, onServiceUpdate }: Props) {
    const [services, setServices] = useState<Service[]>(initialServices || []);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        short_description: '',
        price: '',
        price_type: 'fixed',
        is_featured: false,
        is_active: true,
        main_image: null as File | null,
        tags: [] as string[],
    });
    const [loading, setLoading] = useState(false);

    const priceTypes = {
        'fixed': 'Prix fixe',
        'hourly': 'Tarif horaire',
        'daily': 'Tarif journalier',
        'project': 'Prix par projet'
    };

    const handleMoveService = async (serviceId: number, direction: 'up' | 'down') => {
        const currentIndex = services.findIndex(s => s.id === serviceId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= services.length) return;

        const newServices = [...services];
        const [movedService] = newServices.splice(currentIndex, 1);
        newServices.splice(newIndex, 0, movedService);

        const updatedServices = newServices.map((service, index) => ({
            ...service,
            order_index: index
        }));

        setServices(updatedServices);
        onServiceUpdate?.(updatedServices);

        try {
            await axios.post(route('services.order'), {
                services: updatedServices.map(s => ({ id: s.id, order_index: s.order_index }))
            });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de l\'ordre:', error);
        }
    };

    const handleCreateService = async () => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'tags') {
                    formDataToSend.append(key, JSON.stringify(value));
                } else if (key === 'main_image' && value) {
                    formDataToSend.append(key, value);
                } else if (value !== null && value !== '') {
                    formDataToSend.append(key, value.toString());
                }
            });

            const response = await axios.post(route('services.store'), formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newService = response.data.service;
            const updatedServices = [...services, newService];
            setServices(updatedServices);
            onServiceUpdate?.(updatedServices);
            setShowCreateDialog(false);
            resetForm();
        } catch (error) {
            console.error('Erreur lors de la création:', error);
        }
        setLoading(false);
    };

    const handleEditService = async () => {
        if (!editingService) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('_method', 'PUT');

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'tags') {
                    formDataToSend.append(key, JSON.stringify(value));
                } else if (key === 'main_image' && value) {
                    formDataToSend.append(key, value);
                } else if (value !== null && value !== '') {
                    formDataToSend.append(key, value.toString());
                }
            });

            const response = await axios.post(route('services.update', editingService.id), formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const updatedService = response.data.service;
            const updatedServices = services.map(s =>
                s.id === editingService.id ? updatedService : s
            );
            setServices(updatedServices);
            onServiceUpdate?.(updatedServices);
            setEditingService(null);
            resetForm();
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
        }
        setLoading(false);
    };

    const handleDeleteService = async (service: Service) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

        try {
            await axios.delete(route('services.destroy', service.id));
            const updatedServices = services.filter(s => s.id !== service.id);
            setServices(updatedServices);
            onServiceUpdate?.(updatedServices);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    };

    const openEditDialog = (service: Service) => {
        setEditingService(service);
        setFormData({
            title: service.title,
            description: service.description,
            short_description: service.short_description || '',
            price: service.price?.toString() || '',
            price_type: service.price_type,
            is_featured: service.is_featured,
            is_active: service.is_active,
            main_image: null,
            tags: service.tags || [],
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            short_description: '',
            price: '',
            price_type: 'fixed',
            is_featured: false,
            is_active: true,
            main_image: null,
            tags: [],
        });
    };

    const addTag = (tag: string) => {
        if (tag.trim() && !formData.tags.includes(tag.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tag.trim()] });
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    return (
        <Card className="border-l-2 border-l-purple-400 shadow-sm">
            {/* Debug Section - À retirer en production */}
            <Card className="bg-orange-50 border-orange-200 mb-3">
                <CardContent className="p-2">
                    <div className="space-y-1 text-xs">
                        <div className="font-semibold text-orange-800">ServiceManager Debug</div>
                        <div><strong>Initial services:</strong> {initialServices?.length || 0}</div>
                        <div><strong>Current services:</strong> {services?.length || 0}</div>
                        <pre className="text-xs bg-white p-1 rounded overflow-auto max-h-20">
                            {JSON.stringify({ initialServices, services }, null, 2)}
                        </pre>
                    </div>
                </CardContent>
            </Card>

            <CardContent className="p-3">
                {/* Header ultra-compact */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Wrench className="h-3 w-3 text-purple-600" />
                        <span className="text-xs font-medium text-gray-900">Services</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                            {services.length}
                        </Badge>
                    </div>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="h-6 px-2 bg-purple-500 hover:bg-purple-600 text-xs">
                                <Plus className="h-3 w-3 mr-1" />
                                +
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Nouveau service</DialogTitle>
                                <DialogDescription>
                                    Ajoutez un nouveau service à votre portfolio
                                </DialogDescription>
                            </DialogHeader>
                            <ServiceForm
                                data={formData}
                                onChange={setFormData}
                                onSubmit={handleCreateService}
                                priceTypes={priceTypes}
                                loading={loading}
                                addTag={addTag}
                                removeTag={removeTag}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                {services.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                        <p className="text-xs">Aucun service</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className={cn(
                                    "flex items-center gap-1 p-2 bg-gray-50 rounded border transition-all text-xs",
                                    !service.is_active && "opacity-40"
                                )}
                            >
                                {/* Contrôles compacts */}
                                <div className="flex gap-0.5">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleMoveService(service.id, 'up')}
                                        disabled={index === 0}
                                        className="h-4 w-4 p-0 hover:bg-gray-200"
                                    >
                                        <ArrowUp className="h-2 w-2" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleMoveService(service.id, 'down')}
                                        disabled={index === services.length - 1}
                                        className="h-4 w-4 p-0 hover:bg-gray-200"
                                    >
                                        <ArrowDown className="h-2 w-2" />
                                    </Button>
                                </div>

                                {service.main_image_url && (
                                    <img
                                        src={service.main_image_url}
                                        alt={service.title}
                                        className="w-6 h-6 rounded object-cover"
                                    />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-medium text-gray-900 truncate flex-1">
                                            {service.title}
                                        </span>
                                        {service.is_featured && (
                                            <Star className="h-2 w-2 text-yellow-500 fill-current" />
                                        )}
                                        {service.formatted_price && (
                                            <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                                                {service.formatted_price}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-0.5">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => openEditDialog(service)}
                                        className="h-4 w-4 p-0 hover:bg-gray-200"
                                    >
                                        <Edit className="h-2 w-2" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteService(service)}
                                        className="h-4 w-4 p-0 text-red-600 hover:bg-red-100"
                                    >
                                        <Trash2 className="h-2 w-2" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Dialog d'édition */}
                <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Modifier le service</DialogTitle>
                            <DialogDescription>
                                Modifiez les informations de votre service
                            </DialogDescription>
                        </DialogHeader>
                        <ServiceForm
                            data={formData}
                            onChange={setFormData}
                            onSubmit={handleEditService}
                            priceTypes={priceTypes}
                            loading={loading}
                            isEditing={true}
                            addTag={addTag}
                            removeTag={removeTag}
                        />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

function ServiceForm({ data, onChange, onSubmit, priceTypes, loading, isEditing = false, addTag, removeTag }) {
    const [tagInput, setTagInput] = useState('');

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim()) {
            addTag(tagInput);
            setTagInput('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="title">Titre du service *</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                        placeholder="Ex: Développement web"
                    />
                </div>

                <div>
                    <Label htmlFor="short_description">Description courte</Label>
                    <Input
                        id="short_description"
                        value={data.short_description}
                        onChange={(e) => onChange({ ...data, short_description: e.target.value })}
                        placeholder="Résumé en une ligne"
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description complète *</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                        rows={3}
                        placeholder="Description détaillée du service"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price">Prix (€)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => onChange({ ...data, price: e.target.value })}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor="price_type">Type de prix</Label>
                        <Select value={data.price_type} onValueChange={(value) => onChange({ ...data, price_type: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(priceTypes).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="main_image">Image principale</Label>
                    <Input
                        id="main_image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => onChange({ ...data, main_image: e.target.files[0] })}
                    />
                </div>

                <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {data.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            placeholder={__('portfolio.components.service_manager.add_tag')}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                        />
                        <Button type="button" onClick={handleAddTag} size="sm">
                            {__('portfolio.components.service_manager.add')}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={data.is_featured}
                            onCheckedChange={(checked) => onChange({ ...data, is_featured: checked })}
                        />
                        <Label>{__('portfolio.components.service_manager.featured_service')}</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={(checked) => onChange({ ...data, is_active: checked })}
                        />
                        <Label>{__('portfolio.components.service_manager.active')}</Label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button onClick={onSubmit} disabled={loading}>
                    {loading ? __('portfolio.components.service_manager.saving') : (isEditing ? __('portfolio.components.service_manager.update') : __('portfolio.components.service_manager.create'))}
                </Button>
            </div>
        </div>
    );
}