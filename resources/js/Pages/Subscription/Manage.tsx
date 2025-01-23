import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, X } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";

export default function Manage({ auth, subscription }) {
    const { toast } = useToast();
    const { post, processing } = useForm();

    const cancelSubscription = () => {
        post(route('subscription.cancel'), {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: "Abonnement annulé",
                    description: "Votre abonnement a été annulé avec succès.",
                });
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gérer mon abonnement</h2>}
        >
            <Head title="Gérer mon abonnement" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Détails de l'abonnement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4">
                                <p><strong>Plan :</strong> {subscription.plan}</p>
                                <p><strong>Statut :</strong> {subscription.status}</p>
                                <p><strong>Date de début :</strong> {new Date(subscription.start_date).toLocaleDateString()}</p>
                                <p><strong>Date de fin :</strong> {new Date(subscription.end_date).toLocaleDateString()}</p>
                            </div>
                            {subscription.status === 'active' && (
                                <Button onClick={cancelSubscription} disabled={processing} variant="destructive">
                                    <X className="mr-2 h-4 w-4" />
                                    Annuler l'abonnement
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
