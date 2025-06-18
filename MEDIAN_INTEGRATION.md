# Intégration Median - JobLight

## Vue d'ensemble

Cette documentation décrit l'intégration de l'application native Android Median avec JobLight pour permettre le téléchargement et l'impression de documents de manière native.

## Fonctionnalités intégrées

### 1. Détection automatique de l'environnement
- **Mode natif Android** : Détection automatique de l'app Median
- **Mode web** : Fallback vers les méthodes web classiques
- **Indicateurs visuels** : Affichage du mode actuel dans l'interface

### 2. Téléchargement natif
- **Fichiers supportés** : PDF, DOCX, PPTX
- **Ouverture automatique** : Les fichiers s'ouvrent automatiquement après téléchargement
- **Gestion des erreurs** : Fallback automatique vers le mode web en cas d'échec

### 3. Impression native
- **Impression directe** : Utilisation du système d'impression Android
- **Prévisualisation** : Ouverture de la boîte de dialogue d'impression native
- **Gestion des erreurs** : Fallback vers l'impression web

## Architecture technique

### Hook useMedian
```typescript
const { isReady, isAndroidApp, downloadFile, printDocument } = useMedian();
```

**Propriétés :**
- `isReady` : Boolean indiquant si Median est prêt
- `isAndroidApp` : Boolean indiquant si on est dans l'app Median
- `downloadFile` : Fonction de téléchargement native
- `printDocument` : Fonction d'impression native

### Détection de l'environnement
```typescript
const userAgent = navigator.userAgent;
const isMedian = userAgent.includes('Median') || userAgent.includes('median');
const isAndroid = userAgent.includes('Android');
```

### Gestion des erreurs
```typescript
try {
    // Tentative native
    if (isAndroidApp && isReady) {
        await downloadFile(url, options);
    } else {
        // Fallback web
        await handleDownloadWeb();
    }
} catch (error) {
    // Fallback en cas d'erreur
    if (isAndroidApp) {
        await handleDownloadWeb();
    }
}
```

## Configuration

### Fichier median.json
```json
{
  "appId": "com.joblight.app",
  "features": {
    "downloadFile": { "enabled": true },
    "printDocument": { "enabled": true }
  },
  "permissions": [
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_EXTERNAL_STORAGE"
  ]
}
```

## Interface utilisateur

### Indicateurs visuels
- **Icône smartphone verte** : Mode natif Android actif
- **Icône moniteur bleue** : Mode web actif
- **Point animé** : Statut de connexion Median

### Boutons améliorés
- **Indicateurs Median** : Icônes smartphone sur les boutons d'export/impression
- **Messages contextuels** : Notifications spécifiques au mode natif

## Pages intégrées

### 1. CareerAdvisor/Index.tsx
- **Export de conversations** : PDF, DOCX, PPTX
- **Impression de conversations** : Via le système Android
- **Historique des chats** : Avec indicateurs natifs

### 2. CvInfos/Show.tsx
- **Téléchargement de CV** : PDF avec ouverture automatique
- **Impression de CV** : Via le système Android
- **Prévisualisation** : Avec indicateurs natifs

## Tests

### Environnements de test
1. **App Median Android** : Test des fonctionnalités natives
2. **Navigateur web** : Test des fallbacks
3. **Mode hors ligne** : Test de la gestion d'erreurs

### Scénarios de test
```typescript
// Test de détection
console.log('Android App:', isAndroidApp);
console.log('Median Ready:', isReady);

// Test de téléchargement
await handleExport('pdf');

// Test d'impression
await handlePrint();
```

## Déploiement

### Prérequis
- App Median configurée avec le fichier `median.json`
- Permissions Android appropriées
- Serveur web accessible depuis l'app

### Étapes
1. Configurer `median.json` dans l'app Median
2. Déployer les modifications sur le serveur
3. Tester sur l'app Median Android
4. Vérifier les fallbacks web

## Dépannage

### Problèmes courants
1. **Median non détecté** : Vérifier le User-Agent
2. **Téléchargement échoue** : Vérifier les permissions Android
3. **Impression ne fonctionne pas** : Vérifier la configuration d'impression

### Logs de débogage
```typescript
console.log('🚀 Utilisation du téléchargement natif Android');
console.log('🌐 Utilisation du téléchargement web');
console.log('🔄 Tentative de fallback vers téléchargement web');
```

## Évolutions futures

### Fonctionnalités prévues
- **Partage de fichiers** : Intégration avec les apps Android
- **Sauvegarde cloud** : Intégration Google Drive/Dropbox
- **Notifications push** : Notifications natives Android
- **Mode hors ligne** : Cache des documents

### Optimisations
- **Compression des fichiers** : Réduction de la taille des téléchargements
- **Mise en cache** : Cache intelligent des documents
- **Préchargement** : Préchargement des documents fréquents 