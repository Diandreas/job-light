# Pages d'Erreur Guidy

Ce document décrit la configuration et l'utilisation des pages d'erreur personnalisées de l'application Guidy.

## 🎨 Fonctionnalités

### Pages d'Erreur Disponibles
- **404** - Page Introuvable
- **500** - Erreur Serveur
- **403** - Accès Interdit
- **503** - Service Indisponible

### Caractéristiques
- ✅ Design moderne et responsive
- ✅ Animations fluides avec Framer Motion
- ✅ Support bilingue (Français/Anglais)
- ✅ Mode sombre automatique
- ✅ Liens rapides contextuels
- ✅ Logging automatique des erreurs
- ✅ Configuration flexible

## 🚀 Configuration

### Variables d'Environnement

```env
# Activer/désactiver les pages d'erreur personnalisées
SHOW_CUSTOM_ERROR_PAGES=true

# Activer/désactiver le logging des erreurs
LOG_ERROR_PAGES=true

# Email de support
SUPPORT_EMAIL=support@guidy.com

# Activer le contact support
SUPPORT_CONTACT_ENABLED=true

# Activer les animations
ERROR_ANIMATIONS_ENABLED=true
```

### Configuration Avancée

Le fichier `config/error-pages.php` contient toute la configuration :

```php
// Messages personnalisés
'messages' => [
    404 => [
        'title' => 'Page Introuvable',
        'description' => 'Description personnalisée...',
        'suggestion' => 'Suggestion d\'action...',
    ],
],

// Liens rapides
'quick_links' => [
    'dashboard' => [
        'route' => 'dashboard',
        'auth_required' => true,
    ],
],
```

## 🛠️ Développement

### Tester les Pages d'Erreur

En mode développement, accédez à `/test-errors` pour voir une interface de test.

Ou testez directement :
- `/test-errors/404` - Page 404
- `/test-errors/500` - Page 500
- `/test-errors/403` - Page 403
- `/test-errors/503` - Page 503

### Structure des Fichiers

```
resources/js/Pages/
├── Error.tsx          # Composant principal
├── 404.tsx           # Page 404
├── 500.tsx           # Page 500
├── 403.tsx           # Page 403
├── 503.tsx           # Page 503
└── ErrorTest/
    └── Index.tsx     # Interface de test

app/
├── Exceptions/
│   └── Handler.php   # Gestionnaire d'exceptions
├── Services/
│   └── ErrorPageService.php  # Service de gestion
└── Http/
    ├── Controllers/
    │   └── ErrorTestController.php  # Contrôleur de test
    └── Middleware/
        └── ErrorLoggingMiddleware.php  # Middleware de logging

config/
└── error-pages.php   # Configuration
```

## 🎯 Traductions

### Ajouter des Traductions

Dans `resources/js/locales/fr.json` et `en.json` :

```json
{
  "errors": {
    "404": {
      "title": "Page Introuvable",
      "description": "Description...",
      "suggestion": "Suggestion..."
    },
    "actions": {
      "back": "Retour",
      "home": "Accueil",
      "refresh": "Actualiser",
      "contact": "Support"
    }
  }
}
```

## 📊 Monitoring

### Logs d'Erreur

Les erreurs sont automatiquement loggées avec :
- Code de statut
- URL et méthode
- Informations utilisateur
- User Agent
- Trace de l'exception (pour 500)

```log
[2025-08-19 10:30:00] local.ERROR: Error page displayed: 404 {
  "status_code": 404,
  "url": "https://guidy.com/page-inexistante",
  "method": "GET",
  "ip": "127.0.0.1",
  "user_id": 123
}
```

### Service de Monitoring

Le `ErrorPageService` peut être étendu pour intégrer avec :
- Sentry
- Bugsnag
- New Relic
- Autres services de monitoring

## 🔧 Personnalisation

### Nouveau Code d'Erreur

1. Ajouter dans `config/error-pages.php`
2. Créer la page Inertia
3. Ajouter les traductions
4. Mettre à jour le `Handler`

### Custom Styling

Modifiez `resources/css/error-pages.css` pour personnaliser l'apparence.

### Middleware Personnalisé

Étendez `ErrorLoggingMiddleware` pour ajouter des données spécifiques :

```php
protected function logError(Request $request, Response $response): void
{
    // Logique personnalisée
    parent::logError($request, $response);
}
```

## 🚨 Production

### Sécurité

En production :
- Les détails des exceptions ne sont pas exposés
- Seuls les messages génériques sont affichés
- Le logging est optimisé

### Performance

- Les animations peuvent être désactivées
- Le middleware de logging peut être configuré
- Les pages sont mises en cache par Inertia

## 📱 Mobile

Les pages d'erreur sont entièrement responsives et optimisées pour :
- Smartphones
- Tablettes
- Navigation tactile
- Mode sombre automatique

## 🧪 Tests

### Tests Unitaires

```php
// Tester le service
$service = new ErrorPageService();
$data = $service->getErrorPageData(404, $request);
$this->assertEquals(404, $data['status']);
```

### Tests d'Intégration

```php
// Tester la page d'erreur
$response = $this->get('/page-inexistante');
$response->assertStatus(404);
$response->assertInertia(fn ($page) => 
    $page->component('404')
);
```

## 📞 Support

Pour toute question ou amélioration, contactez :
- Email : support@guidy.com
- Issues GitHub : [Créer une issue](https://github.com/Diandreas/job-light/issues)

---

*Documentation mise à jour le 19 août 2025*
