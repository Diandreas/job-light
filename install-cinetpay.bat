@echo off
echo 🚀 Installation de CinetPay pour Laravel
echo ========================================

REM Vérifier si nous sommes dans un projet Laravel
if not exist "artisan" (
    echo ❌ Erreur: Ce script doit être exécuté dans le répertoire racine d'un projet Laravel
    pause
    exit /b 1
)

REM Créer le répertoire Libraries
echo 📁 Création du répertoire Libraries...
if not exist "app\Libraries" mkdir "app\Libraries"

REM Cloner le SDK CinetPay
echo 📦 Clonage du SDK CinetPay...
cd "app\Libraries"
if exist "cinetpay-sdk-php" (
    echo ⚠️  Le SDK CinetPay existe déjà, mise à jour...
    cd "cinetpay-sdk-php"
    git pull origin main
    cd ..
) else (
    git clone https://github.com/cobaf/cinetpay-sdk-php.git
)
cd ..\..

REM Mettre à jour l'autoload Composer
echo 🔄 Mise à jour de l'autoload Composer...
composer dump-autoload

REM Vérifier si le fichier .env existe
if not exist ".env" (
    echo ⚠️  Le fichier .env n'existe pas. Copie depuis .env.example...
    copy ".env.example" ".env"
)

REM Ajouter les variables CinetPay au .env si elles n'existent pas
echo ⚙️  Configuration des variables d'environnement CinetPay...

findstr /C:"CINETPAY_API_KEY" .env >nul
if errorlevel 1 (
    echo. >> .env
    echo # Configuration CinetPay >> .env
    echo CINETPAY_API_KEY=your_cinetpay_api_key >> .env
    echo CINETPAY_SITE_ID=your_cinetpay_site_id >> .env
    echo CINETPAY_SECRET_KEY=your_cinetpay_secret_key >> .env
    echo CINETPAY_ENVIRONMENT=test >> .env
    echo CINETPAY_DEFAULT_CURRENCY=XAF >> .env
    echo CINETPAY_DEFAULT_LANGUAGE=fr >> .env
    echo CINETPAY_DEFAULT_CHANNELS=ALL >> .env
    echo CINETPAY_NOTIFY_URL=/payment/notify >> .env
    echo CINETPAY_RETURN_URL=/payment/return >> .env
    echo CINETPAY_TIMEOUT=30 >> .env
    echo CINETPAY_ENABLE_LOGGING=true >> .env
    echo CINETPAY_ENABLE_HMAC=true >> .env
    echo ✅ Variables CinetPay ajoutées au fichier .env
) else (
    echo ✅ Variables CinetPay déjà présentes dans .env
)

echo.
echo ✅ Installation terminée!
echo.
echo 📋 Prochaines étapes:
echo 1. Configurez vos clés CinetPay dans le fichier .env
echo 2. Exécutez les migrations: php artisan migrate
echo 3. Testez l'intégration en mode sandbox
echo.
echo 🔧 Variables à configurer dans .env:
echo    - CINETPAY_API_KEY: Votre clé API CinetPay
echo    - CINETPAY_SITE_ID: Votre ID de site CinetPay
echo    - CINETPAY_SECRET_KEY: Votre clé secrète CinetPay
echo.
echo 📚 Documentation: https://cinetpay.com/docs
echo.
pause
