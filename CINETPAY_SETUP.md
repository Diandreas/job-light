# Configuration CinetPay

Ce document explique comment configurer et utiliser CinetPay pour remplacer NotchPay dans votre application.

## Prérequis

1. Avoir un compte marchand sur [CinetPay](https://www.cinetpay.com)
2. Récupérer vos clés API depuis votre tableau de bord CinetPay

## Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Configuration CinetPay
CINETPAY_API_KEY=votre_api_key_ici
CINETPAY_SITE_ID=votre_site_id_ici
CINETPAY_SECRET_KEY=votre_clé_secrète_ici
CINETPAY_ENVIRONMENT=test
CINETPAY_DEFAULT_CURRENCY=XOF
CINETPAY_DEFAULT_LANGUAGE=fr
```

### 2. Récupération des clés

1. Connectez-vous à votre compte CinetPay : https://www.cinetpay.com/login
2. Allez dans le menu "Intégrations"
3. Récupérez votre `APIKEY` et votre `SITE_ID`
4. Notez votre clé secrète pour la vérification HMAC

## Utilisation

### Composants React

L'application utilise maintenant deux composants principaux :

- `CinetPayButton` : Pour les boutons de paiement simples
- `CinetPayModal` : Pour les modales de paiement

### API Endpoints

- `POST /api/cinetpay/initialize` : Initialiser un paiement
- `POST /api/cinetpay/notify` : Webhook de notification (IPN)
- `GET /api/cinetpay/return` : Page de retour après paiement

## Structure des données

### Initialisation d'un paiement

```json
{
  "transaction_id": "unique_transaction_id",
  "amount": 1000,
  "currency": "XOF",
  "description": "Description du paiement",
  "customer_name": "Nom du client",
  "customer_surname": "Prénom du client",
  "customer_email": "email@example.com",
  "customer_phone_number": "+22501234567",
  "notify_url": "https://votre-site.com/api/cinetpay/notify",
  "return_url": "https://votre-site.com/api/cinetpay/return",
  "channels": "ALL",
  "lang": "fr"
}
```

### Réponse de l'API

```json
{
  "success": true,
  "payment_url": "https://checkout.cinetpay.com/...",
  "transaction_id": "unique_transaction_id"
}
```

## Sécurité

### Vérification HMAC (recommandé)

Pour une sécurité maximale, activez la vérification HMAC dans votre configuration :

```env
CINETPAY_ENABLE_HMAC=true
```

### Logs

Toutes les transactions sont loggées pour le débogage et l'audit :

```php
Log::info('CinetPay notification received', $request->all());
```

## Test

### Environnement de test

Utilisez l'environnement de test pour vos développements :

```env
CINETPAY_ENVIRONMENT=test
```

### Données de test

CinetPay fournit des données de test pour simuler les paiements.

## Production

### Checklist de mise en production

- [ ] Changer `CINETPAY_ENVIRONMENT` vers `production`
- [ ] Vérifier que toutes les URLs sont en HTTPS
- [ ] Tester les webhooks de notification
- [ ] Vérifier la gestion des erreurs
- [ ] Monitorer les logs de production

### Monitoring

Surveillez les logs pour détecter les problèmes :

```bash
tail -f storage/logs/laravel.log | grep CinetPay
```

## Support

Pour toute question technique :
- Documentation CinetPay : https://docs.cinetpay.com
- Support CinetPay : support@cinetpay.com

## Migration depuis NotchPay

### Fichiers modifiés

1. `resources/js/Components/payment/CinetPayButton.tsx` (remplace NotchPayButton)
2. `resources/js/Components/CinetPayModal.tsx` (remplace PaymentModal)
3. `app/Http/Controllers/CinetPayController.php` (nouveau contrôleur)
4. `config/cinetpay.php` (nouvelle configuration)
5. `routes/web.php` (routes mises à jour)

### Anciens composants à supprimer

- `resources/js/Components/payment/NotchPayButton.tsx`
- `resources/js/Components/PaymentModal.tsx` (si utilisé)
- `app/Http/Controllers/NotchPayController.php`

### Variables d'environnement à supprimer

```env
# Supprimer ces variables
NOTCHPAY_PUBLIC_KEY=...
NOTCHPAY_SECRET_KEY=...
```
