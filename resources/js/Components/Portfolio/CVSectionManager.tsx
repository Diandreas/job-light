import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { 
    Settings, ArrowUp, ArrowDown, Eye, EyeOff,
    Briefcase, Award, Heart, FileText, Contact, 
    Globe, Wrench, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface CVSection {
    key: string;
    label: string;
    icon: React.ComponentType<any>;
    count: number;
    isActive: boolean;
    order: number;
}

interface Props {
    cvData: any;
    settings: any;
    onUpdate?: (settings: any) => void;
}

const SECTION_ICONS = {
    experiences: Briefcase,
    competences: Award,
    hobbies: Heart,
    summary: FileText,
    contact_info: Contact,
    languages: Globe,
    services: Wrench,
    about: User,
};

const SECTION_LABELS = {
    experiences: 'Expériences',
    competences: 'Compétences', 
    hobbies: 'Centres d\'intérêt',
    summary: 'Résumé',
    contact_info: 'Contact',
    languages: 'Langues',
    services: 'Services',
    about: 'À propos',
};

const CURRENCIES = [
    { code: '€', name: 'Euro' },
    { code: '$', name: 'Dollar US' },
    { code: '£', name: 'Livre Sterling' },
    { code: '¥', name: 'Yen' },
    { code: 'CHF', name: 'Franc Suisse' },
    { code: 'CA$', name: 'Dollar Canadien' },
    { code: 'AU$', name: 'Dollar Australien' },
];

export default function CVSectionManager({ cvData, settings, onUpdate }: Props) {
    // Console pour débugger les données
    console.log('CVData:', cvData);
    console.log('Settings:', settings);

    // Créer les sections CV disponibles avec leurs compteurs
    const createCVSections = (): CVSection[] => {
        const sectionsData = [
            { 
                key: 'experiences', 
                count: Array.isArray(cvData?.experiences) ? cvData.experiences.length : 0,
                isActive: settings.show_experiences ?? true
            },
            { 
                key: 'competences', 
                count: Array.isArray(cvData?.competences) ? cvData.competences.length : 
                       Array.isArray(cvData?.skills) ? cvData.skills.length : 0,
                isActive: settings.show_competences ?? true
            },
            { 
                key: 'hobbies', 
                count: Array.isArray(cvData?.hobbies) ? cvData.hobbies.length : 0,
                isActive: settings.show_hobbies ?? true
            },
            { 
                key: 'languages', 
                count: Array.isArray(cvData?.languages) ? cvData.languages.length : 0,
                isActive: settings.show_languages ?? true
            },
            { 
                key: 'summary', 
                count: (cvData?.summary || cvData?.summaries?.length > 0) ? 1 : 0,
                isActive: settings.show_summary ?? true
            },
            { 
                key: 'contact_info', 
                count: [
                    cvData?.personalInfo?.email || cvData?.email,
                    cvData?.personalInfo?.phone || cvData?.phone_number || cvData?.phone,
                    cvData?.personalInfo?.address || cvData?.address
                ].filter(Boolean).length,
                isActive: settings.show_contact_info ?? true
            },
            { 
                key: 'services', 
                count: Array.isArray(cvData?.services) ? cvData.services.length : 0,
                isActive: settings.show_services ?? false
            },
        ];

        // Appliquer l'ordre sauvegardé ou l'ordre par défaut
        const sectionOrder = settings.section_order || {};
        
        return sectionsData.map((section) => ({
            ...section,
            label: SECTION_LABELS[section.key],
            icon: SECTION_ICONS[section.key],
            order: sectionOrder[section.key] ?? 999, // Sections non ordonnées à la fin
        })).sort((a, b) => a.order - b.order);
    };

    const [sections, setSections] = useState<CVSection[]>(createCVSections);
    const [currency, setCurrency] = useState(settings.currency || '€');
    const [collapsed, setCollapsed] = useState(false);

    const handleMoveSection = async (sectionKey: string, direction: 'up' | 'down') => {
        const currentIndex = sections.findIndex(s => s.key === sectionKey);
        if (currentIndex === -1) return;
        
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= sections.length) return;

        const newSections = [...sections];
        const [movedSection] = newSections.splice(currentIndex, 1);
        newSections.splice(newIndex, 0, movedSection);

        // Mettre à jour les ordres
        const updatedSections = newSections.map((section, index) => ({
            ...section,
            order: index
        }));

        setSections(updatedSections);

        // Créer l'objet section_order pour la sauvegarde
        const sectionOrder = {};
        updatedSections.forEach((section, index) => {
            sectionOrder[section.key] = index;
        });

        // Sauvegarder
        await saveSettings({ section_order: sectionOrder });
    };

    const handleToggleSection = async (sectionKey: string) => {
        const updatedSections = sections.map(section => 
            section.key === sectionKey 
                ? { ...section, isActive: !section.isActive }
                : section
        );
        setSections(updatedSections);

        const settingKey = `show_${sectionKey}`;
        const newValue = !sections.find(s => s.key === sectionKey)?.isActive;
        
        await saveSettings({ [settingKey]: newValue });
    };

    const handleCurrencyChange = async (newCurrency: string) => {
        setCurrency(newCurrency);
        await saveSettings({ currency: newCurrency });
    };

    const saveSettings = async (data: any) => {
        try {
            const response = await axios.put(route('portfolio.update'), data);
            onUpdate?.(response.data.settings);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    return (
        <Card className="border-l-2 border-l-blue-400 shadow-sm">
            <CardContent className="p-3">
                {/* Header ultra-compact */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCollapsed(!collapsed)}
                            className="h-6 w-6 p-0"
                        >
                            <Settings className="h-3 w-3 text-blue-600" />
                        </Button>
                        <span className="text-xs font-medium text-gray-900">Sections CV</span>
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                            {sections.filter(s => s.isActive).length}/{sections.length}
                        </Badge>
                    </div>
                    
                    <select 
                        value={currency}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5 h-6 w-16"
                    >
                        {CURRENCIES.map(curr => (
                            <option key={curr.code} value={curr.code}>
                                {curr.code}
                            </option>
                        ))}
                    </select>
                </div>

                {!collapsed && (
                    <div className="grid grid-cols-2 gap-1">
                        {sections.map((section, index) => {
                            const IconComponent = section.icon;
                            
                            return (
                                <div
                                    key={section.key}
                                    className={cn(
                                        "flex items-center gap-1 p-1.5 bg-gray-50 rounded border transition-all text-xs",
                                        !section.isActive && "opacity-40"
                                    )}
                                >
                                    {/* Contrôles ultra-compacts */}
                                    <div className="flex gap-0.5">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleMoveSection(section.key, 'up')}
                                            disabled={index === 0}
                                            className="h-4 w-4 p-0 hover:bg-gray-200"
                                        >
                                            <ArrowUp className="h-2 w-2" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleMoveSection(section.key, 'down')}
                                            disabled={index === sections.length - 1}
                                            className="h-4 w-4 p-0 hover:bg-gray-200"
                                        >
                                            <ArrowDown className="h-2 w-2" />
                                        </Button>
                                    </div>

                                    <IconComponent className="w-3 h-3 text-blue-600 shrink-0" />
                                    
                                    <div className="flex-1 min-w-0">
                                        <span className="text-xs font-medium text-gray-800 truncate block">
                                            {section.label}
                                        </span>
                                    </div>
                                    
                                    <Badge 
                                        className={cn(
                                            "text-xs px-1 py-0 h-4 min-w-[20px] text-center",
                                            section.count === 0 ? "bg-red-500 text-white" : "bg-green-500 text-white"
                                        )}
                                    >
                                        {section.count === 0 ? '0' : section.count}
                                    </Badge>
                                    
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleToggleSection(section.key)}
                                        className="h-4 w-4 p-0 hover:bg-gray-200"
                                    >
                                        {section.isActive ? (
                                            <Eye className="h-2 w-2 text-green-600" />
                                        ) : (
                                            <EyeOff className="h-2 w-2 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}