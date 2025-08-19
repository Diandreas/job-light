<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('can:access-admin');
    }

    public function index(Request $request)
    {
        $query = User::with(['cvInfos', 'portfolioSettings'])
            ->withCount(['referrals'])
            ->where('UserType', '!=', 1); // Exclure les admins

        // Filtres de recherche
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('full_profession', 'like', "%{$request->search}%");
            });
        }

        if ($request->userType) {
            $query->where('UserType', $request->userType);
        }

        if ($request->hasPortfolio !== null) {
            if ($request->hasPortfolio) {
                $query->whereHas('portfolioSettings');
            } else {
                $query->whereDoesntHave('portfolioSettings');
            }
        }

        if ($request->dateFrom) {
            $query->whereDate('created_at', '>=', $request->dateFrom);
        }

        if ($request->dateTo) {
            $query->whereDate('created_at', '<=', $request->dateTo);
        }

        $users = $query->latest()
            ->paginate(20)
            ->withQueryString();

        $stats = [
            'total' => User::where('UserType', '!=', 1)->count(),
            'active' => User::where('UserType', '!=', 1)->whereNotNull('email_verified_at')->count(),
            'withPortfolio' => User::where('UserType', '!=', 1)->whereHas('portfolioSettings')->count(),
//            'withCv' => User::where('UserType', '!=', 1)->whereHas('cvInfos')->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'userType', 'hasPortfolio', 'dateFrom', 'dateTo']),
        ]);
    }

    public function show(User $user)
    {
        $user->load([
            'cvInfos' => function ($query) {
                $query->latest()->limit(5);
            },
            'portfolioSettings',
            'referrals.referred',
            'competences',
            'hobbies',
            'profession',
            'languages'
        ]);

        $auditLogs = AuditLog::where('model_type', User::class)
            ->where('model_id', $user->id)
            ->with('admin')
            ->latest()
            ->limit(10)
            ->get();

        $stats = [
            'totalCvs' => $user->cvInfos()->count(),
            'totalReferrals' => $user->referrals()->count(),
            'walletBalance' => $user->wallet_balance ?? 0,
            'joinedDaysAgo' => $user->created_at->diffInDays(),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'auditLogs' => $auditLogs,
            'stats' => $stats,
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $oldValues = $user->toArray();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'UserType' => 'required|in:1,2',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'full_profession' => 'nullable|string|max:255',
            'wallet_balance' => 'nullable|numeric|min:0',
            'password' => 'nullable|min:8|confirmed',
        ]);

        $data = $request->except(['password', 'password_confirmation']);

        if ($request->password) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        // Log de l'action
        AuditLog::logAction(
            'updated',
            $user,
            $oldValues,
            $user->fresh()->toArray(),
            "Modification du profil utilisateur par l'admin"
        );

        return redirect()->route('admin.users.show', $user)
            ->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function destroy(User $user)
    {
        if ($user->UserType === 1) {
            return back()->withErrors(['error' => 'Impossible de supprimer un administrateur.']);
        }

        $oldValues = $user->toArray();

        $user->delete();

        // Log de l'action
        AuditLog::logAction(
            'deleted',
            $user,
            $oldValues,
            null,
            "Suppression de l'utilisateur {$user->name} par l'admin"
        );

        return redirect()->route('admin.users.index')
            ->with('success', 'Utilisateur supprimé avec succès.');
    }

    public function toggleStatus(Request $request, User $user)
    {
        if ($user->UserType === 1) {
            return back()->withErrors(['error' => 'Impossible de modifier le statut d\'un administrateur.']);
        }

        $oldValues = $user->toArray();
        $newStatus = $request->status === 'active' ? 2 : 0; // 2 = actif, 0 = suspendu

        $user->update(['UserType' => $newStatus]);

        // Log de l'action
        AuditLog::logAction(
            $newStatus === 2 ? 'activated' : 'suspended',
            $user,
            $oldValues,
            $user->fresh()->toArray(),
            $newStatus === 2 ?
                "Activation du compte de {$user->name}" :
                "Suspension du compte de {$user->name}"
        );

        return back()->with('success',
            $newStatus === 2 ?
                'Utilisateur activé avec succès.' :
                'Utilisateur suspendu avec succès.'
        );
    }

    public function resetPassword(User $user)
    {
        if ($user->UserType === 1) {
            return back()->withErrors(['error' => 'Impossible de réinitialiser le mot de passe d\'un administrateur.']);
        }

        $temporaryPassword = 'Password123!';
        $oldValues = ['password_reset' => false];

        $user->update([
            'password' => Hash::make($temporaryPassword),
        ]);

        // Log de l'action
        AuditLog::logAction(
            'password_reset',
            $user,
            $oldValues,
            ['password_reset' => true],
            "Réinitialisation du mot de passe de {$user->name}"
        );

        return back()->with('success',
            "Mot de passe réinitialisé. Nouveau mot de passe temporaire: {$temporaryPassword}"
        );
    }

    public function exportUsers(Request $request)
    {
        $query = User::where('UserType', '!=', 1);

        // Appliquer les mêmes filtres que l'index
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $users = $query->with(['portfolioSettings', 'profession'])
            ->get()
            ->map(function ($user) {
                return [
                    'ID' => $user->id,
                    'Nom' => $user->name,
                    'Email' => $user->email,
                    'Téléphone' => $user->phone_number,
                    'Profession' => $user->full_profession,
                    'Type' => $user->UserType == 2 ? 'Actif' : 'Suspendu',
                    'Portfolio' => $user->portfolioSettings ? 'Oui' : 'Non',
                    'Visibilité Portfolio' => $user->portfolioSettings?->visibility ?? 'N/A',
                    'Solde Wallet' => $user->wallet_balance ?? 0,
                    'Date d\'inscription' => $user->created_at->format('d/m/Y H:i'),
                ];
            });

        $filename = 'users_export_' . now()->format('Y-m-d_H-i') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($users) {
            $file = fopen('php://output', 'w');

            // BOM pour UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // En-têtes
            if ($users->isNotEmpty()) {
                fputcsv($file, array_keys($users->first()), ';');

                // Données
                foreach ($users as $user) {
                    fputcsv($file, array_values($user), ';');
                }
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
