import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Effect to update content only if it's different (to avoid cursor jumps)
    useEffect(() => {
        if (editorRef.current && isMounted) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value, isMounted]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        handleInput();
        editorRef.current?.focus();
    };

    return (
        <div className={cn("border rounded-md overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 relative", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1.5 border-b bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Gras"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Italique"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                    type="button"
                    onClick={() => execCommand('insertUnorderedList')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Liste à puces"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('insertOrderedList')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Liste numérotée"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="p-3 min-h-[120px] max-h-[300px] overflow-auto focus:outline-none text-sm dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none rich-text-content"
            />

            <style>{`
                .rich-text-content ul { list-style-type: disc !important; padding-left: 1.25rem !important; margin: 0.5rem 0 !important; }
                .rich-text-content ol { list-style-type: decimal !important; padding-left: 1.25rem !important; margin: 0.5rem 0 !important; }
                .rich-text-content li { display: list-item !important; margin-bottom: 0.125rem !important; }
                .rich-text-content { outline: none !important; }
            `}</style>

            {(!value || value === '<br>') && placeholder && (
                <div className="absolute top-[3.25rem] left-3 text-gray-400 pointer-events-none text-sm">
                    {placeholder}
                </div>
            )}
        </div>
    );
}
