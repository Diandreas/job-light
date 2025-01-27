import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Progress } from "@/Components/ui/progress";
import {
    FileText, Edit2, Trash2, File,
    HardDrive, AlertCircle, Download
} from 'lucide-react';

interface AttachmentSummary {
    total_size: number;
    max_size: number;
    files_count: number;
}

interface Experience {
    id: number;
    name: string;
    attachment_path?: string;
    attachment_size?: number;
    InstitutionName: string;
}

interface AttachmentsTabProps {
    experiences: Experience[];
    attachmentSummary: AttachmentSummary;
    onEditExperience: (id: number) => void;
    onDeleteAttachment: (id: number) => void;
    onPreviewAttachment: (path: string) => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({
                                                           experiences,
                                                           attachmentSummary,
                                                           onEditExperience,
                                                           onDeleteAttachment,
                                                           onPreviewAttachment
                                                       }) => {
    const experiencesWithAttachments = experiences.filter(exp => exp.attachment_path);
    const usagePercentage = (attachmentSummary.total_size / attachmentSummary.max_size) * 100;

    return (
        <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="list" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Liste des pièces jointes
                </TabsTrigger>
                <TabsTrigger value="storage" className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Utilisation stockage
                </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
                <div className="space-y-4">
                    {experiencesWithAttachments.length > 0 ? (
                        experiencesWithAttachments.map((experience) => (
                            <Card key={experience.id} className="border-amber-100 hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{experience.name}</h3>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-gradient-to-r from-amber-100 to-purple-100"
                                                >
                                                    {formatFileSize(experience.attachment_size || 0)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">{experience.InstitutionName}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onPreviewAttachment(experience.attachment_path!)}
                                                className="hover:bg-amber-50"
                                            >
                                                <Download className="w-4 h-4 text-amber-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onEditExperience(experience.id)}
                                                className="hover:bg-purple-50"
                                            >
                                                <Edit2 className="w-4 h-4 text-purple-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDeleteAttachment(experience.id)}
                                                className="hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-amber-100">
                            <CardContent className="p-6 text-center">
                                <File className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                                <p className="text-gray-500">Aucune pièce jointe disponible</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="storage">
                <Card className="border-amber-100">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            Utilisation du stockage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>{formatFileSize(attachmentSummary.total_size)}</span>
                                <span>{formatFileSize(attachmentSummary.max_size)}</span>
                            </div>
                            <Progress
                                value={usagePercentage}
                                className="bg-gray-100"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-amber-500 mb-2">
                                    <File className="w-5 h-5" />
                                    <h4 className="font-medium">Fichiers</h4>
                                </div>
                                <p className="text-2xl font-bold">
                                    {attachmentSummary.files_count}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Pièces jointes totales
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-amber-50 to-purple-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-purple-500 mb-2">
                                    <HardDrive className="w-5 h-5" />
                                    <h4 className="font-medium">Stockage restant</h4>
                                </div>
                                <p className="text-2xl font-bold">
                                    {formatFileSize(attachmentSummary.max_size - attachmentSummary.total_size)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Espace disponible
                                </p>
                            </div>
                        </div>

                        {usagePercentage > 90 && (
                            <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800">Stockage presque plein</p>
                                    <p className="text-sm text-amber-600">
                                        Vous approchez de la limite de stockage. Pensez à supprimer d'anciennes pièces jointes.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
};

export default AttachmentsTab;
