import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { translations } = usePage().props;

    return (key) => {
        return translations[key] || key;
    };
}
