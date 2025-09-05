import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    BarChart3, TrendingUp, PieChart, Download,
    Eye, EyeOff, Maximize2, Info
} from 'lucide-react';

interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'progress';
    labels: string[];
    values: number[];
    colors?: string[];
    unit?: string;
    title?: string;
}

interface SimpleChartProps {
    title: string;
    data: ChartData;
    interactive?: boolean;
}

export default function SimpleChart({ title, data, interactive = true }: SimpleChartProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [showValues, setShowValues] = useState(true);

    const maxValue = Math.max(...data.values);
    const totalValue = data.values.reduce((sum, val) => sum + val, 0);

    const defaultColors = [
        '#f59e0b', '#a855f7', '#10b981', '#ef4444', '#3b82f6',
        '#f97316', '#8b5cf6', '#06b6d4', '#84cc16', '#f43f5e'
    ];

    const colors = data.colors || defaultColors.slice(0, data.values.length);

    const exportChart = () => {
        const chartData = `
GRAPHIQUE - ${title}
${'='.repeat(50)}

DONNÉES:
${data.labels.map((label, i) => 
    `${label}: ${data.values[i]}${data.unit || ''}`
).join('\n')}

TOTAL: ${totalValue}${data.unit || ''}
MAXIMUM: ${maxValue}${data.unit || ''}

Généré par Guidy - ${new Date().toLocaleDateString('fr-FR')}
        `.trim();

        const blob = new Blob([chartData], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `graphique_${Date.now()}.txt`;
        link.click();
    };

    const renderBarChart = () => (
        <div className="space-y-3">
            {data.labels.map((label, index) => {
                const value = data.values[index];
                const percentage = (value / maxValue) * 100;
                const isHovered = hoveredIndex === index;
                
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                        onMouseEnter={() => interactive && setHoveredIndex(index)}
                        onMouseLeave={() => interactive && setHoveredIndex(null)}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {label}
                            </span>
                            {showValues && (
                                <span className={`text-xs font-bold transition-colors ${
                                    isHovered ? 'text-amber-600' : 'text-gray-600'
                                }`}>
                                    {value}{data.unit || ''}
                                </span>
                            )}
                        </div>
                        
                        <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full transition-all ${
                                    isHovered 
                                        ? 'bg-gradient-to-r from-amber-400 to-purple-400' 
                                        : 'bg-gradient-to-r from-amber-500 to-purple-500'
                                }`}
                                style={{ backgroundColor: colors[index] }}
                            />
                            
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <span className="text-xs font-bold text-white drop-shadow">
                                        {Math.round(percentage)}%
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );

    const renderPieChart = () => {
        let cumulativePercentage = 0;
        
        return (
            <div className="flex items-center gap-6">
                {/* Graphique circulaire simple */}
                <div className="relative w-32 h-32">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {data.values.map((value, index) => {
                            const percentage = (value / totalValue) * 100;
                            const strokeDasharray = `${percentage} ${100 - percentage}`;
                            const strokeDashoffset = -cumulativePercentage;
                            
                            cumulativePercentage += percentage;
                            
                            return (
                                <motion.circle
                                    key={index}
                                    initial={{ strokeDasharray: "0 100" }}
                                    animate={{ strokeDasharray }}
                                    transition={{ delay: index * 0.2, duration: 0.8 }}
                                    cx="50"
                                    cy="50"
                                    r="15.9155"
                                    fill="transparent"
                                    stroke={colors[index]}
                                    strokeWidth="8"
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all hover:stroke-width-10"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                />
                            );
                        })}
                    </svg>
                    
                    {/* Valeur centrale */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                {totalValue}
                            </div>
                            <div className="text-xs text-gray-500">
                                {data.unit || 'Total'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Légende */}
                <div className="space-y-2">
                    {data.labels.map((label, index) => {
                        const value = data.values[index];
                        const percentage = (value / totalValue) * 100;
                        const isHovered = hoveredIndex === index;
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center gap-2 p-1 rounded transition-colors ${
                                    isHovered ? 'bg-amber-50' : ''
                                }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: colors[index] }}
                                />
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {label}
                                </span>
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {value}{data.unit || ''} ({Math.round(percentage)}%)
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
        >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50/30 to-purple-50/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            {data.type === 'pie' ? (
                                <PieChart className="w-4 h-4 text-amber-600" />
                            ) : (
                                <BarChart3 className="w-4 h-4 text-amber-600" />
                            )}
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowValues(!showValues)}
                                className="h-7 px-2 text-xs"
                            >
                                {showValues ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={exportChart}
                                className="h-7 px-2 text-xs"
                            >
                                <Download className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {data.type === 'pie' ? renderPieChart() : renderBarChart()}
                    
                    {/* Info hover */}
                    {hoveredIndex !== null && interactive && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-2 bg-amber-100 border border-amber-200 rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <Info className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-medium text-amber-800">
                                    {data.labels[hoveredIndex]}: {data.values[hoveredIndex]}{data.unit || ''}
                                    {data.type === 'pie' && ` (${Math.round((data.values[hoveredIndex] / totalValue) * 100)}%)`}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}