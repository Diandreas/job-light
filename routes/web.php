<?php

use App\Http\Controllers\{AddressController,
    CareerAdvisorController,
    ChatHistoryController,
    CompetenceController,
    CvColorController,
    CvInfosController,
    CvModelController,
    DocumentExportController,
    ExperienceCategoryController,
    ExperienceController,
    HobbyController,
    LanguageController,
    NotchPayController,
    CinetPayController,
    PaymentController,
    PayPalController,
    PersonalInformationController,
    PortfolioController,
    ProfessionCategoryController,
    ProfessionController,
    ProfessionMissionController,
    ProfileController,
    ServiceController,
    SponsorshipController,
    SummaryController,
    UserCompetenceController,
    UserHobbyController,
    UserProfessionsController,
    UserlanguageController,
    Admin\ReferralLevelController,
    Admin\AnalyticsController,
    Admin\AuditLogController,
    Admin\CompanyManagementController};
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('language/{locale}', [LanguageController::class, 'switch'])->name('language.switch');

// Route pour servir les fichiers de traduction JSON
Route::get('/lang/{locale}.json', function ($locale) {
    $path = resource_path("../lang/{$locale}.json");
    if (file_exists($path)) {
        return response()->json(json_decode(file_get_contents($path), true));
    }
    return response()->json([]);
});

// Route pour servir les images de templates CV depuis la base de données
Route::get('/images/cv-previews/{imageName}.png', function ($imageName) {
    // Chercher le modèle CV par nom d'image
    $cvModel = \App\Models\CvModel::where('previewImagePath', "/images/cv-previews/{$imageName}.png")
        ->orWhere('name', 'like', "%{$imageName}%")
        ->first();
    
    if (!$cvModel) {
        abort(404);
    }
    
    // Si c'est un chemin vers un fichier physique (en enlevant le / du début)
    $filePath = ltrim($cvModel->previewImagePath, '/');
    if ($cvModel->previewImagePath && file_exists(public_path($filePath))) {
        return response()->file(public_path($filePath));
    }
    
    // Si c'est des données base64 en base
    if ($cvModel->previewImagePath && str_starts_with($cvModel->previewImagePath, 'data:image/')) {
        $imageData = explode(',', $cvModel->previewImagePath)[1];
        $imageData = base64_decode($imageData);
        
        return response($imageData)
            ->header('Content-Type', 'image/png')
            ->header('Cache-Control', 'public, max-age=86400');
    }
    
    // Générer un placeholder SVG dynamique
    $colors = [
        'international' => '#3498db',
        'digital' => '#2ecc71', 
        'luxe' => '#f39c12',
        'elegant' => '#9b59b6',
        'technique' => '#e74c3c',
        'moderne' => '#1abc9c',
        'classique' => '#34495e',
        'minimaliste' => '#95a5a6',
        'creatif' => '#e67e22',
        'corporatif' => '#2c3e50'
    ];
    
    $color = $colors[strtolower($imageName)] ?? '#3498db';
    $name = ucfirst($imageName);
    
    $svg = '<?xml version="1.0" encoding="UTF-8"?>
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:' . $color . ';stop-opacity:1" />
                <stop offset="100%" style="stop-color:' . $color . '80;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="300" height="400" fill="url(#grad)"/>
        <rect x="20" y="30" width="260" height="340" fill="white" rx="8"/>
        <rect x="30" y="40" width="80" height="80" fill="' . $color . '20" rx="40"/>
        <rect x="130" y="50" width="140" height="8" fill="' . $color . '40" rx="4"/>
        <rect x="130" y="70" width="100" height="6" fill="' . $color . '30" rx="3"/>
        <rect x="30" y="140" width="240" height="4" fill="' . $color . '20" rx="2"/>
        <rect x="30" y="155" width="200" height="4" fill="' . $color . '20" rx="2"/>
        <rect x="30" y="170" width="180" height="4" fill="' . $color . '20" rx="2"/>
        <rect x="30" y="200" width="240" height="6" fill="' . $color . '" rx="3"/>
        <rect x="30" y="220" width="180" height="4" fill="' . $color . '40" rx="2"/>
        <rect x="30" y="235" width="200" height="4" fill="' . $color . '40" rx="2"/>
        <rect x="30" y="250" width="160" height="4" fill="' . $color . '40" rx="2"/>
        <rect x="30" y="280" width="240" height="6" fill="' . $color . '" rx="3"/>
        <rect x="30" y="300" width="100" height="4" fill="' . $color . '40" rx="2"/>
        <rect x="150" y="300" width="80" height="4" fill="' . $color . '40" rx="2"/>
        <text x="150" y="360" text-anchor="middle" fill="' . $color . '" font-family="Arial, sans-serif" font-size="14" font-weight="bold">CV ' . $name . '</text>
    </svg>';
    
    return response($svg)
        ->header('Content-Type', 'image/svg+xml')
        ->header('Cache-Control', 'public, max-age=86400');
})->where('imageName', '[a-zA-Z0-9\-_]+');
Route::get('/support', function () {
    return Inertia::render('Support');
})->name('support');
Route::get('/privacy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('TermsOfService');
})->name('terms');

