import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    ChevronUp, ChevronDown, Download, Search, Filter,
    ArrowUpDown, FileSpreadsheet, Eye, MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

interface InteractiveTableProps {
    title: string;
    headers: string[];
    rows: string[][];
    exportable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
}

export default function InteractiveTable({ 
    title, 
    headers, 
    rows, 
    exportable = true, 
    sortable = true, 
    filterable = true 
}: InteractiveTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: number; direction: 'asc' | 'desc' } | null>(null);
    const [filterText, setFilterText] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Données filtrées et triées
    const processedData = useMemo(() => {
        let filtered = rows;

        // Filtrage
        if (filterText) {
            filtered = rows.filter(row =>
                row.some(cell => 
                    cell.toLowerCase().includes(filterText.toLowerCase())
                )
            );
        }

        // Tri
        if (sortConfig) {
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';
                
                // Tri numérique si possible
                const aNum = parseFloat(aVal.replace(/[^\d.-]/g, ''));
                const bNum = parseFloat(bVal.replace(/[^\d.-]/g, ''));
                
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
                }
                
                // Tri alphabétique
                const comparison = aVal.localeCompare(bVal);
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return filtered;
    }, [rows, filterText, sortConfig]);

    const handleSort = (columnIndex: number) => {
        if (!sortable) return;

        setSortConfig(current => {
            if (current?.key === columnIndex) {
                return current.direction === 'asc' 
                    ? { key: columnIndex, direction: 'desc' }
                    : null;
            }
            return { key: columnIndex, direction: 'asc' };
        });
    };

    const exportToCSV = () => {
        const csvContent = [
            headers.join(','),
            ...processedData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
        link.click();
    };

    const getSortIcon = (columnIndex: number) => {
        if (!sortable) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
        
        if (sortConfig?.key === columnIndex) {
            return sortConfig.direction === 'asc' 
                ? <ChevronUp className="w-3 h-3 text-amber-600" />
                : <ChevronDown className="w-3 h-3 text-amber-600" />;
        }
        return <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-amber-600" />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
        >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50/50 to-purple-50/50">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                {processedData.length} ligne{processedData.length > 1 ? 's' : ''}
                            </Badge>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {filterable && (
                                        <DropdownMenuItem onClick={() => setShowFilters(!showFilters)}>
                                            <Filter className="w-3 h-3 mr-2" />
                                            {showFilters ? 'Masquer filtres' : 'Afficher filtres'}
                                        </DropdownMenuItem>
                                    )}
                                    {exportable && (
                                        <DropdownMenuItem onClick={exportToCSV}>
                                            <Download className="w-3 h-3 mr-2" />
                                            Exporter CSV
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setSortConfig(null)}>
                                        <ArrowUpDown className="w-3 h-3 mr-2" />
                                        Réinitialiser tri
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Barre de filtrage */}
                    {showFilters && filterable && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3"
                        >
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Filtrer les données..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="pl-9 h-8 text-xs"
                                />
                            </div>
                        </motion.div>
                    )}
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-amber-200">
                                    {headers.map((header, index) => (
                                        <th
                                            key={index}
                                            className={`text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300 ${
                                                sortable ? 'cursor-pointer hover:bg-amber-100/50 group' : ''
                                            }`}
                                            onClick={() => handleSort(index)}
                                        >
                                            <div className="flex items-center gap-1">
                                                <span>{header}</span>
                                                {getSortIcon(index)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.map((row, rowIndex) => (
                                    <motion.tr
                                        key={rowIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: rowIndex * 0.05 }}
                                        className="border-b border-gray-100 hover:bg-amber-50/30 transition-colors"
                                    >
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                                {this.formatCell(cell, headers[cellIndex])}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Message si aucun résultat */}
                    {processedData.length === 0 && filterText && (
                        <div className="text-center py-4">
                            <div className="text-gray-500 text-xs">
                                Aucun résultat pour "{filterText}"
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );

    // Formater les cellules selon le type de données
    private static formatCell(cell: string, header: string): React.ReactNode {
        // Détecter les pourcentages
        if (cell.includes('%')) {
            const percentage = parseInt(cell.replace('%', ''));
            if (!isNaN(percentage)) {
                return (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                            <div 
                                className="bg-gradient-to-r from-amber-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                            />
                        </div>
                        <span className="text-xs">{cell}</span>
                    </div>
                );
            }
        }

        // Détecter les scores (ex: "8/10")
        if (cell.includes('/')) {
            const [current, max] = cell.split('/').map(n => parseInt(n.trim()));
            if (!isNaN(current) && !isNaN(max)) {
                const percentage = (current / max) * 100;
                const color = percentage >= 80 ? 'text-green-600' : 
                             percentage >= 60 ? 'text-amber-600' : 'text-red-600';
                
                return <span className={`font-medium ${color}`}>{cell}</span>;
            }
        }

        // Détecter les montants (€, $)
        if (cell.includes('€') || cell.includes('$')) {
            return <span className="font-medium text-green-600">{cell}</span>;
        }

        // Détecter les statuts
        if (['✅', '❌', '🟢', '🔴', '🟡'].some(emoji => cell.includes(emoji))) {
            return <span>{cell}</span>;
        }

        return cell;
    }
}