#!/bin/bash

echo "🚀 Installation de CinetPay pour Laravel"
echo "========================================"

# Vérifier si nous sommes dans un projet Laravel
if [ ! -f "artisan" ]; then
    echo "❌ Erreur: Ce script doit être exécuté dans le répertoire racine d'un projet Laravel"
    exit 1
fi

# Créer le répertoire Libraries
echo "📁 Création du répertoire Libraries..."
mkdir -p app/Libraries

# Cloner le SDK CinetPay
echo "📦 Clonage du SDK CinetPay..."
cd app/Libraries
if [ -d "cinetpay-sdk-php" ]; then
    echo "⚠️  Le SDK CinetPay existe déjà, mise à jour..."
    cd cinetpay-sdk-php
    git pull origin main
    cd ..
else
    git clone https://github.com/cobaf/cinetpay-sdk-php.git
fi
cd ../..

# Mettre à jour l'autoload Composer
echo "🔄 Mise à jour de l'autoload Composer..."
composer dump-autoload

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Le fichier .env n'existe pas. Copie depuis .env.example..."
    cp .env.example .env
fi

# Ajouter les variables CinetPay au .env si elles n'existent pas
echo "⚙️  Configuration des variables d'environnement CinetPay..."

if ! grep -q "CINETPAY_API_KEY" .env; then
    echo "" >> .env
    echo "# Configuration CinetPay" >> .env
    echo "CINETPAY_API_KEY=your_cinetpay_api_key" >> .env
    echo "CINETPAY_SITE_ID=your_cinetpay_site_id" >> .env
    echo "CINETPAY_SECRET_KEY=your_cinetpay_secret_key" >> .env
    echo "CINETPAY_ENVIRONMENT=test" >> .env
    echo "CINETPAY_DEFAULT_CURRENCY=XAF" >> .env
    echo "CINETPAY_DEFAULT_LANGUAGE=fr" >> .env
    echo "CINETPAY_DEFAULT_CHANNELS=ALL" >> .env
    echo "CINETPAY_NOTIFY_URL=/payment/notify" >> .env
    echo "CINETPAY_RETURN_URL=/payment/return" >> .env
    echo "CINETPAY_TIMEOUT=30" >> .env
    echo "CINETPAY_ENABLE_LOGGING=true" >> .env
    echo "CINETPAY_ENABLE_HMAC=true" >> .env
    echo "✅ Variables CinetPay ajoutées au fichier .env"
else
    echo "✅ Variables CinetPay déjà présentes dans .env"
fi

# Vérifier si la migration pour la table payments existe
if [ ! -f "database/migrations/*_create_payments_table.php" ]; then
    echo "📊 Création de la migration pour la table payments..."
    php artisan make:migration create_payments_table
    echo "⚠️  N'oubliez pas de définir la structure de la table payments dans la migration créée"
fi

echo ""
echo "✅ Installation terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez vos clés CinetPay dans le fichier .env"
echo "2. Exécutez les migrations: php artisan migrate"
echo "3. Testez l'intégration en mode sandbox"
echo ""
echo "🔧 Variables à configurer dans .env:"
echo "   - CINETPAY_API_KEY: Votre clé API CinetPay"
echo "   - CINETPAY_SITE_ID: Votre ID de site CinetPay"
echo "   - CINETPAY_SECRET_KEY: Votre clé secrète CinetPay"
echo ""
echo "📚 Documentation: https://cinetpay.com/docs"
