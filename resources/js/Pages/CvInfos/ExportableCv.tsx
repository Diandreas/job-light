import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Briefcase, GraduationCap, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Separator } from "@/Components/ui/separator";

export default function ExportableCv({ cvInformation, experiencesByCategory }) {
    const { hobbies, competences, professions, summaries, personalInformation } = cvInformation;

    if (!experiencesByCategory || Object.keys(experiencesByCategory).length === 0) {
        return <p>Aucune expérience à afficher.</p>;
    }

    // @ts-ignore
    return (
        <div id="exportable-cv" className="max-w-4xl mx-auto bg-white p-8 font-sans shadow-lg rounded-lg" >
            <header className="mb-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={personalInformation.avatar} alt={`${personalInformation.firstName} ${personalInformation.lastName}`} />
                    <AvatarFallback>{personalInformation.firstName[0]}{personalInformation.firstName[1]}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold mb-2 text-primary">{personalInformation.firstName} {personalInformation.lastName}</h1>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {professions.map(prof => (
                        <Badge key={prof.id} variant="secondary">{prof.name}</Badge>
                    ))}
                </div>
                <div className="flex flex-wrap justify-center text-sm text-muted-foreground gap-4">
                    <div className="flex items-center"><Mail className="w-4 h-4 mr-1" /> {personalInformation.email}</div>
                    <div className="flex items-center"><Phone className="w-4 h-4 mr-1" /> {personalInformation.phone}</div>
                    <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {personalInformation.address}</div>
                    <div className="flex items-center"><Linkedin className="w-4 h-4 mr-1" /> {personalInformation.linkedin}</div>
                    <div className="flex items-center"><Github className="w-4 h-4 mr-1" />{personalInformation.github}</div>
                </div>
            </header>

            <Separator className="my-6" />

            <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <section className="col-span-2">
                    {Object.entries(experiencesByCategory).map(([category, experiences]) => (
                        <Card key={category} className="mb-6">
                            <CardHeader>
                                <CardTitle className="text-2xl font-semibold text-primary">{category}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                { // @ts-ignore
                                    experiences.map((exp) => (
                                    <div key={exp.id} className="mb-4 last:mb-0">
                                        <h4 className="font-semibold text-primary">{exp.title}</h4>
                                        <p className="text-sm text-muted-foreground">{exp.company_name} | {exp.date_start} - {exp.date_end || 'Present'}</p>
                                        <p className="text-sm mt-1">{exp.description}</p>
                                        <p className="text-sm mt-1"><strong>Réalisations:</strong> {exp.output}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <aside>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center">
                                <Heart className="w-5 h-5 mr-2 text-red-500" /> Résumé
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{summaries[0]?.description}</p>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2 text-green-500" /> Compétences
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {competences.map(comp => (
                                    <Badge key={comp.id} variant="outline">{comp.name}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2 text-purple-500" /> Formations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {professions.map(prof => (
                                <Badge key={prof.id} variant="secondary" className="mb-2 mr-2">{prof.name}</Badge>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold flex items-center">
                                <Heart className="w-5 h-5 mr-2 text-pink-500" /> Centres d'Intérêt
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {hobbies.map(hobby => (
                                    <Badge key={hobby.id} variant="outline">{hobby.name}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </main>
        </div>
    );
}
