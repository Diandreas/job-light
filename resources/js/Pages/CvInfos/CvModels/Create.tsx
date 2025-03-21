import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from "@/Components/InputLabel";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select" // Assuming you have a Select component
import InputError from "@/Components/InputError";
import axios from 'axios';
import { useToast } from '@/Components/ui/use-toast';

interface Hobby {
    id: number;
    name: string;
}

interface Props {
    auth: any;
    availableHobbies: Hobby[];
}
// Remove @ts-ignore
const UserHobbiesCreate = ({ auth, availableHobbies }: Props) => {
    const [selectedHobbyId, setSelectedHobbyId] = useState<number | null>(null);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedHobbyId) {
            toast({
                title: 'Please select a hobby',
                variant: 'destructive' // Or an appropriate variant
            });
            return;
        }

        axios.post('/user-hobbies', {
            user_id: auth.user.id,
            hobby_id: selectedHobbyId, // Send the ID of the selected hobby
        })
            .then((response) => {
                if (response.data.success) {
                    window.location.href = '/user-hobbies';
                    toast({
                        title: 'Hobby assigned successfully',
                        description: 'The new hobby has been assigned to the user.'
                    });
                }
            })
            .catch((error) => {
                // Better error handling, display error message from the server if available
                toast({
                    title: 'Error assigning hobby',
                    description: error.response?.data?.message || 'An error occurred.'
                });
                console.error(error);
            });
    };
    useEffect(() => {
        // Log the available hobbies to the console for debugging
        // console.log('Available hobbies:', availableHobbies);
    }, [availableHobbies]); // Run only when availableHobbies changes


    // @ts-ignore
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create User Hobby" />
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Create User Hobby</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <InputLabel htmlFor="hobby_id" value="Hobby" />
                        <Select onValueChange={(value: string) => setSelectedHobbyId(parseInt(value))}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a hobby" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableHobbies.map((hobby) => (
                                    <SelectItem key={hobby.id} value={hobby.id.toString()}>
                                        {hobby.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit">Create</Button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
};

export default UserHobbiesCreate;
