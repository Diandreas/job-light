import React from 'react';
import { Users, DollarSign, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { User, Calendar, CheckCircle } from 'lucide-react';
import { ScrollArea } from '@/Components/ui/scroll-area';

const ReferralList = ({ referrals }) => {
    // Format date to be more readable
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        // @ts-ignore
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-indigo-700">
                    Vos filleuls
                </CardTitle>
            </CardHeader>
            <CardContent>
                {referrals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Vous n'avez pas encore de filleuls.</p>
                        <p className="mt-2 text-sm">
                            Invitez vos amis à utiliser votre code de parrainage !
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-64">
                        <div className="space-y-4">
                            {referrals.map((referral) => (
                                <div
                                    key={referral.id}
                                    className="flex items-start p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-full">
                                        <User className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {referral.referred.name}
                                            </h3>
                                            <span className="flex items-center text-xs text-green-600">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Inscrit
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {referral.referred.email}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <span>
                                                Inscrit le {formatDate(referral.referred_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
};


const Dashboard = ({ referralCount, earnings, level, referrals = [] }) => {
    return (
        <div className="space-y-8">
            <div className="p-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">Votre Tableau de Bord</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total des Filleuls</CardTitle>
                            <Users className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{referralCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total des Gains</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{earnings} FCFA</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white hover:shadow-xl transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Niveau Actuel</CardTitle>
                            <Award className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{level}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ReferralList referrals={referrals} />
        </div>
    );
};

export default Dashboard;
