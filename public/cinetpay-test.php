<?php
/**
 * Test simple pour CinetPay callback (sans Laravel)
 */

// Log simple dans un fichier
function logMessage($message, $data = []) {
    $logEntry = date('Y-m-d H:i:s') . ' - ' . $message . ' - ' . json_encode($data) . "\n";
    file_put_contents(__DIR__ . '/../storage/logs/cinetpay-test.log', $logEntry, FILE_APPEND);
}

try {
    // Log de la requête
    logMessage('CinetPay test callback accessed', [
        'method' => $_SERVER['REQUEST_METHOD'],
        'url' => $_SERVER['REQUEST_URI'],
        'data' => $_POST,
        'headers' => getallheaders()
    ]);

    // Pour les requêtes GET, on vérifie juste que l'URL est disponible
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'available',
            'message' => 'CinetPay test callback URL is available',
            'timestamp' => date('c')
        ]);
        exit;
    }

    // Pour les requêtes POST
    $transactionId = $_POST['transaction_id'] ?? $_POST['cpm_trans_id'] ?? null;
    
    if (!$transactionId) {
        logMessage('Transaction ID manquant');
        http_response_code(400);
        echo json_encode(['error' => 'Transaction ID manquant']);
        exit;
    }

    logMessage('Processing transaction', ['transaction_id' => $transactionId]);

    // Simuler une réponse de succès pour le test
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Transaction processed',
        'transaction_id' => $transactionId
    ]);

} catch (\Exception $e) {
    logMessage('Error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);

    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors du traitement du callback']);
}
?>
