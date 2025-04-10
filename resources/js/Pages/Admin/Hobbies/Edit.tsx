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
    hobby: {
        id: number;
        name: string;
    };
}

export default function HobbiesEdit({ auth, hobby }: Props) {
    const [formData, setFormData] = useState({
        name: hobby.name,
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

        axios.put(`/hobbies/${hobby.id}`, formData)
            .then((response) => {
                toast({
                    title: 'Hobby updated successfully',
                    description: 'Your changes have been saved.'
                });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Edit Hobby" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Edit Hobby</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="name">Name</Label>
                        <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <Button type="submit">Save Changes</Button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
