import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2, History as HistoryIcon, ChevronRight, FileText, Target, Mic, Briefcase } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoryDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    context: 'cv_analysis' | 'roadmap' | 'interview_session' | 'cover_letter';
    onSelect: (item: any) => void;
    title: string;
}

const getContextIcon = (context: string) => {
    switch (context) {
        case 'cv_analysis': return <Briefcase className="w-5 h-5" />;
        case 'roadmap': return <Target className="w-5 h-5" />;
        case 'interview_session': return <Mic className="w-5 h-5" />;
        case 'cover_letter': return <FileText className="w-5 h-5" />;
        default: return <HistoryIcon className="w-5 h-5" />;
    }
};

export default function HistoryDrawer({ isOpen, onClose, context, onSelect, title }: HistoryDrawerProps) {
    const [histories, setHistories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, context]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(route('career-advisor.history.index', { context }));
            setHistories(res.data.data);
        } catch (error) {
            toast.error("Impossible de charger l'historique");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteHistory = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await axios.delete(route('career-advisor.history.destroy', { id }));
            setHistories(prev => prev.filter(h => h.id !== id));
            toast.success("Historique supprimé");
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col border-l border-neutral-200 dark:border-neutral-800"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-500">
                                    {getContextIcon(context)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg">{title}</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Historique des générations</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                            {isLoading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-xl h-24 w-full" />
                                ))
                            ) : histories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                                    <Clock className="w-12 h-12 text-neutral-400" />
                                    <p className="text-sm font-medium">Aucun historique trouvé pour ce module.</p>
                                </div>
                            ) : (
                                histories.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => {
                                            onSelect(item);
                                            onClose();
                                        }}
                                        className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 cursor-pointer hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all overflow-hidden"
                                    >
                                        <div className="absolute inset-y-0 left-0 w-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate pr-8">
                                                {item.context_id || 'Session'}
                                            </h4>
                                            <button
                                                onClick={(e) => deleteHistory(item.id, e)}
                                                className="absolute top-4 right-4 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-medium text-xs flex items-center gap-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                            <Clock className="w-3 h-3" />
                                            <span>
                                                {format(parseISO(item.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                            </span>
                                            <span className="mx-1">•</span>
                                            <span className="italic">{item.created_at_human}</span>
                                        </div>
                                        
                                        <div className="mt-3 flex justify-end">
                                            <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 group-hover:translate-x-1 transition-transform">
                                                Visualiser <ChevronRight className="w-3 h-3 ml-1" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
