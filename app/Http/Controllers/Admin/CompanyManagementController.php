<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Company::with(['users']);
        
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('industry', 'like', '%' . $request->search . '%');
            });
        }
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        $companies = $query->orderBy('created_at', 'desc')->paginate(20);
        
        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
            'filters' => $request->only(['search', 'status']),
        ]);
    }
    
    public function show(Company $company)
    {
        $company->load(['users']);
        
        return Inertia::render('Admin/Companies/Show', [
            'company' => $company,
        ]);
    }
    
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive,suspended',
            'notes' => 'nullable|string',
        ]);
        
        $company->update($validated);
        
        return redirect()->back()->with('success', 'Company updated successfully.');
    }
}