/**
 * Analyseur de contenu IA - Intelligence pour parser et comprendre les réponses IA
 */

export interface AIAnalysisResult {
    intent: string;
    confidence: number;
    extractedData: any;
    suggestions: string[];
    context: 'professional' | 'personal' | 'educational' | 'career' | 'interview' | 'negotiation';
}

export interface AIDataPoint {
    type: 'score' | 'metric' | 'list' | 'table' | 'timeline' | 'comparison';
    content: string;
    value: any;
    confidence: number;
    context: string;
    relatedData: string[];
}

export class AIContentAnalyzer {
    private static readonly SCORE_PATTERNS = [
        // Patterns pour détecter différents types de scores
        /(?:Score|Note|Rating|Évaluation)[:\s]*(\d+)(?:\/(\d+)|%|\s*sur\s*(\d+))/gi,
        /(\w+(?:\s+\w+)*)[:\s]*([█░▓]{3,20})\s*(\d+)[%\/]?(?:\s*\/\s*(\d+))?/gi,
        /([█░▓\-=]{5,})/g, // Barres de progression visuelles
        /(\w+(?:\s+\w+)*)[:\s]*(\d+(?:\.\d+)?)[%]/gi, // Pourcentages simples
    ];
    
    private static readonly ACTION_PATTERNS = [
        /(?:Action|À faire|Todo|Recommandation)[:\s]*(.+)/gi,
        /(?:^|\n)\s*[•\-\*✓]\s*(.+?)(?=\n|$)/gm,
        /(?:^|\n)\s*\d+\.\s*(.+?)(?=\n|$)/gm,
        /(?:Étape|Step)\s*\d*[:\s]*(.+?)(?=\n|$)/gi,
    ];
    
