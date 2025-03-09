import React, { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';

import { useTranslation } from 'react-i18next';
import {
    FileText, Brain, PenTool, MessageSquare,
    Sparkles, ArrowRight, Star, ChevronRight,
    Users, Award, Trophy, Terminal, Globe, Mail
} from 'lucide-react';
import { cn } from "@/lib/utils";
import Dropdown from '@/Components/Dropdown';

const LanguageSelector = () => {
    const { t, i18n } = useTranslation();

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors">
                    <Globe className="h-5 w-5" />
                    <span className="font-medium">{i18n.language === 'fr' ? 'FR' : 'EN'}</span>
                </button>
            </Dropdown.Trigger>
            <Dropdown.Content>
                <div className="bg-white rounded-lg w-32 shadow-lg">
                    <button
                        onClick={() => i18n.changeLanguage('fr')}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            i18n.language === 'fr'
                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                : "text-gray-700 hover:bg-amber-50"
                        )}
                    >
                        <span className="font-medium">Français</span>
                        {i18n.language === 'fr' && (
                            <motion.div
                                layoutId="activeLang"
                                className="ml-auto w-2 h-2 rounded-full bg-white"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => i18n.changeLanguage('en')}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                            i18n.language === 'en'
                                ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white"
                                : "text-gray-700 hover:bg-amber-50"
                        )}
                    >
                        <span className="font-medium">English</span>
                        {i18n.language === 'en' && (
                            <motion.div
                                layoutId="activeLang"
                                className="ml-auto w-2 h-2 rounded-full bg-white"
                            />
                        )}
                    </button>
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
};

const AnimatedCounter = ({ target, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        const updateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setCount(Math.floor(target * percentage));

            if (percentage < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }, [target, duration]);

    return <span>{count.toLocaleString()}+</span>;
};

const FeatureCard = ({ icon: Icon, title, description, action, link }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-white rounded-xl p-6 shadow-lg border border-gray-100 overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500 transform group-hover:rotate-6 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-600 transition-colors">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={link} className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium group">
                {action}
                <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    </motion.div>
);

const StatisticCard = ({ icon: Icon, value, label }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
    >
        <Icon className="w-8 h-8 text-amber-500 mb-4" />
        <div className="text-3xl font-bold text-gray-800 mb-2">
            <AnimatedCounter target={value} />
        </div>
        <p className="text-gray-600">{label}</p>
    </motion.div>
);

