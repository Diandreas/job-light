<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $cvInformation['personalInformation']['firstName'] ?? 'CV' }} - CV</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">

    <style>
        body {
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        @page {
            margin: 0;
            size: A4;
        }

        @media print {
            body {
                padding: 0;
                margin: 0;
                background: white;
            }
            #printButton {
                display: none !important;
            }
            .cv-container {
                box-shadow: none;
                margin: 0;
                max-width: none;
            }
        }

        /* Uniquement affiché en mode écran */
        @media screen {
            #printButton {
                position: fixed;
                bottom: 30px;
                right: 30px;
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
            }

            #printButton:hover {
                background: var(--primary-dark, #1976D2);
            }
        }
    </style>

    @stack('styles')

    <script>
        window.onload = function() {
            if ({{ $showPrintButton ? 'true' : 'false' }}) {
                const button = document.createElement('button');
                button.id = 'printButton';
                button.innerHTML = `
            <i class="bi bi-printer"></i>
            Imprimer CV
        `;
                button.onclick = function() {
                    window.print();
                };
                document.body.appendChild(button);

                setTimeout(function() {
                    window.print();
                }, 1000);
            }
        };

        window.onbeforeprint = function() {
            const printButton = document.getElementById('printButton');
            if (printButton) {
                printButton.style.display = 'none';
                setTimeout(function() {
                    printButton.style.display = 'block';
                }, 1000);
            }
        };
    </script>
</head>
<body>
@yield('content')
</body>
</html>
