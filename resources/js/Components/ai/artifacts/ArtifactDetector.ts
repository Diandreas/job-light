/**
 * Service de détection et parsing des artefacts dans les réponses IA
 */

export interface ArtifactData {
    type: 'table' | 'chart' | 'score' | 'checklist' | 'roadmap' | 'heatmap' | 'dashboard';
    title: string;
    data: any;
    metadata?: {
        exportable?: boolean;
        interactive?: boolean;
        service?: string;
    };
}

export class ArtifactDetector {
    /**
     * Détecter et extraire les artefacts d'un message IA
     */
    static detectArtifacts(content: string, serviceId?: string): ArtifactData[] {
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

        return artifacts;
    }

    /**
     * Détecter les tableaux markdown
     */
    private static detectTables(content: string): ArtifactData[] {
        const tableRegex = /\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g;
        const artifacts: ArtifactData[] = [];
        let match;

        while ((match = tableRegex.exec(content)) !== null) {
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
                .filter(row => row.length === headers.length);

            if (headers.length > 0 && rows.length > 0) {
                artifacts.push({
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
                        interactive: true
                    }
                });
            }
        }

        return artifacts;
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
                    service: serviceId
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

        // Supprimer les tableaux markdown
        cleanContent = cleanContent.replace(/\|(.+)\|\s*\n\|[-\s|:]+\|\s*\n((?:\|.+\|\s*\n?)+)/g, '');

        // Supprimer les checklists détectées
        cleanContent = cleanContent.replace(/(?:^|\n)((?:\s*[☐☑✓❌]\s*.+(?:\n|$))+)/gm, '');

        // Supprimer les timelines détectées
        cleanContent = cleanContent.replace(/(?:^|\n)\s*(?:├─|└─|│)\s*([^:]+):\s*(.+)/gm, '');

        // Nettoyer les lignes vides multiples
        cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, '\n\n');

        return cleanContent.trim();
    }
}