import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { useForm } from '@inertiajs/react';
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";

interface Props {
    auth: any;
}

const HobbiesCreate = ({ auth }: Props) => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('hobbies.store'), {
            onSuccess: () => {
                // TODO: handle success
            },
            onError: () => {
                // TODO: handle error
            },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Create Hobby" />
            <div className="flex flex-wrap">
                <div className="w-full md:w-1/2 p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <InputLabel htmlFor="name" value="Name" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="block w-full"
                                onChange={(event) => setData('name', event.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                        <Button type="submit" disabled={processing}>
                            Create
                        </Button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default HobbiesCreate;
