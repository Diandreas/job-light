import React, { useState } from 'react';
import axios from 'axios';
import { Share2, Copy, Check, Link2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { useTranslation } from 'react-i18next';

const Invitation = ({ referralCode, expirationInfo }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('code');
    const [localExpirationInfo, setLocalExpirationInfo] = useState(expirationInfo);

    const baseUrl = window.location.origin;
    const invitationLink = `${baseUrl}/register?ref=${referralCode}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareViaEmail = () => {
        const subject = t('sponsorship.invitation.emailSubject');
        const body = t('sponsorship.invitation.emailBody', { invitationLink });
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const shareViaWhatsApp = () => {
        const text = t('sponsorship.invitation.whatsappText', { invitationLink });
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    const renewReferralCode = async () => {
        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const response = await axios.post('/sponsorship/renew-code');

            if (response.data.success) {
                setSuccessMsg(response.data.message);
                setLocalExpirationInfo({
                    ...localExpirationInfo,
                    expires_at: response.data.expires_at,
                    is_expired: false,
                    days_left: 30, // Approximation pour l'affichage immédiat
                    is_active: true
                });
            } else {
                setError(response.data.message || 'Une erreur est survenue.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors du renouvellement du code.');
        } finally {
            setIsLoading(false);
        }
    };

    // Calcul du pourcentage de temps restant pour la barre de progression
    const getExpirationProgress = () => {
        if (!localExpirationInfo) return 100;

        // Si le code est expiré, retourne 0%
        if (localExpirationInfo.is_expired) return 0;

        // Sinon, calcule le pourcentage de jours restants (sur 30 jours)
        const daysLeft = Math.max(0, localExpirationInfo.days_left);
        return Math.min(100, (daysLeft / 30) * 100);
    };

    // Fonction pour l'affichage du statut d'expiration
    const getExpirationStatus = () => {
        if (!localExpirationInfo) return null;

        if (localExpirationInfo.is_expired) {
            return (
                <Badge variant="destructive" className="ml-2">
                    Expiré
                </Badge>
            );
        }

        if (localExpirationInfo.days_left <= 7) {
            return (
                <Badge variant="outline" className="ml-2 bg-amber-500 hover:bg-amber-600 text-white">
                    Expire bientôt
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="ml-2 bg-green-600 hover:bg-green-700 text-white">
                Actif
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        Votre Code de Parrainage {getExpirationStatus()}
                    </CardTitle>

                    {localExpirationInfo && (
                        <div className="mt-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <span>Validité du code</span>
                                <span>
                                    {localExpirationInfo.is_expired
                                        ? 'Expiré'
                                        : `Expire le ${localExpirationInfo.expires_at}`}
                                </span>
                            </div>
                            <Progress value={getExpirationProgress()} className="h-2" />

                            <div className="mt-3 flex justify-end">
                                <Button
                                    onClick={renewReferralCode}
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                    className="text-xs"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                            Chargement...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            Renouveler mon code
                                        </span>
                                    )}
                                </Button>
                            </div>

                            {successMsg && (
                                <Alert className="mt-2 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-300">
                                    <AlertDescription>{successMsg}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="code"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-4"
                    >
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="code">Code</TabsTrigger>
                            <TabsTrigger value="link">Lien d'invitation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="code" className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                                    Votre code de parrainage:
                                </p>
                                <div className="flex">
                                    <Input
                                        value={referralCode}
                                        readOnly
                                        className="flex-grow text-lg font-bold bg-white dark:bg-gray-800"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(referralCode)}
                                        className="ml-2"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-gray-700 dark:text-gray-300 font-medium">Comment ça marche?</p>
                                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                                    <li>Partagez votre code de parrainage avec vos amis</li>
                                    <li>Ils l'utilisent lors de leur inscription</li>
                                    <li>Vous gagnez une commission pour chaque parrainage</li>
                                    <li>Augmentez votre niveau et vos avantages</li>
                                </ol>
                            </div>
                        </TabsContent>

                        <TabsContent value="link" className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                    Partagez ce lien avec vos amis:
                                </p>
                                <div className="flex">
                                    <Input
                                        value={invitationLink}
                                        readOnly
                                        className="flex-grow bg-white dark:bg-gray-800"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(invitationLink)}
                                        className="ml-2"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Partager sur:
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={shareViaEmail}
                                        className="flex-1"
                                        variant="secondary"
                                    >
                                        Email
                                    </Button>
                                    <Button
                                        onClick={shareViaWhatsApp}
                                        className="flex-1"
                                    >
                                        WhatsApp
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
                            <Link2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Avantages pour vos amis</h3>
                            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <li>• Accès à des modèles de CV exclusifs</li>
                                <li>• Bonus de bienvenue sur les jetons</li>
                                <li>• Démarrage rapide avec des conseils personnalisés</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Invitation;
