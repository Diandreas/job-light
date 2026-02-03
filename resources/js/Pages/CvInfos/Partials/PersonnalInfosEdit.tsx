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
    const [isDirty, setIsDirty] = React.useState(false);

    // Timer for auto-save
    const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

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

    const submitData = React.useCallback(() => {
        put(route('personal-information.update'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (response) => {
                // @ts-ignore
                if (response.props.cvInformation?.personalInformation) {
                    setIsDirty(false);
                    // @ts-ignore
                    onUpdate(response.props.cvInformation.personalInformation);
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
    }, [put, onUpdate, t]);

    const handleChange = (id: string, value: string) => {
        setData(id as any, value);
        setIsDirty(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        submitData();
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, []);

    const formFields = [
        { id: 'name', type: 'text', label: t('personalInfos.form.name'), value: data.name },
        { id: 'email', type: 'email', label: t('personalInfos.form.email'), value: data.email },
        { id: 'github', type: 'text', label: t('personalInfos.form.github'), value: data.github },
        { id: 'linkedin', type: 'text', label: t('personalInfos.form.linkedin'), value: data.linkedin },
        { id: 'address', type: 'text', label: t('personalInfos.form.address'), value: data.address },
        { id: 'phone_number', type: 'text', label: t('personalInfos.form.phoneNumber'), value: data.phone_number }
    ];

    return (
        <Card className="w-full max-w-md mx-auto border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors p-2 shadow-sm rounded-xl">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                    {t('personalInfos.editTitle')}
                </CardTitle>
                <div className="text-xs font-medium text-neutral-400">
                    {processing ? t('common.saving') : (isDirty ? t('common.unsaved') : t('common.saved'))}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formFields.map((field) => (
                        <div key={field.id} className="space-y-1.5">
                            <Label
                                htmlFor={field.id}
                                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                            >
                                {field.label}
                            </Label>
                            <Input
                                id={field.id}
                                type={field.type}
                                value={field.value}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                            />
                            {errors[field.id as keyof typeof errors] && (
                                <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                                    {errors[field.id as keyof typeof errors]}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={processing || !isDirty}
                            className={`flex-1 transition-all duration-200 font-medium
                                ${isDirty
                                    ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
                                    : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 cursor-not-allowed"}`}
                        >
                            {t('personalInfos.actions.save')}
                        </Button>
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
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
