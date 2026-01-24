import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, FileText, DollarSign } from 'lucide-react';

interface CvModel {
    id: number;
    name: string;
    description: string;
    price: number;
    previewImagePath: string;
    templatePath: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    auth: { user: any };
    cvModels: {
        data: CvModel[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ auth, cvModels, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get('/cv-models', {
            search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (cvModel: CvModel) => {
        if (confirm(`Are you sure you want to delete "${cvModel.name}"?`)) {
            router.delete(`/cv-models/${cvModel.id}`);
        }
    };

    return (
        <AdminLayout>
            <Head title="CV Models Management" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <FileText className="mr-3 h-8 w-8 text-amber-500" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CV Models</h1>
                    </div>
                    <Link href="/cv-models/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add CV Model
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search CV models..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch}>Search</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* CV Models Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {cvModels?.data?.map((model) => (
                        <Card key={model.id} className="overflow-hidden">
                            <div className="aspect-[3/4] relative">
                                {model.previewImagePath ? (
                                    <img
                                        src={`/storage/${model.previewImagePath}`}
                                        alt={`${model.name} preview`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <FileText className="h-16 w-16 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge className="bg-white/90 text-gray-800">
                                        <DollarSign className="h-3 w-3 mr-1" />
                                        {model.price}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                                        {model.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {model.description || 'No description available'}
                                    </p>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(model.created_at).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <Link href={`/cv-models/${model.id}`}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                            <Link href={`/cv-models/${model.id}/edit`}>
                                                <Button size="sm" variant="outline">
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(model)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {cvModels?.data?.length === 0 && (
                    <Card>
                        <CardContent className="py-16">
                            <div className="text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                                    No CV models found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Get started by creating a new CV model.
                                </p>
                                <div className="mt-6">
                                    <Link href="/cv-models/create">
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add CV Model
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {cvModels?.links && cvModels?.data?.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Page {cvModels?.current_page} of {cvModels?.last_page}
                        </div>
                        <div className="flex space-x-1">
                            {cvModels.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`px-3 py-2 text-sm rounded-md ${link.active
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}