import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Components/ui/button";
import {
    FileText, Edit2, Trash2, File,
    AlertCircle, Download
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
    const { t } = useTranslation();
    const experiencesWithAttachments = experiences.filter(exp => exp.attachment_path);
    const usagePercentage = (attachmentSummary.total_size / attachmentSummary.max_size) * 100;

    return (
        <div className="space-y-6">
            {/* Header simplifié style Jobii */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {t('cvInterface.attachments.title')} ({experiencesWithAttachments.length})
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('cvInterface.attachments.description')}
                </p>
            </div>

            {/* Usage summary en style cards minimaliste */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {attachmentSummary.files_count}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('cvInterface.attachments.files')}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatFileSize(attachmentSummary.total_size)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('cvInterface.attachments.used')}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round(usagePercentage)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('cvInterface.attachments.filled')}</p>
                </div>
            </div>

            {/* Liste simplifiée style Jobii */}
            <div className="space-y-3">
                {experiencesWithAttachments.length > 0 ? (
                    experiencesWithAttachments.map((experience) => (
                        <div
                            key={experience.id}
                            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {experience.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {experience.InstitutionName} • {formatFileSize(experience.attachment_size || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 ml-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onPreviewAttachment(experience.attachment_path!)}
                                    className="w-8 h-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                >
                                    <Download className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditExperience(experience.id)}
                                    className="w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteAttachment(experience.id)}
                                    className="w-8 h-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                >
                                    <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <File className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {t('cvInterface.attachments.noAttachments')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {t('cvInterface.attachments.noAttachmentsDescription')}
                        </p>
                    </div>
                )}
            </div>

            {/* Alert de stockage si nécessaire */}
            {usagePercentage > 90 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-3 h-3 text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                            {t('cvInterface.attachments.storageAlmostFull')}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                            {t('cvInterface.attachments.storageAlmostFullDescription')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentsTab;
