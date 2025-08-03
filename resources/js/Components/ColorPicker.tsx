import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Palette, Check, Copy } from 'lucide-react';
import { useToast } from "@/Components/ui/use-toast";
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface ColorPickerProps {
    defaultColor: string;
    onColorChange?: (color: string) => void;
    onColorSaved?: () => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ defaultColor = '#3498db', onColorChange, onColorSaved }) => {
    const [color, setColor] = useState(defaultColor);
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    // Couleurs modernes et professionnelles recommandées
    const suggestedColors = [
        { name: 'Bleu Corporate', color: '#2563eb' },
        { name: 'Vert Tech', color: '#059669' },
        { name: 'Violet Creative', color: '#7c3aed' },
        { name: 'Orange Dynamique', color: '#ea580c' },
        { name: 'Rose Modern', color: '#db2777' },
        { name: 'Indigo Professionnel', color: '#4f46e5' },
        { name: 'Bleu Turquoise', color: '#0891b2' },
        { name: 'Vert Émeraude', color: '#10b981' },
        { name: 'Rouge Élégant', color: '#dc2626' },
        { name: 'Gris Moderne', color: '#6b7280' },
        { name: 'Bleu Nuit', color: '#1e40af' },
        { name: 'Violet Foncé', color: '#6366f1' }
    ];

    useEffect(() => {
        if (defaultColor) {
            setColor(defaultColor);
        }
    }, [defaultColor]);

    const handleColorChange = (newColor: string) => {
        setColor(newColor);
        if (onColorChange) {
            onColorChange(newColor);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(color);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const saveColor = async () => {
        setIsSaving(true);
        try {
            const response = await axios.post(route('cv.updateColor'), {
                primary_color: color
            });

            toast({
                title: t('cv_color.success_title'),
                description: t('cv_color.success_message'),
                variant: "default",
            });

            setIsOpen(false);

            if (onColorSaved) {
                onColorSaved();
            }

        } catch (error) {
            console.error('Error saving color:', error);
            toast({
                title: t('cv_color.error_title'),
                description: t('cv_color.error_message'),
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="group relative overflow-hidden flex items-center gap-1.5 md:gap-2 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-xs md:text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
                >
                    <div
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-200"
                        style={{ backgroundColor: color }}
                    />
                    <Palette className="w-3 h-3 md:w-4 md:h-4 text-gray-600 dark:text-gray-400" />
                    <span className="hidden sm:inline font-medium">{t('cv_color.customize_color')}</span>
                    <span className="sm:hidden font-medium">Couleur</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[320px] sm:w-[340px] p-0 border-0 shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
                align="start"
                sideOffset={8}
            >
                <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            🎨 {t('cv_color.choose_color')}
                        </CardTitle>

                        {/* Tabs Navigation */}
                        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mt-2">
                            <button
                                onClick={() => setActiveTab('presets')}
                                className={`flex-1 text-xs font-medium px-2 py-1.5 rounded-md transition-all duration-200 ${activeTab === 'presets'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {t('cv_color.recommended_colors')}
                            </button>
                            <button
                                onClick={() => setActiveTab('custom')}
                                className={`flex-1 text-xs font-medium px-2 py-1.5 rounded-md transition-all duration-200 ${activeTab === 'custom'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {t('cv_color.or_custom')}
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="px-4 pb-3">
                        {/* Preset Colors Tab */}
                        {activeTab === 'presets' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-6 gap-2">
                                    {suggestedColors.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleColorChange(suggestion.color)}
                                            className={`group relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 ${color === suggestion.color
                                                ? 'border-white ring-2 ring-gray-400 scale-110 shadow-lg'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            style={{ backgroundColor: suggestion.color }}
                                            title={suggestion.name}
                                        >
                                            {color === suggestion.color && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white drop-shadow-lg" strokeWidth={3} />
                                                </div>
                                            )}

                                            {/* Tooltip sur hover pour mobile */}
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                {suggestion.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    {t('cv_color.click_to_select')}
                                </p>
                            </div>
                        )}

                        {/* Custom Color Tab */}
                        {activeTab === 'custom' && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <HexColorPicker
                                            color={color}
                                            onChange={handleColorChange}
                                            style={{ width: '200px', height: '150px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Current Color Display */}
                        <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-8 h-8 rounded-lg border-2 border-white shadow-lg"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                            {t('cv_color.selected_color')}
                                        </p>
                                        <p className="text-sm font-mono font-semibold uppercase tracking-wide">
                                            {color}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="h-8 px-2 hover:bg-white/50 dark:hover:bg-gray-600/50"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-gray-500" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex gap-2 p-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={saveColor}
                            disabled={isSaving}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t('common.saving')}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    {t('common.save')}
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;