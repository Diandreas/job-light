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
    profession: {
        id: number;
        name: string;
        description: string;
    };
}

export default function ProfessionEdit({ auth, profession }: Props) {
    const [formData, setFormData] = useState({
        name: profession.name,
        description: profession.description,
    });

    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`/professions/${profession.id}`, formData)
            .then((response) => {
                toast({
                    title: 'Profession updated successfully',
                    description: 'Your changes have been saved.'
                });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Profession" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Edit Profession</h1>
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
