import React from 'react';
import { Users, DollarSign, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

const Dashboard = ({ referralCount, earnings, level }) => {
    return (
        <div className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">Your Sponsorship Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{referralCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{earnings} FCFA</div>
                    </CardContent>
                </Card>
                <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                        <Award className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{level}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
