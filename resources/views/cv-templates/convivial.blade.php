@extends('layouts.cv')

@section('title', 'CV - {{ $personalInfo->name }}')

@section('content')
<div class="cv-container">
    <header class="cv-header">
        <h1>{{ $personalInfo->name }}</h1>
        <div class="contact-info">
            <p>{{ $personalInfo->email }}</p>
            <p>{{ $personalInfo->phone }}</p>
            <p>{{ $personalInfo->address }}</p>
        </div>
    </header>

    <section class="summary">
        <h2>Résumé</h2>
        @foreach($summaries as $summary)
            <p>{{ $summary->description }}</p>
        @endforeach
    </section>

    <section class="experiences">
        @foreach($experiencesByCategory as $category => $experiences)
            <div class="experience-category">
                <h2>{{ $category }}</h2>
                @foreach($experiences as $experience)
                    <div class="experience-item">
                        <h3>{{ $experience->title }}</h3>
                        <p class="institution">{{ $experience->InstitutionName }}</p>
                        <p class="dates">{{ $experience->date_start }} - {{ $experience->date_end ?: 'Present' }}</p>
                        <p class="description">{{ $experience->description }}</p>
                    </div>
                @endforeach
            </div>
        @endforeach
    </section>

    <aside class="sidebar">
        <section class="competences">
            <h2>Compétences</h2>
            <ul>
                @foreach($competences as $competence)
                    <li>{{ $competence->name }}</li>
                @endforeach
            </ul>
        </section>

        <section class="hobbies">
            <h2>Centres d'intérêt</h2>
            <ul>
                @foreach($hobbies as $hobby)
                    <li>{{ $hobby->name }}</li>
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
    }

    .cv-header {
        text-align: center;
        margin-bottom: 40px;
    }

    .experience-item {
        margin-bottom: 20px;
    }

    .sidebar {
        background: #f5f5f5;
        padding: 20px;
    }
</style>
@endsection
