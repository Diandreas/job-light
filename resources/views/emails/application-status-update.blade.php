<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour de votre candidature</title>
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
            background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 25px;
        }
        .status-card {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            text-align: center;
        }
        .job-details {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .btn {
            background: linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%);
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            background: #f7fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Mise à jour de candidature</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">{{ $job->company->name }}</p>
        </div>

        <div class="content">
            <p>Bonjour <strong>{{ $user->name }}</strong>,</p>
            
            <p>Nous avons une mise à jour concernant votre candidature pour le poste de <strong>{{ $job->title }}</strong>.</p>

            <div class="status-card">
                <h2 style="margin: 0 0 10px 0; color: #0ea5e9;">{{ $statusMessage }}</h2>
                <p style="margin: 0; font-size: 14px; color: #0369a1;">
                    Statut : <strong>{{ ucfirst($application->status) }}</strong>
                </p>
            </div>

            <div class="job-details">
                <h3 style="margin-top: 0; color: #374151;">Détails de l'offre</h3>
                <p><strong>Poste :</strong> {{ $job->title }}</p>
                <p><strong>Entreprise :</strong> {{ $job->company->name }}</p>
                @if($job->location)
                    <p><strong>Localisation :</strong> {{ $job->location }}</p>
                @endif
                <p><strong>Date de candidature :</strong> {{ $application->applied_at->format('d/m/Y à H:i') }}</p>
            </div>

            @if($application->status === 'shortlisted')
                <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <h4 style="color: #059669; margin-top: 0;">🎉 Félicitations !</h4>
                    <p style="color: #047857; margin-bottom: 0;">
                        Votre profil a retenu l'attention de l'entreprise. Vous devriez recevoir un contact prochainement pour la suite du processus de recrutement.
                    </p>
                </div>
            @elseif($application->status === 'hired')
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <h4 style="color: #d97706; margin-top: 0;">🎊 Excellent !</h4>
                    <p style="color: #92400e; margin-bottom: 0;">
                        Vous avez été sélectionné(e) pour ce poste ! L'entreprise devrait vous contacter très prochainement avec les détails.
                    </p>
                </div>
            @elseif($application->status === 'rejected')
                <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <h4 style="color: #dc2626; margin-top: 0;">Candidature non retenue</h4>
                    <p style="color: #991b1b; margin-bottom: 0;">
                        Votre candidature n'a pas été retenue pour ce poste. Ne vous découragez pas ! D'autres opportunités vous attendent.
                    </p>
                </div>
            @endif

            <div style="text-align: center; margin: 25px 0;">
                <a href="{{ route('job-portal.my-applications') }}" class="btn">
                    Voir mes candidatures
                </a>
            </div>

            @if($application->status === 'rejected')
                <p><strong>💡 Conseils pour vos prochaines candidatures :</strong></p>
                <ul style="color: #4a5568; padding-left: 20px;">
                    <li>Utilisez l'IA de Guidy pour optimiser votre CV</li>
                    <li>Personnalisez votre lettre de motivation</li>
                    <li>Consultez nos conseils carrière</li>
                    <li>Continuez à postuler - la persévérance paie !</li>
                </ul>
            @endif
        </div>

        <div class="footer">
            <p><strong>JobLight by Guidy</strong> - Votre assistant carrière intelligent</p>
            <p style="margin: 5px 0 0 0;">
                <a href="{{ route('job-portal.index') }}" style="color: #3b82f6; text-decoration: none;">
                    Découvrir plus d'opportunités
                </a>
            </p>
        </div>
    </div>
</body>
</html>