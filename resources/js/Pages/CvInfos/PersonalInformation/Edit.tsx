import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import { useTheme } from 'next-themes';

interface User {
    firstName: string;
    email: string;
    github: string;
    linkedin: string;
    address: string;
    phone: string;
}

interface Props {
    user: User;
    onUpdate: (data: any) => void;
    onCancel: () => void;
}

const PersonalInformationEdit: React.FC<Props> = ({ user, onUpdate, onCancel }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { toast } = useToast();

    const { data, setData, put, processing, errors, reset } = useForm({
        name: user.firstName,
        email: user.email,
        github: user.github,
        linkedin: user.linkedin,
        address: user.address,
        phone_number: user.phone,
    });

    const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
        toast({
            title,
            description,
            variant,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('personal-information.update'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (response) => {

                // @ts-ignore
                if (response.props.cvInformation?.personalInformation) {
                    reset('name', 'email', 'github', 'linkedin', 'address', 'phone_number');
                    // @ts-ignore
                    onUpdate(response.props.cvInformation.personalInformation);
                    showToast(
                        t('personalInfos.toast.success.title'),
                        t('personalInfos.toast.success.updated')
                    );
                } else {
                    showToast(
                        t('personalInfos.toast.error.title'),
                        t('personalInfos.toast.error.userDataNotFound'),
                        "destructive"
                    );
                }
            },
            onError: (errors) => {
                showToast(
                    t('personalInfos.toast.error.title'),
                    t('personalInfos.toast.error.updateFailed'),
                    "destructive"
                );
            }
        });
    };

    const formFields = [
        { id: 'name', type: 'text', label: t('personalInfos.form.name'), value: data.name },
        { id: 'email', type: 'email', label: t('personalInfos.form.email'), value: data.email },
        { id: 'github', type: 'text', label: t('personalInfos.form.github'), value: data.github },
        { id: 'linkedin', type: 'text', label: t('personalInfos.form.linkedin'), value: data.linkedin },
        { id: 'address', type: 'text', label: t('personalInfos.form.address'), value: data.address },
        { id: 'phone_number', type: 'text', label: t('personalInfos.form.phoneNumber'), value: data.phone_number }
    ];

    return (
        <Card className="w-full border-amber-100 dark:border-amber-800 dark:bg-gray-800 transition-colors">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white transition-colors">
                    {t('personalInfos.editTitle')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formFields.map((field) => (
                        <div key={field.id}>
                            <Label
                                htmlFor={field.id}
                                className="text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                {field.label}
                            </Label>
                            <Input
                                id={field.id}
                                type={field.type}
                                value={field.value}
                                // @ts-ignore
                                onChange={(e) => setData(field.id, e.target.value)}
                                className="mt-1 block w-full border-amber-200 focus:ring-amber-500
                                         dark:border-amber-800 dark:bg-gray-700 dark:text-white
                                         transition-colors"
                            />
                            {errors[field.id] && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 transition-colors">
                                    {errors[field.id]}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="flex items-center gap-2 pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-amber-500 to-purple-500
                                     hover:from-amber-600 hover:to-purple-600 text-white
                                     dark:from-amber-600 dark:to-purple-600
                                     transition-all duration-200"
                        >
                            {t('personalInfos.actions.save')}
                        </Button>
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                            className="border-amber-200 hover:bg-amber-50
                                     dark:border-amber-800 dark:hover:bg-gray-700
                                     dark:text-white transition-colors"
                        >
                            {t('personalInfos.actions.cancel')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default PersonalInformationEdit;
