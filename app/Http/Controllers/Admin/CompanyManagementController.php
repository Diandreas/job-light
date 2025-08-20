<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class CompanyManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:access-admin');
    }

    public function index(Request $request)
    {
        $query = Company::query();

        // Filtres de recherche
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('company_type', 'like', "%{$request->search}%");
            });
        }

        if ($request->status !== null) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        if ($request->company_type) {
            $query->where('company_type', 'like', "%{$request->company_type}%");
        }

        if ($request->dateFrom) {
            $query->whereDate('created_at', '>=', $request->dateFrom);
        }

        if ($request->dateTo) {
            $query->whereDate('created_at', '<=', $request->dateTo);
        }

        $companies = $query->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total' => Company::count(),
            'approved' => Company::where('is_approved', true)->count(),
            'pending' => Company::where('is_approved', false)->count(),
            'todayRegistrations' => Company::whereDate('created_at', today())->count(),
        ];

        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'company_type', 'dateFrom', 'dateTo']),
        ]);
    }

    public function show(Company $company)
    {
        $auditLogs = AuditLog::where('model_type', Company::class)
            ->where('model_id', $company->id)
            ->with('admin')
            ->latest()
            ->limit(10)
            ->get();

        $stats = [
            'registeredDaysAgo' => $company->created_at->diffInDays(),
            'lastLogin' => null, // À implémenter si nécessaire
            'profileViews' => 0, // À implémenter si tracking nécessaire
        ];

        return Inertia::render('Admin/Companies/Show', [
            'company' => $company,
            'auditLogs' => $auditLogs,
            'stats' => $stats,
        ]);
    }

    public function edit(Company $company)
    {
        return Inertia::render('Admin/Companies/Edit', [
            'company' => $company,
        ]);
    }

    public function update(Request $request, Company $company)
    {
        $oldValues = $company->toArray();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('companies')->ignore($company->id)],
            'company_type' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
            'is_approved' => 'boolean',
            'password' => 'nullable|min:8|confirmed',
        ]);

        $data = $request->except(['password', 'password_confirmation']);

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $company->update($data);

        // Log de l'action
        AuditLog::logAction(
            'updated',
            $company,
            $oldValues,
            $company->fresh()->toArray(),
            "Modification du profil entreprise par l'admin"
        );

        return redirect()->route('admin.companies.show', $company)
            ->with('success', 'Entreprise mise à jour avec succès.');
    }

    public function destroy(Company $company)
    {
        $oldValues = $company->toArray();

        $company->delete();

        // Log de l'action
        AuditLog::logAction(
            'deleted',
            $company,
            $oldValues,
            null,
            "Suppression de l'entreprise {$company->name} par l'admin"
        );

        return redirect()->route('admin.companies.index')
            ->with('success', 'Entreprise supprimée avec succès.');
    }

    public function approve(Company $company)
    {
        if ($company->is_approved) {
            return back()->with('info', 'Cette entreprise est déjà approuvée.');
        }

        $oldValues = $company->toArray();

        $company->update(['is_approved' => true]);

        // Log de l'action
        AuditLog::logAction(
            'approved',
            $company,
            $oldValues,
            $company->fresh()->toArray(),
            "Approbation de l'entreprise {$company->name}"
        );

        // TODO: Envoyer email de notification à l'entreprise

        return back()->with('success', 'Entreprise approuvée avec succès.');
    }

    public function reject(Request $request, Company $company)
    {
        if (!$company->is_approved) {
            return back()->with('info', 'Cette entreprise n\'est pas encore approuvée.');
        }

        $oldValues = $company->toArray();
        $reason = $request->input('reason', 'Aucune raison spécifiée');

        $company->update(['is_approved' => false]);

        // Log de l'action
        AuditLog::logAction(
            'rejected',
            $company,
            $oldValues,
            $company->fresh()->toArray(),
            "Rejet de l'entreprise {$company->name}. Raison: {$reason}"
        );

        // TODO: Envoyer email de notification à l'entreprise avec la raison

        return back()->with('success', 'Entreprise rejetée avec succès.');
    }

    public function pendingApprovals()
    {
        $pendingCompanies = Company::where('is_approved', false)
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Companies/PendingApproval', [
            'companies' => $pendingCompanies,
        ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:approve,reject,delete',
            'company_ids' => 'required|array',
            'company_ids.*' => 'exists:companies,id',
            'reason' => 'nullable|string|max:500',
        ]);

        $companies = Company::whereIn('id', $request->company_ids)->get();
        $action = $request->action;
        $reason = $request->reason ?? 'Action en lot par l\'administrateur';

        foreach ($companies as $company) {
            $oldValues = $company->toArray();

            switch ($action) {
                case 'approve':
                    if (!$company->is_approved) {
                        $company->update(['is_approved' => true]);
                        AuditLog::logAction('approved', $company, $oldValues, $company->fresh()->toArray(), "Approbation en lot: {$reason}");
                    }
                    break;

                case 'reject':
                    if ($company->is_approved) {
                        $company->update(['is_approved' => false]);
                        AuditLog::logAction('rejected', $company, $oldValues, $company->fresh()->toArray(), "Rejet en lot: {$reason}");
                    }
                    break;

                case 'delete':
                    AuditLog::logAction('deleted', $company, $oldValues, null, "Suppression en lot: {$reason}");
                    $company->delete();
                    break;
            }
        }

        $actionText = match ($action) {
            'approve' => 'approuvées',
            'reject' => 'rejetées',
            'delete' => 'supprimées',
        };

        return back()->with('success', count($companies) . " entreprise(s) {$actionText} avec succès.");
    }

    public function exportCompanies(Request $request)
    {
        $query = Company::query();

        // Appliquer les mêmes filtres que l'index
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->status !== null) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        $companies = $query->get()
            ->map(function ($company) {
                return [
                    'ID' => $company->id,
                    'Nom' => $company->name,
                    'Email' => $company->email,
                    'Type' => $company->company_type ?? 'Non spécifié',
                    'Site Web' => $company->website ?? 'Non spécifié',
                    'Description' => $company->description ?? 'Aucune',
                    'Statut' => $company->is_approved ? 'Approuvée' : 'En attente',
                    'Date d\'inscription' => $company->created_at->format('d/m/Y H:i'),
                ];
            });

        $filename = 'companies_export_' . now()->format('Y-m-d_H-i') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($companies) {
            $file = fopen('php://output', 'w');
            
            // BOM pour UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // En-têtes
            if ($companies->isNotEmpty()) {
                fputcsv($file, array_keys($companies->first()), ';');
                
                // Données
                foreach ($companies as $company) {
                    fputcsv($file, array_values($company), ';');
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}