<?php

namespace App\Http\Controllers;

use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    protected $statisticsService;

    public function __construct(StatisticsService $statisticsService)
    {
        $this->statisticsService = $statisticsService;
        $this->middleware('auth');
    }

    /**
     * Afficher le tableau de bord des statistiques
     */
    public function index(Request $request)
    {
        // Vérifier les permissions (admin ou partenaire)
        if (!$request->user()->can('access-admin') && !$request->user()->can('access-statistics')) {
            abort(403, 'Accès non autorisé');
        }

        $period = $request->get('period', '30_days');
        $metric = $request->get('metric', 'users');

        $data = [
            'overview' => $this->statisticsService->getPlatformOverview(),
            'industries' => $this->statisticsService->getIndustryStatistics(),
            'locations' => $this->statisticsService->getLocationStatistics(),
            'employmentTypes' => $this->statisticsService->getEmploymentTypeStatistics(),
            'topCompanies' => $this->statisticsService->getTopCompanies(10),
            'topJobs' => $this->statisticsService->getTopJobs(10),
            'applications' => $this->statisticsService->getApplicationStatistics(),
            'salaries' => $this->statisticsService->getSalaryStatistics(),
            'performance' => $this->statisticsService->getJobPerformanceMetrics(),
            'timeSeries' => $this->statisticsService->getTimeSeriesData($metric, $period),
            'filters' => [
                'period' => $period,
                'metric' => $metric
            ]
        ];

        return Inertia::render('Statistics/Dashboard', $data);
    }

    /**
     * API pour obtenir des données de séries temporelles
     */
    public function getTimeSeriesData(Request $request)
    {
        $period = $request->get('period', '30_days');
        $metric = $request->get('metric', 'users');

        $data = $this->statisticsService->getTimeSeriesData($metric, $period);

        return response()->json($data);
    }

    /**
     * API pour obtenir les statistiques d'une industrie spécifique
     */
    public function getIndustryDetails(Request $request, $industry)
    {
        $data = [
            'industry' => $industry,
            'jobs' => \App\Models\JobPosting::where('industry', $industry)
                ->with('company')
                ->orderBy('created_at', 'desc')
                ->paginate(20),
            'stats' => [
                'total_jobs' => \App\Models\JobPosting::where('industry', $industry)->count(),
                'active_jobs' => \App\Models\JobPosting::where('industry', $industry)->active()->count(),
                'total_applications' => \App\Models\JobPosting::where('industry', $industry)->sum('applications_count'),
                'companies_count' => \App\Models\JobPosting::where('industry', $industry)->distinct('company_id')->count(),
                'avg_salary_min' => \App\Models\JobPosting::where('industry', $industry)->avg('salary_min'),
                'avg_salary_max' => \App\Models\JobPosting::where('industry', $industry)->avg('salary_max'),
            ]
        ];

        return response()->json($data);
    }

    /**
     * API pour obtenir les statistiques d'une localisation spécifique
     */
    public function getLocationDetails(Request $request, $location)
    {
        $data = [
            'location' => $location,
            'jobs' => \App\Models\JobPosting::where('location', 'like', "%{$location}%")
                ->with('company')
                ->orderBy('created_at', 'desc')
                ->paginate(20),
            'stats' => [
                'total_jobs' => \App\Models\JobPosting::where('location', 'like', "%{$location}%")->count(),
                'active_jobs' => \App\Models\JobPosting::where('location', 'like', "%{$location}%")->active()->count(),
                'total_applications' => \App\Models\JobPosting::where('location', 'like', "%{$location}%")->sum('applications_count'),
                'companies_count' => \App\Models\JobPosting::where('location', 'like', "%{$location}%")->distinct('company_id')->count(),
                'remote_jobs' => \App\Models\JobPosting::where('location', 'like', "%{$location}%")->where('remote_work', true)->count(),
            ]
        ];

        return response()->json($data);
    }

    /**
     * Exporter les statistiques en CSV
     */
    public function exportCsv(Request $request)
    {
        $type = $request->get('type', 'overview');
        
        $filename = "joblight_statistics_{$type}_" . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        return response()->stream(function () use ($type) {
            $file = fopen('php://output', 'w');
            
            switch ($type) {
                case 'overview':
                    $this->exportOverviewCsv($file);
                    break;
                case 'industries':
                    $this->exportIndustriesCsv($file);
                    break;
                case 'locations':
                    $this->exportLocationsCsv($file);
                    break;
                case 'companies':
                    $this->exportCompaniesCsv($file);
                    break;
                default:
                    $this->exportOverviewCsv($file);
            }
            
            fclose($file);
        }, 200, $headers);
    }

    /**
     * Exporter les statistiques générales
     */
    private function exportOverviewCsv($file)
    {
        $overview = $this->statisticsService->getPlatformOverview();
        
        fputcsv($file, ['Métrique', 'Valeur']);
        
        foreach ($overview as $key => $value) {
            $label = $this->translateMetricLabel($key);
            fputcsv($file, [$label, $value]);
        }
    }

    /**
     * Exporter les statistiques par secteur
     */
    private function exportIndustriesCsv($file)
    {
        $industries = $this->statisticsService->getIndustryStatistics();
        
        fputcsv($file, ['Secteur', 'Nombre d\'offres', 'Nombre d\'entreprises', 'Total candidatures']);
        
        foreach ($industries as $industry) {
            fputcsv($file, [
                $industry->industry,
                $industry->job_count,
                $industry->company_count,
                $industry->total_applications
            ]);
        }
    }

    /**
     * Exporter les statistiques par localisation
     */
    private function exportLocationsCsv($file)
    {
        $locations = $this->statisticsService->getLocationStatistics();
        
        fputcsv($file, ['Localisation', 'Nombre d\'offres', 'Nombre d\'entreprises', 'Candidatures moyennes']);
        
        foreach ($locations as $location) {
            fputcsv($file, [
                $location->location,
                $location->job_count,
                $location->company_count,
                round($location->avg_applications, 2)
            ]);
        }
    }

    /**
     * Exporter les statistiques des entreprises
     */
    private function exportCompaniesCsv($file)
    {
        $companies = $this->statisticsService->getTopCompanies(50);
        
        fputcsv($file, ['Entreprise', 'Offres publiées', 'Candidatures reçues', 'Vues totales']);
        
        foreach ($companies as $company) {
            fputcsv($file, [
                $company->name,
                $company->jobs_posted,
                $company->total_applications_received,
                $company->total_views
            ]);
        }
    }

    /**
     * Traduire les labels des métriques
     */
    private function translateMetricLabel($key)
    {
        $labels = [
            'total_users' => 'Total utilisateurs',
            'total_companies' => 'Total entreprises',
            'total_jobs' => 'Total offres',
            'active_jobs' => 'Offres actives',
            'total_applications' => 'Total candidatures',
            'new_users_today' => 'Nouveaux utilisateurs aujourd\'hui',
            'new_users_this_week' => 'Nouveaux utilisateurs cette semaine',
            'new_users_this_month' => 'Nouveaux utilisateurs ce mois',
            'new_jobs_today' => 'Nouvelles offres aujourd\'hui',
            'new_jobs_this_week' => 'Nouvelles offres cette semaine',
            'new_jobs_this_month' => 'Nouvelles offres ce mois',
            'applications_today' => 'Candidatures aujourd\'hui',
            'applications_this_week' => 'Candidatures cette semaine',
            'applications_this_month' => 'Candidatures ce mois',
        ];

        return $labels[$key] ?? $key;
    }
}
