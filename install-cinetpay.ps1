# Script PowerShell pour l'installation de CinetPay
Write-Host "🚀 Installation de CinetPay pour Laravel" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Vérifier si nous sommes dans un projet Laravel
if (-not (Test-Path "artisan")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté dans le répertoire racine d'un projet Laravel" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

# Créer le répertoire Libraries
Write-Host "📁 Création du répertoire Libraries..." -ForegroundColor Yellow
if (-not (Test-Path "app\Libraries")) {
    New-Item -ItemType Directory -Path "app\Libraries" -Force | Out-Null
}

# Cloner le SDK CinetPay
Write-Host "📦 Clonage du SDK CinetPay..." -ForegroundColor Yellow
Set-Location "app\Libraries"
if (Test-Path "cinetpay-sdk-php") {
    Write-Host "⚠️  Le SDK CinetPay existe déjà, mise à jour..." -ForegroundColor Yellow
    Set-Location "cinetpay-sdk-php"
    git pull origin main
    Set-Location ".."
} else {
    git clone https://github.com/cobaf/cinetpay-sdk-php.git
}
Set-Location "..\.."

# Mettre à jour l'autoload Composer
Write-Host "🔄 Mise à jour de l'autoload Composer..." -ForegroundColor Yellow
composer dump-autoload

# Vérifier si le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Le fichier .env n'existe pas. Copie depuis .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Ajouter les variables CinetPay au .env si elles n'existent pas
Write-Host "⚙️  Configuration des variables d'environnement CinetPay..." -ForegroundColor Yellow

$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "CINETPAY_API_KEY") {
    $cinetpayConfig = @"

# Configuration CinetPay
CINETPAY_API_KEY=your_cinetpay_api_key
CINETPAY_SITE_ID=your_cinetpay_site_id
CINETPAY_SECRET_KEY=your_cinetpay_secret_key
CINETPAY_ENVIRONMENT=test
CINETPAY_DEFAULT_CURRENCY=XAF
CINETPAY_DEFAULT_LANGUAGE=fr
CINETPAY_DEFAULT_CHANNELS=ALL
CINETPAY_NOTIFY_URL=/payment/notify
CINETPAY_RETURN_URL=/payment/return
CINETPAY_TIMEOUT=30
CINETPAY_ENABLE_LOGGING=true
CINETPAY_ENABLE_HMAC=true
"@
    Add-Content ".env" $cinetpayConfig
    Write-Host "✅ Variables CinetPay ajoutées au fichier .env" -ForegroundColor Green
} else {
    Write-Host "✅ Variables CinetPay déjà présentes dans .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Installation terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Configurez vos clés CinetPay dans le fichier .env"
Write-Host "2. Exécutez les migrations: php artisan migrate"
Write-Host "3. Testez l'intégration en mode sandbox"
Write-Host ""
Write-Host "🔧 Variables à configurer dans .env:" -ForegroundColor Cyan
Write-Host "   - CINETPAY_API_KEY: Votre clé API CinetPay"
Write-Host "   - CINETPAY_SITE_ID: Votre ID de site CinetPay"
Write-Host "   - CINETPAY_SECRET_KEY: Votre clé secrète CinetPay"
Write-Host ""
Write-Host "📚 Documentation: https://cinetpay.com/docs" -ForegroundColor Cyan
Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer"