Route::get('/cookies', function () {
    return Inertia::render('CookiePolicy');
})->name('cookies');

Route::get('/mentions-legales', function () {
    return Inertia::render('LegalNotice');
})->name('mentions-legales');


// Routes Blog avec SEO
Route::prefix('blog')->name('blog.')->group(function () {
    // Liste des articles
    Route::get('/', [App\Http\Controllers\BlogController::class, 'index'])->name('index');
    
    // Article spécifique
    Route::get('/{slug}', [App\Http\Controllers\BlogController::class, 'show'])->name('show');
    
    // SEO et feeds
    Route::get('/sitemap.xml', [App\Http\Controllers\BlogController::class, 'sitemap'])->name('sitemap');
    Route::get('/rss.xml', [App\Http\Controllers\BlogController::class, 'rss'])->name('rss');
    
    // API recherche
    Route::get('/api/search', [App\Http\Controllers\BlogController::class, 'search'])->name('search');
});

// Ancien article (redirection pour compatibilité)
Route::get('/blog/comparaison', function () {
    return view('blog-comparaison-autonome');
})->name('blog.comparaison-autonome');

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');
// Routes NotchPay
Route::post('/api/notchpay/webhook', [NotchPayController::class, 'handleWebhook'])->name('notchpay.webhook');
Route::get('/payment/callback', [NotchPayController::class, 'handleCallback'])->name('payment.callback');

// Routes CinetPay - Configuration corrigée
Route::post('/payment/initiate', [PaymentController::class, 'initiatePayment'])->name('payment.initiate');
Route::post('/payment/notify', [PaymentController::class, 'notify'])->name('payment.notify');
Route::get('/payment/return', [PaymentController::class, 'return'])->name('payment.return');
Route::post('/payment/return', [PaymentController::class, 'return'])->name('payment.return.post');

// Routes CinetPay alternatives (backup)
Route::post('/api/cinetpay/notify', [CinetPayController::class, 'notify']); // Webhook public
Route::get('/api/cinetpay/return', [CinetPayController::class, 'return']);
Route::post('/api/cinetpay/return', [CinetPayController::class, 'return']); // Support POST pour les retours

// Route API pour callback CinetPay (sans CSRF)
Route::post('/api/cinetpay/callback', [CinetPayController::class, 'return'])->name('api.cinetpay.callback');

// Route webhook spécifique pour CinetPay (sans middleware web)
Route::match(['get', 'post'], '/webhook/cinetpay/callback', [App\Http\Controllers\CinetPayWebhookController::class, 'handleCallback'])
    ->name('webhook.cinetpay.callback')
    ->withoutMiddleware(['web', 'csrf']);

// URL de retour principale (doit supporter GET et POST selon la doc CinetPay)
Route::get('/payment/cinetpay/callback', [CinetPayController::class, 'return'])->name('payment.cinetpay.callback');
Route::post('/payment/cinetpay/callback', [CinetPayController::class, 'return'])->name('payment.cinetpay.callback.post');

// Pages de résultat de paiement
Route::get('/payment/success', function () {
    return Inertia::render('Payment/Success', [
        'message' => session('success', 'Paiement effectué avec succès'),
        'transaction_id' => session('transaction_id'),
        'amount' => session('amount')
    ]);
})->name('payment.success');

Route::get('/payment/failed', function () {
    return Inertia::render('Payment/Failed', [
        'error' => session('error', 'Le paiement a échoué')
    ]);
})->name('payment.failed');

