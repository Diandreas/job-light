import { Head, usePage, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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
    min_points: number;
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
            search: search || undefined,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Referral Levels</h2>}
        >
            <Head title="Referral Levels" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search referral levels..."
                                    className="border rounded px-4 py-2 mr-2"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Search
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-2 text-left">Level</th>
                                            <th className="px-4 py-2 text-left">Name</th>
                                            <th className="px-4 py-2 text-left">Min Points</th>
                                            <th className="px-4 py-2 text-left">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralLevels.data.map((level) => (
                                            <tr key={level.id} className="border-t">
                                                <td className="px-4 py-2">{level.level}</td>
                                                <td className="px-4 py-2">{level.name}</td>
                                                <td className="px-4 py-2">{level.min_points}</td>
                                                <td className="px-4 py-2">{level.commission_rate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}