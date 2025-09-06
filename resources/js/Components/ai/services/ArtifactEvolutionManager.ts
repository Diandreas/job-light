/**
 * Gestionnaire d'évolution des artefacts IA
 * Permet la mise à jour temps réel des artefacts pendant la conversation
 */

import { AIGeneratedArtifact } from '../artifacts/AIArtifactGenerator';

interface ArtifactEvolution {
    artifactId: string;
    conversationContext: string[];
    lastUpdate: number;
    updateCount: number;
    evolutionHistory: ArtifactSnapshot[];
}

interface ArtifactSnapshot {
    timestamp: number;
    data: any;
    trigger: string; // Ce qui a déclenché la mise à jour
    changes: string[]; // Liste des changements
}

export class ArtifactEvolutionManager {
    private static evolutions = new Map<string, ArtifactEvolution>();
    private static updateCallbacks = new Map<string, Function[]>();

    /**
     * Enregistrer un artefact pour évolution automatique
     */
    static registerForEvolution(artifact: AIGeneratedArtifact, contextMessages: string[]) {
        console.log('📈 Enregistrement artefact pour évolution:', artifact.id);
        
        this.evolutions.set(artifact.id, {
            artifactId: artifact.id,
            conversationContext: contextMessages,
            lastUpdate: Date.now(),
            updateCount: 0,
            evolutionHistory: [{
                timestamp: Date.now(),
                data: JSON.parse(JSON.stringify(artifact.data)),
                trigger: 'initial_creation',
                changes: ['Création initiale']
            }]
        });
    }

    /**
     * Vérifier si un artefact doit être mis à jour avec le nouveau message
     */
    static async checkForUpdates(newMessage: string, allArtifacts: AIGeneratedArtifact[]): Promise<AIGeneratedArtifact[]> {
        const updatedArtifacts: AIGeneratedArtifact[] = [];
        
        for (const artifact of allArtifacts) {
            const evolution = this.evolutions.get(artifact.id);
            if (!evolution) continue;

            const shouldUpdate = this.shouldUpdateArtifact(artifact, newMessage, evolution);
            
            if (shouldUpdate.update) {
                console.log('🔄 Mise à jour artefact:', artifact.id, 'Raison:', shouldUpdate.reason);
                
                const updatedArtifact = await this.updateArtifact(
                    artifact, 
                    newMessage, 
                    shouldUpdate.reason,
                    evolution
                );
                
                if (updatedArtifact) {
                    updatedArtifacts.push(updatedArtifact);
                    this.notifyCallbacks(artifact.id, updatedArtifact);
                }
            }
        }

        return updatedArtifacts;
    }

    /**
     * Détermine si un artefact doit être mis à jour
     */
    private static shouldUpdateArtifact(
        artifact: AIGeneratedArtifact, 
        newMessage: string, 
        evolution: ArtifactEvolution
    ): { update: boolean; reason: string } {
        
        const messageL
        = newMessage.toLowerCase();
        const timeSinceLastUpdate = Date.now() - evolution.lastUpdate;

        // Roadmap Career - Mise à jour si nouvelles infos carrière
        if (artifact.type === 'roadmap') {
            const careerKeywords = [
                'objectif', 'étape', 'compétence', 'formation', 'certification',
                'timeline', 'priorité', 'plan', 'stratégie', 'progression'
            ];
            
            const hasCareerContent = careerKeywords.some(keyword => 
                messageLower.includes(keyword)
            );
            
            if (hasCareerContent && timeSinceLastUpdate > 30000) { // 30s min entre MAJ
                return { update: true, reason: 'nouvelles_info_carriere' };
            }
        }

        // CV Analysis - Mise à jour si nouvelles infos profil
        if (artifact.type === 'heatmap') {
            const cvKeywords = [
                'expérience', 'compétence', 'formation', 'poste', 
                'responsabilité', 'réalisation', 'projet'
            ];
            
            const hasCVContent = cvKeywords.some(keyword => 
                messageLower.includes(keyword)
            );
            
            if (hasCVContent && timeSinceLastUpdate > 45000) { // 45s min
                return { update: true, reason: 'nouvelles_info_profil' };
            }
        }

        // Interview Prep - Mise à jour si préparation entretien
        if (artifact.type === 'timer') {
            const interviewKeywords = [
                'entretien', 'question', 'réponse', 'préparation',
                'faiblesse', 'force', 'motivation', 'exemple'
            ];
            
            const hasInterviewContent = interviewKeywords.some(keyword => 
                messageLower.includes(keyword)
            );
            
            if (hasInterviewContent && timeSinceLastUpdate > 60000) { // 60s min
                return { update: true, reason: 'preparation_entretien' };
            }
        }

        // Mise à jour générique si beaucoup de nouveau contexte
        if (newMessage.length > 100 && timeSinceLastUpdate > 120000) { // 2min
            return { update: true, reason: 'contexte_enrichi' };
        }

        return { update: false, reason: '' };
    }

