import { Link, InertiaLinkProps } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }: InertiaLinkProps & { active: boolean }) {
    const baseClassName = 'inline-flex items-center px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none';
    const activeClassName = 'text-purple-600 bg-white border-b-2 border-purple-600 focus:border-purple-700';
    const inactiveClassName = ' hover:text-purple-600 hover:bg-white hover:border-b-2 hover:border-purple-600 focus:text-purple-600 focus:bg-white focus:border-b-2 focus:border-purple-600';

    return (
        <Link
            {...props}
            className={baseClassName + ' ' + (active ? activeClassName : inactiveClassName) + ' ' + className}
        >
            {children}
        </Link>
    );
}
