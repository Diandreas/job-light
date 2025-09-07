import React from 'react';

interface GuidyLogoProps {
    width?: number;
    height?: number;
    className?: string;
}

export const GuidyLogo = ({ width = 100, height = 100, className = '' }: GuidyLogoProps) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Grande étoile centrale */}
            <path
                d="M100 20 L110 60 L150 50 L120 80 L160 90 L120 100 L150 130 L110 120 L100 160 L90 120 L50 130 L80 100 L40 90 L80 80 L50 50 L90 60 Z"
                fill="url(#starGradient)"
            />
            
            {/* Petite étoile en haut à droite */}
            <path
                d="M160 40 L165 55 L180 50 L170 65 L185 70 L170 75 L180 90 L165 85 L160 100 L155 85 L140 90 L150 75 L135 70 L150 65 L140 50 L155 55 Z"
                fill="url(#starGradient)"
            />
            
            {/* Petite étoile en bas à droite */}
            <path
                d="M160 140 L165 155 L180 150 L170 165 L185 170 L170 175 L180 190 L165 185 L160 200 L155 185 L140 190 L150 175 L135 170 L150 165 L140 150 L155 155 Z"
                fill="url(#starGradient)"
            />
            
            {/* Définition du dégradé */}
            <defs>
                <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" /> {/* purple-500 */}
                    <stop offset="100%" stopColor="#f59e0b" /> {/* amber-500 */}
                </linearGradient>
            </defs>
        </svg>
    );
};

export default GuidyLogo;