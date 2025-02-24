import React from 'react';
import { Head } from '@inertiajs/react';
import { Building, Mail, Phone, Globe, Shield, UserCheck } from 'lucide-react';

const LegalNotice = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Mentions Légales | Guidy",
        "description": "Mentions légales de Guidy - Plateforme de création de CV professionnels au Cameroun",
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
        <>
            <Head>
                <title>Mentions Légales | Guidy - Création de CV au Cameroun</title>
                <meta name="description" content="Mentions légales de Guidy. Informations légales sur notre service de création de CV professionnel au Cameroun." />
                <meta name="keywords" content="mentions légales, informations légales, Guidy Cameroun, création CV Cameroun, légal" />
                <meta property="og:title" content="Mentions Légales | Guidy" />
                <meta property="og:description" content="Informations légales sur notre service de création de CV" />
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
                            Mentions Légales
                        </h1>
                        <p className="text-xl text-gray-600">
                            Informations légales sur Guidy
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <Building className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Entreprise</h3>
                                    <p className="text-gray-600">Informations légales sur notre société</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Shield className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Protection des Données</h3>
                                    <p className="text-gray-600">Conformité avec la réglementation</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Informations Légales</h2>
                                <p className="text-gray-600 mb-4">
                                    Guidy est une plateforme de création de CV et d'assistance professionnelle .
                                </p>
                                {/*<ul className="list-none text-gray-600 space-y-2">*/}
                                {/*    <li>Nom de la société : Guidy</li>*/}
                                {/*    <li>Statut : Entreprise individuelle</li>*/}
                                {/*    <li>Pays d'exploitation : Cameroun</li>*/}
                                {/*    <li>Ville principale : Douala</li>*/}
                                {/*</ul>*/}
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Contact</h2>
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
                                <h2 className="text-2xl font-semibold mb-4">3. Hébergement</h2>
                                <p className="text-gray-600 mb-4">
                                    Le site Guidy est hébergé par :
                                </p>
                                <ul className="list-none text-gray-600 space-y-2">
                                    <li>Nom de l'hébergeur : MIRHOSTY</li>
                                    <li>Adresse : mirhosty.com</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Protection des Données</h2>
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
                                <h2 className="text-2xl font-semibold mb-4">5. Propriété Intellectuelle</h2>
                                <p className="text-gray-600 mb-4">
                                    Tous les éléments du site Guidy sont protégés par :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Le droit d'auteur</li>
                                    <li>Le droit des marques</li>
                                    <li>Le droit des dessins et modèles</li>
                                    <li>Le droit des bases de données</li>
                                </ul>
                            </section>

                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 mb-8">
                        Dernière mise à jour : {new Date().toLocaleDateString()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LegalNotice;
