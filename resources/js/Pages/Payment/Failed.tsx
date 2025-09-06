import React from 'react';
import { Head } from '@inertiajs/react';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface PaymentFailedProps {
    error: string;
}

export default function PaymentFailed({ error }: PaymentFailedProps) {
    return (
        <>
            <Head title="Paiement Échoué" />

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
                            <h2 className="mt-4 text-3xl font-bold text-gray-900">
                                Paiement Échoué
                            </h2>
                            <p className="mt-2 text-lg text-gray-600">
                                {error}
                            </p>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <XCircleIcon className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Transaction non confirmée
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>
                                                Votre paiement n'a pas pu être traité.
                                                Cela peut être dû à plusieurs raisons :
                                            </p>
                                            <ul className="mt-2 list-disc list-inside space-y-1">
                                                <li>Fonds insuffisants</li>
                                                <li>Problème de connexion</li>
                                                <li>Annulation par l'utilisateur</li>
                                                <li>Erreur technique temporaire</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Que faire maintenant ?
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>
                                                Vous pouvez réessayer le paiement ou contacter notre support
                                                si le problème persiste.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col space-y-3">
                            <a
                                href="/payment"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Réessayer le paiement
                            </a>
                            <a
                                href="/dashboard"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Retour au tableau de bord
                            </a>
                            <a
                                href="/support"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Contacter le support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
