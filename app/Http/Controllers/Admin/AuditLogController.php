<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');
        
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('action', 'like', '%' . $request->search . '%')
                  ->orWhere('model_type', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%')
                                ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }
        
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }
        
        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }
        
        $auditLogs = $query->paginate(20);
        
        $actions = AuditLog::distinct()->pluck('action');
        $modelTypes = AuditLog::distinct()->pluck('model_type');
        
        return Inertia::render('Admin/AuditLogs/Index', [
            'auditLogs' => $auditLogs,
            'filters' => $request->only(['search', 'action', 'model_type']),
            'actions' => $actions,
            'modelTypes' => $modelTypes,
        ]);
    }
}