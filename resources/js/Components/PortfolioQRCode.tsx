import React, { useEffect, useState } from 'react';
import { QrcodeCanvas, useQrcodeDownload } from "react-qrcode-pretty";

interface PortfolioQRCodeProps {
    value?: string;
    size?: number;
    className?: string;
    profilePicture?: string; // User's profile picture URL
    onQRReady?: (canvas: HTMLCanvasElement) => void; // Callback when QR code is ready
}

export function PortfolioQRCode({
    value = 'https://your-portfolio-url.com',
    size = 300,
    className = '',
    profilePicture,
    onQRReady
}: PortfolioQRCodeProps) {
    const isCompactMode = className.includes('compact-mode');
    const [download, isReady] = useQrcodeDownload();
    const [roundedProfilePic, setRoundedProfilePic] = useState<string>('');

    // Create rounded profile picture
    useEffect(() => {
        if (!profilePicture) {
            setRoundedProfilePic('/ai.png'); // Fallback to AI image
            return;
        }

        const createRoundedImage = async () => {
            try {
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Use fixed size for consistent results
                    const canvasSize = 200;
                    canvas.width = canvasSize;
                    canvas.height = canvasSize;

                    if (ctx) {
                        // Clear with transparent background
                        ctx.clearRect(0, 0, canvasSize, canvasSize);

                        // Create circular clipping path
                        ctx.beginPath();
                        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
                        ctx.clip();

                        // Calculate dimensions to fit image in circle while maintaining aspect ratio
                        const scale = Math.max(canvasSize / img.width, canvasSize / img.height);
                        const scaledWidth = img.width * scale;
                        const scaledHeight = img.height * scale;
                        const offsetX = (canvasSize - scaledWidth) / 2;
                        const offsetY = (canvasSize - scaledHeight) / 2;

                        // Draw image centered
                        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

                        // Convert to data URL
                        const dataUrl = canvas.toDataURL('image/png', 0.9);
                        setRoundedProfilePic(dataUrl);
                    }
                };

                img.onerror = () => {
                    setRoundedProfilePic('/ai.png'); // Fallback on error
                };

                img.src = profilePicture;
            } catch (error) {
                console.error('Error creating rounded image:', error);
                setRoundedProfilePic('/ai.png'); // Fallback on error
            }
        };

        createRoundedImage();
    }, [profilePicture]);

    const handleDownload = () => {
        if (isReady && download) {
            // You can customize the filename here
            const filename = 'guidy-portfolio-qrcode';
            // @ts-ignore
            download(filename);
        }
    };

    if (isCompactMode) {
        return (
            <div className="flex flex-col items-center space-y-3">
                {/* Compact Guidy Header */}
                <div className="flex items-center justify-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full transform rotate-45"></div>
                        <div className="w-1.5 h-1.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full transform rotate-45"></div>
                    </div>
                    <h4 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                        GUIDY
                    </h4>
                </div>

                {/* Compact QR Code */}
                <div className="relative bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                    <QrcodeCanvas
                        value={value}
                        size={size}
                        variant={{
                            eyes: 'fluid',
                            body: 'fluid'
                        }}
                        color={{
                            eyes: '#f59e0b',
                            body: '#a855f7'
                        }}
                        colorEffect={{
                            eyes: 'colored',
                            body: 'colored'
                        }}
                        padding={15}
                        margin={15}
                        bgColor='#ffffff'
                        bgRounded={true}
                        divider={true}
                        image={roundedProfilePic ? {
                            src: roundedProfilePic,
                            width: Math.round(size * 0.2),
                            height: Math.round(size * 0.2),
                        } : undefined}
                        onReady={(canvas) => {
                            download(canvas);
                            if (onQRReady) onQRReady(canvas);
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center space-y-6 ${className}`}>
            {/* Guidy Branding Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-3">
                    {/* Guidy Stars Logo */}
                    <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full transform rotate-45"></div>
                        <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full transform rotate-45"></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full transform rotate-45"></div>
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                        GUIDY
                    </h3>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                    Votre guide professionnel intelligent
                </p>
            </div>

            {/* QR Code Container with enhanced styling */}
            <div className="relative">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-amber-50 rounded-3xl transform rotate-3 scale-105 opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-amber-50 via-white to-purple-50 rounded-3xl transform -rotate-2 scale-105 opacity-30"></div>

                {/* Main QR Code */}
                <div className="relative bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
                    <QrcodeCanvas
                        value={value}
                        size={size}
                        variant={{
                            eyes: 'fluid',
                            body: 'fluid'
                        }}
                        color={{
                            eyes: '#f59e0b',  // Orange/Amber for eyes
                            body: '#a855f7'   // Purple for body
                        }}
                        colorEffect={{
                            eyes: 'colored',
                            body: 'colored'
                        }}
                        padding={20}
                        margin={20}
                        bgColor='#ffffff'
                        bgRounded={true}
                        divider={true}
                        image={roundedProfilePic ? {
                            src: roundedProfilePic,
                            width: Math.round(size * 0.2),
                            height: Math.round(size * 0.2),
                            positionX: 0.5,
                            positionY: 0.5,
                            overlap: true
                        } : undefined}
                        onReady={(canvas) => {
                            download(canvas);
                            if (onQRReady) onQRReady(canvas);
                        }}
                    />

                    {/* Corner decorative elements */}
                    <div className="absolute top-2 left-2 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-60"></div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-60"></div>
                    <div className="absolute bottom-2 left-2 w-2 h-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full opacity-60"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full opacity-60"></div>
                </div>
            </div>

            {/* Enhanced CTA section */}
            <div className="text-center space-y-3">
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                    Scannez pour découvrir ce portfolio professionnel
                </p>

                <button
                    onClick={handleDownload}
                    disabled={!isReady}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 text-white font-semibold rounded-xl hover:from-purple-700 hover:via-purple-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Télécharger le QR Code
                </button>

                {/* Powered by Guidy */}
                <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                    <span>Propulsé par</span>
                    <span className="font-semibold bg-gradient-to-r from-purple-600 to-amber-500 bg-clip-text text-transparent">
                        Guidy
                    </span>
                    <div className="w-1.5 h-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full transform rotate-45"></div>
                </p>
            </div>
        </div>
    );
}

export default PortfolioQRCode;