# Intégration Complète des Paiements - CinetPay, Pluto & Fapshi

## Vue d'ensemble

Ce projet intègre trois fournisseurs de paiement pour couvrir tous les besoins de paiement :
- **CinetPay** : Paiements web avec interface utilisateur complète
- **Pluto** : Paiements mobiles directs 
- **Fapshi** : Paiements mobiles avec fonctionnalités avancées (payout, recherche)

## Architecture

### Services Créés

1. **CinetpayService** (`app/Services/CinetpayService.php`) - Déjà existant
2. **PlutoService** (`app/Services/PlutoService.php`) - Nouveau
3. **FapshiService** (`app/Services/FapshiService.php`) - Nouveau
4. **PaymentGatewayService** (`app/Services/PaymentGatewayService.php`) - Gestionnaire unifié
5. **UnifiedPaymentController** (`app/Http/Controllers/UnifiedPaymentController.php`) - Contrôleur unifié

### Configuration

Fichiers de configuration créés :
- `config/cinetpay.php` (existant)
- `config/pluto.php` (nouveau)
- `config/fapshi.php` (nouveau)

## Configuration des Variables d'Environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# CinetPay Configuration
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_cinetpay_site_id
CINETPAY_SECRET_KEY=your_cinetpay_secret_key
CINETPAY_BASE_URL=https://api-checkout.cinetpay.com/v2
CINETPAY_SANDBOX=false

# Pluto Payment Configuration
PLUTO_API_KEY=your_pluto_api_key
PLUTO_BASE_URL=https://api.pluto.com
PLUTO_SANDBOX=false
PLUTO_SANDBOX_URL=https://sandbox-api.pluto.com
PLUTO_TIMEOUT=30
PLUTO_DEFAULT_CURRENCY=XAF
PLUTO_MIN_AMOUNT=100