    /**
     * Met à jour un artefact avec le nouveau contexte
     */
    private static async updateArtifact(
        artifact: AIGeneratedArtifact,
        newMessage: string,
        updateReason: string,
        evolution: ArtifactEvolution
    ): Promise<AIGeneratedArtifact | null> {
        
        try {
            // Ajouter le nouveau message au contexte
            evolution.conversationContext.push(newMessage);
            
            // Garder seulement les 10 derniers messages pour le contexte
            if (evolution.conversationContext.length > 10) {
                evolution.conversationContext = evolution.conversationContext.slice(-10);
            }

            const fullContext = evolution.conversationContext.join('\n');
            let updatedArtifact: AIGeneratedArtifact | null = null;

            // Régénérer l'artefact selon son type avec le contexte enrichi
            switch (artifact.type) {
                case 'roadmap':
                    updatedArtifact = await this.updateCareerRoadmap(artifact, fullContext, newMessage);
                    break;
                case 'heatmap':
                    updatedArtifact = await this.updateCVAnalysis(artifact, fullContext, newMessage);
                    break;
                case 'timer':
                    updatedArtifact = await this.updateInterviewPrep(artifact, fullContext, newMessage);
                    break;
                default:
                    updatedArtifact = await this.updateGenericArtifact(artifact, fullContext, newMessage);
            }

            if (updatedArtifact) {
                // Sauvegarder snapshot de l'évolution
                this.saveEvolutionSnapshot(evolution, updatedArtifact, updateReason);
                
                // Mettre à jour les métadonnées
                evolution.lastUpdate = Date.now();
                evolution.updateCount++;
                
                // Marquer comme mis à jour
                updatedArtifact.metadata.lastEvolution = {
                    timestamp: Date.now(),
                    reason: updateReason,
                    version: evolution.updateCount
                };
            }

            return updatedArtifact;

        } catch (error) {
            console.error('Erreur lors de la mise à jour artefact:', error);
            return null;
        }
    }

    /**
     * Mise à jour spécialisée pour roadmap carrière
     */
    private static async updateCareerRoadmap(
        artifact: AIGeneratedArtifact,
        context: string,
        newMessage: string
    ): Promise<AIGeneratedArtifact> {
        
        const { SpecializedAIArtifacts } = await import('./SpecializedAIArtifacts');
        const updatedRoadmap = await SpecializedAIArtifacts.generateCareerPlannerArtifact(context);
        
        if (updatedRoadmap) {
            // Fusionner les données existantes avec les nouvelles
            const existingSteps = artifact.data.steps || [];
            const newSteps = updatedRoadmap.data.steps || [];
            
            // Garder le progrès des étapes existantes
            const mergedSteps = newSteps.map((newStep: any) => {
                const existingStep = existingSteps.find((existing: any) => 
                    existing.title.toLowerCase().includes(newStep.title.toLowerCase().substring(0, 20))
                );
                
                return {
                    ...newStep,
                    progress: existingStep?.progress || 0,
                    completed: existingStep?.completed || false
                };
            });
            
            return {
                ...updatedRoadmap,
                data: {
                    ...updatedRoadmap.data,
                    steps: mergedSteps
                }
            };
        }
        
        return artifact;
    }

    /**
     * Mise à jour spécialisée pour analyse CV
     */
    private static async updateCVAnalysis(
        artifact: AIGeneratedArtifact,
        context: string,
        newMessage: string
    ): Promise<AIGeneratedArtifact> {
        
        const { SpecializedAIArtifacts } = await import('./SpecializedAIArtifacts');
        const updatedAnalysis = await SpecializedAIArtifacts.generateCVAnalysisArtifact(context);
        
        if (updatedAnalysis) {
            // Conserver l'historique des scores pour voir l'évolution
            const previousScores = artifact.data.scoreHistory || [];
            previousScores.push({
                timestamp: artifact.metadata.timestamp,
                globalScore: artifact.data.globalScore,
                sections: artifact.data.sections
            });
            
            return {
                ...updatedAnalysis,
                data: {
                    ...updatedAnalysis.data,
                    scoreHistory: previousScores.slice(-5) // Garder 5 derniers
                }
            };
        }
        
        return artifact;
    }

