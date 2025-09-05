/**
 * Exemples de réponses IA avec artefacts pour tester le système
 */

export const EXAMPLE_RESPONSES = {
    'resume-review': `Voici l'analyse complète de votre CV :

## Évaluation Globale

Votre CV présente un bon niveau général avec quelques axes d'amélioration prioritaires.

**Score global : 78/100**

### Détail par critère :
- Structure : 85/100
- Contenu : 72/100  
- Mots-clés : 65/100
- Expériences : 80/100
- Compétences : 75/100
- Design : 90/100

## Plan d'Amélioration Prioritaire

☐ Ajouter 3-5 mots-clés sectoriels dans le résumé professionnel
☐ Quantifier les réalisations avec des chiffres concrets  
☐ Restructurer la section expériences par ordre d'impact
☐ Optimiser la description du poste actuel
☐ Ajouter une certification professionnelle

## Recommandations spécifiques :

• Intégrez "Python", "React" et "DevOps" dans votre résumé (+12 points)
• Remplacez "Responsable de" par "A dirigé une équipe de X personnes" (+8 points)
• Ajoutez des métriques : "Augmentation de 25% des performances" (+10 points)
• Créez une section "Projets clés" avec 2-3 réalisations majeures (+15 points)

Avec ces améliorations, votre score passerait de 78 à 93/100, vous plaçant dans le top 10% des CV de votre secteur.`,

    'cover-letter': `Voici votre lettre de motivation optimisée ATS :

## Analyse de Compatibilité

**Score ATS : 87/100** 🟢

### Détail d'optimisation :

| Critère | Score | Recommandation |
|---------|--------|----------------|
| Mots-clés | 9/10 | Excellent |
| Structure | 8/10 | Très bon |
| Longueur | 10/10 | Parfait |
| Personnalisation | 7/10 | À améliorer |
| Call-to-action | 9/10 | Excellent |

## Mots-clés Détectés vs Attendus

✅ "React" (3 mentions) - Optimal
✅ "JavaScript" (2 mentions) - Bon  
✅ "Agile" (1 mention) - Suffisant
❌ "Leadership" (0 mention) - À ajouter
❌ "Innovation" (0 mention) - À ajouter

## Suggestions d'Amélioration

☐ Ajouter "leadership" dans le 2ème paragraphe
☐ Mentionner "innovation" en lien avec vos projets
☐ Personnaliser la conclusion avec le nom de l'entreprise
☐ Ajouter un exemple concret de collaboration

**Taux de réponse estimé avec ces améliorations : 23% → 31%**`,

    'career-advice': `Voici votre plan de carrière personnalisé :

## Analyse de Votre Profil

Basé sur vos 3 années d'expérience en développement et vos objectifs, voici votre roadmap optimisée.

### Progression Salariale Prévue

| Période | Poste | Salaire | Croissance |
|---------|--------|---------|------------|
| Actuel | Dev Junior | 35k€ | - |
| +6 mois | Dev Confirmé | 42k€ | +20% |
| +18 mois | Senior Dev | 55k€ | +31% |
| +3 ans | Tech Lead | 70k€ | +27% |

## Feuille de Route - 3 ans

├─ **Maintenant** : Développeur Junior (2 ans d'expérience)
├─ **6 mois** : Certifications AWS + React avancé
├─ **12 mois** : Promotion Senior Developer
├─ **18 mois** : Premier projet en leadership technique  
├─ **24 mois** : Formation management + coaching
└─ **36 mois** : Tech Lead avec équipe de 5+ développeurs

## Actions Prioritaires

☐ S'inscrire aux certifications AWS (deadline: 2 mois)
☐ Proposer de mentorer un junior dans l'équipe (deadline: 1 mois)
☐ Lancer un projet personnel open-source (deadline: 3 mois)
☐ Rejoindre une communauté tech locale (deadline: 2 semaines)
☐ Préparer un plan de présentation pour votre manager (deadline: 1 mois)

**Probabilité d'atteindre vos objectifs avec ce plan : 85%**`,

    'interview-prep': `Simulation d'entretien terminée ! Voici votre rapport de performance :

## Score Global : 76/100

### Analyse Détaillée

| Critère | Score | Commentaire |
|---------|--------|-------------|
| Clarté des réponses | 8/10 | Excellente articulation |
| Pertinence | 7/10 | Réponses bien ciblées |
| Confiance | 6/10 | Quelques hésitations |
| Exemples concrets | 9/10 | Très bon storytelling |
| Questions posées | 5/10 | Trop peu de questions |

## Temps de Réponse

- Question 1 (Présentation) : 45s ✅ Optimal
- Question 2 (Motivation) : 1m20s ✅ Bon
- Question 3 (Technique) : 2m15s ⚠️ Trop long
- Question 4 (Situation difficile) : 55s ✅ Bon
- Question 5 (Questions candidat) : 30s ❌ Trop court

## Plan d'Amélioration

☐ Préparer 5-7 questions intelligentes sur l'entreprise
☐ Réduire les réponses techniques à 90 secondes maximum
☐ Travailler la confiance avec des exercices de respiration
☐ Préparer 3 exemples STAR supplémentaires
☐ Simuler 2 entretiens supplémentaires cette semaine

**Avec ces améliorations, votre score passerait à 85+/100**`
};

