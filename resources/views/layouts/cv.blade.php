<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet" media="all">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" media="all">

    <style>
        body {
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        @page {
            margin: 7mm !important;
            size: A4;
        }

        /* Boutons flottants */
        @media screen {
            .floating-button {
                position: fixed;
                padding: 12px 24px;
                background: var(--primary-color, #2196F3);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 1000;
                transition: background-color 0.3s;
            }

            .floating-button:hover {
                background: var(--primary-dark, #1976D2);
            }

            #printButton {
                bottom: 30px;
                right: 30px;
            }

            #languageButton {
                bottom: 30px;
                right: 180px;
            }
        }

        @media print {
            body {
                padding: 0;
                margin: 0;
                background: white;
                width: 210mm;
                height: 297mm;
            }

            #printButton, #languageButton {
                display: none !important;
            }

            .cv-container {
                width: 196mm !important; /* 210mm - (2 * 7mm) */
                min-height: 283mm !important; /* 297mm - (2 * 7mm) */
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none;
            }
        }
    </style>

    <script>
        function getCurrentLanguage() {
            return localStorage.getItem('i18nextLng') || 'fr';
        }

        function toggleLanguage() {
            const currentLang = getCurrentLanguage();
            const newLang = currentLang === 'fr' ? 'en' : 'fr';
            localStorage.setItem('i18nextLng', newLang);
            document.documentElement.lang = newLang;
            updateLanguageButton();
            window.location.reload();
        }

        function updateLanguageButton() {
            const langButton = document.getElementById('languageButton');
            if (langButton) {
                const currentLang = getCurrentLanguage();
                const nextLang = currentLang === 'fr' ? 'EN' : 'FR';
                langButton.innerHTML = `<i class="bi bi-translate"></i> ${nextLang}`;
            }
        }

        window.onload = function() {
            // Création des boutons flottants
            if ({{ $showPrintButton ? 'true' : 'false' }}) {
                const printButton = document.createElement('button');
                printButton.id = 'printButton';
                printButton.className = 'floating-button';
                printButton.innerHTML = `<i class="bi bi-printer"></i> ${getCurrentLanguage() === 'fr' ? 'Imprimer CV' : 'Print CV'}`;
                printButton.onclick = () => window.print();
                document.body.appendChild(printButton);

                const langButton = document.createElement('button');
                langButton.id = 'languageButton';
                langButton.className = 'floating-button';
                langButton.onclick = toggleLanguage;
                document.body.appendChild(langButton);
                updateLanguageButton();
            }
        };

        window.onbeforeprint = function() {
            const buttons = document.querySelectorAll('.floating-button');
            buttons.forEach(button => button.style.display = 'none');
        };

        window.onafterprint = function() {
            const buttons = document.querySelectorAll('.floating-button');
            buttons.forEach(button => button.style.display = 'flex');
        };
    </script>
</head>
<body>
@yield('content')
</body>
</html>
