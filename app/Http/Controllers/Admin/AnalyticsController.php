<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CvInfo;
use App\Models\Payment;
use App\Models\PortfolioVisit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();
        $totalCvs = CvInfo::count();
        $totalPayments = Payment::sum('amount');
        $totalPortfolioVisits = PortfolioVisit::count();
        
        // Users registered in the last 30 days
        $recentUsers = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        
        // CVs created in the last 30 days
        $recentCvs = CvInfo::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        
        // Monthly user registrations for the last 12 months
        $monthlyUsers = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthlyUsers[] = [
                'month' => $date->format('M Y'),
                'count' => User::whereYear('created_at', $date->year)
                              ->whereMonth('created_at', $date->month)
                              ->count()
            ];
        }
        
        return Inertia::render('Admin/Analytics/Index', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalCvs' => $totalCvs,
                'totalPayments' => $totalPayments,
                'totalPortfolioVisits' => $totalPortfolioVisits,
                'recentUsers' => $recentUsers,
                'recentCvs' => $recentCvs,
            ],
            'monthlyUsers' => $monthlyUsers,
        ]);
    }
}