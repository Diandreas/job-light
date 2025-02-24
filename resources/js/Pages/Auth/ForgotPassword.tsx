import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { MessageSquare } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="flex items-center justify-between mt-4">
                    <Link
                        href={route('support')}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-amber-500 transition-colors"
                    >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Need help? Contact support
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>Or contact us directly:</p>
                <div className="mt-2 space-y-2">
                    <a
                        href="https://wa.me/237693427913"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-amber-600 hover:text-amber-700"
                    >
                        WhatsApp: +237693427913
                    </a>
                    <a
                        href="mailto:guidy.makeitreall@gmail.com"
                        className="block text-amber-600 hover:text-amber-700"
                    >
                        Email: guidy.makeitreall@gmail.com
                    </a>
                </div>
            </div>
        </GuestLayout>
    );
}
