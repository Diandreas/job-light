import { useEffect, FormEventHandler } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, LogIn, UserPlus, KeyRound, Github } from 'lucide-react';
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

                {/* Social Login Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                >
                    <div className="text-center text-sm text-gray-500 mb-2">
                        {t('auth.login.social')}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
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
                        <a
                            href={route('social.login', { provider: 'linkedin' })}
                            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-md py-2 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="dark:hidden">
                                <path fill="#0288D1" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z" />
                                <path fill="#FFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" className="hidden dark:block">
                                <path fill="#2867B2" d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z" />
                                <path fill="#FFFFFF" d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z" />
                            </svg>
                            <span>LinkedIn</span>
                        </a>
                    </div>
                </motion.div>

                <div className="relative flex items-center justify-center">
                    <div className="absolute border-t border-gray-200 w-full"></div>
                    <div className="relative bg-white px-4 text-sm text-gray-500">ou</div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Email Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
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
                        transition={{ delay: 0.5 }}
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
                        transition={{ delay: 0.6 }}
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
                        transition={{ delay: 0.7 }}
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
