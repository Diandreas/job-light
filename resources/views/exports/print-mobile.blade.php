<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} - Impression Mobile</title>
    <style>
        /* Reset et base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
            font-size: 16px;
        }

        /* Styles d'impression optimisés mobile */
        @media print {
            body {
                padding: 10px;
                font-size: 12px;
            }

            .no-print {
                display: none !important;
            }

            .page-break {
                page-break-before: always;
            }

            h1, h2, h3 {
                page-break-after: avoid;
            }

            .message-block {
                page-break-inside: avoid;
                break-inside: avoid;
            }
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3366cc;
        }

        .header h1 {
            font-size: 28px;
            color: #3366cc;
            margin-bottom: 10px;
        }

        .header .meta {
            color: #666;
            font-size: 14px;
        }

        /* Boutons d'action mobile (non imprimés) */
        .action-buttons {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 12px 20px;
            background: #3366cc;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: background 0.2s;
        }

        .btn:hover {
            background: #2c5aa0;
        }

        .btn.secondary {
            background: #28a745;
        }

        .btn.secondary:hover {
            background: #218838;
        }

        /* Messages */
        .messages {
            max-width: 800px;
            margin: 0 auto;
        }

        .message-block {
            margin-bottom: 25px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ddd;
        }

        .message-block.user {
            background: #f8f9fa;
            border-left-color: #3366cc;
            margin-left: 40px;
        }

        .message-block.assistant {
            background: #fff5f5;
            border-left-color: #ff6b35;
            margin-right: 40px;
        }

        .message-header {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .message-header.user {
            color: #3366cc;
        }

        .message-header.assistant {
            color: #ff6b35;
        }

        .message-content {
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.8;
        }

        .timestamp {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
            font-style: italic;
        }

        /* Responsive */
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }

            .message-block.user {
                margin-left: 20px;
            }

            .message-block.assistant {
                margin-right: 20px;
            }

            .header h1 {
                font-size: 24px;
            }

            .action-buttons {
                position: relative;
                top: auto;
                right: auto;
                margin-bottom: 20px;
                justify-content: center;
            }
        }

        /* Animation pour le chargement */
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Support pour les thèmes sombres */
        @media (prefers-color-scheme: dark) {
            body {
                background: #1a1a1a;
                color: #e0e0e0;
            }

            .message-block.user {
                background: #2a2a2a;
            }

            .message-block.assistant {
                background: #2a1f1f;
            }
        }
    </style>
</head>
<body>
<!-- Boutons d'action (masqués à l'impression) -->
@if($showSaveButton)
    <div class="action-buttons no-print">
        <button class="btn" onclick="window.print()">
            🖨️ Imprimer / Sauvegarder PDF
        </button>
        <button class="btn secondary" onclick="shareDocument()">
            📤 Partager
        </button>
    </div>
@endif

<!-- Header du document -->
<header class="header fade-in">
    <h1>{{ $title }}</h1>
    <div class="meta">
        <div><strong>Service:</strong> {{ $service }}</div>
        <div><strong>Date:</strong> {{ $date }}</div>
        <div><strong>Généré via:</strong> Guidy Assistant IA</div>
    </div>
</header>

<!-- Messages de conversation -->
<main class="messages">
    @foreach($content as $index => $message)
        <div class="message-block {{ $message['role'] }} fade-in" style="animation-delay: {{ $index * 0.1 }}s">
            <div class="message-header {{ $message['role'] }}">
                {{ $message['role'] === 'user' ? '👤 Vous' : '🤖 Assistant IA' }}
            </div>
            <div class="message-content">{{ $message['content'] }}</div>
            @if(isset($message['timestamp']))
                <div class="timestamp">
                    {{ \Carbon\Carbon::parse($message['timestamp'])->format('d/m/Y H:i') }}
                </div>
            @endif
        </div>
    @endforeach
</main>

<!-- Footer -->
<footer class="no-print" style="margin-top: 40px; text-align: center; color: #999; font-size: 14px;">
    <p>Document généré par Guidy - Assistant IA pour votre carrière</p>
    <p>🌐 <a href="https://votre-domaine.com" style="color: #3366cc;">votre-domaine.com</a></p>
</footer>

<script>
    // Script pour l'impression automatique
    @if($autoPrint)
    window.addEventListener('load', function() {
        setTimeout(function() {
            window.print();
        }, 1000);
    });
    @endif

    // Fonction de partage pour mobile
    function shareDocument() {
        if (navigator.share) {
            navigator.share({
                title: '{{ $title }}',
                text: 'Conversation IA générée via Guidy',
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback : copier l'URL
            navigator.clipboard.writeText(window.location.href).then(function() {
                alert('Lien copié dans le presse-papier');
            });
        }
    }

    // Optimisation pour les appareils tactiles
    document.addEventListener('DOMContentLoaded', function() {
        // Ajouter des gestes tactiles si nécessaire
        let touchStartY = 0;

        document.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', function(e) {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            // Geste vers le haut pour imprimer
            if (diff > 100) {
                window.print();
            }
        });
    });

    // Détection de Median et adaptation
    if (navigator.userAgent.toLowerCase().includes('median') ||
        navigator.userAgent.toLowerCase().includes('gonative')) {

        // Optimisations spécifiques pour Median
        document.body.style.paddingTop = '20px';

        // Masquer certains éléments si dans l'app
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons && window.location.search.includes('hide_buttons=true')) {
            actionButtons.style.display = 'none';
        }
    }

    // Support pour les raccourcis clavier
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'p':
                    e.preventDefault();
                    window.print();
                    break;
                case 's':
                    e.preventDefault();
                    window.print(); // Sauvegarder via impression
                    break;
            }
        }
    });
</script>
</body>
</html>
