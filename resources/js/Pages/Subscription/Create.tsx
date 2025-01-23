import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";

export default function Create({ auth }) {
    const { toast } = useToast();
    const { post, processing } = useForm();

    const subscribe = () => {
        post(route('subscription.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: "Abonnement souscrit !",
                    description: "Votre abonnement a été activé avec succès.",
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Souscrire à un abonnement</h2>}
        >
            <Head title="Souscrire à un abonnement" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Plan Standard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="mb-4">Accédez à toutes les fonctionnalités premium pendant 3 mois.</p>
                            <p className="text-2xl font-bold mb-4">29,99 €</p>
                            <Button onClick={subscribe} disabled={processing}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Souscrire maintenant
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