// Routes CinetPay pour paiements guest
Route::post('/api/cinetpay/guest/initialize', [App\Http\Controllers\GuestPaymentController::class, 'initializeGuestPayment'])->name('guest-payment.cinetpay.initialize');
Route::post('/api/cinetpay/guest/notify', [App\Http\Controllers\GuestPaymentController::class, 'notifyGuest'])->name('guest-payment.cinetpay.notify');
Route::get('/api/cinetpay/guest/return', [App\Http\Controllers\GuestPaymentController::class, 'returnGuest'])->name('guest-payment.cinetpay.return');
Route::post('/api/cv/analyze', [CareerAdvisorController::class, 'analyzeCV'])
    ->name('cv.analyze')
    ->middleware(['auth']);
Route::delete('personal-information/photo', [PersonalInformationController::class, 'deletePhoto'])
    ->name('personal-information.delete-photo');
Route::get('/payment', [PaymentController::class, 'index'])->name('payment.index');

Route::post('/api/paypal/capture-payment', [PayPalController::class, 'capturePayment'])->middleware(['auth']);
Route::prefix('career-advisor')->group(function () {
    Route::get('/', [CareerAdvisorController::class, 'index'])->name('career-advisor.index');
    Route::get('/chats', [CareerAdvisorController::class, 'getUserChats'])->name('career-advisor.chats');
    Route::get('/chats/{contextId}', [CareerAdvisorController::class, 'show'])->name('career-advisor.chat.show');
    Route::post('/chat', [CareerAdvisorController::class, 'chat'])->name('career-advisor.chat');
    Route::post('/export', [CareerAdvisorController::class, 'export'])->name('career-advisor.export');
    Route::delete('/chats/{contextId}', [CareerAdvisorController::class, 'destroyChat'])->name('career-advisor.destroy');
});
    Route::get('/cv/{id}/download', [CvInfosController::class, 'downloadPdf'])->name('cv.download');

// Live Preview Route (authentifié)
Route::post('/api/cv/live-preview', [CvInfosController::class, 'livePreview'])
    ->name('cv.preview.live')
    ->middleware(['auth']);

// Chat History Routes
Route::prefix('api')->middleware(['auth'])->group(function () {
    Route::get('/chat-history/{contextId}', [ChatHistoryController::class, 'show']);
    Route::delete('/chat-history/{contextId}', [ChatHistoryController::class, 'destroy']);
    Route::get('/chat-histories', [ChatHistoryController::class, 'index']);

    // Document Export Routes
    Route::get('/exports', [DocumentExportController::class, 'index']);
    Route::get('/exports/{export}', [DocumentExportController::class, 'download']);
    Route::delete('/exports/{export}', [DocumentExportController::class, 'destroy']);
});
Route::middleware(['auth'])->group(function () {

    // Route NotchPay d'initialisation (méthode principale)
    Route::post('/api/notchpay/initialize', [NotchPayController::class, 'initializePayment']);
    // Route CinetPay d'initialisation (option de backup)
    Route::post('/api/cinetpay/initialize', [CinetPayController::class, 'initialize']);

    Route::post('/api/cv/update-color', [CvColorController::class, 'updateColor'])->name('cv.updateColor');

    // Route pour réinitialiser la couleur à la valeur par défaut
    Route::post('/api/cv-color/reset', [CvColorController::class, 'resetColor'])
        ->name('cv-color.reset');

    // Route pour récupérer la couleur actuelle
    Route::get('/api/cv-color/current', [CvColorController::class, 'getCurrentColor'])
        ->name('cv-color.current');

    Route::post('/api/cv/update-field', [CvInfosController::class, 'updateField'])->name('cv.updateField');
    Route::post('/api/cv/rephrase', [CvInfosController::class, 'rephraseContent'])->name('cv.rephrase');

    Route::post('/career-advisor/export', [CareerAdvisorController::class, 'export'])
        ->name('career-advisor.export');
    Route::post('/api/process-question-cost', [PaymentController::class, 'processQuestionCost']);
    Route::get('/api/check-download-status/{modelId}', [PaymentController::class, 'checkDownloadStatus']);
    Route::post('/api/update-wallet', [PaymentController::class, 'updateWallet']);
    Route::post('/api/process-download', [PaymentController::class, 'processDownload']);
    Route::get('/api/wallet/balance', [PaymentController::class, 'getBalance']);
        Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
    Route::get('/portfolio/edit', [PortfolioController::class, 'edit'])->name('portfolio.edit');
    Route::put('/portfolio', [PortfolioController::class, 'update'])->name('portfolio.update');
    
    // Portfolio sections management
    Route::post('/portfolio/sections', [PortfolioController::class, 'createSection'])->name('portfolio.sections.create');
    Route::put('/portfolio/sections/{section}', [PortfolioController::class, 'updateSection'])->name('portfolio.sections.update');
    Route::delete('/portfolio/sections/{section}', [PortfolioController::class, 'deleteSection'])->name('portfolio.sections.delete');
    Route::put('/portfolio/sections/{section}/toggle', [PortfolioController::class, 'toggleSectionActive'])->name('portfolio.sections.toggle');
    Route::post('/portfolio/sections/order', [PortfolioController::class, 'updateSectionOrder'])->name('portfolio.sections.order');
    
    // Services management
    Route::resource('services', ServiceController::class);
    Route::post('/services/order', [ServiceController::class, 'updateOrder'])->name('services.order');
    Route::delete('/service-images/{image}', [ServiceController::class, 'deleteImage'])->name('service-images.delete');
    Route::post('/services/{service}/images/order', [ServiceController::class, 'updateImageOrder'])->name('services.images.order');
});

