import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Switch } from "@/Components/ui/switch";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import {
    User, Briefcase, Heart, FileText, Contact,
    Globe, Wrench, Settings, ArrowUpDown,
    ChevronUp, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { __ } from '@/utils/translation';

interface Section {
    key: string;
    label: string;
    count: number;
    isActive: boolean;
}

interface SectionGroup {
    label: string;
    description: string;
    position: 'header' | 'main' | 'sidebar' | 'special';
    sections: Section[];
}

interface SectionGroupManagerProps {
    groups: Record<string, SectionGroup>;
    onGroupChange: (groupKey: string, sections: Section[]) => void;
    onSectionToggle: (sectionKey: string, isActive: boolean) => void;
}

const SECTION_ICONS = {
    experiences: Briefcase,
    competences: Heart,
    hobbies: Heart,
    summary: FileText,
    contact_info: Contact,
    languages: Globe,
    services: Wrench,
    about: User,
};

const POSITION_COLORS = {
    header: 'border-l-blue-400',
    main: 'border-l-green-400',
    special: 'border-l-purple-400',
    sidebar: 'border-l-amber-400'
};

const POSITION_LABELS = {
    header: 'Entête',
    main: 'Principal',
    special: 'Spécial',
    sidebar: 'Complémentaire'
};

export default function SectionGroupManager({
    groups,
    onGroupChange,
    onSectionToggle
}: SectionGroupManagerProps) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: !prev[groupKey]
        }));
    };

    const moveSectionInGroup = (groupKey: string, sectionIndex: number, direction: 'up' | 'down') => {
        const group = groups[groupKey];
        if (!group) return;

        const newSections = [...group.sections];
        const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;

        if (targetIndex < 0 || targetIndex >= newSections.length) return;

        [newSections[sectionIndex], newSections[targetIndex]] =
            [newSections[targetIndex], newSections[sectionIndex]];

        onGroupChange(groupKey, newSections);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                    {__('portfolio.groups.title')}
                </h3>
                <Badge variant="secondary" className="text-xs">
                    {Object.keys(groups).length} groupes
                </Badge>
            </div>

            {/* Debug Section - À retirer en production */}
            <Card className="bg-red-50 border-red-200">
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="font-semibold text-red-800">SectionGroupManager Debug</div>
                        <div><strong>Groups count:</strong> {Object.keys(groups).length}</div>
                        <div><strong>Groups keys:</strong> {Object.keys(groups).join(', ')}</div>
                        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(groups, null, 2)}
                        </pre>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {Object.entries(groups).map(([groupKey, group]) => {
                    const isExpanded = expandedGroups[groupKey] ?? true;
                    const activeSections = group.sections.filter(s => s.isActive).length;

                    return (
                        <Card
                            key={groupKey}
                            className={cn("shadow-sm", POSITION_COLORS[group.position])}
                        >
                            <CardHeader
                                className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleGroup(groupKey)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                {group.label}
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs px-2 py-0.5"
                                                >
                                                    {POSITION_LABELS[group.position]}
                                                </Badge>
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {group.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={cn(
                                                "text-xs px-2 py-1",
                                                activeSections > 0 ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                                            )}
                                        >
                                            {activeSections}/{group.sections.length}
                                        </Badge>
                                        {isExpanded ?
                                            <ChevronUp className="h-4 w-4 text-gray-500" /> :
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        }
                                    </div>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="pt-0">
                                    <div className="space-y-2">
                                        {group.sections.map((section, index) => {
                                            const IconComponent = SECTION_ICONS[section.key] || Settings;

                                            return (
                                                <div
                                                    key={section.key}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 bg-gray-50 rounded-lg border transition-all",
                                                        !section.isActive && "opacity-40"
                                                    )}
                                                >
                                                    {/* Contrôles de déplacement dans le groupe */}
                                                    <div className="flex flex-col gap-0.5">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => moveSectionInGroup(groupKey, index, 'up')}
                                                            disabled={index === 0}
                                                            className="h-5 w-5 p-0 hover:bg-gray-200"
                                                        >
                                                            <ChevronUp className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => moveSectionInGroup(groupKey, index, 'down')}
                                                            disabled={index === group.sections.length - 1}
                                                            className="h-5 w-5 p-0 hover:bg-gray-200"
                                                        >
                                                            <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </div>

                                                    <IconComponent className="w-4 h-4 text-gray-600 shrink-0" />

                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm font-medium text-gray-800 truncate block">
                                                            {section.label}
                                                        </span>
                                                    </div>

                                                    <Badge
                                                        className={cn(
                                                            "text-xs px-2 py-0.5 min-w-[32px] text-center",
                                                            section.count === 0 ? "bg-red-500 text-white" : "bg-green-500 text-white"
                                                        )}
                                                    >
                                                        {section.count}
                                                    </Badge>

                                                    <Switch
                                                        checked={section.isActive}
                                                        onCheckedChange={(checked) => onSectionToggle(section.key, checked)}
                                                        className="h-5 w-9 data-[state=checked]:bg-green-500"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}