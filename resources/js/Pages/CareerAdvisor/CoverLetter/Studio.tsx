import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { LuxuryButton } from '@/Components/ui/luxury/Button';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Progress } from "@/Components/ui/progress";
import { Separator } from "@/Components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { useAIStream } from '@/hooks/useAIStream';
import {
    Sparkles, Download, ArrowLeft, RefreshCw, Wand2, FileText,
    ChevronDown, CheckCircle2, AlertTriangle, Type, Clock,
    Target, Zap, PenTool, SpellCheck, Minimize2, Maximize2,
    FileDown, Users, Briefcase, Building2, User, BookOpen,
    BarChart3, Hash, AlignLeft, TrendingUp, Info, Mic,
    ChevronRight, History as HistoryIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import HistoryDrawer from '@/Components/ai/HistoryDrawer';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft as AlignLeftIcon, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Undo2, Redo2
} from 'lucide-react';
import { Toggle } from "@/Components/ui/toggle";
import axios from 'axios';

// ─── Algorithmic Letter Quality Analysis ─────────────────────────────
function analyzeLetterQuality(text: string, jobDescription: string = '') {
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = cleanText.length > 0 ? words.length : 0;
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const sentenceCount = sentences.length;
    const avgSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
    const paragraphs = text.split(/<\/p>|<br\s*\/?>/).filter(p => p.replace(/<[^>]*>/g, '').trim().length > 10);
    const paragraphCount = paragraphs.length;

    // Readability (Flesch-like simple approximation for French)
    const syllableCount = words.reduce((acc, w) => acc + Math.max(1, w.replace(/[aeiouyàâäéèêëïîôùûüÿæœ]/gi, 'V').replace(/[^V]/g, '').length), 0);
    const readabilityScore = Math.max(0, Math.min(100, Math.round(
        206.835 - 1.015 * (wordCount / Math.max(1, sentenceCount)) - 84.6 * (syllableCount / Math.max(1, wordCount))
    )));

    // Reading time (average 200 words/min)
    const readingTimeMin = Math.max(1, Math.round(wordCount / 200));

    // Structure checks
    const hasGreeting = /madame|monsieur|cher|chère|dear|hello/i.test(cleanText);
    const hasClosing = /cordialement|salutations|sincères|respectueusement|distinguées|regards|sincerely/i.test(cleanText);
    const hasSubject = /objet|candidature|poste|position|application/i.test(cleanText.substring(0, 200));

    // Length assessment
    let lengthStatus: 'short' | 'ideal' | 'long' = 'ideal';
    if (wordCount < 150) lengthStatus = 'short';
    else if (wordCount > 500) lengthStatus = 'long';

    // Keyword matching with job description
    let keywordMatches: { found: string[]; missing: string[] } = { found: [], missing: [] };
    if (jobDescription) {
        const jobWords = jobDescription.toLowerCase()
            .replace(/[^a-zàâäéèêëïîôùûüÿæœ\s-]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 4)
            .filter((v, i, a) => a.indexOf(v) === i);
        // Remove common stop words
        const stopWords = new Set(['dans', 'pour', 'avec', 'cette', 'votre', 'notre', 'être', 'avoir', 'plus', 'faire', 'comme', 'aussi', 'autre', 'entre', 'après', 'avant', 'leurs', 'même', 'encore', 'leurs', 'under', 'about', 'their', 'which', 'there', 'would', 'these', 'other', 'could', 'after', 'should']);
        const significantJobWords = jobWords.filter(w => !stopWords.has(w)).slice(0, 20);
        const lowerText = cleanText.toLowerCase();
        keywordMatches.found = significantJobWords.filter(w => lowerText.includes(w));
        keywordMatches.missing = significantJobWords.filter(w => !lowerText.includes(w)).slice(0, 8);
    }

    // Structure score
    let structureScore = 0;
    if (hasGreeting) structureScore += 25;
    if (hasClosing) structureScore += 25;
    if (paragraphCount >= 3) structureScore += 25;
    if (lengthStatus === 'ideal') structureScore += 25;
    else if (lengthStatus !== 'short' || wordCount > 50) structureScore += 10;

    // Overall quality score
    const keywordScore = jobDescription
        ? Math.round((keywordMatches.found.length / Math.max(1, keywordMatches.found.length + keywordMatches.missing.length)) * 100)
        : null;

    return {
        wordCount,
        sentenceCount,
        paragraphCount,
        avgSentenceLength,
        readabilityScore,
        readingTimeMin,
        hasGreeting,
        hasClosing,
        hasSubject,
        lengthStatus,
        structureScore,
        keywordMatches,
        keywordScore,
    };
}

