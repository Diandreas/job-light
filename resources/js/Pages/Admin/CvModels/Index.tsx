import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { Plus, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from "@/Components/ui/badge";

interface CvModel {
    id: number;
    name: string;
    description: string;
    price: number;
    previewImagePath: string;
}

interface Props {
    cvModels: CvModel[];
    auth: {
        user: any;
    };
}

export default function CvModelIndex({ cvModels, auth }: Props) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        router.delete(route('cv-models.destroy', id));
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
            .replace('XOF', 'FCFA')
            .replace(',', ' '); // Pour un meilleur formatage des grands nombres
    };

    if (!cvModels) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Modèles de CV</h2>
                }
            >
                <div className="h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Gestion des Modèles de CV</h2>
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href={route('cv-models.create')}>
                            <Plus className="mr-2 h-4 w-4" /> Nouveau Modèle
                        </Link>
                    </Button>
                </div>
            }
        >
            <div className="container mx-auto py-6">
                <Card className="shadow-md">
                    <CardHeader className="border-b">
                        <CardTitle className="text-2xl">Modèles de CV</CardTitle>
                        <CardDescription>
                            Gérez vos modèles de CV personnalisés et leurs tarifs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[100px]">Aperçu</TableHead>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Tarif</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cvModels.map((model) => (
                                    <TableRow key={model.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="relative h-16 w-16 overflow-hidden rounded-lg border">
                                                <img
                                                    src={`/storage/${model.previewImagePath}`}
                                                    alt={model.name}
                                                    className="object-cover h-full w-full"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{model.name}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">
                                            {model.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={model.price === 0 ? "secondary" : "default"}>
                                                {model.price === 0 ? "Gratuit" : formatPrice(model.price)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('cv-models.show', model.id)} className="flex items-center">
                                                            <Eye className="mr-2 h-4 w-4" /> Aperçu complet
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('cv-models.edit', model.id)} className="flex items-center">
                                                            <Edit className="mr-2 h-4 w-4" /> Modifier
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive flex items-center"
                                                        onClick={() => {
                                                            setSelectedModelId(model.id);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {cvModels.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Aucun modèle de CV disponible
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le modèle de CV et tous ses fichiers associés seront définitivement supprimés.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (selectedModelId) {
                                    handleDelete(selectedModelId);
                                }
                                setIsDeleteDialogOpen(false);
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AuthenticatedLayout>
    );
}
