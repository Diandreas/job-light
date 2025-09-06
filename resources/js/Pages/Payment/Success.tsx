import React from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface PaymentSuccessProps {
    message: string;
    transaction_id?: string;
    amount?: number;
}

export default function PaymentSuccess({ message, transaction_id, amount }: PaymentSuccessProps) {
    return (
        <>
            <Head title="Paiement Réussi" />

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                            <h2 className="mt-4 text-3xl font-bold text-gray-900">
                                Paiement Réussi !
                            </h2>
                            <p className="mt-2 text-lg text-gray-600">
                                {message}
                            </p>
                        </div>

                        {(transaction_id || amount) && (
                            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Détails de la transaction
                                </h3>
                                <dl className="space-y-3">
                                    {transaction_id && (
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">
                                                ID de transaction :
                                            </dt>
                                            <dd className="text-sm text-gray-900 font-mono">
                                                {transaction_id}
                                            </dd>
                                        </div>
                                    )}
                                    {amount && (
                                        <div className="flex justify-between">
                                            <dt className="text-sm font-medium text-gray-500">
                                                Montant :
                                            </dt>
                                            <dd className="text-sm text-gray-900 font-semibold">
                                                {amount.toLocaleString()} FCFA
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        <div className="mt-8 space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800">
                                            Transaction confirmée
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700">
                                            <p>
                                                Votre paiement a été traité avec succès.
                                                Vous pouvez maintenant utiliser votre solde pour accéder aux fonctionnalités premium.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col space-y-3">
                            <a
                                href="/dashboard"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Retour au tableau de bord
                            </a>
                            <a
                                href="/payment"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Effectuer un autre paiement
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
