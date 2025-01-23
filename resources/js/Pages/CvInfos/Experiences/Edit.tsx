import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { useToast } from '@/Components/ui/use-toast';
import TextInput from "@/Components/TextInput";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/Components/ui/card";
import { Textarea } from "@/Components/ui/textarea";

const ExperienceEdit = ({ auth, experience, categories }) => {
    const { toast } = useToast();
    const { data, setData, put, processing, errors, reset } = useForm({
        name: experience.name || '',
        description: experience.description || '',
        date_start: experience.date_start || '',
        date_end: experience.date_end || '',
        output: experience.output || '',
        experience_categories_id: experience.experience_categories_id || '',
        comment: experience.comment || '',
        InstitutionName: experience.InstitutionName || '',
        attachment: null,
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        put(route('experiences.update', experience.id), {
            onSuccess: () => {
                toast({
                    title: "Expérience mise à jour avec succès",
                    description: "Votre expérience a été mise à jour.",
                });
                reset();
            },
            onError: (errors) => {
                console.error(errors);
                toast({
                    title: "Erreur",
                    description: "Une erreur est survenue lors de la mise à jour de l'expérience.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        // <AuthenticatedLayout user={auth.user}>
        //     <Head title="Modifier une expérience" />
            <div className="container mx-auto py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Modifier une expérience</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Nom de l'expérience" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="InstitutionName" value="Nom de l'institution" />
                                    <TextInput
                                        id="InstitutionName"
                                        type="text"
                                        value={data.InstitutionName}
                                        onChange={(e) => setData('InstitutionName', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.InstitutionName} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="date_start" value="Date de début" />
                                    <TextInput
                                        id="date_start"
                                        type="date"
                                        value={data.date_start}
                                        onChange={(e) => setData('date_start', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.date_start} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="date_end" value="Date de fin" />
                                    <TextInput
                                        id="date_end"
                                        type="date"
                                        value={data.date_end}
                                        onChange={(e) => setData('date_end', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.date_end} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full"
                                    rows={4}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="output" value="Résultat" />
                                <TextInput
                                    id="output"
                                    type="text"
                                    value={data.output}
                                    onChange={(e) => setData('output', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.output} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="experience_categories_id" value="Catégorie" />
                                <Select
                                    value={data.experience_categories_id}
                                    onValueChange={(value) => setData('experience_categories_id', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionnez une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.experience_categories_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="comment" value="Commentaire" />
                                <Textarea
                                    id="comment"
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    className="mt-1 block w-full"
                                    rows={3}
                                />
                                <InputError message={errors.comment} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="attachment" value="Pièce jointe" />
                                <TextInput
                                    id="attachment"
                                    type="file"
                                    onChange={(e) => setData('attachment', e.target.files[0])}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.attachment} className="mt-2" />
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link
                            href={route('experiences.index')}
                            className="text-sm text-gray-600 hover:text-gray-900 transition duration-150 ease-in-out"
                        >
                            Annuler
                        </Link>
                        <Button type="submit" disabled={processing} onClick={handleSubmit}>
                            Mettre à jour l'expérience
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        // {/*</AuthenticatedLayout>*/}
    );
};

export default ExperienceEdit;