/**
 * Fonction pour tester les artefacts avec des données d'exemple
 */
export const generateTestArtifacts = (serviceId: string): string => {
    return EXAMPLE_RESPONSES[serviceId] || `Voici un exemple de réponse pour ${serviceId} avec des artefacts de test.

## Tableau d'exemple

| Critère | Valeur | Statut |
|---------|--------|--------|
| Performance | 85% | ✅ Excellent |
| Qualité | 72% | 🟡 Bon |
| Rapidité | 90% | ✅ Excellent |

## Actions recommandées

☐ Améliorer la qualité de 72% à 85%
☐ Maintenir l'excellence en performance
☐ Documenter les bonnes pratiques

**Score global : 82/100**`;
};

/**
 * Prompts améliorés pour générer des artefacts
 */
export const ARTIFACT_ENHANCED_PROMPTS = {
    'resume-review': `Analysez ce CV et retournez une évaluation détaillée avec :

1. Un score global sur 100
2. Des sous-scores par critère (Structure, Contenu, Mots-clés, etc.) au format "- Critère : Score/100"
3. Un tableau comparatif avec les points forts/faibles
4. Une checklist d'actions prioritaires avec ☐ 
5. Des recommandations chiffrées avec impact estimé

Utilisez des tableaux markdown et des listes à puces pour structurer votre réponse.`,

    'cover-letter': `Analysez cette lettre de motivation et l'offre d'emploi pour retourner :

1. Un score ATS sur 100 avec justification
2. Un tableau des mots-clés détectés vs attendus  
3. Une checklist d'améliorations avec ☐
4. Une prédiction du taux de réponse avant/après améliorations
5. Des suggestions concrètes avec exemples

Structurez avec des tableaux markdown et des métriques chiffrées.`,

    'career-advice': `Créez un plan de carrière personnalisé avec :

1. Une analyse de la situation actuelle (score/100)
2. Un tableau de progression salariale prévue sur 3-5 ans
3. Une timeline avec ├─ └─ pour les étapes clés
4. Une checklist d'actions prioritaires avec ☐
5. Des probabilités de succès chiffrées

Utilisez des tableaux, timelines et métriques pour rendre le conseil actionnable.`,

    'interview-prep': `Après cette simulation d'entretien, fournissez :

1. Un score global de performance sur 100
2. Un tableau détaillé par critère (Clarté, Pertinence, Confiance, etc.)
3. Une analyse des temps de réponse par question
4. Une checklist d'améliorations avec ☐
5. Des recommandations pour le prochain entretien

Structurez avec des tableaux et des métriques précises.`
};