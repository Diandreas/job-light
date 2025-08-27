import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Edit, FileText, DollarSign, Image } from 'lucide-react';

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
    cvModel: CvModel;
}

export default function Show({ cvModel }: Props) {
    return (
        <AdminLayout>
            <Head title={`CV Model: ${cvModel.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/cv-models">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to CV Models
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{cvModel.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400">CV Model Details</p>
                        </div>
                    </div>
                    <Link href={`/cv-models/${cvModel.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Model
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Preview Image */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Image className="mr-2 h-5 w-5" />
                                    Preview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cvModel.previewImagePath ? (
                                    <img
                                        src={`/storage/${cvModel.previewImagePath}`}
                                        alt={`${cvModel.name} preview`}
                                        className="w-full h-auto rounded-lg shadow-lg"
                                    />
                                ) : (
                                    <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                No preview image
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Model Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Model Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Name
                                    </label>
                                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                                        {cvModel.name}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Description
                                    </label>
                                    <p className="mt-1 text-gray-900 dark:text-white">
                                        {cvModel.description || 'No description provided'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Price
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        <DollarSign className="h-5 w-5 text-green-500 mr-1" />
                                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                                            {cvModel.price}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Template Path
                                    </label>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                        {cvModel.templatePath || 'Not specified'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Created
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(cvModel.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Last Updated
                                        </label>
                                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                            {new Date(cvModel.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Technical Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Model ID
                                        </span>
                                        <Badge variant="secondary">#{cvModel.id}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Preview Image
                                        </span>
                                        <Badge variant={cvModel.previewImagePath ? "default" : "destructive"}>
                                            {cvModel.previewImagePath ? "Available" : "Missing"}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Template File
                                        </span>
                                        <Badge variant={cvModel.templatePath ? "default" : "destructive"}>
                                            {cvModel.templatePath ? "Available" : "Missing"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}