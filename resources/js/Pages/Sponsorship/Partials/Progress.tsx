import React from 'react';
import { Award, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';

const getBadgeInfo = (referralCount) => {
    if (referralCount >= 20) {
        return {
            level: 'DIAMANT',
            color: 'text-blue-500',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-300',
            description: 'Expert en parrainage',
            nextMilestone: null,
            commission: 20
        };
    } else if (referralCount >= 10) {
        return {
            level: 'OR',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-100',
            borderColor: 'border-yellow-300',
            description: 'Parrain expérimenté',
            nextMilestone: 20,
            commission: 15
        };
    } else {
        return {
            level: 'ARGENT',
            color: 'text-gray-500',
            bgColor: 'bg-gray-100',
            borderColor: 'border-gray-300',
            description: 'Parrain débutant',
            nextMilestone: 10,
            commission: 10
        };
    }
};

const BadgeCard = ({ badge, referralCount, earnings }) => {
    const nextLevelProgress = badge.nextMilestone
        ? ((referralCount % 10) / (badge.nextMilestone - Math.floor(referralCount / 10) * 10)) * 100
        : 100;

    return (
        <div className={`p-4 rounded-lg border-2 ${badge.borderColor} ${badge.bgColor}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Award className={`h-8 w-8 ${badge.color}`} />
                    <div className="ml-3">
                        <h3 className={`font-bold text-lg ${badge.color}`}>Niveau {badge.level}</h3>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4">
                <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                        <p className="text-sm text-gray-600">Filleuls</p>
                        <p className="font-semibold text-lg">{referralCount}</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                        <p className="text-sm text-gray-600">Gains</p>
                        <p className="font-semibold text-lg">{earnings.toLocaleString()} FCFA</p>
                    </div>
                </div>
            </div>

            {badge.nextMilestone && (
                <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Progression vers niveau {badge.nextMilestone} filleuls</span>
                        <span>{Math.floor(nextLevelProgress)}%</span>
                    </div>
                    <Progress value={nextLevelProgress} className="h-2" />
                </div>
            )}
        </div>
    );
};

const ProgressComponent = ({ referralCount, earnings }) => {
    const badge = getBadgeInfo(referralCount);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-indigo-700">
                    Votre Progression
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <BadgeCard
                    badge={badge}
                    referralCount={referralCount}
                    earnings={earnings}
                />

                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">Avantages du niveau actuel :</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                        <li>{badge.commission}% de commission sur les parrainages</li>
                        {badge.level === 'DIAMANT' && (
                            <>
                                <li>Bonus mensuel exclusif</li>
                                <li>Support prioritaire</li>
                                <li>Accès aux événements VIP</li>
                            </>
                        )}
                        {badge.level === 'OR' && (
                            <>
                                <li>Bonus trimestriel</li>
                                <li>Badge spécial sur le profil</li>
                            </>
                        )}
                    </ul>
                </div>

                {badge.nextMilestone && (
                    <div className="p-4 bg-indigo-50 rounded-lg">
                        <h4 className="font-semibold text-indigo-700 mb-2">Prochain palier</h4>
                        <p className="text-sm text-indigo-600">
                            Plus que {badge.nextMilestone - referralCount} filleuls pour atteindre le niveau supérieur !
                        </p>
                        <p className="text-sm text-indigo-600 mt-1">
                            Augmentez votre commission à {badge.commission + 5}% et débloquez de nouveaux avantages.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProgressComponent;
