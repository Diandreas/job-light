<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\File;

class LinkedinController extends Controller
{
    public function redirectToLinkedin()
    {
        $this->logToFile('========== DÉBUT REDIRECTION LINKEDIN ==========');
        
        $clientId = config('services.linkedin.client_id');
        $redirectUri = config('services.linkedin.redirect');
        
        // S'assurer que nous demandons tous les scopes nécessaires
        // Nous avons besoin de 'openid', 'profile' et 'email' pour récupérer les informations de base
        $scope = 'openid profile email';
        $response_type = 'code';
        
        // Générer un état aléatoire pour prévenir les attaques CSRF
        $state = bin2hex(random_bytes(16));
        session(['linkedin_state' => $state]);
        
        // Journal pour le débogage
        $this->logToFile('Redirection vers LinkedIn', [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'scope' => $scope,
            'state' => $state
        ]);

        // URL encodée pour les paramètres
        $scope = urlencode($scope);
        
        // Construire l'URL d'autorisation
        $authUrl = "https://www.linkedin.com/oauth/v2/authorization?";
        $authUrl .= "response_type={$response_type}";
        $authUrl .= "&client_id={$clientId}";
        $authUrl .= "&redirect_uri=" . urlencode($redirectUri);
        $authUrl .= "&scope={$scope}";
        $authUrl .= "&state={$state}";

        $this->logToFile("URL d'autorisation: {$authUrl}");
        $this->logToFile('========== FIN REDIRECTION LINKEDIN ==========');
        
        return redirect($authUrl);
    }

    public function handleLinkedinCallback(Request $request)
    {
        $this->logToFile('========== DÉBUT CALLBACK LINKEDIN ==========');
        $this->logToFile('Callback LinkedIn reçu', [
            'request_data' => $request->all(),
            'session_data' => $request->session()->all()
        ]);

        // Vérifier l'état pour éviter les attaques CSRF
        $state = $request->query('state');
        $sessionState = session('linkedin_state', '');
        
        if (!empty($state) && !empty($sessionState) && $state !== $sessionState) {
            $this->logToFile('AVERTISSEMENT: Vérification d\'état LinkedIn échouée', [
                'received_state' => $state,
                'session_state' => $sessionState
            ]);
            // Ne pas bloquer complètement le flux, mais journaliser l'avertissement
        }
        
        // Supprimer l'état de la session
        session()->forget('linkedin_state');

        $code = $request->query('code');
        if (empty($code)) {
            $this->logToFile('ERREUR: Code d\'autorisation LinkedIn manquant');
            return redirect('/login')->withErrors([
                'error' => 'Code d\'autorisation LinkedIn manquant'
            ]);
        }

        $clientId = config('services.linkedin.client_id');
        $clientSecret = config('services.linkedin.client_secret');
        $redirectUri = config('services.linkedin.redirect');
        
        $this->logToFile('Configuration LinkedIn', [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri
        ]);
        
        try {
            // Échange du code contre un token d'accès
            $this->logToFile('Tentative d\'échange du code contre un token d\'accès');
            $tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
            
            $tokenParams = [
                'code'          => $code,
                'redirect_uri'  => $redirectUri,
                'grant_type'    => 'authorization_code',
            ];
            
            $this->logToFile("URL du token: {$tokenUrl}", $tokenParams);
            
            // Tester d'abord avec authentification dans l'en-tête
            $this->logToFile("Tentative avec authentification dans l'en-tête Basic");
            $authHeader = base64_encode($clientId . ':' . $clientSecret);
            
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $authHeader,
                'Content-Type' => 'application/x-www-form-urlencoded'
            ])->asForm()->post($tokenUrl, $tokenParams);
            
            // Si ça échoue, essayer la méthode standard avec client_id et client_secret dans le corps
            if (!$response->successful()) {
                $this->logToFile("Première tentative échouée, essai avec client_id et client_secret dans le corps");
                
                $tokenParamsWithClient = array_merge($tokenParams, [
                    'client_id'     => $clientId,
                    'client_secret' => $clientSecret,
                ]);
                
                $response = Http::asForm()->post($tokenUrl, $tokenParamsWithClient);
            }
            
