import React from 'react';
import { Button } from '@/Components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/Components/ui/sheet';
import { Download, Eye, FileText, X } from 'lucide-react';

interface DocumentPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    title: string;
    onDownload: (format: string) => void;
    formats: string[];
}

const DocumentPreview = ({
                             isOpen,
                             onClose,
                             content,
                             title,
                             onDownload,
                             formats
                         }: DocumentPreviewProps) => {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-2xl">
                <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {title}
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                        {formats.map(format => (
                            <Button
                                key={format}
                                variant="outline"
                                size="sm"
                                onClick={() => onDownload(format)}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                {format.toUpperCase()}
                            </Button>
                        ))}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="mt-6">
                    <div className="prose prose-sm max-w-none">
                        <div
                            className="p-6 bg-white rounded-lg shadow-sm border"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default DocumentPreview;
