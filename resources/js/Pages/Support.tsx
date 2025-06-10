import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { MessageSquare, Mail, Phone, Clock, ChevronRight, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';
import { useTranslation } from 'react-i18next';
import { Head } from '@inertiajs/react';

const SupportPage = () => {
    const { t } = useTranslation();

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": t('pages.support.metaTitle'),
        "description": t('pages.support.metaDescription'),
        "publisher": {
            "@type": "Organization",
            "name": "Guidy",
            "logo": {
                "@type": "ImageObject",
                "url": "../../public/logo.png"
            }
        }
    };

    const contactMethods = [
        {
            icon: Phone,
            title: t('pages.support.contactMethods.whatsapp.title'),
            description: t('pages.support.contactMethods.whatsapp.description'),
            contact: "+237693427913",
            action: () => window.open("https://wa.me/237693427913", "_blank"),
            availability: t('pages.support.contactMethods.whatsapp.availability')
        },
        {
            icon: Mail,
            title: t('pages.support.contactMethods.email.title'),
            description: t('pages.support.contactMethods.email.description'),
            contact: "guidy.makeitreall@gmail.com",
            action: () => window.location.href = "mailto:guidy.makeitreall@gmail.com",
            availability: t('pages.support.contactMethods.email.availability')
        },
        {
            icon: Youtube,
            title: "Tutoriels YouTube",
            description: "Découvrez nos tutoriels détaillés et guides vidéo pour maîtriser toutes les fonctionnalités",
            contact: "@GUIDY-x9y",
            action: () => window.open("https://www.youtube.com/@GUIDY-x9y", "_blank"),
            availability: "Nouvelles vidéos chaque semaine"
        }
    ];

    const ContactCard = ({ icon: Icon, title, description, contact, action, availability }) => (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group cursor-pointer"
            onClick={action}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 transform group-hover:rotate-6 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
                <p className="text-lg font-medium text-amber-600 dark:text-amber-400">{contact}</p>
                <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {availability}
                </div>
            </div>
        </motion.div>
    );

    return (
        <GuestLayout>
            <Head>
                <title>{t('pages.support.metaTitle')}</title>
                <meta name="description" content={t('pages.support.metaDescription')} />
                <meta name="keywords" content={t('pages.support.metaKeywords')} />
                <meta property="og:title" content={t('pages.support.title')} />
                <meta property="og:description" content={t('pages.support.subtitle')} />
                <meta property="og:image" content="../../public/image.png" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://guidy.com/support" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6"
                        >
                            <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full text-sm font-medium">
                                {t('pages.support.badge')}
                            </span>
                        </motion.div>
                        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                            {t('pages.support.title')}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                            {t('pages.support.description')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {contactMethods.map((method, index) => (
                            <ContactCard key={index} {...method} />
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <Card className="mb-16 dark:bg-gray-800 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-2xl rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5"></div>
                            <CardHeader className="relative z-10 pb-6">
                                <CardTitle className="text-3xl font-bold text-center dark:text-white flex items-center justify-center space-x-3">
                                    <Clock className="w-8 h-8 text-amber-500" />
                                    <span>{t('pages.support.supportHours.title')}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center relative z-10">
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-700">
                                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {t('pages.support.supportHours.description')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default SupportPage;
