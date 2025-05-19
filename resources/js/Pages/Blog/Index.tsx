import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Head, Link } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ArrowRight, Calendar } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    description: string;
    image: string;
    date: string;
    route: string;
}

export default function Index({ auth, blogs }: { auth: any, blogs: BlogPost[] }) {
    const { t } = useTranslation();

    return (
        <GuestLayout>
            <Head title={t('blog.index.title', 'Articles de blog')} />
            <div className="w-full p-4 md:p-6 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-purple-500 dark:from-amber-400 dark:to-purple-400 text-transparent bg-clip-text">
                            {t('blog.index.heading', 'Blog Guidy')}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            {t('blog.index.description', 'Découvrez nos articles, astuces et conseils pour créer un CV qui se démarque et optimiser votre recherche d\'emploi.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <motion.div
                                key={blog.id}
                                whileHover={{ scale: 1.03 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link href={blog.route}>
                                    <Card className="h-full overflow-hidden border-amber-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:shadow-lg transition-all">
                                        <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://placehold.co/600x400/amber/white?text=Guidy';
                                                }}
                                            />
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                {new Date(blog.date).toLocaleDateString()}
                                            </div>
                                            <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{blog.title}</h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{blog.description}</p>
                                            <Button variant="link" className="p-0 h-auto text-amber-600 dark:text-amber-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium">
                                                {t('blog.index.read_more', 'Lire l\'article')}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {blogs.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-lg text-gray-500 dark:text-gray-400">
                                {t('blog.index.no_articles', 'Aucun article disponible pour le moment.')}
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </GuestLayout>
    );
}
