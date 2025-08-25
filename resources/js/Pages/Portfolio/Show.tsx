import React from 'react';
import PortfolioRenderer from '@/Components/Portfolio/PortfolioRenderer';

interface ShowProps {
    user: any;
    portfolio: any;
    settings: any;
    cvData?: any;
    isOwner?: boolean;
}

export default function Show({ 
    user, 
    portfolio, 
    settings, 
    cvData,
    isOwner = false 
}: ShowProps) {
    // Debug logging
    console.log('Show component props:', { user, portfolio, settings, cvData, isOwner });
    
    return (
        <PortfolioRenderer
            user={user}
            cvData={cvData}
            settings={settings}
            isPreview={false}
            showControls={true}
        />
    );
}