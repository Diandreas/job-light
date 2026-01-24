import React from 'react';
import { Head } from '@inertiajs/react';
import { RotateCcw, ShieldCheck, HelpCircle, Mail } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from 'react-i18next';

const RefundPolicy = () => {
    const { t } = useTranslation();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": t('pages.refundPolicy.metaTitle'),
        "description": t('pages.refundPolicy.metaDescription'),
        "publisher": {
            "@type": "Organization",
            "name": "Guidy",
            "logo": {
                "@type": "ImageObject",
                "url": "../../public/logo.png"
            }
        }
    };

    return (
        <GuestLayout>
            <Head>
                <title>{t('pages.refundPolicy.metaTitle')}</title>
                <meta name="description" content={t('pages.refundPolicy.metaDescription')} />
                <meta name="keywords" content={t('pages.refundPolicy.metaKeywords')} />
                <meta property="og:title" content={t('pages.refundPolicy.title')} />
                <meta property="og:description" content={t('pages.refundPolicy.subtitle')} />
                <meta property="og:image" content="../../public/image.png" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://guidy.com/refund-policy" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('pages.refundPolicy.title')}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {t('pages.refundPolicy.subtitle')}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <RotateCcw className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.refundPolicy.sections.guarantee.title')}</h3>
                                    <p className="text-gray-600">{t('pages.refundPolicy.sections.guarantee.description')}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <ShieldCheck className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.refundPolicy.sections.security.title')}</h3>
                                    <p className="text-gray-600">{t('pages.refundPolicy.sections.security.description')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. {t('pages.refundPolicy.sections.scope.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.refundPolicy.sections.scope.description')}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. {t('pages.refundPolicy.sections.eligibility.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.refundPolicy.sections.eligibility.description')}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. {t('pages.refundPolicy.sections.process.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.refundPolicy.sections.process.description')}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. {t('pages.refundPolicy.sections.contact.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.refundPolicy.sections.contact.description')}
                                </p>
                                <ul className="list-none text-gray-600 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>guidy.makeitreall@gmail.com</span>
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 mb-8">
                        {t('pages.refundPolicy.lastUpdate')} {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default RefundPolicy;
