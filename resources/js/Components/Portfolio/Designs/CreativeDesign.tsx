import React from 'react';
import { motion } from 'framer-motion';
import { 
    User, Briefcase, Award, Heart, FileText, Contact, 
    Mail, Phone, MapPin, Github, Linkedin, ExternalLink,
    Globe, Calendar, Sparkles, Zap
} from 'lucide-react';
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface CreativeDesignProps {
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

export default function CreativeDesign({ 
    user, 
    cvData, 
    settings, 
    isPreview = false 
}: CreativeDesignProps) {
    
    const profilePhoto = user.photo || cvData?.profile_picture;
    const primaryColor = settings.primary_color || '#f59e0b';
    const secondaryColor = settings.secondary_color || '#8b5cf6';
    
    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50"
            style={{ 
                '--primary-color': primaryColor,
                '--secondary-color': secondaryColor,
                '--primary-rgb': hexToRgb(primaryColor),
                '--secondary-rgb': hexToRgb(secondaryColor)
            } as React.CSSProperties}
        >
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ 
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ 
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear" 
                    }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-10"
                    style={{ backgroundColor: primaryColor }}
                />
                <motion.div
                    animate={{ 
                        x: [0, -50, 0],
                        y: [0, 100, 0],
                        rotate: [0, -180, -360]
                    }}
                    transition={{ 
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear" 
                    }}
                    className="absolute top-3/4 right-1/3 w-24 h-24 rounded-full opacity-10"
                    style={{ backgroundColor: secondaryColor }}
                />
                <motion.div
                    animate={{ 
                        x: [0, -80, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear" 
                    }}
                    className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full opacity-15"
                    style={{ backgroundColor: primaryColor }}
                />
            </div>

            {/* Header Section */}
            <motion.section 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="relative z-10"
            >
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <div className="text-center">
                        
                        {/* Photo de profil avec effet créatif */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                                delay: 0.3, 
                                duration: 0.8,
                                type: "spring",
                                bounce: 0.4
                            }}
                            className="relative inline-block mb-8"
                        >
                            <div className="relative">
                                <div 
                                    className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl relative z-10"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                    }}
                                >
                                    {profilePhoto ? (
                                        <img 
                                            src={profilePhoto} 
                                            alt={`${user.name} - Photo de profil`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-20 h-20 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Cercles décoratifs animés */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-4 border-2 border-dashed rounded-full opacity-30"
                                    style={{ borderColor: primaryColor }}
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-8 border border-dotted rounded-full opacity-20"
                                    style={{ borderColor: secondaryColor }}
                                />
                            </div>
                        </motion.div>

                        {/* Nom avec animation de typing */}
                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="text-4xl md:text-6xl font-bold mb-4"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {user.name || `${cvData?.first_name || ''} ${cvData?.last_name || ''}`.trim()}
                        </motion.h1>
                        
                        {/* Titre professionnel avec effet shimmer */}
                        {(settings.tagline || cvData?.professional_title) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8, duration: 0.6 }}
                                className="relative inline-block mb-6"
                            >
                                <div 
                                    className="px-6 py-3 rounded-full text-white font-semibold text-lg md:text-xl shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                    }}
                                >
                                    <Sparkles className="w-5 h-5 inline mr-2" />
                                    {settings.tagline || cvData.professional_title}
                                </div>
                            </motion.div>
                        )}

                        {/* Bio avec animation fade-in */}
                        {(settings.bio || cvData?.summary) && (
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0, duration: 0.8 }}
                                className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed mb-8"
                            >
                                {settings.bio || safeText(cvData.summary) || safeText(cvData?.summaries?.[0])}
                            </motion.p>
                        )}

                        {/* Contact rapide avec boutons colorés */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.6 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            {(cvData?.email || user.email) && (
                                <Button
                                    asChild
                                    className="text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                    }}
                                >
                                    <a href={`mailto:${cvData?.email || user.email}`}>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Me contacter
                                    </a>
                                </Button>
                            )}
                            {cvData?.phone && (
                                <Button
                                    asChild
                                    variant="outline"
                                    className="border-2 hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
                                    style={{ 
                                        borderColor: primaryColor,
                                        color: primaryColor
                                    }}
                                >
                                    <a href={`tel:${cvData.phone}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Appeler
                                    </a>
                                </Button>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Main Content avec cartes créatives */}
            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                
                {/* Expériences avec timeline créative */}
                {settings.show_experiences && cvData?.experiences?.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.8 }}
                        className="mb-16"
                    >
                        <div className="text-center mb-12">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white font-bold text-2xl mb-4 shadow-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                }}
                            >
                                <Briefcase className="w-8 h-8" />
                                Mon Parcours
                            </motion.div>
                        </div>
                        
                        <div className="relative">
                            {/* Timeline line */}
                            <div 
                                className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full rounded-full"
                                style={{
                                    background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`
                                }}
                            />
                            
                            <div className="space-y-12">
                                {cvData.experiences.map((exp, index) => (
                                    <motion.div 
                                        key={index}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.6 + index * 0.2, duration: 0.6 }}
                                        className={cn(
                                            "relative flex items-center",
                                            index % 2 === 0 ? "justify-end pr-8" : "justify-start pl-8"
                                        )}
                                    >
                                        {/* Timeline dot */}
                                        <div 
                                            className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10"
                                            style={{
                                                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                            }}
                                        />
                                        
                                        <Card 
                                            className={cn(
                                                "w-full max-w-md shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105",
                                                index % 2 === 0 ? "mr-8" : "ml-8"
                                            )}
                                        >
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    <div 
                                                        className="p-3 rounded-full shrink-0"
                                                        style={{ backgroundColor: `${primaryColor}15` }}
                                                    >
                                                        <Briefcase className="w-6 h-6" style={{ color: primaryColor }} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                                                            {exp.poste || exp.title}
                                                        </h3>
                                                        <p className="font-semibold mb-2" style={{ color: primaryColor }}>
                                                            {exp.entreprise || exp.company}
                                                        </p>
                                                        <Badge 
                                                            className="text-white mb-3"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`
                                                            }}
                                                        >
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {exp.periode || exp.period}
                                                        </Badge>
                                                        {exp.description && (
                                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                                {safeText(exp.description)}
                                                            </p>
                                                        )}
                                                        {exp.attachment_path && (
                                                            <div className="mt-3">
                                                                <a 
                                                                    href={exp.attachment_path}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-100 to-purple-100 hover:from-amber-200 hover:to-purple-200 rounded-lg text-sm text-gray-700 transition-all duration-300 transform hover:scale-105"
                                                                >
                                                                    <FileText className="w-4 h-4" />
                                                                    {exp.attachment_name || 'Voir le document'}
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Grid de compétences et autres sections */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    
                    {/* Compétences avec animation de vague */}
                    {settings.show_competences && cvData?.skills?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8, duration: 0.8 }}
                            className="lg:col-span-2"
                        >
                            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                <CardContent className="p-8">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-white font-bold text-xl mb-6"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                        }}
                                    >
                                        <Zap className="w-6 h-6" />
                                        Mes Super-Pouvoirs
                                    </motion.div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        {cvData.skills.map((skill, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ 
                                                    delay: 2.0 + index * 0.1, 
                                                    type: "spring",
                                                    bounce: 0.5 
                                                }}
                                                whileHover={{ 
                                                    scale: 1.1, 
                                                    rotate: [0, -5, 5, 0],
                                                    transition: { duration: 0.3 }
                                                }}
                                            >
                                                <Badge 
                                                    className="text-white text-sm py-2 px-4 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${primaryColor}${Math.floor(Math.random() * 40) + 80}, ${secondaryColor}${Math.floor(Math.random() * 40) + 80})`
                                                    }}
                                                >
                                                    {typeof skill === 'string' ? skill : skill.name || skill.skill}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Centres d'intérêt */}
                    {settings.show_hobbies && cvData?.hobbies?.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.0, duration: 0.8 }}
                        >
                            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                                <CardContent className="p-6">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-white font-bold mb-4"
                                        style={{
                                            background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})`
                                        }}
                                    >
                                        <Heart className="w-5 h-5" />
                                        Passions
                                    </motion.div>
                                    
                                    <div className="space-y-3">
                                        {cvData.hobbies.map((hobby, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 2.2 + index * 0.1 }}
                                                whileHover={{ x: 10, transition: { duration: 0.2 } }}
                                                className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-white/50 to-transparent hover:from-white/80 transition-all cursor-pointer"
                                            >
                                                <div 
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: index % 2 === 0 ? primaryColor : secondaryColor }}
                                                />
                                                <span className="text-gray-700 font-medium">
                                                    {typeof hobby === 'string' ? hobby : hobby.name || hobby.hobby}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Contact avec design créatif */}
                    {settings.show_contact_info && (cvData?.email || cvData?.phone || cvData?.address) && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.2, duration: 0.8 }}
                            className="lg:col-span-1"
                        >
                            <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 h-full overflow-hidden">
                                <div 
                                    className="h-2"
                                    style={{
                                        background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                                    }}
                                />
                                <CardContent className="p-6">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-white font-bold mb-4"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                                        }}
                                    >
                                        <Contact className="w-5 h-5" />
                                        Contact
                                    </motion.div>
                                    
                                    <div className="space-y-4">
                                        {(cvData?.email || user.email) && (
                                            <motion.a
                                                whileHover={{ scale: 1.02, x: 5 }}
                                                href={`mailto:${cvData?.email || user.email}`}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white/50 to-transparent hover:from-white/80 transition-all group"
                                            >
                                                <div 
                                                    className="p-2 rounded-full group-hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: `${primaryColor}20` }}
                                                >
                                                    <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                                                </div>
                                                <span className="text-gray-700 font-medium text-sm">
                                                    {cvData?.email || user.email}
                                                </span>
                                            </motion.a>
                                        )}
                                        {cvData?.phone && (
                                            <motion.a
                                                whileHover={{ scale: 1.02, x: 5 }}
                                                href={`tel:${cvData.phone}`}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white/50 to-transparent hover:from-white/80 transition-all group"
                                            >
                                                <div 
                                                    className="p-2 rounded-full group-hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: `${secondaryColor}20` }}
                                                >
                                                    <Phone className="w-4 h-4" style={{ color: secondaryColor }} />
                                                </div>
                                                <span className="text-gray-700 font-medium text-sm">
                                                    {cvData.phone}
                                                </span>
                                            </motion.a>
                                        )}
                                        {cvData?.address && (
                                            <motion.div
                                                whileHover={{ scale: 1.02, x: 5 }}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white/50 to-transparent hover:from-white/80 transition-all group"
                                            >
                                                <div 
                                                    className="p-2 rounded-full group-hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: `${primaryColor}20` }}
                                                >
                                                    <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                                                </div>
                                                <span className="text-gray-700 font-medium text-sm">
                                                    {cvData.address}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Footer créatif */}
            <footer 
                className="mt-20 py-8 text-center relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.4, duration: 0.8 }}
                >
                    <p className="text-gray-600 font-medium">
                        ✨ Portfolio créatif de {user.name} • Généré avec passion par JobLight ✨
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        © {new Date().getFullYear()} - Conçu pour inspirer
                    </p>
                </motion.div>
            </footer>
        </div>
    );
}

// Utility function to convert hex to rgb
function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '245, 158, 11'; // default amber-500 rgb
    
    return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ].join(', ');
}