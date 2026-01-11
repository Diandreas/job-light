import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';

interface CVPreviewProps {
    cvModelId: number;
    locale: string;
    editable?: boolean;
    onFieldChange?: (field: string, value: string, id: string, model: string) => void;
    onFieldFocus?: (field: string, value: string, id: string, model: string) => void;
}

export interface CVPreviewRef {
    updateField: (field: string, value: string, id: string, model: string) => void;
    reload: () => void;
}

const CVPreview = forwardRef<CVPreviewRef, CVPreviewProps>(({ cvModelId, locale, editable = false, onFieldChange, onFieldFocus }, ref) => {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const editableElementsRef = useRef<Map<string, HTMLElement>>(new Map());

    useEffect(() => {
        loadCV();
    }, [cvModelId, locale]);

    useEffect(() => {
        if (editable && containerRef.current && htmlContent) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                makeFieldsEditable();
            }, 100);
        }
    }, [htmlContent, editable]);

    const loadCV = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('cv.preview.html', cvModelId), {
                params: { locale, editable: editable ? '1' : undefined }
            });
            setHtmlContent(response.data);
        } catch (error) {
            console.error('Failed to load CV:', error);
        } finally {
            setLoading(false);
        }
    };

    const makeFieldsEditable = () => {
        if (!containerRef.current) return;

        // Clear previous references
        editableElementsRef.current.clear();

        // Rendre les éléments avec data-editable éditables
        const editableElements = containerRef.current.querySelectorAll('[data-editable]');

        editableElements.forEach((element) => {
            const htmlElement = element as HTMLElement;
            const field = htmlElement.dataset.field || '';
            const id = htmlElement.dataset.id || '';
            const model = htmlElement.dataset.model || '';

            // Store reference for later updates
            const key = `${model}-${id}-${field}`;

            // Ensure contentEditable is set
            if (htmlElement.contentEditable !== 'true') {
                htmlElement.contentEditable = 'true';
            }

            htmlElement.classList.add('editable-field');

            // Store reference
            editableElementsRef.current.set(key, htmlElement);

            // Focus handler
            htmlElement.addEventListener('focus', (e) => {
                const target = e.target as HTMLElement;
                const value = target.textContent || '';
                const field = target.dataset.field || '';
                const id = target.dataset.id || '';
                const model = target.dataset.model || '';
                onFieldFocus?.(field, value, id, model);
            });

            // Blur handler - save changes
            htmlElement.addEventListener('blur', (e) => {
                const target = e.target as HTMLElement;
                const value = target.textContent || '';
                const field = target.dataset.field || '';
                const id = target.dataset.id || '';
                const model = target.dataset.model || '';
                onFieldChange?.(field, value, id, model);
            });
        });
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        updateField: (field: string, value: string, id: string, model: string) => {
            const key = `${model}-${id}-${field}`;
            const element = editableElementsRef.current.get(key);

            if (element) {
                element.textContent = value;
                // Add a visual feedback
                element.classList.add('field-updated');
                setTimeout(() => {
                    element.classList.remove('field-updated');
                }, 500);
            }
        },
        reload: () => {
            loadCV();
        }
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Chargement du CV...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="cv-preview-container w-full h-full overflow-auto"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
});

CVPreview.displayName = 'CVPreview';

export default CVPreview;
