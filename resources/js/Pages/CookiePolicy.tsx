import React from 'react';
import { Head } from '@inertiajs/react';
import { Cookie, Shield, Settings, Info } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from 'react-i18next';

const CookiePolicy = () => {
    const { t } = useTranslation();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": t('pages.cookiePolicy.metaTitle'),
        "description": t('pages.cookiePolicy.metaDescription'),
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
                <title>{t('pages.cookiePolicy.metaTitle')}</title>
                <meta name="description" content={t('pages.cookiePolicy.metaDescription')} />
                <meta name="keywords" content={t('pages.cookiePolicy.metaKeywords')} />
                <meta property="og:title" content={t('pages.cookiePolicy.title')} />
                <meta property="og:description" content={t('pages.cookiePolicy.subtitle')} />
                <meta property="og:image" content="../../public/image.png" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://guidy.com/cookies" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('pages.cookiePolicy.title')}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {t('pages.cookiePolicy.subtitle')}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <Cookie className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.cookiePolicy.sections.essential.title')}</h3>
                                    <p className="text-gray-600">{t('pages.cookiePolicy.sections.essential.description')}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Settings className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.cookiePolicy.sections.preferences.title')}</h3>
                                    <p className="text-gray-600">{t('pages.cookiePolicy.sections.preferences.description')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. {t('pages.cookiePolicy.sections.what.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.cookiePolicy.sections.what.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.cookiePolicy.sections.what.uses.preferences')}</li>
                                    <li>{t('pages.cookiePolicy.sections.what.uses.security')}</li>
                                    <li>{t('pages.cookiePolicy.sections.what.uses.improve')}</li>
                                    <li>{t('pages.cookiePolicy.sections.what.uses.analytics')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. {t('pages.cookiePolicy.sections.types.title')}</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('pages.cookiePolicy.sections.types.essential.title')}</h3>
                                        <p className="text-gray-600">
                                            {t('pages.cookiePolicy.sections.types.essential.description')}
                                        </p>
                                        <ul className="list-disc list-inside text-gray-600 ml-4">
                                            <li>{t('pages.cookiePolicy.sections.types.essential.uses.auth')}</li>
                                            <li>{t('pages.cookiePolicy.sections.types.essential.uses.security')}</li>
                                            <li>{t('pages.cookiePolicy.sections.types.essential.uses.session')}</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{t('pages.cookiePolicy.sections.types.performance.title')}</h3>
                                        <p className="text-gray-600">
                                            {t('pages.cookiePolicy.sections.types.performance.description')}
                                        </p>
                                        <ul className="list-disc list-inside text-gray-600 ml-4">
                                            <li>{t('pages.cookiePolicy.sections.types.performance.uses.analytics')}</li>
                                            <li>{t('pages.cookiePolicy.sections.types.performance.uses.usage')}</li>
                                            <li>{t('pages.cookiePolicy.sections.types.performance.uses.errors')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. {t('pages.cookiePolicy.sections.management.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.cookiePolicy.sections.management.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.cookiePolicy.sections.management.options.browser')}</li>
                                    <li>{t('pages.cookiePolicy.sections.management.options.tools')}</li>
                                    <li>{t('pages.cookiePolicy.sections.management.options.privacy')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. {t('pages.cookiePolicy.sections.impact.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.cookiePolicy.sections.impact.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.cookiePolicy.sections.impact.effects.features')}</li>
                                    <li>{t('pages.cookiePolicy.sections.impact.effects.experience')}</li>
                                    <li>{t('pages.cookiePolicy.sections.impact.effects.login')}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. {t('pages.cookiePolicy.sections.contact.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.cookiePolicy.sections.contact.description')}
                                </p>
                                <ul className="list-none text-gray-600 space-y-2">
                                    <li>Email : guidy.makeitreall@gmail.com</li>
                                    <li>WhatsApp : +237693427913</li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 mb-8">
                        {t('pages.cookiePolicy.lastUpdate')} {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default CookiePolicy;
