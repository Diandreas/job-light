/**
 * Service de détection et parsing des artefacts dans les réponses IA
 * Nouvelle version avec analyse IA intelligente
 */

import { AIArtifactGenerator, AIGeneratedArtifact } from './AIArtifactGenerator';
import { AIContentAnalyzer } from '../services/AIContentAnalyzer';

export interface ArtifactData {
    id: string;
    type: 'table' | 'chart' | 'score' | 'checklist' | 'roadmap' | 'heatmap' | 'dashboard' | 'timer' | 'cv-analysis' | 'interview-simulator' | 'salary-negotiator' | 'cv-evaluation';
    title: string;
    data: any;
    confidence?: number;
    source?: string;
    metadata?: {
        exportable?: boolean;
        interactive?: boolean;
        service?: string;
        aiGenerated?: boolean;
        timestamp?: number;
        priority?: 'high' | 'medium' | 'low';
    };
}

export class ArtifactDetector {
    /**
     * Détecter et extraire les artefacts d'un message IA avec analyse intelligente
     */
    static async detectArtifacts(
        content: string, 
        serviceId?: string, 
        userContext?: any,
        useAI: boolean = true
    ): Promise<ArtifactData[]> {
        console.log('🔍 Détection d\'artefacts - Mode IA:', useAI);
        
        let artifacts: ArtifactData[] = [];

        if (useAI) {
            // Nouvelle approche avec IA
            try {
                const aiAnalysis = AIContentAnalyzer.analyzeAIContent(content, serviceId, userContext);
                console.log('🧠 Analyse IA complétée:', aiAnalysis);
                
                const aiArtifacts = await AIArtifactGenerator.generateArtifacts(content, serviceId, userContext);
                console.log('🎨 Artefacts IA générés:', aiArtifacts.length);
                
                // Convertir les artefacts IA au format legacy
                artifacts = aiArtifacts.map(aiArtifact => this.convertAIArtifactToLegacy(aiArtifact));
                
                // Si l'IA n'a pas trouvé assez d'artefacts, utiliser la méthode classique en complément
                if (artifacts.length === 0) {
                    console.log('⚠️ Aucun artefact IA détecté, utilisation méthode classique...');
                    artifacts = this.detectArtifactsClassic(content, serviceId);
                }
                
            } catch (error) {
                console.error('❌ Erreur analyse IA, utilisation méthode classique:', error);
                artifacts = this.detectArtifactsClassic(content, serviceId);
            }
        } else {
            // Méthode classique (fallback)
            artifacts = this.detectArtifactsClassic(content, serviceId);
        }

        console.log(`✅ ${artifacts.length} artefacts détectés au total`);
        return artifacts;
    }

    /**
     * Méthode classique de détection (ancienne logique)
     */
    private static detectArtifactsClassic(content: string, serviceId?: string): ArtifactData[] {
        const artifacts: ArtifactData[] = [];

        // 1. Détecter les tableaux markdown
        const tables = this.detectTables(content);
        artifacts.push(...tables);

        // 2. Détecter les scores et métriques
        const scores = this.detectScores(content, serviceId);
        artifacts.push(...scores);

        // 3. Détecter les checklists
        const checklists = this.detectChecklists(content);
        artifacts.push(...checklists);

        // 4. Détecter les données de graphiques
        const charts = this.detectCharts(content);
        artifacts.push(...charts);

        // 5. Détecter les roadmaps/timelines
        const roadmaps = this.detectRoadmaps(content);
        artifacts.push(...roadmaps);

        // 6. Détecter spécifiquement les tableaux d'évaluation de CV (indépendant du service)
        const cvEvaluation = this.detectCVEvaluationTable(content);
        if (cvEvaluation) artifacts.push(cvEvaluation);

        // 7. Détecter les artefacts spécialisés selon le service
        const specialized = this.detectSpecializedArtifacts(content, serviceId);
        artifacts.push(...specialized);

        return artifacts;
    }

    /**
     * Convertit un artefact IA au format legacy
     */
    private static convertAIArtifactToLegacy(aiArtifact: AIGeneratedArtifact): ArtifactData {
        return {
            id: aiArtifact.id,
            type: aiArtifact.type as any,
            title: aiArtifact.title,
            data: aiArtifact.data,
            confidence: aiArtifact.confidence,
            source: aiArtifact.source,
            metadata: {
                exportable: aiArtifact.metadata.exportable,
                interactive: aiArtifact.metadata.interactive,
                service: aiArtifact.metadata.serviceId,
                aiGenerated: aiArtifact.metadata.aiGenerated,
                timestamp: aiArtifact.metadata.timestamp,
                priority: aiArtifact.metadata.priority
            }
        };
    }

