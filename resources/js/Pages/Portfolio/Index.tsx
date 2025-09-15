import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    User, Copy, Check, Eye, Edit, Share2, ExternalLink, Palette,
    Layers, Sparkles, Settings, Star, Heart, Award, CheckCircle,
    Camera, Globe, Zap, Crown, ArrowRight, Rocket
} from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useToast } from "@/Components/ui/use-toast";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from 'react-i18next';

export default function Index({ auth }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const portfolioUrl = `${window.location.origin}/portfolio/${auth.user.username || auth.user.email}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(portfolioUrl);
            setCopied(true);
            toast({
                title: t('portfolio.index.link_copied_title'),
                description: t('portfolio.index.link_copied_description'),
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: t('portfolio.index.error'),
                description: t('portfolio.index.copy_error_description'),
                variant: "destructive",
            });
        }
    };

    const features = [
        { icon: Palette, title: t('portfolio.index.features.templates'), description: t('portfolio.index.features.templates_desc') },
        { icon: Layers, title: t('portfolio.index.features.custom_sections'), description: t('portfolio.index.features.custom_sections_desc') },
        { icon: Camera, title: t('portfolio.index.features.professional_photo'), description: t('portfolio.index.features.professional_photo_desc') },
        { icon: Sparkles, title: t('portfolio.index.features.smooth_animations'), description: t('portfolio.index.features.smooth_animations_desc') },
        { icon: Globe, title: t('portfolio.index.features.responsive'), description: t('portfolio.index.features.responsive_desc') },
        { icon: Zap, title: t('portfolio.index.features.performance'), description: t('portfolio.index.features.performance_desc') },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title={t('portfolio.index.title')} />

            <div className="py-8 bg-gradient-to-br from-amber-50/50 to-purple-50/50 dark:from-amber-950/20 dark:to-purple-950/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Actions Rapides */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-1"
                        >
                            <Card className="h-full border-2 border-gradient-to-r from-amber-200 to-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <User className="h-6 w-6 text-amber-500" />
                                        {t('portfolio.index.quick_actions')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('portfolio.index.manage_portfolio_description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Lien Portfolio */}
                                    <div className="space-y-2">
                                        <Button
                                            onClick={copyToClipboard}
                                            variant="outline"
                                            className="w-full flex items-center gap-2"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="h-4 w-4 text-green-500" />
                                                    <span>{t('portfolio.index.copied')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Share2 className="h-4 w-4" />
                                                    <span>{t('portfolio.index.share')}</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="space-y-3 pt-2">
                                        <Button asChild className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600">
                                            <Link href={route('portfolio.edit')}>
                                                <Rocket className="h-4 w-4 mr-2" />
                                                {t('portfolio.index.customize')}
                                            </Link>
                                        </Button>

                                        <Button asChild variant="outline" className="w-full border-purple-200 hover:bg-purple-50">
                                            <Link
                                                href={route('portfolio.show', {
                                                    identifier: auth.user.username || auth.user.email
                                                })}
                                                target="_blank"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                {t('portfolio.index.view_public_portfolio')}
                                            </Link>
                                        </Button>

                                        
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Prévisualisation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <Card className="h-full shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Eye className="h-6 w-6 text-purple-500" />
                                        {t('portfolio.index.live_preview')}
                                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                            <Zap className="h-3 w-3 mr-1" />
                                            {t('portfolio.index.online')}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        {t('portfolio.index.preview_description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="aspect-[16/10] w-full overflow-hidden rounded-b-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                        <iframe
                                            src={portfolioUrl}
                                            className="h-full w-full border-0"
                                            title={t('portfolio.index.portfolio_preview_title')}
                                            loading="lazy"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
};
