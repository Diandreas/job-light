<?php
/**
 * Page de Notification CinetPay (Notify_url)
 * Conforme à la documentation officielle CinetPay
 */

// Charger Laravel manuellement
require_once __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Payment;

// Log de démarrage
$logFile = __DIR__ . '/../storage/logs/cinetpay-notify.log';
file_put_contents($logFile, "=== CINETPAY NOTIFY START ===\n", FILE_APPEND);
file_put_contents($logFile, "Method: " . ($_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN') . "\n", FILE_APPEND);
file_put_contents($logFile, "POST Data: " . json_encode($_POST) . "\n", FILE_APPEND);

if (isset($_POST['cpm_trans_id'])) {
    try {
        file_put_contents($logFile, "Processing notification for transaction: " . $_POST['cpm_trans_id'] . "\n", FILE_APPEND);

        // Configuration CinetPay
        $apiKey = config('cinetpay.api_key');
        $siteId = config('cinetpay.site_id');
        $secretKey = config('cinetpay.secret_key');
        $baseUrl = config('cinetpay.base_url', 'https://api-checkout.cinetpay.com/v2');

        file_put_contents($logFile, "CinetPay config loaded - API Key: " . (empty($apiKey) ? 'EMPTY' : 'SET') . "\n", FILE_APPEND);

        // Création d'un fichier log pour s'assurer que les éléments sont bien exécutés
        $log = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i a") . PHP_EOL .
               "TransId: " . $_POST['cpm_trans_id'] . PHP_EOL .
               "SiteId: " . ($_POST['cpm_site_id'] ?? 'NOT_PROVIDED') . PHP_EOL .
               "-------------------------" . PHP_EOL;
        file_put_contents($logFile, $log, FILE_APPEND);

        // Chercher le paiement dans notre base de données
        $id_transaction = $_POST['cpm_trans_id'];
        $payment = Payment::where('transaction_id', $id_transaction)->first();
        
        file_put_contents($logFile, "Payment found: " . ($payment ? 'YES (ID: ' . $payment->id . ')' : 'NO') . "\n", FILE_APPEND);

        if (!$payment) {
            file_put_contents($logFile, "ERROR: Payment not found for transaction: " . $id_transaction . "\n", FILE_APPEND);
            echo "Payment not found";
            exit;
        }

        // Vérifier que la commande n'a pas encore été traitée
        if ($payment->status === 'completed') {
            file_put_contents($logFile, "Payment already processed, stopping script\n", FILE_APPEND);
            echo "Payment already processed";
            exit;
        }

        // Vérifier l'état de la transaction chez CinetPay
        file_put_contents($logFile, "Calling CinetPay API to check payment status...\n", FILE_APPEND);
        $statusResponse = Http::post($baseUrl . '/payment/check', [
            'apikey' => $apiKey,
            'site_id' => $siteId,
            'transaction_id' => $id_transaction
        ]);

        file_put_contents($logFile, "CinetPay API response status: " . $statusResponse->status() . "\n", FILE_APPEND);

        if ($statusResponse->successful()) {
            $statusResult = $statusResponse->json();
            
            $amount = $statusResult['data']['amount'] ?? 0;
            $currency = $statusResult['data']['currency'] ?? '';
            $message = $statusResult['message'] ?? '';
            $code = $statusResult['code'] ?? '';
            $metadata = $statusResult['data']['metadata'] ?? '';

            // Log des détails de la réponse
            $log = "User: " . $_SERVER['REMOTE_ADDR'] . ' - ' . date("F j, Y, g:i a") . PHP_EOL .
                   "Code: " . $code . PHP_EOL .
                   "Message: " . $message . PHP_EOL .
                   "Amount: " . $amount . PHP_EOL .
                   "Currency: " . $currency . PHP_EOL .
                   "-------------------------" . PHP_EOL;
            file_put_contents($logFile, $log, FILE_APPEND);

            // Vérifier que le montant payé chez CinetPay correspond à notre montant en base de données
            if ($code == '00') {
                // Paiement réussi
                file_put_contents($logFile, "Payment successful - updating database\n", FILE_APPEND);
                
                $payment->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                    'external_data' => json_encode($statusResult)
                ]);

                // Mettre à jour le solde de l'utilisateur
                $this->updateUserBalance($payment);

                Log::info('CinetPay payment completed successfully', [
                    'transaction_id' => $id_transaction,
                    'payment_id' => $payment->id,
                    'amount' => $amount,
                    'currency' => $currency
                ]);

                echo 'Félicitation, votre paiement a été effectué avec succès';
                exit;
            } else {
                // Transaction non valide
                file_put_contents($logFile, "Payment failed - code: " . $code . ", message: " . $message . "\n", FILE_APPEND);
                
                $payment->update([
                    'status' => 'failed',
                    'external_data' => json_encode($statusResult)
                ]);

                echo 'Échec, votre paiement a échoué pour cause : ' . $message;
                exit;
            }
        } else {
            file_put_contents($logFile, "ERROR: Failed to check payment status with CinetPay API\n", FILE_APPEND);
            echo "Erreur lors de la vérification du statut du paiement";
            exit;
        }

    } catch (Exception $e) {
        file_put_contents($logFile, "EXCEPTION: " . $e->getMessage() . "\n", FILE_APPEND);
        echo "Erreur :" . $e->getMessage();
    }
} else {
    // Accès direct à l'IPN
    file_put_contents($logFile, "ERROR: cpm_trans_id non fourni\n", FILE_APPEND);
    echo "cpm_trans_id non fourni";
}

file_put_contents($logFile, "=== CINETPAY NOTIFY END ===\n", FILE_APPEND);

/**
 * Mettre à jour le solde de l'utilisateur après un paiement réussi
 */
function updateUserBalance($payment) {
    try {
        $user = $payment->user;
        $metadata = json_decode($payment->metadata, true);
        
        // Priorité aux métadonnées du paiement initial, sinon calcul depuis le montant
        if (isset($metadata['tokens'])) {
            $tokensToAdd = $metadata['tokens'];
        } else {
            $tokensToAdd = calculateTokensFromAmount($payment->amount);
        }
        
        // Mettre à jour le solde de l'utilisateur
        $oldBalance = $user->wallet_balance;
        $user->increment('wallet_balance', $tokensToAdd);
        
        Log::info('User balance updated', [
            'user_id' => $user->id,
            'tokens_added' => $tokensToAdd,
            'old_balance' => $oldBalance,
            'new_balance' => $user->wallet_balance,
            'payment_amount' => $payment->amount
        ]);

    } catch (Exception $e) {
        Log::error('Failed to update user balance', [
            'payment_id' => $payment->id,
            'user_id' => $payment->user_id,
            'error' => $e->getMessage()
        ]);
    }
}

/**
 * Calculer le nombre de tokens à partir du montant payé
 */
function calculateTokensFromAmount($amount) {
    // Grille tarifaire basée sur les packs définis dans le frontend
    $packs = [
        600 => 10,     // Starter: 600 FCFA = 10 tokens
        1200 => 25,    // Plus: 1200 FCFA = 25 tokens (20 + 5 bonus)
        3000 => 60,    // Pro: 3000 FCFA = 60 tokens (50 + 10 bonus)
        6000 => 130    // Ultimate: 6000 FCFA = 130 tokens (100 + 30 bonus)
    ];
    
    return $packs[$amount] ?? floor($amount / 60); // Fallback: 1 token = 60 FCFA
}
?>
