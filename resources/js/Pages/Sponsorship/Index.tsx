import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent } from '@/Components/ui/card';
import Dashboard from './Partials/Dashboard';
import Infos from './Partials/Infos';
import Invitation from './Partials/Invitation';
import Progress from './Partials/Progress';
import { Users, Link, Award, HelpCircle, Info } from 'lucide-react';
import ProgressComponent from "./Partials/Progress";
import Support from "@/Pages/Sponsorship/Partials/Support";

export default function Index({ auth, referralCode, referralCount, earnings, referrals, level }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Programme de Parrainage" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-center mb-8 text-indigo-800">
                        Programme de Parrainage
                    </h1>

                    <Card className="bg-white shadow overflow-hidden">
                        <CardContent className="p-0">
                            <Tabs
                                defaultValue="dashboard"
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <TabsList className="grid grid-cols-5 w-full rounded-none">
                                    <TabsTrigger
                                        value="dashboard"
                                        className="flex items-center justify-center gap-2 py-4"
                                    >
                                        <Users className="h-5 w-5" />
                                        <span className="hidden sm:inline">Tableau de bord</span>
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="invitation"
                                        className="flex items-center justify-center gap-2 py-4"
                                    >
                                        <Link className="h-5 w-5" />
                                        <span className="hidden sm:inline">Inviter</span>
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="progress"
                                        className="flex items-center justify-center gap-2 py-4"
                                    >
                                        <Award className="h-5 w-5" />
                                        <span className="hidden sm:inline">Progression</span>
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="support"
                                        className="flex items-center justify-center gap-2 py-4"
                                    >
                                        <HelpCircle className="h-5 w-5" />
                                        <span className="hidden sm:inline">Support</span>
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="info"
                                        className="flex items-center justify-center gap-2 py-4"
                                    >
                                        <Info className="h-5 w-5" />
                                        <span className="hidden sm:inline">Informations</span>
                                    </TabsTrigger>
                                </TabsList>

                                <div className="p-6">
                                    <TabsContent value="dashboard" className="mt-0">
                                        <Dashboard
                                            referralCount={referralCount}
                                            earnings={earnings}
                                            level={level}
                                            referrals={referrals}
                                        />
                                    </TabsContent>

                                    <TabsContent value="invitation" className="mt-0">
                                        <Invitation referralCode={referralCode} />
                                    </TabsContent>

                                    <TabsContent value="progress" className="mt-0">
                                        <ProgressComponent
                                            referralCount={referralCount}
                                            earnings={earnings}
                                        />
                                    </TabsContent>

                                    <TabsContent value="support" className="mt-0">
                                        <Support />
                                    </TabsContent>

                                    <TabsContent value="info" className="mt-0">
                                        <Infos />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