Route::get('/portfolio/{identifier}', [PortfolioController::class, 'show'])
    ->name('portfolio.show')
    ->where('identifier', '.*');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::delete('/experiences/{experience}/attachment', [ExperienceController::class, 'deleteAttachment'])
        ->name('experiences.attachment.delete');


    Route::get('/career-advisor', [CareerAdvisorController::class, 'index'])->name('career-advisor.index');
    Route::post('/career-advisor/advice', [CareerAdvisorController::class, 'getAdvice'])->name('career-advisor.advice');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // CV Information
    Route::resource('cv-infos', CvInfosController::class);
    Route::get('/cv-preview/{id}', [CvInfosController::class, 'previewCv'])
        ->name('cv.preview')
        ->middleware(['auth', 'check.print']);
    Route::get('/cv-preview-html/{id}', [CvInfosController::class, 'previewCvHtml'])
        ->name('cv.preview.html')
        ->middleware(['auth']);
//    Route::get('/cv-download/{id}', [CvInfosController::class, 'downloadPdf'])->name('cv.download');
    Route::put('/cv-infos', [PersonalInformationController::class, 'update'])->name('personal-information.update');

    // Experiences
    Route::resource('experiences', ExperienceController::class)->except(['show']);

    // User Hobbies
    Route::get('/user-hobbies', [UserHobbyController::class, 'index'])->name('user-hobbies.index');
    Route::get('/user-hobbies/create', [UserHobbyController::class, 'create'])->name('user-hobbies.create');
    Route::post('/user-hobbies', [UserHobbyController::class, 'store'])->name('user-hobbies.store');
    Route::delete('/user-hobbies/{user_id}/{hobby_id}', [UserHobbyController::class, 'destroy'])->name('user-hobbies.destroy');

    // User Competences