// ─── Premium Editor Toolbar ──────────────────────────────────────────
const PremiumToolbar = ({ editor }) => {
    if (!editor) return null;

    const ToolbarButton = ({ active, onClick, children, tooltip }) => (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onClick}
                        className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                            active
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                : "text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                    >
                        {children}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    const Divider = () => <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 mx-1" />;

    return (
        <div className="flex items-center gap-0.5 px-4 py-2 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
            <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} tooltip="Gras">
                <Bold className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} tooltip="Italique">
                <Italic className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} tooltip="Souligné">
                <UnderlineIcon className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} tooltip="Aligner à gauche">
                <AlignLeftIcon className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} tooltip="Centrer">
                <AlignCenter className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} tooltip="Aligner à droite">
                <AlignRight className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} tooltip="Justifier">
                <AlignJustify className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} tooltip="Liste à puces">
                <List className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} tooltip="Liste numérotée">
                <ListOrdered className="w-3.5 h-3.5" />
            </ToolbarButton>

            <Divider />

            <ToolbarButton active={false} onClick={() => editor.chain().focus().undo().run()} tooltip="Annuler">
                <Undo2 className="w-3.5 h-3.5" />
            </ToolbarButton>
            <ToolbarButton active={false} onClick={() => editor.chain().focus().redo().run()} tooltip="Rétablir">
                <Redo2 className="w-3.5 h-3.5" />
            </ToolbarButton>
        </div>
    );
};

