import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from "axios";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useToast } from "@/Components/ui/use-toast";

interface Props {
    auth: any;
    experience_category: {
        id: number;
        name: string;
        description: string;
        ranking: number;
    };
}

export default function ExperienceCategoriesEdit({ auth, experience_category }: Props) {
    const [formData, setFormData] = useState({
        name: experience_category.name,
        description: experience_category.description,
        ranking: experience_category.ranking,
    });

    const { toast } = useToast();


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // @ts-ignore
    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`/experience-categories/${experience_category.id}`, formData)
            .then((response) => {
                // Rediriger l'utilisateur vers la page d'index des catégories d'expérience
                // window.location.href = '/experience-categories?update';


                // Afficher un message de succè
                toast({
                    title: 'Experience category updated successfully',
                    description: 'Your changes have been saved.'
                });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Experience Category" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Edit Experience Category</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="name">Name</Label>
                        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="description">Description</Label>
                        <Input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="ranking">Ranking</Label>
                        <Input type="number" id="ranking" name="ranking" value={formData.ranking} onChange={handleChange} required />
                    </div>
                    <Button type="submit">Save Changes</Button>

                </form>
                <br/>
                <Button  onClick={() => {
                    window.location.href = '/experience-categories?update';
                }} >Back</Button>

            </div>
        </AuthenticatedLayout>
    );
}