//    Route::resource('user-competences', UserCompetenceController::class)->except(['edit', 'update', 'show']);


    Route::post('/update-photo', [PersonalInformationController::class, 'updatePhoto'])
        ->name('personal-information.update-photo');
    // Summaries
    Route::resource('summaries', SummaryController::class);
    Route::post('summaries/{summary}/select', [SummaryController::class, 'select'])->name('summaries.select');
    Route::post('/summaries/deselect', [SummaryController::class, 'deselect'])->name('summaries.deselect');

    // Personal Information
    Route::get('/personal-information', [PersonalInformationController::class, 'index'])->name('personal-information.index');
    Route::get('/personal-information/edit', [PersonalInformationController::class, 'edit'])->name('personal-information.edit');

    // User Professions
    Route::get('/user-professions', [UserProfessionsController::class, 'index'])->name('user-professions.index');
    Route::get('/user-professions/create', [UserProfessionsController::class, 'create'])->name('user-professions.create');
    Route::post('/user-professions', [UserProfessionsController::class, 'store'])->name('user-professions.store');
    Route::delete('/user-professions/{user}', [UserProfessionsController::class, 'destroy'])->name('user-professions.destroy');

    // CV Models
    Route::post('/user-cv-models/select-active', [CvModelController::class, 'selectActiveModel']);
    Route::post('/user-cv-models', [CvModelController::class, 'addCvModel']);
    Route::get('/user-cv-models', [CvModelController::class, 'userCvModels'])->name('userCvModels.index');

    // CV Gallery
    Route::get('/cv-gallery/canadian', function () {
        return Inertia::render('CvGallery/Canadian');
    });

    Route::delete('/user-competences/{user_id}/{competence_id}', [UserCompetenceController::class, 'destroy'])->name('user-competences.destroy');
    Route::resource('user-competences', UserCompetenceController::class)->except(['destroy']);

    // Compétences manuelles
    Route::post('/user-manual-competences', [App\Http\Controllers\UserManualCompetenceController::class, 'store'])->name('user-manual-competences.store');
    Route::delete('/user-manual-competences/{user_id}/{competence_id}', [App\Http\Controllers\UserManualCompetenceController::class, 'destroy'])->name('user-manual-competences.destroy');

    // Hobbies manuels
    Route::post('/user-manual-hobbies', [App\Http\Controllers\UserManualHobbyController::class, 'store'])->name('user-manual-hobbies.store');
    Route::delete('/user-manual-hobbies/{user_id}/{hobby_id}', [App\Http\Controllers\UserManualHobbyController::class, 'destroy'])->name('user-manual-hobbies.destroy');

    // Sponsorship
    Route::get('/sponsorship', [SponsorshipController::class, 'index'])->name('sponsorship.index');
    Route::post('/sponsorship/generate-invitation', [SponsorshipController::class, 'generateInvitation']);
    Route::get('/sponsorship/progress', [SponsorshipController::class, 'getProgress']);
    Route::post('/sponsorship/support', [SponsorshipController::class, 'submitSupportTicket']);
    Route::post('/sponsorship/renew-code', [SponsorshipController::class, 'renewReferralCode'])->name('sponsorship.renew-code');
    Route::get('/sponsorship/code-info', [SponsorshipController::class, 'getReferralCodeInfo'])->name('sponsorship.code-info');

    // Admin-only routes
    Route::middleware('can:access-admin')->group(function () {
        // Admin prefix routes
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/dashboard', function () {
                return Inertia::render('Admin/Dashboard/Index', [
                    'auth' => [
                        'user' => auth()->user()
                    ]
                ]);
            })->name('dashboard');
            Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
            Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
            Route::get('/companies', [CompanyManagementController::class, 'index'])->name('companies.index');
            Route::get('/companies/{company}', [CompanyManagementController::class, 'show'])->name('companies.show');
            Route::put('/companies/{company}', [CompanyManagementController::class, 'update'])->name('companies.update');
            
            // Gestion du blog
            Route::resource('blog', \App\Http\Controllers\Admin\BlogManagementController::class);
            Route::get('/blog-stats', [\App\Http\Controllers\Admin\BlogManagementController::class, 'seoStats'])->name('blog.stats');
            
            // User management routes (commented out - controller doesn't exist yet)
            // Route::resource('users', \App\Http\Controllers\Admin\UserManagementController::class);
            // Route::get('/users/export', [\App\Http\Controllers\Admin\UserManagementController::class, 'export'])->name('users.export');
        });

        Route::resources([
            'experience-categories' => ExperienceCategoryController::class,
            'profession-categories' => ProfessionCategoryController::class,
            'hobbies' => HobbyController::class,
            'professions' => ProfessionController::class,
            'competences' => CompetenceController::class,
            'profession-missions' => ProfessionMissionController::class,
            'cv-models' => CvModelController::class,
        ]);

        // Routes pour la gestion des niveaux de parrainage
        Route::resource('referral-levels', \App\Http\Controllers\Admin\ReferralLevelController::class)
            ->names('admin.referral-levels');

        // Route pour initialiser les niveaux de parrainage
        Route::post('/referral-levels/initialize', [\App\Http\Controllers\Admin\ReferralLevelController::class, 'initialize'])
            ->name('admin.referral-levels.initialize');
    });


//    Route::middleware(['auth'])->group(function () {
        // Ajoutez au début de votre groupe de routes authentifiées
        Route::get('/dashboard', function () {
            return redirect('/cv-infos');  // ou n'importe quelle route que vous voulez
        })->name('dashboard');

        // Le reste de vos routes authentifiées...
