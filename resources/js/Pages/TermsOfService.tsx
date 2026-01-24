import React from 'react';
import { Head } from '@inertiajs/react';
import { FileText, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from 'react-i18next';

const TermsOfService = () => {
    const { t } = useTranslation();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": t('pages.termsOfService.metaTitle'),
        "description": t('pages.termsOfService.metaDescription'),
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
                <title>{t('pages.termsOfService.metaTitle')}</title>
                <meta name="description" content={t('pages.termsOfService.metaDescription')} />
                <meta name="keywords" content={t('pages.termsOfService.metaKeywords')} />
                <meta property="og:title" content={t('pages.termsOfService.title')} />
                <meta property="og:description" content={t('pages.termsOfService.subtitle')} />
                <meta property="og:image" content="../../public/image.png" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://guidy.com/terms-and-conditions" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('pages.termsOfService.title')}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {t('pages.termsOfService.subtitle')}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <CheckCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.termsOfService.sections.usage.title')}</h3>
                                    <p className="text-gray-600">{t('pages.termsOfService.sections.usage.description')}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.termsOfService.sections.responsibilities.title')}</h3>
                                    <p className="text-gray-600">{t('pages.termsOfService.sections.responsibilities.description')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. {t('pages.termsOfService.sections.general.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.general.description')}
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. {t('pages.termsOfService.sections.services.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.services.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.termsOfService.sections.services.items.cv')}</li>
                                    <li>{t('pages.termsOfService.sections.services.items.ai')}</li>
                                    <li>{t('pages.termsOfService.sections.services.items.letters')}</li>
                                    <li>{t('pages.termsOfService.sections.services.items.interview')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. {t('pages.termsOfService.sections.usage.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.usage.usageDescription')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.termsOfService.sections.usage.items.accurate')}</li>
                                    <li>{t('pages.termsOfService.sections.usage.items.confidentiality')}</li>
                                    <li>{t('pages.termsOfService.sections.usage.items.legal')}</li>
                                    <li>{t('pages.termsOfService.sections.usage.items.intellectual')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. {t('pages.termsOfService.sections.intellectual.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.intellectual.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.termsOfService.sections.intellectual.items.templates')}</li>
                                    <li>{t('pages.termsOfService.sections.intellectual.items.content')}</li>
                                    <li>{t('pages.termsOfService.sections.intellectual.items.logo')}</li>
                                    <li>{t('pages.termsOfService.sections.intellectual.items.code')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. {t('pages.termsOfService.sections.pricing.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.pricing.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.termsOfService.sections.pricing.items.free')}</li>
                                    <li>{t('pages.termsOfService.sections.pricing.items.premium')}</li>
                                    <li>{t('pages.termsOfService.sections.pricing.items.payment')}</li>
                                    <li>{t('pages.termsOfService.sections.pricing.items.refund')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. {t('pages.termsOfService.sections.dataProtection.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.dataProtection.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.termsOfService.sections.dataProtection.items.protect')}</li>
                                    <li>{t('pages.termsOfService.sections.dataProtection.items.confidentiality')}</li>
                                    <li>{t('pages.termsOfService.sections.dataProtection.items.secure')}</li>
                                    <li>{t('pages.termsOfService.sections.dataProtection.items.sharing')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">7. {t('pages.termsOfService.sections.modifications.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.modifications.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.termsOfService.sections.modifications.items.features')}</li>
                                    <li>{t('pages.termsOfService.sections.modifications.items.pricing')}</li>
                                    <li>{t('pages.termsOfService.sections.modifications.items.templates')}</li>
                                    <li>{t('pages.termsOfService.sections.modifications.items.market')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">8. {t('pages.termsOfService.sections.termination.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.termination.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.termsOfService.sections.termination.items.user')}</li>
                                    <li>{t('pages.termsOfService.sections.termination.items.violation')}</li>
                                    <li>{t('pages.termsOfService.sections.termination.items.nonpayment')}</li>
                                    <li>{t('pages.termsOfService.sections.termination.items.force')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">9. {t('pages.termsOfService.sections.contact.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.termsOfService.sections.contact.description')}
                                </p>
                                <ul className="list-none text-gray-600 space-y-2">
                                    <li>WhatsApp : +237693427913</li>
                                    <li>Email : guidy.makeitreall@gmail.com</li>
                                    <li>{t('pages.termsOfService.sections.contact.items.languages')}</li>
                                    <li>{t('pages.termsOfService.sections.contact.items.support')}</li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 mb-8">
                        {t('pages.termsOfService.lastUpdate')} {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default TermsOfService;
