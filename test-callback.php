<?php
/**
 * Test simple pour l'URL de callback CinetPay
 */

echo "=== Test URL de Callback CinetPay ===\n\n";

$baseUrl = 'http://127.0.0.1:8000';
$callbackUrl = $baseUrl . '/cinetpay-callback.php';

// Test GET
echo "1. Test GET Request:\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $callbackUrl);
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
        echo "❌ GET Request: FAILED\n";
    }
}

echo "\n";

// Test POST
echo "2. Test POST Request:\n";
$postData = 'transaction_id=TEST_' . time();

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $callbackUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
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
        echo "❌ POST Request: FAILED (Code: $httpCode)\n";
        echo "Response: " . substr($response, 0, 200) . "...\n";
    }
}

echo "\n=== Test terminé ===\n";
?>