# Fapshi Payment Configuration
FAPSHI_API_USER=your_fapshi_api_user
FAPSHI_API_KEY=your_fapshi_api_key
FAPSHI_BASE_URL=https://live.fapshi.com
FAPSHI_SANDBOX=false
FAPSHI_SANDBOX_URL=https://sandbox.fapshi.com
FAPSHI_TIMEOUT=30
FAPSHI_DEFAULT_CURRENCY=XAF
FAPSHI_MIN_AMOUNT=100
```

## Installation et Configuration

### 1. Inclure les routes

Ajoutez cette ligne dans `routes/web.php` ou `routes/api.php` :

```php
require __DIR__.'/unified-payments.php';
```

### 2. Migration de base de données

Assurez-vous que la table `payments` a les champs nécessaires. Si pas déjà fait :

```php
// Dans une migration
Schema::table('payments', function (Blueprint $table) {
    $table->string('provider')->default('cinetpay'); // cinetpay, pluto, fapshi
    $table->string('gateway_transaction_id')->nullable();
    $table->json('gateway_response')->nullable();
    $table->json('metadata')->nullable();
});
```

## Utilisation de l'API

### 1. Initier un Paiement

**Endpoint :** `POST /api/payments/initiate`

```json
{
    "provider": "cinetpay",
    "amount": 5000,
    "currency": "XAF",
    "description": "Achat produit",
    "customer_email": "client@example.com",
    "customer_phone": "677123456",
    "customer_name": "John Doe",
    "payment_type": "web"
}
```

**Réponse :**
```json
{
    "success": true,
    "message": "Paiement initié avec succès",
    "transaction_id": "CP_1643723456_abc123",
    "payment_url": "https://checkout.cinetpay.com/...",
    "provider": "cinetpay",
    "data": { ... }
}
```

### 2. Paiement Mobile Direct

**Endpoint :** `POST /api/payments/direct-mobile`

```json
{
    "provider": "fapshi",
    "amount": 1000,
    "phone": "677123456",
    "description": "Paiement mobile direct"
}
```

### 3. Vérifier le Statut

**Endpoint :** `GET /api/payments/status/{transactionId}`

**Réponse :**
```json
{
    "success": true,
    "transaction_id": "FAPSHI_1643723456_xyz789",
    "status": "completed",
    "provider": "fapshi",
    "amount": 1000,
    "currency": "XAF",
    "data": { ... }
}
```

### 4. Obtenir les Fournisseurs Disponibles

**Endpoint :** `GET /api/payments/providers`

```json
{
    "success": true,
    "providers": {
        "cinetpay": {
            "name": "CinetPay",
            "supports_web": true,
            "supports_mobile": true,
            "supports_direct_mobile": false,
            "supports_balance_check": false,
            "supports_payout": false
        },
        "pluto": {
            "name": "Pluto",
            "supports_web": false,
            "supports_mobile": true,
            "supports_direct_mobile": true,
            "supports_balance_check": true,
            "supports_payout": false
        },
        "fapshi": {
            "name": "Fapshi",
            "supports_web": false,
            "supports_mobile": true,
            "supports_direct_mobile": true,
            "supports_balance_check": true,
            "supports_payout": true
        }
    }
}
```

### 5. Recommandation de Fournisseur

**Endpoint :** `POST /api/payments/recommend-provider`

```json
{
    "payment_type": "mobile",
    "phone": "677123456",
    "amount": 2000
}
```

**Réponse :**
```json
{
    "success": true,
    "recommended_provider": "fapshi",
    "payment_type": "mobile"
}
```

### 6. Consulter le Solde (Pluto/Fapshi)

**Endpoint :** `GET /api/payments/balance/{provider}`

```json
{
    "success": true,
    "provider": "fapshi",
    "balance": {
        "balance": 250000,
        "currency": "XAF"
    }
}
```

## Fonctionnalités Spécifiques Fapshi

### 1. Payout (Retrait)

**Endpoint :** `POST /api/fapshi/payout`

```json
{
    "amount": 5000,
    "phone": "677123456"
}
```

### 2. Recherche de Transactions

**Endpoint :** `GET /api/fapshi/transactions/search`

**Paramètres de requête :**
- `amt` : Montant
- `status` : Statut (SUCCESSFUL, FAILED, etc.)
- `medium` : Moyen de paiement (orange money, mtn momo, etc.)
- `limit` : Nombre de résultats
- `sort` : Tri (asc/desc)
- `start` : Date début (YYYY-MM-DD)
- `end` : Date fin (YYYY-MM-DD)

### 3. Transactions d'un Utilisateur

**Endpoint :** `GET /api/fapshi/transactions/user/{userId}`

### 4. Expirer un Paiement

**Endpoint :** `POST /api/fapshi/expire/{transactionId}`

## Webhooks et Notifications

### URL de Notification

**Endpoint :** `POST /payments/notify`

Le contrôleur identifie automatiquement le fournisseur et traite la notification appropriée.

### Page de Retour

**Endpoint :** `GET /payments/return`

Une page web est affichée avec le résultat du paiement, incluant :
- Statut du paiement avec icônes
- Détails de la transaction
- Options de retry pour les paiements échoués
- Auto-refresh pour les paiements en cours

## Exemples d'Utilisation en PHP

### Utilisation Directe des Services

```php
use App\Services\PaymentGatewayService;

class ExampleController extends Controller 
{
    public function makePayment(PaymentGatewayService $gateway)
    {
        // Recommander un fournisseur
        $provider = $gateway->recommendProvider('mobile', [
            'phone' => '677123456',
            'amount' => 1000
        ]);
        
        // Initier le paiement
        $result = $gateway->initiatePayment($provider, [
            'amount' => 1000,
            'phone' => '677123456',
            'description' => 'Test payment'
        ]);
        
        if (isset($result['success']) && $result['success']) {
            // Paiement initié avec succès
            return response()->json($result);
        } else {
            // Erreur
            return response()->json($result, 400);
        }
    }
    
