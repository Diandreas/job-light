import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { User, Copy, Check, Eye, Edit, Share2, ExternalLink } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { useToast } from "@/Components/ui/use-toast";
import NavLink from "@/Components/NavLink";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth }) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const portfolioUrl = `${window.location.origin}/portfolio/${auth.user.username || auth.user.email}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(portfolioUrl).then(() => {
            setCopied(true);
            toast({
                title: "Lien copié !",
                description: "Le lien de votre portfolio a été copié dans le presse-papier.",
            });
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // @ts-ignore
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Mon Portfolio</h2>
                    <Button
                        onClick={copyToClipboard}
                        variant="outline"
                        className="hidden items-center space-x-2 sm:flex"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                <span>Portfolio partagé</span>
                            </>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4" />
                                <span>Partager mon portfolio</span>
                            </>
                        )}
                    </Button>
                </div>
            }
        >
            <Head title="Mon Portfolio" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* Left Section - Portfolio Management */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-md">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center space-x-2 text-lg">
                                        <User className="h-5 w-5 text-primary" />
                                        <span>Gérer mon Portfolio</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Public Link Section */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">
                                            Lien public de votre portfolio
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                value={portfolioUrl}
                                                readOnly
                                                className="font-mono text-sm bg-muted/50"
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

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <Button
                                            asChild
                                            className="w-full justify-start"
                                        >

                                            <NavLink href={route('portfolio.edit')} active>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Personnaliser mon portfolio
                                            </NavLink>
                                        </Button>

                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full justify-start"
                                        >
                                            <NavLink
                                                href={route('portfolio.show', {
                                                    identifier: auth.user.username || auth.user.email
                                                })}
                                                target="_blank"
                                             active>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Voir mon portfolio
                                            </NavLink>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Section - Preview */}
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center space-x-2 text-lg">
                                    <Eye className="h-5 w-5 text-primary" />
                                    <span>Prévisualisation en direct</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="aspect-[16/10] w-full overflow-hidden rounded-lg">
                                    <iframe
                                        src={portfolioUrl}
                                        className="h-full w-full border-0"
                                        title="Prévisualisation du portfolio"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};
