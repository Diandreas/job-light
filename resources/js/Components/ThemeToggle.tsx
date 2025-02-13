import React, { useEffect } from "react";
import "@theme-toggles/react/css/Classic.css";
import { Classic } from "@theme-toggles/react";

export function ThemeToggle() {
    const [isDark, setIsDark] = React.useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    useEffect(() => {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <div className="flex items-center justify-center">
            {/*@ts-ignore*/}
            <Classic
                duration={750}
                toggled={isDark}
                onToggle={() => setIsDark(!isDark)}
                className="h-8 w-8 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 cursor-pointer"
                style={{ fontSize: '2rem' }}
            />
        </div>
    );
}
