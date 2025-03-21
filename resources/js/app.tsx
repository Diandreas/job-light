import './bootstrap';
import '../css/app.css';
import './Config/i18n';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { ThemeProvider } from "next-themes";
import { Suspense } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'GUIDY';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx');
        const page = await resolvePageComponent(`./Pages/${name}.tsx`, pages);
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div></div>}>
                <ThemeProvider defaultTheme="system" storageKey="guidy-theme">
                    <App {...props} />
                </ThemeProvider>
            </Suspense>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
