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
                    // Don't reset data, just the dirty state
                    setIsDirty(false);
                    // @ts-ignore
                    onUpdate(response.props.cvInformation.personalInformation);
                    // Optional: Show discrete success indicator instead of toast for auto-save?
                    // For now, keep toast but maybe less intrusive "Saved" label in UI.
                }
            },
            onError: (errors) => {
                // Keep error toast
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

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer for auto-save (2 seconds)
        autoSaveTimerRef.current = setTimeout(() => {
            submitData();
        }, 2000);
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
        <Card className="w-full max-w-md mx-auto border-amber-100 dark:border-amber-800 dark:bg-gray-800 transition-colors p-2">
            <CardHeader className="p-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-800 dark:text-white transition-colors">
                    {t('personalInfos.editTitle')}
                </CardTitle>
                <div className="text-xs text-gray-400">
                    {processing ? t('common.saving') : (isDirty ? t('common.unsaved') : t('common.saved'))}
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {formFields.map((field) => (
                        <div key={field.id} className="space-y-1">
                            <Label
                                htmlFor={field.id}
                                className="text-sm text-gray-700 dark:text-gray-300 transition-colors"
                            >
                                {field.label}
                            </Label>
                            <Input
                                id={field.id}
                                type={field.type}
                                value={field.value}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="h-8 text-sm border-amber-200 focus:ring-1 focus:ring-amber-500
                                         dark:border-amber-800 dark:bg-gray-700 dark:text-white
                                         transition-colors"
                            />
                            {errors[field.id as keyof typeof errors] && (
                                <p className="text-xs text-red-600 dark:text-red-400 transition-colors">
                                    {errors[field.id as keyof typeof errors]}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="flex items-center gap-2 pt-3">
                        <Button
                            type="submit"
                            disabled={processing || !isDirty}
                            className={`h-8 text-sm px-3 text-white transition-all duration-200 
                                ${isDirty
                                    ? "bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 dark:from-amber-600 dark:to-purple-600"
                                    : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"}`}
                        >
                            {t('personalInfos.actions.save')}
                        </Button>
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="outline"
                            className="h-8 text-sm px-3 border-amber-200 hover:bg-amber-50
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
