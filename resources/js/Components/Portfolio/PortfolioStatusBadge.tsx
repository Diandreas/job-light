import React from 'react';
import { Badge } from "@/Components/ui/badge";
import { 
    CheckCircle, AlertCircle, Clock, Eye, 
    EyeOff, Globe, Lock, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioStatusBadgeProps {
    isPublic: boolean;
    isActive?: boolean;
    views?: number;
    lastViewed?: string;
    className?: string;
    variant?: 'default' | 'detailed' | 'compact';
}

const PortfolioStatusBadge: React.FC<PortfolioStatusBadgeProps> = ({
    isPublic,
    isActive = true,
    views = 0,
    lastViewed,
    className,
    variant = 'default'
}) => {
    const getStatusConfig = () => {
        if (!isActive) {
            return {
                icon: EyeOff,
                label: 'Inactif',
                color: 'bg-gray-100 text-gray-600 border-gray-300',
                description: 'Portfolio désactivé'
            };
        }

        if (!isPublic) {
            return {
                icon: Lock,
                label: 'Privé',
                color: 'bg-orange-100 text-orange-700 border-orange-300',
                description: 'Visible uniquement par vous'
            };
        }

        return {
            icon: Globe,
            label: 'Public',
            color: 'bg-green-100 text-green-700 border-green-300',
            description: 'Visible par tous'
        };
    };

    const status = getStatusConfig();
    const Icon = status.icon;

    if (variant === 'compact') {
        return (
            <Badge className={cn(status.color, "flex items-center gap-1", className)}>
                <Icon className="w-3 h-3" />
                {status.label}
            </Badge>
        );
    }

    if (variant === 'detailed') {
        return (
            <div className={cn("flex items-center gap-3 p-3 rounded-lg border", status.color, className)}>
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                    <div className="font-medium">{status.label}</div>
                    <div className="text-sm opacity-80">{status.description}</div>
                    {lastViewed && (
                        <div className="text-xs opacity-60 mt-1">
                            Dernière visite: {lastViewed}
                        </div>
                    )}
                </div>
                {views > 0 && (
                    <div className="text-right">
                        <div className="font-bold">{views}</div>
                        <div className="text-xs opacity-80">vues</div>
                    </div>
                )}
            </div>
        );
    }

    // Variant par défaut
    return (
        <Badge className={cn(status.color, "flex items-center gap-2", className)}>
            <Icon className="w-4 h-4" />
            <span>{status.label}</span>
            {views > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {views}
                </span>
            )}
        </Badge>
    );
};

export default PortfolioStatusBadge;