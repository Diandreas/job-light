<?php
/**
 * Test simple pour vérifier que PHP fonctionne
 */

header('Content-Type: text/plain');

echo "=== SIMPLE PHP TEST ===\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "URL: " . $_SERVER['REQUEST_URI'] . "\n";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "POST Data:\n";
    print_r($_POST);
    echo "\nRaw Body:\n";
    echo file_get_contents('php://input');
}

echo "\n=== TEST COMPLETE ===\n";
?>