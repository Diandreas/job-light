import React, { useState } from 'react';
import { Plus, X, ExternalLink, Github, Linkedin, Twitter, Instagram, Facebook, Globe, Mail, Youtube, Video } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    label?: string;
}

interface SocialLinksManagerProps {
    initialLinks?: SocialLink[];
    onLinksChange: (links: SocialLink[]) => void;
    className?: string;
}

const SOCIAL_PLATFORMS = [
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', placeholder: 'https://linkedin.com/in/votre-profil' },
    { value: 'github', label: 'GitHub', icon: Github, color: 'bg-gray-800', placeholder: 'https://github.com/votre-username' },
    { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-black', placeholder: 'https://x.com/votre-username' },
    { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-pink-600', placeholder: 'https://instagram.com/votre-username' },
    { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600', placeholder: 'https://facebook.com/votre-profil' },
    { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-600', placeholder: 'https://youtube.com/@votre-chaine' },
    { value: 'tiktok', label: 'TikTok', icon: Video, color: 'bg-black', placeholder: 'https://tiktok.com/@votre-username' },
    { value: 'email', label: 'Email', icon: Mail, color: 'bg-green-600', placeholder: 'votre.email@exemple.com' },
    { value: 'website', label: 'Site Web', icon: Globe, color: 'bg-purple-600', placeholder: 'https://votre-site.com' },
];

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({
    initialLinks = [],
    onLinksChange,
    className
}) => {
    const [links, setLinks] = useState<SocialLink[]>(initialLinks);
    const [newLink, setNewLink] = useState<Partial<SocialLink>>({});

    const updateLinks = (newLinks: SocialLink[]) => {
        setLinks(newLinks);
        onLinksChange(newLinks);
    };

    const addLink = () => {
        if (newLink.platform && newLink.url) {
            const platform = SOCIAL_PLATFORMS.find(p => p.value === newLink.platform);
            const linkToAdd: SocialLink = {
                id: `${newLink.platform}-${Date.now()}`,
                platform: newLink.platform,
                url: newLink.url,
                label: newLink.label || platform?.label || ''
            };

            updateLinks([...links, linkToAdd]);
            setNewLink({});
        }
    };

    const removeLink = (id: string) => {
        updateLinks(links.filter(link => link.id !== id));
    };

    const updateLink = (id: string, field: keyof SocialLink, value: string) => {
        updateLinks(links.map(link => 
            link.id === id ? { ...link, [field]: value } : link
        ));
    };

    const getPlatformInfo = (platform: string) => {
        return SOCIAL_PLATFORMS.find(p => p.value === platform) || SOCIAL_PLATFORMS.find(p => p.value === 'website')!;
    };

    const availablePlatforms = SOCIAL_PLATFORMS.filter(
        platform => !links.some(link => link.platform === platform.value)
    );

    return (
        <Card className={cn("", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-blue-600" />
                    Réseaux Sociaux
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Liens existants */}
                <AnimatePresence>
                    {links.map((link) => {
                        const platform = getPlatformInfo(link.platform);
                        const IconComponent = platform.icon;
                        
                        return (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                            >
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", platform.color)}>
                                    <IconComponent className="w-5 h-5 text-white" />
                                </div>
                                
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {platform.label}
                                        </Badge>
                                        <Input
                                            placeholder="Nom à afficher (optionnel)"
                                            value={link.label || ''}
                                            onChange={(e) => updateLink(link.id, 'label', e.target.value)}
                                            className="h-8 text-sm flex-1"
                                        />
                                    </div>
                                    <Input
                                        placeholder={platform.placeholder}
                                        value={link.url}
                                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                        className="text-sm"
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLink(link.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Ajouter un nouveau lien */}
                {availablePlatforms.length > 0 && (
                    <div className="space-y-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        <h4 className="font-medium text-sm text-gray-600 dark:text-gray-400">
                            Ajouter un réseau social
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-sm">Plateforme</Label>
                                <Select
                                    value={newLink.platform || ''}
                                    onValueChange={(value) => setNewLink({ ...newLink, platform: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir une plateforme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePlatforms.map((platform) => {
                                            const IconComponent = platform.icon;
                                            return (
                                                <SelectItem key={platform.value} value={platform.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-4 h-4 rounded flex items-center justify-center", platform.color)}>
                                                            <IconComponent className="w-3 h-3 text-white" />
                                                        </div>
                                                        {platform.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm">Nom affiché (optionnel)</Label>
                                <Input
                                    placeholder="Ex: Mon GitHub"
                                    value={newLink.label || ''}
                                    onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">URL/Lien</Label>
                            <Input
                                placeholder={
                                    newLink.platform 
                                        ? getPlatformInfo(newLink.platform).placeholder
                                        : "Sélectionnez d'abord une plateforme"
                                }
                                value={newLink.url || ''}
                                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                disabled={!newLink.platform}
                                className="text-sm"
                            />
                        </div>

                        <Button
                            onClick={addLink}
                            disabled={!newLink.platform || !newLink.url}
                            className="w-full"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter ce lien
                        </Button>
                    </div>
                )}

                {availablePlatforms.length === 0 && links.length > 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                        Toutes les plateformes principales ont été ajoutées !
                    </div>
                )}

                {links.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <ExternalLink className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Aucun réseau social configuré</p>
                        <p className="text-xs opacity-75">Ajoutez vos profils pour les afficher sur votre portfolio</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};