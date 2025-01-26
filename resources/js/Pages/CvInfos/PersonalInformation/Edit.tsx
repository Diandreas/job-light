import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { useToast } from "@/Components/ui/use-toast";
import axios from 'axios';

const PersonalInformationEdit = ({ user, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        linkedin: user.linkedin || '',
        github: user.github || ''
    });
    const { toast } = useToast();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(route('personal-information.update'), formData);
            if (response.data.success) {
                onUpdate(formData);
                toast({
                    title: "Succès",
                    description: "Informations personnelles mises à jour avec succès",
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Échec de la mise à jour des informations personnelles",
                variant: "destructive",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
                    <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <input
                        type="text"
                        name="linkedin"
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700">GitHub</label>
                    <input
                        type="text"
                        name="github"
                        id="github"
                        value={formData.github}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" onClick={onCancel} variant="outline">
                    Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white">
                    Enregistrer
                </Button>
            </div>
        </form>
    );
};

export default PersonalInformationEdit;
