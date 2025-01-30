import { useState, PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

export default function Guest({ children }: PropsWithChildren) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const toggleNavigationDropdown = () => setShowingNavigationDropdown(prevState => !prevState);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50/50 to-purple-50/50">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-amber-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <Sparkles className="h-6 w-6 text-amber-500" />
                                <span className="font-bold text-2xl bg-gradient-to-r from-amber-500 to-purple-500 text-transparent bg-clip-text">
                                    Guidy
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex sm:items-center sm:gap-6">
                            <Link
                                href={route('login')}
                                className={cn(
                                    "text-sm font-medium transition-all px-4 py-2 rounded-full",
                                    route().current('login')
                                        ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                        : "hover:bg-amber-50"
                                )}
                            >
                                Login
                            </Link>
                            <Link
                                href={route('register')}
                                className={cn(
                                    "text-sm font-medium transition-all px-4 py-2 rounded-full",
                                    route().current('register')
                                        ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                        : "hover:bg-amber-50"
                                )}
                            >
                                Register
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={toggleNavigationDropdown}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-amber-500 hover:bg-amber-50 transition-colors duration-200"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {showingNavigationDropdown && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="sm:hidden border-t border-amber-100"
                        >
                            <div className="space-y-1 px-4 py-3">
                                <Link
                                    href={route('login')}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                        route().current('login')
                                            ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                            : "text-gray-700 hover:bg-amber-50"
                                    )}
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                        route().current('register')
                                            ? "bg-gradient-to-r from-amber-500 to-purple-500 text-white shadow-md"
                                            : "text-gray-700 hover:bg-amber-50"
                                    )}
                                >
                                    Register
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Main Content */}
            <div className="min-h-[calc(100vh-4rem)] flex flex-col sm:justify-center items-center px-4">
                <div className="w-full sm:max-w-md mt-6 p-6 bg-white/80 backdrop-blur-md shadow-lg shadow-amber-100/20 border border-amber-100 rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
