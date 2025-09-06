<?php
/**
 * Page de Retour CinetPay (Return_url)
 * Conforme à la documentation officielle CinetPay
 * Aucune mise à jour de la base de données ne doit être traitée sur cette page
 */

// Charger Laravel manuellement
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Payment;

// Log de démarrage
$logFile = __DIR__ . '/../storage/logs/cinetpay-return.log';
file_put_contents($logFile, "=== CINETPAY RETURN START ===\n", FILE_APPEND);
file_put_contents($logFile, "Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN') . "\n", FILE_APPEND);
file_put_contents($logFile, "POST Data: " . json_encode($_POST) . "\n", FILE_APPEND);

// Pour les requêtes GET, on vérifie juste que l'URL est disponible
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    file_put_contents($logFile, "Processing GET request (ping test)\n", FILE_APPEND);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'available',
        'message' => 'CinetPay return URL is available',
        'timestamp' => date('c')
    ]);
    file_put_contents($logFile, "GET request completed successfully\n", FILE_APPEND);
    exit;
}

if (isset($_POST['transaction_id']) || isset($_POST['token']) || isset($_POST['cpm_trans_id'])) {
    try {
        file_put_contents($logFile, "Processing return request\n", FILE_APPEND);

        // Configuration CinetPay
        $apiKey = config('cinetpay.api_key');
        $siteId = config('cinetpay.site_id');
        $baseUrl = config('cinetpay.base_url', 'https://api-checkout.cinetpay.com/v2');

        file_put_contents($logFile, "CinetPay config loaded\n", FILE_APPEND);

        // Récupérer l'ID de transaction
        $id_transaction = $_POST['transaction_id'] ?? $_POST['token'] ?? $_POST['cpm_trans_id'];
        file_put_contents($logFile, "Transaction ID: " . $id_transaction . "\n", FILE_APPEND);

        // Chercher le paiement dans notre base de données (lecture seule)
        $payment = Payment::where('transaction_id', $id_transaction)->first();
        file_put_contents($logFile, "Payment found: " . ($payment ? 'YES' : 'NO') . "\n", FILE_APPEND);

        // Vérification d'état de transaction chez CinetPay
        file_put_contents($logFile, "Calling CinetPay API to check payment status...\n", FILE_APPEND);
        $statusResponse = Http::post($baseUrl . '/payment/check', [
            'apikey' => $apiKey,
            'site_id' => $siteId,
            'transaction_id' => $id_transaction
        ]);

        file_put_contents($logFile, "CinetPay API response status: " . $statusResponse->status() . "\n", FILE_APPEND);

        if ($statusResponse->successful()) {
            $statusResult = $statusResponse->json();
            
            $message = $statusResult['message'] ?? '';
            $code = $statusResult['code'] ?? '';

            file_put_contents($logFile, "Payment status - Code: " . $code . ", Message: " . $message . "\n", FILE_APPEND);

            // Log de la requête de retour
            Log::info('CinetPay return page accessed', [
                'transaction_id' => $id_transaction,
                'code' => $code,
                'message' => $message,
                'payment_exists' => $payment ? true : false
            ]);

            // Redirection vers une page en fonction de l'état de la transaction
            if ($code == '00') {
                file_put_contents($logFile, "Payment successful - redirecting to success page\n", FILE_APPEND);
                
                // Construire l'URL de succès avec les paramètres
                $successUrl = '/payment/success?' . http_build_query([
                    'success' => 'Paiement effectué avec succès',
                    'transaction_id' => $id_transaction,
                    'amount' => $statusResult['data']['amount'] ?? 0
                ]);
                
                header('Location: ' . $successUrl);
                exit;
            } else {
                file_put_contents($logFile, "Payment failed - redirecting to failed page\n", FILE_APPEND);
                
                // Construire l'URL d'échec avec les paramètres
                $failedUrl = '/payment/failed?' . http_build_query([
                    'error' => 'Le paiement a échoué: ' . $message
                ]);
                
                header('Location: ' . $failedUrl);
                exit;
            }
        } else {
            file_put_contents($logFile, "ERROR: Failed to check payment status\n", FILE_APPEND);
            
            // En cas d'erreur, utiliser le statut local si disponible
            if ($payment && $payment->status === 'completed') {
                header('Location: /payment/success?success=Paiement effectué avec succès');
                exit;
            } else {
                header('Location: /payment/failed?error=Erreur lors de la vérification du paiement');
                exit;
            }
        }

    } catch (Exception $e) {
        file_put_contents($logFile, "EXCEPTION: " . $e->getMessage() . "\n", FILE_APPEND);
        echo "Erreur :" . $e->getMessage();
    }
} else {
    file_put_contents($logFile, "ERROR: transaction_id non transmis\n", FILE_APPEND);
    echo 'transaction_id non transmis';
}

file_put_contents($logFile, "=== CINETPAY RETURN END ===\n", FILE_APPEND);
?>
