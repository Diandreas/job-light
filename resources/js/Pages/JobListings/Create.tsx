import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Competence, User } from '@/types';
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
    ChevronLeft,
    Calendar,
    Clock,
    Info,
    Tag,
    X,
    Plus,
    Briefcase
} from 'lucide-react';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/Components/ui/accordion';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Checkbox } from '@/Components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Separator } from '@/Components/ui/separator';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/Components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/Components/ui/calendar';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/Components/ui/command';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/Components/ui/alert';
import { cn } from '@/lib/utils';
import JobPortalNav from '@/Components/JobPortalNav';

interface Props {
    auth: {
        user: User;
    };
    skills: Competence[];
}

interface SelectedSkill extends Competence {
    importance: 'required' | 'preferred' | 'nice_to_have';
}

type Currency = 'EUR' | 'XAF';

export default function Create({ auth, skills }: Props) {
    const { t, i18n } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [skillSearchTerm, setSkillSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
    const [skillPopoverOpen, setSkillPopoverOpen] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('EUR');

    const { data, setData, post, errors, processing, reset } = useForm({
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        budget_type: 'fixed',
        currency: 'EUR',
        duration: '',
        experience_level: '',
        deadline: '',
        tokens_required: '1',
        skills: [] as { id: number; importance: string }[],
        publish: true,
    });

    const filteredSkills = skills.filter(skill =>
        skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
        !selectedSkills.some(selected => selected.id === skill.id)
    );

    const addSkill = (skill: Competence, importance: 'required' | 'preferred' | 'nice_to_have' = 'required') => {
        setSelectedSkills(prev => [...prev, { ...skill, importance }]);
        // Update form data to include the selected skills
        updateSkillsInForm([...selectedSkills, { ...skill, importance }]);
        setSkillPopoverOpen(false);
        setSkillSearchTerm('');
    };

    const removeSkill = (skillId: number) => {
        setSelectedSkills(prev => prev.filter(skill => skill.id !== skillId));
        // Update form data when removing skills
        updateSkillsInForm(selectedSkills.filter(skill => skill.id !== skillId));
    };

    const updateSkillImportance = (skillId: number, importance: 'required' | 'preferred' | 'nice_to_have') => {
        setSelectedSkills(prev =>
            prev.map(skill =>
                skill.id === skillId
                    ? { ...skill, importance }
                    : skill
            )
        );
        // Update form data when changing importance
        updateSkillsInForm(
            selectedSkills.map(skill =>
                skill.id === skillId
                    ? { ...skill, importance }
                    : skill
            )
        );
    };

    const updateSkillsInForm = (skills: SelectedSkill[]) => {
        setData('skills', skills.map(skill => ({
            id: skill.id,
            importance: skill.importance
        })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setData('currency', selectedCurrency);
        post(route('job-listings.store'));
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setData('deadline', date ? format(date, 'yyyy-MM-dd') : '');
    };

    const getImportanceBadgeColor = (importance: string) => {
        switch (importance) {
            case 'required':
                return 'bg-red-100 hover:bg-red-200 text-red-800 border-red-200';
            case 'preferred':
                return 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-200';
            case 'nice_to_have':
                return 'bg-green-100 hover:bg-green-200 text-green-800 border-green-200';
            default:
                return '';
        }
    };

    const getCurrencySymbol = () => {
        return selectedCurrency === 'EUR' ? t('jobListing.currency.euro') : t('jobListing.currency.fcfa');
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {t('jobListing.create.title')}
                    </h2>
                    <JobPortalNav currentRoute="job-listings.create" />
                </div>
            }
        >
            <Head title={t('jobListing.create.title')} />

            <div className="py-4">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('job-listings.index')}
                            className="flex items-center text-sm text-gray-600 hover:text-amber-600 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            {t('jobListing.backToListings')}
                        </Link>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('jobListing.create.title')}</CardTitle>
                            <CardDescription>{t('jobListing.create.description')}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title" className={errors.title ? 'text-red-500' : ''}>
                                            {t('jobListing.create.titleLabel')} <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className={errors.title ? 'border-red-500' : ''}
                                            placeholder={t('jobListing.create.titlePlaceholder')}
                                        />
                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className={errors.description ? 'text-red-500' : ''}>
                                            {t('jobListing.create.descriptionLabel')} <span className="text-red-500">*</span>
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            className={cn(
                                                errors.description ? 'border-red-500' : '',
                                                "min-h-[200px]"
                                            )}
                                            placeholder={t('jobListing.create.descriptionPlaceholder')}
                                        />
                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="budget_type">{t('jobListing.create.budgetTypeLabel')}</Label>
                                        <Select
                                            value={data.budget_type}
                                            onValueChange={(value) => setData('budget_type', value)}
                                        >
                                            <SelectTrigger id="budget_type" className="w-full">
                                                <SelectValue placeholder={t('jobListing.create.budgetTypePlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">{t('jobListing.create.budgetTypeFixed')}</SelectItem>
                                                <SelectItem value="hourly">{t('jobListing.create.budgetTypeHourly')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.budget_type && <p className="text-sm text-red-500">{errors.budget_type}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="experience_level">{t('jobListing.create.experienceLevelLabel')}</Label>
                                        <Select
                                            value={data.experience_level}
                                            onValueChange={(value) => setData('experience_level', value)}
                                        >
                                            <SelectTrigger id="experience_level" className="w-full">
                                                <SelectValue placeholder={t('jobListing.create.experienceLevelPlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">{t('jobListing.experienceLevel.beginner')}</SelectItem>
                                                <SelectItem value="intermediate">{t('jobListing.experienceLevel.intermediate')}</SelectItem>
                                                <SelectItem value="expert">{t('jobListing.experienceLevel.expert')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.experience_level && <p className="text-sm text-red-500">{errors.experience_level}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="currency">
                                            {t('jobListing.create.currencyLabel')}
                                        </Label>
                                        <Select
                                            value={selectedCurrency}
                                            onValueChange={(value) => {
                                                setSelectedCurrency(value as Currency);
                                                setData('currency', value);
                                            }}
                                        >
                                            <SelectTrigger id="currency" className="w-full">
                                                <SelectValue placeholder={t('jobListing.create.currencyPlaceholder')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="EUR">{t('jobListing.currency.euro')}</SelectItem>
                                                <SelectItem value="XAF">{t('jobListing.currency.fcfa')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.currency && <p className="text-red-500 text-sm mt-1">{errors.currency}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="budget_min">
                                                {t('jobListing.create.budgetMinLabel')}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="budget_min"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.budget_min}
                                                    onChange={e => setData('budget_min', e.target.value)}
                                                    placeholder={t('jobListing.create.budgetMinPlaceholder')}
                                                    className="pl-12"
                                                />
                                                <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500">{getCurrencySymbol()}</span>
                                            </div>
                                            {errors.budget_min && <p className="text-red-500 text-sm mt-1">{errors.budget_min}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="budget_max">
                                                {t('jobListing.create.budgetMaxLabel')}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="budget_max"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={data.budget_max}
                                                    onChange={e => setData('budget_max', e.target.value)}
                                                    placeholder={t('jobListing.create.budgetMaxPlaceholder')}
                                                    className="pl-12"
                                                />
                                                <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500">{getCurrencySymbol()}</span>
                                            </div>
                                            {errors.budget_max && <p className="text-red-500 text-sm mt-1">{errors.budget_max}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="duration">
                                                {t('jobListing.create.durationLabel')}
                                            </Label>
                                            <Input
                                                id="duration"
                                                value={data.duration}
                                                onChange={e => setData('duration', e.target.value)}
                                                placeholder={t('jobListing.create.durationPlaceholder')}
                                            />
                                            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="deadline">
                                                {t('jobListing.create.deadlineLabel')}
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !selectedDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {selectedDate ? (
                                                            format(selectedDate, "PPP", { locale: i18n.language === 'fr' ? fr : enUS })
                                                        ) : (
                                                            <span>{t('jobListing.create.deadlinePlaceholder')}</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={selectedDate}
                                                        onSelect={handleDateSelect}
                                                        initialFocus
                                                        disabled={(date) => date < new Date()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="tokens_required" className={errors.tokens_required ? 'text-red-500' : ''}>
                                            {t('jobListing.create.tokensRequiredLabel')} <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="flex items-center">
                                            <Input
                                                id="tokens_required"
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={data.tokens_required}
                                                onChange={e => setData('tokens_required', e.target.value)}
                                                className={cn(
                                                    errors.tokens_required ? 'border-red-500' : '',
                                                    "w-24"
                                                )}
                                            />
                                            <span className="ml-2 text-sm text-gray-500">{t('jobListing.create.tokensInfo')}</span>
                                        </div>
                                        {errors.tokens_required && <p className="text-red-500 text-sm mt-1">{errors.tokens_required}</p>}
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>
                                                {t('jobListing.create.skillsLabel')}
                                            </Label>
                                            <Popover open={skillPopoverOpen} onOpenChange={setSkillPopoverOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm" className="h-8">
                                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                                        {t('jobListing.create.addSkill')}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-0" align="end">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder={t('jobListing.create.searchSkills')}
                                                            value={skillSearchTerm}
                                                            onValueChange={setSkillSearchTerm}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>{t('jobListing.create.noSkillsFound')}</CommandEmpty>
                                                            <CommandGroup>
                                                                <ScrollArea className="h-60">
                                                                    {filteredSkills.map((skill) => (
                                                                        <CommandItem
                                                                            key={skill.id}
                                                                            value={skill.name}
                                                                            onSelect={() => addSkill(skill)}
                                                                        >
                                                                            {skill.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </ScrollArea>
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="border rounded-md p-3 min-h-24">
                                            {selectedSkills.length === 0 ? (
                                                <div className="text-center text-gray-500 py-6">
                                                    <p>{t('jobListing.create.noSkillsSelected')}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {selectedSkills.map((skill) => (
                                                        <div key={skill.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                                                            <div className="flex items-center">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        getImportanceBadgeColor(skill.importance),
                                                                        "mr-2"
                                                                    )}
                                                                >
                                                                    {skill.importance === 'required'
                                                                        ? t('jobListing.skillRequired')
                                                                        : skill.importance === 'preferred'
                                                                            ? t('jobListing.skillPreferred')
                                                                            : t('jobListing.skillNiceToHave')}
                                                                </Badge>
                                                                <span>{skill.name}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Select
                                                                    value={skill.importance}
                                                                    onValueChange={(value) => updateSkillImportance(
                                                                        skill.id,
                                                                        value as 'required' | 'preferred' | 'nice_to_have'
                                                                    )}
                                                                >
                                                                    <SelectTrigger className="h-8 w-32">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="required">{t('jobListing.skillRequired')}</SelectItem>
                                                                        <SelectItem value="preferred">{t('jobListing.skillPreferred')}</SelectItem>
                                                                        <SelectItem value="nice_to_have">{t('jobListing.skillNiceToHave')}</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeSkill(skill.id)}
                                                                    className="h-8 w-8 ml-1 text-gray-500 hover:text-red-500"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="publish"
                                            checked={data.publish}
                                            onCheckedChange={(checked) => setData('publish', checked)}
                                        />
                                        <Label htmlFor="publish">
                                            {t('jobListing.create.publishImmediately')}
                                        </Label>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                        disabled={processing}
                                    >
                                        {t('common.reset')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        {t('jobListing.create.submit')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 