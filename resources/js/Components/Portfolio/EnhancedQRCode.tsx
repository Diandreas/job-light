import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { 
    QrCode, Share2, Download, ExternalLink, Copy, 
    Linkedin, Twitter, Facebook, MessageCircle, 
    Mail, CheckCircle, AlertCircle, Clock,
    Sparkles, Users, Eye, TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { usePortfolioStats } from '@/hooks/usePortfolioStats';

interface EnhancedQRCodeProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
    user: any;
    portfolioStats?: {
        views: number;
        shares: number;
        lastViewed?: string;
        isPublic: boolean;
    };
}

const EnhancedQRCode: React.FC<EnhancedQRCodeProps> = ({ 
    url, 
    isOpen, 
    onClose, 
    user,
    portfolioStats: initialStats = { views: 0, shares: 0, isPublic: true }
}) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);
    const { stats, recordShare } = usePortfolioStats(initialStats);
    
    // Utiliser les stats du hook ou les stats initiales
    const portfolioStats = stats || initialStats;

    // Couleurs du thème Guidy
    const guidyColors = {
        primary: '#F59E0B', // Orange/Amber principal de Guidy
        secondary: '#8B5CF6', // Purple secondaire
        gradient: 'from-amber-500 to-purple-500'
    };

    // QR Code personnalisé avec le logo Guidy
    const generateEnhancedQRCode = () => {
        const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
        const params = new URLSearchParams({
            size: '300x300',
            data: url,
            format: 'png',
            color: guidyColors.primary.replace('#', ''),
            bgcolor: 'ffffff',
            margin: '10',
            qzone: '2',
            ecc: 'M' // Error correction level
        });
        
        return `${baseUrl}?${params.toString()}`;
    };

    const shareUrls = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        twitter: `https://x.com/intent/tweet?text=${encodeURIComponent(`Découvrez mon portfolio professionnel créé avec Guidy 🚀 ${url}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`Salut ! Découvre mon portfolio professionnel : ${url} 📄✨`)}`,
        email: `mailto:?subject=${encodeURIComponent('Mon Portfolio Professionnel')}&body=${encodeURIComponent(`Bonjour,\n\nJe vous invite à découvrir mon portfolio professionnel créé avec Guidy :\n${url}\n\nCordialement,\n${user.name || 'Un utilisateur Guidy'}`)}`
    };

    const shareOnPlatform = async (platform: keyof typeof shareUrls) => {
        // Enregistrer le partage via le hook
        await recordShare(platform, { url });

        // Ouvrir la plateforme de partage
        if (platform === 'email') {
            window.location.href = shareUrls[platform];
        } else {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);

            // Enregistrer la copie comme un partage
            await recordShare('copy', { url });
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
        }
    };

    const downloadQRCode = async () => {
        try {
            // Enregistrer le téléchargement comme un partage
            await recordShare('qr_code', { url, action: 'download' });

            const response = await fetch(generateEnhancedQRCode());
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `portfolio-qr-${user.username || user.email || 'guidy'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Erreur lors du téléchargement:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header avec gradient Guidy */}
                    <div className={cn("bg-gradient-to-r", guidyColors.gradient, "p-6 text-white")}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{t('portfolio.share.title')}</h3>
                                    <p className="text-amber-100 text-sm">{t('portfolio.share.subtitle')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Statistiques du portfolio */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-2 mx-auto">
                                    <Eye className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{portfolioStats.views}</div>
                                <div className="text-xs text-gray-500">{t('portfolio.share.stats.views')}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-2 mx-auto">
                                    <Share2 className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{portfolioStats.shares}</div>
                                <div className="text-xs text-gray-500">{t('portfolio.share.stats.shares')}</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl mb-2 mx-auto">
                                    <TrendingUp className="w-6 h-6 text-amber-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {portfolioStats.isPublic ? t('portfolio.share.stats.public') : t('portfolio.share.stats.private')}
                                </div>
                                <div className="text-xs text-gray-500">{t('portfolio.share.stats.status')}</div>
                            </div>
                        </div>

                        {/* Statut du portfolio */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <div className="font-medium text-green-800">{t('portfolio.share.status.online')}</div>
                                    <div className="text-sm text-green-600">
                                        {portfolioStats.lastViewed ? 
                                            `${t('portfolio.share.stats.lastViewed')}: ${portfolioStats.lastViewed}` : 
                                            t('portfolio.share.status.ready')
                                        }
                                    </div>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                                {t('portfolio.share.stats.active')}
                            </Badge>
                        </div>

                        {/* QR Code amélioré */}
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-purple-500 rounded-2xl blur-lg opacity-20"></div>
                                <div className="relative bg-white p-4 rounded-2xl shadow-lg border-4 border-white">
                                    <img
                                        src={generateEnhancedQRCode()}
                                        alt="QR Code Portfolio"
                                        className="mx-auto rounded-lg"
                                    />
                                    {/* Logo Guidy au centre du QR code (simulation) */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-amber-500">
                                            <Sparkles className="w-6 h-6 text-amber-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* URL avec style */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                <p className="text-xs text-gray-600 break-all font-mono">{url}</p>
                            </div>
                        </div>

                        {/* Boutons de partage social avec style Guidy */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                <Share2 className="w-4 h-4 text-amber-600" />
                                {t('portfolio.share.socialSharing')}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    size="sm"
                                    onClick={() => shareOnPlatform('linkedin')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white justify-start"
                                >
                                    <Linkedin className="w-4 h-4 mr-2" />
                                    {t('portfolio.share.linkedin')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => shareOnPlatform('twitter')}
                                    className="bg-black hover:bg-gray-800 text-white justify-start"
                                >
                                    <Twitter className="w-4 h-4 mr-2" />
                                    {t('portfolio.share.twitter')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => shareOnPlatform('facebook')}
                                    className="bg-blue-700 hover:bg-blue-800 text-white justify-start"
                                >
                                    <Facebook className="w-4 h-4 mr-2" />
                                    {t('portfolio.share.facebook')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => shareOnPlatform('whatsapp')}
                                    className="bg-green-600 hover:bg-green-700 text-white justify-start"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {t('portfolio.share.whatsapp')}
                                </Button>
                            </div>
                            
                            {/* Email et copie */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    size="sm"
                                    onClick={() => shareOnPlatform('email')}
                                    variant="outline"
                                    className="justify-start border-amber-200 text-amber-700 hover:bg-amber-50"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    {t('portfolio.share.email')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={copyToClipboard}
                                    variant="outline"
                                    className={cn(
                                        "justify-start transition-all",
                                        copied 
                                            ? "border-green-200 text-green-700 bg-green-50" 
                                            : "border-gray-200 hover:bg-gray-50"
                                    )}
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            {t('portfolio.share.copied')}
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            {t('portfolio.share.copy')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Actions du QR Code */}
                        <div className="flex gap-3">
                            <Button
                                onClick={downloadQRCode}
                                variant="outline"
                                className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {t('portfolio.share.download')}
                            </Button>
                            <Button
                                onClick={() => window.open(url, '_blank')}
                                className={cn("flex-1 bg-gradient-to-r", guidyColors.gradient, "text-white hover:opacity-90")}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {t('portfolio.share.viewPortfolio')}
                            </Button>
                        </div>

                        {/* Conseils de partage */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                    <Sparkles className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <h5 className="font-medium text-blue-900 mb-1">{t('portfolio.share.tips.title')}</h5>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• {t('portfolio.share.tips.linkedin')}</li>
                                        <li>• {t('portfolio.share.tips.qrCard')}</li>
                                        <li>• {t('portfolio.share.tips.emailSignature')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Informations utilisateur */}
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-3">
                                {user.photo && (
                                    <img 
                                        src={user.photo} 
                                        alt={user.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{user.name || 'Utilisateur Guidy'}</div>
                                    <div className="text-sm text-gray-600">{user.full_profession || 'Professionnel'}</div>
                                    <div className="text-xs text-amber-600 font-medium">Créé avec Guidy</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">Portfolio</div>
                                    <div className="text-xs text-gray-500">Mise à jour aujourd'hui</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer avec branding Guidy */}
                    <div className="bg-gray-50 px-6 py-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Guidy</span>
                            </div>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                            >
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EnhancedQRCode;