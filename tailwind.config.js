import forms from "@tailwindcss/forms";
import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.tsx",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                // Personnalisé pour les dégradés amber/purple
                // Luxury Theme Mappings (Single Source of Truth)
                luxury: {
                    gold: {
                        50: "var(--luxury-gold-50)",
                        100: "var(--luxury-gold-100)",
                        200: "var(--luxury-gold-200)",
                        300: "var(--luxury-gold-300)",
                        400: "var(--luxury-gold-400)",
                        500: "var(--luxury-gold-500)",
                        600: "var(--luxury-gold-600)",
                        700: "var(--luxury-gold-700)",
                        800: "var(--luxury-gold-800)",
                        900: "var(--luxury-gold-900)",
                    },
                    neutral: {
                        50: "var(--luxury-neutral-50)",
                        100: "var(--luxury-neutral-100)",
                        200: "var(--luxury-neutral-200)",
                        300: "var(--luxury-neutral-300)",
                        400: "var(--luxury-neutral-400)",
                        500: "var(--luxury-neutral-500)",
                        600: "var(--luxury-neutral-600)",
                        700: "var(--luxury-neutral-700)",
                        800: "var(--luxury-neutral-800)",
                        900: "var(--luxury-neutral-900)",
                        950: "var(--luxury-neutral-950)",
                    }
                },
                // Legacy support (to be refactored)
                amber: {
                    50: "var(--luxury-gold-50)",
                    100: "var(--luxury-gold-100)",
                    200: "var(--luxury-gold-200)",
                    300: "var(--luxury-gold-300)",
                    400: "var(--luxury-gold-400)",
                    500: "var(--luxury-gold-500)",
                    600: "var(--luxury-gold-600)",
                    700: "var(--luxury-gold-700)",
                    800: "var(--luxury-gold-800)",
                    900: "var(--luxury-gold-900)",
                },
                purple: {
                    // Mapping purple to gold/neutral for instant luxury switch
                    50: "var(--luxury-neutral-50)",
                    100: "var(--luxury-neutral-100)",
                    200: "var(--luxury-neutral-200)",
                    300: "var(--luxury-neutral-300)",
                    400: "var(--luxury-gold-400)",
                    500: "var(--luxury-gold-500)",
                    600: "var(--luxury-gold-600)",
                    700: "var(--luxury-gold-700)",
                    800: "var(--luxury-gold-800)",
                    900: "var(--luxury-gold-900)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ["Inter", ...defaultTheme.fontFamily.sans],
                serif: ["Playfair Display", ...defaultTheme.fontFamily.serif],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
                shimmer: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                "gentle-pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.8 },
                },
                "gentle-shimmer": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                shimmer: "shimmer 2s infinite",
                "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
                "gentle-shimmer": "gentle-shimmer 4s ease-in-out infinite",
            },
        },
    },
    plugins: [forms, require("tailwindcss-animate")],
};
