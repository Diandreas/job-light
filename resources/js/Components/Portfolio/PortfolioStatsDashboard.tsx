import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { 
    Eye, Share2, TrendingUp, Users, Calendar,
    Linkedin, Twitter, Facebook, MessageCircle,
    Mail, QrCode, Copy, ExternalLink, RefreshCw,
    Sparkles, BarChart3, PieChart, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePortfolioStats } from '@/hooks/usePortfolioStats';

interface PortfolioStatsDashboardProps {
    user: any;
    className?: string;
    showRefresh?: boolean;
}

const PortfolioStatsDashboard: React.FC<PortfolioStatsDashboardProps> = ({
    user,
    className,
    showRefresh = true
}) => {
    const { stats, loading, refreshStats } = usePortfolioStats();
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshStats();
        setRefreshing(false);
    };

    const platformIcons = {
        linkedin: { icon: Linkedin, color: 'text-blue-600', bg: 'bg-blue-100' },
        twitter: { icon: Twitter, color: 'text-gray-900', bg: 'bg-gray-100' },
        facebook: { icon: Facebook, color: 'text-blue-700', bg: 'bg-blue-100' },
        whatsapp: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-100' },
        email: { icon: Mail, color: 'text-gray-600', bg: 'bg-gray-100' },
        qr_code: { icon: QrCode, color: 'text-purple-600', bg: 'bg-purple-100' },
        copy: { icon: Copy, color: 'text-amber-600', bg: 'bg-amber-100' }
    };

    if (loading) {
        return (
            <Card className={cn("animate-pulse", className)}>
                <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header avec actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Statistiques Portfolio</h3>
                        <p className="text-sm text-gray-500">Analyse de performance de votre portfolio</p>
                    </div>
                </div>
                {showRefresh && (
                    <Button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                        Actualiser
                    </Button>
                )}
            </div>

            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Vues totales</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.views}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Partages</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.shares}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Share2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Visiteurs uniques</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.unique_views}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Engagement</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.engagement_rate}%</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Partages par plateforme */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-gray-600" />
                        Partages par plateforme
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.shares_by_platform || {}).map(([platform, count]) => {
                            const platformConfig = platformIcons[platform as keyof typeof platformIcons];
                            if (!platformConfig) return null;

                            const Icon = platformConfig.icon;
                            return (
                                <motion.div
                                    key={platform}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50"
                                >
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", platformConfig.bg)}>
                                        <Icon className={cn("w-5 h-5", platformConfig.color)} />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 capitalize">{platform}</div>
                                        <div className="text-2xl font-bold text-gray-700">{count}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Statut du portfolio */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-600" />
                            Statut du Portfolio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="font-medium text-green-800">Portfolio actif</div>
                                    <div className="text-sm text-green-600">
                                        {stats.is_public ? 'Visible publiquement' : 'Accès restreint'}
                                    </div>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                                En ligne
                            </Badge>
                        </div>

                        {stats.last_viewed && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <div>
                                    <div className="font-medium text-blue-800">Dernière activité</div>
                                    <div className="text-sm text-blue-600">{stats.last_viewed_human || stats.last_viewed}</div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                                <div>
                                    <div className="font-medium text-amber-800">Créé avec Guidy</div>
                                    <div className="text-sm text-amber-600">Depuis le {stats.created_at}</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions rapides */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ExternalLink className="w-5 h-5 text-gray-600" />
                            Actions Rapides
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button
                            onClick={() => window.open(stats.portfolio_url, '_blank')}
                            className="w-full bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:opacity-90"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Voir le Portfolio
                        </Button>

                        <Button
                            onClick={() => navigator.clipboard.writeText(stats.portfolio_url)}
                            variant="outline"
                            className="w-full border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copier le lien
                        </Button>

                        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded border break-all">
                            {stats.portfolio_url}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PortfolioStatsDashboard;