// ─── Quality Analysis Panel ──────────────────────────────────────────
const QualityPanel = ({ analysis, isVisible }) => {
    if (!isVisible || !analysis) return null;

    const { wordCount, readingTimeMin, structureScore, hasGreeting, hasClosing, lengthStatus, avgSentenceLength, keywordMatches, keywordScore, paragraphCount } = analysis;

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-red-400';
    };

    const getProgressColor = (score: number) => {
        if (score >= 75) return 'bg-emerald-500';
        if (score >= 50) return 'bg-amber-500';
        return 'bg-red-400';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
        >
            {/* Structure Score */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Structure</span>
                    <span className={cn("text-sm font-bold", getScoreColor(structureScore))}>{structureScore}/100</span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${structureScore}%` }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className={cn("h-full rounded-full", getProgressColor(structureScore))}
                    />
                </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
                {[
                    { label: 'Salutation', ok: hasGreeting },
                    { label: 'Formule de politesse', ok: hasClosing },
                    { label: 'Paragraphes (3+)', ok: paragraphCount >= 3 },
                    { label: `Longueur (${wordCount} mots)`, ok: lengthStatus === 'ideal' },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                        <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                            item.ok ? "bg-emerald-500/10" : "bg-neutral-100 dark:bg-neutral-800"
                        )}>
                            {item.ok
                                ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                : <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                            }
                        </div>
                        <span className={cn("text-xs", item.ok ? "text-neutral-700 dark:text-neutral-300" : "text-neutral-400")}>{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{wordCount}</div>
                    <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Mots</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{readingTimeMin} min</div>
                    <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Lecture</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{avgSentenceLength}</div>
                    <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Mots/phrase</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3">
                    <div className="text-lg font-bold text-neutral-900 dark:text-neutral-50">{paragraphCount}</div>
                    <div className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Paragraphes</div>
                </div>
            </div>

            {/* Length indicator */}
            {lengthStatus !== 'ideal' && (
                <div className={cn(
                    "flex items-center gap-2 p-3 rounded-xl text-xs",
                    lengthStatus === 'short'
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                )}>
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    {lengthStatus === 'short'
                        ? 'Lettre courte — vise entre 250 et 400 mots'
                        : 'Lettre longue — essaie de raccourcir à 400 mots max'}
                </div>
            )}

            {/* Keyword Match */}
            {keywordScore !== null && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Mots-clés du poste</span>
                        <span className={cn("text-sm font-bold", getScoreColor(keywordScore))}>{keywordScore}%</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${keywordScore}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={cn("h-full rounded-full", getProgressColor(keywordScore))}
                        />
                    </div>
                    {keywordMatches.found.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {keywordMatches.found.slice(0, 6).map(kw => (
                                <span key={kw} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> {kw}
                                </span>
                            ))}
                        </div>
                    )}
                    {keywordMatches.missing.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {keywordMatches.missing.slice(0, 5).map(kw => (
                                <span key={kw} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

// ─── Main Studio Component ───────────────────────────────────────────
export default function Studio({ auth }) {
    const { t } = useTranslation();
    const { url } = usePage();
    const queryParams = new URLSearchParams(url.split('?')[1]);

    // Context from Wizard
    const [context, setContext] = useState({
        company: queryParams.get('company') || '',
        jobTitle: queryParams.get('jobTitle') || '',
        jobDescription: queryParams.get('jobDescription') || '',
        recipient: queryParams.get('recipient') || '',
        skills: queryParams.get('skills') || '',
        tone: queryParams.get('tone') || 'professional',
        key_points: queryParams.get('key_points') || ''
    });

    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showContextPanel, setShowContextPanel] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [letterTitle, setLetterTitle] = useState(
        context.company ? `Lettre — ${context.jobTitle} @ ${context.company}` : 'Lettre de motivation'
    );

    const { stream, abort, isStreaming } = useAIStream();

    // Tiptap editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder: 'Commencez à écrire votre lettre de motivation ou utilisez l\'IA pour la générer automatiquement...'
            })
        ],
        content: content,
        editable: true,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[600px] text-[11pt] leading-relaxed font-serif'
            }
        }
    });

    // Update editor content when content state changes externally (AI generation)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Load history from sidebar click
    useEffect(() => {
        const historyData = sessionStorage.getItem('load_history_cover_letter');
        if (historyData && editor) {
            try {
                const parsedData = JSON.parse(historyData);
                if (parsedData.content) {
                    setContent(parsedData.content);
                }
                if (parsedData.context) {
                    setContext(parsedData.context);
                }
            } catch (e) {
                console.error("Failed to load history data for cover letter", e);
            }
            sessionStorage.removeItem('load_history_cover_letter');
        }
    }, [editor]);

    // Quality analysis (algorithmic, no tokens)
    const quality = useMemo(() => {
        return analyzeLetterQuality(content, context.jobDescription);
    }, [content, context.jobDescription]);

    // ─── AI Actions ───────────────────────────────────────────────
    const handleFullGeneration = async () => {
        setIsGenerating(true);
        let accumulated = '';
        const toastId = toast.loading('Génération de votre lettre en cours...');

        try {
            await stream(route('career-advisor.cover-letter.generate'), {
                section: 'full_letter',
                context: {
                    name: auth.user.name,
                    ...context,
                    skills: context.skills ? context.skills.split(',').map(s => s.trim()) : [],
                },
                tone: context.tone,
            }, {
                onChunk: (chunk) => {
                    accumulated += chunk;
                    setContent(accumulated.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>'));
                },
                onComplete: () => {
                    // Wrap in paragraphs for proper editor formatting
                    const formatted = '<p>' + accumulated.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>') + '</p>';
                    setContent(formatted);
                    toast.success('Lettre générée avec succès !', { id: toastId });
                    setIsGenerating(false);
                },
                onError: () => {
                    toast.error('Erreur lors de la génération.', { id: toastId });
                    setIsGenerating(false);
                }
            });
        } catch (e) {
            setIsGenerating(false);
            toast.error('Erreur lors de la génération.', { id: toastId });
        }
    };

    const handleImproveText = async (action: string) => {
        if (!content || content.replace(/<[^>]*>/g, '').trim().length < 10) {
            toast.error('Écrivez ou générez d\'abord du contenu à améliorer.');
            return;
        }

        setIsGenerating(true);
        let accumulated = '';
        const actionLabels = {
            improve: 'Amélioration',
            shorten: 'Raccourcissement',
            expand: 'Développement',
            formal: 'Formalisation',
            creative: 'Créativité'
        };
        const toastId = toast.loading(`${actionLabels[action]} en cours...`);

        const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        try {
            await stream(route('career-advisor.cover-letter.improve'), {
                text: plainText,
                action: action,
                context: context,
            }, {
                onChunk: (chunk) => {
                    accumulated += chunk;
                    setContent('<p>' + accumulated.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>') + '</p>');
                },
                onComplete: () => {
                    const formatted = '<p>' + accumulated.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>') + '</p>';
                    setContent(formatted);
                    toast.success(`${actionLabels[action]} terminé(e) !`, { id: toastId });
                    setIsGenerating(false);
                },
                onError: () => {
                    toast.error('Erreur lors du traitement.', { id: toastId });
                    setIsGenerating(false);
                }
            });
        } catch (e) {
            setIsGenerating(false);
            toast.error('Erreur lors du traitement.', { id: toastId });
        }
    };

    const handleCorrectGrammar = async () => {
        if (!content || content.replace(/<[^>]*>/g, '').trim().length < 10) {
            toast.error('Écrivez ou générez d\'abord du contenu à corriger.');
            return;
        }

        setIsGenerating(true);
        let accumulated = '';
        const toastId = toast.loading('Correction en cours...');
        const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

        try {
            await stream(route('career-advisor.cover-letter.correct'), {
                text: plainText,
            }, {
                onChunk: (chunk) => {
                    accumulated += chunk;
                    setContent('<p>' + accumulated.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>') + '</p>');
                },
                onComplete: () => {
                    const formatted = '<p>' + accumulated.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>') + '</p>';
                    setContent(formatted);
                    toast.success('Correction terminée !', { id: toastId });
                    setIsGenerating(false);
                },
                onError: () => {
                    toast.error('Erreur lors de la correction.', { id: toastId });
                    setIsGenerating(false);
                }
            });
        } catch (e) {
            setIsGenerating(false);
            toast.error('Erreur lors de la correction.', { id: toastId });
        }
    };

    // ─── Export ────────────────────────────────────────────────────
    const handleExport = async (format: 'pdf' | 'docx') => {
        if (!content || content.replace(/<[^>]*>/g, '').trim().length < 10) {
            toast.error('Écrivez ou générez d\'abord du contenu à exporter.');
            return;
        }

        setIsExporting(true);
        const toastId = toast.loading(`Export ${format.toUpperCase()} en cours...`);

        try {
            const routeName = format === 'pdf'
                ? 'career-advisor.cover-letter.export-pdf'
                : 'career-advisor.cover-letter.export-docx';

            const response = await axios.post(route(routeName), {
                content: content,
                title: letterTitle,
                context: context,
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = `lettre-motivation-${context.company ? context.company.toLowerCase().replace(/\s+/g, '-') : 'export'}.${format}`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            toast.success(`${format.toUpperCase()} téléchargé !`, { id: toastId });
        } catch (error) {
            toast.error(`Erreur lors de l'export ${format.toUpperCase()}.`, { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    // ─── Interview Simulation ─────────────────────────────────────
    const handleInterviewSimulation = () => {
        const params = new URLSearchParams({
            jobTitle: context.jobTitle,
            company: context.company,
            jobDescription: context.jobDescription,
        });
        router.visit(route('career-advisor.interview.setup') + '?' + params.toString());
    };

    // Tones
    const tones = [
        { value: 'professional', label: 'Professionnel', icon: Briefcase },
        { value: 'creative', label: 'Créatif', icon: Sparkles },
        { value: 'confident', label: 'Confiant', icon: TrendingUp },
        { value: 'humble', label: 'Humble', icon: BookOpen },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Studio — Lettre de motivation" />

            <div className="h-[calc(100vh-50px)] flex bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
                <HistoryDrawer 
                    isOpen={isHistoryOpen} 
                    onClose={() => setIsHistoryOpen(false)}
                    context="cover_letter"
                    title="Historique des Lettres"
                    onSelect={(item) => {
                        if (item.structured_data && item.structured_data.content) {
                            setContent(item.structured_data.content);
                            if (item.structured_data.context) {
                                setContext(item.structured_data.context);
                            }
                            toast.success("Ancienne lettre chargée.");
                        } else {
                            toast.error("Données d'historique invalides.");
                        }
                    }}
                />

                {/* ─── LEFT SIDEBAR — AI Assistant ─── */}
                <div className="w-[280px] bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex flex-col hidden lg:flex">

                    {/* Header */}
                    <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Assistant IA</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1">Outils intelligents pour perfectionner votre lettre</p>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-5 space-y-6">

                            {/* Context Summary */}
                            {context.company && (
                                <div className="space-y-3">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Contexte</span>
                                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                            <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{context.company}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                            <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{context.jobTitle}</span>
                                        </div>
                                        {context.recipient && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                                <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{context.recipient}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Generation */}
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Génération</span>
                                <LuxuryButton
                                    variant="primary"
                                    className="w-full justify-start text-xs h-10 shadow-lg shadow-amber-500/10"
                                    onClick={handleFullGeneration}
                                    disabled={isGenerating}
                                >
                                    {isGenerating
                                        ? <RefreshCw className="w-3.5 h-3.5 mr-2.5 animate-spin" />
                                        : <Zap className="w-3.5 h-3.5 mr-2.5" />
                                    }
                                    {content.replace(/<[^>]*>/g, '').trim().length > 10 ? 'Régénérer la lettre' : 'Générer la lettre'}
                                </LuxuryButton>
                            </div>

                            {/* AI Tools */}
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Outils de rédaction</span>
                                <div className="space-y-1.5">
                                    {[
                                        { action: 'improve', icon: Wand2, label: 'Améliorer le style' },
                                        { action: 'shorten', icon: Minimize2, label: 'Raccourcir' },
                                        { action: 'expand', icon: Maximize2, label: 'Développer' },
                                        { action: 'formal', icon: Briefcase, label: 'Plus formel' },
                                        { action: 'creative', icon: PenTool, label: 'Plus créatif' },
                                    ].map(tool => (
                                        <LuxuryButton
                                            key={tool.action}
                                            variant="ghost"
                                            className="w-full justify-start text-xs h-9 border-neutral-100 dark:border-neutral-800"
                                            onClick={() => handleImproveText(tool.action)}
                                            disabled={isGenerating}
                                        >
                                            <tool.icon className="w-3.5 h-3.5 mr-2.5" />
                                            {tool.label}
                                        </LuxuryButton>
                                    ))}
                                </div>
                            </div>

                            {/* Grammar */}
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Correction</span>
                                <LuxuryButton
                                    variant="ghost"
                                    className="w-full justify-start text-xs h-9 border-neutral-100 dark:border-neutral-800"
                                    onClick={handleCorrectGrammar}
                                    disabled={isGenerating}
                                >
                                    <SpellCheck className="w-3.5 h-3.5 mr-2.5" />
                                    Corriger grammaire et orthographe
                                </LuxuryButton>
                            </div>

                            <Separator className="bg-neutral-100 dark:bg-neutral-800" />

                            {/* Quality Analysis */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Analyse qualité</span>
                                <QualityPanel analysis={quality} isVisible={quality.wordCount > 0} />
                                {quality.wordCount === 0 && (
                                    <p className="text-xs text-neutral-400 italic">Commencez à écrire pour voir l'analyse...</p>
                                )}
                            </div>

                            <Separator className="bg-neutral-100 dark:bg-neutral-800" />

                            {/* Interview Simulation */}
                            <div className="space-y-2.5">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Préparation</span>
                                <LuxuryButton
                                    variant="ghost"
                                    className="w-full justify-start text-xs h-10 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 group"
                                    onClick={handleInterviewSimulation}
                                    disabled={!context.jobTitle}
                                >
                                    <Mic className="w-3.5 h-3.5 mr-2.5" />
                                    Simuler l'entretien
                                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </LuxuryButton>
                                <p className="text-[10px] text-neutral-400 leading-relaxed">
                                    Préparez-vous à l'entretien pour ce poste avec une simulation IA
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* ─── CENTER — Editor Area ─── */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Top Header Bar */}
                    <header className="h-14 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-5 flex-shrink-0">
                        <div className="flex items-center gap-4 min-w-0">
                            <LuxuryButton variant="ghost" size="sm" onClick={() => window.history.back()} className="rounded-full h-8 w-8 p-0 flex-shrink-0">
                                <ArrowLeft className="w-4 h-4" />
                            </LuxuryButton>
                            <div className="min-w-0">
                                <input
                                    type="text"
                                    value={letterTitle}
                                    onChange={(e) => setLetterTitle(e.target.value)}
                                    className="font-semibold text-neutral-900 dark:text-neutral-50 text-sm tracking-tight bg-transparent border-none p-0 focus:outline-none focus:ring-0 w-full truncate"
                                />
                                <p className="text-[9px] text-amber-500 uppercase tracking-[0.2em] mt-0.5 font-bold">
                                    Cover Letter Studio
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Historique Button */}
                            <LuxuryButton variant="ghost" size="sm" className="hidden lg:flex h-8 px-3" onClick={() => setIsHistoryOpen(true)}>
                                <HistoryIcon className="w-3.5 h-3.5 mr-1.5" />
                                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Historique</span>
                            </LuxuryButton>
                            
                            {/* Mobile AI & History toggle */}
                            <LuxuryButton variant="ghost" size="sm" className="lg:hidden h-8 px-2" onClick={() => setIsHistoryOpen(true)}>
                                <HistoryIcon className="w-3.5 h-3.5 mr-1" />
                            </LuxuryButton>
                            <LuxuryButton variant="ghost" size="sm" className="lg:hidden h-8 px-3" onClick={() => setShowContextPanel(!showContextPanel)}>
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                <span className="text-xs">IA</span>
                            </LuxuryButton>

                            {/* Export dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <LuxuryButton variant="primary" className="h-9 px-4 text-xs shadow-lg shadow-amber-500/10" disabled={isExporting}>
                                        {isExporting
                                            ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                                            : <Download className="w-3.5 h-3.5 mr-2" />
                                        }
                                        Exporter
                                        <ChevronDown className="w-3 h-3 ml-1.5" />
                                    </LuxuryButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-xs cursor-pointer">
                                        <FileText className="w-3.5 h-3.5 mr-2.5 text-red-500" />
                                        Exporter en PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExport('docx')} className="text-xs cursor-pointer">
                                        <FileDown className="w-3.5 h-3.5 mr-2.5 text-blue-500" />
                                        Exporter en Word (DOCX)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Toolbar */}
                    <PremiumToolbar editor={editor} />

                    {/* Editor Canvas */}
                    <div className="flex-1 overflow-y-auto bg-neutral-100/50 dark:bg-neutral-950 p-6 lg:p-10 flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="w-full max-w-[210mm] min-h-[297mm] bg-white dark:bg-neutral-900 shadow-2xl shadow-neutral-200/50 dark:shadow-black/30 border border-neutral-200/50 dark:border-neutral-800/50 rounded-sm relative"
                        >
                            {/* A4 Page Content */}
                            <div className="px-12 py-14 lg:px-16 lg:py-16">
                                <EditorContent editor={editor} />
                            </div>

                            {/* Streaming indicator */}
                            <AnimatePresence>
                                {isGenerating && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full text-xs font-medium shadow-lg shadow-amber-500/30"
                                    >
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        Rédaction en cours...
                                        <button onClick={abort} className="ml-1 hover:bg-amber-600 rounded-full p-0.5 transition-colors">✕</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* ─── RIGHT SIDEBAR — Context & Info ─── */}
                <div className={cn(
                    "w-[280px] bg-white dark:bg-neutral-900 border-l border-neutral-100 dark:border-neutral-800 flex-shrink-0 flex-col hidden lg:flex"
                )}>
                    <div className="p-5 border-b border-neutral-100 dark:border-neutral-800">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Informations du poste</span>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-5 space-y-5">

                            {/* Editable Context */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Entreprise</Label>
                                    <Input
                                        value={context.company}
                                        onChange={e => setContext({ ...context, company: e.target.value })}
                                        className="h-8 text-xs bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-lg"
                                        placeholder="Nom de l'entreprise"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Poste visé</Label>
                                    <Input
                                        value={context.jobTitle}
                                        onChange={e => setContext({ ...context, jobTitle: e.target.value })}
                                        className="h-8 text-xs bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-lg"
                                        placeholder="Titre du poste"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Destinataire</Label>
                                    <Input
                                        value={context.recipient}
                                        onChange={e => setContext({ ...context, recipient: e.target.value })}
                                        className="h-8 text-xs bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-lg"
                                        placeholder="M./Mme Dupont"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Compétences clés</Label>
                                    <Input
                                        value={context.skills}
                                        onChange={e => setContext({ ...context, skills: e.target.value })}
                                        className="h-8 text-xs bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-lg"
                                        placeholder="React, Leadership, ..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.15em]">Description du poste</Label>
                                    <Textarea
                                        value={context.jobDescription}
                                        onChange={e => setContext({ ...context, jobDescription: e.target.value })}
                                        className="min-h-[80px] text-xs bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 rounded-lg resize-none"
                                        placeholder="Collez la description du poste..."
                                    />
                                </div>
                            </div>

                            <Separator className="bg-neutral-100 dark:bg-neutral-800" />

                            {/* Tone Selector */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Ton de la lettre</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {tones.map(toneItem => (
                                        <button
                                            key={toneItem.value}
                                            onClick={() => setContext({ ...context, tone: toneItem.value })}
                                            className={cn(
                                                "h-16 flex flex-col items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 rounded-xl border",
                                                context.tone === toneItem.value
                                                    ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm"
                                                    : "border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200 dark:hover:border-neutral-700"
                                            )}
                                        >
                                            <toneItem.icon className="w-3.5 h-3.5" />
                                            {toneItem.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-neutral-100 dark:bg-neutral-800" />

                            {/* Quick Stats */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Statistiques</span>
                                <div className="flex items-center justify-between text-xs text-neutral-500">
                                    <span className="flex items-center gap-1.5"><Hash className="w-3 h-3" /> {quality.wordCount} mots</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> ~{quality.readingTimeMin} min</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-neutral-500">
                                    <span className="flex items-center gap-1.5"><AlignLeft className="w-3 h-3" /> {quality.paragraphCount} §</span>
                                    <span className={cn(
                                        "flex items-center gap-1.5 font-medium",
                                        quality.lengthStatus === 'ideal' ? 'text-emerald-500' : quality.lengthStatus === 'short' ? 'text-amber-500' : 'text-blue-500'
                                    )}>
                                        {quality.lengthStatus === 'ideal' ? '✓ Idéal' : quality.lengthStatus === 'short' ? '↑ Courte' : '↓ Longue'}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </ScrollArea>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
