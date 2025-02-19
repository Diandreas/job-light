import { useEffect, FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, LogIn, UserPlus, KeyRound } from 'lucide-react';
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { useTranslation } from 'react-i18next';

export default function Login({ status, canResetPassword }: { status?: string, canResetPassword: boolean }) {
    const { t } = useTranslation();
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

    return (
        <GuestLayout>
            <Head title={t('auth.login.button')} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-16 h-16 mx-auto bg-gradient-to-r from-amber-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg"
                    >
                        <LogIn className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-purple-500 bg-clip-text text-transparent">
                        {t('auth.login.title')}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {t('auth.login.subtitle')}
                    </p>
                </div>

                {status && (
                    <Alert>
                        <AlertDescription>{status}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {/* Email Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-2"
                    >
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="email"
                                placeholder={t('auth.login.email')}
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="pl-10 bg-white/50 border-amber-100 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-sm"
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Password Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-2"
                    >
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="password"
                                placeholder={t('auth.login.password')}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="pl-10 bg-white/50 border-amber-100 focus:border-amber-500 focus:ring-amber-500"
                            />
                        </div>
                        {errors.password && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-500 text-sm"
                            >
                                {errors.password}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Remember Me */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center space-x-2"
                    >
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                        />
                        <label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {t('auth.login.remember')}
                        </label>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="pt-4 space-y-4"
                    >
                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600"
                        >
                            <motion.div
                                animate={{ scale: processing ? 0.95 : 1 }}
                                className="flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                {processing ? t('auth.login.processing') : t('auth.login.button')}
                            </motion.div>
                        </Button>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-gray-600 hover:text-amber-500 flex items-center gap-2"
                                >
                                    <KeyRound className="w-4 h-4" />
                                    {t('auth.login.forgotPassword')}
                                </Link>
                            )}

                            <Link
                                href={route('register')}
                                className="text-gray-600 hover:text-amber-500 flex items-center gap-2"
                            >
                                <UserPlus className="w-4 h-4" />
                                {t('auth.login.createAccount')}
                            </Link>
                        </div>
                    </motion.div>
                </form>
            </motion.div>
        </GuestLayout>
    );
}