    /**
     * Détecter les tableaux markdown
     */
    private static detectTables(content: string): ArtifactData[] {
        const artifacts: ArtifactData[] = [];
        
        // Version plus flexible - détecte les tableaux avec différents formats
        const tablePatterns = [
            // Pattern standard markdown
            /\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g,
            // Pattern plus flexible pour les tableaux avec espaces
            /^\|(.+)\|\s*$/gm
        ];

        // Essayer le pattern standard en premier
        let match;
        const standardRegex = /\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g;
        
        while ((match = standardRegex.exec(content)) !== null) {
            const artifact = this.parseStandardTable(match, content);
            if (artifact) artifacts.push(artifact);
        }

        // Si aucun tableau standard trouvé, chercher des patterns plus flexibles
        if (artifacts.length === 0) {
            const flexibleArtifact = this.parseFlexibleTable(content);
            if (flexibleArtifact) artifacts.push(flexibleArtifact);
        }

        return artifacts;
    }

    /**
     * Parser un tableau markdown standard
     */
    private static parseStandardTable(match: RegExpExecArray, content: string): ArtifactData | null {
        const [fullMatch, headerRow, dataRows] = match;
        
        // Parser les headers
        const headers = headerRow.split('|')
            .map(h => h.trim())
            .filter(h => h.length > 0);

        // Parser les données
        const rows = dataRows.trim().split('\n')
            .map(row => row.split('|')
                .map(cell => cell.trim())
                .filter(cell => cell.length > 0))
            .filter(row => row.length > 0);

        if (headers.length > 0 && rows.length > 0) {
            return {
                id: `table-classic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'table',
                title: this.extractTableTitle(content, fullMatch) || 'Tableau de données',
                data: {
                    headers,
                    rows,
                    sortable: true,
                    filterable: headers.length <= 5,
                    exportable: true
                },
                metadata: {
                    exportable: true,
                    interactive: true,
                    aiGenerated: false
                }
            };
        }
        
        return null;
    }

    /**
     * Parser un tableau avec un format plus flexible
     */
    private static parseFlexibleTable(content: string): ArtifactData | null {
        // Chercher des lignes qui ressemblent à des tableaux
        const lines = content.split('\n').map(line => line.trim());
        const tableLines: string[] = [];
        let inTable = false;
        let headerFound = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Détecter le début d'un tableau (ligne avec des |)
            if (line.includes('|') && line.split('|').length >= 3) {
                if (!inTable) {
                    inTable = true;
                    tableLines.length = 0; // Reset
                }
                tableLines.push(line);
                
                // Vérifier si la ligne suivante est un séparateur
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1].trim();
                    if (nextLine.match(/^[\|\-\s:]+$/)) {
                        headerFound = true;
                        i++; // Skip separator line
                        continue;
                    }
                }
            } else if (inTable) {
                // Fin du tableau
                break;
            }
        }

        if (tableLines.length >= 2) {
            // Au moins une ligne header + une ligne de données
            const firstLine = tableLines[0];
            const headers = firstLine.split('|')
                .map(h => h.trim())
                .filter(h => h.length > 0);

            const rows = tableLines.slice(headerFound ? 0 : 1)
                .map(line => line.split('|')
                    .map(cell => cell.trim())
                    .filter(cell => cell.length > 0))
                .filter(row => row.length > 0);

            if (headers.length > 0 && rows.length > 0) {
                return {
                    id: `table-flexible-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'table',
                    title: 'Tableau d\'évaluation',
                    data: {
                        headers: headers.length > 0 ? headers : ['Critère', 'Score', 'Notes'],
                        rows,
                        sortable: true,
                        filterable: true,
                        exportable: true
                    },
                    metadata: {
                        exportable: true,
                        interactive: true,
                        aiGenerated: false
                    }
                };
            }
        }
        
