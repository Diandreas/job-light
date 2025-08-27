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
import { __ } from '@/utils/translation';

export default function Index({ auth }) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const portfolioUrl = `${window.location.origin}/portfolio/${auth.user.username || auth.user.email}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(portfolioUrl);
            setCopied(true);
            toast({
                title: __('portfolio.index.link_copied_title'),
                description: __('portfolio.index.link_copied_description'),
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast({
                title: __('portfolio.index.error'),
                description: __('portfolio.index.copy_error_description'),
                variant: "destructive",
            });
        }
    };

    const features = [
        { icon: Palette, title: __('portfolio.index.features.templates'), description: __('portfolio.index.features.templates_desc') },
        { icon: Layers, title: __('portfolio.index.features.custom_sections'), description: __('portfolio.index.features.custom_sections_desc') },
        { icon: Camera, title: __('portfolio.index.features.professional_photo'), description: __('portfolio.index.features.professional_photo_desc') },
        { icon: Sparkles, title: __('portfolio.index.features.smooth_animations'), description: __('portfolio.index.features.smooth_animations_desc') },
        { icon: Globe, title: __('portfolio.index.features.responsive'), description: __('portfolio.index.features.responsive_desc') },
        { icon: Zap, title: __('portfolio.index.features.performance'), description: __('portfolio.index.features.performance_desc') },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                            {__('portfolio.index.title')}
                        </h2>
                        <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-700 dark:text-amber-300">
                            <Crown className="h-3 w-3 mr-1" />
                            {__('portfolio.index.premium')}
                        </Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={copyToClipboard}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{__('portfolio.index.copied')}</span>
                                </>
                            ) : (
                                <>
                                    <Share2 className="h-4 w-4" />
                                    <span>{__('portfolio.index.share')}</span>
                                </>
                            )}
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600">
                            <Link href={route('portfolio.edit')}>
                                <Rocket className="h-4 w-4 mr-2" />
                                {__('portfolio.index.customize')}
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={__('portfolio.index.title')} />

            <div className="py-8 bg-gradient-to-br from-amber-50/50 to-purple-50/50 dark:from-amber-950/20 dark:to-purple-950/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Alert Premium */}
                    <Alert className="mb-8 bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-amber-800">
                            <strong>{__('portfolio.index.premium_activated')}</strong> {__('portfolio.index.premium_description')}
                        </AlertDescription>
                    </Alert>

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
                                        {__('portfolio.index.quick_actions')}
                                    </CardTitle>
                                    <CardDescription>
                                        {__('portfolio.index.manage_portfolio_description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Lien Portfolio */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {__('portfolio.index.public_link_label')}
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={portfolioUrl}
                                                readOnly
                                                className="font-mono text-xs bg-gray-50 dark:bg-gray-800"
                                            />
                                            <Button
                                                onClick={copyToClipboard}
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0"
                                            >
                                                {copied ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="space-y-3 pt-2">
                                        <Button asChild className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                                            <Link href={route('portfolio.edit')}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                {__('portfolio.index.customize_design')}
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
                                                {__('portfolio.index.view_public_portfolio')}
                                            </Link>
                                        </Button>

                                        <Button asChild variant="outline" className="w-full border-amber-200 hover:bg-amber-50">
                                            <Link href={route('portfolio.edit')}>
                                                <Layers className="mr-2 h-4 w-4" />
                                                {__('portfolio.index.manage_sections')}
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
                                        {__('portfolio.index.live_preview')}
                                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                            <Zap className="h-3 w-3 mr-1" />
                                            {__('portfolio.index.online')}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        {__('portfolio.index.preview_description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="aspect-[16/10] w-full overflow-hidden rounded-b-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                        <iframe
                                            src={portfolioUrl}
                                            className="h-full w-full border-0"
                                            title={__('portfolio.index.portfolio_preview_title')}
                                            loading="lazy"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Fonctionnalités Premium */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-purple-50 shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl text-amber-700">
                                    <Crown className="h-6 w-6" />
                                    {__('portfolio.index.premium_features')}
                                </CardTitle>
                                <CardDescription className="text-amber-600">
                                    {__('portfolio.index.premium_features_description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={feature.title}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="flex items-start space-x-3 p-4 rounded-lg bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-purple-500">
                                                <feature.icon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                                                    {feature.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Statistiques */}
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">100%</div>
                                        <div className="text-xs text-gray-600">{__('portfolio.index.stats.responsive')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">4</div>
                                        <div className="text-xs text-gray-600">{__('portfolio.index.stats.templates_pro')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">∞</div>
                                        <div className="text-xs text-gray-600">{__('portfolio.index.stats.sections')}</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                                        <div className="text-2xl font-bold text-amber-600">⚡</div>
                                        <div className="text-xs text-gray-600">{__('portfolio.index.stats.ultra_fast')}</div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="mt-6 text-center">
                                    <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-lg px-8">
                                        <Link href={route('portfolio.edit')}>
                                            <Rocket className="h-5 w-5 mr-2" />
                                            {__('portfolio.index.start_customization')}
                                            <ArrowRight className="h-5 w-5 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};
