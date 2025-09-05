/**
 * Service de détection et parsing des artefacts dans les réponses IA
 */

export interface ArtifactData {
    type: 'table' | 'chart' | 'score' | 'checklist' | 'roadmap' | 'heatmap' | 'dashboard' | 'timer' | 'cv-analysis';
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

        // 6. Détecter les artefacts spécialisés selon le service
        const specialized = this.detectSpecializedArtifacts(content, serviceId);
        artifacts.push(...specialized);

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