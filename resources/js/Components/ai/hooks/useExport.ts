import { useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface UseExportOptions {
    onSuccess?: (format: string) => void;
    onError?: (error: string) => void;
}

export function useExport(options: UseExportOptions = {}) {
    const [isExporting, setIsExporting] = useState(false);
    const { t } = useTranslation();

    const exportChat = useCallback(async (contextId: string, format: 'pdf' | 'docx' | 'pptx') => {
        if (!contextId) return;

        setIsExporting(true);
        try {
            const response = await axios.post('/career-advisor/export', {
                contextId,
                format,
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `conversation-${contextId}.${format}`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            options.onSuccess?.(format);
        } catch (error: any) {
            const message = error.response?.data?.error || 'Erreur lors de l\'export';
            options.onError?.(message);
        } finally {
            setIsExporting(false);
        }
    }, [options.onSuccess, options.onError]);

    const exportPptx = useCallback(async (contextId: string, pptxData: string) => {
        if (!contextId) return;

        setIsExporting(true);
        try {
            const response = await axios.post('/career-advisor/export-pptx', {
                contextId,
                pptxData,
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `presentation-${contextId}.pptx`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            options.onSuccess?.('pptx');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Erreur lors de l\'export PPTX';
            options.onError?.(message);
        } finally {
            setIsExporting(false);
        }
    }, [options.onSuccess, options.onError]);

    return { isExporting, exportChat, exportPptx };
}
