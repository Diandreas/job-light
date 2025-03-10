import React, { useState } from 'react';
import axios from 'axios';
import { Share2, Copy, Check, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

const Invitation = ({ referralCode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('code');

    const baseUrl = window.location.origin;
    const invitationLink = `${baseUrl}/register?ref=${referralCode}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareViaEmail = () => {
        const subject = 'Rejoignez-moi sur notre plateforme de CV';
        const body = `Bonjour,\n\nJe vous invite à utiliser notre plateforme de création de CV. Inscrivez-vous en utilisant mon lien de parrainage et obtenez des avantages :\n\n${invitationLink}\n\nÀ bientôt !`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const shareViaWhatsApp = () => {
        const text = `Rejoignez-moi sur cette super plateforme de création de CV en utilisant mon lien de parrainage : ${invitationLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="space-y-8">
            <Card className="w-full mx-auto bg-white shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-indigo-700">
                        Invitez vos Amis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="code"
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-6"
                    >
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="code">Code d'invitation</TabsTrigger>
                            <TabsTrigger value="link">Lien d'invitation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="code" className="space-y-6">
                            <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                                <p className="text-sm text-indigo-700 font-medium mb-2">
                                    Votre code de parrainage:
                                </p>
                                <div className="flex">
                                    <Input
                                        value={referralCode}
                                        readOnly
                                        className="flex-grow text-lg font-bold text-indigo-900 bg-white"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(referralCode)}
                                        className="ml-2 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-gray-700 font-medium">Comment ça marche?</p>
                                <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                                    <li>Partagez votre code de parrainage avec vos amis</li>
                                    <li>Ils l'utilisent lors de leur inscription</li>
                                    <li>Vous gagnez une commission pour chaque parrainage</li>
                                    <li>Augmentez votre niveau et vos avantages</li>
                                </ol>
                            </div>
                        </TabsContent>

                        <TabsContent value="link" className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-sm text-gray-700 font-medium">
                                    Partagez ce lien avec vos amis:
                                </p>
                                <div className="flex">
                                    <Input
                                        value={invitationLink}
                                        readOnly
                                        className="flex-grow bg-white"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(invitationLink)}
                                        className="ml-2 bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-3">
                                    Partager sur:
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={shareViaEmail}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        Email
                                    </Button>
                                    <Button
                                        onClick={shareViaWhatsApp}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
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

            <Card className="bg-indigo-50 border border-indigo-100">
                <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                        <div className="bg-indigo-100 p-3 rounded-full">
                            <Link2 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-indigo-900 mb-2">Avantages pour vos amis</h3>
                            <ul className="text-sm text-indigo-700 space-y-1">
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
