<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $statusMessage['email_subject'] }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            @if($application->status === 'shortlisted' || $application->status === 'hired')
                background: linear-gradient(135deg, #10b981, #3b82f6);
            @elseif($application->status === 'rejected')
                background: linear-gradient(135deg, #ef4444, #f97316);
            @else
                background: linear-gradient(135deg, #f59e0b, #8b5cf6);
            @endif
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #fff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .status-card {
            @if($application->status === 'shortlisted' || $application->status === 'hired')
                background: #ecfdf5;
                border: 1px solid #10b981;
            @elseif($application->status === 'rejected')
                background: #fef2f2;
                border: 1px solid #ef4444;
            @else
                background: #f9fafb;
                border: 1px solid #f59e0b;
            @endif
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .job-info {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .cta-button {
            background: linear-gradient(135deg, #f59e0b, #8b5cf6);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            display: inline-block;
            font-weight: 500;
            margin: 20px 0;
        }
        .footer {
            background: #f3f4f6;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e7eb;
            border-top: none;
            font-size: 14px;
            color: #6b7280;
        }
        .status-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="status-icon">
            @if($application->status === 'shortlisted' || $application->status === 'hired')
                🎉
            @elseif($application->status === 'rejected')
                💙
            @elseif($application->status === 'reviewed')
                👀
            @else
                📋
            @endif
        </div>
        <h1>{{ $statusMessage['title'] }}</h1>
        <p>Mise à jour de votre candidature</p>
    </div>

    <div class="content">
        <p>Bonjour {{ $user->name }},</p>
        
        <div class="status-card">
            <h3 style="margin-top: 0;">{{ $statusMessage['body'] }}</h3>
            
            @if($application->status === 'shortlisted')
                <p>
                    <strong>Félicitations !</strong> Votre profil a retenu l'attention de l'employeur. 
                    Vous pourriez être contacté(e) prochainement pour la suite du processus de recrutement.
                </p>
            @elseif($application->status === 'hired')
                <p>
                    <strong>Excellent !</strong> Vous avez été sélectionné(e) pour ce poste ! 
                    L'employeur devrait vous contacter très bientôt pour finaliser les détails.
                </p>
            @elseif($application->status === 'rejected')
                <p>
                    Bien que votre candidature n'ait pas été retenue cette fois-ci, nous vous encourageons 
                    à continuer vos recherches. De nouvelles opportunités correspondant à votre profil 
                    sont publiées régulièrement.
                </p>
            @elseif($application->status === 'reviewed')
                <p>
                    Votre candidature a été examinée par l'employeur. Vous devriez recevoir une réponse 
                    dans les prochains jours concernant la suite du processus.
                </p>
            @endif
        </div>

        <div class="job-info">
            <h4 style="margin-top: 0;">📋 Détails de l'offre</h4>
            <p><strong>Poste :</strong> {{ $job->title }}</p>
            <p><strong>Entreprise :</strong> {{ $company->name }}</p>
            @if($job->location)
                <p><strong>Localisation :</strong> {{ $job->location }}</p>
            @endif
            <p><strong>Candidature envoyée le :</strong> {{ $application->applied_at->format('d/m/Y à H:i') }}</p>
        </div>

        @if($application->status === 'rejected')
            <p>
                <strong>Continuez vos recherches :</strong><br>
                Ne vous découragez pas ! Consultez nos autres offres d'emploi qui pourraient vous intéresser.
            </p>
            
            <a href="{{ route('job-portal.index') }}" class="cta-button">
                Voir d'autres offres →
            </a>
        @else
            <a href="{{ route('job-portal.my-applications') }}" class="cta-button">
                Voir mes candidatures →
            </a>
        @endif

        <p>
            Bonne continuation dans vos recherches !<br>
            L'équipe JobLight
        </p>
    </div>

    <div class="footer">
        <p>
            <a href="{{ route('job-portal.my-applications') }}" style="color: #6b7280;">Mes candidatures</a> |
            <a href="{{ route('job-portal.index') }}" style="color: #6b7280;">Rechercher des offres</a>
        </p>
    </div>
</body>
</html>