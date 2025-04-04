<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guidy: Le Générateur de CV Intelligent avec Système de Jetons | 2025</title>

    <!-- Meta SEO -->
    <meta name="description" content="Découvrez Guidy, le générateur de CV avec IA avancée et système de jetons flexibles. Créez votre CV professionnel à petit prix sans abonnement coûteux.">
    <meta name="keywords" content="générateur CV, Guidy, CV professionnel, jetons CV, créer CV pas cher, CV optimisé ATS, IA CV">

    <!-- Open Graph -->
    <meta property="og:title" content="Guidy: Le Générateur de CV Intelligent avec Système de Jetons | 2025">
    <meta property="og:description" content="Créez votre CV professionnel avec Guidy grâce à notre système de jetons flexible et notre IA avancée. À partir de 1,99€ seulement!">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="{{ asset('image.png') }}">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('flavicon.ico') }}">

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            color: #333;
            line-height: 1.6;
        }

        .article-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .table-container {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 0.75rem 1rem;
            border: 1px solid #e2e8f0;
        }

        th {
            background-color: #f8fafc;
            font-weight: 600;
        }

        .highlight {
            background-color: #fef3c7;
            font-weight: 600;
        }

        .nav-link {
            color: #1e40af;
            text-decoration: none;
            transition: color 0.3s;
        }

        .nav-link:hover {
            color: #f59e0b;
        }

        .banner {
            background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
            color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            margin-bottom: 2rem;
        }

        .section-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1e293b;
            margin-top: 2.5rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #f59e0b;
        }

        .btn {
            display: inline-block;
            background-color: #f59e0b;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 600;
            text-decoration: none;
            transition: background-color 0.3s;
        }

        .btn:hover {
            background-color: #d97706;
        }

        .footer {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
        }

        .template-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .template-preview {
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            overflow: hidden;
            transition: transform 0.3s;
        }

        .template-preview:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .testimonial {
            background-color: #f8fafc;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
            border-left: 4px solid #f59e0b;
        }

        .token-card {
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.25rem;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .token-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        @media (max-width: 768px) {
            .article-container {
                padding: 1rem;
            }

            .section-title {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-md py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <a href="{{ url('/') }}" class="flex items-center">
                <img src="{{ asset('ai.png') }}" alt="Guidy Logo" class="h-10">
            </a>
            <nav class="hidden md:flex space-x-8">
                <a href="{{ url('/') }}" class="nav-link">Accueil</a>
                <a href="{{ url('/') }}" class="nav-link">Templates</a>
                <a href="{{ url('/support') }}" class="nav-link">Support</a>
                <a href="{{ route('login') }}" class="btn">Créer mon CV</a>
            </nav>
            <button class="md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    </header>

    <!-- Article Content -->
    <div class="article-container">
        <!-- Bannière d'introduction -->
        <div class="banner">
            <h1 class="text-3xl md:text-4xl font-bold mb-4">Guidy : Le Générateur de CV Intelligent</h1>
            <p class="text-xl">Créez un CV professionnel optimisé pour les ATS grâce à notre IA avancée</p>
        </div>

        <!-- Introduction -->
        <p class="text-lg mb-6">
            Guidy révolutionne la création de CV avec une approche flexible basée sur des jetons. Payez uniquement ce dont vous avez besoin, sans abonnement contraignant ! Notre IA avancée et notre optimisation ATS vous aident à créer un CV qui se démarque auprès des recruteurs.
        </p>

        <!-- Système de jetons -->
        <h2 class="section-title">Notre système de jetons flexible</h2>
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-bold mb-4 text-orange-600">Comment ça fonctionne ?</h3>
                    <p class="mb-4">Avec Guidy, vous n'avez plus besoin de payer un abonnement mensuel coûteux. Notre système de jetons vous permet de :</p>
                    <ul class="list-disc pl-6 mb-6 space-y-2">
                        <li><strong>Créer votre CV</strong> en utilisant seulement 1 jeton</li>
                        <li><strong>Exporter certains modèles</strong> sans dépenser de jetons</li>
                        <li><strong>Converser avec notre IA</strong> pour améliorer votre CV</li>
                        <li><strong>Payer uniquement</strong> pour ce que vous utilisez</li>
                    </ul>
                    <p class="font-medium">À partir de seulement <span class="text-orange-600 font-bold">1€</span> ou achetez des packs de jetons selon vos besoins !</p>
                </div>
                <div>
                    <h3 class="text-xl font-bold mb-4 text-orange-600">Nos packs de jetons</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="token-card bg-amber-50">
                            <h4 class="font-bold">Pack Starter</h4>
                            <p class="text-2xl font-bold text-amber-600">10 <span class="text-sm font-normal">jetons</span></p>
                            <p class="text-sm text-gray-600">1€ seulement</p>
                        </div>
                        <div class="token-card bg-rose-50 border-2 border-rose-400">
                            <div class="absolute top-0 right-0 bg-rose-500 text-white text-xs px-2 py-1 rounded-bl-lg">POPULAIRE</div>
                            <h4 class="font-bold">Pack Plus</h4>
                            <p class="text-2xl font-bold text-rose-600">25 <span class="text-sm font-normal">jetons</span></p>
                            <p class="text-sm text-gray-600">2€ (5 jetons offerts)</p>
                        </div>
                        <div class="token-card bg-purple-50">
                            <h4 class="font-bold">Pack Pro</h4>
                            <p class="text-2xl font-bold text-purple-600">60 <span class="text-sm font-normal">jetons</span></p>
                            <p class="text-sm text-gray-600">5€ (10 jetons offerts)</p>
                        </div>
                        <div class="token-card bg-blue-50">
                            <h4 class="font-bold">Pack Ultimate</h4>
                            <p class="text-2xl font-bold text-blue-600">130 <span class="text-sm font-normal">jetons</span></p>
                            <p class="text-sm text-gray-600">10€ (30 jetons offerts)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tableau comparatif (version réduite) -->
        <h2 class="section-title">Comparaison rapide avec d'autres solutions</h2>

        <div class="table-container mb-8">
            <table>
                <thead>
                    <tr>
                        <th>Fonctionnalités</th>
                        <th>Guidy</th>
                        <th>Autres solutions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="font-medium">Prix</td>
                        <td class="highlight">À partir de 1€ ou système de jetons (dès 1€)</td>
                        <td>Généralement 15-25€/mois avec engagement</td>
                    </tr>
                    <tr>
                        <td class="font-medium">Flexibilité de paiement</td>
                        <td class="highlight">Système de jetons à la demande</td>
                        <td>Abonnement mensuel avec engagement</td>
                    </tr>
                    <tr>
                        <td class="font-medium">Assistance IA</td>
                        <td class="highlight">Avancée et personnalisée</td>
                        <td>Basique à standard</td>
                    </tr>
                    <tr>
                        <td class="font-medium">Optimisation ATS</td>
                        <td class="highlight">Sur tous les modèles</td>
                        <td>Limitée ou sur certains modèles</td>
                    </tr>
                    <tr>
                        <td class="font-medium">Accompagnement carrière</td>
                        <td class="highlight">Préparation entretien et coaching</td>
                        <td>Ressources génériques</td>
                    </tr>
                    <tr>
                        <td class="font-medium">Filigranes sur version d'essai</td>
                        <td class="highlight">Non</td>
                        <td>Souvent présents</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Galerie de  -->
        <h2 class="section-title">Notre galerie de  optimisés ATS</h2>

        <div class="text-center mb-8">
            <a href="{{ url('/') }}" class="btn">Voir tous nos </a>
        </div>

        <!-- Exemples avant/après avec images réelles -->

            <h3 class="text-xl font-bold mb-4 mt-8">Exemples de CV avec données réelles</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <h4 class="font-semibold mb-2 text-blue-700">Design professionnel rose</h4>
                    <div class="border border-blue-200 rounded overflow-hidden shadow-sm">
                        <img src="{{ asset('cv/1.png') }}" alt="CV professionnel rose" class="w-full h-auto">
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 text-green-700">Design orange et noir</h4>
                    <div class="border border-green-200 rounded overflow-hidden shadow-sm">
                        <img src="{{ asset('cv/2.png') }}" alt="CV orange et noir" class="w-full h-auto">
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <h4 class="font-semibold mb-2 text-indigo-700">Design bleu marine</h4>
                    <div class="border border-indigo-200 rounded overflow-hidden shadow-sm">
                        <img src="{{ asset('cv/3.png') }}" alt="CV bleu marine" class="w-full h-auto">
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 text-purple-700">Design noir et blanc</h4>
                    <div class="border border-purple-200 rounded overflow-hidden shadow-sm">
                        <img src="{{ asset('cv/4.png') }}" alt="CV noir et blanc" class="w-full h-auto">
                    </div>
                </div>
                <div>
                    <h4 class="font-semibold mb-2 text-cyan-700">Design bleu clair</h4>
                    <div class="border border-cyan-200 rounded overflow-hidden shadow-sm">
                        <img src="{{ asset('cv/5.png') }}" alt="CV bleu clair" class="w-full h-auto">
                    </div>
                </div>
            </div>
        </div>

        <!-- Guidy en détail -->
        <h2 class="section-title">Guidy en détail : La solution intelligente pour votre CV</h2>

        <div class="mb-8">
            <div class="flex flex-col md:flex-row gap-6">
                <div class="md:w-2/3">
                    <h4 class="font-semibold mb-2">Nos principaux atouts :</h4>
                    <ul class="list-disc pl-6 mb-4">
                        <li><strong>Système de jetons flexible</strong> : payez uniquement ce que vous utilisez</li>
                        <li><strong>Intelligence artificielle avancée</strong> qui analyse votre profil et suggère des améliorations pertinentes</li>
                        <li><strong>Optimisation ATS garantie</strong> sur tous les modèles pour maximiser vos chances</li>
                        <li><strong>Assistant de carrière intégré</strong> avec préparation aux entretiens</li>
                        <li><strong>Interface intuitive</strong> pour une création rapide et efficace</li>
                    </ul>
                    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                        <h5 class="font-semibold mb-2">Comment utiliser vos jetons ?</h5>
                        <ul class="text-sm space-y-1">
                            <li>• Créer un nouveau CV : 1 jeton</li>
                            <li>• Exporter en PDF haute qualité : 1 jeton</li>
                            <li>• Conversation avec l'IA pour améliorer votre profil : à partir de 1 jeton</li>
                            <li>• Certains  de base gratuits (0 jeton)</li>
                        </ul>
                    </div>
                </div>
                <div class="md:w-1/3 bg-orange-50 p-4 rounded-lg flex flex-col items-center justify-center">
                    <span class="text-2xl font-bold text-orange-600 mb-2">À partir de 1€</span>
                    <p class="text-center text-sm text-gray-600 mb-2">ou achetez des jetons à l'unité</p>
                    <p class="text-center text-sm text-gray-600 mb-4">Formule complète sans fonctionnalités cachées</p>
                    <a href="{{ url('/') }}" class="btn mt-2">Essayer maintenant</a>
                </div>
            </div>
        </div>

        <!-- Témoignages -->
        <div class="mb-8">
            <h3 class="text-xl font-bold mb-4">Ce que nos utilisateurs disent</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="testimonial">
                    <p class="italic mb-2">"J'ai décroché un entretien une semaine après avoir utilisé Guidy. L'optimisation ATS a vraiment fait la différence et j'ai dépensé moins de 2€ pour tout mon CV!"</p>
                    <p class="text-right text-gray-600">- Marie L., Ingénieure</p>
                </div>
                <div class="testimonial">
                    <p class="italic mb-2">"Les suggestions de l'IA m'ont aidé à améliorer la formulation de mes expériences professionnelles. Le système de jetons est très économique pour moi qui ne cherche pas souvent."</p>
                    <p class="text-right text-gray-600">- Thomas D., Commercial</p>
                </div>
            </div>
        </div>

        <!-- Comment fonctionne l'optimisation ATS -->
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 class="text-xl font-bold mb-4">Comment fonctionne l'optimisation ATS chez Guidy</h3>
            <div class="flex flex-col md:flex-row gap-6">
                <div class="md:w-1/2">
                    <p class="mb-4">Notre technologie d'optimisation ATS (Applicant Tracking System) analyse les offres d'emploi pour identifier les mots-clés pertinents et vous aide à les intégrer naturellement dans votre CV.</p>
                    <ol class="list-decimal pl-6 mb-4">
                        <li class="mb-2">Analyse de la description du poste</li>
                        <li class="mb-2">Extraction des compétences et termes critiques</li>
                        <li class="mb-2">Suggestions d'intégration dans votre CV</li>
                        <li class="mb-2">Vérification de la lisibilité pour les systèmes automatisés</li>
                    </ol>
                </div>
                <div class="md:w-1/2 bg-gray-50 p-4 rounded-lg">
                    <div class="h-full flex items-center justify-center">
                        <p class="text-center text-gray-600">Illustration du processus d'optimisation ATS</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- FAQ Structurée -->
        <h2 class="section-title">Questions fréquentes</h2>
        <div class="mb-8">
            <div class="bg-white rounded-lg shadow-sm mb-4">
                <button class="w-full text-left p-4 font-semibold">Comment fonctionne le système de jetons de Guidy ?</button>
                <div class="p-4 pt-0">
                    <p>Notre système de jetons vous permet de payer uniquement ce que vous utilisez. Vous pouvez acheter des packs de jetons à partir de 1€ pour 10 jetons, ou opter pour un abonnement à 1€ qui vous donne accès à un certain nombre de jetons mensuels. Chaque action (création de CV, export, consultation IA) coûte un nombre défini de jetons.</p>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm mb-4">
                <button class="w-full text-left p-4 font-semibold">Les jetons expirent-ils ?</button>
                <div class="p-4 pt-0">
                    <p>Non, vos jetons restent valables sans limite de temps. Vous pouvez les utiliser quand vous en avez besoin, ce qui est idéal si vous ne cherchez pas un emploi régulièrement.</p>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-sm mb-4">
                <button class="w-full text-left p-4 font-semibold">Comment l'IA de Guidy améliore-t-elle mon CV ?</button>
                <div class="p-4 pt-0">
                    <p>Notre IA analyse votre profil et le poste visé pour suggérer des améliorations de formulation, mettre en valeur vos compétences clés et optimiser la structure globale de votre CV pour maximiser votre impact auprès des recruteurs et des systèmes ATS.</p>
                </div>
            </div>
        </div>

        <!-- Conclusion -->
        <h2 class="section-title">Pourquoi choisir Guidy ?</h2>

        <div class="bg-orange-50 p-6 rounded-lg mb-8">
            <h3 class="text-xl font-semibold mb-4 text-orange-700">Les avantages distinctifs de Guidy</h3>
            <ul class="space-y-4">
                <li class="flex items-start">
                    <svg class="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Flexibilité financière</strong> : Avec notre système de jetons, vous ne payez que ce dont vous avez besoin. Idéal si vous ne cherchez pas un emploi régulièrement.</span>
                </li>
                <li class="flex items-start">
                    <svg class="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Intelligence artificielle avancée</strong> : Notre IA analyse votre profil pour proposer des améliorations pertinentes et personnalisées qui augmentent significativement vos chances d'être retenu.</span>
                </li>
                <li class="flex items-start">
                    <svg class="h-6 w-6 text-orange-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Approche intégrée de la carrière</strong> : Guidy va au-delà de la simple création de CV en offrant un véritable accompagnement pour la préparation aux entretiens d'embauche.</span>
                </li>
            </ul>
        </div>

        <!-- Call to Action -->
        <div class="bg-blue-50 p-6 rounded-lg mb-12 text-center">
            <h3 class="text-xl font-semibold mb-4 text-blue-700">Prêt à créer votre CV professionnel ?</h3>
            <p class="mb-6 text-lg">
                Rejoignez les milliers d'utilisateurs qui ont déjà trouvé leur emploi idéal grâce à Guidy !
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="{{ url('/') }}" class="btn text-lg px-8 py-3">Créer mon CV gratuitement</a>
                <a href="{{ url('/tokens') }}" class="btn bg-green-600 hover:bg-green-700 text-lg px-8 py-3">Acheter des jetons dès 1€</a>
            </div>
            <p class="text-sm text-gray-600 mt-4">Essai sans engagement. Annulation possible à tout moment.</p>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="mb-4 md:mb-0">
                    <img src="{{ asset('ai.png') }}" alt="Guidy Logo" class="h-8">
                    <p class="mt-2 text-sm">© {{ date('Y') }} Guidy. Tous droits réservés.</p>
                </div>
                <div class="flex space-x-6">
                    <a href="{{ url('/privacy') }}" class="text-sm text-gray-500 hover:text-gray-700">Confidentialité</a>
                    <a href="{{ url('/terms') }}" class="text-sm text-gray-500 hover:text-gray-700">Conditions d'utilisation</a>
                    <a href="{{ url('/cookies') }}" class="text-sm text-gray-500 hover:text-gray-700">Cookies</a>
                    <a href="{{ url('/support') }}" class="text-sm text-gray-500 hover:text-gray-700">Support</a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>
