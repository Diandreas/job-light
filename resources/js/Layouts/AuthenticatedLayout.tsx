import { useState, PropsWithChildren, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { Toaster } from "@/Components/ui/toaster";
import {
    Briefcase, Folder, FileText, Eye, Menu, X, Home,
    User as UserIcon, ChevronRight, ScrollText, Layout,
    GraduationCap, BookOpen, LucideIcon, Users
} from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from '@/Components/ui/button';
import { cn } from "@/lib/utils";

interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    active: boolean;
    adminOnly?: boolean;
}

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const mainMenuItems: MenuItem[] = [
        {
            name: "ADMIN PART",
            href: route('dashboard'),
            icon: Layout,
            active: route().current('dashboard'),
            adminOnly: true
        },
        {
            name: "CV",
            href: route('cv-infos.index'),
            icon: ScrollText,
            active: route().current('cv-infos.index')
        },
        {
            name: "Career Advisor(IA)",
            href: route('career-advisor.index'),
            icon: GraduationCap,
            active: route().current('career-advisor.index')
        },
    ];

    const cvSideMenuItems = [
        {
            name: "Mon CV",
            href: route('cv-infos.index'),
            icon: Folder,
            active: route().current('cv-infos.index')
        },
        {
            name: "Mes designs",
            href: route('userCvModels.index'),
            icon: FileText,
            active: route().current('userCvModels.index')
        },
        {
            name: "Preview/Export",
            href: '/cv-infos/show',
            icon: Eye,
            active: route().current('cv-infos.show')
        }
    ];

    const showSidebar = ['cv-infos.show', 'cv-infos.index', 'userCvModels.index'].includes(route().current());

    // @ts-ignore
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 bg-white shadow-sm">
                <div className="px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and Mobile Menu Button */}
                        <div className="flex items-center gap-4">

                            <Link href="/" className="flex items-center gap-2">
                                <h1 className="font-bold text-indigo-600 text-xl sm:text-2xl">JOB PORTAL</h1>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:gap-6">
                            {mainMenuItems.map((item, index) => (
                                //@ts-ignore
                                (!item.adminOnly || user.UserType === 1) && (
                                    <NavLink
                                        key={index}
                                        href={item.href}
                                        active={item.active}
                                        className="text-sm font-medium transition-colors hover:text-indigo-600"
                                    >
                                        {item.name}
                                    </NavLink>
                                )
                            ))}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <Button variant="ghost" className="gap-2">
                                        {user.name}
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>

                            {/* Mobile Menu Trigger */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation Sheet */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col gap-4">
                        {mainMenuItems.map((item, index) => (
                            //@ts-ignore
                            (!item.adminOnly || user.UserType === 1) && (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100",
                                        item.active && "bg-indigo-50 text-indigo-600"
                                    )}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            )
                        ))}
                        <hr className="my-4" />
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100"
                        >
                            <UserIcon className="h-5 w-5" />
                            Profile
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-all hover:bg-red-50"
                        >
                            <X className="h-5 w-5" />
                            Log Out
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>

            {/* CV Section Mobile Sidebar */}
            {showSidebar && (
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetContent side="left" className="w-[300px]">
                        <SheetHeader>
                            <SheetTitle>CV Navigation</SheetTitle>
                        </SheetHeader>
                        <div className="mt-8 flex flex-col gap-2">
                            {cvSideMenuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:bg-gray-100",
                                        item.active && "bg-indigo-50 text-indigo-600"
                                    )}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <item.icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            )}

            {/* Page Header */}
            {header && (
                <header className="bg-white shadow">
                  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}
                      {showSidebar && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" /> Menu
                    </Button>
                )}</div>
                </header>
            )}

            {/* Main Content */}
            <div className="flex">
                {/* Desktop Sidebar */}
                {showSidebar && (
                    <aside className="hidden md:block w-64 bg-white shadow-lg min-h-screen">
                        <div className="sticky top-20">
                            <ul className="space-y-1 py-4">
                                {cvSideMenuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 mx-2 px-3 py-2 rounded-md transition-colors duration-200",
                                                item.active
                                                    ? "bg-indigo-50 text-indigo-600"
                                                    : "text-gray-700 hover:bg-gray-100"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>

            <Toaster />
        </div>
    );
}
