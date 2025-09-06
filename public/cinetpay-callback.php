<?php
/**
 * Callback CinetPay direct (sans Laravel pour éviter les problèmes CSRF)
 * Ce fichier est accessible directement via HTTP sans passer par le système de routes Laravel
 */

// Log simple au début
$logFile = __DIR__ . '/../storage/logs/cinetpay-callback.log';
file_put_contents($logFile, "=== CINETPAY CALLBACK START ===\n", FILE_APPEND);
file_put_contents($logFile, "Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN') . "\n", FILE_APPEND);
file_put_contents($logFile, "URL: " . ($_SERVER['REQUEST_URI'] ?? 'UNKNOWN') . "\n", FILE_APPEND);
file_put_contents($logFile, "POST Data: " . json_encode($_POST) . "\n", FILE_APPEND);

// Charger Laravel manuellement
file_put_contents($logFile, "Loading Laravel...\n", FILE_APPEND);
require_once __DIR__ . '/../vendor/autoload.php';

// Initialiser Laravel
file_put_contents($logFile, "Initializing Laravel app...\n", FILE_APPEND);
$app = require_once __DIR__ . '/../bootstrap/app.php';
file_put_contents($logFile, "Bootstrap Laravel kernel...\n", FILE_APPEND);
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
file_put_contents($logFile, "Laravel initialized successfully\n", FILE_APPEND);

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Payment;

try {
    file_put_contents($logFile, "Starting callback processing...\n", FILE_APPEND);
    
    // Log de la requête
    Log::info('CinetPay direct callback accessed', [
        'method' => $_SERVER['REQUEST_METHOD'],
        'url' => $_SERVER['REQUEST_URI'],
        'data' => $_POST,
        'headers' => getallheaders()
    ]);
    
    file_put_contents($logFile, "Laravel log written successfully\n", FILE_APPEND);

    // Pour les requêtes GET, on vérifie juste que l'URL est disponible
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        file_put_contents($logFile, "Processing GET request\n", FILE_APPEND);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'available',
            'message' => 'CinetPay callback URL is available',
            'timestamp' => date('c')
        ]);
        file_put_contents($logFile, "GET request completed successfully\n", FILE_APPEND);
        exit;
    }

    // Pour les requêtes POST (retour après paiement)
    file_put_contents($logFile, "Processing POST request\n", FILE_APPEND);
    $transactionId = $_POST['transaction_id'] ?? $_POST['cpm_trans_id'] ?? null;
    file_put_contents($logFile, "Transaction ID extracted: " . ($transactionId ?? 'NULL') . "\n", FILE_APPEND);
    
    if (!$transactionId) {
        file_put_contents($logFile, "ERROR: Transaction ID manquant\n", FILE_APPEND);
        Log::warning('CinetPay direct callback: Transaction ID manquant');
        http_response_code(400);
        echo json_encode(['error' => 'Transaction ID manquant']);
        exit;
    }

    file_put_contents($logFile, "Looking for payment with transaction_id: " . $transactionId . "\n", FILE_APPEND);
    Log::info('CinetPay direct callback: Processing transaction', ['transaction_id' => $transactionId]);

    $payment = Payment::where('transaction_id', $transactionId)->first();
    error_log("Payment found: " . ($payment ? 'YES (ID: ' . $payment->id . ')' : 'NO'));
    
    if (!$payment) {
        error_log("ERROR: Paiement non trouvé pour transaction_id: " . $transactionId);
        Log::warning('CinetPay direct callback: Paiement non trouvé', ['transaction_id' => $transactionId]);
        http_response_code(404);
        echo json_encode(['error' => 'Paiement non trouvé']);
        exit;
    }

    // Configuration CinetPay
    error_log("Loading CinetPay configuration...");
    $apiKey = config('cinetpay.api_key');
    $siteId = config('cinetpay.site_id');
    $baseUrl = config('cinetpay.base_url', 'https://api-checkout.cinetpay.com/v2');
    
    error_log("CinetPay config - API Key: " . (empty($apiKey) ? 'EMPTY' : 'SET'));
    error_log("CinetPay config - Site ID: " . (empty($siteId) ? 'EMPTY' : 'SET'));
    error_log("CinetPay config - Base URL: " . $baseUrl);

    // Vérifier le statut du paiement auprès de CinetPay
    error_log("Calling CinetPay API to check payment status...");
    $statusResponse = Http::post($baseUrl . '/payment/check', [
        'apikey' => $apiKey,
        'site_id' => $siteId,
        'transaction_id' => $transactionId
    ]);
    error_log("CinetPay API response status: " . $statusResponse->status());

    if ($statusResponse->successful()) {
        $statusResult = $statusResponse->json();
        
        if ($statusResult['code'] === '00' && $statusResult['data']['status'] === 'ACCEPTED') {
            // Paiement réussi
            Log::info('CinetPay direct callback: Paiement confirmé réussi', [
                'transaction_id' => $transactionId,
                'amount' => $statusResult['data']['amount']
            ]);
            
            // Rediriger vers la page de succès
            header('Location: /payment/success?success=Paiement effectué avec succès&transaction_id=' . urlencode($transactionId) . '&amount=' . urlencode($statusResult['data']['amount']));
            exit;
        } else {
            // Paiement échoué ou en attente
            Log::warning('CinetPay direct callback: Paiement non confirmé', [
                'transaction_id' => $transactionId,
                'status' => $statusResult['data']['status'] ?? 'Unknown',
                'code' => $statusResult['code']
            ]);
            
            header('Location: /payment/failed?error=Le paiement n\'a pas pu être confirmé');
            exit;
        }
    } else {
        Log::error('CinetPay direct callback: Erreur vérification statut', [
            'transaction_id' => $transactionId,
            'response' => $statusResponse->body()
        ]);
        
        // En cas d'erreur de vérification, utiliser le statut local
        if ($payment->status === 'completed') {
            header('Location: /payment/success?success=Paiement effectué avec succès');
            exit;
        } else {
            header('Location: /payment/failed?error=Le paiement n\'a pas pu être complété');
            exit;
        }
    }

} catch (\Exception $e) {
    error_log("EXCEPTION CAUGHT: " . $e->getMessage());
    error_log("EXCEPTION TRACE: " . $e->getTraceAsString());
    
    Log::error('CinetPay direct callback error', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);

    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors du traitement du callback']);
}

error_log("=== CINETPAY CALLBACK END ===");
?>