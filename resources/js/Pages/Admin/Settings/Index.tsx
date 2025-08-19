import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Settings } from 'lucide-react';

export default function SettingsIndex() {
    return (
        <AdminLayout>
            <Head title="Paramètres Système" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Paramètres Système</h1>
                    <p className="text-gray-600">Configuration générale de la plateforme</p>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <Settings className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                        <CardTitle>Paramètres Système</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-gray-600">La page de paramètres sera bientôt disponible.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Cette section permettra de configurer les paramètres généraux de la plateforme.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}