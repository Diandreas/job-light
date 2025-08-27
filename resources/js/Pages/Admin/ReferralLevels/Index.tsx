import { Head, usePage, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Gift, DollarSign } from 'lucide-react';
import { PageProps } from '@/types';

interface ReferralLevel {
    id: number;
    name: string;
    level: number;
    commission_rate: number;
    min_referrals: number;
    max_referrals: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    referralLevels: {
        data: ReferralLevel[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ referralLevels, filters }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(route('admin.referral-levels.index'), {