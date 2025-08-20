<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:access-admin');
    }

    public function index()
    {
        return Inertia::render('Admin/Analytics/Index', [
            'analytics' => [
                'message' => 'Analytics dashboard coming soon'
            ]
        ]);
    }
}