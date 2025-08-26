import React from 'react';
import { motion } from 'framer-motion';
import { 
    User, Briefcase, Award, Heart, FileText, Contact, 
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface ProfessionalDesignProps {
    user: any;
    cvData: any;
    settings: any;
    isPreview?: boolean;
}

// Utility function to safely extract text from objects
const safeText = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
        return value.description || value.name || String(value);
    }
    return '';
};

export default function ProfessionalDesign({ 
    user, 
    cvData, 
    settings, 
    isPreview = false 
}: ProfessionalDesignProps) {
    
    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#0f172a';
    
    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
            style={{ 
                '--primary-color': primaryColor,
                '--primary-rgb': hexToRgb(primaryColor) 
            } as React.CSSProperties}
        >
            {/* Header Section */}
            <motion.section 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-white shadow-sm border-b"
            >
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        
                        {/* Photo de profil */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                        >
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 border-4 border-white shadow-xl">
                                {profilePhoto ? (
                                    <img 
                                        src={profilePhoto} 
                                        alt={`${user.name} - Photo de profil`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-16 h-16 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Informations principales */}
                        <div className="flex-1 text-center md:text-left">
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl md:text-4xl font-bold text-slate-800 mb-2"
                            >
                                {user.name || `${cvData?.first_name || ''} ${cvData?.last_name || ''}`.trim()}
                            </motion.h1>
                            
                            {(settings.tagline || cvData?.professional_title) && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl font-medium mb-4"
                                    style={{ color: primaryColor }}
                                >
                                    {settings.tagline || cvData.professional_title}
                                </motion.p>
                            )}

                            {(settings.bio || cvData?.summary) && (
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-slate-600 max-w-2xl leading-relaxed"
                                >
                                    {settings.bio || safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                                </motion.p>
                            )}

                            {/* Contact rapide */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap justify-center md:justify-start gap-4 mt-6"
                            >
                                {(cvData?.email || user.email) && (
                                    <a 
                                        href={`mailto:${cvData?.email || user.email}`}
                                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{cvData?.email || user.email}</span>
                                    </a>
                                )}
                                {cvData?.phone && (
                                    <a 
                                        href={`tel:${cvData.phone}`}
                                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{cvData.phone}</span>
                                    </a>
                                )}
                                {cvData?.address && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm">{cvData.address}</span>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Expériences */}
                        {settings.show_experiences && cvData?.experiences?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Briefcase className="w-6 h-6" style={{ color: primaryColor }} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-800">Expériences Professionnelles</h2>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {cvData.experiences.map((exp, index) => (
                                                <motion.div 
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.8 + index * 0.1 }}
                                                    className="border-l-2 pl-6 relative"
                                                    style={{ borderColor: `${primaryColor}30` }}
                                                >
                                                    <div 
                                                        className="absolute -left-2 w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: primaryColor }}
                                                    />
                                                    
                                                    <div className="bg-slate-50 rounded-lg p-4">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                                            <h3 className="text-lg font-semibold text-slate-800">
                                                                {exp.name}
                                                            </h3>
                                                            <Badge variant="secondary" className="w-fit">
                                                                {exp.date_start && exp.date_end ? 
                                                                    `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - ${new Date(exp.date_end).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}` :
                                                                    exp.date_start ? 
                                                                        `${new Date(exp.date_start).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} - Présent` :
                                                                        'Période non spécifiée'
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-600 font-medium mb-2">
                                                            {exp.InstitutionName}
                                                        </p>
                                                        {exp.description && (
                                                            <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                                                {safeText(exp.description)}
                                                            </p>
                                                        )}

                                                        {/* Dates précises */}
                                                        {(exp.date_start || exp.date_end) && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>
                                                                    {exp.date_start && new Date(exp.date_start).toLocaleDateString('fr-FR')}
                                                                    {exp.date_start && exp.date_end && ' - '}
                                                                    {exp.date_end && new Date(exp.date_end).toLocaleDateString('fr-FR')}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Institution si différente de l'entreprise */}
                                                        {exp.output && (
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>Résultats: {exp.output}</span>
                                                            </div>
                                                        )}

                                                        {/* Catégorie */}
                                                        {exp.category_name && (
                                                            <div className="mb-3">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {exp.category_name}
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        {/* Références */}
                                                        {exp.references && exp.references.length > 0 && (
                                                            <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                                                <h4 className="text-sm font-medium text-slate-700 mb-2">Références :</h4>
                                                                <div className="space-y-2">
                                                                    {exp.references.map((ref, refIndex) => (
                                                                        <div key={refIndex} className="text-xs text-slate-600">
                                                                            <div className="font-medium">{ref.name}</div>
                                                                            {ref.function && <div>Fonction: {ref.function}</div>}
                                                                            {ref.email && <div>Email: {ref.email}</div>}
                                                                            {ref.telephone && <div>Tél: {ref.telephone}</div>}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {exp.attachment_path && (
                                                            <div className="mt-3">
                                                                <a 
                                                                    href={exp.attachment_path}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                    {exp.attachment_name || 'Voir le document'}
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Résumé */}
                        {settings.show_summary && cvData?.summary && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-8">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <FileText className="w-6 h-6" style={{ color: primaryColor }} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-slate-800">À Propos</h2>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed">
                                            {safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        
                        {/* Compétences */}
                        {settings.show_competences && cvData?.skills?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Award className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">Compétences</h3>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {cvData.skills.map((skill, index) => (
                                                <Badge 
                                                    key={index}
                                                    variant="outline" 
                                                    className="border-slate-200 hover:border-slate-300 transition-colors"
                                                >
                                                    {typeof skill === 'string' ? skill : skill.name || skill.skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Centres d'intérêt */}
                        {settings.show_hobbies && cvData?.hobbies?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Heart className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">Centres d'Intérêt</h3>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {cvData.hobbies.map((hobby, index) => (
                                                <Badge 
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-slate-100 text-slate-700"
                                                >
                                                    {typeof hobby === 'string' ? hobby : hobby.name || hobby.hobby}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Langues */}
                        {settings.show_languages && cvData?.languages?.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.15 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Globe className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">Langues</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {cvData.languages.map((lang, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <span className="font-medium text-slate-700">{lang.name}</span>
                                                    {lang.pivot?.language_level && (
                                                        <span className="text-sm text-slate-500 px-2 py-1 bg-white rounded">
                                                            {lang.pivot.language_level}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}

                        {/* Contact */}
                        {settings.show_contact_info && (cvData?.email || cvData?.phone || cvData?.address) && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div 
                                                className="p-2 rounded-lg"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <Contact className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800">Contact</h3>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {(cvData?.email || user.email) && (
                                                <a 
                                                    href={`mailto:${cvData?.email || user.email}`}
                                                    className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    <span className="text-sm">{cvData?.email || user.email}</span>
                                                </a>
                                            )}
                                            {cvData?.phone && (
                                                <a 
                                                    href={`tel:${cvData.phone}`}
                                                    className="flex items-center gap-3 text-slate-600 hover:text-slate-800 transition-colors"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    <span className="text-sm">{cvData.phone}</span>
                                                </a>
                                            )}
                                            {cvData?.address && (
                                                <div className="flex items-center gap-3 text-slate-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-sm">{cvData.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-6xl mx-auto px-6 py-8 text-center">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} {user.name}. Portfolio professionnel généré avec JobLight.
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Utility function to convert hex to rgb
function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '15, 23, 42'; // default slate-800 rgb
    
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ].join(', ');
}