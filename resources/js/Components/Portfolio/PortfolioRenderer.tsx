import React, { Suspense } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { getDesignComponent, getDesignMetadata, DESIGN_METADATA } from './Designs';
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { QrCode, Share2, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import PortfolioQRCode from '../PortfolioQRCode';

interface PortfolioRendererProps {
    user: any;
    cvData: any;
    settings: any;
    isPreview?: boolean;
    showControls?: boolean;
}

// Loading component
const PortfolioLoader = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600">{t('portfolio.sections.loading')}</p>
            </div>
        </div>
    );
};

// Error fallback component
const PortfolioError = ({ error, retry }: { error?: Error; retry?: () => void }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
            <Card className="max-w-md mx-4">
                <CardContent className="p-8 text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-800 mb-4">{t('portfolio.sections.error.title')}</h2>
                    <p className="text-red-600 mb-6">
                        {error?.message || t('portfolio.sections.error.message')}
                    </p>
                    {retry && (
                        <Button onClick={retry} variant="outline">
                            {t('portfolio.sections.error.retry')}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// QR Code Generator component
const QRCodeGenerator = ({ 
    url, 
    isOpen, 
    onClose, 
    userPhoto 
}: { 
    url: string; 
    isOpen: boolean; 
    onClose: () => void;
    userPhoto?: string;
}) => {
    const { t } = useTranslation();
    const [qrCodeRef, setQrCodeRef] = React.useState<HTMLCanvasElement | null>(null);

    if (!isOpen) return null;

    const shareQRCodeImage = async (platform: string) => {
        if (!qrCodeRef) return;

        try {
            // Convert QR code to blob
            qrCodeRef.toBlob(async (blob) => {
                if (!blob) return;

                const shareText = `Découvrez mon portfolio professionnel : ${url}`;

                if (platform === 'whatsapp') {
                    // For WhatsApp, we can try to share the image if Web Share API is supported
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'qrcode.png', { type: 'image/png' })] })) {
                        try {
                            await navigator.share({
                                text: shareText,
                                files: [new File([blob], 'qrcode.png', { type: 'image/png' })]
                            });
                            return;
                        } catch (error) {
                            console.log('Native share failed, falling back to URL');
                        }
                    }
                    // Fallback to WhatsApp URL with text
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                } else {
                    // For other platforms, download the QR code and open share URL
                    const link = document.createElement('a');
                    link.download = 'qrcode-portfolio.png';
                    link.href = URL.createObjectURL(blob);
                    link.click();

                    // Then open the share URL
                    const shareUrls = {
                        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                        x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
                        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    };
                    
                    if (shareUrls[platform as keyof typeof shareUrls]) {
                        setTimeout(() => {
                            window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
                        }, 500);
                    }
                }
            }, 'image/png', 0.9);
        } catch (error) {
            console.error('Error sharing QR code:', error);
            // Fallback to simple URL sharing
            const shareUrls = {
                linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                x: `https://x.com/intent/tweet?text=${encodeURIComponent('Découvrez mon portfolio professionnel : ' + url)}`,
                facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                whatsapp: `https://wa.me/?text=${encodeURIComponent('Découvrez mon portfolio : ' + url)}`,
            };
            window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center">
                    <h3 className="text-lg font-bold mb-4">{t('portfolio.share.title')}</h3>

                    {/* Beautiful QR Code with Guidy branding */}
                    <div className="mb-4">
                        <PortfolioQRCode 
                            value={url} 
                            size={200}
                            profilePicture={userPhoto}
                            className="flex flex-col items-center compact-mode"
                            onQRReady={(canvas) => setQrCodeRef(canvas)}
                        />
                        <p className="text-xs text-gray-500 break-all px-2 mt-2">{url}</p>
                    </div>

                    {/* Social sharing buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('linkedin')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {t('portfolio.share.linkedin')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('x')}
                            className="bg-black hover:bg-gray-800 text-white"
                        >
                            X (Twitter)
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('facebook')}
                            className="bg-blue-700 hover:bg-blue-800 text-white"
                        >
                            {t('portfolio.share.facebook')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => shareQRCodeImage('whatsapp')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {t('portfolio.share.whatsapp')}
                        </Button>
                    </div>

                    {/* Copy link */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="w-full mb-2"
                    >
                        {t('portfolio.controls.copyLink')}
                    </Button>

                    {/* Close button */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        className="w-full text-gray-500 hover:text-gray-700"
                    >
                        Fermer
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Portfolio controls component
const PortfolioControls = ({
    user,
    portfolioUrl,
    onShowQR
}: {
    user: any;
    portfolioUrl: string;
    onShowQR: () => void;
}) => {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 z-40 flex flex-col gap-2"
        >
            <Button
                size="lg"
                onClick={onShowQR}
                className="shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-semibold rounded-full"
            >
                <QrCode className="w-5 h-5 mr-2" />
                Partager
            </Button>


            <Button
                size="sm"
                onClick={() => window.open(portfolioUrl, '_blank')}
                variant="outline"
                className="shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
            >
                <ExternalLink className="w-4 h-4" />
            </Button>
        </motion.div>
    );
};

export default function PortfolioRenderer({
    user,
    cvData,
    settings,
    isPreview = false,
    showControls = true
}: PortfolioRendererProps) {
    const { t } = useTranslation();
    const [showQR, setShowQR] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    // Add defensive check for user prop
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-red-800 mb-4">{t('portfolio.sections.error.dataError')}</h2>
                    <p className="text-red-600 mb-6">
                        {t('portfolio.sections.error.dataMissing')}
                    </p>
                    <div className="text-sm text-gray-500">
                        Debug: user prop is {typeof user} - {JSON.stringify(user)}
                    </div>
                </div>
            </div>
        );
    }

    // Ensure all experiences are displayed automatically
    const processedCvData = React.useMemo(() => {
        if (!cvData) return {
            experiences: [],
            skills: [],
            hobbies: [],
            professional_title: user.full_profession || 'Professionnel',
            profile_picture: user.photo,
            email: user.email,
            phone: user.phone,
            address: user.address,
        };

        return {
            ...cvData,
            // Ensure experiences are always shown if they exist
            experiences: cvData.experiences || [],
            skills: cvData.skills || [],
            hobbies: cvData.hobbies || [],
            // Auto-generate professional title if missing
            professional_title: cvData.professional_title || settings.tagline || `${cvData.position || user.full_profession || 'Professionnel'}`,
            // Ensure profile picture is available
            profile_picture: cvData.profile_picture || user.photo,
            // Auto-populate contact info
            email: cvData.email || user.email,
            phone: cvData.phone || user.phone,
            address: cvData.address || user.address,
        };
    }, [cvData, settings, user]);

    // Auto-enable sections based on data availability
    const processedSettings = React.useMemo(() => ({
        ...(settings || {}),
        // Auto-enable sections if data exists
        show_experiences: settings?.show_experiences ?? (processedCvData?.experiences?.length > 0),
        show_competences: settings?.show_competences ?? (processedCvData?.skills?.length > 0),
        show_hobbies: settings?.show_hobbies ?? (processedCvData?.hobbies?.length > 0),
        show_summary: settings?.show_summary ?? Boolean(
            typeof processedCvData?.summary === 'string' ? processedCvData.summary : processedCvData?.summaries?.[0]?.description
        ),
        show_contact_info: settings?.show_contact_info ?? Boolean(processedCvData?.email || processedCvData?.phone),
        show_languages: settings?.show_languages ?? Boolean(processedCvData?.languages?.length > 0),
        // Default design
        design: settings?.design || 'professional'
    }), [settings, processedCvData]);

    const portfolioUrl = `${window.location.origin}/portfolio/${user.username || user.email || 'unknown'}`;
    const designType = processedSettings.design;
    const designMetadata = getDesignMetadata(designType);

    // Get the design component
    const DesignComponent = React.useMemo(() => {
        try {
            return getDesignComponent(designType);
        } catch (err) {
            console.error('Error loading design component:', err);
            setError(err as Error);
            return getDesignComponent('professional'); // Fallback
        }
    }, [designType]);


    // SEO metadata
    const seoTitle = settings?.seo_title || `${user.name || 'Utilisateur'} - Portfolio Professionnel`;
    const summaryText = typeof processedCvData?.summary === 'string'
        ? processedCvData.summary
        : processedCvData?.summaries?.[0]?.description || '';
    const seoDescription = settings?.seo_description || (summaryText && summaryText.substring(0, 155)) || `Découvrez le portfolio professionnel de ${user.name || 'cet utilisateur'}`;
    const profileImage = processedCvData?.profile_picture || user.photo;

    if (error) {
        return <PortfolioError error={error} retry={() => setError(null)} />;
    }

    return (
        <>
            {/* SEO Meta Tags */}
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />

                {/* Open Graph */}
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:type" content="profile" />
                <meta property="og:url" content={portfolioUrl} />
                {profileImage && <meta property="og:image" content={profileImage} />}
                <meta property="og:site_name" content="JobLight Portfolio" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {profileImage && <meta name="twitter:image" content={profileImage} />}

                {/* Additional meta */}
                <meta name="author" content={user.name || 'Utilisateur'} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={portfolioUrl} />

                {/* Schema.org structured data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": user.name || 'Utilisateur',
                        "jobTitle": processedCvData?.professional_title || settings?.tagline,
                        "description": seoDescription,
                        "url": portfolioUrl,
                        "image": profileImage,
                        "email": processedCvData?.email,
                        "telephone": processedCvData?.phone,
                        "address": processedCvData?.address
                    })}
                </script>
            </Head>

            {/* Main Portfolio Content */}
            <Suspense fallback={<PortfolioLoader />}>
                <DesignComponent
                    user={user}
                    cvData={processedCvData}
                    settings={processedSettings}
                    isPreview={isPreview}
                />
            </Suspense>

            {/* Portfolio Controls */}
            {showControls && !isPreview && (
                <PortfolioControls
                    user={user}
                    portfolioUrl={portfolioUrl}
                    onShowQR={() => setShowQR(true)}
                />
            )}

            {/* QR Code Modal */}
            <QRCodeGenerator
                url={portfolioUrl}
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                userPhoto={processedCvData?.profile_picture || user.photo}
            />
        </>
    );
}