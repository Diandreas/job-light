import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function AdminIndex() {
    useEffect(() => {
        router.visit('/admin/dashboard');
    }, []);

    return null;
}