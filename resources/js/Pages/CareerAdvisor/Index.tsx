import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button"
import { Textarea } from "@/Components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card"
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, GraduationCap, MessageSquare, Loader } from 'lucide-react';

const LoadingSpinner = () => (
    <motion.div
        className="flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.div
            className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
            className="absolute text-blue-500"
            animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.5, 1],
            }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
            <Loader size={24} />
        </motion.div>
    </motion.div>
);

export default function Index({ auth, userInfo, advice }) {
    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        question: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        post('/career-advisor/advice', {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setIsLoading(false),
            onError: () => setIsLoading(false),
        });
    };

    const cardVariants = {
        collapsed: { height: "60px", overflow: "hidden" },
        expanded: { height: "auto", overflow: "visible" }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="font-semibold text-2xl text-gray-800 leading-tight flex items-center"
                >
                    <Sparkles className="mr-2" /> Career Advisor AI
                </motion.h2>
            }
        >
            <div className="container mx-auto p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="mb-6 cursor-pointer" onClick={() => setIsCardExpanded(!isCardExpanded)}>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Briefcase className="mr-2" /> Your Profile
                            </CardTitle>
                        </CardHeader>
                        <motion.div
                            variants={cardVariants}
                            initial="collapsed"
                            animate={isCardExpanded ? "expanded" : "collapsed"}
                            transition={{ duration: 0.3 }}
                        >
                            <CardContent>
                                <p><strong>Name:</strong> {userInfo.name}</p>
                                <p><strong>Profession:</strong> {userInfo.profession || 'Not specified'}</p>
                                <p><strong>Skills:</strong> {userInfo.competences.join(', ')}</p>
                                {userInfo.experiences.length > 0 && (
                                    <p><strong>Latest Experience:</strong> {userInfo.experiences[0].title} at {userInfo.experiences[0].company}</p>
                                )}
                                {userInfo.education.length > 0 && (
                                    <p><strong>Education:</strong> {userInfo.education[0].degree} from {userInfo.education[0].institution}</p>
                                )}
                            </CardContent>
                        </motion.div>
                    </Card>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Textarea
                        value={data.question}
                        onChange={e => setData('question', e.target.value)}
                        placeholder="Ask for career advice..."
                        className="mb-4"
                    />
                    {errors.question && <p className="text-red-500">{errors.question}</p>}
                    <Button
                        type="submit"
                        disabled={processing || isLoading}
                        className="w-full flex items-center justify-center"
                    >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <MessageSquare className="mr-2" /> Get Advice
                            </>
                        )}
                    </Button>
                </motion.form>

                {advice && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <GraduationCap className="mr-2" /> Career Advice
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{advice}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
