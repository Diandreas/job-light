import React, { useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
    const [theme, setTheme] = React.useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as Theme) || 'system';
        }
        return 'system';
    });

    const [isDark, setIsDark] = React.useState(() => {
        if (typeof window !== 'undefined') {
            if (theme === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            return theme === 'dark';
        }
        return false;
    });

    useEffect(() => {
        const html = document.documentElement;
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (theme === 'system') {
            setIsDark(systemDark);
            systemDark ? html.classList.add('dark') : html.classList.remove('dark');
        } else {
            setIsDark(theme === 'dark');
            theme === 'dark' ? html.classList.add('dark') : html.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                setIsDark(e.matches);
                e.matches ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-10 h-10 rounded-full hover:bg-amber-50 dark:hover:bg-amber-500/10"
                >
                    {isDark ? (
                        <Moon className="h-5 w-5 text-amber-400" />
                    ) : (
                        <Sun className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="sr-only">Changer le thème</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="h-4 w-4 mr-2" />
                    <span>Clair</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="h-4 w-4 mr-2" />
                    <span>Sombre</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="h-4 w-4 mr-2" />
                    <span>Système</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

