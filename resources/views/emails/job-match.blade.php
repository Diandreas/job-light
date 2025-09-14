<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle offre qui pourrait vous intéresser</title>
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
            background: linear-gradient(135deg, #f59e0b, #8b5cf6);
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
        .job-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .job-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        .company-name {
            color: #6b7280;
            margin-bottom: 15px;
        }
        .job-details {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 15px;
        }
        .detail-item {
            background: #fff;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            border: 1px solid #d1d5db;
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
        .unsubscribe {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Nouvelle offre pour vous !</h1>
        <p>Une opportunité qui correspond à vos critères</p>
    </div>

    <div class="content">
        <p>Bonjour {{ $user->name }},</p>
        
        <p>Nous avons trouvé une nouvelle offre d'emploi qui pourrait vous intéresser :</p>

        <div class="job-card">
            <div class="job-title">{{ $job->title }}</div>
            <div class="company-name">{{ $company->name }}</div>
            
            <div class="job-details">
                @if($job->location)
                <span class="detail-item">📍 {{ $job->location }}</span>
                @endif
                <span class="detail-item">💼 {{ ucfirst(str_replace('-', ' ', $job->employment_type)) }}</span>
                @if($job->experience_level)
                <span class="detail-item">⭐ {{ ucfirst($job->experience_level) }}</span>
                @endif
                @if($job->remote_work)
                <span class="detail-item">🏠 Télétravail</span>
                @endif
            </div>

            @if($job->salary_min || $job->salary_max)
            <div style="margin-bottom: 15px;">
                <strong>💰 Salaire :</strong>
                @if($job->salary_min && $job->salary_max)
                    {{ number_format($job->salary_min, 0, ',', ' ') }} - {{ number_format($job->salary_max, 0, ',', ' ') }} {{ $job->salary_currency }}
                @elseif($job->salary_min)
                    À partir de {{ number_format($job->salary_min, 0, ',', ' ') }} {{ $job->salary_currency }}
                @else
                    Jusqu'à {{ number_format($job->salary_max, 0, ',', ' ') }} {{ $job->salary_currency }}
                @endif
            </div>
            @endif

            <div style="margin-bottom: 15px;">
                <strong>📋 Description :</strong>
                <p style="margin-top: 5px;">{{ Str::limit($job->description, 200) }}</p>
            </div>

            <a href="{{ route('job-portal.show', $job->id) }}" class="cta-button">
                Voir l'offre complète →
            </a>
        </div>

        <p>
            <strong>Pourquoi cette offre vous est suggérée ?</strong><br>
            Cette offre correspond aux critères que vous avez définis dans vos préférences de notification.
        </p>

        <p>
            Bonne chance dans vos recherches !<br>
            L'équipe JobLight
        </p>
    </div>

    <div class="footer">
        <p>
            <a href="{{ route('profile.edit') }}" style="color: #6b7280;">Modifier mes préférences</a> |
            <a href="{{ route('job-portal.index') }}" style="color: #6b7280;">Voir toutes les offres</a>
        </p>
        
        <div class="unsubscribe">
            <p>Vous recevez cet email car vous avez activé les alertes emploi.</p>
            <p>
                <a href="{{ route('profile.edit') }}" style="color: #9ca3af;">Se désabonner des alertes</a>
            </p>
        </div>
    </div>
</body>
</html>