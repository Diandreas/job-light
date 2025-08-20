<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:access-admin');
    }

    public function index(Request $request)
    {
        $query = AuditLog::with(['user', 'admin']);

        // Filtres
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('action', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('model_type', 'like', "%{$request->search}%");
            });
        }

        if ($request->action) {
            $query->where('action', $request->action);
        }

        if ($request->dateFrom) {
            $query->whereDate('created_at', '>=', $request->dateFrom);
        }

        if ($request->dateTo) {
            $query->whereDate('created_at', '<=', $request->dateTo);
        }

        $logs = $query->latest()
            ->paginate(20)
            ->withQueryString();

        $actions = AuditLog::distinct('action')->pluck('action');

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'actions' => $actions,
            'filters' => $request->only(['search', 'action', 'dateFrom', 'dateTo']),
        ]);
    }
}