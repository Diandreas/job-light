<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use App\Models\JobPosting;
use App\Models\User;

class JobPortalSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Créer quelques entreprises de test
        $companies = [
            [
                'name' => 'TechCorp Innovation',
                'email' => 'rh@techcorp.com',
                'industry' => 'Technologie',
                'description' => 'Startup innovante spécialisée dans l\'IA et le machine learning',
                'website' => 'https://techcorp.com',
                'type' => 'client',
                'subscription_type' => 'professional',
                'subscription_expires_at' => now()->addMonth(),
                'can_post_jobs' => true,
                'can_access_profiles' => true,
                'job_posting_limit' => 20
            ],
            [
                'name' => 'Archives Nationales',
                'email' => 'recrutement@archives.gouv.fr',
                'industry' => 'Culture et Patrimoine',
                'description' => 'Institution publique dédiée à la conservation du patrimoine documentaire',
                'website' => 'https://archives.gouv.fr',
                'type' => 'client',
                'subscription_type' => 'basic',
                'subscription_expires_at' => now()->addMonth(),
                'can_post_jobs' => true,
                'can_access_profiles' => false,
                'job_posting_limit' => 5
            ],
            [
                'name' => 'Digital Marketing Pro',
                'email' => 'jobs@digitalmarketing.fr',
                'industry' => 'Marketing Digital',
                'description' => 'Agence de marketing digital en pleine croissance',
                'type' => 'client',
                'subscription_type' => 'professional',
                'subscription_expires_at' => now()->addMonth(),
                'can_post_jobs' => true,
                'can_access_profiles' => true,
                'job_posting_limit' => 20
            ]
        ];

        $createdCompanies = [];
        foreach ($companies as $companyData) {
            $company = Company::create($companyData);
            $createdCompanies[] = $company;
        }

        // Créer des offres d'emploi de test
        $jobPostings = [
            [
                'company_id' => $createdCompanies[0]->id, // TechCorp
                'title' => 'Développeur Full-Stack Senior',
                'description' => 'Nous recherchons un développeur full-stack expérimenté pour rejoindre notre équipe d\'innovation. Vous travaillerez sur des projets d\'IA cutting-edge et contribuerez à l\'architecture de nos solutions SaaS.

Responsabilités :
• Développement d\'applications web modernes (React, Node.js)
• Conception et implémentation d\'APIs REST
• Collaboration avec l\'équipe data science
• Optimisation des performances et scalabilité
• Mentoring des développeurs junior

Technologies utilisées :
• Frontend: React, TypeScript, Tailwind CSS
• Backend: Node.js, Python, PostgreSQL
• Cloud: AWS, Docker, Kubernetes
• IA/ML: TensorFlow, PyTorch',
                'requirements' => '• 5+ années d\'expérience en développement web
• Maîtrise de React et Node.js
• Expérience avec les bases de données relationnelles
• Connaissance des pratiques DevOps
• Anglais technique fluide
• Bonus: Expérience en IA/ML',
                'location' => 'Paris, France',
                'employment_type' => 'full-time',
                'experience_level' => 'senior',
                'salary_min' => 55000,
                'salary_max' => 70000,
                'salary_currency' => 'EUR',
                'remote_work' => true,
                'industry' => 'Technologie',
                'skills_required' => ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
                'application_deadline' => now()->addMonth(),
                'status' => 'published',
                'featured' => true
            ],
            [
                'company_id' => $createdCompanies[1]->id, // Archives Nationales
                'title' => 'Archiviste Numérique',
                'description' => 'Rejoignez notre équipe de numérisation du patrimoine documentaire français. Vous participerez à la préservation et à la valorisation de documents historiques uniques.

Missions principales :
• Numérisation de documents anciens et fragiles
• Catalogage et indexation selon les normes internationales
• Gestion des métadonnées et standards Dublin Core
• Formation des équipes aux outils numériques
• Collaboration avec les chercheurs et le public

Projets en cours :
• Numérisation des archives de la Révolution française
• Mise en ligne de la correspondance de personnalités historiques
• Développement d\'outils de recherche sémantique',
                'requirements' => '• Master en archivistique ou sciences de l\'information
• Expérience en numérisation patrimoniale
• Maîtrise des standards de métadonnées (EAD, Dublin Core)
• Connaissance des logiciels de gestion documentaire
• Sensibilité au patrimoine historique
• Rigueur et attention aux détails',
                'location' => 'Pierrefitte-sur-Seine, France',
                'employment_type' => 'full-time',
                'experience_level' => 'mid',
                'salary_min' => 35000,
                'salary_max' => 42000,
                'salary_currency' => 'EUR',
                'remote_work' => false,
                'industry' => 'Archives et Documentation',
                'skills_required' => ['Archivage', 'Numérisation', 'Catalogage', 'EAD', 'Dublin Core'],
                'application_deadline' => now()->addWeeks(3),
                'status' => 'published',
                'auto_notify_members' => true,
                'target_associations' => ['apidca']
            ],
            [
                'company_id' => $createdCompanies[2]->id, // Digital Marketing Pro
                'title' => 'Chef de Projet Marketing Digital',
                'description' => 'Pilotez des campagnes marketing innovantes pour nos clients prestigieux. Vous gérerez des budgets importants et dirigerez une équipe de spécialistes.

Vos missions :
• Stratégie et pilotage de campagnes multi-canaux
• Gestion d\'équipes créatives et techniques
• Analyse de performance et ROI
• Relation client et présentation de résultats
• Veille concurrentielle et innovation

Nos clients :
• E-commerce (fashion, tech, lifestyle)
• SaaS B2B et B2C
• Startups en hypercroissance
• Grands comptes traditionnels en transformation',
                'requirements' => '• 3-5 ans d\'expérience en marketing digital
• Maîtrise des plateformes publicitaires (Google, Meta, LinkedIn)
• Expérience en management d\'équipe
• Excellentes capacités de présentation
• Créativité et esprit analytique
• Anglais courant pour clients internationaux',
                'location' => 'Lyon, France',
                'employment_type' => 'full-time',
                'experience_level' => 'mid',
                'salary_min' => 45000,
                'salary_max' => 55000,
                'salary_currency' => 'EUR',
                'remote_work' => true,
                'industry' => 'Marketing Digital',
                'skills_required' => ['Google Ads', 'Facebook Ads', 'Analytics', 'Management', 'Stratégie'],
                'application_deadline' => now()->addWeeks(2),
                'status' => 'published'
            ],
            [
                'company_id' => $createdCompanies[0]->id, // TechCorp
                'title' => 'Stage - Développeur IA Junior',
                'description' => 'Rejoignez notre équipe R&D pour un stage de 6 mois dans le domaine de l\'intelligence artificielle. Parfait pour débuter votre carrière dans la tech !

Ce que vous allez faire :
• Développement de modèles de machine learning
• Intégration d\'APIs d\'IA (OpenAI, Mistral, etc.)
• Tests et validation de modèles
• Documentation technique
• Participation aux code reviews

Environnement de travail :
• Équipe jeune et dynamique
• Dernières technologies
• Formation continue
• Mentorat personnalisé
• Possibilité d\'embauche à la fin du stage',
                'requirements' => '• Étudiant en informatique, IA ou data science
• Bases en Python et machine learning
• Curiosité pour les nouvelles technologies
• Capacité d\'apprentissage rapide
• Esprit d\'équipe et autonomie',
                'location' => 'Paris, France',
                'employment_type' => 'internship',
                'experience_level' => 'entry',
                'salary_min' => 800,
                'salary_max' => 1200,
                'salary_currency' => 'EUR',
                'remote_work' => true,
                'industry' => 'Technologie',
                'skills_required' => ['Python', 'Machine Learning', 'Git', 'APIs'],
                'application_deadline' => now()->addWeeks(4),
                'status' => 'published'
            ]
        ];

        // Créer les offres
        foreach ($jobPostings as $jobData) {
            JobPosting::create($jobData);
        }

        $this->command->info('Job Portal seeded successfully!');
        $this->command->info('Created: ' . count($createdCompanies) . ' companies');
        $this->command->info('Created: ' . count($jobPostings) . ' job postings');
    }
}