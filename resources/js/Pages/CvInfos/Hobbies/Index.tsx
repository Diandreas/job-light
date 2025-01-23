import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Trash2 } from "lucide-react";
import {PageProps} from "@/types";
import {toast} from "@/Components/ui/use-toast";

interface Hobby {
    id: number;
    name: string;
}

interface UserHobbiesProps extends PageProps {
    user_hobbies: Hobby[];
}
// Remove the redundant `UserHobbies` function declaration
export default function UserHobbies({ auth, user_hobbies }: UserHobbiesProps) { // Destructure directly
    const handleDeassignHobby = (hobbyId: number) => {
        if (confirm('Are you sure you want to de-assign this hobby?')) {
            axios.delete(`/user-hobbies/${auth.user.id}/${hobbyId}`)
                .then(() => {
                    // Filter out the de-assigned hobby from the current list of hobbies
                    const updatedHobbies = hobbies.filter(hobby => hobby.id !== hobbyId);
                    // Set the hobbies state to the updated list of hobbies
                    setHobbies(updatedHobbies);
                    // Show a success toast message
                    toast({
                        title: 'Success',
                        description: 'Hobby de-assigned successfully!',

                    });
                })
                .catch(error => {
                    if (error.response && error.response.status === 403) {
                        toast({
                            title: 'Unauthorized',
                            description: 'You are not allowed to de-assign this hobby.',
                            variant: 'destructive',
                        });
                    } else {
                        console.error('Error de-assigning hobby:', error);
                        toast({
                            title: 'An error occurred',
                            description: 'Failed to de-assign hobby. Please try again later.',
                            variant: 'destructive',
                        });
                    }
                });
        }
    };

    const [hobbies, setHobbies] = useState<Hobby[]>(user_hobbies);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">User Hobbies</h2>}
        >
            <Head title="User Hobbies" />
            <div className="w-full md:w-1/2 p-4">
                <Link href="/user-hobbies/create">
                    <Button>Assign a new hobby</Button>
                </Link>
            </div>
            <div className="flex flex-wrap">
                {hobbies.map((hobby) => (
                    <div key={hobby.id} className="w-full md:w-1/2 p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>{hobby.name}</CardTitle>
                            </CardHeader>
                            <CardFooter>
                                <Button onClick={() => handleDeassignHobby(hobby.id)}>
                                    <Trash2 size={18} />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ))}
            </div>
        </AuthenticatedLayout>
    );
};