    public function checkPayment(PaymentGatewayService $gateway, $transactionId)
    {
        $payment = Payment::where('transaction_id', $transactionId)->first();
        
        if ($payment) {
            $status = $gateway->checkPaymentStatus($payment->provider, $transactionId);
            return response()->json($status);
        }
        
        return response()->json(['error' => 'Payment not found'], 404);
    }
}
```

### Utilisation avec JavaScript (Frontend)

```javascript
// Initier un paiement
async function initiatePayment(paymentData) {
    try {
        const response = await fetch('/api/payments/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (result.payment_url) {
                // Rediriger vers l'interface de paiement
                window.location.href = result.payment_url;
            } else {
                // Paiement direct - attendre la confirmation
                checkPaymentStatus(result.transaction_id);
            }
        } else {
            console.error('Payment initiation failed:', result.message);
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Vérifier le statut
async function checkPaymentStatus(transactionId) {
    try {
        const response = await fetch(`/api/payments/status/${transactionId}`);
        const result = await response.json();
        
        if (result.success) {
            console.log('Payment status:', result.status);
            
            if (result.status === 'pending') {
                // Réessayer après quelques secondes
                setTimeout(() => checkPaymentStatus(transactionId), 5000);
            }
        }
        
    } catch (error) {
        console.error('Status check error:', error);
    }
}

// Exemple d'usage
const paymentData = {
    provider: 'fapshi',
    amount: 1000,
    phone: '677123456',
    description: 'Achat produit',
    payment_type: 'mobile'
};

initiatePayment(paymentData);
```

## Gestion des Erreurs

### Codes de Statut

- `pending` : Paiement en cours
- `completed` : Paiement réussi
- `failed` : Paiement échoué
- `cancelled` : Paiement annulé
- `expired` : Paiement expiré

### Gestion des Exceptions

```php
try {
    $result = $paymentGateway->initiatePayment('fapshi', $data);
} catch (\Exception $e) {
    Log::error('Payment error: ' . $e->getMessage());
    
    // Gérer selon le type d'erreur
    if (str_contains($e->getMessage(), 'Configuration manquante')) {
        // Problème de configuration
        return response()->json(['error' => 'Service temporarily unavailable'], 503);
    } elseif (str_contains($e->getMessage(), 'invalid phone number')) {
        // Erreur de validation
        return response()->json(['error' => 'Invalid phone number format'], 400);
    } else {
        // Autre erreur
        return response()->json(['error' => 'Payment processing failed'], 500);
    }
}
```

## Logs et Débogage

Tous les services loggent automatiquement :
- Requêtes sortantes vers les APIs
- Réponses reçues
- Erreurs rencontrées

Vérifiez les logs dans `storage/logs/laravel.log` :

```
[2025-01-01 10:30:45] local.INFO: Fapshi direct payment request {"amount":1000,"phone":"677123456"}
[2025-01-01 10:30:46] local.INFO: Fapshi direct payment response {"status":"SUCCESSFUL",...}
```

## Tests

### Test des Services

```php
use App\Services\PaymentGatewayService;

class PaymentTest extends TestCase
{
    public function test_fapshi_payment()
    {
        $gateway = new PaymentGatewayService(
            app(CinetpayService::class),
            app(PlutoService::class),  
            app(FapshiService::class)
        );
        
        $result = $gateway->initiatePayment('fapshi', [
            'amount' => 1000,
            'phone' => '677123456'
        ]);
        
        $this->assertArrayHasKey('success', $result);
    }
}
```

## Sécurité

### Validation des Webhooks

Les webhooks sont automatiquement validés en vérifiant le statut via l'API du fournisseur avant de mettre à jour la base de données.

### Configuration des URLs

Assurez-vous que les URLs de notification et retour sont accessibles :
- `notify_url` : `https://yourdomain.com/payments/notify`
- `return_url` : `https://yourdomain.com/payments/return`

## Recommandations d'Usage

### Choix du Fournisseur

1. **CinetPay** : 
   - Interface web complète
   - Support de multiples moyens de paiement
   - Idéal pour e-commerce

2. **Pluto** :
   - Paiements mobiles simples
   - API moderne
   - Bon pour applications mobiles

3. **Fapshi** :
   - Fonctionnalités avancées (payout, recherche)
   - Paiements mobiles directs
   - Idéal pour fintech et transferts

### Recommandations Techniques

- Utilisez `PaymentGatewayService->recommendProvider()` pour choisir automatiquement
- Implémentez un système de retry pour les paiements échoués
- Loggez toutes les transactions pour audit
- Utilisez les webhooks pour les mises à jour en temps réel

## Support et Maintenance

### URLs de Documentation des APIs

- **CinetPay** : https://docs.cinetpay.com/
- **Fapshi** : https://fapshi.com/docs/
- **Pluto** : Contactez votre représentant Pluto

### Contact Support

En cas de problème, vérifiez d'abord :
1. Configuration des variables d'environnement
2. Logs d'erreur dans Laravel
3. Status des APIs des fournisseurs
4. Validité des credentials

Cette intégration vous permet de gérer tous vos paiements via une interface unifiée tout en bénéficiant des spécificités de chaque fournisseur.