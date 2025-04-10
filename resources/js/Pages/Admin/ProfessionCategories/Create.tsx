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

const ProfessionCategoriesCreate = ({ auth }: Props) => {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(route('profession-categories.store'), {
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
            <Head title="Create Profession Category" />
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
                        <div className="mb-4">
                            <InputLabel htmlFor="description" value="Description" />
                            <TextInput
                                id="description"
                                name="description"
                                value={data.description}
                                className="block w-full"
                                autoComplete="description"
                                onChange={(event) => setData('description', event.target.value)}
                                required
                            />
                            <InputError message={errors.description} />
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

export default ProfessionCategoriesCreate;
