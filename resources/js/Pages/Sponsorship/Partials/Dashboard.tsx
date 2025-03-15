import React from 'react';
import { Users, DollarSign, Award, User, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { useTranslation } from 'react-i18next';

const ReferralList = ({ referrals }) => {
    const { t } = useTranslation();

    // Format date to be more readable
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        // @ts-ignore
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Card className="w-full border dark:border-gray-700">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('sponsorship.dashboard.yourReferrals')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {referrals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <User className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p>{t('sponsorship.dashboard.noReferrals')}</p>
                        <p className="mt-2 text-sm">
                            {t('sponsorship.dashboard.inviteFriends')}
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-64">
                        <div className="space-y-3">
                            {referrals.map((referral) => (
                                <div
                                    key={referral.id}
                                    className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                                        <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {referral.referred.name}
                                            </h3>
                                            <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                {t('sponsorship.dashboard.registered')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {referral.referred.email}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            <span>
                                                {t('sponsorship.dashboard.registeredOn')} {formatDate(referral.referred_at)}
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
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('sponsorship.dashboard.totalReferrals')}</CardTitle>
                        <Users className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{referralCount}</div>
                    </CardContent>
                </Card>
                <Card className="border dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('sponsorship.dashboard.totalEarnings')}</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{earnings} FCFA</div>
                    </CardContent>
                </Card>
                <Card className="border dark:border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('sponsorship.dashboard.currentLevel')}</CardTitle>
                        <Award className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{level}</div>
                    </CardContent>
                </Card>
            </div>

            <ReferralList referrals={referrals} />
        </div>
    );
};

export default Dashboard;
