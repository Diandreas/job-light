# 🔧 Guide de Résolution d'Erreurs - Guidy

## Erreurs Courantes et Solutions

### 🚨 Erreur: "route 'xxx' is not in the route list"
**Cause:** Route non reconnue par Ziggy
**Solution:** 
```tsx
// Remplacer
href={route('guest-cv.index')}
// Par
href="/guest-cv"
```

### 🚨 Erreur: "Cannot read properties of undefined (reading 'total')"
**Cause:** Props non passées du contrôleur
**Solution:**
```tsx
// Ajouter valeurs par défaut
export default function Component({ 
  data = { meta: { total: 0 } } 
}: Props) {
  // Ou utiliser optional chaining
  {data?.meta?.total || 0}
}
```

### 🚨 Erreur: "SelectItem must have a value prop that is not an empty string"
**Cause:** Radix UI n'accepte pas `value=""`
**Solution:**
```tsx
// Remplacer
<SelectItem value="">Tous</SelectItem>
// Par  
<SelectItem value="all">Tous</SelectItem>
```

### 🚨 Erreur: "timestamp.toLocaleTimeString is not a function"
**Cause:** Timestamp string vs Date object
**Solution:**
```tsx
{(() => {
  try {
    const timestamp = typeof message.timestamp === 'string' 
      ? new Date(message.timestamp) 
      : message.timestamp;
    return timestamp.toLocaleTimeString('fr-FR');
  } catch (error) {
    return 'Maintenant';
  }
})()}
```

### 🚨 Erreur: "Element type is invalid... got: object"
**Cause:** Import/export incorrect de composant
**Solution:**
```tsx
// Vérifier export
export default function Component() { ... }

// Vérifier import
import Component from './Component'; // default export
import { Component } from './Component'; // named export
```

## Checklist de Debug

### ✅ Avant de créer un nouveau composant:
1. Vérifier que tous les imports existent
2. Utiliser des valeurs par défaut pour les props
3. Gérer les cas undefined/null
4. Tester les routes avant utilisation
5. Respecter la charte graphique Guidy

### ✅ Charte Graphique Guidy:
```tsx
// Couleurs principales
bg-gradient-to-r from-amber-500 to-purple-500  // Boutons principaux
bg-amber-50 text-amber-700 border-amber-200    // Badges et accents
bg-white text-amber-600 border-amber-500       // Boutons outline

// À éviter
from-blue-500 to-cyan-500  // Pas dans la charte
from-green-500 to-red-500  // Trop de couleurs
```

## Status des Fonctionnalités

### ✅ Opérationnelles:
- CV sans connexion (avec placeholder)
- Templates APIDCA  
- Prévisualisation desktop
- Services IA améliorés
- Blog system
- MessageBubbles avec artefacts (placeholder)

### 🚧 En finalisation:
- Job Portal (Coming Soon page active)
- Artefacts IA complets (placeholders actifs)
- Système de paiement entreprises

### 🎯 Prêt pour production:
- Architecture complète
- Design cohérent
- Erreurs corrigées
- UX optimisée