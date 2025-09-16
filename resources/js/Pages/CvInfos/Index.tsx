import React, { useState, useCallback, useEffect, ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import {
    User, FileText, Briefcase, Code, GraduationCap, Heart,
    ChevronRight, ChevronLeft, Mail, Phone, MapPin, Linkedin,
    Github, PencilIcon, Sparkles, CircleChevronRight, Star,
    Camera, Upload, FileUp, Bot, AlertCircle, X, Plus, Menu, Coins, Trash2, Globe,
    ArrowRight, Play, SkipForward, HelpCircle, Check, Eye,
    Loader2, RefreshCw, RotateCcw, Settings
} from 'lucide-react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { useToast } from '@/Components/ui/use-toast';
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/Components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Progress } from "@/Components/ui/progress";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Separator } from "@/Components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

import PersonalInformationEdit from '@/Pages/CvInfos/Partials/PersonnalInfosEdit';
import CompetenceManager from '@/Pages/CvInfos/Partials/CompetenceManager';
import HobbyManager from '@/Pages/CvInfos/Partials/HobbyManager';
import ProfessionManager from '@/Pages/CvInfos/Partials/ProfessionManager';
import ExperienceManager from "@/Pages/CvInfos/Partials/ExperienceManager";
import SummaryManager from '@/Pages/CvInfos/Partials/SummaryManager';
import LanguageManager from '@/Pages/CvInfos/Partials/LanguageManager';
import LivePreview from '@/Components/cv/LivePreview';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cn } from '@/lib/utils';

const getSidebarItems = (t: any) => [
    { id: 'personalInfo', label: t('cvInterface.sidebar.personalInfo'), icon: User, color: 'text-amber-500' },
    { id: 'summary', label: t('cvInterface.sidebar.summary'), icon: FileText, color: 'text-purple-500' },
    { id: 'experience', label: t('cvInterface.sidebar.experience'), icon: Briefcase, color: 'text-amber-600' },
    { id: 'profession', label: t('cvInterface.sidebar.profession'), icon: GraduationCap, color: 'text-amber-500' },
    { id: 'skills', label: t('cvInterface.sidebar.skills'), icon: Code, color: 'text-purple-600' }
];

const getPersonalInfoFields = (t: any) => [
    { label: t('cvInterface.personalInfo.email'), key: "email", icon: Mail },
    { label: t('cvInterface.personalInfo.phone'), key: "phone", icon: Phone },
    { label: t('cvInterface.personalInfo.address'), key: "address", icon: MapPin },
    { label: t('cvInterface.personalInfo.linkedin'), key: "linkedin", icon: Linkedin },
    { label: t('cvInterface.personalInfo.github'), key: "github", icon: Github }
];

// Hook pour gérer le scroll et le positionnement avec sélecteurs dynamiques et stabilité
const useElementPosition = (targetSelector: string | null, isNavigationStep: boolean = false) => {
    const [elementRect, setElementRect] = useState<DOMRect | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const updatePosition = useCallback(() => {
        if (!targetSelector) {
            setElementRect(null);
            setIsVisible(false);
            return;
        }

        // Fonction pour essayer plusieurs stratégies de sélection
        const findElement = () => {
            // Stratégie 1: Sélecteur direct
            let element = document.querySelector(targetSelector);

            if (!element) {
                // Stratégie 2: Sélecteurs alternatifs selon les cas
                if (targetSelector.includes('sidebar')) {
                    // Essayer de cibler directement les barres latérales visibles
                    if (targetSelector.includes('w-11')) {
                        // Mobile sidebar
                        element = document.querySelector('[data-tutorial="sidebar"].w-11') ||
                            document.querySelector('[data-tutorial="sidebar"]:not(.hidden)');
                    } else {
                        // Desktop sidebar
                        element = document.querySelector('[data-tutorial="sidebar"].hidden.md\\:block') ||
                            document.querySelector('[data-tutorial="sidebar"].hidden');
                    }
                } else if (targetSelector.includes('nav') && targetSelector.includes('mx-auto')) {
                    // Pour la navbar desktop
                    element = document.querySelector('nav .mx-auto') ||
                        document.querySelector('nav .container') ||
                        document.querySelector('nav div:first-child');
                } else if (targetSelector.includes('sticky.top-12')) {
                    // Pour la navigation CV mobile
                    element = document.querySelector('.sticky.top-12') ||
                        document.querySelector('.sticky[class*="top-"]') ||
                        document.querySelector('.bg-white\\/80.dark\\:bg-gray-900\\/90');
                } else if (targetSelector.includes('aside.hidden.md')) {
                    // Pour la sidebar CV desktop
                    element = document.querySelector('aside.hidden.md\\:block') ||
                        document.querySelector('aside[class*="hidden"][class*="md:block"]') ||
                        document.querySelector('aside .sticky');
                } else if (targetSelector.includes('mobile-tab-bar')) {
                    // Pour la TabBar mobile avec classe spécifique
                    element = document.querySelector('.mobile-tab-bar') ||
                        document.querySelector('[class*="mobile-tab-bar"]');
                }
            }

            if (!element) {
                // Stratégie 3: Fallback plus générique
                if (targetSelector.includes('sidebar')) {
                    element = document.querySelector('[data-tutorial="sidebar"]');
                } else if (targetSelector.includes('nav')) {
                    element = document.querySelector('nav') || document.querySelector('.sticky.top-0');
                } else if (targetSelector.includes('sticky')) {
                    element = document.querySelector('.sticky') || document.querySelector('[class*="sticky"]');
                } else if (targetSelector.includes('aside')) {
                    element = document.querySelector('aside') || document.querySelector('[class*="w-48"]');
                } else if (targetSelector.includes('mobile-tab-bar')) {
                    // Pour la TabBar mobile - chercher la classe spécifique
                    element = document.querySelector('.mobile-tab-bar') ||
                        document.querySelector('[class*="mobile-tab"]');
                }
            }

            return element;
        };

        const element = findElement();

        if (element) {
            const rect = element.getBoundingClientRect();
            setElementRect(rect);

            // Vérifier si l'élément est visible dans le viewport avec plus de tolérance
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const threshold = 150; // Zone de tolérance augmentée

            const isInView = rect.top >= -threshold && rect.left >= -threshold &&
                rect.bottom <= windowHeight + threshold && rect.right <= windowWidth + threshold &&
                rect.width > 0 && rect.height > 0; // S'assurer que l'élément a une taille

            if (!isInView || rect.width === 0 || rect.height === 0) {
                // Ne pas faire de scroll automatique pour l'étape navigation pour éviter les changements
                if (!isNavigationStep) {
                    // Faire défiler pour rendre l'élément visible
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });

                    // Attendre que le scroll soit terminé pour mettre à jour la position
                    setTimeout(() => {
                        const newRect = element.getBoundingClientRect();
                        if (newRect.width > 0 && newRect.height > 0) {
                            setElementRect(newRect);
                            setIsVisible(true);
                        }
                    }, 600); // Temps plus long pour le scroll
                } else {
                    // Pour navigation, accepter la position actuelle
                    setIsVisible(true);
                }
            } else {
                setIsVisible(true);
            }
        } else {
            // L'élément n'existe pas encore, attendre un peu et réessayer
            let retryCount = 0;
            const maxRetries = isNavigationStep ? 5 : 10; // Moins de retries pour navigation

            const retryFind = () => {
                if (retryCount >= maxRetries) {
                    console.warn('Impossible de trouver l\'élément:', targetSelector);
                    setElementRect(null);
                    setIsVisible(false);
                    return;
                }

                retryCount++;
                setTimeout(() => {
                    const retryElement = findElement();
                    if (retryElement) {
                        const rect = retryElement.getBoundingClientRect();
                        if (rect.width > 0 && rect.height > 0) {
                            setElementRect(rect);
                            setIsVisible(true);
                        } else {
                            retryFind(); // Réessayer si l'élément n'a pas de taille
                        }
                    } else {
                        retryFind(); // Réessayer si l'élément n'existe toujours pas
                    }
                }, 100 * retryCount); // Délai progressif
            };

            retryFind();
        }
    }, [targetSelector, isNavigationStep]);

    useEffect(() => {
        updatePosition();

        // Pas d'event listeners pour les changements automatiques sur l'étape navigation
        if (isNavigationStep) {
            return;
        }

        const handleResize = () => updatePosition();
        const handleScroll = () => updatePosition();

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [updatePosition, isNavigationStep]);

    return { elementRect, isVisible, updatePosition };
};

