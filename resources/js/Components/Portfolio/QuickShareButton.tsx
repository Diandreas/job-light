import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { QrCode, Share2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickShareButtonProps {
    onClick: () => void;
    shareCount?: number;
    className?: string;
    variant?: 'default' | 'compact' | 'floating';
    showStats?: boolean;
}

const QuickShareButton: React.FC<QuickShareButtonProps> = ({
    onClick,
    shareCount = 0,
    className,
    variant = 'default',
    showStats = true
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Couleurs du thème Guidy
    const guidyGradient = 'from-amber-500 to-purple-500';

    const buttonStyles = {
        default: "shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3",
        compact: "shadow-md hover:shadow-lg transition-all duration-300 px-4 py-2 text-sm",
        floating: "shadow-xl hover:shadow-2xl transition-all duration-300 rounded-full w-14 h-14 p-0"
    };

    const contentByVariant = {
        default: (
            <>
                <QrCode className="w-5 h-5 mr-2" />
                Partager Portfolio
                {showStats && shareCount > 0 && (
                    <Badge className="ml-2 bg-white/20 text-white border-white/30 text-xs">
                        {shareCount}
                    </Badge>
                )}
            </>
        ),
        compact: (
            <>
                <QrCode className="w-4 h-4 mr-1" />
                Partager
                {showStats && shareCount > 0 && (
                    <Badge className="ml-1 bg-white/20 text-white border-white/30 text-xs">
                        {shareCount}
                    </Badge>
                )}
            </>
        ),
        floating: (
            <div className="relative">
                <QrCode className="w-6 h-6" />
                {showStats && shareCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center p-0">
                        {shareCount > 99 ? '99+' : shareCount}
                    </Badge>
                )}
            </div>
        )
    };

    return (
        <Button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                `bg-gradient-to-r ${guidyGradient} text-white hover:opacity-90 relative overflow-hidden`,
                buttonStyles[variant],
                className
            )}
        >
            {/* Effet de brillance au survol */}
            <div 
                className={cn(
                    "absolute inset-0 bg-white/20 transition-all duration-300",
                    isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95"
                )}
            />
            
            {/* Contenu du bouton */}
            <div className="relative z-10 flex items-center justify-center">
                {contentByVariant[variant]}
            </div>

            {/* Effet de particules pour le variant floating */}
            {variant === 'floating' && isHovered && (
                <div className="absolute inset-0 pointer-events-none">
                    <Sparkles className="absolute top-1 right-1 w-3 h-3 text-white/60 animate-pulse" />
                    <Sparkles className="absolute bottom-1 left-1 w-2 h-2 text-white/40 animate-pulse delay-150" />
                </div>
            )}
        </Button>
    );
};

export default QuickShareButton;