export default function Welcome() {
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
    const { t } = useTranslation();
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Guidy",
        "description": "Assistant IA pour la création de CV et le développement de carrière",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "creator": {
            "@type": "Organization",
            "name": "Guidy",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+237693427913",
                "contactType": "customer service",
                "email": "guidy.makeitreall@gmail.com",
                "availableLanguage": ["French", "English"]
            }
        }
    };
    const features = [
        {
            icon: FileText,
            title: t('features.cv_designer.title'),
            description: t('features.cv_designer.description'),
            action: t('features.cv_designer.action'),
            link: route('register')
        },
        {
            icon: Brain,
            title: t('features.career_advisor.title'),
            description: t('features.career_advisor.description'),
            action: t('features.career_advisor.action'),
            link: route('register')
        },
        {
            icon: PenTool,
            title: t('features.cover_letter.title'),
            description: t('features.cover_letter.description'),
            action: t('features.cover_letter.action'),
            link: route('register')
        },
        {
            icon: MessageSquare,
            title: t('features.interview_coach.title'),
            description: t('features.interview_coach.description'),
            action: t('features.interview_coach.action'),
            link: route('register')
        }
    ];

    const statistics = [
        {
            icon: Users,
            value: 50000,
            label: t('stats.users')
        },
        {
            icon: Award,
            value: 95,
            label: t('stats.satisfaction')
        },
        {
            icon: Trophy,
            value: 75000,
            label: t('stats.cvs')
        },
        {
            icon: Terminal,
            value: 99,
            label: t('stats.availability')
        }
    ];

    return (
        <GuestLayout>

            <Head>
                {/* Balises Titre et Description de Base (Bilingues et Optimisées) */}
                <title>Guidy | Créez un CV Professionnel en 5 Minutes avec l'IA | Resume Builder</title>
                <meta name="description" content="Créez gratuitement un CV optimisé ATS avec notre IA. Templates internationaux, conseils de carrière personnalisés et préparation aux entretiens. Available in English. Professional resumes in minutes!" />
                <meta name="keywords" content="CV IA, CV ATS, resume builder, AI CV, lettre de motivation, cover letter, préparation entretien, interview preparation, template CV, modèle CV, international resume, conseil carrière, career advice, emploi international, global job search, CV Canada, CV France, CV USA, Africa CV, UK resume, carrieres internationales, CV francophone, anglophone CV" />

                {/* Balises de contrôle et techniques */}
                <meta charSet="utf-8" />

                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1, noodp, noydir" />
                <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
                <meta name="google" content="nositelinkssearchbox" />
                <meta name="author" content="Guidy" />
                <meta name="generator" content="Guidy AI Resume Platform" />
                <meta name="application-name" content="Guidy" />
                <meta name="apple-mobile-web-app-title" content="Guidy" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#F59E0B" />
                <meta name="msapplication-TileColor" content="#F59E0B" />
                <meta name="msapplication-navbutton-color" content="#F59E0B" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="google" content="notranslate" />
                <meta name="HandheldFriendly" content="true" />
                <meta name="referrer" content="no-referrer-when-downgrade" />
                <meta name="revisit-after" content="7 days" />
                <meta name="rating" content="general" />
                <meta name="copyright" content="© 2025 Guidy" />

                {/* Canonical - URL unique */}
                <link rel="canonical" href="https://guidy.com" />

                {/* Balises régionales et géographiques */}
                <meta name="geo.placename" content="Worldwide" />
                <meta name="geo.region" content="US, CA, FR, CM, GB, BE, CH, SN, CI, IN, NG, AU" />
                <meta name="geo.position" content="0;0" />
                <meta name="ICBM" content="0, 0" />
                <meta name="language" content="English, French" />

                {/* Open Graph / Facebook avec chemins corrects pour les images */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Guidy" />
                <meta property="og:title" content="Guidy | Créez un CV professionnel en 5 min | Create your resume now" />
                <meta property="og:description" content="Utilisez l'IA pour créer un CV optimisé pour les recruteurs et ATS. Templates pour tous les pays, conseils personnalisés. Available in English/French. 100% Free!" />
                <meta property="og:url" content="https://guidy.com" />
                <meta property="og:image" content="/image.png" />
                <meta property="og:image:secure_url" content="/image.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Guidy AI Resume Builder Interface" />
                <meta property="og:locale" content="fr_FR" />
                <meta property="og:locale:alternate" content="en_US" />

                {/* Twitter Card avec chemins corrects pour les images */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@guidyai" />
                <meta name="twitter:creator" content="@guidyai" />
                <meta name="twitter:title" content="Guidy - AI Resume Builder | Ready in 5 Minutes | 100% Free" />
                <meta name="twitter:description" content="Create ATS-optimized resumes with AI guidance. 50+ templates for every country. Boost your job applications with Guidy. French & English available!" />
                <meta name="twitter:image" content="/image.png" />
                <meta name="twitter:image:alt" content="Guidy Resume Builder Interface" />
                <meta name="twitter:label1" content="Available in" />
                <meta name="twitter:data1" content="English & French" />
                <meta name="twitter:label2" content="Perfect for" />
                <meta name="twitter:data2" content="Global Job Seekers" />

                {/* Autres réseaux sociaux et plateformes */}
                <meta property="linkedin:title" content="Guidy - Create Your Professional Resume in 5 Minutes | AI-Powered" />
                <meta property="linkedin:description" content="AI-powered resume creation and career development platform. Optimize your job search with Guidy's professional templates." />
                <meta property="linkedin:image" content="/image.png" />

                {/* Partage Messaging Apps */}
                <meta property="og:whatsapp:title" content="Guidy - Créateur de CV IA" />
                <meta property="og:whatsapp:text" content="Crée ton CV professionnel en 5 minutes avec l'IA! CV optimisé pour tous les pays." />

                {/* Balises supplémentaires pour mobile et PWA */}
                <meta name="format-detection" content="email=no,address=no,date=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-tap-highlight" content="no" />
                <meta name="msapplication-starturl" content="https://guidy.com" />

                {/* Préchargement de ressources */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://www.google-analytics.com" />
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
                <link rel="dns-prefetch" href="https://www.google-analytics.com" />
                <link rel="preload" href="/image.png" as="image" fetchPriority="high" />

                {/* Favicon et App Icons avec vos fichiers actuels */}
                <link rel="icon" href="/ai.png" />
                <link rel="apple-touch-icon" href="/ai.png" />

                {/* Données structurées principales pour l'application web */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "Guidy - Global AI Resume Builder & Career Assistant",
                        "alternateName": ["Guidy - Assistant CV IA", "Guidy - Career Builder", "Guidy - Créateur de CV", "Guidy - AI Job Coach"],
                        "url": "https://guidy.com",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "/logo.png"
                        },
                        "description": "Create professional resumes and advance your career with personalized AI guidance. Available in English and French worldwide with region-specific optimization.",
                        "applicationCategory": ["CareerDevelopment", "BusinessApplication", "LifestyleApplication"],
                        "operatingSystem": ["Web", "iOS PWA", "Android PWA"],
                        "offers": {
                            "@type": "AggregateOffer",
                            "highPrice": "0",
                            "lowPrice": "0",
                            "priceCurrency": "USD",
                            "offerCount": "4",
                            "offers": [
                                {
                                    "@type": "Offer",
                                    "name": "North America",
                                    "description": "Region-optimized resume templates for US and Canadian job markets",
                                    "areaServed": ["US", "CA"]
                                },
                                {
                                    "@type": "Offer",
                                    "name": "Europe",
                                    "description": "EU-compliant CV formats with multilingual support",
                                    "areaServed": ["FR", "BE", "CH", "LU", "DE", "ES", "IT", "NL"]
                                },
                                {
                                    "@type": "Offer",
                                    "name": "Africa",
                                    "description": "Specialized templates for African job markets with regional optimization",
                                    "areaServed": ["CM", "SN", "CI", "BF", "ML", "NE", "TG", "BJ", "GA", "CG", "CD", "MG", "MA", "DZ", "TN"]
                                },
                                {
                                    "@type": "Offer",
                                    "name": "Global English Markets",
                                    "description": "International CV formats following anglo-saxon standards",
                                    "areaServed": ["GB", "AU", "NZ", "IN", "NG", "GH", "KE", "ZA", "SG", "MY", "PH"]
                                }
                            ]
                        },
                        "availableLanguage": ["en", "fr"],
                        "inLanguage": [
                            {
                                "@type": "Language",
                                "name": "English",
                                "alternateName": "en"
                            },
                            {
                                "@type": "Language",
                                "name": "French",
                                "alternateName": "fr"
                            }
                        ],
                        "featureList": [
                            "AI Resume Builder with ATS Optimization",
                            "Career Path Analysis & Recommendations",
                            "Interview Preparation & Mock Interviews",
                            "Cover Letter Generator with AI Customization",
                            "Skill Assessment & Gap Analysis",
                            "Job Market Insights by Region"
                        ],
                        "screenshot": [
                            {
                                "@type": "ImageObject",
                                "url": "/image.png",
                                "caption": "Guidy AI Resume Builder Interface"
                            }
                        ],
                        "review": {
                            "@type": "AggregateRating",
                            "ratingValue": "4.8",
                            "ratingCount": "1250",
                            "bestRating": "5",
                            "worstRating": "1"
                        },
                        "creator": {
                            "@type": "Organization",
                            "name": "Guidy AI",
                            "url": "https://guidy.com",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "/logo.png"
                            },
                            "contactPoint": {
                                "@type": "ContactPoint",
                                "telephone": "+237693427913",
                                "contactType": "customer service",
                                "email": "guidy.makeitreall@gmail.com",
                                "availableLanguage": ["French", "English"]
                            }
                        },
                        "potentialAction": {
                            "@type": "UseAction",
                            "target": {
                                "@type": "EntryPoint",
                                "urlTemplate": "https://guidy.com/register",
                                "actionPlatform": [
                                    "http://schema.org/DesktopWebPlatform",
                                    "http://schema.org/MobileWebPlatform"
                                ]
                            },
                            "expectsAcceptanceOf": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            }
                        }
                    })}
                </script>

                {/* Données structurées FAQ bilingue */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Comment fonctionne le créateur de CV IA de Guidy?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Guidy utilise l'IA avancée pour analyser votre expérience professionnelle et créer des CV adaptés à votre région et secteur cibles. Saisissez simplement vos informations, sélectionnez vos préférences, et notre IA génère des CV professionnels compatibles ATS en quelques minutes. Nos templates sont optimisés pour maximiser votre taux de réponse."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How does Guidy's AI resume builder work?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Guidy uses advanced AI to analyze your professional experience and create tailored resumes optimized for your target region and industry. Simply input your details, select your preferences, and our AI generates professional, ATS-friendly resumes in minutes. Our templates are optimized to maximize your response rate from recruiters."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Est-ce que Guidy est disponible dans mon pays?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Oui! Guidy est disponible dans le monde entier avec des optimisations spécifiques pour l'Amérique du Nord, l'Europe, l'Afrique et les marchés anglophones mondiaux. Notre plateforme prend en charge l'anglais et le français avec des modèles adaptés à chaque région, respectant les normes locales de recrutement."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is Guidy available in my country?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes! Guidy is available worldwide with specific optimizations for North America, Europe, Africa, and global English-speaking markets. Our platform supports English and French languages with region-specific templates that follow local recruitment standards and employer expectations."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Est-ce que Guidy est gratuit?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Oui, Guidy propose une version gratuite qui vous permet de créer des CV professionnels et d'accéder aux fonctionnalités de base. Vous pouvez créer autant de CV que vous souhaitez, les télécharger en PDF et accéder à nos conseils de base sans frais. Des options premium sont disponibles pour des fonctionnalités avancées."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is Guidy free to use?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes, Guidy offers a free version that allows you to create professional resumes and access basic features. You can create as many resumes as you want, download them as PDFs, and access our basic career advice at no cost. Premium options are available for advanced features and personalized guidance."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Les CV créés avec Guidy sont-ils optimisés pour les ATS?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Absolument! Tous nos modèles de CV sont conçus pour être parfaitement compatibles avec les systèmes ATS (Applicant Tracking Systems) utilisés par les recruteurs. Notre IA analyse les offres d'emploi pour suggérer les mots-clés pertinents à inclure dans votre CV, augmentant ainsi vos chances de passer les filtres automatiques."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Are Guidy's resumes optimized for ATS?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Absolutely! All our resume templates are designed to be fully compatible with Applicant Tracking Systems (ATS) used by recruiters. Our AI analyzes job postings to suggest relevant keywords to include in your resume, increasing your chances of passing automated filters and reaching the interview stage."
                                }
                            }
                        ]
                    })}
                </script>

                {/* Données structurées Organisation */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Guidy",
                        "url": "https://guidy.com",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "/logo.png"
                        },
                        "slogan": "Your AI Career Partner",
                        "description": "Guidy provides AI-powered career tools including resume building, interview preparation, and personalized career advice.",
                        "email": "guidy.makeitreall@gmail.com",
                        "telephone": "+237693427913",
                        "contactPoint": [
                            {
                                "@type": "ContactPoint",
                                "telephone": "+237693427913",
                                "contactType": "customer service",
                                "email": "guidy.makeitreall@gmail.com",
                                "availableLanguage": ["French", "English"]
                            }
                        ]
                    })}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "url": "https://guidy.com",
                        "name": "Guidy - AI Resume Builder",
                        "alternateName": "Guidy - Créateur de CV IA",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://guidy.com/search?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        },
                        "hasPart": [
                            {
                                "@type": "WebPage",
                                "isPartOf": {
                                    "@id": "https://guidy.com"
                                },
                                "name": "CV Creator",
                                "url": "https://guidy.com/create-cv"
                            },
                            {
                                "@type": "WebPage",
                                "isPartOf": {
                                    "@id": "https://guidy.com"
                                },
                                "name": "Cover Letter Generator",
                                "url": "https://guidy.com/cover-letter"
                            },
                            {
                                "@type": "WebPage",
                                "isPartOf": {
                                    "@id": "https://guidy.com"
                                },
                                "name": "Interview Preparation",
                                "url": "https://guidy.com/interview"
                            }
                        ]
                    })}
                </script>

                {/* Données structurées pour les statistiques */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Dataset",
                        "name": "Guidy Platform Statistics",
                        "description": "Key performance metrics for the Guidy AI Resume Platform",
                        "keywords": ["resume builder statistics", "career assistance metrics", "user satisfaction", "platform metrics"],
                        "creator": {
                            "@type": "Organization",
                            "name": "Guidy",
                            "url": "https://guidy.com"
                        },
                        "variableMeasured": [
                            {
                                "@type": "PropertyValue",
                                "name": "Active Users",
                                "value": "50000+"
                            },
                            {
                                "@type": "PropertyValue",
                                "name": "User Satisfaction",
                                "value": "95%"
                            },
                            {
                                "@type": "PropertyValue",
                                "name": "CVs Created",
                                "value": "75000+"
                            },
                            {
                                "@type": "PropertyValue",
                                "name": "Platform Availability",
                                "value": "99%"
                            }
                        ]
                    })}
                </script>
            </Head>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">


                <main className="pt-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            className="text-center mb-16"
                            style={{ opacity, y }}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="mb-6"
                            >
                                <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                                    {t('hero.badge')}
                                </span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-6xl font-bold mb-6 bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text"
                            >
                                {t('hero.title')}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
                            >
                                {t('hero.description')}
                            </motion.p>
                            <motion.div
                                className="flex justify-center space-x-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center px-8 py-4 rounded-full text-lg font-medium bg-gradient-to-r from-amber-500 to-purple-500 text-white hover:from-amber-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <FileText className="w-5 h-5 mr-2" />
                                    {t('nav.start_free')}
                                </Link>
                            </motion.div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            {features.map((feature, index) => (
                                <FeatureCard
                                    key={index}
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                    action={feature.action}
                                    link={feature.link}
                                />
                            ))}
                        </div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            {statistics.map((stat, index) => (
                                <StatisticCard
                                    key={index}
                                    icon={stat.icon}
                                    value={stat.value}
                                    label={stat.label}
                                />
                            ))}
                        </motion.div>

                        <div className="text-center pb-16">
                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                                    {t('cta.badge')}
                                </span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center bg-gradient-to-r from-amber-500 to-purple-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-amber-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Star className="w-5 h-5 mr-2" />
                                    {t('cta.button')}
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-100">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                    <span className="font-bold text-xl bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                        {t('brand')}
                                    </span>
                                </div>
                                <div className="flex space-x-4">
                                    <a
                                        href="mailto:guidy.makeitreall@gmail.com"
                                        className="text-gray-400 hover:text-amber-500"
                                    >
                                        <Mail className="h-6 w-6" />
                                    </a>
                                    <a
                                        href="https://wa.me/237693427913"
                                        className="text-gray-400 hover:text-amber-500"
                                    >
                                        <MessageSquare className="h-6 w-6" />
                                    </a>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">{t('footer.services.title')}</h3>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link href="#" className="text-gray-500 hover:text-amber-600">
                                            {t('footer.services.resume')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-gray-500 hover:text-amber-600">
                                            {t('footer.services.advisor')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-gray-500 hover:text-amber-600">
                                            {t('footer.services.interview')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-600">{t('footer.legal.title')}</h3>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link href="/privacy" className="text-gray-500 hover:text-amber-600">
                                            {t('footer.legal.privacy')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/terms" className="text-gray-500 hover:text-amber-600">
                                            {t('footer.legal.terms')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/cookies" className="text-gray-500 hover:text-amber-600">
                                            {t('footer.legal.cookies')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mentions-legales" className="text-gray-500 hover:text-amber-600">
                                            {t('footer.legal.mentions')}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <p className="text-center text-gray-400">
                                © {new Date().getFullYear()} {t('brand')}. {t('footer.copyright')}
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </GuestLayout>
    );
}