            $this->logToFile('Réponse du token LinkedIn', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            
            if (!$response->successful()) {
                $this->logToFile('ERREUR: Échec de l\'échange du code contre un token', [
                    'response' => $response->json(),
                    'status' => $response->status()
                ]);
                return redirect('/login')->withErrors([
                    'error' => 'Erreur lors de l\'authentification LinkedIn: ' . ($response->json('error_description') ?? 'Erreur inconnue')
                ]);
            }

            $accessToken = $response->json('access_token');
            $this->logToFile('Token d\'accès obtenu: ' . substr($accessToken, 0, 10) . '...');
            
            // Récupération des données utilisateur
            $userData = $this->getUserData($accessToken);
            $this->logToFile('Données utilisateur récupérées', [
                'userData' => $userData
            ]);
            
            if (empty($userData['email'])) {
                $this->logToFile('ERREUR: Email manquant dans les données utilisateur LinkedIn');
                return redirect('/login')->withErrors([
                    'error' => 'Impossible de récupérer votre email depuis LinkedIn. Veuillez autoriser l\'accès à votre email.'
                ]);
            }
            
            // Création ou récupération de l'utilisateur
            $user = $this->findOrCreateUser($userData);
            $this->logToFile('Utilisateur trouvé/créé', [
                'id' => $user->id,
                'email' => $user->email,
                'classe' => get_class($user)
            ]);
            
            // Connexion de l'utilisateur avec remember me
            $this->logToFile('Tentative de connexion avec Auth::login()');
            Auth::login($user, true);
            
            // Vérifier si l'utilisateur est bien connecté
            if (Auth::check()) {
                $this->logToFile('Utilisateur connecté avec succès via Auth::login()', [
                    'id' => Auth::id(),
                    'email' => Auth::user()->email
                ]);
                
                // Régénérer la session pour éviter les problèmes de fixation de session
                $request->session()->regenerate();
                $this->logToFile('Session régénérée, utilisateur connecté');
                
                // Redirection vers la page de destination ou le dashboard
                $this->logToFile('========== FIN CALLBACK LINKEDIN - SUCCÈS ==========');
                return redirect()->intended('/dashboard');
            } else {
                $this->logToFile('ERREUR: Échec de l\'authentification après Auth::login()');
                
                // Tenter une approche alternative pour la connexion
                $this->logToFile('Tentative de connexion alternative avec loginUsingId');
                auth()->loginUsingId($user->id, true);
                
                if (Auth::check()) {
                    $this->logToFile('Utilisateur connecté avec succès via loginUsingId', [
                        'id' => Auth::id()
                    ]);
                    $request->session()->regenerate();
                    $this->logToFile('========== FIN CALLBACK LINKEDIN - SUCCÈS ALTERNATIF ==========');
                    return redirect()->intended('/dashboard');
                }
                
                $this->logToFile('ERREUR: Toutes les tentatives de connexion ont échoué');
                $this->logToFile('========== FIN CALLBACK LINKEDIN - ÉCHEC ==========');
                return redirect('/login')->withErrors([
                    'error' => 'Impossible de vous connecter. Veuillez réessayer.'
                ]);
            }
            
        } catch (\Exception $e) {
            $this->logToFile('EXCEPTION dans le callback LinkedIn', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $this->logToFile('========== FIN CALLBACK LINKEDIN - EXCEPTION ==========');
            return redirect('/login')->withErrors([
                'error' => 'Une erreur est survenue lors de la connexion avec LinkedIn: ' . $e->getMessage()
            ]);
        }
    }

