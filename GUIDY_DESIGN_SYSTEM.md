# 🎨 Guidy Design System - Charte Graphique

## Couleurs Principales

### Palette Signature Guidy
- **Amber** : `#f59e0b` (amber-500)
- **Purple** : `#a855f7` (purple-500)
- **Dégradé principal** : `from-amber-500 to-purple-500`

### Variations
- **Hover** : `from-amber-600 to-purple-600`
- **Backgrounds clairs** : `from-amber-50 to-purple-50`
- **Bordures** : `border-amber-200`
- **Texte dégradé** : `from-amber-600 via-purple-600 to-amber-600`

## Composants

### Boutons Principaux
```tsx
// Bouton principal Guidy
className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600 text-white"

// Bouton outline
className="border-amber-200 text-amber-700 hover:bg-amber-50"

// Badge
className="bg-amber-50 text-amber-700 border-amber-200"
```

### Cards et Containers
```tsx
// Card accent
className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200"

// Header/Hero
className="bg-gradient-to-r from-amber-500 to-purple-500"

// Texte titre
className="bg-gradient-to-r from-amber-600 via-purple-600 to-amber-600 bg-clip-text text-transparent"
```

## Règles de Design

### ✅ À FAIRE
1. **Cohérence** : Toujours utiliser amber + purple
2. **Simplicité** : Éviter trop de couleurs différentes
3. **Lisibilité** : Contraste suffisant
4. **Responsive** : Mobile-first

### ❌ À ÉVITER
1. Couleurs hors charte (blue, green, red sauf erreurs)
2. Dégradés complexes à 3+ couleurs
3. Animations trop flashy
4. Interfaces trop chargées

## Exemples Corrects

### Bouton Principal
```tsx
<Button className="bg-gradient-to-r from-amber-500 to-purple-500 hover:from-amber-600 hover:to-purple-600">
    <Icon className="w-4 h-4 mr-2" />
    Action
</Button>
```

### Card avec Accent
```tsx
<Card className="bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
    <CardContent>
        Contenu avec accent Guidy
    </CardContent>
</Card>
```

### Badge
```tsx
<Badge className="bg-amber-50 text-amber-700 border-amber-200">
    <Star className="w-3 h-3 mr-1" />
    Label
</Badge>
```