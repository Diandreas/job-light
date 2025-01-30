import { useEffect, FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
// import { Checkbox } from "@/Components/ui/checkbox";

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEmailFocused, setIsEmailFocused] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    // Animation variants pour le personnage
    const characterVariants = {
        idle: {
            y: [0, -10, 0],
            transition: {
                y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }
            }
        },
        excited: {
            scale: [1, 1.1, 1],
            rotate: [-5, 5, -5, 5, 0],
            transition: {
                duration: 0.5
            }
        },
        peek: {
            x: [0, 20, 0],
            rotate: [0, 15, 0],
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />

            <div className="relative flex flex-col items-center">
                {/* Character Animation */}
                <motion.div
                    className="absolute -top-32 w-32 h-32"
                    initial="idle"
                    animate={isHovered ? "excited" : isEmailFocused ? "peek" : "idle"}
                    variants={characterVariants}
                >
                    <div className="w-full h-full relative">
                        {/* Base character shape */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-purple-400 rounded-full" />
                        {/* Eyes */}
                        <motion.div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full">
                            <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-gray-900 rounded-full" />
                        </motion.div>
                        <motion.div className="absolute top-1/3 right-1/4 w-4 h-4 bg-white rounded-full">
                            <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-gray-900 rounded-full" />
                        </motion.div>
                        {/* Smile */}
                        <motion.div
                            className="absolute bottom-1/3 left-1/2 w-8 h-4 border-b-4 border-white rounded-full"
                            style={{ transform: 'translateX(-50%)' }}
                        />
                    </div>
                </motion.div>

                {/* Form Content */}
                <div className="w-full pt-8">
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg text-green-700"
                        >
                            {status}
                        </motion.div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
                            Bienvenue!
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className="pl-10"
                                    onChange={(e) => setData('email', e.target.value)}
                                    onFocus={() => setIsEmailFocused(true)}
                                    onBlur={() => setIsEmailFocused(false)}
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-500"
                                >
                                    {errors.email}
                                </motion.p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    className="pl-10 pr-10"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-500"
                                >
                                    {errors.password}
                                </motion.p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2">
                                {/*<Checkbox*/}
                                {/*    checked={data.remember}*/}
                                {/*    onCheckedChange={(checked) => setData('remember', checked)}*/}
                                {/*/>*/}
                                <span className="text-sm text-gray-600">Se souvenir de moi</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                                >
                                    Mot de passe oublié?
                                </Link>
                            )}
                        </div>

                        <div className="pt-4 space-y-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                                disabled={processing}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            >
                                <div className="flex items-center gap-2">
                                    <LogIn className="h-4 w-4" />
                                    {processing ? 'Connexion...' : 'Se connecter'}
                                </div>
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Pas encore inscrit?</span>
                                </div>
                            </div>

                            <Link
                                href={route('register')}
                                className="flex items-center justify-center gap-2 w-full text-sm text-amber-600 hover:text-amber-700"
                            >
                                Créer un compte
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