//    });
    // Dans le groupe career-advisor
    Route::post('/export-pptx', [CareerAdvisorController::class, 'exportPptx'])->name('career-advisor.export-pptx');

    // Languages routes
    Route::get('/user-languages', [UserlanguageController::class, 'index'])->name('user-languages.index');
    Route::get('/user-languages/create', [UserlanguageController::class, 'create'])->name('user-languages.create');
    Route::post('/user-languages', [UserlanguageController::class, 'store'])->name('user-languages.store');
    Route::delete('/user-languages/{user_id}/{language_id}', [UserlanguageController::class, 'destroy'])->name('user-languages.destroy');
});

// Routes pour l'authentification sociale personnalisée
Route::get('auth/linkedin', [App\Http\Controllers\LinkedinController::class, 'redirectToLinkedin'])->name('linkedin.login');
Route::get('auth/linkedin/callback', [App\Http\Controllers\LinkedinController::class, 'handleLinkedinCallback'])->name('linkedin.callback');

// Anciennes routes Socialite (à conserver temporairement pour la transition)
Route::get('auth/{provider}', [App\Http\Controllers\SocialAuthController::class, 'redirectToProvider'])->name('social.login');
Route::get('auth/{provider}/callback', [App\Http\Controllers\SocialAuthController::class, 'handleProviderCallback'])->name('social.callback');
// Nouveaux endpoints compatibles Median
Route::get('/career-advisor/export-direct', [CareerAdvisorController::class, 'exportDirect']);
Route::get('/career-advisor/print-direct', [CareerAdvisorController::class, 'printDirect']);
Route::get('/cv/download-direct/{id}', [CvInfosController::class, 'downloadPdfDirect']);
Route::get('/cv/preview-print/{id}', [CvInfosController::class, 'previewPrint']);
// Route de test pour vérifier le schéma de la base de données
Route::get('/test-db-schema', [App\Http\Controllers\TestDbController::class, 'testSchema']);

// Routes Guest CV (sans authentification)
Route::prefix('guest-cv')->name('guest-cv.')->group(function () {
    // Page principale de création CV guest
    Route::get('/', [App\Http\Controllers\GuestCvController::class, 'index'])->name('index');

    // Prévisualisation CV (public)
    Route::post('/preview', [App\Http\Controllers\GuestCvController::class, 'preview'])->name('preview');

    // Preview HTML for direct rendering (for CVPreview component)
    Route::get('/preview-html/{id}', [App\Http\Controllers\GuestCvController::class, 'previewHtml'])->name('preview.html');

    // Initier paiement pour téléchargement
    Route::post('/payment/initiate', [App\Http\Controllers\GuestCvController::class, 'initiatePayment'])->name('payment.initiate');

    // Confirmer paiement
    Route::post('/payment/confirm', [App\Http\Controllers\GuestCvController::class, 'confirmPayment'])->name('payment.confirm');

    // Télécharger PDF (après paiement)
    Route::post('/generate-pdf', [App\Http\Controllers\GuestCvController::class, 'generatePdf'])->name('generate-pdf');
    Route::post('/download', [App\Http\Controllers\GuestCvController::class, 'generatePdf'])->name('download');

    // Migration des données vers compte utilisateur (après inscription)
    Route::middleware(['auth'])->group(function () {
        Route::post('/migrate', [App\Http\Controllers\GuestCvController::class, 'migrateGuestData'])->name('migrate');
    });
});

