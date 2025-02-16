<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet" media="all">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" media="all">

    <style>
        :root {
            --primary: #2196F3;
            --primary-dark: #1976D2;
            --text: #2c3e50;
            --text-light: #718096;
            --gradient: linear-gradient(135deg, var(--primary), var(--primary-dark));
        }

        body {
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        @page {
            margin: 7mm !important;
            size: A4;
        }

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

            #translateButton {
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

            .floating-button {
                display: none !important;
            }

            .cv-container {
                width: 196mm !important;
                min-height: 283mm !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none;
            }
        }

        /* Cacher les éléments de Google Translate */
        .goog-te-banner-frame {
            display: none !important;
        }

        .goog-te-spinner-pos {
            display: none !important;
        }
    </style>

    <script>
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'fr',
                includedLanguages: 'en,fr',
                autoDisplay: false,
            }, 'google_translate_element');
        }

        function setupButtons() {
            // Bouton d'impression
            const printButton = document.createElement('button');
            printButton.id = 'printButton';
            printButton.className = 'floating-button';
            printButton.innerHTML = '<i class="bi bi-printer"></i> Imprimer CV';
            printButton.onclick = () => window.print();
            document.body.appendChild(printButton);

            // Bouton de traduction
            const translateButton = document.createElement('button');
            translateButton.id = 'translateButton';
            translateButton.className = 'floating-button';
            translateButton.innerHTML = '<i class="bi bi-translate"></i> EN';

            translateButton.onclick = function() {
                const isEnglish = document.documentElement.lang === 'en';
                const elements = document.querySelectorAll('.translate-this');

                if (isEnglish) {
                    // Retour au français
                    elements.forEach(el => {
                        if (el.getAttribute('data-original')) {
                            el.textContent = el.getAttribute('data-original');
                        }
                    });
                    document.documentElement.lang = 'fr';
                    translateButton.innerHTML = '<i class="bi bi-translate"></i> EN';
                } else {
                    // Traduction vers l'anglais
                    const translateService = google.translate.TranslateElement;
                    elements.forEach(el => {
                        // Sauvegarde du texte français
                        el.setAttribute('data-original', el.textContent);

                        // Création d'un conteneur temporaire pour la traduction
                        const tempDiv = document.createElement('div');
                        tempDiv.textContent = el.textContent;
                        document.body.appendChild(tempDiv);

                        // Traduction du conteneur temporaire
                        translateService.getInstance().translateElement(tempDiv, 'fr', 'en');

                        // Observer les changements
                        const observer = new MutationObserver((mutations) => {
                            el.textContent = tempDiv.textContent;
                            document.body.removeChild(tempDiv);
                            observer.disconnect();
                        });

                        observer.observe(tempDiv, {
                            characterData: true,
                            childList: true,
                            subtree: true
                        });
                    });

                    document.documentElement.lang = 'en';
                    translateButton.innerHTML = '<i class="bi bi-translate"></i> FR';
                }
            };

            document.body.appendChild(translateButton);
        }

        // Attendre que Google Translate soit chargé
        function waitForGoogleTranslate(callback) {
            if (window.google && window.google.translate) {
                callback();
            } else {
                setTimeout(() => waitForGoogleTranslate(callback), 100);
            }
        }

        window.onload = function() {
            waitForGoogleTranslate(setupButtons);
        };
    </script>
    <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</head>
<body>
@yield('content')
<div id="google_translate_element" style="display: none;"></div>
</body>
</html>
