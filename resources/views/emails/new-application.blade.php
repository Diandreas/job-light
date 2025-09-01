<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle candidature - {{ $job->title }}</title>
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
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 25px;
        }
        .candidate-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #3b82f6;
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
            <h1 style="margin: 0; font-size: 24px;">Nouvelle Candidature</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">{{ $job->title }}</p>
        </div>

        <div class="content">
            <p>Bonjour,</p>
            
            <p>Vous avez reçu une nouvelle candidature pour votre offre d'emploi <strong>{{ $job->title }}</strong>.</p>

            <div class="candidate-card">
                <h3 style="margin-top: 0; color: #3b82f6;">{{ $applicant->name }}</h3>
                <p><strong>Profession :</strong> {{ $applicant->profession?->name ?? $applicant->full_profession ?? 'Non spécifiée' }}</p>
                
                @if($applicant->address)
                    <p><strong>Localisation :</strong> {{ $applicant->address }}</p>
                @endif

                <p><strong>Email :</strong> {{ $applicant->email }}</p>
                
                @if($applicant->phone_number)
                    <p><strong>Téléphone :</strong> {{ $applicant->phone_number }}</p>
                @endif

                <h4 style="color: #374151; margin-bottom: 10px;">Lettre de motivation :</h4>
                <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #d1d5db;">
                    {{ $application->cover_letter }}
                </div>

                @if($applicant->experiences && $applicant->experiences->count() > 0)
                    <h4 style="color: #374151; margin-top: 15px; margin-bottom: 10px;">Expériences récentes :</h4>
                    @foreach($applicant->experiences->take(3) as $experience)
                        <div style="margin-bottom: 8px; font-size: 14px;">
                            <strong>{{ $experience->name }}</strong> chez {{ $experience->InstitutionName }}
                            <br>
                            <small style="color: #6b7280;">
                                {{ $experience->date_start }} - {{ $experience->date_end ?? 'Présent' }}
                            </small>
                        </div>
                    @endforeach
                @endif
            </div>

            <div style="text-align: center; margin: 25px 0;">
                <a href="{{ route('job-portal.applications', $job) }}" class="btn">
                    Voir toutes les candidatures
                </a>
            </div>

            <p style="margin-top: 20px;">
                <strong>Prochaines étapes :</strong>
            </p>
            <ul style="color: #4a5568; padding-left: 20px;">
                <li>Consultez le CV complet du candidat</li>
                <li>Évaluez la lettre de motivation</li>
                <li>Contactez le candidat si le profil vous intéresse</li>
                <li>Mettez à jour le statut de la candidature</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>JobLight by Guidy</strong> - Votre portail de recrutement intelligent</p>
            <p style="margin: 5px 0 0 0;">
                <a href="{{ route('job-portal.index') }}" style="color: #3b82f6; text-decoration: none;">
                    Accéder au portail emploi
                </a>
            </p>
        </div>
    </div>
</body>
</html>