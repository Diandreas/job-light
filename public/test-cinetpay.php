<?php
/**
 * Page de test pour l'intégration CinetPay
 * Utiliser cette page pour tester les paiements en mode sandbox
 */

// Charger Laravel
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\CinetpayService;
use Illuminate\Support\Facades\Log;

?>
<!DOCTYPE html>
<html>
<head>
    <title>Test CinetPay - JobLight</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 50px; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; color: #155724; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { padding: 8px; border: 1px solid #ddd; border-radius: 3px; width: 300px; }
        .log-box { background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px; max-height: 300px; overflow-y: auto; }
    </style>
</head>
<body>

<div class="container">
    <h1>🧪 Test CinetPay Integration</h1>
    
    <?php if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])): ?>
        
        <?php if ($_POST['action'] === 'test_config'): ?>
            <div class="section">
                <h2>📋 Test Configuration</h2>
                <?php
                try {
                    $apiKey = config('cinetpay.api_key');
                    $siteId = config('cinetpay.site_id');
                    $secretKey = config('cinetpay.secret_key');
                    $baseUrl = config('cinetpay.base_url');
                    
                    echo '<div class="log-box">';
                    echo "API Key: " . (empty($apiKey) ? '❌ MANQUANT' : '✅ Configuré (' . substr($apiKey, 0, 10) . '...)') . "\n";
                    echo "Site ID: " . (empty($siteId) ? '❌ MANQUANT' : '✅ Configuré (' . $siteId . ')') . "\n";
                    echo "Secret Key: " . (empty($secretKey) ? '❌ MANQUANT' : '✅ Configuré (' . substr($secretKey, 0, 10) . '...)') . "\n";
                    echo "Base URL: " . $baseUrl . "\n";
                    echo '</div>';
                    
                    if (empty($apiKey) || empty($siteId)) {
                        echo '<div class="error">❌ Configuration incomplète ! Vérifiez votre fichier .env</div>';
                    } else {
                        echo '<div class="success">✅ Configuration OK</div>';
                    }
                    
                } catch (Exception $e) {
                    echo '<div class="error">❌ Erreur: ' . $e->getMessage() . '</div>';
                }
                ?>
            </div>
        <?php endif; ?>

        <?php if ($_POST['action'] === 'test_payment'): ?>
            <div class="section">
                <h2>💳 Test Création Paiement</h2>
                <?php
                try {
                    $amount = floatval($_POST['amount']);
                    $description = $_POST['description'] ?: 'Test Payment';
                    $customerEmail = $_POST['customer_email'] ?: 'test@example.com';
                    $customerName = $_POST['customer_name'] ?: 'Test User';
                    
                    $cinetpayService = new CinetpayService();
                    $transactionId = 'TEST_' . time();
                    
                    $additionalParams = [
                        'customer_email' => $customerEmail,
                        'customer_name' => $customerName,
                        'customer_surname' => $customerName,
                        'customer_phone_number' => '237600000000',
                        'customer_country' => 'CM',
                        'notify_url' => url('/api/cinetpay/notify'),
                        'return_url' => url('/api/cinetpay/return'),
                    ];
                    
                    echo '<div class="log-box">';
                    echo "Transaction ID: " . $transactionId . "\n";
                    echo "Montant: " . $amount . " XAF\n";
                    echo "Description: " . $description . "\n";
                    echo "Email client: " . $customerEmail . "\n";
                    echo "Notify URL: " . $additionalParams['notify_url'] . "\n";
                    echo "Return URL: " . $additionalParams['return_url'] . "\n";
                    echo "\n--- Appel API CinetPay ---\n";
                    echo '</div>';
                    
                    $response = $cinetpayService->generatePayment(
                        $transactionId,
                        $amount,
                        'XAF',
                        $description,
                        $additionalParams
                    );
                    
                    echo '<div class="log-box">';
                    echo "Réponse CinetPay:\n";
                    echo json_encode($response, JSON_PRETTY_PRINT);
                    echo '</div>';
                    
                    if ($response['success'] && isset($response['data']['payment_url'])) {
                        echo '<div class="success">✅ Paiement créé avec succès !</div>';
                        echo '<p><strong>URL de paiement:</strong></p>';
                        echo '<p><a href="' . $response['data']['payment_url'] . '" target="_blank" style="color: #007bff;">' . $response['data']['payment_url'] . '</a></p>';
                        echo '<p><button onclick="window.open(\'' . $response['data']['payment_url'] . '\', \'_blank\')">🚀 Ouvrir la page de paiement</button></p>';
                    } else {
                        echo '<div class="error">❌ Erreur lors de la création du paiement</div>';
                    }
                    
                } catch (Exception $e) {
                    echo '<div class="error">❌ Exception: ' . $e->getMessage() . '</div>';
                    echo '<div class="log-box">';
                    echo "Stack trace:\n" . $e->getTraceAsString();
                    echo '</div>';
                }
                ?>
            </div>
        <?php endif; ?>

        <?php if ($_POST['action'] === 'check_status'): ?>
            <div class="section">
                <h2>🔍 Vérifier Statut Paiement</h2>
                <?php
                try {
                    $transactionId = $_POST['transaction_id'];
                    
                    if (empty($transactionId)) {
                        throw new Exception('Transaction ID requis');
                    }
                    
                    $cinetpayService = new CinetpayService();
                    
                    echo '<div class="log-box">';
                    echo "Vérification du statut pour: " . $transactionId . "\n";
                    echo '</div>';
                    
                    $response = $cinetpayService->checkPaymentStatus($transactionId);
                    
                    echo '<div class="log-box">';
                    echo "Réponse CinetPay:\n";
                    echo json_encode($response, JSON_PRETTY_PRINT);
                    echo '</div>';
                    
                    if ($response['success']) {
                        $status = $response['data']['status'] ?? 'UNKNOWN';
                        $amount = $response['data']['amount'] ?? 0;
                        
                        if ($status === 'ACCEPTED') {
                            echo '<div class="success">✅ Paiement accepté ! Montant: ' . $amount . ' XAF</div>';
                        } elseif ($status === 'REFUSED') {
                            echo '<div class="error">❌ Paiement refusé</div>';
                        } else {
                            echo '<div class="info">ℹ️ Statut: ' . $status . '</div>';
                        }
                    } else {
                        echo '<div class="error">❌ Erreur lors de la vérification</div>';
                    }
                    
                } catch (Exception $e) {
                    echo '<div class="error">❌ Exception: ' . $e->getMessage() . '</div>';
                }
                ?>
            </div>
        <?php endif; ?>
        
    <?php endif; ?>

    <!-- Configuration Test -->
    <div class="section">
        <h2>📋 1. Tester la Configuration</h2>
        <p>Vérifiez que vos clés CinetPay sont correctement configurées.</p>
        <form method="post">
            <input type="hidden" name="action" value="test_config">
            <button type="submit">🔧 Tester la Configuration</button>
        </form>
    </div>

    <!-- Payment Test -->
    <div class="section">
        <h2>💳 2. Créer un Paiement Test</h2>
        <p>Créez un paiement de test en mode sandbox.</p>
        <form method="post">
            <input type="hidden" name="action" value="test_payment">
            
            <div class="form-group">
                <label>Montant (XAF):</label>
                <input type="number" name="amount" value="600" min="100" required>
            </div>
            
            <div class="form-group">
                <label>Description:</label>
                <input type="text" name="description" value="Test Payment JobLight" required>
            </div>
            
            <div class="form-group">
                <label>Email Client:</label>
                <input type="email" name="customer_email" value="test@joblight.cm" required>
            </div>
            
            <div class="form-group">
                <label>Nom Client:</label>
                <input type="text" name="customer_name" value="Client Test" required>
            </div>
            
            <button type="submit">💳 Créer le Paiement</button>
        </form>
    </div>

    <!-- Status Check -->
    <div class="section">
        <h2>🔍 3. Vérifier un Paiement</h2>
        <p>Vérifiez le statut d'une transaction existante.</p>
        <form method="post">
            <input type="hidden" name="action" value="check_status">
            
            <div class="form-group">
                <label>Transaction ID:</label>
                <input type="text" name="transaction_id" placeholder="TEST_1234567890" required>
            </div>
            
            <button type="submit">🔍 Vérifier le Statut</button>
        </form>
    </div>

    <!-- URLs Info -->
    <div class="section info">
        <h2>📡 URLs de Configuration CinetPay</h2>
        <p><strong>URL de Notification (IPN):</strong><br>
        <code><?= url('/api/cinetpay/notify') ?></code></p>
        
        <p><strong>URL de Retour:</strong><br>
        <code><?= url('/api/cinetpay/return') ?></code></p>
        
        <p><strong>⚠️ Important:</strong> Configurez ces URLs dans votre compte marchand CinetPay.</p>
    </div>

</div>

</body>
</html>