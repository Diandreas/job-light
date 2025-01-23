import { Link } from '@inertiajs/react';
import { Folder, FileText, Eye } from 'lucide-react';
interface AsideMenuProps {
    currentPage: string;
}

const AsideMenu: React.FC<AsideMenuProps> = ({ currentPage }) => {
    const links = {
        'cv-infos.index': [
            { href: route('cv-infos.index'), icon: Folder, text: 'Mon CV' },
            { href: '/user-cv-models', icon: FileText, text: 'Mes design' },
            { href: '/cv-infos/show', icon: Eye, text: 'Preview/Export' },
        ],
        'cv-infos.show': [
            { href: route('cv-infos.index'), icon: Folder, text: 'Mon CV' },
            { href: route('userCvModels.index'), icon: FileText, text: 'Mes designs' },
            { href: '/cv-infos/show', icon: Eye, text: 'Preview/Export' },
        ],
        // Ajoutez d'autres pages si nécessaire
    };

    const getLinks = () => {
        // @ts-ignore
        return links[currentPage] || [];
    };

    const hasLinks = getLinks().length > 0;


    //
    let isSidebarOpen;
    return (
        <aside className={`${
            isSidebarOpen ? "block" : "hidden"
        } md:block md:w-64  text-black`}>
            <ul className="space-y-2">
                {
                    // @ts-ignore
                    getLinks().map((link, index) => (
                    <Link key={index} href={link.href}>
                        <li className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-200 transition-colors duration-200">
                            <link.icon className="h-6 w-6 text-gray-500" />
                            <span className="text-gray-700">{link.text}</span>
                        </li>
                    </Link>
                ))}
            </ul>
        </aside>
    );
};

export default AsideMenu;
