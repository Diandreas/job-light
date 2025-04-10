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
    profession_category: {
        id: number;
        name: string;
        description: string;
    };
}

export default function ProfessionCategoriesEdit({ auth, profession_category }: Props) {
    const [formData, setFormData] = useState({
        name: profession_category.name,
        description: profession_category.description,
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

        axios.put(`/profession-categories/${profession_category.id}`, formData)
            .then((response) => {
                toast({
                    title: 'Profession category updated successfully',
                    description: 'Your changes have been saved.'
                });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Profession Category" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Edit Profession Category</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="name">Name</Label>
                        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="description">Description</Label>
                        <Input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required />
                    </div>
                    <Button type="submit">Save Changes</Button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
