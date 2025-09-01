import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
    CheckCircle, Circle, Clock, Star, Download,
    Plus, Trash2, Edit3, Calendar, Flag, Target
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';

interface ChecklistItem {
    text: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    deadline?: string;
    notes?: string;
    estimatedTime?: string;
}

interface InteractiveChecklistProps {
    title: string;
    items: ChecklistItem[];
    completable?: boolean;
    editable?: boolean;
}

export default function InteractiveChecklist({ 
    title, 
    items: initialItems, 
    completable = true, 
    editable = false 
}: InteractiveChecklistProps) {
    const [items, setItems] = useState<ChecklistItem[]>(initialItems);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const completedCount = items.filter(item => item.completed).length;
    const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

    const toggleItem = (index: number) => {
        if (!completable) return;
        
        setItems(prev => prev.map((item, i) => 
            i === index ? { ...item, completed: !item.completed } : item
        ));
    };

    const addItem = () => {
        if (!newItemText.trim()) return;
        
        const newItem: ChecklistItem = {
            text: newItemText.trim(),
            completed: false,
            priority: 'medium'
        };
        
        setItems(prev => [...prev, newItem]);
        setNewItemText('');
        setShowAddDialog(false);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'high': return <Flag className="w-3 h-3 text-red-500" />;
            case 'medium': return <Target className="w-3 h-3 text-amber-500" />;
            case 'low': return <Circle className="w-3 h-3 text-gray-400" />;
            default: return <Circle className="w-3 h-3 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-l-red-500 bg-red-50/50';
            case 'medium': return 'border-l-amber-500 bg-amber-50/50';
            case 'low': return 'border-l-gray-300 bg-gray-50/50';
            default: return 'border-l-gray-300 bg-gray-50/50';
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'completed') return item.completed;
        if (filter === 'pending') return !item.completed;
        return true;
    });

    const exportChecklist = () => {
        const report = `
PLAN D'ACTION - ${title}
${'='.repeat(50)}

PROGRESSION: ${completedCount}/${items.length} (${Math.round(progress)}%)

ACTIONS:
${items.map((item, i) => 
    `${item.completed ? '✅' : '☐'} ${i+1}. ${item.text}${item.priority !== 'medium' ? ` [${item.priority.toUpperCase()}]` : ''}`
).join('\n')}

ACTIONS RESTANTES:
${items.filter(item => !item.completed).map(item => `• ${item.text}`).join('\n')}

Généré par Guidy - ${new Date().toLocaleDateString('fr-FR')}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `plan_action_${Date.now()}.txt`;
        link.click();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4"
        >
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50/30 to-purple-50/30">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-amber-600" />
                            {title}
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                {completedCount}/{items.length}
                            </Badge>
                            
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={exportChecklist}
                                className="h-7 px-2 text-xs"
                            >
                                <Download className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                        <Progress value={progress} className="flex-1 h-2" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Filtres */}
                    {items.length > 3 && (
                        <div className="flex gap-2 mb-4">
                            {['all', 'pending', 'completed'].map(filterType => (
                                <Button
                                    key={filterType}
                                    variant={filter === filterType ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFilter(filterType as any)}
                                    className={`text-xs h-7 ${
                                        filter === filterType 
                                            ? 'bg-gradient-to-r from-amber-500 to-purple-500' 
                                            : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                    }`}
                                >
                                    {filterType === 'all' ? 'Tout' : 
                                     filterType === 'pending' ? 'À faire' : 'Terminé'}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Liste des items */}
                    <div className="space-y-2">
                        <AnimatePresence>
                            {filteredItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-all ${
                                        getPriorityColor(item.priority)
                                    } ${item.completed ? 'opacity-60' : ''}`}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleItem(items.indexOf(item))}
                                        disabled={!completable}
                                        className="mt-0.5 transition-transform hover:scale-110"
                                    >
                                        {item.completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-gray-400 hover:text-amber-600" />
                                        )}
                                    </button>

                                    {/* Contenu */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getPriorityIcon(item.priority)}
                                            <span className={`text-sm ${
                                                item.completed 
                                                    ? 'line-through text-gray-500' 
                                                    : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                                {item.text}
                                            </span>
                                        </div>
                                        
                                        {/* Métadonnées */}
                                        {(item.deadline || item.estimatedTime) && (
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                {item.deadline && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {item.deadline}
                                                    </div>
                                                )}
                                                {item.estimatedTime && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {item.estimatedTime}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {item.notes && (
                                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                                                💡 {item.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {editable && (
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(items.indexOf(item))}
                                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Ajouter un item */}
                    {editable && (
                        <div className="mt-4 pt-4 border-t border-amber-200">
                            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Ajouter une action
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Nouvelle action</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Input
                                                value={newItemText}
                                                onChange={(e) => setNewItemText(e.target.value)}
                                                placeholder="Décrivez l'action à réaliser..."
                                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                                Annuler
                                            </Button>
                                            <Button onClick={addItem} disabled={!newItemText.trim()}>
                                                Ajouter
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}

                    {/* Résumé de progression */}
                    {items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-amber-200">
                            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>
                                    {completedCount} terminée{completedCount > 1 ? 's' : ''}, {items.length - completedCount} restante{(items.length - completedCount) > 1 ? 's' : ''}
                                </span>
                                {progress === 100 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex items-center gap-1 text-green-600"
                                    >
                                        <Star className="w-3 h-3" />
                                        <span className="font-medium">Terminé !</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}