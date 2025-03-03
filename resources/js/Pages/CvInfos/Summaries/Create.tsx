import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";

import InputError from "@/Components/InputError";
import { useToast } from '@/Components/ui/use-toast';
import {Textarea} from "@/Components/ui/textarea";

// @ts-ignore
const SummaryCreate = ({ auth }) => {
    const { toast } = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    // @ts-ignore
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('summaries.store'), {
            onSuccess: () => {
                toast({
                    title: "Résumé créé avec succès",
                });
                reset();
            },
            onError: (errors) => {
                for (const field in errors) {
                    toast({
                        title: 'Erreur de validation',
                        description: errors[field],
                        variant: 'destructive',
                    });
                }
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Créer un résumé" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Créer un résumé</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Titre du résumé" />
                        <TextInput id="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1 block w-full" />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Description" />
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button type="submit" disabled={processing}>Créer</Button>
                        <Link href={route('summaries.index')} className="text-sm text-gray-600 underline">
                            Annuler
                        </Link>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default SummaryCreate;
