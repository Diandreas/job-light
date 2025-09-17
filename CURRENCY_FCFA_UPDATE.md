# Mise à jour des prix en FCFA

## Résumé des modifications

Ce projet a été mis à jour pour utiliser le **Franc CFA (FCFA)** comme devise par défaut au lieu de l'Euro (€).

## Fichiers modifiés

### 1. Création d'utilitaires de devise
- **`resources/js/utils/currency.ts`** - Nouvelles fonctions utilitaires pour le formatage des prix en FCFA

### 2. Pages mises à jour
- **`resources/js/Pages/CvInfos/Index.tsx`** - Sélecteur de modèles de CV
- **`resources/js/Components/cv/LivePreview.tsx`** - Aperçu des modèles de CV
- **`resources/js/Pages/JobPortal/MyJobs.tsx`** - Portail d'emploi (optimisation responsive)

## Fonctionnalités ajoutées

### Formatage intelligent des prix
```typescript
formatPrice(0)        => "Gratuit"
formatPrice(1500)     => "1 500 FCFA" (desktop)
formatPrice(1500, true) => "1,5K FCFA" (mobile)
formatPrice(2500000)  => "2 500 000 FCFA"
```

### Responsive design amélioré
- **Desktop**: Affichage complet avec séparateurs de milliers
- **Mobile**: Format compact (K, M) pour économiser l'espace
- **Gestion automatique**: Détection responsive via Tailwind CSS classes

### Gestion robuste des cas edge
- Valeurs nulles/undefined → "Gratuit"
- Valeurs négatives → "Gratuit"
- Valeurs 0 → "Gratuit"
- Formatage automatique avec `Intl.NumberFormat('fr-FR')`

## Autres fichiers à vérifier

Les fichiers suivants contiennent encore des références à l'Euro (€) :
- `resources/js/Pages/Payment/Index.tsx`
- `resources/js/Components/payment/GuestPaymentModal.tsx`
- `resources/js/Components/Portfolio/ServiceManager.tsx`
- `resources/js/Pages/GuestCv/Builder.tsx`
- `resources/js/Pages/Company/SubscriptionPlans.tsx`

**Recommandation**: Migrer ces fichiers pour utiliser les nouvelles fonctions utilitaires de `currency.ts`.

## Usage pour les développeurs

```typescript
import { formatPrice, formatAmount, isValidPrice } from '@/utils/currency';

// Format automatique responsive
<span className="block md:hidden">{formatPrice(price, true)}</span>
<span className="hidden md:block">{formatPrice(price, false)}</span>

// Validation
if (isValidPrice(price)) {
    // Prix valide...
}
```

## Tests suggérés

1. Vérifier l'affichage sur différentes tailles d'écran
2. Tester avec différentes valeurs de prix (0, 1000, 1500000, null)
3. Valider le comportement responsive des composants
4. Vérifier la cohérence visuelle des badges de prix