import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { 
    QrCode, Share2, ExternalLink, Eye, Users, 
    TrendingUp, Clock, Sparkles, Settings,
    ChevronUp, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedShareControlsProps {
    user: any;
    portfolioUrl: string;
    onShowQR: () => void;
    portfolioStats?: {
        views: number;
        shares: number;
        lastViewed?: string;
        isPublic: boolean;
    };
    className?: string;
}

const EnhancedShareControls: React.FC<EnhancedShareControlsProps> = ({
    user,
    portfolioUrl,
    onShowQR,
    portfolioStats = { views: 0, shares: 0, isPublic: true },
    className
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Couleurs du thème Guidy
    const guidyColors = {
        primary: '#F59E0B',
        secondary: '#8B5CF6',
        gradient: 'from-amber-500 to-purple-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("fixed bottom-6 right-6 z-40", className)}
        >
            <div className="flex flex-col gap-3 items-end">
                {/* Statistiques expandables */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="bg-white rounded-xl shadow-lg border p-4 min-w-[200px]"
                        >
                            <div className="space-y-3">
                                {/* Titre */}
                                <div className="flex items-center gap-2 border-b pb-2">
                                    <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">Portfolio Stats</span>
                                </div>

                                {/* Statistiques */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-gray-600">Vues</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                            {portfolioStats.views}
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Share2 className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-gray-600">Partages</span>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                                            {portfolioStats.shares}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm text-gray-600">Statut</span>
                                        </div>
                                        <Badge 
                                            variant="secondary" 
                                            className={cn(
                                                portfolioStats.isPublic 
                                                    ? "bg-green-100 text-green-700" 
                                                    : "bg-orange-100 text-orange-700"
                                            )}
                                        >
                                            {portfolioStats.isPublic ? 'Public' : 'Privé'}
                                        </Badge>
                                    </div>

                                    {portfolioStats.lastViewed && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">Dernière vue</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{portfolioStats.lastViewed}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Taux d'engagement */}
                                <div className="border-t pt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-medium text-gray-700">Engagement</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-gradient-to-r from-amber-500 to-purple-500 h-2 rounded-full transition-all"
                                            style={{ 
                                                width: `${Math.min((portfolioStats.shares / Math.max(portfolioStats.views, 1)) * 100 * 10, 100)}%` 
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {((portfolioStats.shares / Math.max(portfolioStats.views, 1)) * 100).toFixed(1)}% de taux de partage
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Contrôles principaux */}
                <div className="flex flex-col gap-2">
                    {/* Bouton de statistiques */}
                    <Button
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        variant="outline"
                        className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-amber-200 hover:bg-amber-50"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                        )}
                    </Button>

                    {/* Bouton QR Code principal */}
                    <Button
                        size="sm"
                        onClick={onShowQR}
                        className={cn(
                            "shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r",
                            guidyColors.gradient,
                            "text-white hover:opacity-90 relative overflow-hidden"
                        )}
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
                        <QrCode className="w-4 h-4 mr-2" />
                        Partager
                        <Badge className="ml-2 bg-white/20 text-white border-white/30 text-xs">
                            {portfolioStats.shares}
                        </Badge>
                    </Button>

                    {/* Bouton d'ouverture rapide */}
                    <Button
                        size="sm"
                        onClick={() => window.open(portfolioUrl, '_blank')}
                        variant="outline"
                        className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-purple-200 hover:bg-purple-50"
                    >
                        <ExternalLink className="w-4 h-4 text-purple-600" />
                    </Button>
                </div>

                {/* Indicateur de statut en ligne */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"
                    title="Portfolio en ligne"
                >
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default EnhancedShareControls;