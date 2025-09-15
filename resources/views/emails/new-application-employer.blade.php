<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle candidature reçue</title>
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
            background: linear-gradient(135deg, #3b82f6, #1e40af);
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
        .candidate-card {
            background: #f0f9ff;
            border: 1px solid #3b82f6;
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
            background: linear-gradient(135deg, #3b82f6, #1e40af);
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
        .cover-letter {
            background: #fff;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 15px;
            margin-top: 15px;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <div style="font-size: 48px; margin-bottom: 15px;">📝</div>
        <h1>Nouvelle candidature !</h1>
        <p>Un candidat a postulé à votre offre</p>
    </div>

    <div class="content">
        <p>Bonjour {{ $employer->name }},</p>
        
        <p>Excellente nouvelle ! Vous avez reçu une nouvelle candidature pour votre offre d'emploi.</p>

        <div class="job-info">
            <h4 style="margin-top: 0;">📋 Offre concernée</h4>
            <p><strong>Poste :</strong> {{ $job->title }}</p>
            @if($company->name)
                <p><strong>Entreprise :</strong> {{ $company->name }}</p>
            @endif
            @if($job->location)
                <p><strong>Localisation :</strong> {{ $job->location }}</p>
            @endif
            <p><strong>Publiée le :</strong> {{ $job->created_at->format('d/m/Y') }}</p>
        </div>

        <div class="candidate-card">
            <h4 style="margin-top: 0;">👤 Candidat</h4>
            <p><strong>Nom :</strong> {{ $applicant->name }}</p>
            @if($applicant->email)
                <p><strong>Email :</strong> {{ $applicant->email }}</p>
            @endif
            @if($applicant->phone_number)
                <p><strong>Téléphone :</strong> {{ $applicant->phone_number }}</p>
            @endif
            @if($applicant->address)
                <p><strong>Localisation :</strong> {{ $applicant->address }}</p>
            @endif
            @if($applicant->full_profession)
                <p><strong>Profession :</strong> {{ $applicant->full_profession }}</p>
            @endif
            
            <p><strong>Candidature envoyée le :</strong> {{ $application->applied_at->format('d/m/Y à H:i') }}</p>

            @if($application->cover_letter)
                <div class="cover-letter">
                    <strong>💬 Lettre de motivation :</strong>
                    <p style="margin-top: 10px;">{{ $application->cover_letter }}</p>
                </div>
            @endif
        </div>

        <p>
            <strong>Prochaines étapes :</strong><br>
            Consultez le profil complet du candidat et son CV pour évaluer sa candidature. 
            Vous pouvez ensuite mettre à jour le statut de la candidature dans votre espace de gestion.
        </p>

        <a href="{{ route('job-portal.applications', $job->id) }}" class="cta-button">
            Consulter la candidature →
        </a>

        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
            <strong>Statistiques de votre offre :</strong><br>
            • {{ $job->views_count }} vues<br>
            • {{ $job->applications_count }} candidature{{ $job->applications_count > 1 ? 's' : '' }}
        </p>

        <p>
            Bonne évaluation !<br>
            L'équipe JobLight
        </p>
    </div>

    <div class="footer">
        <p>
            <a href="{{ route('job-portal.my-jobs') }}" style="color: #6b7280;">Mes offres</a> |
            <a href="{{ route('job-portal.applications', $job->id) }}" style="color: #6b7280;">Toutes les candidatures</a>
        </p>
    </div>
</body>
</html>
