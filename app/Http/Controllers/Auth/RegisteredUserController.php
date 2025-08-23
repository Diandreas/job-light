<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\SponsorshipController;
use App\Models\Profession;
use App\Models\User;
use App\Models\ReferralCode;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        $professions = Profession::all();
        $referralCode = $request->query('ref'); // Get referral code from URL query parameter

        return Inertia::render('Auth/Register', [
            'professions' => $professions,
            'referralCode' => $referralCode,
        ]);
    }

    /**
     * Generate a unique username from the given name
     */
    private function generateUniqueUsername(string $name): string
    {
        $baseUsername = Str::slug($name);
        $username = $baseUsername;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . '_' . $counter;
            $counter++;
        }

        return $username;
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
            'referralCode' => 'nullable|string|exists:referral_codes,code',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'username' => $this->generateUniqueUsername($request->name),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Process referral if a valid referral code was provided
        if ($request->referralCode) {
            try {
                $sponsorshipController = new SponsorshipController();
                $sponsorshipController->processReferral($request->referralCode, $user);

                Log::info('User registered with referral code', [
                    'user_id' => $user->id,
                    'referral_code' => $request->referralCode
                ]);
            } catch (\Exception $e) {
                Log::error('Error processing referral during registration', [
                    'error' => $e->getMessage(),
                    'user_id' => $user->id,
                    'referral_code' => $request->referralCode
                ]);
            }
        }

        return redirect()->intended(route('cv-infos.index', absolute: false));
    }
}