// Routes Job Portal (temporairement en Coming Soon)
Route::prefix('job-portal')->name('job-portal.')->group(function () {
    // Pages publiques - Coming Soon temporaire
    Route::get('/', [App\Http\Controllers\JobPortalController::class, 'index'])->name('index');

    // Création d'annonces simples (accessible sans authentification)
    Route::get('/create/simple-ad', [App\Http\Controllers\JobPortalController::class, 'createSimpleAdForm'])->name('create-simple-ad-form');
    Route::post('/create/simple-ad', [App\Http\Controllers\JobPortalController::class, 'createSimpleAd'])->name('create-simple-ad');

    // API publique
    Route::get('/api/search-suggestions', [App\Http\Controllers\JobPortalController::class, 'searchSuggestions'])->name('search-suggestions');

    // Routes authentifiées (routes spécifiques AVANT les routes avec paramètres)
    Route::middleware(['auth'])->group(function () {
        // Routes spécifiques d'abord
        Route::get('/my/applications', [App\Http\Controllers\JobPortalController::class, 'myApplications'])->name('my-applications');
        Route::get('/my/jobs', [App\Http\Controllers\JobPortalController::class, 'myJobs'])->name('my-jobs');
        Route::get('/profiles', [App\Http\Controllers\JobPortalController::class, 'searchProfiles'])->name('profiles');

        // Publication d'offres
        Route::post('/create', [App\Http\Controllers\JobPortalController::class, 'createJob'])->name('create');
        Route::patch('/applications/{application}/status', [App\Http\Controllers\JobPortalController::class, 'updateApplicationStatus'])->name('applications.update-status');

        // Routes avec paramètres EN DERNIER
        Route::post('/{job}/apply', [App\Http\Controllers\JobPortalController::class, 'apply'])->name('apply');
        Route::get('/{job}/applications', [App\Http\Controllers\JobPortalController::class, 'jobApplications'])->name('applications');
    });

    // Route paramétrique pour les offres individuelles - DOIT être en dernier
    Route::get('/{job}', [App\Http\Controllers\JobPortalController::class, 'show'])->name('show');
});

// Routes Préférences de notification
Route::prefix('settings')->name('settings.')->middleware(['auth'])->group(function () {
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'showSettings'])->name('notifications');
    Route::put('/notifications', [App\Http\Controllers\NotificationController::class, 'updateSettings'])->name('notifications.update');
});

// Routes Statistiques (admin/partenaires)
Route::prefix('statistics')->name('statistics.')->middleware(['auth'])->group(function () {
    Route::get('/', [App\Http\Controllers\StatisticsController::class, 'index'])->name('index');
    Route::get('/time-series', [App\Http\Controllers\StatisticsController::class, 'getTimeSeriesData'])->name('time-series');
    Route::get('/industry/{industry}', [App\Http\Controllers\StatisticsController::class, 'getIndustryDetails'])->name('industry');
    Route::get('/location/{location}', [App\Http\Controllers\StatisticsController::class, 'getLocationDetails'])->name('location');
    Route::get('/export/{type}', [App\Http\Controllers\StatisticsController::class, 'exportCsv'])->name('export');
});

// Routes Abonnement Entreprise
Route::prefix('company')->name('company.')->middleware(['auth'])->group(function () {
    Route::get('/subscription-plans', [App\Http\Controllers\CompanySubscriptionController::class, 'plans'])->name('subscription-plans');
    Route::post('/subscribe', [App\Http\Controllers\CompanySubscriptionController::class, 'subscribe'])->name('subscribe');
    Route::post('/subscription/confirm', [App\Http\Controllers\CompanySubscriptionController::class, 'confirmSubscription'])->name('subscription.confirm');
    Route::get('/usage', [App\Http\Controllers\CompanySubscriptionController::class, 'usage'])->name('usage');
});

// Routes APIDCA Partnership
Route::prefix('apidca')->name('apidca.')->group(function () {
    // Page publique APIDCA
    Route::get('/', [App\Http\Controllers\ApidcaController::class, 'index'])->name('index');
    
    // Désabonnement public (avec token)
    Route::get('/unsubscribe/{user}', [App\Http\Controllers\ApidcaController::class, 'unsubscribe'])
        ->name('unsubscribe');
    
    // Routes authentifiées
    Route::middleware(['auth'])->group(function () {
        // Inscription comme membre APIDCA
        Route::post('/join', [App\Http\Controllers\ApidcaController::class, 'joinApidca'])
            ->name('join');
        
        // Publication d'offres (membres APIDCA seulement)
        Route::post('/jobs', [App\Http\Controllers\ApidcaController::class, 'postJob'])
            ->name('jobs.store');
    });
    
    // Routes admin
    Route::middleware(['auth', 'can:access-admin'])->group(function () {
        Route::get('/stats', [App\Http\Controllers\ApidcaController::class, 'stats'])
            ->name('stats');
    });
});

require __DIR__.'/auth.php';
require __DIR__.'/cinetpay.php';
require __DIR__.'/unified-payments.php';
