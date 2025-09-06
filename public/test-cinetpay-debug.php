<?php
/**
 * Test script pour diagnostiquer les callbacks CinetPay
 * Ce script simule les appels que CinetPay ferait vers nos endpoints
 * 
 * Usage: Accédez à cette URL depuis votre navigateur ou via curl
 */

echo "<h1>🔧 CinetPay Debug Test Suite</h1>\n";
echo "<div style='font-family: monospace; background: #f0f0f0; padding: 20px;'>\n";

// URL de base de l'application
$baseUrl = 'http://localhost:8000'; // Ajustez selon votre configuration

// Données de test typiques d'un callback CinetPay
$testData = [
    'cpm_trans_id' => 'test_' . time(),
    'cpm_site_id' => 'TEST_SITE_ID',
    'cpm_amount' => 1000,
    'cpm_currency' => 'XAF',
    'cpm_payid' => 'PAY_' . time(),
    'cpm_payment_date' => date('Y-m-d H:i:s'),
    'cpm_payment_time' => time(),
    'cpm_error_message' => '',
    'cpm_result' => '00',
    'cpm_trans_status' => 'ACCEPTED',
    'cpm_designation' => 'Test Payment',
    'cpm_phone_prefixe' => '+237',
    'cpm_phone_num' => '690000000',
    'cpm_option' => 'CARD',
    'cpm_version' => 'v2',
    'signature' => 'test_signature_hash'
];

echo "<h2>📋 Données de test CinetPay:</h2>\n";
echo "<pre>" . print_r($testData, true) . "</pre>\n";

// Liste des endpoints à tester
$endpoints = [
    'notify' => '/api/cinetpay/notify',
    'return' => '/api/cinetpay/return',
    'notify_alias' => '/payment/notify',
    'return_alias' => '/payment/return',
    'webhook' => '/webhook/cinetpay/callback'
];

echo "<h2>🧪 Tests des endpoints:</h2>\n";

foreach ($endpoints as $name => $endpoint) {
    echo "<h3>Testing: $name ($endpoint)</h3>\n";
    
    $url = $baseUrl . $endpoint;
    echo "URL: <a href='$url' target='_blank'>$url</a><br>\n";
    
    // Test POST avec cURL
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($testData),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded',
            'User-Agent: CinetPay-Test-Agent/1.0',
            'Accept: */*'
        ],
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_VERBOSE => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "Status: <span style='color: " . ($httpCode == 200 ? 'green' : 'red') . ";'>$httpCode</span><br>\n";
    
    if ($error) {
        echo "cURL Error: <span style='color: red;'>$error</span><br>\n";
    }
    
    if ($response) {
        echo "Response (first 500 chars):<br>\n";
        echo "<div style='background: #fff; border: 1px solid #ddd; padding: 10px; margin: 10px 0;'>\n";
        echo htmlspecialchars(substr($response, 0, 500));
        if (strlen($response) > 500) echo "... (truncated)";
        echo "</div>\n";
    }
    
    echo "<hr style='margin: 20px 0;'>\n";
}

// Test GET sur les endpoints return
echo "<h2>🔄 Test GET sur les endpoints return:</h2>\n";
$getParams = http_build_query(array_merge($testData, ['method' => 'GET']));

foreach (['return', 'return_alias', 'webhook'] as $name) {
    $endpoint = $endpoints[$name];
    $url = $baseUrl . $endpoint . '?' . $getParams;
    
    echo "<h3>GET Test: $name</h3>\n";
    echo "URL: <a href='$url' target='_blank'>$url</a><br>\n";
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            'User-Agent: CinetPay-GET-Test/1.0'
        ],
        CURLOPT_SSL_VERIFYPEER => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    echo "Status: <span style='color: " . ($httpCode == 200 ? 'green' : 'red') . ";'>$httpCode</span><br>\n";
    
    if ($error) {
        echo "Error: <span style='color: red;'>$error</span><br>\n";
    }
    
    echo "<hr style='margin: 20px 0;'>\n";
}

echo "</div>\n";

echo "<h2>📝 Instructions:</h2>\n";
echo "<ol>\n";
echo "<li>Vérifiez les logs Laravel dans <code>storage/logs/laravel.log</code></li>\n";
echo "<li>Vérifiez les logs du serveur web (Apache/Nginx)</li>\n";
echo "<li>Vérifiez que le middleware CinetPayDebugMiddleware fonctionne</li>\n";
echo "<li>Testez manuellement les URLs ci-dessus</li>\n";
echo "</ol>\n";

echo "<p><strong>Note:</strong> Ce script doit être accessible via votre serveur web pour fonctionner correctement.</p>\n";
?>