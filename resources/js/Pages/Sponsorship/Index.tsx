import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import Dashboard from './Partials/Dashboard';
import Infos from './Partials/Infos';
import Invitation from './Partials/Invitation';
import Progress from './Partials/Progress';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import Support from './Partials/Support';
interface Props {
    auth: any;
}

// @ts-ignore
export default function Index({ auth, referralCode, referralCount, earnings, referrals, level }: Props) {

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 leading-tight">Mon CV Professionnel</h2>}
        >
        <div className="sponsorship-container p-6">
            <h1 className="text-2xl font-bold mb-6">Sponsorship Program</h1>
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="infos">Information</TabsTrigger>
                    <TabsTrigger value="invitation">Invitation</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="support">Support</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                    <Dashboard referralCount={referralCount} earnings={earnings} level={level} />
                </TabsContent>
                <TabsContent value="infos">
                    <Infos />
                </TabsContent>
                <TabsContent value="invitation">
                    <Invitation referralCode={referralCode} />
                </TabsContent>
                <TabsContent value="progress">
                    <Progress
                        // @ts-ignore
                        referralCount={referralCount} earnings={earnings} level={level} />
                </TabsContent>
                <TabsContent value="support">
                    <Support />
                </TabsContent>
            </Tabs>
        </div>
        </AuthenticatedLayout>
    );
};


