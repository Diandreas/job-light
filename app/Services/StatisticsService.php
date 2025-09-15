<?php

namespace App\Services;

use App\Models\User;
use App\Models\JobPosting;
use App\Models\JobApplication;
use App\Models\Company;
use App\Models\PlatformStatistic;
use App\Models\CompanyReview;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsService
{
    /**
     * Obtenir les statistiques générales de la plateforme
     */
    public function getPlatformOverview()
    {
        $today = now()->toDateString();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        return [
            'total_users' => User::count(),
            'total_companies' => Company::count(),
            'total_jobs' => JobPosting::count(),
            'active_jobs' => JobPosting::active()->count(),
            'total_applications' => JobApplication::count(),
            'new_users_today' => User::whereDate('created_at', $today)->count(),
            'new_users_this_week' => User::where('created_at', '>=', $thisWeek)->count(),
            'new_users_this_month' => User::where('created_at', '>=', $thisMonth)->count(),
            'new_jobs_today' => JobPosting::whereDate('created_at', $today)->count(),
            'new_jobs_this_week' => JobPosting::where('created_at', '>=', $thisWeek)->count(),
            'new_jobs_this_month' => JobPosting::where('created_at', '>=', $thisMonth)->count(),
            'applications_today' => JobApplication::whereDate('created_at', $today)->count(),
            'applications_this_week' => JobApplication::where('created_at', '>=', $thisWeek)->count(),
            'applications_this_month' => JobApplication::where('created_at', '>=', $thisMonth)->count(),
        ];
    }

    /**
     * Obtenir les statistiques par secteur
     */
    public function getIndustryStatistics()
    {
        return JobPosting::select('industry')
            ->selectRaw('COUNT(*) as job_count')
            ->selectRaw('COUNT(DISTINCT company_id) as company_count')
            ->selectRaw('SUM(applications_count) as total_applications')
            ->whereNotNull('industry')
            ->where('industry', '!=', '')
            ->groupBy('industry')
            ->orderBy('job_count', 'desc')
            ->take(15)
            ->get();
    }

    /**
     * Obtenir les statistiques par localisation
     */
    public function getLocationStatistics()
    {
        return JobPosting::select('location')
            ->selectRaw('COUNT(*) as job_count')
            ->selectRaw('COUNT(DISTINCT company_id) as company_count')
            ->selectRaw('AVG(applications_count) as avg_applications')
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->groupBy('location')
            ->orderBy('job_count', 'desc')
            ->take(20)
            ->get();
    }

    /**
     * Obtenir les statistiques par type d'emploi
     */
    public function getEmploymentTypeStatistics()
    {
        return JobPosting::select('employment_type')
            ->selectRaw('COUNT(*) as job_count')
            ->selectRaw('SUM(applications_count) as total_applications')
            ->selectRaw('AVG(applications_count) as avg_applications_per_job')
            ->groupBy('employment_type')
            ->orderBy('job_count', 'desc')
            ->get();
    }

    /**
     * Obtenir les entreprises les plus actives
     */
    public function getTopCompanies($limit = 10)
    {
        return Company::select('companies.*')
            ->selectRaw('COUNT(job_postings.id) as jobs_posted')
            ->selectRaw('SUM(job_postings.applications_count) as total_applications_received')
            ->selectRaw('SUM(job_postings.views_count) as total_views')
            ->leftJoin('job_postings', 'companies.id', '=', 'job_postings.company_id')
            ->where('companies.status', 'active')
            ->groupBy('companies.id')
            ->orderBy('jobs_posted', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Obtenir les offres les plus populaires
     */
    public function getTopJobs($limit = 10)
    {
        return JobPosting::with('company')
            ->select('job_postings.*')
            ->orderBy('applications_count', 'desc')
            ->orderBy('views_count', 'desc')
            ->take($limit)
            ->get();
    }

    /**
     * Obtenir les statistiques de candidatures
     */
    public function getApplicationStatistics()
    {
        $statusStats = JobApplication::select('status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        return [
            'total' => JobApplication::count(),
            'pending' => $statusStats->get('pending')->count ?? 0,
            'reviewed' => $statusStats->get('reviewed')->count ?? 0,
            'shortlisted' => $statusStats->get('shortlisted')->count ?? 0,
            'rejected' => $statusStats->get('rejected')->count ?? 0,
            'hired' => $statusStats->get('hired')->count ?? 0,
            'success_rate' => $this->calculateSuccessRate(),
            'average_per_job' => round(JobApplication::count() / max(1, JobPosting::count()), 2),
        ];
    }

    /**
     * Calculer le taux de succès des candidatures
     */
    private function calculateSuccessRate()
    {
        $total = JobApplication::count();
        $successful = JobApplication::whereIn('status', ['shortlisted', 'hired'])->count();
        
        return $total > 0 ? round(($successful / $total) * 100, 2) : 0;
    }

    /**
     * Obtenir les données pour les graphiques temporels
     */
    public function getTimeSeriesData($metric = 'users', $period = '30_days')
    {
        $endDate = now();
        
        switch ($period) {
            case '7_days':
                $startDate = $endDate->copy()->subDays(7);
                $groupBy = 'DATE(created_at)';
                break;
            case '30_days':
                $startDate = $endDate->copy()->subDays(30);
                $groupBy = 'DATE(created_at)';
                break;
            case '12_months':
                $startDate = $endDate->copy()->subMonths(12);
                $groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
                break;
            default:
                $startDate = $endDate->copy()->subDays(30);
                $groupBy = 'DATE(created_at)';
        }

        $model = $this->getModelForMetric($metric);
        
        return $model::select(DB::raw("{$groupBy} as date"))
            ->selectRaw('COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy(DB::raw($groupBy))
            ->orderBy(DB::raw($groupBy))
            ->get();
    }

    /**
     * Obtenir le modèle correspondant à une métrique
     */
    private function getModelForMetric($metric)
    {
        switch ($metric) {
            case 'users':
                return User::class;
            case 'jobs':
                return JobPosting::class;
            case 'applications':
                return JobApplication::class;
            case 'companies':
                return Company::class;
            default:
                return User::class;
        }
    }

    /**
     * Obtenir les statistiques de salaires
     */
    public function getSalaryStatistics()
    {
        $salaryJobs = JobPosting::whereNotNull('salary_min')
            ->orWhereNotNull('salary_max')
            ->get();

        if ($salaryJobs->isEmpty()) {
            return [
                'average_min' => 0,
                'average_max' => 0,
                'median_min' => 0,
                'median_max' => 0,
                'by_employment_type' => [],
                'by_experience_level' => [],
            ];
        }

        $salaryByEmploymentType = JobPosting::select('employment_type')
            ->selectRaw('AVG(salary_min) as avg_min')
            ->selectRaw('AVG(salary_max) as avg_max')
            ->selectRaw('COUNT(*) as job_count')
            ->whereNotNull('salary_min')
            ->orWhereNotNull('salary_max')
            ->groupBy('employment_type')
            ->get();

        $salaryByExperienceLevel = JobPosting::select('experience_level')
            ->selectRaw('AVG(salary_min) as avg_min')
            ->selectRaw('AVG(salary_max) as avg_max')
            ->selectRaw('COUNT(*) as job_count')
            ->whereNotNull('salary_min')
            ->orWhereNotNull('salary_max')
            ->groupBy('experience_level')
            ->get();

        return [
            'average_min' => round($salaryJobs->avg('salary_min'), 0),
            'average_max' => round($salaryJobs->avg('salary_max'), 0),
            'median_min' => $this->calculateMedian($salaryJobs->pluck('salary_min')->filter()),
            'median_max' => $this->calculateMedian($salaryJobs->pluck('salary_max')->filter()),
            'by_employment_type' => $salaryByEmploymentType,
            'by_experience_level' => $salaryByExperienceLevel,
        ];
    }

    /**
     * Calculer la médiane d'une collection
     */
    private function calculateMedian($values)
    {
        $sorted = $values->sort()->values();
        $count = $sorted->count();
        
        if ($count === 0) {
            return 0;
        }
        
        if ($count % 2 === 0) {
            return ($sorted[$count / 2 - 1] + $sorted[$count / 2]) / 2;
        }
        
        return $sorted[intval($count / 2)];
    }

    /**
     * Obtenir les statistiques de performance des offres
     */
    public function getJobPerformanceMetrics()
    {
        return [
            'most_viewed' => JobPosting::orderBy('views_count', 'desc')->take(5)->get(),
            'most_applied' => JobPosting::orderBy('applications_count', 'desc')->take(5)->get(),
            'best_conversion_rate' => $this->getBestConversionRateJobs(),
            'average_time_to_fill' => $this->getAverageTimeToFill(),
        ];
    }

    /**
     * Obtenir les offres avec le meilleur taux de conversion
     */
    private function getBestConversionRateJobs()
    {
        return JobPosting::select('job_postings.*')
            ->selectRaw('(applications_count / GREATEST(views_count, 1)) * 100 as conversion_rate')
            ->where('views_count', '>', 10) // Minimum de vues pour être significatif
            ->orderByDesc('conversion_rate')
            ->take(5)
            ->get();
    }

    /**
     * Calculer le temps moyen pour pourvoir un poste
     */
    private function getAverageTimeToFill()
    {
        $hiredApplications = JobApplication::where('status', 'hired')
            ->with('jobPosting')
            ->get();

        if ($hiredApplications->isEmpty()) {
            return 0;
        }

        $totalDays = $hiredApplications->sum(function ($application) {
            return $application->jobPosting->created_at->diffInDays($application->updated_at);
        });

        return round($totalDays / $hiredApplications->count(), 1);
    }

    /**
     * Enregistrer les statistiques quotidiennes
     */
    public function recordDailyStatistics($date = null)
    {
        $date = $date ?: now()->toDateString();

        $metrics = [
            'total_users' => User::count(),
            'total_companies' => Company::count(),
            'total_jobs' => JobPosting::count(),
            'active_jobs' => JobPosting::active()->count(),
            'total_applications' => JobApplication::count(),
            'new_users' => User::whereDate('created_at', $date)->count(),
            'new_jobs' => JobPosting::whereDate('created_at', $date)->count(),
            'new_applications' => JobApplication::whereDate('created_at', $date)->count(),
        ];

        foreach ($metrics as $metric => $value) {
            PlatformStatistic::recordMetric($date, $metric, $value);
        }

        // Statistiques détaillées
        $this->recordIndustryBreakdown($date);
        $this->recordLocationBreakdown($date);
        $this->recordEmploymentTypeBreakdown($date);
    }

    /**
     * Enregistrer la répartition par secteur
     */
    private function recordIndustryBreakdown($date)
    {
        $breakdown = JobPosting::select('industry')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('industry')
            ->where('industry', '!=', '')
            ->groupBy('industry')
            ->get()
            ->keyBy('industry')
            ->map(function ($item) {
                return $item->count;
            })
            ->toArray();

        PlatformStatistic::recordMetric($date, 'jobs_by_industry', array_sum($breakdown), $breakdown);
    }

    /**
     * Enregistrer la répartition par localisation
     */
    private function recordLocationBreakdown($date)
    {
        $breakdown = JobPosting::select('location')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('location')
            ->where('location', '!=', '')
            ->groupBy('location')
            ->get()
            ->keyBy('location')
            ->map(function ($item) {
                return $item->count;
            })
            ->toArray();

        PlatformStatistic::recordMetric($date, 'jobs_by_location', array_sum($breakdown), $breakdown);
    }

    /**
     * Enregistrer la répartition par type d'emploi
     */
    private function recordEmploymentTypeBreakdown($date)
    {
        $breakdown = JobPosting::select('employment_type')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('employment_type')
            ->get()
            ->keyBy('employment_type')
            ->map(function ($item) {
                return $item->count;
            })
            ->toArray();

        PlatformStatistic::recordMetric($date, 'jobs_by_employment_type', array_sum($breakdown), $breakdown);
    }
}
