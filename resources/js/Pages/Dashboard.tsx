import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from "@/Components/ui/button"
import { useToast } from "@/Components/ui/use-toast";
import { LucideIcon, List, UserCircle2, Heart, Briefcase, Settings, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CategoryCardProps {
    title: string;
    description: string;
    href: string;
    Icon: LucideIcon;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, href, Icon }) => {
    const { t } = useTranslation();

    return (
        <Card className="h-full transition-all duration-300 hover:shadow-lg rounded-lg">
            <CardHeader className="bg-gray-100 py-4 px-6">
                <div className="flex items-center space-x-4">
                    <Icon className="w-6 h-6 text-primary" />
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <p className="text-gray-600 mb-4">{description}</p>
                <Link href={href}>
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">{t('common.manage')}</Button>
                </Link>
            </CardContent>
        </Card>
    );
};

export default function Dashboard({ auth }: PageProps) {
    const { toast } = useToast();
    const { t } = useTranslation();

    const categories = [
        { title: t('admin.categories.experience'), description: t('admin.descriptions.experience'), href: "/experience-categories", Icon: List },
        { title: t('admin.categories.professions'), description: t('admin.descriptions.professions'), href: "/profession-categories", Icon: UserCircle2 },
        { title: t('admin.categories.hobbies'), description: t('admin.descriptions.hobbies'), href: "/hobbies", Icon: Heart },
        { title: t('admin.categories.professionsList'), description: t('admin.descriptions.professionsList'), href: "/professions", Icon: Briefcase },
        { title: t('admin.categories.competences'), description: t('admin.descriptions.competences'), href: "/competences", Icon: Trophy },
        { title: t('admin.categories.models'), description: t('admin.descriptions.models'), href: "/cv-models", Icon: Trophy },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-3xl font-bold text-gray-800">{t('pages.dashboard.title')}</h2>}
        >
            <Head title={t('pages.dashboard.title')} />
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => (
                        <CategoryCard key={index} {...category} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
