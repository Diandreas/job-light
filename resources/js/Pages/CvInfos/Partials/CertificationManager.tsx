import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Award, Calendar, Home } from 'lucide-react';
import { useToast } from '@/Components/ui/use-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

export default function CertificationManager({ auth, initialCertifications, onUpdate }) {
    const { t } = useTranslation();
    const [certifications, setCertifications] = useState(initialCertifications || []);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form state
    const [newCert, setNewCert] = useState({
        name: '',
        institution: '',
        date: '',
        description: ''
    });

    const { toast } = useToast();

    useEffect(() => {
        setCertifications(initialCertifications || []);
    }, [initialCertifications]);

    const handleAddCertification = async () => {
        if (!newCert.name.trim()) return;

        setLoading(true);

        const newId = `manual-${Date.now()}`;
        const certification = {
            id: newId,
            ...newCert,
            is_manual: true
        };

        try {
            await axios.post('/user-manual-certifications', {
                user_id: auth.user.id,
                certification
            });

            const updatedCertifications = [...certifications, certification];
            setCertifications(updatedCertifications);
            onUpdate(updatedCertifications);

            toast({
                title: t('certifications.success.added.title', 'Certification ajoutée'),
                description: t('certifications.success.added.description', { name: certification.name })
            });

            // Reset form
            setNewCert({
                name: '',
                institution: '',
                date: '',
                description: ''
            });
            setIsAdding(false);
        } catch (error) {
            console.error('Error adding certification:', error);
            toast({
                title: t('certifications.errors.adding.title', 'Erreur'),
                description: error.response?.data?.message || t('certifications.errors.generic', 'Une erreur est survenue'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCertification = async (certId) => {
        setLoading(true);

        try {
            await axios.delete(`/user-manual-certifications/${auth.user.id}/${certId}`);

            const updatedCertifications = certifications.filter(c => c.id !== certId);
            setCertifications(updatedCertifications);
            onUpdate(updatedCertifications);

            toast({
                title: t('certifications.success.removed.title', 'Certification supprimée'),
                description: t('certifications.success.removed.description', 'La certification a été retirée avec succès')
            });
        } catch (error) {
            console.error('Error removing certification:', error);
            toast({
                title: t('certifications.errors.removing.title', 'Erreur'),
                description: error.response?.data?.message || t('certifications.errors.generic', 'Une erreur est survenue'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-base font-medium text-gray-800 dark:text-white">
                    {t('cvInterface.certifications.title', 'Certifications')} <span className="text-sm text-gray-500">({certifications.length})</span>
                </h4>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                    {isAdding ? <X className="w-5 h-5 text-gray-500" /> : <Plus className="w-5 h-5 text-teal-500" />}
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="cert-name">{t('certifications.name', 'Nom de la certification')}</Label>
                            <Input
                                id="cert-name"
                                value={newCert.name}
                                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                                placeholder="ex: Google Data Analytics Professional"
                                className="h-9"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="cert-inst">{t('certifications.institution', 'Institution')}</Label>
                                <Input
                                    id="cert-inst"
                                    value={newCert.institution}
                                    onChange={(e) => setNewCert({ ...newCert, institution: e.target.value })}
                                    placeholder="ex: Google / Coursera"
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cert-date">{t('certifications.date', 'Date d\'obtention')}</Label>
                                <Input
                                    id="cert-date"
                                    value={newCert.date}
                                    onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                                    placeholder="ex: Jan 2024"
                                    className="h-9"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddCertification}
                            disabled={!newCert.name.trim() || loading}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Plus className="w-4 h-4" />}
                            {t('certifications.add', 'Ajouter')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {certifications.map((cert) => (
                    <motion.div
                        key={cert.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-start gap-3 group relative hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {cert.name}
                            </h5>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                {cert.institution && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Home className="w-3 h-3" />
                                        <span>{cert.institution}</span>
                                    </div>
                                )}
                                {cert.date && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>{cert.date}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveCertification(cert.id)}
                            className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                            disabled={loading}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
