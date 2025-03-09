import React from 'react';
import { Head } from '@inertiajs/react';
import { Cookie, Shield, Settings, Info } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
const CookiePolicy = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Politique des Cookies | Guidy",
        "description": "Découvrez comment Guidy utilise les cookies pour améliorer votre expérience de création de CV au Cameroun.",
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
                <title>Politique des Cookies | Guidy - Création de CV au Cameroun</title>
                <meta name="description" content="Politique des cookies de Guidy. Comprendre comment nous utilisons les cookies pour améliorer votre expérience de création de CV au Cameroun." />
                <meta name="keywords" content="cookies, politique cookies, traceurs, confidentialité, Guidy Cameroun" />
                <meta property="og:title" content="Politique des Cookies | Guidy" />
                <meta property="og:description" content="Découvrez notre utilisation des cookies pour améliorer votre expérience" />
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
                            Politique des Cookies
                        </h1>
                        <p className="text-xl text-gray-600">
                            Comment nous utilisons les cookies pour améliorer votre expérience
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <Cookie className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Cookies Essentiels</h3>
                                    <p className="text-gray-600">Nécessaires au fonctionnement du site et à la sécurité de votre compte.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Settings className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Cookies de Préférence</h3>
                                    <p className="text-gray-600">Améliorent votre expérience en mémorisant vos choix.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Qu'est-ce qu'un Cookie ?</h2>
                                <p className="text-gray-600 mb-4">
                                    Un cookie est un petit fichier texte stocké sur votre appareil lors de votre visite sur notre site.
                                    Ces fichiers nous permettent de :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Mémoriser vos préférences</li>
                                    <li>Sécuriser votre connexion</li>
                                    <li>Améliorer nos services</li>
                                    <li>Analyser l'utilisation du site</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Types de Cookies Utilisés</h2>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Cookies Essentiels</h3>
                                        <p className="text-gray-600">
                                            Nécessaires au fonctionnement du site :
                                        </p>
                                        <ul className="list-disc list-inside text-gray-600 ml-4">
                                            <li>Authentification</li>
                                            <li>Sécurité</li>
                                            <li>Session utilisateur</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Cookies de Performance</h3>
                                        <p className="text-gray-600">
                                            Pour améliorer l'expérience utilisateur :
                                        </p>
                                        <ul className="list-disc list-inside text-gray-600 ml-4">
                                            <li>Analyse du trafic</li>
                                            <li>Statistiques d'utilisation</li>
                                            <li>Détection des erreurs</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Gestion des Cookies</h2>
                                <p className="text-gray-600 mb-4">
                                    Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Paramètres du navigateur</li>
                                    <li>Outils de gestion des cookies</li>
                                    <li>Options de confidentialité</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Impact sur l'Expérience Utilisateur</h2>
                                <p className="text-gray-600 mb-4">
                                    La désactivation des cookies peut :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Limiter certaines fonctionnalités</li>
                                    <li>Affecter l'expérience utilisateur</li>
                                    <li>Nécessiter une reconnexion fréquente</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Contact</h2>
                                <p className="text-gray-600 mb-4">
                                    Pour toute question sur notre utilisation des cookies :
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

export default CookiePolicy;
