import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
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

// A4 dimensions in mm and pixels (at 96 DPI for screen)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591; // 96 DPI conversion
const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * MM_TO_PX); // ~794px
const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX); // ~1123px

const CVPreview = forwardRef<CVPreviewRef, CVPreviewProps>(({ cvModelId, locale, editable = false, onFieldChange, onFieldFocus }, ref) => {
    const [htmlContent, setHtmlContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [pageCount, setPageCount] = useState(1);
    const [scale, setScale] = useState(0.5);
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentMeasureRef = useRef<HTMLDivElement>(null);
    const editableElementsRef = useRef<Map<string, HTMLElement>>(new Map());

    // Calculate scale to fit pages in viewport
    const calculateScale = useCallback(() => {
        if (wrapperRef.current) {
            const wrapperWidth = wrapperRef.current.clientWidth - 60;
            if (wrapperWidth > 0) {
                const scaleX = wrapperWidth / A4_WIDTH_PX;
                const newScale = Math.min(Math.max(scaleX, 0.3), 0.85);
                setScale(newScale);
            }
        }
    }, []);

    // Calculate number of pages based on content height
    const calculatePages = useCallback(() => {
        if (contentMeasureRef.current) {
            const contentHeight = contentMeasureRef.current.scrollHeight;
            const pages = Math.max(1, Math.ceil(contentHeight / A4_HEIGHT_PX));
            setPageCount(pages);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            calculateScale();
            calculatePages();
        }, 150);
        window.addEventListener('resize', calculateScale);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateScale);
        };
    }, [calculateScale, calculatePages, htmlContent]);

    useEffect(() => {
        loadCV();
    }, [cvModelId, locale]);

    useEffect(() => {
        if (editable && containerRef.current && htmlContent) {
            setTimeout(() => makeFieldsEditable(), 100);
        }
    }, [htmlContent, editable]);

    const loadCV = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('cv.preview.html', cvModelId), {
                params: { locale, editable: editable ? '1' : undefined }
            });

            let content = response.data;
            let margin = '0mm';

            // Extract margin from @page style if present
            const marginMatch = content.match(/@page\s*{[^}]*margin\s*:\s*([^;}]*)/i);
            if (marginMatch && marginMatch[1]) {
                margin = marginMatch[1].trim();
            }

            // Inject padding wrapper to simulate print margin
            // We replace the opening body tag or wrap the content if body tag is not found/parsed out
            const styleInjection = `<style>.cv-simulated-print-padding { padding: ${margin}; box-sizing: border-box; width: 100%; min-height: 100%; }</style>`;

            if (content.includes('<body')) {
                content = content.replace(/<body([^>]*)>/i, `<body$1>${styleInjection}<div class="cv-simulated-print-padding">`);
                content = content.replace(/<\/body>/i, '</div></body>');
            } else {
                content = `${styleInjection}<div class="cv-simulated-print-padding">${content}</div>`;
            }

            setHtmlContent(content);
        } catch (error) {
            console.error('Failed to load CV:', error);
        } finally {
            setLoading(false);
        }
    };

    const makeFieldsEditable = () => {
        if (!containerRef.current) return;
        editableElementsRef.current.clear();
        const editableElements = containerRef.current.querySelectorAll('[data-editable]');
        editableElements.forEach((element) => {
            const htmlElement = element as HTMLElement;
            const field = htmlElement.dataset.field || '';
            const id = htmlElement.dataset.id || '';
            const model = htmlElement.dataset.model || '';
            const key = `${model}-${id}-${field}`;
            if (htmlElement.contentEditable !== 'true') {
                htmlElement.contentEditable = 'true';
            }
            htmlElement.classList.add('editable-field');
            editableElementsRef.current.set(key, htmlElement);
            htmlElement.addEventListener('focus', (e) => {
                const target = e.target as HTMLElement;
                onFieldFocus?.(target.dataset.field || '', target.textContent || '', target.dataset.id || '', target.dataset.model || '');
            });
            htmlElement.addEventListener('blur', (e) => {
                const target = e.target as HTMLElement;
                onFieldChange?.(target.dataset.field || '', target.textContent || '', target.dataset.id || '', target.dataset.model || '');
            });
        });
    };

    useImperativeHandle(ref, () => ({
        updateField: (field: string, value: string, id: string, model: string) => {
            const key = `${model}-${id}-${field}`;
            const element = editableElementsRef.current.get(key);
            if (element) {
                element.textContent = value;
                element.classList.add('field-updated');
                setTimeout(() => element.classList.remove('field-updated'), 500);
            }
        },
        reload: loadCV
    }));

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#6b7280' }}>
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm text-white">Chargement du CV...</p>
                </div>
            </div>
        );
    }

    // Generate page views
    const pages = [];
    for (let i = 0; i < pageCount; i++) {
        pages.push(
            <div
                key={i}
                className="cv-page"
                style={{
                    width: `${A4_WIDTH_PX}px`,
                    height: `${A4_HEIGHT_PX}px`,
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                }}
            >
                {/* Page content - clips to show only this page's portion */}
                <div
                    ref={i === 0 ? containerRef : undefined}
                    style={{
                        position: 'absolute',
                        top: `-${i * A4_HEIGHT_PX}px`,
                        left: 0,
                        width: `${A4_WIDTH_PX}px`,
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
                {/* Page number indicator */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '12px',
                        fontSize: '10px',
                        color: '#9ca3af',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    Page {i + 1} / {pageCount}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={wrapperRef}
            className="cv-preview-wrapper"
            style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                background: '#6b7280',
                padding: '24px 16px',
                boxSizing: 'border-box',
            }}
        >
            {/* Hidden measure container */}
            <div
                ref={contentMeasureRef}
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    width: `${A4_WIDTH_PX}px`,
                    left: '-9999px',
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Visible pages with scaling */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    width: `${A4_WIDTH_PX}px`,
                    margin: '0 auto',
                }}
            >
                {pages}
            </div>
        </div>
    );
});

CVPreview.displayName = 'CVPreview';

export default CVPreview;

