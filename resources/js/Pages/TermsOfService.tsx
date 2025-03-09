import React from 'react';
import { Head } from '@inertiajs/react';
import { FileText, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
const TermsOfService = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Conditions d'Utilisation | Guidy",
        "description": "Conditions générales d'utilisation de Guidy - Service de création de CV professionnel au Cameroun.",
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
                <title>Conditions d'Utilisation | Guidy - Création de CV au Cameroun</title>
                <meta name="description" content="Consultez les conditions d'utilisation de Guidy. Règles et modalités d'utilisation de notre service de création de CV au Cameroun." />
                <meta name="keywords" content="conditions utilisation, CGU, termes service, règles utilisation, Guidy Cameroun, CV Cameroun" />
                <meta property="og:title" content="Conditions d'Utilisation | Guidy" />
                <meta property="og:description" content="Conditions d'utilisation du service de création de CV Guidy" />
                <meta property="og:image" content="../../public/image.png" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://guidy.com/terms" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Conditions Générales d'Utilisation
                        </h1>
                        <p className="text-xl text-gray-600">
                            Règles et modalités d'utilisation de Guidy
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <CheckCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Utilisation Conforme</h3>
                                    <p className="text-gray-600">Respectez nos conditions pour une expérience optimale.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Responsabilités</h3>
                                    <p className="text-gray-600">Comprendre vos droits et obligations.</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Conditions Générales</h2>
                                <p className="text-gray-600 mb-4">
                                    En accédant à Guidy, vous acceptez d'être lié par ces conditions d'utilisation,
                                    toutes les lois et réglementations applicables. Si vous n'acceptez pas ces conditions,
                                    vous ne devez pas utiliser notre service.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Services Proposés</h2>
                                <p className="text-gray-600 mb-4">
                                    Guidy propose les services suivants :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Création de CV professionnels adaptés au marché camerounais</li>
                                    <li>Assistance IA pour l'optimisation des CV</li>
                                    <li>Modèles de lettres de motivation personnalisés</li>
                                    <li>Conseils pour les entretiens d'embauche au Cameroun</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Utilisation du Service</h2>
                                <p className="text-gray-600 mb-4">
                                    En utilisant notre service, vous vous engagez à :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Fournir des informations exactes et véridiques</li>
                                    <li>Maintenir la confidentialité de votre compte</li>
                                    <li>Ne pas utiliser le service à des fins illégales</li>
                                    <li>Respecter les droits de propriété intellectuelle</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Propriété Intellectuelle</h2>
                                <p className="text-gray-600 mb-4">
                                    Le contenu de Guidy est protégé par les droits de propriété intellectuelle. Cela inclut :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Les modèles de CV et lettres de motivation</li>
                                    <li>Les textes et images du site</li>
                                    <li>Le logo et les éléments graphiques</li>
                                    <li>Le code source et les fonctionnalités</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Tarification et Paiement</h2>
                                <p className="text-gray-600 mb-4">
                                    Les modalités de paiement sont les suivantes :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Version de base gratuite</li>
                                    <li>Tarifs premium clairement affichés</li>
                                    <li>Paiements sécurisés (Mobile Money, Orange Money, Paypal)</li>
                                    <li>Remboursement selon conditions spécifiques</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. Protection des Données</h2>
                                <p className="text-gray-600 mb-4">
                                    Nous nous engageons à :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Protéger vos informations personnelles</li>
                                    <li>Respecter la confidentialité de vos données</li>
                                    <li>Sécuriser vos informations de paiement</li>
                                    <li>Ne pas partager vos données sans autorisation</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">7. Modifications des Services</h2>
                                <p className="text-gray-600 mb-4">
                                    Guidy se réserve le droit de :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>Modifier les fonctionnalités du service</li>
                                    <li>Mettre à jour les tarifs</li>
                                    <li>Améliorer les modèles de CV</li>
                                    <li>Adapter les services aux besoins du marché</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">8. Résiliation</h2>
                                <p className="text-gray-600 mb-4">
                                    Conditions de résiliation :
                                </p>
                                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                                    <li>À l'initiative de l'utilisateur à tout moment</li>
                                    <li>En cas de violation des conditions d'utilisation</li>
                                    <li>Pour non-paiement des services premium</li>
                                    <li>En cas de force majeure</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">9. Contact et Support</h2>
                                <p className="text-gray-600 mb-4">
                                    Notre équipe est disponible pour vous aider :
                                </p>
                                <ul className="list-none text-gray-600 space-y-2">
                                    <li>WhatsApp : +237693427913</li>
                                    <li>Email : guidy.makeitreall@gmail.com</li>
                                    <li>Assistance disponible en français et en anglais</li>
                                    <li>Support technique 7j/7</li>
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

export default TermsOfService;
