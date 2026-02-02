// hooks/useMedian.ts
import { useEffect, useState, useCallback } from 'react';

interface MedianAPI {
    share: {
        downloadFile: (options: { url: string; open?: boolean }) => Promise<any>;
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
                // @ts-ignore
                setMedian(MedianInstance);

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

    const downloadFile = useCallback(async (url: string, options: {
        filename?: string;
        open?: boolean
    } = {}) => {
        if (!isReady || !Median) {
            throw new Error('Median n\'est pas prêt');
        }

        try {
            const result = await Median.share.downloadFile({
                url: url,
                open: options.open ?? true
            });

            console.log('✅ Téléchargement réussi:', result);
            return { success: true, result };
        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            return { success: false, error };
        }
    }, [isReady, Median]);

    const printDocument = useCallback(async (url: string) => {
        if (!isReady || !Median) {
            throw new Error('Median n\'est pas prêt');
        }

        try {
            // Ajouter des paramètres pour forcer l'ouverture en mode PDF avec bouton de sauvegarde
            const printUrl = new URL(url);
            printUrl.searchParams.set('print_mode', 'pdf');
            printUrl.searchParams.set('show_save_button', 'true');
            printUrl.searchParams.set('auto_print', 'false');

            await Median.open.external({
                url: printUrl.toString(),
                target: '_blank'
            });

            console.log('✅ Impression initiée avec options PDF');
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur impression:', error);
            return { success: false, error };
        }
    }, [isReady, Median]);

    return {
        isReady,
        isAndroidApp,
        Median,
        downloadFile,
        printDocument
    };
};
