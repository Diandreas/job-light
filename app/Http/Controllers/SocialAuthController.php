<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Rediriger vers le fournisseur d'authentification.
     *
     * @param string $provider
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToProvider($provider)
    {
        Log::info('Redirection vers le provider: ' . $provider);
        
        try {
            return Socialite::driver($provider)->redirect();
        } catch (Exception $e) {
            Log::error('Erreur lors de la redirection: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect('/login')->withErrors([
                'error' => 'Erreur lors de la connexion avec ' . ucfirst($provider) . ': ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Obtenir les informations utilisateur du fournisseur d'authentification.
     *
     * @param string $provider
     * @return \Illuminate\Routing\Redirector|\Illuminate\Http\RedirectResponse
     */
    public function handleProviderCallback($provider)
    {
        Log::info('Callback reçu du provider: ' . $provider);
        
        try {
            $socialUser = Socialite::driver($provider)->user();
            
            Log::info('Utilisateur récupéré depuis ' . $provider, [
                'id' => $socialUser->getId(),
                'email' => $socialUser->getEmail(),
                'name' => $socialUser->getName(),
            ]);
            
            // Rechercher l'utilisateur par son ID du provider ou son email
            $user = User::where("{$provider}_id", $socialUser->getId())
                ->orWhere('email', $socialUser->getEmail())
                ->first();
            
            Log::info('Recherche utilisateur: ' . ($user ? 'trouvé' : 'non trouvé'));
            
            // Si l'utilisateur n'existe pas, le créer
            if (!$user) {
                Log::info("Création d'un nouvel utilisateur");
                // Générer un mot de passe aléatoire
                $password = Str::random(16);
                
                try {
                    $user = User::create([
                        'name' => $socialUser->getName(),
                        'email' => $socialUser->getEmail(),
                        'password' => Hash::make($password),
                        "{$provider}_id" => $socialUser->getId(),
                        'social_avatar' => $socialUser->getAvatar(),
                        'social_token' => $socialUser->token,
                        'social_refresh_token' => $socialUser->refreshToken ?? null,
                        'username' => $this->generateUsername($socialUser->getName()),
                    ]);
                    Log::info('Nouvel utilisateur créé avec succès', ['id' => $user->id]);
                } catch (Exception $e) {
                    Log::error('Erreur lors de la création de l\'utilisateur: ' . $e->getMessage(), [
                        'exception' => $e
                    ]);
                    throw $e;
                }
            } else {
                Log::info('Mise à jour des informations sociales de l\'utilisateur', ['id' => $user->id]);
                // Mettre à jour les informations sociales de l'utilisateur
                try {
                    $user->update([
                        "{$provider}_id" => $socialUser->getId(),
                        'social_avatar' => $socialUser->getAvatar(),
                        'social_token' => $socialUser->token,
                        'social_refresh_token' => $socialUser->refreshToken ?? null,
                    ]);
                    Log::info('Informations sociales mises à jour avec succès');
                } catch (Exception $e) {
                    Log::error('Erreur lors de la mise à jour de l\'utilisateur: ' . $e->getMessage());
                    throw $e;
                }
            }
            
            // Connecter l'utilisateur
            Log::info('Tentative de connexion de l\'utilisateur', ['id' => $user->id]);
            Auth::login($user);
            
            if (Auth::check()) {
                Log::info('Utilisateur connecté avec succès');
                return redirect('/dashboard');
            } else {
                Log::error('Échec de la connexion après Auth::login()');
                return redirect('/login')->withErrors([
                    'error' => 'Impossible de vous connecter. Veuillez réessayer.'
                ]);
            }
            
        } catch (Exception $e) {
            // Gérer les erreurs
            Log::error('Exception dans handleProviderCallback: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect('/login')->withErrors([
                'error' => 'Une erreur est survenue lors de la connexion avec ' . ucfirst($provider) . ': ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Générer un nom d'utilisateur unique.
     *
     * @param string $name
     * @return string
     */
    private function generateUsername($name)
    {
        // Créer un slug à partir du nom
        $baseUsername = Str::slug($name);
        $username = $baseUsername;
        $counter = 1;
        
        // Vérifier si le nom d'utilisateur existe déjà
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }
        
        return $username;
    }
}
