// hooks/useMedian.ts
import { useEffect, useState, useCallback } from 'react';

interface MedianAPI {
    share: {
        downloadFile: (options: { url: string; open?: boolean }) => Promise<any>;
        sharePage: (options?: { url?: string; text?: string }) => Promise<any>;
    };
    open: {
        external: (options: { url: string; target?: string }) => Promise<any>;
    };
    onReady: (callback: () => void) => void;
}

export const useMedian = () => {
    const [isReady, setIsReady] = useState(false);
    const [isAndroidApp, setIsAndroidApp] = useState(false);
    const [Median, setMedian] = useState<MedianAPI | null>(null);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMedianApp = userAgent.includes('median') || userAgent.includes('gonative');
        setIsAndroidApp(isMedianApp);

        if (isMedianApp) {
            // Import dynamique du package NPM
            import('median-js-bridge').then((MedianModule) => {
                const MedianInstance = MedianModule.default;
                setMedian(MedianInstance as MedianAPI);

                MedianInstance.onReady(() => {
                    console.log('✅ Median JavaScript Bridge est prêt');
                    setIsReady(true);
                });
            }).catch((error) => {
                console.error('❌ Erreur lors du chargement de Median:', error);
                // Fallback vers window.median si le package NPM échoue
                // @ts-ignore
                if (window.median) {
                    // @ts-ignore
                    setMedian(window.median);
                    setIsReady(true);
                }
            });
        }
    }, []);

    /**
     * Télécharge un fichier avec support natif Android optimisé
     */
    const downloadFile = useCallback(async (url: string, options: {
        filename?: string;
        open?: boolean;
        forceDownload?: boolean;
    } = {}) => {
        if (!isReady || !Median) {
            throw new Error('Median n\'est pas prêt');
        }

        try {
            console.log('🚀 Téléchargement natif avec Median:', url);

            // Assurer que l'URL est absolue
            const absoluteUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).toString();

            // Pour les fichiers PDF, ajouter les headers appropriés
            let downloadUrl = absoluteUrl;
            if (options.forceDownload && !downloadUrl.includes('Content-Disposition')) {
                downloadUrl += (downloadUrl.includes('?') ? '&' : '?') + 'download=1';
            }

            const result = await Median.share.downloadFile({
                url: downloadUrl,
                open: options.open ?? true
            });

            console.log('✅ Téléchargement natif réussi:', result);
            return { success: true, result };
        } catch (error) {
            console.error('❌ Erreur téléchargement natif:', error);
            return { success: false, error };
        }
    }, [isReady, Median]);

    /**
     * Impression avec support PDF natif amélioré
     */
    const printDocument = useCallback(async (url: string, options: {
        useShare?: boolean;
        openInBrowser?: boolean;
    } = {}) => {
        if (!isReady || !Median) {
            throw new Error('Median n\'est pas prêt');
        }

        try {
            console.log('🖨️ Impression/partage natif avec Median:', url);

            const absoluteUrl = url.startsWith('http') ? url : new URL(url, window.location.origin).toString();

            if (options.useShare) {
                // Utiliser le partage natif qui peut inclure l'impression
                await Median.share.sharePage({
                    url: absoluteUrl,
                    text: "Document à imprimer"
                });
                console.log('✅ Partage natif initié');
            } else {
                // Ouvrir dans le navigateur externe pour impression
                await Median.open.external({
                    url: absoluteUrl,
                    target: '_blank'
                });
                console.log('✅ Ouverture externe initiée');
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Erreur impression native:', error);
            return { success: false, error };
        }
    }, [isReady, Median]);

    /**
     * Créer une URL de téléchargement direct compatible avec Median
     */
    const createDirectDownloadUrl = useCallback((endpoint: string, params: Record<string, any> = {}) => {
        const url = new URL(endpoint, window.location.origin);

        // Ajouter les paramètres comme query string pour GET
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });

        // Forcer le téléchargement
        url.searchParams.set('direct', 'true');
        url.searchParams.set('Content-Disposition', 'attachment');

        return url.toString();
    }, []);

    /**
     * Vérifier si une URL est compatible avec Median
     */
    const isUrlCompatible = useCallback((url: string): boolean => {
        try {
            const urlObj = new URL(url, window.location.origin);

            // Median ne supporte pas localhost
            if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
                return false;
            }

            // Doit être une URL publique
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }, []);

    return {
        isReady,
        isAndroidApp,
        Median,
        downloadFile,
        printDocument,
        createDirectDownloadUrl,
        isUrlCompatible
    };
};
