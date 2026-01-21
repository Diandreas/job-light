import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useTranslation } from 'react-i18next';
import {
    UserPlus, Mail, Lock, User, ArrowRight, CheckCircle,
    XCircle, Eye, EyeOff, Loader2, Gift
} from 'lucide-react';

export default function Register({ referralCode }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        referralCode: referralCode || '', // Initialize with referral code from props if available
    });

    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Set referral code from props when component mounts or when referralCode prop changes
    useEffect(() => {
        if (referralCode) {
            setData('referralCode', referralCode);
        }
    }, [referralCode]);

    const strengthColors = [
        'bg-red-500 dark:bg-red-600',
        'bg-yellow-500 dark:bg-yellow-600',
        'bg-blue-500 dark:bg-blue-600',
        'bg-green-500 dark:bg-green-600'
    ];

    const strengthLabels = [
        t('auth.register.password.strength.weak'),
        t('auth.register.password.strength.medium'),
        t('auth.register.password.strength.good'),
        t('auth.register.password.strength.strong')
    ];

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
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
            }`}>
            <Icon className="w-5 h-5" />
        </div>
    );

    return (
        <GuestLayout>
            <Head title={t('auth.register.title')} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="min-h-[calc(100vh-4rem)] flex flex-col sm:justify-center items-center px-4 mobile-safe-area border-amber-100 dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="text-center pb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
                        >
                            <UserPlus className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
                            {t('auth.register.title')}
                        </h2>
                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                            {t('auth.register.subtitle')}
                        </div>

                        {/* Display referral info banner if there's a referral code */}
                        {referralCode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 py-2 px-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-700/30 rounded-lg flex items-center gap-2 text-amber-600 dark:text-amber-400"
                            >
                                <Gift className="w-4 h-4" />
                                <span className="text-sm">Vous avez été parrainé(e) ! Des avantages vous attendent.</span>
                            </motion.div>
                        )}

                        {/* Social Register Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 space-y-3"
                        >
                            {/*<div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">*/}
                            {/*    {t('auth.register.social') || "S'inscrire avec"}*/}
                            {/*</div>*/}
                            <div className="grid grid-cols-1 gap-3">
                                <a
                                    href={route('social.login', { provider: 'google' })}
                                    className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-md py-2 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="dark:hidden">
                                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                    </svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="hidden dark:block">
                                        <path fill="#FFD54F" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                        <path fill="#FF7043" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                        <path fill="#66BB6A" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                        <path fill="#42A5F5" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                    </svg>
                                    <span>Google</span>
                                </a>
                                {/*<a*/}
                                {/*    href={route('linkedin.login')}*/}
                                {/*    className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-md py-2 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"*/}
                                {/*>*/}
                                {/*    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="dark:hidden">*/}
                                {/*        <path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z" />*/}
                                {/*        <path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z" />*/}
                                {/*    </svg>*/}
                                {/*    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="hidden dark:block">*/}
                                {/*        <path fill="#2867B2" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z" />*/}
                                {/*        <path fill="#FFFFFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z" />*/}
                                {/*    </svg>*/}
                                {/*    <span>LinkedIn</span>*/}
                                {/*</a>*/}
                            </div>
                        </motion.div>

                        <div className="relative flex items-center justify-center mt-4">
                            <div className="absolute border-t border-gray-200 dark:border-gray-700 w-full"></div>
                            <div className="relative bg-white dark:bg-gray-800 px-4 text-sm text-gray-500 dark:text-gray-400">ou</div>
                        </div>
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
                                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                                    {t('auth.register.name.label')}
                                </Label>
                                <div className="relative">
                                    <InputIcon icon={User} error={errors.name} />
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`pl-10 bg-white/50 dark:bg-gray-900/50 ${errors.name
                                            ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400'
                                            : 'border-amber-100 focus:border-amber-500 dark:border-gray-700 dark:focus:border-amber-400'
                                            }`}
                                        placeholder={t('auth.register.name.placeholder')}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
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
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                    {t('auth.register.email.label')}
                                </Label>
                                <div className="relative">
                                    <InputIcon icon={Mail} error={errors.email} />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`pl-10 bg-white/50 dark:bg-gray-900/50 ${errors.email
                                            ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400'
                                            : 'border-amber-100 focus:border-amber-500 dark:border-gray-700 dark:focus:border-amber-400'
                                            }`}
                                        placeholder={t('auth.register.email.placeholder')}
                                    />
                                </div>
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
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
                                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                                        {t('auth.register.password.label')}
                                    </Label>
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
                                            className={`pl-10 pr-10 bg-white/50 dark:bg-gray-900/50 ${errors.password
                                                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400'
                                                : 'border-amber-100 focus:border-amber-500 dark:border-gray-700 dark:focus:border-amber-400'
                                                }`}
                                            placeholder={t('auth.register.password.placeholder')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
                                        <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength * 25}%` }}
                                                className={`h-full ${strengthColors[passwordStrength]}`}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            {t('auth.register.password.strength.label')}: {strengthLabels[passwordStrength]}
                                            {passwordStrength === 3 && (
                                                <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400" />
                                            )}
                                        </p>
                                    </div>

                                    <AnimatePresence>
                                        {errors.password && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {errors.password}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300">
                                        {t('auth.register.password.confirm')}
                                    </Label>
                                    <div className="relative">
                                        <InputIcon icon={Lock} error={errors.password_confirmation} />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`pl-10 pr-10 bg-white/50 dark:bg-gray-900/50 ${errors.password_confirmation
                                                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400'
                                                : 'border-amber-100 focus:border-amber-500 dark:border-gray-700 dark:focus:border-amber-400'
                                                }`}
                                            placeholder={t('auth.register.password.confirm_placeholder')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
                                                className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {errors.password_confirmation}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            {/* Referral Code Field - Only show if no referral code was provided via URL */}
                            {!referralCode && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="referralCode" className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <span>Code de parrainage</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">(optionnel)</span>
                                    </Label>
                                    <div className="relative">
                                        <InputIcon icon={Gift} error={errors.referralCode} />
                                        <Input
                                            id="referralCode"
                                            value={data.referralCode}
                                            onChange={(e) => setData('referralCode', e.target.value)}
                                            className={`pl-10 bg-white/50 dark:bg-gray-900/50 ${errors.referralCode
                                                ? 'border-red-500 focus:border-red-500 dark:border-red-400 dark:focus:border-red-400'
                                                : 'border-amber-100 focus:border-amber-500 dark:border-gray-700 dark:focus:border-amber-400'
                                                }`}
                                            placeholder="Entrez un code de parrainage si vous en avez un"
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {errors.referralCode && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {errors.referralCode}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                        <Link
                            href={route('login')}
                            className="text-gray-600 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 flex items-center gap-2 text-sm"
                        >
                            {t('auth.register.already_registered')}
                        </Link>
                        <Button
                            onClick={submit}
                            disabled={processing}
                            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-400 dark:to-purple-400 dark:hover:from-amber-500 dark:hover:to-purple-500"
                        >
                            {processing ? (
                                <motion.div
                                    animate={{ scale: [1, 0.97] }}
                                    transition={{ repeat: Infinity, duration: 0.3 }}
                                    className="flex items-center gap-2"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('auth.register.button.processing')}
                                </motion.div>
                            ) : (
                                <motion.div
                                    whileHover={{ x: 5 }}
                                    className="flex items-center gap-2"
                                >
                                    {t('auth.register.button.submit')}
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
