# Corrections Median - Problèmes PDF et Téléchargement

## Problèmes identifiés et solutions

### 1. **Problème d'impression : Pas de bouton "Enregistrer en PDF"**

**Problème :** L'impression native ouvrait une fenêtre sans option de sauvegarde PDF.

**Solution :** Ajout de paramètres spécifiques pour forcer l'affichage du bouton de sauvegarde PDF.

#### Paramètres ajoutés :
```typescript
printUrl.searchParams.set('print_mode', 'pdf');
printUrl.searchParams.set('show_save_button', 'true');
printUrl.searchParams.set('auto_print', 'false');
```

#### Modifications dans `useMedian.ts` :
```typescript
const printDocument = useCallback(async (url: string) => {
    // Ajouter des paramètres pour forcer l'ouverture en mode PDF avec bouton de sauvegarde
    const printUrl = new URL(url);
    printUrl.searchParams.set('print_mode', 'pdf');
    printUrl.searchParams.set('show_save_button', 'true');
    printUrl.searchParams.set('auto_print', 'false');
    
    await Median.open.external({
        url: printUrl.toString(),
        target: '_blank'
    });
}, [isReady, Median]);
```

### 2. **Problème de téléchargement CareerAdvisor : Fichier téléchargé mais ne s'ouvre pas**

**Problème :** Le téléchargement fonctionnait mais le fichier ne s'ouvrait pas automatiquement.

**Solution :** Modification de l'URL pour utiliser une requête GET directe au lieu de POST.

#### Avant (POST) :
```typescript
const downloadUrl = new URL('/career-advisor/export', window.location.origin);
downloadUrl.searchParams.set('contextId', activeChat.context_id);
downloadUrl.searchParams.set('format', format);
```

#### Après (GET direct) :
```typescript
const downloadUrl = new URL('/career-advisor/export', window.location.origin);
downloadUrl.searchParams.set('contextId', activeChat.context_id);
downloadUrl.searchParams.set('format', format);
downloadUrl.searchParams.set('direct', 'true'); // Paramètre pour forcer le téléchargement direct
```

## Fichiers modifiés

### 1. `resources/js/Hooks/useMedian.ts`
- ✅ Ajout des paramètres PDF dans `printDocument`
- ✅ Amélioration des logs de débogage

### 2. `resources/js/Pages/CareerAdvisor/Index.tsx`
- ✅ Correction de `handleExport` pour utiliser GET direct
- ✅ Ajout des paramètres PDF dans `handlePrint`
- ✅ Correction de `handlePrintWeb` avec paramètres PDF

### 3. `resources/js/Pages/CvInfos/Show.tsx`
- ✅ Ajout des paramètres PDF dans `handlePrint`
- ✅ Correction de `handlePrintWeb` avec paramètres PDF

## Paramètres PDF expliqués

### `print_mode=pdf`
- Force l'ouverture en mode PDF
- Active les options de sauvegarde PDF

### `show_save_button=true`
- Affiche le bouton "Enregistrer en PDF"
- Permet de sauvegarder le document

### `auto_print=false`
- Désactive l'impression automatique
- Permet à l'utilisateur de choisir l'action

### `direct=true` (pour téléchargement)
- Force le téléchargement direct
- Évite les problèmes de POST/GET

## Tests recommandés

### Test d'impression PDF
1. Cliquer sur "Imprimer" dans CareerAdvisor
2. Vérifier que la fenêtre s'ouvre avec bouton "Enregistrer en PDF"
3. Tester la sauvegarde du fichier

### Test de téléchargement CareerAdvisor
1. Cliquer sur "Export PDF" dans CareerAdvisor
2. Vérifier que le fichier se télécharge et s'ouvre
3. Vérifier le nom du fichier : `conversation-{contextId}.pdf`

### Test de téléchargement CV
1. Cliquer sur "Télécharger PDF" dans Show.tsx
2. Vérifier que le fichier se télécharge et s'ouvre
3. Vérifier le nom du fichier : `CV-{userName}.pdf`

## Logs de débogage

### Téléchargement réussi :
```
🚀 Utilisation du téléchargement natif Android
✅ Téléchargement réussi: {result}
📱 Téléchargement natif réussi
```

### Impression réussi :
```
🖨️ Utilisation de l'impression native Android
✅ Impression initiée avec options PDF
📱 Impression native initiée
```

### Erreurs :
```
❌ Erreur lors de l'export: {error}
🔄 Tentative de fallback vers téléchargement web
```

## Configuration backend nécessaire

Pour que ces corrections fonctionnent, le backend doit :

1. **Supporter les paramètres GET** pour `/career-advisor/export`
2. **Reconnaître le paramètre `direct=true`**
3. **Supporter les paramètres PDF** pour les routes d'impression
4. **Retourner les bons headers** pour le téléchargement

### Exemple de route backend (Laravel) :
```php
Route::get('/career-advisor/export', function (Request $request) {
    $contextId = $request->get('contextId');
    $format = $request->get('format');
    $direct = $request->get('direct');
    
    // Logique d'export...
    
    return response($content)
        ->header('Content-Type', 'application/pdf')
        ->header('Content-Disposition', 'attachment; filename="conversation-' . $contextId . '.' . $format . '"');
});
``` 