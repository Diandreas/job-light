<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use App\Models\Payment;
use App\Models\CvInfo;
use App\Models\AuditLog;
use App\Models\PortfolioSettings;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:access-admin');
    }

    public function index()
    {
        $stats = $this->getDashboardStats();
        $charts = $this->getChartData();
        $recentActivities = $this->getRecentActivities();
        $pendingActions = $this->getPendingActions();

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => $stats,
            'charts' => $charts,
            'recentActivities' => $recentActivities,
            'pendingActions' => $pendingActions,
        ]);
    }

    private function getDashboardStats(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        return [
            'users' => [
                'total' => User::where('UserType', '!=', 1)->count(),
                'today' => User::where('UserType', '!=', 1)->whereDate('created_at', $today)->count(),
                'thisMonth' => User::where('UserType', '!=', 1)->where('created_at', '>=', $thisMonth)->count(),
                'growth' => $this->calculateGrowth(
                    User::where('UserType', '!=', 1)->where('created_at', '>=', $thisMonth)->count(),
                    User::where('UserType', '!=', 1)->whereBetween('created_at', [$lastMonth, $thisMonth])->count()
                ),
            ],
            'companies' => [
                'total' => Company::count(),
                'approved' => Company::where('is_approved', true)->count(),
                'pending' => Company::where('is_approved', false)->count(),
                'today' => Company::whereDate('created_at', $today)->count(),
            ],
            'cvs' => [
                'total' => User::where('UserType', '!=', 1)->count(),
                'today' => User::where('UserType', '!=', 1)->whereDate('created_at', $today)->count(),
                'thisMonth' => User::where('UserType', '!=', 1)->where('created_at', '>=', $thisMonth)->count(),
            ],
            'portfolios' => [
                'total' => PortfolioSettings::count(),
                'public' => PortfolioSettings::where('visibility', 'public')->count(),
                'company_portal' => PortfolioSettings::where('visibility', 'company_portal')->count(),
                'community' => PortfolioSettings::where('visibility', 'community')->count(),
                'private' => PortfolioSettings::where('visibility', 'private')->count(),
            ],
            'revenue' => [
                'total' => Payment::where('status', 'completed')->sum('amount'),
                'thisMonth' => Payment::where('status', 'completed')
                    ->where('created_at', '>=', $thisMonth)
                    ->sum('amount'),
                'todayTransactions' => Payment::whereDate('created_at', $today)->count(),
            ],
        ];
    }

    private function getChartData(): array
    {
        return [
            'userRegistrations' => $this->getUserRegistrationChart(),
            'companyRegistrations' => $this->getCompanyRegistrationChart(),
            'revenueChart' => $this->getRevenueChart(),
            'portfolioVisibility' => $this->getPortfolioVisibilityChart(),
        ];
    }

    private function getUserRegistrationChart(): array
    {
        $data = User::where('UserType', '!=', 1)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'labels' => $data->pluck('date')->map(fn($date) => Carbon::parse($date)->format('d/m')),
            'data' => $data->pluck('count'),
        ];
    }

    private function getCompanyRegistrationChart(): array
    {
        $data = Company::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'labels' => $data->pluck('date')->map(fn($date) => Carbon::parse($date)->format('d/m')),
            'data' => $data->pluck('count'),
        ];
    }

    private function getRevenueChart(): array
    {
        $data = Payment::where('status', 'completed')
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'labels' => $data->pluck('date')->map(fn($date) => Carbon::parse($date)->format('d/m')),
            'data' => $data->pluck('total'),
        ];
    }

    private function getPortfolioVisibilityChart(): array
    {
        $data = PortfolioSettings::selectRaw('visibility, COUNT(*) as count')
            ->groupBy('visibility')
            ->get();

        return [
            'labels' => $data->pluck('visibility')->map(fn($v) => ucfirst(str_replace('_', ' ', $v))),
            'data' => $data->pluck('count'),
        ];
    }

    private function getRecentActivities(): array
    {
        return AuditLog::with(['user', 'admin'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description ?? $this->formatLogDescription($log),
                    'admin' => $log->admin?->name ?? 'Système',
                    'user' => $log->user?->name,
                    'model' => class_basename($log->model_type),
                    'created_at' => $log->created_at->diffForHumans(),
                    'created_at_full' => $log->created_at->format('d/m/Y H:i'),
                ];
            })->toArray();
    }

    private function getPendingActions(): array
    {
        return [
            'pendingCompanies' => Company::where('is_approved', false)->count(),
            'todayRegistrations' => User::where('UserType', '!=', 1)->whereDate('created_at', Carbon::today())->count(),
            'recentPayments' => Payment::where('status', 'pending')->count(),
            'systemAlerts' => 0, // Pour les futures alertes système
        ];
    }

    private function calculateGrowth(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function formatLogDescription(AuditLog $log): string
    {
        $model = class_basename($log->model_type);
        
        return match ($log->action) {
            'created' => "Création d'un(e) {$model}",
            'updated' => "Modification d'un(e) {$model}",
            'deleted' => "Suppression d'un(e) {$model}",
            'approved' => "Approbation d'un(e) {$model}",
            'rejected' => "Rejet d'un(e) {$model}",
            default => "Action {$log->action} sur {$model}",
        };
    }
}