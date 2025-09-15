import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Search, MapPin, User, Briefcase, GraduationCap, Star,
    Globe, Mail, Linkedin, Github, Eye, Filter, Users,
    Target, Award, Calendar, ArrowRight, ExternalLink
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface ProfilesProps {
    auth: { user: any };
    profiles: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            username: string;
            profession: { name: string } | null;
            full_profession: string;
            address: string;
            linkedin: string;
            github: string;
            phone_number: string;
            photo: string;
            experiences: Array<{
                id: number;
                name: string;
                InstitutionName: string;
                date_start: string;
                date_end: string;
            }>;
            competences: Array<{
                id: number;
                name: string;
            }>;
            languages: Array<{
                id: number;
                name: string;
                level: string;
            }>;
        }>;
        links: any;
        meta: any;
    };
    filters: {
        profession?: string;
        location?: string;
        experience_years?: string;
        skills?: string;
    };
    canAccessProfiles: boolean;
}

export default function Profiles({ auth, profiles = { data: [], links: [], meta: { total: 0, last_page: 1 } }, filters = {}, canAccessProfiles = false }: ProfilesProps) {
    const { t } = useTranslation();

    const { data, setData, get, processing } = useForm({
        profession: filters.profession || '',
        location: filters.location || '',
        experience_years: filters.experience_years || '',
        skills: filters.skills || ''
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('job-portal.profiles'), {
            preserveState: true,
            preserveScroll: true
        });
    };

    const clearFilters = () => {
        setData({
            profession: '',
            location: '',
            experience_years: '',
            skills: ''
        });
        get(route('job-portal.profiles'));
    };

    const calculateExperience = (experiences: any[]) => {
        if (!experiences || experiences.length === 0) return 0;
        
        let totalMonths = 0;
        experiences.forEach(exp => {
            const start = new Date(exp.date_start);
            const end = exp.date_end ? new Date(exp.date_end) : new Date();
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            totalMonths += months;
        });
        
        return Math.round(totalMonths / 12);
    };

    if (!canAccessProfiles) {
        return (
            <AuthenticatedLayout user={auth.user}>
                <Head title={t('jobPortal.profile.accessRestricted')} />
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <Card className="max-w-md">
                        <CardContent className="p-8 text-center">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                                {t('jobPortal.profile.accessRestricted')}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {t('jobPortal.profile.accessMessage')}
                            </p>
                            <Button asChild>
                                <a href="mailto:guidy.makeitreall@gmail.com">
                                    {t('jobPortal.profile.requestAccess')}
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head
                title={`${t('jobPortal.profile.pageTitle') || 'Recherche de Profils'} | JobLight`}
            >
                <meta name="description" content={t('jobPortal.profile.pageDescription') || 'Trouvez les meilleurs candidats'} />
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                    {t('jobPortal.profile.profileSearch')}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('jobPortal.profile.findCandidates')}
                                </p>
                            </div>
                            
                            <Link href={route('job-portal.index')}>
                                <Button variant="outline">
                                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                    {t('jobPortal.profile.backToJobs')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Filtres de recherche */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                {t('jobPortal.profile.searchFilters')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <Input
                                            type="text"
                                            placeholder={t('jobPortal.profile.professionPlaceholder')}
                                            value={data.profession}
                                            onChange={(e) => setData('profession', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="text"
                                            placeholder={t('jobPortal.profile.locationPlaceholder')}
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Select 
                                            value={data.experience_years} 
                                            onValueChange={(value) => setData('experience_years', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('jobPortal.profile.experiencePlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{t('jobPortal.profile.anyExperience')}</SelectItem>
                                                <SelectItem value="1">{t('jobPortal.profile.oneYearPlus')}</SelectItem>
                                                <SelectItem value="3">{t('jobPortal.profile.threeYearsPlus')}</SelectItem>
                                                <SelectItem value="5">{t('jobPortal.profile.fiveYearsPlus')}</SelectItem>
                                                <SelectItem value="10">{t('jobPortal.profile.tenYearsPlus')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Input
                                            type="text"
                                            placeholder={t('jobPortal.profile.skillsPlaceholder')}
                                            value={data.skills}
                                            onChange={(e) => setData('skills', e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        <Search className="w-4 h-4 mr-2" />
                                        {t('jobPortal.profile.search')}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={clearFilters}>
                                        {t('jobPortal.profile.clear')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Résultats */}
                    <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            {t('jobPortal.profile.profilesFound', { count: profiles?.meta?.total || 0 })}
                        </p>
                    </div>

                    {/* Grille des profils */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profiles?.data?.map((profile, index) => (
                            <motion.div
                                key={profile.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className="hover:shadow-lg transition-all duration-300 group h-full">
                                    <CardContent className="p-6">
                                        {/* Header du profil */}
                                        <div className="text-center mb-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                                {profile.photo ? (
                                                    <img src={`/storage/${profile.photo}`} alt={profile.name} className="w-14 h-14 rounded-full object-cover" />
                                                ) : (
                                                    <User className="w-8 h-8 text-white" />
                                                )}
                                            </div>
                                            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                                                {profile.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {profile.profession?.name || profile.full_profession || t('jobPortal.profile.professionNotSpecified')}
                                            </p>
                                            {profile.address && (
                                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {profile.address}
                                                </div>
                                            )}
                                        </div>

                                        {/* Expérience */}
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Briefcase className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {t('jobPortal.profile.experience')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('jobPortal.profile.experienceYears', { years: calculateExperience(profile.experiences) })} • {t('jobPortal.profile.positions', { count: profile.experiences.length })}
                                            </div>
                                            {profile.experiences.slice(0, 2).map(exp => (
                                                <div key={exp.id} className="text-xs text-gray-500 mt-1">
                                                    {exp.name} chez {exp.InstitutionName}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Compétences */}
                                        {profile.competences.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Star className="w-4 h-4 text-purple-600" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {t('jobPortal.profile.skills')}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {profile.competences.slice(0, 4).map(competence => (
                                                        <Badge key={competence.id} variant="secondary" className="text-xs">
                                                            {competence.name}
                                                        </Badge>
                                                    ))}
                                                    {profile.competences.length > 4 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{profile.competences.length - 4}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Langues */}
                                        {profile.languages.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Globe className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {t('jobPortal.profile.languages')}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {profile.languages.slice(0, 3).map(lang => lang.name).join(', ')}
                                                    {profile.languages.length > 3 && ` +${profile.languages.length - 3}`}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="space-y-2">
                                            <Link href={route('portfolio.show', profile.username || profile.email)}>
                                                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    {t('jobPortal.profile.viewPortfolio')}
                                                    <ExternalLink className="w-3 h-3 ml-2" />
                                                </Button>
                                            </Link>
                                            
                                            <div className="flex gap-2">
                                                {profile.linkedin && (
                                                    <Button variant="outline" size="sm" asChild className="flex-1">
                                                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                                                            <Linkedin className="w-3 h-3 mr-1" />
                                                            {t('jobPortal.profile.linkedin')}
                                                        </a>
                                                    </Button>
                                                )}
                                                {profile.github && (
                                                    <Button variant="outline" size="sm" asChild className="flex-1">
                                                        <a href={profile.github} target="_blank" rel="noopener noreferrer">
                                                            <Github className="w-3 h-3 mr-1" />
                                                            {t('jobPortal.profile.github')}
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" asChild className="flex-1">
                                                    <a href={`mailto:${profile.email}`}>
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {t('jobPortal.profile.contact')}
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {profiles?.meta?.last_page > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2">
                                {profiles?.links?.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                            link.active 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white text-gray-600 hover:bg-gray-50 border'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message si aucun profil */}
                    {(!profiles?.data || profiles.data.length === 0) && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                                {t('jobPortal.profile.noProfilesFound')}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {t('jobPortal.profile.tryModifyingSearch')}
                            </p>
                            <Button onClick={clearFilters} variant="outline">
                                {t('jobPortal.profile.viewAllProfiles')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}