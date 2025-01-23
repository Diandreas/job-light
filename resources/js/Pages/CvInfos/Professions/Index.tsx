import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

// @ts-ignore
const UserProfessions = ({ auth, user_profession }) => {
    const handleRemoveProfession = () => {
        // Logique pour supprimer la profession (mettre à jour profession_id à null)
        if (confirm('Êtes-vous sûr de vouloir supprimer votre profession ?')) {
            // Utilisez Axios ou Inertia pour envoyer une requête DELETE à la route appropriée
            // Par exemple, avec Axios :
            // axios.delete(route('user-professions.destroy', auth.user.id))
            //    .then(() => { ... })
            //    .catch(() => { ... });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Ma Profession" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Ma Profession</h1>

                {user_profession ? (
                    <div className="bg-white rounded-md shadow-md p-4">
                        <h2 className="text-lg font-semibold mb-2">{user_profession.name}</h2>
                        <p className="text-gray-800 mb-4">{user_profession.description}</p>

                        <div className="flex justify-end">
                            <Button variant="destructive" onClick={handleRemoveProfession}>
                                Supprimer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                        <p className="text-sm">Vous n'avez pas encore de profession. Cliquez sur "Attribuer une profession" pour commencer.</p>
                    </div>
                )}

                <div className="mt-4">
                    <Link href={route('user-professions.create')}>
                        <Button>Attribuer une profession</Button>
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default UserProfessions;