        return null;
    }

    /**
     * Détecter les scores et métriques
     */
    private static detectScores(content: string, serviceId?: string): ArtifactData[] {
        const artifacts: ArtifactData[] = [];

        // Score global (ex: "Score: 87/100" ou "87%")
        const globalScoreRegex = /(?:Score|Note|Résultat)[\s:]*(\d+)(?:\/100|%)/gi;
        const globalMatch = globalScoreRegex.exec(content);

        if (globalMatch) {
            const score = parseInt(globalMatch[1]);
            
            // Détecter les sous-scores
            const subScores = this.detectSubScores(content);
            
            artifacts.push({
                id: `score-classic-${Date.now()}`,
                type: 'score',
                title: this.getScoreTitle(serviceId) || 'Évaluation',
                data: {
                    globalScore: score,
                    maxScore: content.includes('/100') ? 100 : 100,
                    subScores,
                    recommendations: this.extractRecommendations(content)
                },
                metadata: {
                    exportable: true,
                    interactive: true,
                    service: serviceId,
                    aiGenerated: false
                }
            });
        }

        return artifacts;
    }

    /**
     * Détecter les sous-scores détaillés
     */
    private static detectSubScores(content: string): Array<{name: string, score: number, max: number}> {
        const subScoreRegex = /(?:^|\n)\s*[-•]\s*([^:]+):\s*([█░\d\s%/]+)(\d+)(?:%|\/(\d+))?/gm;
        const subScores: Array<{name: string, score: number, max: number}> = [];
        let match;

        while ((match = subScoreRegex.exec(content)) !== null) {
            const [, name, visual, scoreStr, maxStr] = match;
            const score = parseInt(scoreStr);
            const max = maxStr ? parseInt(maxStr) : 100;
            
            if (!isNaN(score) && score >= 0 && score <= max) {
                subScores.push({
                    name: name.trim(),
                    score,
                    max
                });
            }
        }

        return subScores;
    }

    /**
     * Détecter les checklists
     */
    private static detectChecklists(content: string): ArtifactData[] {
        const artifacts: ArtifactData[] = [];
        
        // Détecter les listes avec checkbox ou bullets
        const checklistRegex = /(?:^|\n)((?:\s*[☐☑✓❌]\s*.+(?:\n|$))+)/gm;
        let match;

        while ((match = checklistRegex.exec(content)) !== null) {
            const [, checklistText] = match;
            
            const items = checklistText.trim().split('\n')
                .map(line => {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith('☐')) {
                        return { text: cleanLine.substring(1).trim(), completed: false, priority: 'medium' };
                    } else if (cleanLine.startsWith('☑') || cleanLine.startsWith('✓')) {
                        return { text: cleanLine.substring(1).trim(), completed: true, priority: 'medium' };
                    } else if (cleanLine.startsWith('❌')) {
                        return { text: cleanLine.substring(1).trim(), completed: false, priority: 'high' };
                    } else if (cleanLine.startsWith('-') || cleanLine.startsWith('•')) {
                        return { text: cleanLine.substring(1).trim(), completed: false, priority: 'medium' };
                    }
                    return null;
                })
                .filter(item => item !== null);

            if (items.length >= 2) {
                artifacts.push({
                    type: 'checklist',
                    title: this.extractChecklistTitle(content, checklistText) || 'Plan d\'action',
                    data: {
                        items,
                        completable: true,
                        progress: items.filter(item => item.completed).length / items.length * 100
                    },
                    metadata: {
                        exportable: true,
                        interactive: true
                    }
                });
            }
        }

        return artifacts;
    }

    /**
     * Détecter les données de graphiques
     */
    private static detectCharts(content: string): ArtifactData[] {
        const artifacts: ArtifactData[] = [];

        // Détecter les progressions numériques (ex: évolution salaire)
        const progressionRegex = /(\d+k?€?)\s*→\s*(\d+k?€?)/g;
        const progressions = [];
        let match;

        while ((match = progressionRegex.exec(content)) !== null) {
            progressions.push({
                from: this.parseNumber(match[1]),
                to: this.parseNumber(match[2]),
                label: this.extractProgressionLabel(content, match[0])
            });
        }

        if (progressions.length > 0) {
            artifacts.push({
                type: 'chart',
                title: 'Évolution Prévue',
                data: {
                    type: 'line',
                    progressions,
                    interactive: true
                },
                metadata: {
                    exportable: true,
                    interactive: true
                }
            });
        }

        return artifacts;
    }

    /**
     * Détecter les roadmaps/timelines
     */
    private static detectRoadmaps(content: string): ArtifactData[] {
        const artifacts: ArtifactData[] = [];
        
        // Détecter les timelines avec dates
        const timelineRegex = /(?:^|\n)\s*(?:├─|└─|│)\s*([^:]+):\s*(.+)/gm;
        const timelineItems = [];
        let match;

        while ((match = timelineRegex.exec(content)) !== null) {
            const [, timeframe, description] = match;
            timelineItems.push({
                timeframe: timeframe.trim(),
                description: description.trim(),
                completed: false
            });
        }

        if (timelineItems.length >= 2) {
            artifacts.push({
                type: 'roadmap',
                title: 'Feuille de Route',
                data: {
                    items: timelineItems,
                    interactive: true,
                    trackProgress: true
                },
                metadata: {
                    exportable: true,
                    interactive: true
                }
            });
        }

        return artifacts;
    }

    /**
     * Détecter spécifiquement les tableaux d'évaluation de CV
     */
    private static detectCVEvaluationTable(content: string): ArtifactData | null {
        // Chercher des patterns spécifiques aux évaluations de CV
        const cvKeywords = ['Clarity', 'Structure', 'Relevance', 'Achievement', 'Skills', 'Professional', 'Branding', 'International', 'Language', 'Proficiency', 'criteria', 'score', 'notes', 'visibility', 'orientation', 'appeal'];
        const scoreKeywords = ['Score', '/10', 'Revised Global Score', 'Criteria', '1-10', 'Scale:', 'Global Score'];
        
        const contentLower = content.toLowerCase();
        const hasCVKeywords = cvKeywords.some(keyword => contentLower.includes(keyword.toLowerCase()));
        const hasScoreKeywords = scoreKeywords.some(keyword => content.includes(keyword));
        
        console.log('🔍 CV Detection - CV Keywords found:', hasCVKeywords);
        console.log('🔍 CV Detection - Score Keywords found:', hasScoreKeywords); 
        console.log('🔍 CV Detection - Has tables (|):', content.includes('|'));
        console.log('🔍 CV Detection - Has bold markdown (**):', content.includes('**'));
        
        // Détecter format tableau traditionnel avec |
        if ((hasCVKeywords || hasScoreKeywords) && content.includes('|')) {
            return this.parseCVTableFormat(content);
        }
        
        // Détecter format markdown bold avec **
        if ((hasCVKeywords || hasScoreKeywords) && content.includes('**')) {
            return this.parseCVBoldFormat(content);
        }
        
        return null;
    }

    /**
     * Parser le format tableau traditionnel avec |
     */
    private static parseCVTableFormat(content: string): ArtifactData | null {
        // Extraire le tableau même s'il n'a pas de format markdown standard
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.includes('|'));
        
        console.log('🔍 CV Detection - Lines with |:', lines.length);
            
        if (lines.length >= 2) { // Au moins header + data (plus flexible)
            const headers = [];
            const rows = [];
            let headerFound = false;
            
            // Traiter toutes les lignes contenant des |
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
                
                console.log(`🔍 Line ${i}: "${line}" -> ${cells.length} cells:`, cells);
                
                // Ignorer les lignes de séparation
                if (cells.some(cell => cell.match(/^[-:\s]+$/))) {
                    console.log('🔍 Skipping separator line');
                    continue;
                }
                
                if (cells.length >= 2) {
                    // Détecter header par position ou contenu
                    const isHeaderLine = i === 0 || 
                                       cells[0].toLowerCase().includes('criteria') || 
                                       cells[0].toLowerCase().includes('critère') ||
                                       cells.some(cell => cell.toLowerCase().includes('score'));
                    
                    if (isHeaderLine && !headerFound) {
                        headers.push(...cells);
                        headerFound = true;
                        console.log('🔍 Header detected:', headers);
                    } else {
                        rows.push(cells);
                        console.log('🔍 Data row added:', cells);
                    }
                }
            }
            
            // Si pas de headers détectés, utiliser des headers par défaut
            if (headers.length === 0) {
                headers.push('Critère', 'Score', 'Notes');
                console.log('🔍 Using default headers:', headers);
            }
            
            console.log('🔍 Final detection - Headers:', headers.length, 'Rows:', rows.length);
            
            if (rows.length > 0) {
                console.log('✅ CV Evaluation table detected successfully!');
                return {
                    id: `cv-evaluation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: 'cv-evaluation',
                    title: 'Évaluation détaillée du CV',
                    data: {
                        headers: ['Critère', 'Score', 'Notes'],
                        rows,
                        sortable: true,
                        filterable: true,
                        exportable: true
                    },
                    metadata: {
                        exportable: true,
                        interactive: true,
                        aiGenerated: true,
                        service: 'resume-review',
                        priority: 'high'
                    }
                };
            }
        }
        
        return null;
    }

    /**
     * Parser le format markdown bold avec **
     */
    private static parseCVBoldFormat(content: string): ArtifactData | null {
        console.log('🔍 Parsing CV Bold Format...');
        
        // Pattern pour détecter les lignes de critères avec scores
        const criteriaPattern = /\*\*([^*]+)\*\*\s+(\d+\/\d+)\s+(.*?)(?=\*\*|$)/gs;
        const rows = [];
        
        let match;
        while ((match = criteriaPattern.exec(content)) !== null) {
            const criterion = match[1].trim();
            const score = match[2].trim();
            const notes = match[3].trim().replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
            
            console.log(`🔍 Bold Format - Found: "${criterion}" | "${score}" | "${notes}"`);
            
            if (criterion && score && criterion !== 'Issue' && criterion !== 'Current Date') {
                rows.push([criterion, score, notes]);
            }
        }
        
        console.log('🔍 Bold Format - Total rows found:', rows.length);
        
        if (rows.length > 0) {
            console.log('✅ CV Evaluation (Bold Format) detected successfully!');
            return {
                id: `cv-evaluation-bold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: 'cv-evaluation',
                title: 'Évaluation détaillée du CV',
                data: {
                    headers: ['Critère', 'Score', 'Notes'],
                    rows,
                    sortable: true,
                    filterable: true,
                    exportable: true
                },
                metadata: {
                    exportable: true,
                    interactive: true,
                    aiGenerated: true,
                    service: 'resume-review',
                    priority: 'high'
                }
            };
        }
        
        return null;
    }

    // Méthodes utilitaires
    private static extractTableTitle(content: string, tableMatch: string): string | null {
        const beforeTable = content.substring(0, content.indexOf(tableMatch));
        const lines = beforeTable.split('\n').reverse();
        
        for (const line of lines.slice(0, 3)) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('|') && trimmed.length < 100) {
                return trimmed.replace(/[#*_]/g, '').trim();
            }
        }
        return null;
    }

    private static extractChecklistTitle(content: string, checklistMatch: string): string | null {
        const beforeChecklist = content.substring(0, content.indexOf(checklistMatch));
        const lines = beforeChecklist.split('\n').reverse();
        
        for (const line of lines.slice(0, 2)) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('☐') && !trimmed.startsWith('•') && trimmed.length < 80) {
                return trimmed.replace(/[#*_]/g, '').trim();
            }
        }
        return null;
    }

    private static getScoreTitle(serviceId?: string): string {
        const titles = {
            'resume-review': 'Analyse CV',
            'cover-letter': 'Score ATS',
            'interview-prep': 'Performance Entretien',
            'career-advice': 'Évaluation Carrière'
        };
        return titles[serviceId] || 'Évaluation';
    }

    private static extractRecommendations(content: string): string[] {
        const recommendations = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                const rec = trimmed.substring(1).trim();
                if (rec.length > 10 && rec.length < 200) {
                    recommendations.push(rec);
                }
            }
        }
        
        return recommendations.slice(0, 5); // Max 5 recommandations
    }

    private static parseNumber(str: string): number {
        const num = str.replace(/[k€]/g, '');
        const value = parseInt(num);
        return str.includes('k') ? value * 1000 : value;
    }

    private static extractProgressionLabel(content: string, progression: string): string {
        const beforeProgression = content.substring(0, content.indexOf(progression));
        const lines = beforeProgression.split('\n').reverse();
        
        for (const line of lines.slice(0, 2)) {
            const trimmed = line.trim();
            if (trimmed && trimmed.length < 50) {
                return trimmed.replace(/[#*_]/g, '').trim();
            }
        }
        return 'Évolution';
    }

    /**
     * Nettoyer le contenu en supprimant les artefacts détectés
     */
    static cleanContentForDisplay(content: string, artifacts: ArtifactData[]): string {
        let cleanContent = content;

        console.log('🧹 Cleaning content, artifacts found:', artifacts.length);

        // Si des artefacts CV ont été détectés, supprimer le contenu correspondant
        const hasCVEvaluation = artifacts.some(a => a.type === 'cv-evaluation');
        
        if (hasCVEvaluation) {
            console.log('🧹 CV Evaluation detected, cleaning bold format...');
            
            // Supprimer le format bold markdown pour les évaluations CV
            // Pattern pour les critères: **Critère** Score Notes
            cleanContent = cleanContent.replace(/\*\*([^*]+)\*\*\s+\d+\/\d+\s+[^\*]*(?=\*\*|$)/gs, '');
            
            // Supprimer les lignes de headers/titles isolées
            cleanContent = cleanContent.replace(/\*\*(Criteria|Score|Notes|Issue|Current Date|Correction)\*\*/g, '');
            
            // Supprimer les fragments orphelins
            cleanContent = cleanContent.replace(/\d+\/\d+\s+[A-Za-z\s,.-]+/g, '');
            
            console.log('🧹 After CV cleaning:', cleanContent.substring(0, 200));
        }

        // Supprimer les tableaux markdown standards
        cleanContent = cleanContent.replace(/\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g, '');
        
        // Supprimer les tableaux flexibles (toute séquence de lignes avec des |)
        const lines = cleanContent.split('\n');
        const filteredLines = [];
        let inTable = false;
        let consecutiveTableLines = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.includes('|') && line.split('|').length >= 3) {
                consecutiveTableLines++;
                inTable = true;
            } else {
                // Si on était dans un tableau et qu'on a au moins 2 lignes consécutives
                if (inTable && consecutiveTableLines >= 2) {
                    // Ne pas ajouter les lignes précédentes du tableau
                    for (let j = 0; j < consecutiveTableLines; j++) {
                        if (filteredLines.length > 0) {
                            filteredLines.pop();
                        }
                    }
                }
                inTable = false;
                consecutiveTableLines = 0;
                filteredLines.push(lines[i]);
            }
            
            if (inTable) {
                filteredLines.push(lines[i]);
            }
        }
        
        // Traitement final si le contenu se termine par un tableau
        if (inTable && consecutiveTableLines >= 2) {
            for (let j = 0; j < consecutiveTableLines; j++) {
                if (filteredLines.length > 0) {
                    filteredLines.pop();
                }
            }
        }
        
        cleanContent = filteredLines.join('\n');

        // Supprimer les checklists détectées
        cleanContent = cleanContent.replace(/(?:^|\n)((?:\s*[☐☑✓❌]\s*.+(?:\n|$))+)/gm, '');

        // Supprimer les timelines détectées
        cleanContent = cleanContent.replace(/(?:^|\n)\s*(?:├─|└─|│)\s*([^:]+):\s*(.+)/gm, '');

        // Nettoyer les lignes vides multiples
        cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, '\n\n');

        // Supprimer les lignes quasi-vides avec juste des fragments
        cleanContent = cleanContent.replace(/^\s*[,.-]+\s*$/gm, '');

        const finalContent = cleanContent.trim();
        console.log('🧹 Final cleaned content:', finalContent.substring(0, 200));
        
        return finalContent;
    }

    /**
     * Détecter les artefacts spécialisés selon le service IA
     */
    private static detectSpecializedArtifacts(content: string, serviceId?: string): ArtifactData[] {
        const artifacts: ArtifactData[] = [];

        switch (serviceId) {
            case 'resume-review':
                // Détecter les analyses de CV avec sections
                if (content.includes('Structure') && content.includes('Contenu') && content.includes('Mots-clés')) {
                    const cvSections = this.parseCvSections(content);
                    if (cvSections.length > 0) {
                        artifacts.push({
                            type: 'heatmap',
                            title: 'Analyse Visuelle du CV',
                            data: {
                                sections: cvSections,
                                globalScore: this.extractGlobalScore(content) || 75
                            },
                            metadata: {
                                exportable: true,
                                interactive: true,
                                service: serviceId
                            }
                        });
                    }
                }
                break;

            case 'interview-prep':
                // Détecter les simulations d'entretien avec questions
                if (content.includes('Question') && content.includes('Performance')) {
                    const questions = this.parseInterviewQuestions(content);
                    if (questions.length > 0) {
                        artifacts.push({
                            type: 'timer',
                            title: 'Simulateur d\'Entretien',
                            data: {
                                duration: 30, // 30 minutes par défaut
                                questions,
                                currentQuestion: 0
                            },
                            metadata: {
                                exportable: true,
                                interactive: true,
                                service: serviceId
                            }
                        });
                    }
                }
                break;

            case 'cover-letter':
                // Détecter les analyses ATS
                if (content.includes('ATS') && content.includes('Score')) {
                    const keywords = this.parseAtsKeywords(content);
                    const suggestions = this.extractRecommendations(content);
                    
                    if (keywords.length > 0) {
                        artifacts.push({
                            type: 'dashboard',
                            title: 'Analyseur ATS',
                            data: {
                                globalScore: this.extractGlobalScore(content) || 75,
                                keywords,
                                suggestions,
                                originalText: this.extractOriginalText(content)
                            },
                            metadata: {
                                exportable: true,
                                interactive: true,
                                service: serviceId
                            }
                        });
                    }
                }
                break;

            case 'career-advice':
                // Détecter les roadmaps de carrière
                if (content.includes('├─') || content.includes('└─') || content.includes('Progression')) {
                    const roadmapSteps = this.parseCareerRoadmap(content);
                    if (roadmapSteps.length > 0) {
                        artifacts.push({
                            type: 'roadmap',
                            title: 'Feuille de Route Carrière',
                            data: {
                                steps: roadmapSteps,
                                currentPosition: this.extractCurrentPosition(content),
                                targetPosition: this.extractTargetPosition(content),
                                timeframe: this.extractTimeframe(content),
                                successProbability: this.extractSuccessProbability(content) || 75
                            },
                            metadata: {
                                exportable: true,
                                interactive: true,
                                service: serviceId
                            }
                        });
                    }
                }
                break;
        }

        return artifacts;
    }

    /**
     * Parser les sections de CV pour la heatmap
     */
    private static parseCvSections(content: string): any[] {
        const sections = [];
        const sectionNames = ['En-tête', 'Résumé', 'Expériences', 'Compétences', 'Formation'];
        
        sectionNames.forEach((name, index) => {
            // Chercher le score de cette section
            const scoreRegex = new RegExp(`${name}[\\s:]*([\\d]+)(?:/100|%)`, 'i');
            const match = scoreRegex.exec(content);
            const score = match ? parseInt(match[1]) : 60 + Math.random() * 30;
            
            sections.push({
                name,
                score: Math.round(score),
                recommendations: this.extractSectionRecommendations(content, name),
                position: { x: 0, y: index * 60, width: 100, height: 50 },
                priority: score < 60 ? 'high' : score < 80 ? 'medium' : 'low'
            });
        });

        return sections;
    }

    /**
     * Parser les questions d'entretien
     */
    private static parseInterviewQuestions(content: string): any[] {
        const questions = [];
        const questionRegex = /Question\s+(\d+)[:\s]*(.+?)(?=Question\s+\d+|$)/gs;
        let match;
        let questionId = 1;

        while ((match = questionRegex.exec(content)) !== null) {
            const [, number, text] = match;
            questions.push({
                id: questionId++,
                text: text.trim().substring(0, 200),
                category: this.guessQuestionCategory(text),
                expectedTime: 120, // 2 minutes par défaut
                answered: false
            });
        }

        // Si pas de questions détectées, créer des questions par défaut
        if (questions.length === 0) {
            questions.push(
                {
                    id: 1,
                    text: "Pouvez-vous vous présenter en quelques minutes ?",
                    category: 'hr',
                    expectedTime: 180,
                    answered: false
                },
                {
                    id: 2,
                    text: "Pourquoi ce poste vous intéresse-t-il ?",
                    category: 'behavioral',
                    expectedTime: 120,
                    answered: false
                },
                {
                    id: 3,
                    text: "Décrivez-moi un défi technique que vous avez résolu.",
                    category: 'technical',
                    expectedTime: 180,
                    answered: false
                }
            );
        }

        return questions;
    }

    /**
     * Parser la roadmap de carrière
     */
    private static parseCareerRoadmap(content: string): any[] {
        const steps = [];
        const timelineRegex = /(?:├─|└─)\s*([^:]+):\s*(.+)/g;
        let match;
        let stepId = 1;

        while ((match = timelineRegex.exec(content)) !== null) {
            const [, timeframe, description] = match;
            steps.push({
                id: `step-${stepId++}`,
                timeframe: timeframe.trim(),
                title: this.extractStepTitle(description),
                description: description.trim(),
                actions: this.extractStepActions(content, description),
                completed: false,
                difficulty: 'medium',
                impact: 'medium',
                category: this.guessStepCategory(description)
            });
        }

        return steps;
    }

    // Méthodes utilitaires pour les artefacts spécialisés
    private static extractSectionRecommendations(content: string, sectionName: string): string[] {
        const recommendations = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (line.includes(sectionName.toLowerCase()) && line.includes('•')) {
                // Récupérer les recommandations qui suivent
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const recLine = lines[j].trim();
                    if (recLine.startsWith('•') || recLine.startsWith('-')) {
                        recommendations.push(recLine.substring(1).trim());
                    }
                }
                break;
            }
        }
        
        return recommendations.slice(0, 3);
    }

    private static guessQuestionCategory(text: string): string {
        const lower = text.toLowerCase();
        if (lower.includes('technique') || lower.includes('code') || lower.includes('algorithme')) {
            return 'technical';
        }
        if (lower.includes('équipe') || lower.includes('conflit') || lower.includes('difficulté')) {
            return 'behavioral';
        }
        if (lower.includes('entreprise') || lower.includes('poste') || lower.includes('motivation')) {
            return 'hr';
        }
        return 'situational';
    }

    private static guessStepCategory(description: string): string {
        const lower = description.toLowerCase();
        if (lower.includes('certification') || lower.includes('formation')) return 'certification';
        if (lower.includes('compétence') || lower.includes('skill')) return 'skill';
        if (lower.includes('poste') || lower.includes('promotion')) return 'position';
        if (lower.includes('réseau') || lower.includes('contact')) return 'network';
        return 'skill';
    }

    private static extractStepTitle(description: string): string {
        const words = description.split(' ');
        return words.slice(0, 4).join(' ');
    }

    private static extractStepActions(content: string, stepDescription: string): string[] {
        // Logique simplifiée pour extraire les actions liées à une étape
        return [
            "Rechercher les opportunités",
            "Préparer les documents nécessaires", 
            "Planifier la mise en œuvre"
        ];
    }

    private static extractCurrentPosition(content: string): string {
        const positionRegex = /(?:position|poste)\s+(?:actuel|current)[:\s]*([^.\n]+)/i;
        const match = positionRegex.exec(content);
        return match ? match[1].trim() : 'Position actuelle';
    }

    private static extractTargetPosition(content: string): string {
        const targetRegex = /(?:objectif|target|cible)[:\s]*([^.\n]+)/i;
        const match = targetRegex.exec(content);
        return match ? match[1].trim() : 'Objectif carrière';
    }

    private static extractTimeframe(content: string): string {
        const timeRegex = /(?:dans|en|sur)\s+(\d+\s*(?:mois|ans?|années?))/i;
        const match = timeRegex.exec(content);
        return match ? match[1] : '2-3 ans';
    }

    private static extractSuccessProbability(content: string): number | null {
        const probRegex = /(?:probabilité|chance|succès)[:\s]*(\d+)%/i;
        const match = probRegex.exec(content);
        return match ? parseInt(match[1]) : null;
    }

    private static extractGlobalScore(content: string): number | null {
        const scoreRegex = /(?:score|note)(?:\s+global)?[:\s]*(\d+)(?:\/100|%)/i;
        const match = scoreRegex.exec(content);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Parser les mots-clés ATS
     */
    private static parseAtsKeywords(content: string): any[] {
        const keywords = [];
        
        // Chercher les tableaux de mots-clés
        const keywordTableRegex = /\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
        let match;

        while ((match = keywordTableRegex.exec(content)) !== null) {
            const [, keyword, detected, expected, status] = match;
            
            if (keyword.toLowerCase().includes('mot-clé') || keyword.toLowerCase().includes('keyword')) {
                continue; // Skip header row
            }

            const detectedNum = parseInt(detected.replace(/[^\d]/g, '')) || 0;
            const expectedNum = parseInt(expected.replace(/[^\d]/g, '')) || 1;
            
            let keywordStatus = 'good';
            if (status.includes('✅') || status.toLowerCase().includes('optimal')) {
                keywordStatus = 'optimal';
            } else if (status.includes('❌') || status.toLowerCase().includes('manquant')) {
                keywordStatus = 'missing';
            } else if (status.includes('⚠️') || status.toLowerCase().includes('excessif')) {
                keywordStatus = 'excessive';
            }

            keywords.push({
                keyword: keyword.trim(),
                detected: detectedNum,
                expected: expectedNum,
                status: keywordStatus,
                impact: keywordStatus === 'missing' ? 10 : keywordStatus === 'optimal' ? 5 : 3
            });
        }

        // Si pas de tableau détecté, créer des mots-clés par défaut
        if (keywords.length === 0) {
            const commonKeywords = ['React', 'JavaScript', 'Leadership', 'Innovation', 'Agile'];
            commonKeywords.forEach(kw => {
                const mentions = (content.toLowerCase().match(new RegExp(kw.toLowerCase(), 'g')) || []).length;
                keywords.push({
                    keyword: kw,
                    detected: mentions,
                    expected: 2,
                    status: mentions >= 2 ? 'optimal' : mentions > 0 ? 'good' : 'missing',
                    impact: mentions === 0 ? 8 : 3
                });
            });
        }

        return keywords;
    }

    private static extractOriginalText(content: string): string {
        // Extraire le texte original de la lettre de motivation s'il est présent
        const textRegex = /(?:lettre|text|contenu)[:\s]*\n([\s\S]+?)(?:\n\n|\n##|\n\*\*|$)/i;
        const match = textRegex.exec(content);
        return match ? match[1].trim() : "Votre lettre de motivation optimisée sera affichée ici...";
    }
}