    private static readonly TIMELINE_PATTERNS = [
        /(?:Dans|En|Sur|After|In)\s+(\d+\s*(?:jours?|semaines?|mois|ans?|années?|days?|weeks?|months?|years?))[:\s]*(.+)/gi,
        /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|\d{4}-\d{1,2}-\d{1,2})[:\s]*(.+)/gi,
        /(?:Phase|Étape|Stage)\s*(\d+)[:\s]*(.+?)(?=Phase|Étape|Stage|\n\n|$)/gis,
    ];
    
    private static readonly TABLE_PATTERNS = [
        /\|(.+?)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+?\|\s*\n?)+)/g,
        /(?:Compétence|Skill|Critère)[:\s]*(.+?)\s*[-:]\s*(.+?)(?:\n|$)/gi,
    ];
    
    /**
     * Analyse complète du contenu IA
     */
    static analyzeAIContent(content: string, serviceId?: string, userContext?: any): AIAnalysisResult {
        console.log('🧠 Analyse du contenu IA...');
        
        const dataPoints = this.extractAllDataPoints(content);
        const intent = this.detectIntent(content, serviceId);
        const context = this.detectContext(content, serviceId);
        const extractedData = this.structureExtractedData(dataPoints, context);
        const suggestions = this.generateSmartSuggestions(dataPoints, intent, context);
        
        const confidence = this.calculateOverallConfidence(dataPoints, intent);
        
        return {
            intent,
            confidence,
            extractedData,
            suggestions,
            context
        };
    }
    
    /**
     * Extraction de tous les points de données du contenu
     */
    private static extractAllDataPoints(content: string): AIDataPoint[] {
        const dataPoints: AIDataPoint[] = [];
        
        // Extraction des scores
        dataPoints.push(...this.extractScores(content));
        
        // Extraction des listes et actions
        dataPoints.push(...this.extractActionItems(content));
        
        // Extraction des timelines
        dataPoints.push(...this.extractTimelines(content));
        
        // Extraction des tableaux
        dataPoints.push(...this.extractTables(content));
        
        // Extraction des comparaisons
        dataPoints.push(...this.extractComparisons(content));
        
        return dataPoints.sort((a, b) => b.confidence - a.confidence);
    }
    
    /**
     * Extraction intelligente des scores
     */
    private static extractScores(content: string): AIDataPoint[] {
        const scores: AIDataPoint[] = [];
        
        for (const pattern of this.SCORE_PATTERNS) {
            let match;
            pattern.lastIndex = 0; // Reset regex
            
            while ((match = pattern.exec(content)) !== null) {
                const scoreData = this.parseScoreMatch(match, content);
                if (scoreData) {
                    scores.push({
                        type: 'score',
                        content: match[0],
                        value: scoreData,
                        confidence: this.calculateScoreConfidence(match, content),
                        context: this.getScoreContext(match, content),
                        relatedData: this.findRelatedScoreData(match, content)
                    });
                }
            }
        }
        
        return scores;
    }
    
    /**
     * Extraction des éléments d'action
     */
    private static extractActionItems(content: string): AIDataPoint[] {
        const actions: AIDataPoint[] = [];
        
        for (const pattern of this.ACTION_PATTERNS) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(content)) !== null) {
                const actionText = match[1]?.trim();
                if (actionText && actionText.length > 5) {
                    actions.push({
                        type: 'list',
                        content: match[0],
                        value: {
                            text: actionText,
                            priority: this.detectActionPriority(actionText, content),
                            category: this.categorizeAction(actionText),
                            estimatedTime: this.estimateActionTime(actionText),
                            complexity: this.assessActionComplexity(actionText)
                        },
                        confidence: this.calculateActionConfidence(actionText, content),
                        context: this.getActionContext(match, content),
                        relatedData: this.findRelatedActionData(actionText, content)
                    });
                }
            }
        }
        
        return actions;
    }
    
    /**
     * Extraction des timelines
     */
    private static extractTimelines(content: string): AIDataPoint[] {
        const timelines: AIDataPoint[] = [];
        
        for (const pattern of this.TIMELINE_PATTERNS) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(content)) !== null) {
                const timelineData = this.parseTimelineMatch(match, content);
                if (timelineData) {
                    timelines.push({
                        type: 'timeline',
                        content: match[0],
                        value: timelineData,
                        confidence: this.calculateTimelineConfidence(match, content),
                        context: this.getTimelineContext(match, content),
                        relatedData: this.findRelatedTimelineData(match, content)
                    });
                }
            }
        }
        
        return timelines;
    }
    
    /**
     * Extraction des tableaux
     */
    private static extractTables(content: string): AIDataPoint[] {
        const tables: AIDataPoint[] = [];
        
        for (const pattern of this.TABLE_PATTERNS) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(content)) !== null) {
                const tableData = this.parseTableMatch(match, content);
                if (tableData) {
                    tables.push({
                        type: 'table',
                        content: match[0],
                        value: tableData,
                        confidence: this.calculateTableConfidence(tableData, content),
                        context: this.getTableContext(match, content),
                        relatedData: this.findRelatedTableData(match, content)
                    });
                }
            }
        }
        
        return tables;
    }
    
    /**
     * Extraction des comparaisons
     */
    private static extractComparisons(content: string): AIDataPoint[] {
        const comparisons: AIDataPoint[] = [];
        
        const comparisonPatterns = [
            /(.+?)\s*(?:vs|versus|contre|par rapport à)\s*(.+)/gi,
            /(?:Avant|Before)[:\s]*(.+?)(?:Après|After)[:\s]*(.+)/gi,
            /(.+?)\s*→\s*(.+)/g,
        ];
        
        for (const pattern of comparisonPatterns) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(content)) !== null) {
                const comparisonData = this.parseComparisonMatch(match, content);
                if (comparisonData) {
                    comparisons.push({
                        type: 'comparison',
                        content: match[0],
                        value: comparisonData,
                        confidence: this.calculateComparisonConfidence(match, content),
                        context: this.getComparisonContext(match, content),
                        relatedData: this.findRelatedComparisonData(match, content)
                    });
                }
            }
        }
        
        return comparisons;
    }
    
    /**
     * Détection d'intention basée sur le contenu
     */
    private static detectIntent(content: string, serviceId?: string): string {
        const intentKeywords = {
            'analyze': ['analyser', 'évaluer', 'examiner', 'analyze', 'evaluate'],
            'improve': ['améliorer', 'optimiser', 'renforcer', 'improve', 'enhance'],
            'plan': ['planifier', 'organiser', 'prévoir', 'plan', 'organize'],
            'compare': ['comparer', 'différence', 'versus', 'compare', 'difference'],
            'recommend': ['recommander', 'conseiller', 'suggérer', 'recommend', 'suggest'],
            'simulate': ['simuler', 'pratiquer', 'exercer', 'simulate', 'practice']
        };
        
        const contentLower = content.toLowerCase();
        let maxScore = 0;
        let detectedIntent = 'analyze';
        
        for (const [intent, keywords] of Object.entries(intentKeywords)) {
            let score = 0;
            keywords.forEach(keyword => {
                const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
                score += matches * (keyword.length / 10); // Poids basé sur la longueur du mot-clé
            });
            
            if (score > maxScore) {
                maxScore = score;
                detectedIntent = intent;
            }
        }
        
        // Ajustement basé sur le service
        if (serviceId) {
            const serviceIntents = {
                'resume-review': 'analyze',
                'interview-prep': 'simulate',
                'career-advice': 'plan',
                'salary-negotiation': 'recommend',
                'cover-letter': 'improve'
            };
            
            if (serviceIntents[serviceId] && maxScore < 3) {
                detectedIntent = serviceIntents[serviceId];
            }
        }
        
        return detectedIntent;
    }
    
    /**
     * Détection de contexte
     */
    private static detectContext(content: string, serviceId?: string): 'professional' | 'personal' | 'educational' | 'career' | 'interview' | 'negotiation' {
        const contextKeywords = {
            'professional': ['travail', 'entreprise', 'professionnel', 'business', 'corporate'],
            'personal': ['personnel', 'privé', 'individuel', 'personal', 'private'],
            'educational': ['formation', 'étude', 'diplôme', 'education', 'degree'],
            'career': ['carrière', 'évolution', 'promotion', 'career', 'advancement'],
            'interview': ['entretien', 'entrevue', 'interview', 'meeting'],
            'negotiation': ['négociation', 'salaire', 'negotiation', 'salary']
        };
        
        const contentLower = content.toLowerCase();
        let maxScore = 0;
        let detectedContext: any = 'professional';
        
        for (const [context, keywords] of Object.entries(contextKeywords)) {
            let score = 0;
            keywords.forEach(keyword => {
                score += (contentLower.match(new RegExp(keyword, 'g')) || []).length;
            });
            
            if (score > maxScore) {
                maxScore = score;
                detectedContext = context;
            }
        }
        
        // Priorité au service si défini
        if (serviceId) {
            const serviceContexts = {
                'resume-review': 'professional',
                'interview-prep': 'interview',
                'career-advice': 'career',
                'salary-negotiation': 'negotiation',
                'cover-letter': 'professional'
            };
            
            return serviceContexts[serviceId] || detectedContext;
        }
        
        return detectedContext;
    }
    
    /**
     * Structure les données extraites
     */
    private static structureExtractedData(dataPoints: AIDataPoint[], context: string): any {
        const structured = {
            scores: dataPoints.filter(dp => dp.type === 'score'),
            actions: dataPoints.filter(dp => dp.type === 'list'),
            timelines: dataPoints.filter(dp => dp.type === 'timeline'),
            tables: dataPoints.filter(dp => dp.type === 'table'),
            comparisons: dataPoints.filter(dp => dp.type === 'comparison'),
            summary: {
                totalDataPoints: dataPoints.length,
                highConfidenceItems: dataPoints.filter(dp => dp.confidence > 80).length,
                context,
                primaryDataType: this.getPrimaryDataType(dataPoints)
            }
        };
        
        return structured;
    }
    
    /**
     * Génère des suggestions intelligentes
     */
    private static generateSmartSuggestions(dataPoints: AIDataPoint[], intent: string, context: string): string[] {
        const suggestions = [];
        
        // Suggestions basées sur les données détectées
        if (dataPoints.filter(dp => dp.type === 'score').length > 0) {
            suggestions.push('Créer un tableau de bord interactif des scores');
        }
        
        if (dataPoints.filter(dp => dp.type === 'list').length >= 3) {
            suggestions.push('Générer une checklist actionnable');
        }
        
        if (dataPoints.filter(dp => dp.type === 'timeline').length > 0) {
            suggestions.push('Visualiser la timeline sous forme de roadmap');
        }
        
        if (dataPoints.filter(dp => dp.type === 'table').length > 0) {
            suggestions.push('Rendre les tableaux interactifs avec tri et filtres');
        }
        
        // Suggestions basées sur l'intention
        switch (intent) {
            case 'analyze':
                suggestions.push('Ajouter des graphiques de tendance');
                break;
            case 'improve':
                suggestions.push('Créer un plan d\'amélioration progressif');
                break;
            case 'plan':
                suggestions.push('Générer un calendrier de suivi');
                break;
            case 'simulate':
                suggestions.push('Lancer un mode simulation interactive');
                break;
        }
        
        // Suggestions basées sur le contexte
        switch (context) {
            case 'interview':
                suggestions.push('Activer le simulateur d\'entretien');
                break;
            case 'negotiation':
                suggestions.push('Ouvrir l\'assistant de négociation');
                break;
            case 'career':
                suggestions.push('Créer une feuille de route carrière');
                break;
        }
        
        return suggestions.slice(0, 5); // Limiter à 5 suggestions max
    }
    
    // Méthodes utilitaires privées (placeholders pour l'implémentation complète)
    private static parseScoreMatch(match: RegExpExecArray, content: string) {
        // Parser intelligent des scores
        return null;
    }
    
    private static calculateScoreConfidence(match: RegExpExecArray, content: string): number {
        return 75;
    }
    
    private static getScoreContext(match: RegExpExecArray, content: string): string {
        return 'professional';
    }
    
    private static findRelatedScoreData(match: RegExpExecArray, content: string): string[] {
        return [];
    }
    
    private static detectActionPriority(text: string, content: string): 'high' | 'medium' | 'low' {
        const urgentWords = ['urgent', 'immédiat', 'rapidement', 'asap', 'critique'];
        const textLower = text.toLowerCase();
        
        return urgentWords.some(word => textLower.includes(word)) ? 'high' : 'medium';
    }
    
    private static categorizeAction(text: string): string {
        // Catégorisation intelligente des actions
        return 'general';
    }
    
    private static estimateActionTime(text: string): string {
        // Estimation du temps nécessaire
        return '1h';
    }
    
    private static assessActionComplexity(text: string): 'simple' | 'medium' | 'complex' {
        return text.length > 100 ? 'complex' : text.length > 50 ? 'medium' : 'simple';
    }
    
    private static calculateActionConfidence(text: string, content: string): number {
        return 80;
    }
    
    private static getActionContext(match: RegExpExecArray, content: string): string {
        return 'professional';
    }
    
    private static findRelatedActionData(text: string, content: string): string[] {
        return [];
    }
    
    private static parseTimelineMatch(match: RegExpExecArray, content: string) {
        return null;
    }
    
    private static calculateTimelineConfidence(match: RegExpExecArray, content: string): number {
        return 70;
    }
    
    private static getTimelineContext(match: RegExpExecArray, content: string): string {
        return 'career';
    }
    
    private static findRelatedTimelineData(match: RegExpExecArray, content: string): string[] {
        return [];
    }
    
    private static parseTableMatch(match: RegExpExecArray, content: string) {
        return null;
    }
    
    private static calculateTableConfidence(tableData: any, content: string): number {
        return 85;
    }
    
    private static getTableContext(match: RegExpExecArray, content: string): string {
        return 'professional';
    }
    
    private static findRelatedTableData(match: RegExpExecArray, content: string): string[] {
        return [];
    }
    
    private static parseComparisonMatch(match: RegExpExecArray, content: string) {
        return null;
    }
    
    private static calculateComparisonConfidence(match: RegExpExecArray, content: string): number {
        return 75;
    }
    
    private static getComparisonContext(match: RegExpExecArray, content: string): string {
        return 'professional';
    }
    
    private static findRelatedComparisonData(match: RegExpExecArray, content: string): string[] {
        return [];
    }
    
    private static calculateOverallConfidence(dataPoints: AIDataPoint[], intent: string): number {
        if (dataPoints.length === 0) return 20;
        
        const avgConfidence = dataPoints.reduce((sum, dp) => sum + dp.confidence, 0) / dataPoints.length;
        const dataRichness = Math.min(dataPoints.length * 10, 30); // Bonus pour richesse des données
        
        return Math.min(95, Math.round(avgConfidence + dataRichness));
    }
    
    private static getPrimaryDataType(dataPoints: AIDataPoint[]): string {
        if (dataPoints.length === 0) return 'none';
        
        const typeCounts = dataPoints.reduce((counts, dp) => {
            counts[dp.type] = (counts[dp.type] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);
        
        return Object.entries(typeCounts)
            .sort(([,a], [,b]) => b - a)[0][0];
    }
}