// Composant pour l'overlay avec trou
const TutorialOverlay = ({ targetRect, children }: { targetRect: DOMRect | null, children: ReactNode }) => {
    if (!targetRect) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" style={{ zIndex: 9998 }}>
                {children}
            </div>
        );
    }

    // Calculer les dimensions pour créer le "trou" avec plus de padding pour certains éléments
    const padding = 12; // Augmenté pour une meilleure visibilité
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const width = targetRect.width + (padding * 2);
    const height = targetRect.height + (padding * 2);

    // Style pour créer l'effet de masque avec clip-path
    const maskStyle = {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(1px)',
        clipPath: `polygon(
            0% 0%,
            0% 100%,
            ${Math.max(0, x)}px 100%,
            ${Math.max(0, x)}px ${Math.max(0, y)}px,
            ${Math.min(window.innerWidth, x + width)}px ${Math.max(0, y)}px,
            ${Math.min(window.innerWidth, x + width)}px ${Math.min(window.innerHeight, y + height)}px,
            ${Math.max(0, x)}px ${Math.min(window.innerHeight, y + height)}px,
            ${Math.max(0, x)}px 100%,
            100% 100%,
            100% 0%
        )`,
        zIndex: 9998
    };

    // Ajouter un contour doré autour de l'élément highlighted
    const highlightStyle = {
        position: 'fixed' as const,
        top: Math.max(0, y),
        left: Math.max(0, x),
        width: Math.min(window.innerWidth - Math.max(0, x), width),
        height: Math.min(window.innerHeight - Math.max(0, y), height),
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
        zIndex: 9999,
        pointerEvents: 'none' as const,
        animation: 'pulse 2s infinite'
    };

    return (
        <>
            <div style={maskStyle} />
            <div style={highlightStyle} />
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
                {children}
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 25px rgba(245, 158, 11, 0.6);
                    }
                }
            `}</style>
        </>
    );
};

// Composant Tutoriel amélioré
const Tutorial = ({ isVisible, onComplete, currentSection, onNavigateToSection }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const tutorialSteps = [
        {
            id: 'welcome',
            title: t('tutorial.welcome.title'),
            description: t('tutorial.welcome.description'),
            target: null,
            action: null
        },
        {
            id: 'navbar',
            title: t('tutorial.navbar.title'),
            description: t('tutorial.navbar.description'),
            target: () => isMobile ? null : 'nav .mx-auto', // Cibler la navbar principale
            action: null,
            skipOnMobile: true
        },
        {
            id: 'cvNavigation',
            title: t('tutorial.cvNavigation.title'),
            description: t('tutorial.cvNavigation.description'),
            target: () => isMobile
                ? '.sticky.top-12' // Mobile CV nav
                : 'aside.hidden.md\\:block', // Desktop CV sidebar
            action: null
        },
        {
            id: 'progress',
            title: t('tutorial.progress.title'),
            description: t('tutorial.progress.description'),
            target: '[data-tutorial="progress"]',
            action: null
        },
        {
            id: 'import',
            title: t('tutorial.import.title'),
            description: t('tutorial.import.description'),
            target: '[data-tutorial="import"]',
            action: null
        },
        {
            id: 'sidebar',
            title: t('tutorial.sidebar.title'),
            description: t('tutorial.sidebar.description'),
            target: () => isMobile
                ? '.w-11[data-tutorial="sidebar"]'     // Mobile sidebar spécifique
                : '.hidden.md\\:block[data-tutorial="sidebar"]',  // Desktop sidebar spécifique
            action: null
        },
        {
            id: 'personalInfo',
            title: t('tutorial.personalInfo.title'),
            description: t('tutorial.personalInfo.description'),
            target: '[data-tutorial="content"]',
            action: () => onNavigateToSection('personalInfo')
        },
        {
            id: 'navigation',
            title: t('tutorial.navigation.title'),
            description: t('tutorial.navigation.description'),
            target: '[data-tutorial="navigation"]',
            action: () => {
                // Seulement naviguer si on n'est pas déjà sur personalInfo
                if (currentSection !== 'personalInfo') {
                    onNavigateToSection('personalInfo');
                    return new Promise(resolve => {
                        setTimeout(resolve, 1200); // Temps d'attente pour le changement de section
                    });
                }
                // Si on est déjà sur la bonne section, attendre juste un peu pour la stabilité
                return new Promise(resolve => {
                    setTimeout(resolve, 300);
                });
            }
        },
        {
            id: 'tabbar',
            title: t('tutorial.tabbar.title'),
            description: t('tutorial.tabbar.description'),
            target: () => isMobile ? '.mobile-tab-bar' : null, // TabBar mobile avec classe spécifique
            action: null,
            skipOnDesktop: true
        }
    ];

    const currentStepData = tutorialSteps[currentStep];

    // Calculer le target dynamiquement
    const getTargetSelector = () => {
        if (typeof currentStepData.target === 'function') {
            return currentStepData.target();
        }
        return currentStepData.target;
    };

    // Calculer le nombre total d'étapes visibles
    const getVisibleStepsCount = () => {
        return tutorialSteps.filter(step =>
            !((isMobile && step.skipOnMobile) || (!isMobile && step.skipOnDesktop))
        ).length;
    };

    // Calculer l'index d'étape visible actuel
    const getVisibleStepIndex = () => {
        let visibleIndex = 1;
        for (let i = 0; i < currentStep; i++) {
            if (!((isMobile && tutorialSteps[i].skipOnMobile) || (!isMobile && tutorialSteps[i].skipOnDesktop))) {
                visibleIndex++;
            }
        }
        return visibleIndex;
    };

    const { elementRect, isVisible: elementVisible, updatePosition } = useElementPosition(
        getTargetSelector(),
        currentStepData.id === 'navigation'
    );

    // Détecter si on est sur mobile et forcer la mise à jour du target
    useEffect(() => {
        const checkMobile = () => {
            const newIsMobile = window.innerWidth < 768;
            if (newIsMobile !== isMobile) {
                setIsMobile(newIsMobile);
                // Forcer une mise à jour de la position quand on change de mode
                setTimeout(() => updatePosition(), 100);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [isMobile, updatePosition]);

    // Effet séparé pour gérer le skip automatique
    useEffect(() => {
        const shouldSkip = (isMobile && currentStepData.skipOnMobile) || (!isMobile && currentStepData.skipOnDesktop);

        if (shouldSkip) {
            // Sauter automatiquement cette étape
            setTimeout(() => {
                let nextStepIndex = currentStep + 1;
                while (nextStepIndex < tutorialSteps.length) {
                    const stepData = tutorialSteps[nextStepIndex];
                    if ((isMobile && stepData.skipOnMobile) || (!isMobile && stepData.skipOnDesktop)) {
                        nextStepIndex++;
                        continue;
                    }
                    break;
                }
                if (nextStepIndex < tutorialSteps.length) {
                    setCurrentStep(nextStepIndex);
                }
            }, 100);
        }
    }, [isMobile, currentStepData.skipOnMobile, currentStepData.skipOnDesktop, currentStep, tutorialSteps]);

    // Mettre à jour la position quand l'étape change ou le mode mobile change
    useEffect(() => {
        const target = getTargetSelector();
        if (target) {
            // Délai spécial pour l'étape navigation pour s'assurer de la stabilité
            const delay = currentStepData.id === 'navigation' ? 2000 : 200; // Encore plus long pour navigation
            setTimeout(() => updatePosition(), delay);
        }
    }, [currentStep, isMobile, updatePosition]);

    // Bloquer les mises à jour automatiques pendant l'étape navigation pour éviter les changements
    useEffect(() => {
        if (currentStepData.id === 'navigation') {
            // Empêcher les mises à jour automatiques de position pendant cette étape
            const interval = setInterval(() => {
                // Ne pas appeler updatePosition automatiquement sur cette étape
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentStepData.id]);

    const nextStep = async () => {
        if (currentStepData.action) {
            setIsAnimating(true);
            await currentStepData.action();
            // Attendre un peu plus longtemps pour les actions qui changent de section
            // Mais éviter updatePosition pour l'étape navigation pour éviter les conflits
            setTimeout(() => {
                setIsAnimating(false);
                if (currentStepData.id !== 'navigation') {
                    updatePosition();
                }
            }, 800); // Augmenté encore plus pour la stabilité
        }

        let nextStepIndex = currentStep + 1;

        // Sauter les étapes qui ne sont pas compatibles avec le mode actuel
        while (nextStepIndex < tutorialSteps.length) {
            const nextStepData = tutorialSteps[nextStepIndex];
            if ((isMobile && nextStepData.skipOnMobile) || (!isMobile && nextStepData.skipOnDesktop)) {
                nextStepIndex++;
                continue;
            }
            break;
        }

        if (nextStepIndex < tutorialSteps.length) {
            setCurrentStep(nextStepIndex);
        } else {
            handleComplete();
        }
    };

    const prevStep = () => {
        let prevStepIndex = currentStep - 1;

        // Sauter les étapes qui ne sont pas compatibles avec le mode actuel
        while (prevStepIndex >= 0) {
            const prevStepData = tutorialSteps[prevStepIndex];
            if ((isMobile && prevStepData.skipOnMobile) || (!isMobile && prevStepData.skipOnDesktop)) {
                prevStepIndex--;
                continue;
            }
            break;
        }

        if (prevStepIndex >= 0) {
            setCurrentStep(prevStepIndex);
        }
    };

    const skipTutorial = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('cv_tutorial_completed', 'true');
        onComplete();
    };

    const getCardPosition = () => {
        const padding = 16;
        const cardWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 350;
        const cardHeight = 400; // hauteur approximative

        // Zones de sécurité pour éviter les barres de navigation
        const topSafeZone = isMobile ? 140 : 80; // Augmenté pour mobile (navbar + cvNav)
        const bottomSafeZone = isMobile ? 140 : 20; // Augmenté pour mobile tab bar (maintenant à la fin)
        const availableHeight = window.innerHeight - topSafeZone - bottomSafeZone;

        if (!elementRect) {
            // Centrer parfaitement pour l'étape de bienvenue
            const centerX = (window.innerWidth - cardWidth) / 2;
            const centerY = isMobile
                ? topSafeZone + Math.max(50, (availableHeight - cardHeight) / 2)
                : (window.innerHeight - cardHeight) / 2;

            return {
                position: 'fixed' as const,
                top: `${Math.max(topSafeZone + padding, centerY)}px`,
                left: `${Math.max(padding, centerX)}px`,
                width: `${cardWidth}px`,
                maxWidth: 'calc(100vw - 32px)',
                pointerEvents: 'auto' as const
            };
        }

        let top: number;
        let left: number;

        if (isMobile) {
            // Sur mobile, positionner intelligemment selon l'élément ciblé
            const elementCenterY = elementRect.top + elementRect.height / 2;
            const isElementInTopHalf = elementCenterY < window.innerHeight / 2;

            if (isElementInTopHalf && elementRect.bottom + cardHeight + padding < window.innerHeight - bottomSafeZone) {
                // Placer en dessous de l'élément si possible
                top = elementRect.bottom + padding;
            } else if (!isElementInTopHalf && elementRect.top - cardHeight - padding > topSafeZone) {
                // Placer au-dessus de l'élément si possible
                top = elementRect.top - cardHeight - padding;
            } else {
                // Centrer dans l'espace disponible
                top = topSafeZone + Math.max(padding, (availableHeight - cardHeight) / 2);
            }

            left = (window.innerWidth - cardWidth) / 2;
        } else {
            // Sur desktop, positionner intelligemment autour de l'élément
            const centerX = elementRect.left + elementRect.width / 2;
            const centerY = elementRect.top + elementRect.height / 2;

            // Déterminer la meilleure position
            const spaceRight = window.innerWidth - elementRect.right;
            const spaceLeft = elementRect.left;
            const spaceBelow = window.innerHeight - elementRect.bottom;
            const spaceAbove = elementRect.top;

            // Position horizontale
            if (spaceRight >= cardWidth + padding && centerX < window.innerWidth / 2) {
                left = elementRect.right + padding;
            } else if (spaceLeft >= cardWidth + padding && centerX > window.innerWidth / 2) {
                left = elementRect.left - cardWidth - padding;
            } else {
                left = Math.max(padding, Math.min(window.innerWidth - cardWidth - padding, centerX - cardWidth / 2));
            }

            // Position verticale
            if (spaceBelow >= cardHeight + padding && centerY < window.innerHeight / 2) {
                top = Math.max(topSafeZone, elementRect.bottom + padding);
            } else if (spaceAbove >= cardHeight + padding && centerY > window.innerHeight / 2) {
                top = Math.max(topSafeZone, elementRect.top - cardHeight - padding);
            } else {
                top = Math.max(topSafeZone, Math.min(window.innerHeight - bottomSafeZone - cardHeight, centerY - cardHeight / 2));
            }
        }

        return {
            position: 'fixed' as const,
            top: `${top}px`,
            left: `${left}px`,
            width: `${cardWidth}px`,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: `${availableHeight - 32}px`,
            pointerEvents: 'auto' as const
        };
    };

    if (!isVisible) return null;

    const tutorialContent = (
        <TutorialOverlay targetRect={elementRect}>
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-0"
                style={getCardPosition()}
            >
                <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0`}>
                                <HelpCircle className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className={`font-semibold text-gray-900 dark:text-white ${isMobile ? 'text-sm' : 'text-base'} leading-tight`}>
                                    {currentStepData.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('tutorial.step')} {getVisibleStepIndex()} {t('tutorial.of')} {getVisibleStepsCount()}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={skipTutorial}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0 -mt-1 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                                className="bg-gradient-to-r from-amber-500 to-purple-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(getVisibleStepIndex() / getVisibleStepsCount()) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <p className={`text-gray-700 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>
                            {currentStepData.description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between gap-3'}`}>
                        {isMobile ? (
                            // Layout mobile : boutons empilés
                            <>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={nextStep}
                                        disabled={isAnimating}
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white h-9 border-0"
                                        size="sm"
                                    >
                                        {isAnimating ? (
                                            <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                                        ) : (getVisibleStepIndex() === getVisibleStepsCount()) ? (
                                            <Check className="w-4 h-4 mr-2" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                        )}
                                        {(getVisibleStepIndex() === getVisibleStepsCount()) ? t('tutorial.finish') : t('tutorial.next')}
                                    </Button>
                                    {currentStep > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={prevStep}
                                            disabled={isAnimating}
                                            className="h-9 border-gray-200 dark:border-gray-600"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={skipTutorial}
                                    className="text-gray-500 w-full h-8 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <SkipForward className="w-4 h-4 mr-2" />
                                    {t('tutorial.skip')}
                                </Button>
                            </>
                        ) : (
                            // Layout desktop : boutons côte à côte
                            <>
                                <div className="flex gap-2">
                                    {currentStep > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={prevStep}
                                            disabled={isAnimating}
                                            className="border-gray-200 dark:border-gray-600"
                                        >
                                            <ChevronLeft className="w-4 h-4 mr-1" />
                                            {t('tutorial.previous')}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={skipTutorial}
                                        className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <SkipForward className="w-4 h-4 mr-1" />
                                        {t('tutorial.skip')}
                                    </Button>
                                    <Button
                                        onClick={nextStep}
                                        disabled={isAnimating}
                                        className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white border-0"
                                        size="sm"
                                    >
                                        {isAnimating ? (
                                            <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-1" />
                                        ) : (getVisibleStepIndex() === getVisibleStepsCount()) ? (
                                            <Check className="w-4 h-4 mr-1" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 mr-1" />
                                        )}
                                        {(getVisibleStepIndex() === getVisibleStepsCount()) ? t('tutorial.finish') : t('tutorial.next')}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </TutorialOverlay>
    );

    // Utiliser createPortal pour rendre au niveau body
    return typeof document !== 'undefined' ? createPortal(tutorialContent, document.body) : null;
};

// Composant ImportButton pour l'utiliser dans différents endroits
const ImportButton = ({ onImport, isImporting, isCompact = false }) => {
    const { t } = useTranslation();

    return (
        <div data-tutorial="import">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={`${isCompact ? 'text-xs h-7 py-0 px-2' : 'text-xs sm:text-sm h-7 sm:h-9 py-0 sm:py-2 px-3'} text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 border-0`}
                        disabled={isImporting}
                    >
                        {isImporting ? (
                            <>
                                <div className={`animate-spin ${isCompact ? 'mr-1 w-3 h-3' : 'mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4'} border-2 border-amber-500 border-t-transparent rounded-full`} />
                                {t('cv.interface.import.loading')}
                            </>
                        ) : (
                            <>
                                <FileUp className={isCompact ? "w-3 h-3 mr-1" : "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"} />
                                {t('cv.interface.import.button')}
                            </>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`${isCompact ? "text-xs" : "text-xs sm:text-sm"} border-0 shadow-lg`}>
                    <DropdownMenuItem onClick={() => onImport('pdf')} className={`cursor-pointer ${isCompact ? 'h-8' : 'h-8 sm:h-10'} hover:bg-amber-50 dark:hover:bg-amber-900/20`} disabled={isImporting}>
                        <FileText className={isCompact ? "w-3 h-3 mr-1" : "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"} />
                        {t('cv.interface.import.pdf')}( - 5 <Coins className={isCompact ? "w-3 h-3" : "w-3 h-3 sm:w-4 sm:h-4"} />)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onImport('docx')} className={`cursor-pointer ${isCompact ? 'h-8' : 'h-8 sm:h-10'} hover:bg-amber-50 dark:hover:bg-amber-900/20`} disabled={isImporting}>
                        <FileText className={isCompact ? "w-3 h-3 mr-1" : "w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"} />
                        {t('cv.interface.import.word')}( - 5 <Coins className={isCompact ? "w-3 h-3" : "w-3 h-3 sm:w-4 sm:h-4"} />)
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

// Composant WelcomeCard - réduit pour économiser l'espace
const WelcomeCard = ({ onStartTutorial }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-gradient-to-r from-amber-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl mb-2 sm:mb-3 p-2 sm:p-3 border-0">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white truncate">
                        {t('cv.interface.welcome.title')}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 hidden sm:block">
                        {t('cv.interface.welcome.subtitle')}
                    </p>
                </div>
                <Button
                    onClick={onStartTutorial}
                    variant="ghost"
                    size="sm"
                    className="text-amber-700 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/20 whitespace-nowrap flex-shrink-0 h-7 text-xs px-2 sm:h-8 sm:px-3 sm:text-sm border-0"
                >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t('tutorial.restart')}</span>
                    <span className="sm:hidden">{t('tutorial.help')}</span>
                </Button>
            </div>
        </div>
    );
};

const PersonalInfoCard = ({ item, onEdit, updateCvInformation }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 90, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imageRef, setImageRef] = useState(null);
    const { toast } = useToast();
    const { t } = useTranslation();
    const PERSONAL_INFO_FIELDS = getPersonalInfoFields(t);

    // Null check for item prop
    if (!item) {
        return null;
    }

    // Log pour déboguer les propriétés de l'item
    useEffect(() => {
        console.log('PersonalInfoCard - props item:', item);
        console.log('PersonalInfoCard - profession affichée:', item.full_profession || item.profession || t('cv.interface.personal.fields.notSpecified'));
    }, [item, t]);

    const handleDeletePhoto = async () => {
        try {
            await axios.delete(route('personal-information.delete-photo'));
            updateCvInformation('personalInformation', {
                ...item,
                photo: null
            });
            toast({
                title: t('cv.interface.personal.photo.deleteSuccess.title'),
                description: t('cv.interface.personal.photo.deleteSuccess.description')
            });
        } catch (error) {
            toast({
                title: t('cv.interface.personal.photo.error'),
                variant: "destructive"
            });
        }
    };

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: t('cv.interface.personal.photo.sizeError'),
                    variant: "destructive"
                });
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setUploadedImage(reader.result);
                setIsOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const onImageLoad = (e) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1,
                width,
                height
            ),
            width,
            height
        );
        //@ts-ignore
        setCrop(crop);
    };

    const getCroppedImg = useCallback(() => {
        if (!imageRef || !completedCrop) return;

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;

        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imageRef,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.95);
        });
    }, [imageRef, completedCrop]);

    const handleUpload = async () => {
        if (!completedCrop || !imageRef) {
            toast({
                title: t('cv.interface.personal.photo.error.title'),
                description: t('cv.interface.personal.photo.error.noCrop'),
                variant: "destructive"
            });
            return;
        }

        try {
            setIsUploading(true);
            const croppedImage = await getCroppedImg();
            const formData = new FormData();
            //@ts-ignore

            formData.append('photo', croppedImage, 'profile.jpg');

            const response = await axios.post(route('personal-information.update-photo'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                updateCvInformation('personalInformation', {
                    ...item,
                    photo: response.data.photo_url
                });
                setIsOpen(false);
                toast({
                    title: t('cv.interface.personal.photo.success.title'),
                    description: t('cv.interface.personal.photo.success.description')
                });
            }
        } catch (error) {
            toast({
                title: t('cv.interface.personal.photo.error'),
                description: error.response?.data?.message || t('cv.interface.personal.photo.error'),
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                    {t('cvInterface.steps.step1')}
                </h2>
                <Button
                    onClick={onEdit}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 text-white h-8 sm:h-10 text-xs sm:text-sm py-0 border-0"
                >
                    <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    {t('cv.interface.personal.edit')}
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4 border-0">
                <div className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                        {item.photo ? (
                            <div className="group relative h-full w-full">
                                <img
                                    src={item.photo}
                                    alt="Profile"
                                    className="h-full w-full rounded-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <label className="cursor-pointer p-1 hover:bg-white/20 rounded-full">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={onSelectFile}
                                            disabled={isUploading}
                                        />
                                        <Upload className="h-4 w-4 text-white" />
                                    </label>
                                    <button
                                        onClick={handleDeletePhoto}
                                        className="p-1 hover:bg-white/20 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-500/10 to-purple-500/10 flex items-center justify-center">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={onSelectFile}
                                        disabled={isUploading}
                                    />
                                    <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white break-words">
                            {item.firstName}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                            {item.full_profession || localStorage.getItem('manual_profession') || item.profession || t('cv.interface.personal.fields.notSpecified')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {PERSONAL_INFO_FIELDS.map(({ label, key, icon: Icon }) => (
                        <div key={key} className="flex items-start gap-2 sm:gap-3">
                            <div className="mt-0.5">
                                <Icon className="h-3 w-3 sm:h-5 sm:w-5 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                                    {t(`cv.interface.personal.fields.${key}`)}
                                </p>
                                <p className="text-xs sm:text-base text-gray-900 dark:text-white font-medium truncate">
                                    {item[key] || t('cv.interface.personal.fields.notSpecified')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-xl p-3 sm:p-4 border-0">
                    <SheetHeader className="text-left">
                        <SheetTitle className="text-base sm:text-lg">
                            {t('cv.interface.personal.photo.crop')}
                        </SheetTitle>
                        <SheetDescription className="text-xs sm:text-sm">
                            {t('cv.interface.personal.photo.cropDescription')}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 sm:my-4" />
                    <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4 sticky bottom-0 bg-white dark:bg-gray-900 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Button variant="ghost" onClick={() => setIsOpen(false)} className="h-8 sm:h-10 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
                            {t('cv.interface.personal.photo.cancel')}
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!completedCrop || isUploading}
                            className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 h-8 sm:h-10 text-xs sm:text-sm border-0"
                        >
                            {isUploading ? t('cv.interface.personal.photo.saving') : t('cv.interface.personal.photo.save')}
                        </Button>
                    </div>

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-3 sm:my-4" />

                    <ScrollArea className="h-[calc(100vh-10rem)] pr-2 sm:pr-4">
                        <div className="space-y-3 sm:space-y-4">
                            {uploadedImage && (
                                <ReactCrop
                                    //@ts-ignore

                                    crop={crop}
                                    //@ts-ignore

                                    onChange={c => setCrop(c)}
                                    //@ts-ignore

                                    onComplete={c => setCompletedCrop(c)}
                                    aspect={1}
                                    className="max-w-full"
                                >
                                    <img
                                        ref={setImageRef}
                                        src={uploadedImage}
                                        alt="Upload"
                                        className="max-w-full h-auto"
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
};

// Composant IntegratedLivePreview - Version intégrée dans le layout
const IntegratedLivePreview = ({ cvInformation, selectedCvModel, availableModels, onModelSelect, onToggleVisibility }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState(0);

    // Génération de l'aperçu
    const generatePreview = useCallback(async (force = false) => {
        if (!selectedCvModel) {
            setIsModelSelectorOpen(true);
            return;
        }

        const now = Date.now();
        if (!force && now - lastUpdateTime < 2000) return;

        setIsGenerating(true);
        setLastUpdateTime(now);

        try {
            // Simulation de l'appel API - à remplacer par votre vraie logique
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock HTML - remplacez par votre vraie génération
            const mockHtml = `
                <div style="padding: 20px; font-family: Arial, sans-serif; background: white; min-height: 400px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #f59e0b; margin: 0;">${cvInformation.personalInformation?.firstName || t('cvInterface.personalInfo.firstName')}</h1>
                        <h2 style="color: #8b5cf6; margin: 5px 0 0 0; font-size: 18px;">${selectedCvModel.name}</h2>
                    </div>
                    <div style="margin: 20px 0;">
                        <h3 style="color: #374151; border-bottom: 2px solid #f59e0b; padding-bottom: 5px;">${t('cvInterface.summary.title')}</h3>
                        <p style="color: #6b7280; line-height: 1.6;">${t('cvInterface.preview.description')}</p>
                    </div>
                    <div style="margin: 20px 0;">
                        <h3 style="color: #374151; border-bottom: 2px solid #8b5cf6; padding-bottom: 5px;">${t('cvInterface.personalInfo.title')}</h3>
                        <p style="color: #6b7280;">Email: ${cvInformation.personalInformation?.email || t('common.notSpecified')}</p>
                        <p style="color: #6b7280;">${t('cvInterface.personalInfo.phone')}: ${cvInformation.personalInformation?.phone || t('common.notSpecified')}</p>
                    </div>
                </div>
            `;
            setPreviewHtml(mockHtml);
        } catch (error) {
            toast({
                title: t('cvInterface.previewError.title'),
                description: t('cvInterface.previewError.description'),
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    }, [selectedCvModel, cvInformation, lastUpdateTime, toast]);

    // Auto-refresh
    useEffect(() => {
        if (autoRefresh && selectedCvModel) {
            const timer = setTimeout(() => {
                generatePreview();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cvInformation, autoRefresh, selectedCvModel, generatePreview]);

    // Force refresh on model change
    useEffect(() => {
        if (selectedCvModel) {
            generatePreview(true);
        }
    }, [selectedCvModel]);

    return (
        <div className="h-full flex flex-col">
            {/* Header de l'aperçu */}
            <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-amber-500" />
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                            Aperçu Live
                        </h3>
                        {selectedCvModel && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {selectedCvModel.name}
                            </p>
                        )}
                    </div>
                    {isGenerating && (
                        <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn(
                            "h-7 w-7 p-0 border-0",
                            autoRefresh ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" : "text-gray-400"
                        )}
                        title={autoRefresh ? t('cvInterface.autoRefresh.enabled') : t('cvInterface.autoRefresh.disabled')}
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", autoRefresh && isGenerating && "animate-spin")} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePreview(true)}
                        disabled={isGenerating}
                        className="h-7 w-7 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-0"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsModelSelectorOpen(true)}
                        className="h-7 w-7 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-0"
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggleVisibility}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 border-0"
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Zone d'aperçu */}
            <div className="flex-1 bg-gray-50/30 dark:bg-gray-800/30 relative overflow-hidden">
                {!selectedCvModel ? (
                    <div className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-purple-100 dark:from-amber-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-amber-500" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                Sélectionnez un modèle
                            </p>
                            <Button
                                onClick={() => setIsModelSelectorOpen(true)}
                                className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white border-0 text-sm h-8"
                            >
                                <Star className="w-3.5 h-3.5 mr-2" />
                                Choisir
                            </Button>
                        </div>
                    </div>
                ) : previewHtml ? (
                    <div className="h-full relative">
                        <div className="h-full overflow-auto p-4">
                            <div
                                className="bg-white shadow-sm rounded-xl overflow-hidden w-full"
                                style={{
                                    zoom: '0.7',
                                    transformOrigin: 'top center'
                                }}
                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                            />
                        </div>

                        <AnimatePresence>
                            {isGenerating && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm flex items-center justify-center"
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-0">
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Génération...
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <RefreshCw className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                Générer l'aperçu
                            </p>
                            <Button
                                onClick={() => generatePreview(true)}
                                variant="ghost"
                                className="text-sm h-8 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 border-0"
                            >
                                Générer
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status bar */}
            {selectedCvModel && (
                <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                autoRefresh ? "bg-green-400" : "bg-gray-300"
                            )} />
                            <span>{autoRefresh ? "Auto" : "Manuel"}</span>
                        </div>
                        <span className="truncate">{selectedCvModel.name}</span>
                    </div>
                </div>
            )}

            {/* Dialog sélection de modèle */}
            <Dialog open={isModelSelectorOpen} onOpenChange={setIsModelSelectorOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto border-0 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center">
                                <Star className="w-4 h-4 text-white" />
                            </div>
                            Choisir un modèle de CV
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {availableModels.map((model) => (
                            <motion.div
                                key={model.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "rounded-xl p-4 cursor-pointer transition-all border-0",
                                    selectedCvModel?.id === model.id
                                        ? "bg-gradient-to-br from-amber-50 to-purple-50 dark:from-amber-900/20 dark:to-purple-900/20 shadow-md"
                                        : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                                onClick={() => {
                                    onModelSelect(model.id);
                                    setIsModelSelectorOpen(false);
                                }}
                            >
                                <div className="aspect-[3/4] bg-white dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden shadow-sm">
                                    {model.previewImagePath ? (
                                        <img
                                            src={model.previewImagePath}
                                            alt={model.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>

                                <h3 className="font-medium text-sm mb-1 text-gray-800 dark:text-gray-200">
                                    {model.name}
                                </h3>

                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                    {model.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    {model.price === 0 ? (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full font-medium">
                                            Gratuit
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full font-medium">
                                            {model.price}€
                                        </span>
                                    )}

                                    {selectedCvModel?.id === model.id && (
                                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-amber-500 to-purple-500 text-white rounded-full font-medium">
                                            Sélectionné
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
const SidebarButton = ({ item, isActive, isComplete, onClick, isMobile }) => {
    const activeClass = "bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-white shadow-sm";
    const inactiveClass = "hover:bg-amber-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200";

    return (
        <motion.button
            onClick={onClick}
            className={`flex items-center justify-between p-2 sm:p-3 rounded-xl transition-all ${isActive ? activeClass : inactiveClass} ${isMobile ? 'w-9 sm:w-10' : 'w-full'} border-0`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-2">
                <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : item.color}`} />
                {!isMobile && <span className="font-medium text-xs sm:text-sm">{item.label}</span>}
            </div>
            {!isMobile && (
                <div className="flex items-center gap-1 sm:gap-2">
                    {isComplete && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400"
                        />
                    )}
                    <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                </div>
            )}
        </motion.button>
    );
}

const SectionNavigation = ({ currentSection, nextSection, prevSection, canProgress, onNavigate }) => {
    const { t } = useTranslation();

    // Vérifier si c'est la dernière section (skills)
    const isLastSection = currentSection === 'skills';

    return (
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800" data-tutorial="navigation">
            <div className="flex justify-between items-center gap-2 sm:gap-4">
                {prevSection && (
                    <Button
                        variant="ghost"
                        onClick={() => onNavigate(prevSection.id)}
                        className="h-8 sm:h-10 text-xs sm:text-sm py-0 sm:py-2 flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 border-0"
                    >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate max-w-[80px] sm:max-w-none">{prevSection.label}</span>
                    </Button>
                )}

                {/* Bouton Choisir un design s'affiche uniquement à la dernière étape */}
                {isLastSection && canProgress ? (
                    <Link href={route('userCvModels.index')}>
                        <Button className="h-8 sm:h-10 text-xs sm:text-sm py-0 sm:py-2 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 text-white border-0">
                            <Star className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {t('cv.interface.chooseDesign')}
                            <CircleChevronRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </Link>
                ) : nextSection && (
                    <Button
                        onClick={() => onNavigate(nextSection.id)}
                        disabled={!canProgress}
                        className="h-8 sm:h-10 text-xs sm:text-sm py-0 sm:py-2 flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 text-white border-0"
                    >
                        <span className="truncate max-w-[80px] sm:max-w-none">{nextSection.label}</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default function CvInterface({ auth, cvInformation: initialCvInformation }) {
    const { t } = useTranslation();
    const SIDEBAR_ITEMS = getSidebarItems(t);
    const PERSONAL_INFO_FIELDS = getPersonalInfoFields(t);
    const [activeSection, setActiveSection] = useState('personalInfo');
    const [cvInformation, setCvInformation] = useState(initialCvInformation);
    const [isEditing, setIsEditing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isPageBlocked, setIsPageBlocked] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);

    // États pour la prévisualisation live
    const [isLivePreviewVisible, setIsLivePreviewVisible] = useState(false);
    const [selectedPreviewModel, setSelectedPreviewModel] = useState<number | null>(
        auth.user.selected_cv_model_id || null
    );

    const { toast } = useToast();

    // Vérifier si l'utilisateur a déjà vu le tutoriel
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('cv_tutorial_completed');
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    // Récupérer la profession manuelle sauvegardée au chargement
    useEffect(() => {
        const savedManualProfession = localStorage.getItem('manual_profession');
        if (savedManualProfession && (!cvInformation.personalInformation.full_profession || cvInformation.personalInformation.full_profession === '')) {
            console.log('Restauration de la profession manuelle depuis localStorage:', savedManualProfession);
            setCvInformation(prev => ({
                ...prev,
                myProfession: { fullProfession: savedManualProfession },
                personalInformation: {
                    ...prev.personalInformation,
                    profession: '',
                    full_profession: savedManualProfession
                }
            }));
        }
    }, []);

    // Log de débogage à chaque rendu
    useEffect(() => {
        console.log('État actuel:', cvInformation);
        if (cvInformation.personalInformation) {
            console.log('PersonalInfo profession:', cvInformation.personalInformation.profession);
            console.log('PersonalInfo full_profession:', cvInformation.personalInformation.full_profession);
        }
        if (cvInformation.myProfession) {
            console.log('myProfession:', cvInformation.myProfession);
        }
    }, [cvInformation]);

    // Utilisation des traductions pour les éléments de la sidebar
    const translatedSidebarItems = [
        { id: 'personalInfo', label: t('cvInterface.steps.step1'), icon: User, color: 'text-amber-500' },
        { id: 'summary', label: t('cvInterface.steps.step2'), icon: FileText, color: 'text-purple-500' },
        { id: 'experience', label: t('cvInterface.steps.step3'), icon: Briefcase, color: 'text-amber-600' },
        { id: 'profession', label: t('cvInterface.steps.step4'), icon: GraduationCap, color: 'text-amber-500' },
        { id: 'skills', label: t('cvInterface.steps.step5'), icon: Code, color: 'text-purple-600' }
    ];

    // Utilisation des traductions pour les champs d'information personnelle
    const translatedPersonalInfoFields = [
        { label: t('cv.personal.email'), key: "email", icon: Mail },
        { label: t('cv.personal.phone'), key: "phone", icon: Phone },
        { label: t('cv.personal.address'), key: "address", icon: MapPin },
        { label: t('cv.personal.linkedin'), key: "linkedin", icon: Linkedin },
        { label: t('cv.personal.github'), key: "github", icon: Github }
    ];

    const updateCvInformation = useCallback((section, data) => {
        console.log(`Mise à jour de la section ${section}:`, data);
        setCvInformation(prev => {
            const newState = { ...prev };
            if (section === 'summaries') {
                newState.summaries = data;
                if (Array.isArray(data) && data.length > 0) {
                    const existingIds = new Set(newState.allsummaries.map(s => s.id));
                    data.forEach(summary => {
                        if (!existingIds.has(summary.id)) {
                            newState.allsummaries.push(summary);
                        } else {
                            const index = newState.allsummaries.findIndex(s => s.id === summary.id);
                            if (index !== -1) {
                                newState.allsummaries[index] = summary;
                            }
                        }
                    });
                }
            } else {
                newState[section] = Array.isArray(data) ? [...data] : { ...data };
            }
            console.log(`État mis à jour pour ${section}:`, newState[section]);
            return newState;
        });
    }, []);

    const completionStatus = {
        personalInfo: Boolean(cvInformation.personalInformation?.firstName),
        summary: cvInformation.summaries?.length > 0,
        experience: cvInformation.experiences?.length > 0,
        profession: Boolean(cvInformation.myProfession) ||
            Boolean(cvInformation.personalInformation?.full_profession) ||
            Boolean(localStorage.getItem('manual_profession')),
        skills: (cvInformation.competences?.length > 0) ||
            (cvInformation.languages?.length > 0) ||
            (cvInformation.hobbies?.length > 0),
    };

    const getCompletionPercentage = () => {
        const completed = Object.values(completionStatus).filter(status => status).length;
        return Math.round((completed / Object.keys(completionStatus).length) * 100);
    };

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => setIsEditing(false);
    const handleUpdate = (updatedInfo) => {
        updateCvInformation('personalInformation', updatedInfo);
        setIsEditing(false);
        toast({
            title: t('cv.interface.update.success'),
            description: t('cv.interface.update.successDetail')
        });
    };

    const getSectionComponent = (sectionId) => {
        switch (sectionId) {
            case 'personalInfo':
                return isEditing ? (
                    <PersonalInformationEdit
                        user={cvInformation.personalInformation}
                        onUpdate={handleUpdate}
                        onCancel={handleCancel}
                    />
                ) : (
                    <PersonalInfoCard
                        item={cvInformation.personalInformation || {}}
                        onEdit={handleEdit}
                        updateCvInformation={updateCvInformation}
                    />
                );
            case 'summary':
                return (
                    <SummaryManager
                        auth={auth}
                        summaries={cvInformation.allsummaries}
                        selectedSummary={cvInformation.summaries}
                        onUpdate={(summaries) => updateCvInformation('summaries', summaries)}
                    />
                );
            case 'skills':
                return (
                    <div className="space-y-4 sm:space-y-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                                {t('cvInterface.steps.step5')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Colonne gauche */}
                            <div className="space-y-5">
                                <CompetenceManager
                                    auth={auth}
                                    availableCompetences={cvInformation.availableCompetences}
                                    initialUserCompetences={cvInformation.competences}
                                    onUpdate={(competences) => updateCvInformation('competences', competences)}
                                />

                                <LanguageManager
                                    auth={auth}
                                    availableLanguages={cvInformation.availableLanguages}
                                    initialLanguages={cvInformation.languages || []}
                                    onUpdate={(languages) => updateCvInformation('languages', languages)}
                                />
                            </div>

                            {/* Colonne droite */}
                            <div>
                                <HobbyManager
                                    auth={auth}
                                    availableHobbies={cvInformation.availableHobbies}
                                    initialUserHobbies={cvInformation.hobbies}
                                    onUpdate={(hobbies) => updateCvInformation('hobbies', hobbies)}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'profession':
                return (
                    <ProfessionManager
                        auth={auth}
                        availableProfessions={cvInformation.availableProfessions}
                        initialUserProfession={cvInformation.myProfession}
                        onUpdate={(profession, fullProfession) => {
                            // Utiliser un setTimeout pour s'assurer que les mises à jour sont séquentielles
                            setTimeout(() => {
                                if (profession) {
                                    console.log('Sélection de profession:', profession);
                                    setCvInformation(prev => {
                                        const updatedPersonalInfo = {
                                            ...prev.personalInformation,
                                            profession: profession.name,
                                            full_profession: ''
                                        };
                                        console.log('Mise à jour combinée avec profession:', { myProfession: profession, personalInformation: updatedPersonalInfo });
                                        return { ...prev, myProfession: profession, personalInformation: updatedPersonalInfo };
                                    });
                                    axios.post('/user-preferences', {
                                        key: 'profession_state',
                                        value: JSON.stringify({ type: 'profession', data: profession })
                                    }).catch(e => console.error('Erreur lors de la sauvegarde des préférences:', e));
                                } else if (fullProfession) {
                                    console.log('Sélection de profession manuelle:', fullProfession);
                                    setCvInformation(prev => {
                                        const updatedPersonalInfo = {
                                            ...prev.personalInformation,
                                            profession: '',
                                            full_profession: fullProfession
                                        };
                                        console.log('Mise à jour combinée avec profession manuelle:', { myProfession: { fullProfession }, personalInformation: updatedPersonalInfo });
                                        return { ...prev, myProfession: { fullProfession }, personalInformation: updatedPersonalInfo };
                                    });
                                    localStorage.setItem('manual_profession', fullProfession);
                                    axios.post('/user-preferences', {
                                        key: 'profession_state',
                                        value: JSON.stringify({ type: 'manual', data: fullProfession })
                                    }).catch(e => console.error('Erreur lors de la sauvegarde des préférences:', e));
                                } else {
                                    console.log('Réinitialisation de profession');
                                    setCvInformation(prev => {
                                        const updatedPersonalInfo = {
                                            ...prev.personalInformation,
                                            profession: '',
                                            full_profession: ''
                                        };
                                        console.log('Mise à jour combinée avec réinitialisation:', { myProfession: null, personalInformation: updatedPersonalInfo });
                                        return { ...prev, myProfession: null, personalInformation: updatedPersonalInfo };
                                    });
                                    localStorage.removeItem('manual_profession');
                                }
                            }, 0);
                        }}
                    />
                );
            case 'experience':
                return (
                    <ExperienceManager
                        auth={auth}
                        experiences={cvInformation.experiences}
                        categories={cvInformation.experienceCategories}
                        onUpdate={(experiences) => updateCvInformation('experiences', experiences)}
                    />
                );
            default:
                return <div>{t('cv.sections.notFound')}</div>;
        }
    };

    const currentSectionIndex = SIDEBAR_ITEMS.findIndex(item => item.id === activeSection);
    const nextSection = SIDEBAR_ITEMS[currentSectionIndex + 1];
    const prevSection = SIDEBAR_ITEMS[currentSectionIndex - 1];

    const handleImport = async (type) => {
        if (type === 'ai' && auth.user.wallet_balance < 5) {
            toast({
                title: t('cv.interface.import.error'),
                description: t('cv.interface.import.insufficient'),
                variant: "destructive"
            });
            return;
        }

        if (isImporting) return; // Éviter les importations multiples

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = type === 'pdf' ? '.pdf' : '.docx';

        input.onchange = async (e) => {
            //@ts-ignore
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                setIsImporting(true);
                setIsPageBlocked(true); // Bloquer la page pendant l'importation

                // Notification de début du processus
                toast({
                    title: "Étape 1/4",
                    description: "Préparation du fichier..."
                });

                const formData = new FormData();
                formData.append('cv', file);

                // Notification de l'envoi du fichier
                toast({
                    title: "Étape 2/4",
                    description: "Envoi du fichier au serveur..."
                });

                // Ajout d'un timeout pour permettre l'affichage de la notification
                await new Promise(resolve => setTimeout(resolve, 500));

                try {
                    // Notification d'analyse
                    toast({
                        title: "Étape 3/4",
                        description: "Analyse du CV en cours..."
                    });

                    const response = await axios.post(
                        '/api/cv/analyze',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            },
                            timeout: 60000, // Augmentation du timeout à 60s
                        }
                    );

                    // Notification de mise à jour des données
                    toast({
                        title: "Étape 4/4",
                        description: "Mise à jour des informations..."
                    });

                    if (response.data.success) {
                        updateCvInformation('personalInformation', response.data.cvData.personalInformation || {});
                        if (response.data.cvData.summaries) updateCvInformation('summaries', response.data.cvData.summaries);
                        if (response.data.cvData.competences) updateCvInformation('competences', response.data.cvData.competences);
                        if (response.data.cvData.experiences) updateCvInformation('experiences', response.data.cvData.experiences);
                        if (response.data.cvData.languages) updateCvInformation('languages', response.data.cvData.languages);
                        if (response.data.cvData.hobbies) updateCvInformation('hobbies', response.data.cvData.hobbies);
                        if (response.data.cvData.myProfession) updateCvInformation('myProfession', response.data.cvData.myProfession);

                        toast({
                            title: t('cv.interface.import.success'),
                            description: t('cv.interface.import.successDetail')
                        });
                    }
                } catch (error) {
                    console.error("Erreur détaillée:", error);

                    // Afficher les informations détaillées sur l'erreur
                    const errorMessage = error.response?.data?.message || t('cv.interface.import.errorDetail');
                    const errorStatus = error.response?.status || "Inconnu";
                    const errorDetails = error.response?.data?.error || "Pas de détails supplémentaires";

                    toast({
                        title: `Erreur ${errorStatus} pendant l'analyse`,
                        description: `${errorMessage}. Détails: ${errorDetails}`,
                        variant: "destructive"
                    });
                }
            } catch (fileError) {
                console.error("Erreur fichier:", fileError);
                toast({
                    title: t('cv.interface.import.error'),
                    description: "Erreur lors de la préparation du fichier",
                    variant: "destructive"
                });
            } finally {
                setIsImporting(false);
                setIsPageBlocked(false); // Débloquer la page après l'importation
            }
        };

        input.click();
    };

    const handleStartTutorial = () => {
        setShowTutorial(true);
    };

    const handleTutorialComplete = () => {
        setShowTutorial(false);
    };

    const handleTutorialNavigate = (sectionId) => {
        setActiveSection(sectionId);
    };

    // Handlers pour la prévisualisation live
    const handleModelSelect = useCallback((modelId: number) => {
        setSelectedPreviewModel(modelId);
        // Optionnel : sauvegarder la préférence utilisateur
        // axios.post('/api/user/preferred-cv-model', { modelId });
    }, []);

    const toggleLivePreview = useCallback(() => {
        setIsLivePreviewVisible(!isLivePreviewVisible);
    }, [isLivePreviewVisible]);

    // Détection desktop pour afficher le bouton de prévisualisation
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const checkIsDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
        };

        checkIsDesktop();
        window.addEventListener('resize', checkIsDesktop);
        return () => window.removeEventListener('resize', checkIsDesktop);
    }, []);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={t('cv.interface.title')} />

            {/* Tutoriel */}
            <Tutorial
                isVisible={showTutorial}
                onComplete={handleTutorialComplete}
                currentSection={activeSection}
                onNavigateToSection={handleTutorialNavigate}
            />

            {/* Overlay qui bloque toute interaction */}
            {isPageBlocked && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg text-center border-0">
                        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                            {t('common.loading')}
                        </p>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
                <div className={cn(
                    "container mx-auto py-3 sm:py-4 px-3 sm:px-4 transition-all duration-300",
                    isLivePreviewVisible && isDesktop ? "lg:mr-[500px]" : ""
                )}>
                    {/* Header responsive amélioré - avec pourcentage et import intégrés */}
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500 dark:text-amber-400" />
                            <h2 className="font-bold text-base sm:text-xl bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                                {t('cv.interface.title')}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Bouton Voir CV */}
                            <Link href={route('cv-infos.show', auth.user.id)}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 transition-all border-0"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">{t('cv.interface.viewCv')}</span>
                                </Button>
                            </Link>

                            {/* Bouton Changer modèle */}
                            <Link href={route('userCvModels.index')}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all border-0"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-xs sm:text-sm">{t('cv.interface.changeModel')}</span>
                                </Button>
                            </Link>

                            {/* Bouton Live Preview (desktop seulement) */}
                            {isDesktop && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleLivePreview}
                                    className={cn(
                                        "hidden lg:flex items-center gap-2 transition-all border-0",
                                        isLivePreviewVisible
                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                            : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                    )}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden xl:inline">
                                        {isLivePreviewVisible ? 'Masquer aperçu' : 'Aperçu Live'}
                                    </span>
                                </Button>
                            )}

                            {/* Pourcentage et progression */}
                            <div className="flex items-center gap-2" data-tutorial="progress">
                                <Progress value={getCompletionPercentage()} className="w-16 sm:w-24 h-2" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {getCompletionPercentage()}%
                                </span>
                            </div>

                            {/* Bouton d'import */}
                            <ImportButton onImport={handleImport} isImporting={isImporting} isCompact={true} />
                        </div>
                    </div>

                    {/* WelcomeCard avec bouton tutoriel */}
                    <WelcomeCard onStartTutorial={handleStartTutorial} />

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border-0 overflow-hidden">
                        <div className="flex flex-row min-h-[500px] sm:min-h-[600px]">
                            {/* Sidebar mobile optimisée (icônes uniquement) */}
                            <div className="w-11 sm:w-14 md:w-16 flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/50 md:hidden" data-tutorial="sidebar">
                                <ScrollArea className="h-full py-1.5 sm:py-2">
                                    <nav className="sticky top-0 p-1 sm:p-1.5 space-y-1.5 sm:space-y-2">
                                        {translatedSidebarItems.map(item => (
                                            <SidebarButton
                                                key={item.id}
                                                item={item}
                                                isActive={activeSection === item.id}
                                                isComplete={completionStatus[item.id]}
                                                onClick={() => setActiveSection(item.id)}
                                                isMobile={true}
                                            />
                                        ))}
                                    </nav>
                                </ScrollArea>
                            </div>

                            {/* Sidebar desktop (texte + icônes) */}
                            <div className="hidden md:block w-48 lg:w-64 flex-shrink-0 bg-gray-50/30 dark:bg-gray-800/30" data-tutorial="sidebar">
                                <ScrollArea className="h-full py-2 sm:py-3">
                                    <nav className="sticky top-0 p-1.5 sm:p-3 space-y-1.5 sm:space-y-2">
                                        {translatedSidebarItems.map(item => (
                                            <SidebarButton
                                                key={item.id}
                                                item={item}
                                                isActive={activeSection === item.id}
                                                isComplete={completionStatus[item.id]}
                                                onClick={() => setActiveSection(item.id)}
                                                isMobile={false}
                                            />
                                        ))}
                                    </nav>
                                </ScrollArea>
                            </div>

                            {/* Contenu principal */}
                            <div className="flex-grow p-3 sm:p-5 overflow-x-hidden bg-white dark:bg-gray-900" data-tutorial="content">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-3 sm:space-y-4"
                                    >
                                        {getSectionComponent(activeSection)}

                                        <SectionNavigation
                                            currentSection={activeSection}
                                            nextSection={nextSection}
                                            prevSection={prevSection}
                                            canProgress={completionStatus[activeSection]}
                                            onNavigate={setActiveSection}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Composant de prévisualisation live (desktop seulement) */}
            {isDesktop && (
                <AnimatePresence>
                    {isLivePreviewVisible && (
                        <LivePreview
                            cvInformation={cvInformation}
                            selectedCvModel={selectedPreviewModel ?
                                cvInformation.availableCvModels?.find(m => m.id === selectedPreviewModel) || null
                                : null
                            }
                            availableModels={cvInformation.availableCvModels || []}
                            onModelSelect={handleModelSelect}
                            isVisible={isLivePreviewVisible}
                            onToggleVisibility={toggleLivePreview}
                        />
                    )}
                </AnimatePresence>
            )}
        </AuthenticatedLayout>
    );
}