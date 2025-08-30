import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Sparkles, Eye, Share2 } from 'lucide-react';
import EnhancedQRCode from './EnhancedQRCode';
import QuickShareButton from './QuickShareButton';
import PortfolioStatusBadge from './PortfolioStatusBadge';
import PortfolioStatsDashboard from './PortfolioStatsDashboard';

const QRCodeDemo: React.FC = () => {
    const [showQR, setShowQR] = useState(false);

    // Données de démonstration
    const demoUser = {
        name: 'Jean Dupont',
        username: 'jean.dupont',
        email: 'jean.dupont@example.com',
        full_profession: 'Développeur Full Stack',
        photo: '/mascot/mascot.png'
    };

    const demoStats = {
        views: 147,
        shares: 23,
        lastViewed: '15/01/2025',
        isPublic: true
    };

    const demoUrl = `${window.location.origin}/portfolio/jean.dupont`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">QR Code Guidy - Démonstration</h1>
                    </div>
                    <p className="text-gray-600">Nouveau design du QR code avec l'identité visuelle de Guidy</p>
                </div>

                {/* Composants de démonstration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Boutons de partage */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Boutons de Partage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Variant par défaut</h4>
                                    <QuickShareButton
                                        onClick={() => setShowQR(true)}
                                        shareCount={demoStats.shares}
                                        variant="default"
                                    />
                                </div>
                                
                                <div>
                                    <h4 className="font-medium mb-2">Variant compact</h4>
                                    <QuickShareButton
                                        onClick={() => setShowQR(true)}
                                        shareCount={demoStats.shares}
                                        variant="compact"
                                    />
                                </div>
                                
                                <div>
                                    <h4 className="font-medium mb-2">Variant flottant</h4>
                                    <QuickShareButton
                                        onClick={() => setShowQR(true)}
                                        shareCount={demoStats.shares}
                                        variant="floating"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Badges de statut */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Badges de Statut</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Compact</h4>
                                <PortfolioStatusBadge
                                    isPublic={true}
                                    views={demoStats.views}
                                    variant="compact"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Par défaut</h4>
                                <PortfolioStatusBadge
                                    isPublic={true}
                                    views={demoStats.views}
                                    variant="default"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-2">Détaillé</h4>
                                <PortfolioStatusBadge
                                    isPublic={true}
                                    views={demoStats.views}
                                    lastViewed={demoStats.lastViewed}
                                    variant="detailed"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tableau de bord des statistiques */}
                <PortfolioStatsDashboard
                    user={demoUser}
                    showRefresh={false}
                />

                {/* Bouton pour ouvrir le QR code */}
                <div className="text-center">
                    <Button
                        onClick={() => setShowQR(true)}
                        size="lg"
                        className="bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:opacity-90 px-8 py-4"
                    >
                        <Eye className="w-5 h-5 mr-2" />
                        Voir le QR Code Amélioré
                    </Button>
                </div>

                {/* QR Code Modal */}
                <EnhancedQRCode
                    url={demoUrl}
                    isOpen={showQR}
                    onClose={() => setShowQR(false)}
                    user={demoUser}
                    portfolioStats={demoStats}
                />
            </div>
        </div>
    );
};

export default QRCodeDemo;