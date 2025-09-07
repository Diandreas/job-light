import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
    Plus, Edit, Trash2, Image as ImageIcon,
    GripVertical, Eye, EyeOff, Star, Wrench
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

interface Service {
    id: number;
    title: string;
    description: string;
    short_description?: string;
    main_image?: string;
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
    path: string;
    compressed_path?: string;
    thumbnail_path?: string;
    alt_text?: string;
    caption?: string;
    is_main: boolean;
    order_index: number;
}

interface Props {
    auth: any;
    services: Service[];
}

export default function ServicesIndex({ auth, services: initialServices }: Props) {
    const [services, setServices] = useState<Service[]>(initialServices || []);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        short_description: '',
        icon: 'Wrench',
        price: '',
        price_type: 'fixed',
        tags: [],
        is_featured: false,
        is_active: true,
        main_image: null,
        gallery_images: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingService) {
            put(route('services.update', editingService.id), {
                onSuccess: () => {
                    setEditingService(null);
                    reset();
                },
            });
        } else {
            post(route('services.store'), {
                onSuccess: () => {
                    setShowCreateDialog(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (service: Service) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
            router.delete(route('services.destroy', service.id));
        }
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const newServices = Array.from(services);
        const [reorderedService] = newServices.splice(result.source.index, 1);
        newServices.splice(result.destination.index, 0, reorderedService);

        const updatedServices = newServices.map((service, index) => ({
            ...service,
            order_index: index
        }));

        setServices(updatedServices);

        // Sauvegarder l'ordre
        axios.post(route('services.order'), {
            services: updatedServices.map(s => ({ id: s.id, order_index: s.order_index }))
        });
    };

    const openEditDialog = (service: Service) => {
        setEditingService(service);
        setData({
            title: service.title,
            description: service.description,
            short_description: service.short_description || '',
            icon: service.icon || 'Wrench',
            price: service.price?.toString() || '',
            price_type: service.price_type,
            tags: service.tags || [],
            is_featured: service.is_featured,
            is_active: service.is_active,
            main_image: null,
            gallery_images: [],
        });
    };

    const priceTypes = {
        'fixed': 'Prix fixe',
        'hourly': 'Tarif horaire',
        'daily': 'Tarif journalier',
        'project': 'Prix par projet'
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <Wrench className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Services</h2>
                            <p className="text-xs text-gray-500">Gérez vos services et offres</p>
                        </div>
                    </div>
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Nouveau Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Créer un nouveau service</DialogTitle>
                                <DialogDescription>
                                    Ajoutez un nouveau service à votre portfolio
                                </DialogDescription>
                            </DialogHeader>
                            <ServiceForm
                                data={data}
                                setData={setData}
                                onSubmit={handleSubmit}
                                processing={processing}
                                errors={errors}
                                priceTypes={priceTypes}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            }
        >
            <Head title="Services" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4">
                    {services.length === 0 ? (
                        <Card className="text-center py-12">
                            <CardContent>
                                <Wrench className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Aucun service
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Commencez par créer votre premier service
                                </p>
                                <Button
                                    onClick={() => setShowCreateDialog(true)}
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Créer un service
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="services">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                        {services.map((service, index) => (
                                            <Draggable key={service.id} draggableId={service.id.toString()} index={index}>
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={cn(
                                                            "transition-all duration-200",
                                                            snapshot.isDragging && "shadow-lg rotate-2",
                                                            !service.is_active && "opacity-60"
                                                        )}
                                                    >
                                                        <CardContent className="p-6">
                                                            <div className="flex items-start gap-4">
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-2"
                                                                >
                                                                    <GripVertical className="h-5 w-5" />
                                                                </div>

                                                                {service.main_image && (
                                                                    <img
                                                                        src={service.main_image}
                                                                        alt={service.title}
                                                                        className="w-16 h-16 rounded-lg object-cover"
                                                                    />
                                                                )}

                                                                <div className="flex-1">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div>
                                                                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                                                                {service.title}
                                                                                {service.is_featured && (
                                                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                                                )}
                                                                                {!service.is_active && (
                                                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                                                )}
                                                                            </h3>
                                                                            {service.short_description && (
                                                                                <p className="text-sm text-gray-600 mt-1">
                                                                                    {service.short_description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {service.formatted_price && (
                                                                                <Badge variant="secondary">
                                                                                    {service.formatted_price}
                                                                                </Badge>
                                                                            )}
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => openEditDialog(service)}
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleDelete(service)}
                                                                                className="text-red-600 hover:text-red-700"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {service.tags && service.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                                            {service.tags.map((tag, tagIndex) => (
                                                                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                                                                    {tag}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {service.images && service.images.length > 0 && (
                                                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                                            <ImageIcon className="h-3 w-3" />
                                                                            {service.images.length} image{service.images.length > 1 ? 's' : ''}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
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
                            {editingService && (
                                <ServiceForm
                                    data={data}
                                    setData={setData}
                                    onSubmit={handleSubmit}
                                    processing={processing}
                                    errors={errors}
                                    priceTypes={priceTypes}
                                    isEditing={true}
                                />
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Composant formulaire séparé pour éviter la duplication
function ServiceForm({ data, setData, onSubmit, processing, errors, priceTypes, isEditing = false }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <div>
                    <Label htmlFor="title">Titre du service *</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                    <Label htmlFor="short_description">Description courte</Label>
                    <Input
                        id="short_description"
                        value={data.short_description}
                        onChange={(e) => setData('short_description', e.target.value)}
                        placeholder="Résumé en une ligne"
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description complète *</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={4}
                        className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price">Prix</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <Label htmlFor="price_type">Type de prix</Label>
                        <Select value={data.price_type} onValueChange={(value) => setData('price_type', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(priceTypes).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {/* @ts-ignore */}
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
                        onChange={(e) => setData('main_image', e.target.files[0])}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={data.is_featured}
                            onCheckedChange={(checked) => setData('is_featured', checked)}
                        />
                        <Label>Service mis en avant</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked)}
                        />
                        <Label>Actif</Label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={processing} className="bg-gradient-to-r from-blue-500 to-purple-500">
                    {processing ? 'Sauvegarde...' : (isEditing ? 'Mettre à jour' : 'Créer')}
                </Button>
            </div>
        </form>
    );
}