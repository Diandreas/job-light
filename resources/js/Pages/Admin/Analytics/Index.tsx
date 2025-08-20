import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { BarChart3 } from 'lucide-react';

export default function AnalyticsIndex() {
    return (
        <AdminLayout>
            <Head title="Analytics" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Analyses détaillées et métriques de la plateforme</p>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <BarChart3 className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                        <CardTitle>Analytics Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-600">Le tableau de bord d'analytics sera bientôt disponible.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Cette section contiendra des analyses détaillées sur l'utilisation de la plateforme.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}