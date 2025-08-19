import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

interface Competence {
    id: number;
    name: string;
    category: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    competences: {
        data: Competence[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ competences, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(route('competences.index'), {
            search,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (competence: Competence) => {
        if (confirm(`Are you sure you want to delete "${competence.name}"?`)) {
            router.delete(route('competences.destroy', competence.id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Competences Management" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Competences</h1>
                    <Link href={route('competences.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Competence
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
                                    placeholder="Search competences..."
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

                {/* Competences Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {competences.data.map((competence) => (
                                        <tr key={competence.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {competence.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant="secondary">
                                                    {competence.category || 'Uncategorized'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(competence.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Link href={route('competences.edit', competence.id)}>
                                                        <Button size="sm" variant="outline">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button 
                                                        size="sm" 
                                                        variant="destructive"
                                                        onClick={() => handleDelete(competence)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {competences.links && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Page {competences.current_page} of {competences.last_page}
                        </div>
                        <div className="flex space-x-1">
                            {competences.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active
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