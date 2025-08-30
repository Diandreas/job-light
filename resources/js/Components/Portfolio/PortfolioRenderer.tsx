import React, { Suspense } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { getDesignComponent, getDesignMetadata, DESIGN_METADATA } from './Designs';
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { QrCode, Share2, Download, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import EnhancedQRCode from './EnhancedQRCode';
import EnhancedShareControls from './EnhancedShareControls';

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

// Portfolio stats (you might want to fetch this from your backend)
const getPortfolioStats = (user: any) => ({
    views: Math.floor(Math.random() * 100) + 50, // Replace with real data
    shares: Math.floor(Math.random() * 20) + 5,   // Replace with real data
    lastViewed: new Date().toLocaleDateString('fr-FR'),
    isPublic: true
});

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
                size="sm"
                onClick={onShowQR}
                className="shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: '#3b82f6' }}
            >
                <QrCode className="w-4 h-4 mr-2" />
                {t('portfolio.controls.share')}
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

            {/* Enhanced Portfolio Controls */}
            {showControls && !isPreview && (
                <EnhancedShareControls
                    user={user}
                    portfolioUrl={portfolioUrl}
                    onShowQR={() => setShowQR(true)}
                    portfolioStats={getPortfolioStats(user)}
                />
            )}

            {/* Enhanced QR Code Modal */}
            <EnhancedQRCode
                url={portfolioUrl}
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                user={user}
                portfolioStats={getPortfolioStats(user)}
            />
        </>
    );
}