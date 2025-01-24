<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Profession;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $professions = Profession::all();

        return Inertia::render('Auth/Register', [
            'professions' => $professions,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
//            'profession_id' => 'required|exists:professions,id', // Assurez-vous que l'ID de la profession existe dans la table des professions
//            'surname' => 'nullable|string|max:45',
//            'github' => 'nullable|string|max:255',
//            'linkedin' => 'nullable|string|max:255',
//            'address' => 'nullable|string|max:255',
//            'phone_number' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
//            'profession_id' => $request->profession_id,
//            'surname' => $request->surname,
//            'github' => $request->github,
//            'linkedin' => $request->linkedin,
//            'address' => $request->address,
//            'phone_number' => $request->phone_number,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('cv-infos.index', absolute: false));

    }
}
