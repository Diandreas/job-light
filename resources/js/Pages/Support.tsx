import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { MessageSquare, Mail, Phone, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';

const SupportPage = () => {
    const contactMethods = [
        {
            icon: Phone,
            title: "WhatsApp Support",
            description: "Get instant help via WhatsApp",
            contact: "+237693427913",
            action: () => window.open("https://wa.me/237693427913", "_blank"),
            availability: "Disponible 24/7"
        },
        {
            icon: Mail,
            title: "Email Support",
            description: "Send us a detailed message",
            contact: "guidy.makeitreall@gmail.com",
            action: () => window.location.href = "mailto:guidy.makeitreall@gmail.com",
            availability: "Réponse sous 24h"
        }
    ];

    const ContactCard = ({ icon: Icon, title, description, contact, action, availability }) => (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 overflow-hidden group cursor-pointer"
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
                <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-600 transition-colors">{title}</h3>
                <p className="text-gray-600 mb-4">{description}</p>
                <p className="text-lg font-medium text-amber-600">{contact}</p>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    {availability}
                </div>
            </div>
        </motion.div>
    );

    return (
        <GuestLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
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
            <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
              🤝 Nous sommes là pour vous aider
            </span>
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                        Support & Assistance
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre parcours professionnel
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {contactMethods.map((method, index) => (
                        <ContactCard key={index} {...method} />
                    ))}
                </div>

                <Card className="mb-16">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-center">Heures de Support</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-600">
                            Notre équipe de support est disponible pour vous assister du lundi au vendredi, de 9h à 18h.
                            Pour les demandes urgentes, notre support WhatsApp est accessible 24/7.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
        </GuestLayout>
    );
};

export default SupportPage;
