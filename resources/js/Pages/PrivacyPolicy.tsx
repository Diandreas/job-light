import React from 'react';
import { Head } from '@inertiajs/react';
import { Shield, Lock, Eye, Database } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

const PrivacyPolicy = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Politique de Confidentialité | Guidy",
        "description": "Politique de confidentialité de Guidy - Découvrez comment nous protégeons vos données personnelles lors de la création de votre CV au Cameroun.",
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
                <title>Politique de Confidentialité | Guidy - Protection de vos Données</title>
                <meta name="description" content="Découvrez comment Guidy protège vos données personnelles. Politique de confidentialité détaillée pour la création de CV au Cameroun." />
                <meta name="keywords" content="politique confidentialité, protection données, sécurité CV, données personnelles, Guidy Cameroun" />
                <meta property="og:title" content="Politique de Confidentialité | Guidy" />
                <meta property="og:description" content="Protection de vos données personnelles chez Guidy" />
                <meta property="og:image" content="../../public/image.png" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://guidy.com/privacy" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Politique de Confidentialité
                        </h1>
                        <p className="text-xl text-gray-600">
                            Protection et sécurité de vos données personnelles
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <Shield className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Protection des Données</h3>
                                    <p className="text-gray-600">Vos informations personnelles sont protégées selon les normes de sécurité les plus strictes.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Lock className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Sécurité Garantie</h3>
                                    <p className="text-gray-600">Toutes vos données sont cryptées et stockées de manière sécurisée.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                                <p className="text-gray-600 mb-4">
                                    Chez Guidy, nous accordons une importance capitale à la protection de vos données personnelles.
                                    Cette politique de confidentialité détaille comment nous collectons, utilisons et protégeons vos informations
                                    lors de l'utilisation de notre plateforme de création de CV.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Collecte des Données</h2>
                                <p className="text-gray-600 mb-4">
                                    Nous collectons uniquement les informations nécessaires à la création de votre CV :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Informations personnelles (nom, prénom, contact)</li>
                                    <li>Expériences professionnelles</li>
                                    <li>Formation et compétences</li>
                                    <li>Photo de profil (optionnel)</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Utilisation des Données</h2>
                                <p className="text-gray-600 mb-4">
                                    Vos données sont utilisées exclusivement pour :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>La création et personnalisation de votre CV</li>
                                    <li>L'amélioration de nos services</li>
                                    <li>Le support client</li>
                                    <li>La conformité légale</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Protection des Données</h2>
                                <p className="text-gray-600 mb-4">
                                    Nous mettons en œuvre des mesures de sécurité rigoureuses pour protéger vos données :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Cryptage des données</li>
                                    <li>Accès sécurisé aux serveurs</li>
                                    <li>Sauvegardes régulières</li>
                                    <li>Surveillance continue</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Vos Droits</h2>
                                <p className="text-gray-600 mb-4">
                                    Vous disposez des droits suivants concernant vos données :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Droit d'accès à vos données</li>
                                    <li>Droit de rectification</li>
                                    <li>Droit à l'effacement</li>
                                    <li>Droit à la portabilité</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
                                <p className="text-gray-600 mb-4">
                                    Pour toute question concernant vos données personnelles :
                                </p>
                                <ul className="list-none text-gray-600 space-y-2">
                                    <li>Email : guidy.makeitreall@gmail.com</li>
                                    <li>WhatsApp : +237693427913</li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 mb-8">
                        Dernière mise à jour : {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default PrivacyPolicy;
