import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"


export default function Register({ professions }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        profession_id: '',
        surname: '',
        github: '',
        linkedin: '',
        address: '',
        phone_number: '',
    });

    const [passwordStrength, setPasswordStrength] = useState(0);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length > 7) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        setPasswordStrength(strength);
    };

    return (
        <GuestLayout>
            <Head title="Register" />

                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Fill in the form below to register</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname">Surname</Label>
                                <Input
                                    id="surname"
                                    value={data.surname}
                                    onChange={(e) => setData('surname', e.target.value)}
                                    required
                                />
                                {errors.surname && <p className="text-sm text-red-500">{errors.surname}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => {
                                        setData('password', e.target.value);
                                        checkPasswordStrength(e.target.value);
                                    }}
                                    required
                                />
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                <div className="h-1 w-full bg-gray-200 mt-2">
                                    <div
                                        className={`h-full ${
                                            ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passwordStrength]
                                        }`}
                                        style={{ width: `${passwordStrength * 25}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Password strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profession">Profession</Label>
                            <Select
                                value={data.profession_id}
                                onValueChange={(value) => setData('profession_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a profession" />
                                </SelectTrigger>
                                <SelectContent>
                                    {professions.map((profession) => (
                                        <SelectItem key={profession.id} value={profession.id}>
                                            {profession.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.profession_id && <p className="text-sm text-red-500">{errors.profession_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="github">GitHub</Label>
                                <Input
                                    id="github"
                                    value={data.github}
                                    onChange={(e) => setData('github', e.target.value)}
                                />
                                {errors.github && <p className="text-sm text-red-500">{errors.github}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    value={data.linkedin}
                                    onChange={(e) => setData('linkedin', e.target.value)}
                                />
                                {errors.linkedin && <p className="text-sm text-red-500">{errors.linkedin}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                            />
                            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                value={data.phone_number}
                                onChange={(e) => setData('phone_number', e.target.value)}
                            />
                            {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Link href={route('login')} className="text-sm text-blue-500 hover:underline">
                        Already have an account?
                    </Link>
                    <Button onClick={submit} disabled={processing}>

                        Register
                    </Button>
                </CardFooter>
        </GuestLayout>
    );
}
