import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, ChevronDown, Loader, Sparkles, Smartphone, Presentation, FileText } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Service } from '@/types/career-advisor';

interface ChatHeaderProps {
    selectedService: Service;
    onNewChat: () => void;
    onExport: (format: 'pdf' | 'docx' | 'pptx') => void;
    isExporting?: boolean;
    isAndroidApp?: boolean;
    isReady?: boolean;
    artifactCount?: number;
    onToggleArtifacts?: () => void;
    artifactSidebarOpen?: boolean;
}

export default function ChatHeader({
    selectedService,
    onNewChat,
    onExport,
    isExporting = false,
    isAndroidApp = false,
    isReady = false,
    artifactCount = 0,
    onToggleArtifacts,
    artifactSidebarOpen = false,
}: ChatHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <selectedService.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                                {t(`services.${selectedService.id}.title`)}
                            </h3>
                            <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t('components.sidebar.active')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={onNewChat} variant="outline" size="sm" className="h-8 w-8 p-0">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">{t('components.career_advisor.interface.new_chat')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {artifactCount > 0 && onToggleArtifacts && (
                        <Button
                            onClick={onToggleArtifacts}
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-8 px-2 relative",
                                artifactSidebarOpen ? "bg-amber-100 border-amber-300 text-amber-700" : ""
                            )}
                        >
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Artefacts</span>
                            <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs bg-amber-500 text-white">
                                {artifactCount}
                            </Badge>
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 px-2" disabled={isExporting}>
                                {isExporting ? (
                                    <Loader className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5 mr-1" />
                                )}
                                <span className="text-xs hidden sm:inline">{t('components.career_advisor.interface.export')}</span>
                                <ChevronDown className="h-3 w-3 ml-1" />
                                {isAndroidApp && isReady && (
                                    <Smartphone className="ml-1 h-3 w-3 text-green-500" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onExport('pdf')} className="text-xs">
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport('docx')} className="text-xs">
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                DOCX
                            </DropdownMenuItem>
                            {selectedService.id === 'presentation-ppt' && (
                                <DropdownMenuItem onClick={() => onExport('pptx')} className="text-xs">
                                    <Presentation className="h-3.5 w-3.5 mr-2" />
                                    PPTX
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