    /**
     * Mise à jour spécialisée pour préparation entretien
     */
    private static async updateInterviewPrep(
        artifact: AIGeneratedArtifact,
        context: string,
        newMessage: string
    ): Promise<AIGeneratedArtifact> {
        
        const { SpecializedAIArtifacts } = await import('./SpecializedAIArtifacts');
        const updatedInterview = await SpecializedAIArtifacts.generateInterviewSimulatorArtifact(context);
        
        if (updatedInterview) {
            // Préserver les réponses déjà données
            const existingQuestions = artifact.data.questions || [];
            const newQuestions = updatedInterview.data.questions || [];
            
            const mergedQuestions = newQuestions.map((newQ: any, index: number) => {
                const existingQ = existingQuestions[index];
                return {
                    ...newQ,
                    userAnswer: existingQ?.userAnswer || '',
                    answered: existingQ?.answered || false
                };
            });
            
            return {
                ...updatedInterview,
                data: {
                    ...updatedInterview.data,
                    questions: mergedQuestions
                }
            };
        }
        
        return artifact;
    }

    /**
     * Mise à jour générique
     */
    private static async updateGenericArtifact(
        artifact: AIGeneratedArtifact,
        context: string,
        newMessage: string
    ): Promise<AIGeneratedArtifact> {
        
        // Pour les autres types, juste enrichir les métadonnées
        return {
            ...artifact,
            metadata: {
                ...artifact.metadata,
                enrichedContext: context.substring(0, 500) + '...'
            }
        };
    }

    /**
     * Sauvegarder un snapshot de l'évolution
     */
    private static saveEvolutionSnapshot(
        evolution: ArtifactEvolution,
        updatedArtifact: AIGeneratedArtifact,
        reason: string
    ) {
        const changes = this.detectChanges(
            evolution.evolutionHistory[evolution.evolutionHistory.length - 1]?.data,
            updatedArtifact.data
        );
        
        evolution.evolutionHistory.push({
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(updatedArtifact.data)),
            trigger: reason,
            changes
        });
        
        // Garder seulement les 10 dernières évolutions
        if (evolution.evolutionHistory.length > 10) {
            evolution.evolutionHistory = evolution.evolutionHistory.slice(-10);
        }
    }

    /**
     * Détecter les changements entre deux versions
     */
    private static detectChanges(oldData: any, newData: any): string[] {
        const changes = [];
        
        // Détecter les changements dans les roadmaps
        if (oldData?.steps && newData?.steps) {
            if (oldData.steps.length !== newData.steps.length) {
                changes.push(`Nombre d'étapes: ${oldData.steps.length} → ${newData.steps.length}`);
            }
            
            // Nouvelles étapes
            const newStepTitles = newData.steps.map((s: any) => s.title);
            const oldStepTitles = oldData.steps.map((s: any) => s.title);
            const addedSteps = newStepTitles.filter((title: string) => !oldStepTitles.includes(title));
            
            if (addedSteps.length > 0) {
                changes.push(`Nouvelles étapes: ${addedSteps.join(', ')}`);
            }
        }
        
        // Détecter changements de scores
        if (oldData?.globalScore !== newData?.globalScore) {
            changes.push(`Score global: ${oldData?.globalScore} → ${newData?.globalScore}`);
        }
        
        if (changes.length === 0) {
            changes.push('Données contextuelles mises à jour');
        }
        
        return changes;
    }

    /**
     * S'abonner aux mises à jour d'un artefact
     */
    static onArtifactUpdate(artifactId: string, callback: Function) {
        if (!this.updateCallbacks.has(artifactId)) {
            this.updateCallbacks.set(artifactId, []);
        }
        this.updateCallbacks.get(artifactId)!.push(callback);
    }

    /**
     * Notifier les callbacks d'une mise à jour
     */
    private static notifyCallbacks(artifactId: string, updatedArtifact: AIGeneratedArtifact) {
        const callbacks = this.updateCallbacks.get(artifactId);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(updatedArtifact);
                } catch (error) {
                    console.error('Erreur callback mise à jour:', error);
                }
            });
        }
    }

    /**
     * Obtenir l'historique d'évolution d'un artefact
     */
    static getEvolutionHistory(artifactId: string): ArtifactSnapshot[] {
        return this.evolutions.get(artifactId)?.evolutionHistory || [];
    }

    /**
     * Nettoyer les évolutions anciennes
     */
    static cleanup() {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24h
        
        for (const [id, evolution] of this.evolutions.entries()) {
            if (evolution.lastUpdate < cutoff) {
                this.evolutions.delete(id);
                this.updateCallbacks.delete(id);
            }
        }
    }
}