# Guide d'Intégration CinetPay avec Laravel

## 🚀 Installation Rapide

### 1. Exécuter le script d'installation
```bash
chmod +x install-cinetpay.sh
./install-cinetpay.sh
```

### 2. Configuration manuelle (alternative)

#### Créer le répertoire Libraries
```bash
mkdir -p app/Libraries
cd app/Libraries
git clone https://github.com/cobaf/cinetpay-sdk-php.git
cd ../..
```

#### Mettre à jour composer.json
```json
{
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Database\\Factories\\": "database/factories/",
            "Database\\Seeders\\": "database/seeders/",
            "CinetPay\\": "app/Libraries/cinetpay-sdk-php/src/"
        }
    }
}
```

#### Exécuter
```bash
composer dump-autoload
```

## ⚙️ Configuration

### Variables d'environnement (.env)
```env
# Configuration CinetPay
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_cinetpay_site_id
CINETPAY_SECRET_KEY=your_cinetpay_secret_key
CINETPAY_ENVIRONMENT=test
CINETPAY_DEFAULT_CURRENCY=XAF
CINETPAY_DEFAULT_LANGUAGE=fr
CINETPAY_DEFAULT_CHANNELS=ALL
CINETPAY_NOTIFY_URL=/payment/notify
CINETPAY_RETURN_URL=/payment/return
CINETPAY_TIMEOUT=30
CINETPAY_ENABLE_LOGGING=true
CINETPAY_ENABLE_HMAC=true
```

### Exécuter les migrations
```bash
php artisan migrate
```

## 📋 Utilisation

### 1. Initialiser un paiement

```php
use App\Services\CinetpayService;

$cinetpayService = new CinetpayService();

$transactionId = $cinetpayService->generateTransactionId();
$amount = 1000; // Montant en FCFA
$currency = 'XAF';
$description = 'Achat de tokens';

$additionalParams = [
    'customer_name' => 'John Doe',
    'customer_email' => 'john@example.com',
    'customer_phone_number' => '+237123456789',
    'notify_url' => route('payment.notify'),
    'return_url' => route('payment.return'),
    'channels' => 'ALL',
    'lang' => 'fr'
];

try {
    $response = $cinetpayService->generatePayment(
        $transactionId, 
        $amount, 
        $currency, 
        $description, 
        $additionalParams
    );

    if ($response['success']) {
        // Rediriger vers l'URL de paiement
        return redirect($response['data']['payment_url']);
    }
} catch (Exception $e) {
    // Gérer l'erreur
    return back()->with('error', $e->getMessage());
}
```

### 2. Traiter les notifications (IPN)

Le contrôleur `PaymentController` gère automatiquement les notifications CinetPay via la méthode `notify()`.

### 3. Gérer les retours de paiement

Le contrôleur `PaymentController` gère automatiquement les retours via la méthode `return()`.

## 🛠️ API Endpoints

### Routes disponibles

```php
// Initialiser un paiement
POST /payment/initiate

// Notification de paiement (IPN)
POST /payment/notify

// Retour après paiement
GET|POST /payment/return

// Pages de résultat
GET /payment/success
GET /payment/failed
```

### Exemple de requête d'initialisation

```javascript
// Frontend (JavaScript)
const response = await fetch('/payment/initiate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    },
    body: JSON.stringify({
        amount: 1000,
        currency: 'XAF',
        description: 'Achat de 20 tokens',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone_number: '+237123456789'
    })
});

const data = await response.json();
if (data.success) {
    window.location.href = data.payment_url;
}
```

## 🔍 Vérification du statut

```php
use App\Services\CinetpayService;

$cinetpayService = new CinetpayService();
$response = $cinetpayService->checkPaymentStatus($transactionId);

if ($response['success'] && $response['code'] === '00') {
    $status = $response['data']['status'];
    // ACCEPTED, REFUSED, WAITING_FOR_CUSTOMER, etc.
}
```

## 📊 Modèle Payment

Le modèle `Payment` fournit des méthodes utiles :

```php
use App\Models\Payment;

// Paiements réussis
$completedPayments = Payment::completed()->get();

// Paiements en attente
$pendingPayments = Payment::pending()->get();

// Paiements échoués
$failedPayments = Payment::failed()->get();

// Vérifier le statut
if ($payment->isCompleted()) {
    // Paiement réussi
}
```

## 🚨 Gestion des erreurs

### Codes d'erreur CinetPay courants

- `201`: Paiement initialisé avec succès
- `00`: Vérification réussie
- `627`: Transaction refusée
- `628`: Transaction annulée par le client

### Logs

Les logs sont automatiquement enregistrés dans `storage/logs/laravel.log` :

```php
Log::info('CinetPay payment initiated', [
    'transaction_id' => $transactionId,
    'amount' => $amount
]);
```

## 🧪 Tests

### Test en mode sandbox

1. Configurez `CINETPAY_ENVIRONMENT=test` dans `.env`
2. Utilisez les clés de test CinetPay
3. Testez avec des montants de test

### Test des notifications

Utilisez des outils comme ngrok pour tester les notifications en local :

```bash
ngrok http 8000
# Utilisez l'URL ngrok dans votre configuration CinetPay
```

## 🔒 Sécurité

### Vérification HMAC (recommandé en production)

```php
// Dans votre contrôleur
public function verifyHmac(Request $request)
{
    $receivedHmac = $request->header('X-CinetPay-Hmac');
    $payload = $request->getContent();
    $expectedHmac = hash_hmac('sha256', $payload, config('cinetpay.secret_key'));
    
    return hash_equals($expectedHmac, $receivedHmac);
}
```

### Validation des données

Toujours valider les données reçues :

```php
$request->validate([
    'amount' => 'required|numeric|min:100',
    'currency' => 'required|string|in:XAF,XOF,CDF,GNF',
    'customer_email' => 'required|email'
]);
```

## 📚 Ressources

- [Documentation officielle CinetPay](https://cinetpay.com/docs)
- [SDK PHP CinetPay](https://github.com/cobaf/cinetpay-sdk-php)
- [Laravel Documentation](https://laravel.com/docs)

## 🆘 Support

En cas de problème :

1. Vérifiez les logs dans `storage/logs/laravel.log`
2. Vérifiez la configuration dans `.env`
3. Testez avec les clés sandbox
4. Consultez la documentation CinetPay

## 📝 Changelog

### Version 1.0.0
- Intégration complète CinetPay
- Service de paiement avec gestion d'erreurs
- Contrôleur de paiement avec notifications IPN
- Modèle Payment avec relations
- Migration de base de données
- Documentation complète
