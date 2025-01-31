@extends('layouts.cv')

@section('title', 'CV - {{ $cvInformation['personalInformation']['firstName'] }}')

@section('content')
    <div class="cv-container">
        <header class="cv-header">
            <div class="header-content">
                @if($cvInformation['personalInformation']['photo'])
                    <div class="profile-photo">
                        <img src="{{ $cvInformation['personalInformation']['photo'] }}" alt="Photo de profil" class="profile-image">
                    </div>
                @endif
                <div class="header-text">
                    <h1>{{ $cvInformation['personalInformation']['firstName'] }}</h1>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> {{ $cvInformation['personalInformation']['email'] }}</p>
                        @if($cvInformation['personalInformation']['phone'])
                            <p><i class="fas fa-phone"></i> {{ $cvInformation['personalInformation']['phone'] }}</p>
                        @endif
                        @if($cvInformation['personalInformation']['address'])
                            <p><i class="fas fa-map-marker-alt"></i> {{ $cvInformation['personalInformation']['address'] }}</p>
                        @endif
                        @if($cvInformation['personalInformation']['linkedin'])
                            <p><i class="fab fa-linkedin"></i> {{ $cvInformation['personalInformation']['linkedin'] }}</p>
                        @endif
                        @if($cvInformation['personalInformation']['github'])
                            <p><i class="fab fa-github"></i> {{ $cvInformation['personalInformation']['github'] }}</p>
                        @endif
                    </div>
                </div>
            </div>
        </header>

        <section class="summary">
            <h2>Résumé</h2>
            @foreach($cvInformation['summaries'] as $summary)
                <p>{{ $summary['description'] }}</p>
            @endforeach
        </section>

        <section class="experiences">
            @foreach($experiencesByCategory as $category => $experiences)
                <div class="experience-category">
                    <h2>{{ $category }}</h2>
                    @foreach($experiences as $experience)
                        <div class="experience-item">
                            <h3>{{ $experience['name'] }}</h3>
                            <p class="institution">{{ $experience['InstitutionName'] }}</p>
                            <p class="dates">{{ $experience['date_start'] }} - {{ $experience['date_end'] ?: 'Present' }}</p>
                            <p class="description">{{ $experience['description'] }}</p>
                            @if($experience['attachment_path'])
                                <div class="experience-attachment">
                                    <img src="{{ $experience['attachment_path'] }}" alt="Pièce jointe" class="attachment-image">
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            @endforeach
        </section>

        <aside class="sidebar">
            <section class="competences">
                <h2>Compétences</h2>
                <ul>
                    @foreach($cvInformation['competences'] as $competence)
                        <li>{{ $competence['name'] }}</li>
                    @endforeach
                </ul>
            </section>

            <section class="hobbies">
                <h2>Centres d'intérêt</h2>
                <ul>
                    @foreach($cvInformation['hobbies'] as $hobby)
                        <li>{{ $hobby['name'] }}</li>
                    @endforeach
                </ul>
            </section>
        </aside>
    </div>
@endsection

@section('styles')
    <style>
        .cv-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: 'Arial', sans-serif;
        }

        .cv-header {
            text-align: center;
            margin-bottom: 40px;
        }

        .header-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }

        .profile-photo {
            width: 150px;
            height: 150px;
            overflow: hidden;
            border-radius: 50%;
            border: 3px solid #f5f5f5;
        }

        .profile-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .header-text {
            text-align: left;
        }

        .contact-info {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .contact-info p {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .contact-info i {
            width: 20px;
            color: #666;
        }

        .experience-item {
            margin-bottom: 20px;
            padding: 15px;
            border-left: 3px solid #f5f5f5;
        }

        .experience-attachment {
            margin-top: 10px;
            max-width: 300px;
        }

        .attachment-image {
            width: 100%;
            height: auto;
            border-radius: 4px;
        }

        .sidebar {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }

        @media print {
            .cv-container {
                padding: 0;
            }

            .profile-photo {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }

            .sidebar {
                background: #f5f5f5 !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
@endsection

@section('scripts')
    <script src="https://kit.fontawesome.com/your-font-awesome-kit.js" crossorigin="anonymous"></script>
@endsection
