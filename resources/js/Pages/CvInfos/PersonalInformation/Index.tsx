import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

// @ts-ignore
const PersonalInformationIndex = ({ auth, user }) => {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Informations personnelles" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Informations personnelles</h1>
                <p>Nom : {user.name}</p>
                <p>Email : {user.email}</p>
                <p>GitHub : {user.github}</p>
                <p>LinkedIn : {user.linkedin}</p>
                <p>Adresse : {user.address}</p>
                <p>Numéro de téléphone : {user.phone_number}</p>
                <Link href={route('personal-information.edit')}>
                    <Button>Modifier</Button>
                </Link>
            </div>
        </AuthenticatedLayout>
    );
};

export default PersonalInformationIndex;
