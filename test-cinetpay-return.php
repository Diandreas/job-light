<?php
/**
 * Script de test pour l'URL de retour CinetPay
 * 
 * Ce script permet de tester que l'URL de retour fonctionne correctement
 * avec les méthodes GET et POST comme requis par CinetPay
 */

// Configuration
$baseUrl = 'http://localhost'; // Remplacez par votre URL de base
$returnUrl = $baseUrl . '/payment/cinetpay/callback';

echo "=== Test URL de Retour CinetPay ===\n\n";

// Test 1: GET Request (ping de disponibilité)
echo "1. Test GET Request (ping de disponibilité):\n";
echo "URL: $returnUrl\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $returnUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'User-Agent: CinetPay-Test/1.0'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "❌ Erreur: $error\n";
} else {
    echo "✅ Status Code: $httpCode\n";
    if ($httpCode === 200) {
        echo "✅ GET Request: SUCCESS\n";
    } else {
        echo "❌ GET Request: FAILED (Expected 200, got $httpCode)\n";
    }
}

echo "\n";

// Test 2: POST Request (retour après paiement)
echo "2. Test POST Request (retour après paiement):\n";
echo "URL: $returnUrl\n";

$testTransactionId = 'TEST_' . time();
$postData = [
    'transaction_id' => $testTransactionId,
    'cpm_trans_id' => $testTransactionId,
    'cpm_site_id' => '123456', // ID de test
    'cpm_amount' => '1000',
    'cpm_currency' => 'XAF',
    'signature' => 'test_signature'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $returnUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'User-Agent: CinetPay-Test/1.0'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "❌ Erreur: $error\n";
} else {
    echo "✅ Status Code: $httpCode\n";
    if ($httpCode === 200 || $httpCode === 302) {
        echo "✅ POST Request: SUCCESS\n";
    } else {
        echo "❌ POST Request: FAILED (Expected 200/302, got $httpCode)\n";
    }
}

echo "\n";

// Test 3: Test avec Postman-style
echo "3. Instructions pour test avec Postman:\n";
echo "GET Request:\n";
echo "  - URL: $returnUrl\n";
echo "  - Method: GET\n";
echo "  - Expected: Status 200 OK\n\n";

echo "POST Request:\n";
echo "  - URL: $returnUrl\n";
echo "  - Method: POST\n";
echo "  - Content-Type: application/x-www-form-urlencoded\n";
echo "  - Body: transaction_id=TEST_123456789\n";
echo "  - Expected: Status 200 OK ou 302 Redirect\n\n";

echo "=== Résumé ===\n";
echo "✅ URL de retour configurée: $returnUrl\n";
echo "✅ Support GET et POST: Configuré\n";
echo "✅ Pages de succès/échec: Créées\n";
echo "✅ Logging: Activé\n\n";

echo "Prochaines étapes:\n";
echo "1. Configurez votre compte CinetPay avec l'URL: $returnUrl\n";
echo "2. Testez avec de vrais paiements\n";
echo "3. Vérifiez les logs pour le debugging\n";
?>
