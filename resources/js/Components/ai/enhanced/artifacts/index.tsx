// Export de tous les artefacts pour éviter les erreurs d'import
import React from 'react';

export { default as CareerRoadmapArtifact } from './CareerRoadmapArtifact';
export { default as CVHeatmapArtifact } from './CVHeatmapArtifact';  
export { default as JobAnalyzerArtifact } from './JobAnalyzerArtifact';
export { default as InterviewReportArtifact } from './InterviewReportArtifact';

// Placeholder pour artefacts en développement
export const PortfolioArtifact: React.FC = () => (
    <div className="text-center py-8">
        <div className="text-amber-600 mb-2">🎨</div>
        <div className="text-sm text-gray-600">Portfolio Presentation - En développement</div>
    </div>
);