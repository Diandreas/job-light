<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class CompanyAuthController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Auth/CompanyLogin');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        // Vérifier si l'entreprise est approuvée
        $company = Company::where('email', $credentials['email'])->first();
        if ($company && !$company->is_approved) {
            return back()->withErrors([
                'email' => 'Votre compte entreprise est en attente d\'approbation.',
            ])->onlyInput('email');
        }

        if (Auth::guard('company')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->intended(route('company-portal.index'));
        }

        return back()->withErrors([
            'email' => 'Ces identifiants ne correspondent à aucun compte entreprise.',
        ])->onlyInput('email');
    }

    public function showRegistrationForm()
    {
        return Inertia::render('Auth/CompanyRegister');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:companies',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'company_type' => 'nullable|string|max:255',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $company = Company::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'company_type' => $request->company_type,
            'website' => $request->website,
            'description' => $request->description,
            'is_approved' => false, // Les entreprises doivent être approuvées
        ]);

        // On ne connecte pas automatiquement car l'approbation est requise
        return redirect()->route('company.login')->with('message', 
            'Votre compte entreprise a été créé. Il sera activé après approbation par nos équipes.'
        );
    }

    public function logout(Request $request)
    {
        Auth::guard('company')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('company.login');
    }
}