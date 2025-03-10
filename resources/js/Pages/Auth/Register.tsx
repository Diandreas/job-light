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
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            error ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'
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
                <Card className="border-amber-100 dark:border-gray-700 dark:bg-gray-800">
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
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {t('auth.register.subtitle')}
                        </p>

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
                                        className={`pl-10 bg-white/50 dark:bg-gray-900/50 ${
                                            errors.name
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
                                        className={`pl-10 bg-white/50 dark:bg-gray-900/50 ${
                                            errors.email
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
                                            className={`pl-10 pr-10 bg-white/50 dark:bg-gray-900/50 ${
                                                errors.password
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
                                            className={`pl-10 pr-10 bg-white/50 dark:bg-gray-900/50 ${
                                                errors.password_confirmation
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
                                            className={`pl-10 bg-white/50 dark:bg-gray-900/50 ${
                                                errors.referralCode
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
