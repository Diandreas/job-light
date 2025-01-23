import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";

const PersonalInformationEdit = ({ user, onUpdate, onCancel }) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.firstName,
        email: user.email,
        github: user.github,
        linkedin: user.linkedin,
        address: user.address,
        phone_number: user.phone,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('personal-information.update'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (response) => {
                console.log('Success response:', response);

                // Ensure the correct user data is available in the response
                // @ts-ignore
                if (response.props.cvInformation && response.props.cvInformation.personalInformation) {
                    reset('name', 'email', 'github', 'linkedin', 'address', 'phone_number');
                    // @ts-ignore
                    onUpdate(response.props.cvInformation.personalInformation);
                } else {
                    console.error("User data not found in response");
                }
            },
            onError: (errors) => {
                console.error(errors);
            }
        });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Modifier informations personnelles</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nom" />
                    <TextInput
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="github" value="GitHub" />
                    <TextInput
                        id="github"
                        type="text"
                        value={data.github}
                        onChange={(e) => setData('github', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.github} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="linkedin" value="LinkedIn" />
                    <TextInput
                        id="linkedin"
                        type="text"
                        value={data.linkedin}
                        onChange={(e) => setData('linkedin', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.linkedin} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="address" value="Address" />
                    <TextInput
                        id="address"
                        type="text"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.address} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="phone_number" value="Phone Number" />
                    <TextInput
                        id="phone_number"
                        type="text"
                        value={data.phone_number}
                        onChange={(e) => setData('phone_number', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.phone_number} className="mt-2" />
                </div>
                <div className="flex items-center gap-2">
                    <Button type="submit" disabled={processing}>
                        Enregistrer les modifications
                    </Button>
                    <Button type="button" onClick={onCancel} variant="outline">
                        Annuler
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default PersonalInformationEdit;