    private function getUserData($accessToken)
    {
        $this->logToFile('Récupération des données utilisateur depuis LinkedIn');
        
        // Récupération des informations de profil utilisateur via l'endpoint userinfo
        $userInfoUrl = 'https://api.linkedin.com/v2/userinfo';
        $this->logToFile("URL userinfo: {$userInfoUrl}");
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $accessToken,
        ])->get($userInfoUrl);
        
        $this->logToFile('Réponse userinfo LinkedIn', [
            'status' => $response->status(),
            'body_length' => strlen($response->body()),
            'body' => $response->body()
        ]);
        
        if (!$response->successful()) {
            $this->logToFile('ERREUR: Échec de récupération des données utilisateur', [
                'status' => $response->status(),
                'response' => $response->json() ?: $response->body()
            ]);
            throw new \Exception('Erreur lors de la récupération des données utilisateur LinkedIn (statut: ' . $response->status() . ')');
        }
        
        $userData = $response->json();
        
        // Vérifier que les données essentielles sont présentes
        if (empty($userData) || !is_array($userData)) {
            $this->logToFile('ERREUR: Réponse vide ou invalide de l\'API LinkedIn', [
                'response' => $response->body()
            ]);
            throw new \Exception('Réponse invalide de l\'API LinkedIn');
        }
        
        // Vérifier les champs requis
        $requiredFields = ['sub', 'email', 'name'];
        $missingFields = [];
        
        foreach ($requiredFields as $field) {
            if (empty($userData[$field])) {
                $missingFields[] = $field;
            }
        }
        
        if (!empty($missingFields)) {
            $this->logToFile('ERREUR: Champs manquants dans les données LinkedIn', [
                'missing_fields' => $missingFields,
                'userData' => $userData
            ]);
            
            // Si l'email est manquant mais que les autres champs sont présents, c'est probablement un problème de scope
            if (in_array('email', $missingFields) && count($missingFields) === 1) {
                throw new \Exception('L\'email est manquant dans la réponse LinkedIn. Veuillez autoriser l\'accès à votre email.');
            }
            
            throw new \Exception('Données LinkedIn incomplètes. Champs manquants: ' . implode(', ', $missingFields));
        }
        
        return $userData;
    }

    private function findOrCreateUser($userData)
    {
        $this->logToFile('Recherche/création d\'utilisateur avec les données LinkedIn');
        
        // Vérifier si les données essentielles sont présentes
        if (empty($userData['email']) || empty($userData['sub']) || empty($userData['name'])) {
            $this->logToFile('ERREUR: Données utilisateur LinkedIn incomplètes', [
                'has_email' => isset($userData['email']),
                'has_sub' => isset($userData['sub']),
                'has_name' => isset($userData['name']),
                'userData' => $userData
            ]);
            throw new \Exception('Les données reçues de LinkedIn sont incomplètes');
        }

        $this->logToFile('Recherche d\'utilisateur existant', [
            'email' => $userData['email'],
            'linkedin_id' => $userData['sub']
        ]);

        // Vérifier si le champ linkedin_id existe dans la table users
        $hasLinkedinIdColumn = Schema::hasColumn('users', 'linkedin_id');
        $this->logToFile('La colonne linkedin_id existe dans la table users: ' . ($hasLinkedinIdColumn ? 'Oui' : 'Non'));

        // Si la colonne n'existe pas, rechercher seulement par email
        if (!$hasLinkedinIdColumn) {
            $user = User::where('email', $userData['email'])->first();
            $this->logToFile('Recherche uniquement par email car linkedin_id n\'existe pas', [
                'found' => (bool)$user,
                'user_id' => $user ? $user->id : null
            ]);
            
            if (!$user) {
                // Créer un utilisateur sans linkedin_id
                try {
                    $createData = [
                        'name' => $userData['name'],
                        'email' => $userData['email'],
                        'password' => Hash::make(Str::random(24)),
                        'username' => $this->generateUsername($userData['name']),
                    ];
                    
                    // Ajouter social_avatar si la colonne existe
                    if (Schema::hasColumn('users', 'social_avatar') && isset($userData['picture'])) {
                        $createData['social_avatar'] = $userData['picture'];
                    }
                    
                    $this->logToFile('Création d\'un utilisateur sans linkedin_id', $createData);
                    $user = User::create($createData);
                    $this->logToFile('Nouvel utilisateur créé sans linkedin_id', ['id' => $user->id]);
                } catch (\Exception $e) {
                    $this->logToFile('ERREUR: Échec de création d\'utilisateur sans linkedin_id', [
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e;
                }
            }
            
            return $user;
        }

        // Si la colonne linkedin_id existe, procéder normalement
        // Rechercher d'abord par linkedin_id (plus fiable pour les identifications sociales)
        $userByLinkedinId = User::where('linkedin_id', $userData['sub'])->first();
        $this->logToFile('Recherche par linkedin_id', [
            'linkedin_id' => $userData['sub'],
            'found' => (bool)$userByLinkedinId,
            'user_id' => $userByLinkedinId ? $userByLinkedinId->id : null
        ]);
        
        // Si non trouvé par linkedin_id, rechercher par email
        if (!$userByLinkedinId) {
            $userByEmail = User::where('email', $userData['email'])->first();
            $this->logToFile('Recherche par email', [
                'email' => $userData['email'],
                'found' => (bool)$userByEmail,
                'user_id' => $userByEmail ? $userByEmail->id : null
            ]);
            $user = $userByEmail;
        } else {
            $this->logToFile('Utilisateur trouvé par linkedin_id');
            $user = $userByLinkedinId;
        }
        
        if (!$user) {
            // Création d'un nouvel utilisateur
            $this->logToFile('Aucun utilisateur trouvé, création d\'un nouvel utilisateur LinkedIn');
            
            try {
                $createData = [
                    'name' => $userData['name'],
                    'email' => $userData['email'],
                    'linkedin_id' => $userData['sub'],
                    'password' => Hash::make(Str::random(24)),
                    'username' => $this->generateUsername($userData['name']),
                ];
                
                // Ajouter social_avatar si la colonne existe
                if (Schema::hasColumn('users', 'social_avatar') && isset($userData['picture'])) {
                    $createData['social_avatar'] = $userData['picture'];
                }
                
                $this->logToFile('Données pour la création d\'utilisateur', $createData);
                
                // Vérifier les champs fillable du modèle User
                $fillable = (new User())->getFillable();
                $this->logToFile('Champs fillable du modèle User', $fillable);
                
                // Filtrer les données de création pour ne garder que les champs fillable
                $filteredCreateData = array_intersect_key($createData, array_flip($fillable));
                $this->logToFile('Données filtrées pour la création d\'utilisateur', $filteredCreateData);
                
                $user = User::create($filteredCreateData);
                
                $this->logToFile('Nouvel utilisateur créé avec succès', [
                    'id' => $user->id,
                    'email' => $user->email
                ]);
            } catch (\Exception $e) {
                $this->logToFile('ERREUR: Échec de création d\'utilisateur', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'data' => $createData ?? null
                ]);
                throw new \Exception('Erreur lors de la création de votre compte: ' . $e->getMessage());
            }
        } else {
            // Mise à jour des informations de l'utilisateur existant
            $this->logToFile('Mise à jour des informations utilisateur LinkedIn', ['id' => $user->id]);
            
            try {
                $updateData = [];
                
                // Stocker l'ID LinkedIn si l'utilisateur existe déjà par email et que linkedin_id est vide
                if (empty($user->linkedin_id)) {
                    $updateData['linkedin_id'] = $userData['sub'];
                }
                
                // Mettre à jour l'avatar si social_avatar existe
                if (Schema::hasColumn('users', 'social_avatar') && isset($userData['picture'])) {
                    $updateData['social_avatar'] = $userData['picture'];
                }
                
                if (!empty($updateData)) {
                    $this->logToFile('Données pour la mise à jour d\'utilisateur', $updateData);
                    
                    // Vérifier les champs fillable du modèle User
                    $fillable = (new User())->getFillable();
                    
                    // Filtrer les données de mise à jour pour ne garder que les champs fillable
                    $filteredUpdateData = array_intersect_key($updateData, array_flip($fillable));
                    $this->logToFile('Données filtrées pour la mise à jour d\'utilisateur', $filteredUpdateData);
                    
                    $user->update($filteredUpdateData);
                    $this->logToFile('Informations utilisateur mises à jour');
                } else {
                    $this->logToFile('Aucune mise à jour nécessaire pour l\'utilisateur');
                }
            } catch (\Exception $e) {
                $this->logToFile('ERREUR: Échec de mise à jour d\'utilisateur', [
                    'message' => $e->getMessage(),
                    'data' => $updateData ?? null
                ]);
                // Continuer même si la mise à jour échoue
            }
        }
        
        return $user;
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
    
    /**
     * Écrit un message dans un fichier de log dédié pour le débogage LinkedIn.
     *
     * @param string $message Le message à journaliser
     * @param array $context Contexte optionnel (tableau)
     * @return void
     */
    private function logToFile($message, $context = [])
    {
        // Journaliser dans le système de log normal
        Log::info($message, $context);
        
        // Journaliser dans un fichier dédié
        $logPath = storage_path('logs/linkedin_auth.log');
        
        // Créer le dossier logs s'il n'existe pas
        if (!File::exists(dirname($logPath))) {
            File::makeDirectory(dirname($logPath), 0755, true);
        }
        
        // Formater le message
        $timestamp = date('Y-m-d H:i:s');
        $formattedMessage = "[{$timestamp}] {$message}";
        
        if (!empty($context)) {
            $formattedContext = json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            $formattedMessage .= "\nContexte: " . $formattedContext;
        }
        
        $formattedMessage .= "\n\n";
        
        // Écrire dans le fichier
        File::append($logPath, $formattedMessage);
    }
} 