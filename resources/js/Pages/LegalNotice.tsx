import React from 'react';
import { Head } from '@inertiajs/react';
import { Building, Mail, Phone, Globe, Shield, UserCheck } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from 'react-i18next';

const LegalNotice = () => {
    const { t } = useTranslation();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": t('pages.legalNotice.metaTitle'),
        "description": t('pages.legalNotice.metaDescription'),
        "publisher": {
            "@type": "Organization",
            "name": "Guidy",
            "logo": {
                "@type": "ImageObject",
                "url": "../../public/logo.png"
            },
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "CM",
                "addressLocality": "Douala"
            }
        }
    };

    return (
        <GuestLayout>
            <Head>
                <title>{t('pages.legalNotice.metaTitle')}</title>
                <meta name="description" content={t('pages.legalNotice.metaDescription')} />
                <meta name="keywords" content={t('pages.legalNotice.metaKeywords')} />
                <meta property="og:title" content={t('pages.legalNotice.title')} />
                <meta property="og:description" content={t('pages.legalNotice.subtitle')} />
                <meta property="og:image" content="../../public/image.png" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://guidy.com/mentions-legales" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('pages.legalNotice.title')}
                        </h1>
                        <p className="text-xl text-gray-600">
                            {t('pages.legalNotice.subtitle')}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <Building className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.legalNotice.sections.company.title')}</h3>
                                    <p className="text-gray-600">{t('pages.legalNotice.sections.company.description')}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Shield className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{t('pages.legalNotice.sections.dataProtection.title')}</h3>
                                    <p className="text-gray-600">{t('pages.legalNotice.sections.dataProtection.description')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. {t('pages.legalNotice.sections.legal.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.legalNotice.sections.legal.description')}
                                </p>
                                {/*<ul className="list-none text-gray-600 space-y-2">*/}
                                {/*    <li>Nom de la société : Guidy</li>*/}
                                {/*    <li>Statut : Entreprise individuelle</li>*/}
                                {/*    <li>Pays d'exploitation : Cameroun</li>*/}
                                {/*    <li>Ville principale : Douala</li>*/}
                                {/*</ul>*/}
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. {t('pages.legalNotice.sections.contact.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.legalNotice.sections.contact.description')}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-amber-500" />
                                        <span className="text-gray-600">+237693427913</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-amber-500" />
                                        <span className="text-gray-600">guidy.makeitreall@gmail.com</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. {t('pages.legalNotice.sections.hosting.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.legalNotice.sections.hosting.description')}
                                </p>
                                <ul className="list-none text-gray-600 space-y-2">
                                    <li>Nom de l'hébergeur : MIRHOSTY</li>
                                    <li>Adresse : mirhosty.com</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. {t('pages.legalNotice.sections.dataProtection.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    Conformément à la législation camerounaise sur la protection des données personnelles :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Vos données sont stockées de manière sécurisée</li>
                                    <li>Vous disposez d'un droit d'accès et de rectification</li>
                                    <li>Nous respectons les normes de confidentialité</li>
                                    <li>Vos informations ne sont pas revendues</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. {t('pages.legalNotice.sections.intellectualProperty.title')}</h2>
                                <p className="text-gray-600 mb-4">
                                    {t('pages.legalNotice.sections.intellectualProperty.description')}
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>{t('pages.legalNotice.sections.intellectualProperty.rights.copyright')}</li>
                                    <li>{t('pages.legalNotice.sections.intellectualProperty.rights.trademark')}</li>
                                    <li>{t('pages.legalNotice.sections.intellectualProperty.rights.design')}</li>
                                    <li>{t('pages.legalNotice.sections.intellectualProperty.rights.database')}</li>
                                </ul>
                            </section>

                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 mb-8">
                        {t('pages.legalNotice.lastUpdate')} {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default LegalNotice;
