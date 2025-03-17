import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { JobListing, Competence, User } from '@/types';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/Components/ui/card';
import {
    Briefcase,
    Calendar,
    Clock,
    DollarSign,
    Filter,
    Search,
    Tag,
    X
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import { Checkbox } from '@/Components/ui/checkbox';
import JobPortalNav from '@/Components/JobPortalNav';

interface Props {
    jobListings: {
        data: JobListing[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    skills: Competence[];
    filters?: {
        skills?: string;
        experience_level?: string;
        budget_min?: string;
        budget_max?: string;
    };
    auth: {
        user: User;
    };
}

export default function Index({ auth, jobListings, skills, filters = {} }: Props) {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<number[]>(
        filters.skills ? filters.skills.split(',').map(Number) : []
    );
    const [experienceLevel, setExperienceLevel] = useState<string | undefined>(
        filters.experience_level
    );
    const [budgetMin, setBudgetMin] = useState<string | undefined>(
        filters.budget_min
    );
    const [budgetMax, setBudgetMax] = useState<string | undefined>(
        filters.budget_max
    );
    const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

    const handleSkillToggle = (skillId: number) => {
        setSelectedSkills(prev =>
            prev.includes(skillId)
                ? prev.filter(id => id !== skillId)
                : [...prev, skillId]
        );
    };

    const applyFilters = () => {
        router.get(route('job-listings.index'), {
            skills: selectedSkills.length ? selectedSkills.join(',') : undefined,
            experience_level: experienceLevel,
            budget_min: budgetMin,
            budget_max: budgetMax,
            search: searchTerm || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setSelectedSkills([]);
        setExperienceLevel(undefined);
        setBudgetMin(undefined);
        setBudgetMax(undefined);
        setSearchTerm('');
        router.get(route('job-listings.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const formatBudget = (min?: number | null, max?: number | null, type?: string) => {
        if (!min && !max) return t('jobListing.budgetNegotiable');

        const currency = '€';
        const minDisplay = min ? `${min}${currency}` : '';
        const maxDisplay = max ? `${max}${currency}` : '';

        if (min && max) {
            return `${minDisplay} - ${maxDisplay} ${type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        } else if (min) {
            return `${t('jobListing.from')} ${minDisplay} ${type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        } else if (max) {
            return `${t('jobListing.upTo')} ${maxDisplay} ${type === 'hourly' ? `/ ${t('jobListing.hour')}` : ''}`;
        }

        return '';
    };

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: i18n.language === 'fr' ? fr : enUS
            });
        } catch (e) {
            return dateString;
        }
    };

    const FilterSidebar = () => (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-medium mb-2">{t('jobListing.filters.skills')}</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {skills.map((skill) => (
                        <div key={skill.id} className="flex items-center">
                            <Checkbox
                                id={`skill-${skill.id}`}
                                checked={selectedSkills.includes(skill.id)}
                                onCheckedChange={() => handleSkillToggle(skill.id)}
                            />
                            <label
                                htmlFor={`skill-${skill.id}`}
                                className="ml-2 text-sm font-medium cursor-pointer"
                            >
                                {skill.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-2">{t('jobListing.filters.experienceLevel')}</h3>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('jobListing.filters.selectExperience')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="beginner">{t('jobListing.experienceLevel.beginner')}</SelectItem>
                        <SelectItem value="intermediate">{t('jobListing.experienceLevel.intermediate')}</SelectItem>
                        <SelectItem value="expert">{t('jobListing.experienceLevel.expert')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <h3 className="text-lg font-medium mb-2">{t('jobListing.filters.budget')}</h3>
                <div className="flex items-center space-x-2">
                    <Input
                        type="number"
                        placeholder={t('jobListing.filters.min')}
                        value={budgetMin || ''}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="w-full"
                    />
                    <span>-</span>
                    <Input
                        type="number"
                        placeholder={t('jobListing.filters.max')}
                        value={budgetMax || ''}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="pt-4 space-x-2">
                <Button onClick={applyFilters}>{t('jobListing.filters.apply')}</Button>
                <Button variant="outline" onClick={resetFilters}>{t('jobListing.filters.reset')}</Button>
            </div>
        </div>
    );

    const MobileFilters = () => (
        <div className="md:hidden">
            <Button
                variant="outline"
                className="w-full flex items-center justify-between mb-4"
                onClick={() => setIsFilterMobileOpen(!isFilterMobileOpen)}
            >
                <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {t('jobListing.filters.filters')}
                </span>
                {selectedSkills.length > 0 && (
                    <Badge variant="secondary">{selectedSkills.length}</Badge>
                )}
            </Button>

            {isFilterMobileOpen && (
                <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-4 mb-4">
                    <FilterSidebar />
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {t('jobListing.title')}
                    </h2>
                    <JobPortalNav currentRoute="job-listings.index" />
                </div>
            }
        >
            <Head title={t('jobListing.title')} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">{t('jobListing.title')}</h1>
                            <p className="text-gray-600 dark:text-gray-400">{t('jobListing.description')}</p>
                        </div>
                        <div className="mt-4 md:mt-0 space-x-2">
                            <Link href={route('job-listings.create')}>
                                <Button>{t('jobListing.createNew')}</Button>
                            </Link>
                            <Link href={route('job-listings.my-listings')}>
                                <Button variant="outline">{t('jobListing.myListings')}</Button>
                            </Link>
                            <Link href={route('job-applications.my-applications')}>
                                <Button variant="outline">{t('jobListing.myApplications')}</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="w-full md:w-64 lg:w-72 hidden md:block">
                            <div className="sticky top-24 bg-white dark:bg-gray-950 rounded-lg shadow p-4">
                                <FilterSidebar />
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="mb-4 flex flex-col md:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder={t('jobListing.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                </div>
                                <Button onClick={applyFilters} className="whitespace-nowrap">
                                    {t('jobListing.search')}
                                </Button>
                            </div>

                            <MobileFilters />

                            {jobListings.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-lg font-medium">{t('jobListing.noListings')}</h3>
                                    <p className="mt-1 text-gray-500">
                                        {t('jobListing.noListingsDescription')}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {jobListings.data.map((job) => (
                                        <Card key={job.id} className={cn(
                                            "transition-all hover:shadow-md",
                                            job.is_featured && "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                                        )}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">
                                                            <Link
                                                                href={route('job-listings.show', job.id)}
                                                                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                                            >
                                                                {job.title}
                                                            </Link>
                                                            {job.is_featured && (
                                                                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                                                                    {t('jobListing.featured')}
                                                                </Badge>
                                                            )}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {job.recruiter?.name && (
                                                                <>{t('jobListing.postedBy')} {job.recruiter.name} • </>
                                                            )}
                                                            {formatDate(job.created_at)}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">
                                                            {formatBudget(job.budget_min, job.budget_max, job.budget_type)}
                                                        </div>
                                                        <CardDescription>
                                                            {job.budget_type === 'fixed'
                                                                ? t('jobListing.fixedPrice')
                                                                : t('jobListing.hourlyRate')}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pb-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {job.description}
                                                </p>

                                                {job.requiredSkills && job.requiredSkills.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {job.requiredSkills.map((skill) => (
                                                            <TooltipProvider key={skill.id}>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Badge
                                                                            variant={
                                                                                skill.pivot?.importance === 'required'
                                                                                    ? 'default'
                                                                                    : skill.pivot?.importance === 'preferred'
                                                                                        ? 'secondary'
                                                                                        : 'outline'
                                                                            }
                                                                            className="cursor-help"
                                                                        >
                                                                            {skill.name}
                                                                        </Badge>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {skill.pivot?.importance === 'required'
                                                                            ? t('jobListing.skillRequired')
                                                                            : skill.pivot?.importance === 'preferred'
                                                                                ? t('jobListing.skillPreferred')
                                                                                : t('jobListing.skillNiceToHave')}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="flex justify-between pt-2">
                                                <div className="flex items-center text-xs text-gray-500 space-x-3">
                                                    {job.experience_level && (
                                                        <div className="flex items-center">
                                                            <Briefcase className="h-3 w-3 mr-1" />
                                                            <span>
                                                                {job.experience_level === 'beginner'
                                                                    ? t('jobListing.experienceLevel.beginner')
                                                                    : job.experience_level === 'intermediate'
                                                                        ? t('jobListing.experienceLevel.intermediate')
                                                                        : t('jobListing.experienceLevel.expert')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {job.duration && (
                                                        <div className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            <span>{job.duration}</span>
                                                        </div>
                                                    )}
                                                    {job.deadline && (
                                                        <div className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            <span>{new Date(job.deadline).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center">
                                                        <Tag className="h-3 w-3 mr-1" />
                                                        <span>{job.tokens_required} {t('jobListing.tokens')}</span>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('job-listings.show', job.id)}
                                                    className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
                                                >
                                                    {t('jobListing.viewDetails')}
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {jobListings.last_page > 1 && (
                                <Pagination className="mt-8">
                                    <PaginationContent>
                                        {jobListings.current_page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href={`?page=${jobListings.current_page - 1}`}
                                                    aria-label={t('common.pagination.previous')}
                                                />
                                            </PaginationItem>
                                        )}

                                        {jobListings.links.slice(1, -1).map((link, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    href={link.url || '#'}
                                                    isActive={link.active}
                                                    aria-label={t('common.pagination.page') + ' ' + link.label}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        {jobListings.current_page < jobListings.last_page && (
                                            <PaginationItem>
                                                <PaginationNext
                                                    href={`?page=${jobListings.current_page + 1}`}
                                                    aria-label={t('common.pagination.next')}
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 