import { useState, PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Menu, X } from 'lucide-react';

export default function Guest({ children }: PropsWithChildren) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    const toggleNavigationDropdown = () => setShowingNavigationDropdown(prevState => !prevState);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="font-bold text-indigo-600 text-2xl">JOB PORTAL</h1>
                        </div>

                        <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                            <NavLink href="/login" active={route().current('login')}>
                                Login
                            </NavLink>
                            <NavLink href="/register" active={route().current('register')}>
                                Register
                            </NavLink>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={toggleNavigationDropdown}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                {showingNavigationDropdown ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} sm:hidden`}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href="/login" active={route().current('login')}>
                            Login
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href="/register" active={route().current('register')}>
                            Register
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-50">
                <div>
                    <h1 className="font-bold text-black">JOB PORTAL</h1>
                </div>

                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
