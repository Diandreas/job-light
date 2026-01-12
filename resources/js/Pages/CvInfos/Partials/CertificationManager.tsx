import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from "@/Components/ui/textarea";
import { useToast } from '@/Components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import {
    Award, Plus, Edit, Trash2, X, Check, Calendar, Building2, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from "axios";
import AIRephraseButton from '@/Components/AIRephraseButton';

interface Certification {
    id: number;
    name: string;
    institution: string;
    date_obtained: string | null;
    description: string;
    link: string | null;
}

interface Props {
    certifications: Certification[];
    onUpdate: (certifications: Certification[]) => void;
}

const CertificationManager: React.FC<Props> = ({ certifications: initialCerts, onUpdate }) => {
    const { t } = useTranslation();
    const { toast } = useToast();

    const [certifications, setCertifications] = useState<Certification[]>(initialCerts);
    const [editingCert, setEditingCert] = useState<Certification | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async (data: Partial<Certification>) => {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                date_obtained: data.date_obtained || null
            };

            const response = data.id
                ? await axios.put(`/certifications/${data.id}`, payload)
                : await axios.post('/certifications', payload);

            const updated = response.data.certification;
            const newCerts = data.id
                ? certifications.map(c => c.id === updated.id ? updated : c)
                : [...certifications, updated];

            setCertifications(newCerts);
            onUpdate(newCerts);
            toast({
                title: data.id ? t('common.success.updated') : t('common.success.created'),
            });
            setIsDialogOpen(false);
            setEditingCert(null);
        } catch (error: any) {
            toast({
                title: t('common.error'),
                description: error.response?.data?.message || "Error saving certification",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('common.confirmDelete'))) return;
        try {
            await axios.delete(`/certifications/${id}`);
            const newCerts = certifications.filter(c => c.id !== id);
            setCertifications(newCerts);
            onUpdate(newCerts);
            toast({ title: t('common.success.deleted') });
        } catch (error) {
            toast({
                title: t('common.error'),
                variant: "destructive",
            });
        }
    };

    const openDialog = (cert?: Certification) => {
        setEditingCert(cert || {
            id: 0,
            name: '',
            institution: '',
            date_obtained: '',
            description: '',
            link: ''
        } as Certification);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    {t('certifications.title') || "Certifications"}
                </h2>
                <Button onClick={() => openDialog()} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('common.add') || "Add"}
                </Button>
            </div>

            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {certifications.map(cert => (
                        <motion.div
                            key={cert.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="group cursor-pointer"
                            onClick={() => openDialog(cert)}
                        >
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-full hover:shadow-md transition-all hover:border-amber-300">
                                <Award className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">{cert.name}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {certifications.length === 0 && (
                    <p className="text-sm text-gray-500 italic w-full text-center py-4">
                        {t('certifications.empty') || "No certifications added yet."}
                    </p>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCert?.id ? t('certifications.edit') : t('certifications.add')}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">{t('certifications.name') || "Certification Name"}</label>
                            <Input
                                value={editingCert?.name || ''}
                                onChange={e => setEditingCert(prev => prev ? { ...prev, name: e.target.value } : null)}
                                placeholder="e.g. AWS Certified Solutions Architect"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t('certifications.institution') || "Issuing Organization"}</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={editingCert?.institution || ''}
                                    onChange={e => setEditingCert(prev => prev ? { ...prev, institution: e.target.value } : null)}
                                    className="pl-9"
                                    placeholder="e.g. Amazon Web Services"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t('certifications.date') || "Date Obtained"}</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="date"
                                    value={editingCert?.date_obtained ? editingCert.date_obtained.split('T')[0] : ''}
                                    onChange={e => setEditingCert(prev => prev ? { ...prev, date_obtained: e.target.value } : null)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t('certifications.link') || "Link / URL"}</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    value={editingCert?.link || ''}
                                    onChange={e => setEditingCert(prev => prev ? { ...prev, link: e.target.value } : null)}
                                    className="pl-9"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">{t('certifications.description') || "Description / Link"}</label>
                            <Textarea
                                value={editingCert?.description || ''}
                                onChange={e => setEditingCert(prev => prev ? { ...prev, description: e.target.value } : null)}
                                placeholder="Details or verification link..."
                                rows={3}
                            />
                            <div className="flex justify-end mt-1">
                                <AIRephraseButton
                                    text={editingCert?.description || ''}
                                    onRephrased={(text) => setEditingCert(prev => prev ? { ...prev, description: text } : null)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            {editingCert?.id ? (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => editingCert.id && handleDelete(editingCert.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('common.delete')}
                                </Button>
                            ) : (
                                <div />
                            )}

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button onClick={() => editingCert && handleSave(editingCert)} disabled={isLoading || !editingCert?.name}>
                                    {isLoading ? "Saving..." : t('common.save')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CertificationManager;
