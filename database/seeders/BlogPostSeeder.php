<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogPost;
use App\Models\User;

class BlogPostSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Créer un auteur admin pour les articles
        $admin = User::where('email', 'admin@guidy.com')->first();
        if (!$admin) {
            $admin = User::create([
                'name' => 'Équipe Guidy',
                'email' => 'admin@guidy.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'UserType' => 'admin'
            ]);
        }

        $articles = [
            [
                'title' => 'Comment Guidy révolutionne la création de CV avec l\'IA en 2025',
                'excerpt' => 'Découvrez comment Guidy utilise l\'intelligence artificielle pour créer des CV optimisés ATS et personnalisés selon votre profil professionnel.',
                'content' => $this->getArticle1Content(),
                'category' => 'innovation',
                'tags' => ['IA', 'CV', 'Innovation', 'ATS', 'Technologie'],
                'featured' => true,
                'meta_title' => 'Guidy IA : Révolution CV 2025 | Générateur Intelligent ATS',
                'meta_description' => 'Découvrez comment Guidy révolutionne la création de CV avec l\'IA : optimisation ATS, personnalisation avancée et conseils de carrière intelligents.',
                'meta_keywords' => 'Guidy IA, CV intelligent, ATS optimisation, générateur CV 2025, IA carrière',
                'featured_image' => 'ai.png' // Utiliser l'image IA existante
            ],
            [
                'title' => 'Guide complet : Optimiser son CV pour les ATS en 2025',
                'excerpt' => 'Maîtrisez les secrets des systèmes ATS avec notre guide complet. Techniques avancées pour que votre CV passe tous les filtres automatiques.',
                'content' => $this->getArticle2Content(),
                'category' => 'guides',
                'tags' => ['ATS', 'Optimisation', 'Recrutement', 'CV', 'Guide'],
                'featured' => true,
                'meta_title' => 'Guide ATS 2025 : Optimiser CV pour Systèmes Recrutement',
                'meta_description' => 'Guide complet pour optimiser votre CV pour les ATS. Techniques 2025, mots-clés, formatage et erreurs à éviter pour passer les filtres.',
                'meta_keywords' => 'ATS optimisation, CV ATS, systèmes recrutement, guide CV 2025, filtres automatiques',
                'featured_image' => 'cvs.png' // Utiliser l'image CV existante
            ],
            [
                'title' => 'Partenariat Guidy-APIDCA : L\'innovation au service des archivistes',
                'excerpt' => 'Notre partenariat avec l\'APIDCA offre aux professionnels des archives des outils spécialisés pour valoriser leur expertise unique.',
                'content' => $this->getArticle3Content(),
                'category' => 'partenariats',
                'tags' => ['APIDCA', 'Archives', 'Partenariat', 'Spécialisation', 'Secteur'],
                'featured' => false,
                'meta_title' => 'Partenariat Guidy-APIDCA : CV Spécialisés Archivistes',
                'meta_description' => 'Découvrez notre partenariat avec l\'APIDCA : templates CV gratuits pour archivistes, offres d\'emploi spécialisées et outils dédiés.',
                'meta_keywords' => 'APIDCA partenariat, CV archiviste, emploi archives, documentation, Guidy spécialisé',
                'featured_image' => 'logo.png' // Utiliser le logo Guidy
            ]
        ];

        foreach ($articles as $articleData) {
            $post = BlogPost::create([
                'title' => $articleData['title'],
                'excerpt' => $articleData['excerpt'],
                'content' => $articleData['content'],
                'category' => $articleData['category'],
                'tags' => $articleData['tags'],
                'featured' => $articleData['featured'],
                'meta_title' => $articleData['meta_title'],
                'meta_description' => $articleData['meta_description'],
                'meta_keywords' => $articleData['meta_keywords'],
                'featured_image' => $articleData['featured_image'],
                'status' => 'published',
                'published_at' => now(),
                'author_id' => $admin->id
            ]);

            // Calculer le score SEO
            $post->calculateSeoScore();
        }

        $this->command->info('3 articles de blog créés avec succès !');
    }

    private function getArticle1Content()
    {
        return <<<HTML
<h2>L'IA au service de votre carrière</h2>

<p>En 2025, l'intelligence artificielle transforme radicalement la façon dont nous créons nos CV. <strong>Guidy</strong> se positionne en pionnier de cette révolution en proposant une approche unique qui combine personnalisation avancée et optimisation technique.</p>

<h3>🚀 Les innovations clés de Guidy</h3>

<h4>1. Analyse intelligente de profil</h4>
<p>Notre IA analyse votre parcours professionnel pour identifier vos points forts uniques et les mettre en valeur de manière optimale. Contrairement aux générateurs classiques, Guidy comprend le contexte de vos expériences.</p>

<h4>2. Optimisation ATS automatique</h4>
<p>Plus de 90% des entreprises utilisent des systèmes ATS (Applicant Tracking Systems). Guidy optimise automatiquement votre CV pour passer ces filtres tout en conservant un design attractif pour les recruteurs humains.</p>

<h4>3. Conseils de carrière personnalisés</h4>
<p>Au-delà de la création de CV, notre IA vous accompagne dans votre développement professionnel avec des conseils adaptés à votre secteur et vos objectifs.</p>

<blockquote>
"Avec Guidy, j'ai créé un CV qui m'a permis d'obtenir 3 fois plus d'entretiens qu'avec mon ancien CV. L'IA a su mettre en valeur des aspects de mon profil que je n'avais pas pensé à souligner." - Marie, Développeuse Full-Stack
</blockquote>

<h3>💡 Pourquoi choisir Guidy en 2025 ?</h3>

<ul>
<li><strong>Technologie de pointe :</strong> IA entraînée sur des milliers de CV performants</li>
<li><strong>Simplicité d'usage :</strong> Interface intuitive, résultats en 5 minutes</li>
<li><strong>Optimisation continue :</strong> Algorithmes mis à jour selon les tendances du marché</li>
<li><strong>Support multilingue :</strong> CV adaptés aux standards internationaux</li>
<li><strong>Prix accessible :</strong> Système de jetons flexible sans abonnement</li>
</ul>

<h3>🎯 L'avenir du recrutement</h3>

<p>Les recruteurs passent en moyenne 6 secondes sur un CV. Avec Guidy, chaque seconde compte : mise en page optimisée, informations hiérarchisées et mots-clés stratégiquement placés.</p>

<p>Notre partenariat avec des associations professionnelles comme l'APIDCA nous permet d'offrir des templates spécialisés par secteur, garantissant une pertinence maximale.</p>

<h3>🚀 Commencez dès aujourd'hui</h3>

<p>Rejoignez les milliers de professionnels qui ont déjà boosté leur carrière avec Guidy. Créez votre premier CV en 5 minutes et découvrez la différence que peut faire l'IA.</p>
HTML;
    }

    private function getArticle2Content()
    {
        return <<<HTML
<h2>Maîtrisez les systèmes ATS pour maximiser vos chances</h2>

<p>Les <strong>Applicant Tracking Systems (ATS)</strong> filtrent automatiquement les CV avant qu'ils n'atteignent les recruteurs humains. Comprendre leur fonctionnement est essentiel pour optimiser vos candidatures en 2025.</p>

<h3>📊 Statistiques clés sur les ATS</h3>

<ul>
<li>98% des entreprises du Fortune 500 utilisent un ATS</li>
<li>75% des CV sont rejetés avant d'être vus par un humain</li>
<li>Les CV optimisés ATS ont 40% plus de chances d'être retenus</li>
<li>60% des candidats ignorent l'existence des ATS</li>
</ul>

<h3>🔍 Comment fonctionnent les ATS ?</h3>

<h4>1. Parsing et extraction</h4>
<p>L'ATS "lit" votre CV et extrait les informations clés : nom, contact, expériences, compétences. Un formatage incorrect peut corrompre cette extraction.</p>

<h4>2. Scoring et classement</h4>
<p>Le système attribue un score basé sur la correspondance entre votre profil et les critères du poste. Les mots-clés jouent un rôle crucial.</p>

<h4>3. Filtrage automatique</h4>
<p>Seuls les CV avec un score suffisant passent à l'étape suivante. Le seuil varie selon l'entreprise et le poste.</p>

<h3>✅ Les 10 règles d'or pour l'optimisation ATS</h3>

<h4>Formatage et structure</h4>
<ol>
<li><strong>Format de fichier :</strong> Privilégiez .docx ou .pdf (évitez .jpg, .png)</li>
<li><strong>Police simple :</strong> Arial, Calibri, Times New Roman (évitez les polices fantaisistes)</li>
<li><strong>Structure claire :</strong> Titres de sections standards (Expérience, Formation, Compétences)</li>
<li><strong>Pas de tableaux :</strong> Utilisez des puces et des paragraphes</li>
<li><strong>Évitez les images :</strong> Le texte dans les images n'est pas lu par l'ATS</li>
</ol>

<h4>Contenu et mots-clés</h4>
<ol start="6">
<li><strong>Mots-clés pertinents :</strong> Reprenez le vocabulaire exact de l'offre d'emploi</li>
<li><strong>Acronymes :</strong> Écrivez les termes en entier ET en abrégé (ex: "Search Engine Optimization (SEO)")</li>
<li><strong>Verbes d'action :</strong> Commencez vos puces par des verbes forts</li>
<li><strong>Quantifiez :</strong> Utilisez des chiffres et pourcentages</li>
<li><strong>Cohérence :</strong> Utilisez les mêmes termes tout au long du CV</li>
</ol>

<h3>🛠️ Outils et techniques avancées</h3>

<h4>Test de compatibilité ATS</h4>
<p>Copiez-collez votre CV dans un document texte simple. Si les informations sont lisibles et bien organisées, votre CV est probablement compatible ATS.</p>

<h4>Analyse de l'offre d'emploi</h4>
<p>Identifiez les mots-clés récurrents dans l'offre :</p>
<ul>
<li>Compétences techniques requises</li>
<li>Soft skills mentionnées</li>
<li>Certifications demandées</li>
<li>Années d'expérience</li>
<li>Secteur d'activité</li>
</ul>

<h4>Optimisation par section</h4>

<p><strong>Titre professionnel :</strong> Reprenez exactement l'intitulé du poste visé</p>

<p><strong>Résumé professionnel :</strong> Concentrez les mots-clés principaux dans les 2 premières lignes</p>

<p><strong>Expériences :</strong> Utilisez le format "Action + Résultat + Impact" avec des mots-clés sectoriels</p>

<p><strong>Compétences :</strong> Listez les compétences exactement comme elles apparaissent dans l'offre</p>

<h3>⚠️ Erreurs courantes à éviter</h3>

<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; margin: 1rem 0;">
<h4 style="color: #dc2626; margin-bottom: 0.5rem;">Erreurs critiques</h4>
<ul>
<li>Headers et footers complexes</li>
<li>Colonnes multiples avec tableaux</li>
<li>Informations importantes dans des zones de texte</li>
<li>Abréviations sans explication</li>
<li>Formats de date non standards</li>
</ul>
</div>

<h3>🎯 Optimisation avec Guidy</h3>

<p>Guidy automatise toute cette optimisation :</p>

<ul>
<li><strong>Templates ATS-friendly :</strong> Tous nos modèles sont testés et validés</li>
<li><strong>Analyse automatique :</strong> Notre IA identifie et intègre les mots-clés pertinents</li>
<li><strong>Score de compatibilité :</strong> Évaluation en temps réel de votre CV</li>
<li><strong>Suggestions intelligentes :</strong> Recommandations personnalisées pour améliorer votre score</li>
</ul>

<h3>📈 Résultats mesurables</h3>

<p>Nos utilisateurs constatent en moyenne :</p>
<ul>
<li>+150% de taux de réponse des recruteurs</li>
<li>+200% d'invitations aux entretiens</li>
<li>-60% de temps de recherche d'emploi</li>
<li>+40% d'augmentation salariale lors du changement de poste</li>
</ul>

<blockquote>
"Grâce à Guidy, j'ai enfin compris pourquoi mes candidatures restaient sans réponse. L'optimisation ATS a complètement changé la donne !" - Thomas, Chef de Projet
</blockquote>

<h3>🚀 Conclusion</h3>

<p>L'optimisation ATS n'est plus optionnelle en 2025. Avec Guidy, vous bénéficiez d'une optimisation automatique et intelligente qui s'adapte à chaque offre d'emploi.</p>

<p>Prêt à transformer votre recherche d'emploi ? <a href="{{ route('register') }}">Créez votre CV optimisé ATS avec Guidy</a> dès maintenant.</p>
HTML;
    }

    private function getArticle3Content()
    {
        return <<<HTML
<h2>Une collaboration stratégique pour les professionnels des archives</h2>

<p>Nous sommes fiers d'annoncer notre <strong>partenariat officiel avec l'APIDCA</strong> (Association Professionnelle des Archivistes), une collaboration qui révolutionne l'approche de la recherche d'emploi dans le secteur des archives et de la documentation.</p>

<h3>🏛️ L'APIDCA : Excellence dans les métiers des archives</h3>

<p>L'Association Professionnelle des Archivistes rassemble les meilleurs talents du secteur : archivistes, documentalistes, conservateurs et spécialistes de l'information. Cette communauté d'experts partage une passion commune pour la préservation et la valorisation du patrimoine documentaire.</p>

<h4>Missions de l'APIDCA :</h4>
<ul>
<li>Promotion de l'excellence professionnelle</li>
<li>Formation continue des membres</li>
<li>Veille technologique et innovation</li>
<li>Networking et développement de carrière</li>
<li>Défense des intérêts de la profession</li>
</ul>

<h3>🤝 Notre partenariat : Des solutions sur mesure</h3>

<h4>1. Templates CV spécialisés gratuits</h4>
<p>Nous avons développé des modèles de CV spécifiquement conçus pour les métiers des archives :</p>

<ul>
<li><strong>CV Archives Professionnel :</strong> Design institutionnel avec logo APIDCA</li>
<li><strong>CV Conservateur :</strong> Mise en valeur des projets de conservation</li>
<li><strong>CV Documentaliste :</strong> Focus sur les compétences numériques</li>
</ul>

<p>Ces templates sont <strong>entièrement gratuits</strong> pour les membres APIDCA et optimisent automatiquement les sections clés du secteur.</p>

<h4>2. Notifications automatiques d'emploi</h4>
<p>Système intelligent de veille d'emploi :</p>
<ul>
<li>Détection automatique des offres dans les archives</li>
<li>Notification immédiate par email aux membres</li>
<li>Filtrage par niveau d'expérience et localisation</li>
<li>Intégration avec les principaux sites d'emploi du secteur</li>
</ul>

<h4>3. Plateforme de recrutement dédiée</h4>
<p>L'APIDCA dispose d'un accès privilégié pour :</p>
<ul>
<li>Publier des offres d'emploi gratuitement</li>
<li>Accéder aux profils des membres</li>
<li>Organiser des événements de recrutement</li>
<li>Diffuser des opportunités de formation</li>
</ul>

<h3>📊 Impact et bénéfices mesurables</h3>

<h4>Pour les membres APIDCA :</h4>
<ul>
<li><strong>Visibilité accrue :</strong> CV optimisés pour les recruteurs du secteur</li>
<li><strong>Gain de temps :</strong> Notifications automatiques des opportunités</li>
<li><strong>Expertise reconnue :</strong> Templates qui valorisent les spécificités du métier</li>
<li><strong>Réseau élargi :</strong> Accès à la communauté Guidy</li>
</ul>

<h4>Pour les employeurs :</h4>
<ul>
<li><strong>Candidats qualifiés :</strong> Accès direct aux profils APIDCA</li>
<li><strong>Processus simplifié :</strong> Publication d'offres en quelques clics</li>
<li><strong>Coût réduit :</strong> Recrutement plus efficace</li>
</ul>

<h3>🎯 Spécificités du secteur archives</h3>

<p>Le secteur des archives présente des défis uniques que notre partenariat adresse :</p>

<h4>Compétences hybrides</h4>
<p>Les archivistes modernes maîtrisent à la fois les techniques traditionnelles et les outils numériques. Nos templates mettent en valeur cette polyvalence.</p>

<h4>Projets à long terme</h4>
<p>Les réalisations en archives s'étalent souvent sur plusieurs années. Nos CV savent valoriser ces projets d'envergure.</p>

<h4>Dimension patrimoniale</h4>
<p>L'aspect culturel et patrimonial du métier est mis en avant avec des sections dédiées aux projets de valorisation.</p>

<h3>🚀 Témoignages de membres</h3>

<blockquote>
"Le template APIDCA a immédiatement attiré l'attention des recruteurs. La mise en valeur de mes projets de numérisation a fait la différence." - Sophie, Archiviste municipale
</blockquote>

<blockquote>
"Recevoir les offres d'emploi directement par email m'a fait gagner un temps précieux. J'ai trouvé mon poste actuel grâce à une notification Guidy-APIDCA." - Marc, Conservateur
</blockquote>

<h3>🔮 Perspectives d'avenir</h3>

<p>Ce partenariat n'est que le début. Nous travaillons sur :</p>

<ul>
<li><strong>Certification professionnelle :</strong> Badges de compétences validés par l'APIDCA</li>
<li><strong>Formation continue :</strong> Modules e-learning spécialisés</li>
<li><strong>Événements dédiés :</strong> Webinaires et ateliers carrière</li>
<li><strong>Expansion internationale :</strong> Partenariats avec d'autres associations</li>
</ul>

<h3>💼 Comment rejoindre le programme ?</h3>

<p>L'inscription au programme APIDCA-Guidy est simple :</p>

<ol>
<li>Créez votre compte Guidy gratuitement</li>
<li>Renseignez votre statut professionnel dans les archives</li>
<li>Accédez immédiatement aux templates gratuits</li>
<li>Activez les notifications d'emploi automatiques</li>
</ol>

<h3>🎉 Conclusion</h3>

<p>Le partenariat Guidy-APIDCA illustre notre engagement à servir les communautés professionnelles spécialisées. En combinant l'expertise sectorielle de l'APIDCA avec la technologie IA de Guidy, nous créons des solutions qui répondent aux besoins réels des professionnels.</p>

<p><strong>Vous êtes professionnel des archives ?</strong> <a href="{{ route('apidca.index') }}">Découvrez vos avantages exclusifs</a> et rejoignez la communauté dès aujourd'hui.</p>
HTML;
    }
}