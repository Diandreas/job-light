import React from 'react';
import { ScrollArea } from "@/Components/ui/scroll-area";

export default function LivePreview({ content, context }) {
    const fullText = [
        content.greeting,
        content.intro,
        content.body,
        content.conclusion
    ].filter(Boolean).join('\n\n');

    return (
        <ScrollArea className="h-full w-full bg-white p-8 md:p-12">
            <div className="max-w-[21cm] mx-auto text-sm md:text-base leading-relaxed text-gray-800 font-serif">
                {/* Header (Simplified) */}
                <div className="mb-8 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">{context.name || 'Your Name'}</h1>
                    <p className="text-gray-500">candidate@email.com | +123 456 7890</p>
                </div>

                <div className="whitespace-pre-wrap">
                    {fullText || <span className="text-gray-400 italic">Start typing or generating content to see the preview...</span>}
                </div>

                <div className="mt-12 pt-8">
                    <p>Sincerely,</p>
                    <p className="font-bold mt-4">{context.name || 'Your Name'}</p>
                </div>
            </div>
        </ScrollArea>
    );
}
