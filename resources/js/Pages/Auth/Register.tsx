import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    UserPlus, Mail, Lock, User, ArrowRight, CheckCircle,
    XCircle, Eye, EyeOff, Loader2
} from 'lucide-react';

export default function Register({ professions }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const strengthLabels = ['Faible', 'Moyen', 'Bon', 'Fort'];

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
        return strength;
    };

    const InputIcon = ({ icon: Icon, error }) => (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            error ? 'text-red-500' : 'text-gray-400'
        }`}>
            <Icon className="w-5 h-5" />
        </div>
    );

    return (
        <GuestLayout>
            <Head title="Register" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-amber-100">
                    <CardHeader className=" text-center pb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                            <UserPlus className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
                            Créer votre compte
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Rejoignez-nous et commencez à créer votre CV professionnel
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Name Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="name" className="text-gray-700">Nom complet</Label>
                                <div className="relative">
                                    <InputIcon icon={User} error={errors.name} />
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`pl-10 bg-white/50 ${
                                            errors.name
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-amber-100 focus:border-amber-500'
                                        }`}
                                        placeholder="Entrez votre nom"
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-sm text-red-500 flex items-center gap-1"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {errors.name}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Email Input */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="email" className="text-gray-700">Email</Label>
                                <div className="relative">
                                    <InputIcon icon={Mail} error={errors.email} />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`pl-10 bg-white/50 ${
                                            errors.email
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-amber-100 focus:border-amber-500'
                                        }`}
                                        placeholder="votre@email.com"
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-sm text-red-500 flex items-center gap-1"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {errors.email}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Password Fields */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {/* Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-gray-700">Mot de passe</Label>
                                    <div className="relative">
                                        <InputIcon icon={Lock} error={errors.password} />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => {
                                                setData('password', e.target.value);
                                                checkPasswordStrength(e.target.value);
                                            }}
                                            className={`pl-10 pr-10 bg-white/50 ${
                                                errors.password
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'border-amber-100 focus:border-amber-500'
                                            }`}
                                            placeholder="Votre mot de passe"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    <div className="space-y-1">
                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength * 25}%` }}
                                                className={`h-full ${strengthColors[passwordStrength]}`}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            Force: {strengthLabels[passwordStrength]}
                                            {passwordStrength === 3 && (
                                                <CheckCircle className="w-3 h-3 text-green-500" />
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-gray-700">
                                        Confirmer le mot de passe
                                    </Label>
                                    <div className="relative">
                                        <InputIcon icon={Lock} error={errors.password_confirmation} />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`pl-10 pr-10 bg-white/50 ${
                                                errors.password_confirmation
                                                    ? 'border-red-500 focus:border-red-500'
                                                    : 'border-amber-100 focus:border-amber-500'
                                            }`}
                                            placeholder="Confirmez le mot de passe"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {errors.password_confirmation && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-sm text-red-500 flex items-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {errors.password_confirmation}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                        <Link
                            href={route('login')}
                            className="text-gray-600 hover:text-amber-500 flex items-center gap-2 text-sm"
                        >
                            Déjà inscrit ?
                        </Link>
                        <Button
                            onClick={submit}
                            disabled={processing}
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                        >
                            {processing ? (
                                <motion.div
                                    animate={{ scale: [1, 0.97] }}
                                    transition={{ repeat: Infinity, duration: 0.3 }}
                                    className="flex items-center gap-2"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Inscription...
                                </motion.div>
                            ) : (
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-2"
                                >
                                    S'inscrire
                                    <ArrowRight className="w-4 h-4" />
                                </motion.div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </GuestLayout>
    );
}
