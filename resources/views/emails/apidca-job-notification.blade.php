<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle opportunité archives - APIDCA</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .apidca-badge {
            background: white;
            color: #1e40af;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 10px;
            border: 2px solid #f59e0b;
        }
        .content {
            padding: 25px;
        }
        .job-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #1e40af;
        }
        .job-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 8px;
        }
        .job-company {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 5px;
        }
        .job-location {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .job-description {
            color: #2d3748;
            line-height: 1.5;
            margin-bottom: 15px;
        }
        .job-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        .meta-item {
            background: #e2e8f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            color: #4a5568;
        }
        .cta-button {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-1px);
        }
        .footer {
            background: #f7fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
        }
        .guidy-branding {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e2e8f0;
        }
        .unsubscribe {
            margin-top: 10px;
        }
        .unsubscribe a {
            color: #718096;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="apidca-badge">APIDCA MEMBRE</div>
            <h1 style="margin: 0; font-size: 24px;">Nouvelle Opportunité Archives</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Offre spécialement sélectionnée pour vous</p>
        </div>

        <!-- Contenu principal -->
        <div class="content">
            <p>Bonjour <strong>{{ $member->name }}</strong>,</p>
            
            <p>Une nouvelle opportunité professionnelle dans le domaine des archives vient d'être publiée et correspond à votre profil APIDCA :</p>

            <div class="job-card">
                <div class="job-title">{{ $job->title }}</div>
                <div class="job-company">{{ $job->company->name }}</div>
                @if($job->location)
                    <div class="job-location">📍 {{ $job->location }}</div>
                @endif

                <div class="job-meta">
                    <span class="meta-item">{{ ucfirst($job->employment_type) }}</span>
                    @if($job->experience_level)
                        <span class="meta-item">{{ ucfirst($job->experience_level) }}</span>
                    @endif
                    @if($job->remote_work)
                        <span class="meta-item">Télétravail possible</span>
                    @endif
                    @if($job->salary_min && $job->salary_max)
                        <span class="meta-item">{{ number_format($job->salary_min) }} - {{ number_format($job->salary_max) }} {{ $job->salary_currency }}</span>
                    @endif
                </div>

                <div class="job-description">
                    {{ Str::limit($job->description, 300) }}
                </div>

                @if($job->application_deadline)
                    <p style="color: #e53e3e; font-weight: bold; font-size: 14px;">
                        ⏰ Date limite : {{ $job->application_deadline->format('d/m/Y') }}
                    </p>
                @endif

                <a href="{{ route('job-portal.show', $job->id) }}" class="cta-button">
                    Voir l'offre complète →
                </a>
            </div>

            <p><strong>Pourquoi cette offre vous est proposée :</strong></p>
            <ul style="color: #4a5568; padding-left: 20px;">
                <li>Offre dans le secteur des archives/documentation</li>
                <li>Publiée par {{ $job->company->name }}</li>
                <li>Compatible avec votre profil professionnel APIDCA</li>
            </ul>

            <div style="background: #e6fffa; border: 1px solid #38b2ac; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #234e52;"><strong>💡 Conseil Guidy :</strong></p>
                <p style="margin: 5px 0 0 0; color: #234e52;">Utilisez votre template CV APIDCA gratuit pour postuler et maximiser vos chances !</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>APIDCA - Association Professionnelle des Archivistes</strong></p>
            <p>En partenariat avec Guidy pour faciliter votre recherche d'emploi</p>
            
            <div class="guidy-branding">
                <p style="margin: 0;"><strong>Propulsé par Guidy</strong> - Votre assistant IA pour la carrière</p>
                <p style="margin: 5px 0 0 0;">
                    <a href="{{ route('welcome') }}" style="color: #f59e0b; text-decoration: none;">
                        Créer votre CV professionnel →
                    </a>
                </p>
            </div>

            <div class="unsubscribe">
                <a href="{{ route('apidca.unsubscribe', ['user' => $member->id, 'token' => hash('sha256', $member->email . $member->created_at)]) }}">
                    Se désabonner de ces notifications
                </a>
            </div>
        </div>
    </div>
</body>
</html>