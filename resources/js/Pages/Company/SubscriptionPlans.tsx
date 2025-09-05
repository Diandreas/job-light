import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/Components/ui/use-toast';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Check, X, Star, Zap, Crown, Building, Users,
    TrendingUp, BarChart3, Mail, Shield, Headphones,
    Palette, Code, CreditCard, Sparkles
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';

interface SubscriptionPlansProps {
    auth: { user: any };
    plans: {
        basic: any;
        professional: any;
        enterprise: any;
    };
    currentPlan: {
        company: any;
        current_plan: string;
        expires_at: string;
        is_active: boolean;
    } | null;
}

const PLAN_ICONS = {
    basic: Building,
    professional: TrendingUp,
    enterprise: Crown
};

const PLAN_COLORS = {
    basic: 'blue',
    professional: 'purple',
    enterprise: 'amber'
};

export default function SubscriptionPlans({ auth, plans, currentPlan }: SubscriptionPlansProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

    const { data, setData, post, processing } = useForm({
        plan: '',
        company_name: '',
        company_email: '',
        company_id: currentPlan?.company?.id || null
    });

    const handleSubscribe = (planId: string) => {
        setSelectedPlan(planId);
        setData('plan', planId);
        setShowSubscribeDialog(true);
    };

    const handleSubmitSubscription = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('company.subscribe'), {
            onSuccess: (response) => {
                toast({
                    title: "Redirection vers le paiement",
                    description: `Abonnement ${plans[selectedPlan].name} - ${plans[selectedPlan].price}€`,
                });
                setShowSubscribeDialog(false);
                // Redirection vers CinetPay sera gérée côté serveur
            },
            onError: (errors) => {
                toast({
                    title: "Erreur",
                    description: Object.values(errors)[0] as string,
                    variant: "destructive"
                });
            }
        });
    };

    const getFeatureIcon = (feature: string) => {
        const icons = {
            'job_posting_limit': Building,
            'can_access_profiles': Users,
            'featured_jobs': Star,
            'applicant_tracking': BarChart3,
            'email_notifications': Mail,
            'analytics': TrendingUp,
            'priority_support': Headphones,
            'custom_branding': Palette,
            'api_access': Code
        };
        return icons[feature] || Check;
    };

    const formatFeature = (key: string, value: any) => {
        const labels = {
            'job_posting_limit': value === -1 ? 'Offres illimitées' : `${value} offres/mois`,
            'can_access_profiles': value ? 'Accès aux profils' : 'Pas d\'accès aux profils',
            'featured_jobs': `${value} offres en vedette`,
            'applicant_tracking': 'Suivi des candidatures',
            'email_notifications': 'Notifications email',
            'analytics': 'Tableaux de bord',
            'priority_support': 'Support prioritaire',
            'custom_branding': 'Personnalisation',
            'api_access': 'Accès API'
        };
        return labels[key] || key;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head>
                <title>Plans d'Abonnement Entreprise | JobLight</title>
                <meta name="description" content="Choisissez le plan d'abonnement adapté à vos besoins de recrutement. Publiez des offres, accédez aux profils et gérez vos candidatures." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                Plans Entreprise JobLight
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400">
                                Trouvez les meilleurs talents avec nos outils de recrutement avancés
                            </p>
                        </motion.div>

                        {/* Plan actuel */}
                        {currentPlan && currentPlan.is_active && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full border border-green-200 mb-8"
                            >
                                <Check className="w-4 h-4" />
                                <span className="font-medium">
                                    Plan actuel : {plans[currentPlan.current_plan]?.name}
                                </span>
                                <span className="text-sm opacity-75">
                                    (expire le {new Date(currentPlan.expires_at).toLocaleDateString('fr-FR')})
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Grille des plans */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {Object.entries(plans).map(([planId, plan], index) => {
                            const Icon = PLAN_ICONS[planId];
                            const color = PLAN_COLORS[planId];
                            const isPopular = planId === 'professional';
                            const isCurrent = currentPlan?.current_plan === planId;
                            
                            return (
                                <motion.div
                                    key={planId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative"
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                                                <Star className="w-3 h-3 mr-1" />
                                                Populaire
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    <Card className={`h-full relative overflow-hidden ${
                                        isPopular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                                    } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}>
                                        <CardHeader className={`text-center pb-4 bg-gradient-to-r from-${color}-50 to-${color}-100 dark:from-${color}-950/50 dark:to-${color}-900/50`}>
                                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-${color}-500 to-${color}-600 flex items-center justify-center`}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <CardTitle className="text-xl text-gray-800 dark:text-gray-200">
                                                {plan.name}
                                            </CardTitle>
                                            <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                                                {plan.price}€
                                                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/mois</span>
                                            </div>
                                        </CardHeader>
                                        
                                        <CardContent className="p-6">
                                            <div className="space-y-3 mb-6">
                                                {Object.entries(plan.features).map(([feature, value]) => {
                                                    const FeatureIcon = getFeatureIcon(feature);
                                                    const isIncluded = value === true || (typeof value === 'number' && value > 0) || value === -1;
                                                    
                                                    return (
                                                        <div key={feature} className="flex items-center gap-3">
                                                            <div className={`flex-shrink-0 ${isIncluded ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {isIncluded ? (
                                                                    <Check className="w-4 h-4" />
                                                                ) : (
                                                                    <X className="w-4 h-4" />
                                                                )}
                                                            </div>
                                                            <span className={`text-sm ${isIncluded ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 line-through'}`}>
                                                                {formatFeature(feature, value)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {isCurrent ? (
                                                <Button disabled className="w-full bg-green-100 text-green-800">
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Plan actuel
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleSubscribe(planId)}
                                                    className={`w-full bg-gradient-to-r from-${color}-500 to-${color}-600 hover:from-${color}-600 hover:to-${color}-700`}
                                                >
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    Choisir ce plan
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Avantages */}
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-8">
                            Pourquoi choisir JobLight pour votre recrutement ?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Candidats Qualifiés</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Accès à des profils vérifiés avec CV optimisés
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <BarChart3 className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Analytics Avancés</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Suivez les performances de vos offres
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Zap className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Processus Simplifié</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Publication et gestion en quelques clics
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Shield className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Données Sécurisées</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Protection RGPD et confidentialité garantie
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
                            Questions Fréquentes
                        </h2>
                        <div className="space-y-4">
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        Comment fonctionne la facturation ?
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Les abonnements sont mensuels et renouvelés automatiquement. Vous pouvez annuler à tout moment.
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        Puis-je changer de plan ?
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        Que se passe-t-il si j'annule ?
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Vos offres restent actives jusqu'à la fin de la période payée. Aucune nouvelle offre ne peut être publiée après expiration.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Dialog d'abonnement */}
                <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Abonnement {selectedPlan ? plans[selectedPlan]?.name : ''}
                            </DialogTitle>
                        </DialogHeader>
                        
                        <form onSubmit={handleSubmitSubscription} className="space-y-4">
                            {!currentPlan?.company && (
                                <>
                                    <div>
                                        <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            placeholder="Ma Super Entreprise"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="company_email">Email entreprise *</Label>
                                        <Input
                                            id="company_email"
                                            type="email"
                                            value={data.company_email}
                                            onChange={(e) => setData('company_email', e.target.value)}
                                            placeholder="contact@entreprise.com"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {selectedPlan && (
                                <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                        Récapitulatif
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span>Plan {plans[selectedPlan]?.name}</span>
                                        <span className="font-bold">{plans[selectedPlan]?.price}€/mois</span>
                                    </div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                        Premier mois facturé aujourd'hui
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setShowSubscribeDialog(false)}
                                    className="flex-1"
                                >
                                    Annuler
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                                >
                                    {processing ? 'Traitement...' : 'Procéder au paiement'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthenticatedLayout>
    );
}