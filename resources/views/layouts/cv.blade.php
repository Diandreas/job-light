<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <style>
        @page {
            size: A4;
            margin: 12mm; !important;
        }

        body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: "DejaVu Sans", Arial, sans-serif;
            line-height: 1.4;
            color: #333333;
        }

        @media screen {
            body {
                background: #f5f5f5;
                padding: 20px;
            }

            .floating-button {
                position: fixed;
                padding: 12px 24px;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                bottom: 30px;
            }

            #printButton {
                right: 30px;
            }

            #languageButton {
                right: 180px;
            }
        }

        @media print {
            body {
                width: 210mm;
                height: 297mm;
            }

            .floating-button {
                display: none !important;
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
                langButton.textContent = nextLang;
            }
        }

        window.onload = function() {
            if ({{ $showPrintButton ? 'true' : 'false' }}) {
                const printButton = document.createElement('button');
                printButton.id = 'printButton';
                printButton.className = 'floating-button';
                printButton.textContent = getCurrentLanguage() === 'fr' ? 'Imprimer CV' : 'Print CV';
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
    </script>
</head>
<body>
@yield('content')
</body>
</html>
