<?php

use App\Http\Controllers\{
    AddressController,
    CareerAdvisorController,
    ChatHistoryController,
    CompetenceController,
    CvGalleryController,
    CvInfosController,
    CvModelController,
    DocumentExportController,
    ExperienceCategoryController,
    ExperienceController,
    HobbyController,
    LanguageController,
    PaymentController,
    PersonalInformationController,
    PortfolioController,
    ProfessionCategoryController,
    ProfessionController,
    ProfessionMissionController,
    ProfileController,
    SponsorshipController,
    SummaryController,
    UserCompetenceController,
    UserHobbyController,
    UserProfessionsController
};
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Routes
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::get('language/{locale}', [LanguageController::class, 'switch'])->name('language.switch');
Route::get('/payment', [PaymentController::class, 'index'])->name('payment.index');
Route::get('/portfolio/{identifier}', [PortfolioController::class, 'show'])
    ->name('portfolio.show')
    ->where('identifier', '.*');

// Authentication Required Routes
Route::middleware(['auth'])->group(function () {
    // Payment & Wallet Management
    Route::prefix('api')->group(function () {
        Route::post('/process-question-cost', [PaymentController::class, 'processQuestionCost']);
        Route::get('/check-download-status/{modelId}', [PaymentController::class, 'checkDownloadStatus']);
        Route::post('/update-wallet', [PaymentController::class, 'updateWallet']);
        Route::post('/process-download', [PaymentController::class, 'processDownload']);
        Route::get('/wallet/balance', [PaymentController::class, 'getBalance']);
        Route::post('/notchpay/callback', [PaymentController::class, 'handleCallback']);
        Route::post('/notchpay/webhook', [PaymentController::class, 'webhook'])->name('notchpay.webhook');
    });

    // Portfolio Management
//    Route::prefix('portfolio')->group(function () {
//        Route::get('/', [PortfolioController::class, 'index'])->name('portfolio.index');
//        Route::get('/edit', [PortfolioController::class, 'edit'])->name('portfolio.edit');
//        Route::put('/', [PortfolioController::class, 'update'])->name('portfolio.update');
//    });

    // Chat History Management
    Route::prefix('api')->group(function () {
        Route::get('/chat-histories', [ChatHistoryController::class, 'index']);
        Route::get('/chat-history/{contextId}', [ChatHistoryController::class, 'show']);
        Route::delete('/chat-history/{contextId}', [ChatHistoryController::class, 'destroy']);

        // Document Exports
        Route::get('/exports', [DocumentExportController::class, 'index']);
        Route::get('/exports/{export}', [DocumentExportController::class, 'download']);
        Route::delete('/exports/{export}', [DocumentExportController::class, 'destroy']);
    });
});

// Authenticated & Verified Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Career Advisor
    Route::prefix('career-advisor')->group(function () {
        Route::get('/', [CareerAdvisorController::class, 'index'])->name('career-advisor.index');
        Route::get('/chats', [CareerAdvisorController::class, 'getUserChats'])->name('career-advisor.chats');
        Route::get('/chats/{contextId}', [CareerAdvisorController::class, 'getChat'])->name('career-advisor.chat.show');
        Route::post('/chat', [CareerAdvisorController::class, 'chat'])->name('career-advisor.chat');
        Route::post('/export', [CareerAdvisorController::class, 'export'])->name('career-advisor.export');
        Route::post('/advice', [CareerAdvisorController::class, 'getAdvice'])->name('career-advisor.advice');
        Route::delete('/chats/{contextId}', [CareerAdvisorController::class, 'destroyChat'])->name('career-advisor.destroy');
    });

    // Profile Management
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    // CV Management
    Route::prefix('cv')->group(function () {
        Route::resource('cv-infos', CvInfosController::class);
        Route::get('preview/{id}', [CvInfosController::class, 'previewCv'])
            ->name('cv.preview')
            ->middleware('check.print');
        Route::get('download/{id}', [CvInfosController::class, 'downloadPdf'])->name('cv.download');

        // CV Models
        Route::get('models', [CvModelController::class, 'userCvModels'])->name('userCvModels.index');
        Route::post('models', [CvModelController::class, 'addCvModel']);
        Route::post('models/select-active', [CvModelController::class, 'selectActiveModel']);
    });

    // User Profile Components
    Route::prefix('user')->group(function () {
        // Experiences
        Route::resource('experiences', ExperienceController::class)->except(['show']);
        Route::delete('experiences/{experience}/attachment', [ExperienceController::class, 'deleteAttachment'])
            ->name('experiences.attachment.delete');

        // Hobbies
        Route::get('hobbies', [UserHobbyController::class, 'index'])->name('user-hobbies.index');
        Route::get('hobbies/create', [UserHobbyController::class, 'create'])->name('user-hobbies.create');
        Route::post('hobbies', [UserHobbyController::class, 'store'])->name('user-hobbies.store');
        Route::delete('hobbies/{user_id}/{hobby_id}', [UserHobbyController::class, 'destroy'])->name('user-hobbies.destroy');

        // Competences
        Route::resource('competences', UserCompetenceController::class)->except(['destroy']);
        Route::delete('competences/{user_id}/{competence_id}', [UserCompetenceController::class, 'destroy'])
            ->name('user-competences.destroy');

        // Professions
        Route::get('professions', [UserProfessionsController::class, 'index'])->name('user-professions.index');
        Route::get('professions/create', [UserProfessionsController::class, 'create'])->name('user-professions.create');
        Route::post('professions', [UserProfessionsController::class, 'store'])->name('user-professions.store');
        Route::delete('professions/{user}/{profession}', [UserProfessionsController::class, 'destroy'])
            ->name('user-professions.destroy');
    });

    // Personal Information
    Route::prefix('personal-information')->group(function () {
        Route::get('/', [PersonalInformationController::class, 'index'])->name('personal-information.index');
        Route::get('/edit', [PersonalInformationController::class, 'edit'])->name('personal-information.edit');
        Route::put('/', [PersonalInformationController::class, 'update'])->name('personal-information.update');
        Route::post('/update-photo', [PersonalInformationController::class, 'updatePhoto'])
            ->name('personal-information.update-photo');
    });

    // Summaries
    Route::resource('summaries', SummaryController::class);
    Route::post('summaries/{summary}/select', [SummaryController::class, 'select'])->name('summaries.select');
    Route::post('summaries/deselect', [SummaryController::class, 'deselect'])->name('summaries.deselect');

    // Sponsorship
//    Route::prefix('sponsorship')->group(function () {
//        Route::get('/', [SponsorshipController::class, 'index'])->name('sponsorship.index');
//        Route::post('/generate-invitation', [SponsorshipController::class, 'generateInvitation']);
//        Route::get('/progress', [SponsorshipController::class, 'getProgress']);
//        Route::post('/support', [SponsorshipController::class, 'submitSupportTicket']);
//    });

    // Admin Routes
    Route::middleware('can:access-admin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');

        // Admin Resources
        Route::resources([
            'experience-categories' => ExperienceCategoryController::class,
            'profession-categories' => ProfessionCategoryController::class,
            'hobbies' => HobbyController::class,
            'professions' => ProfessionController::class,
            'competences' => CompetenceController::class,
            'profession-missions' => ProfessionMissionController::class,
            'cv-models' => CvModelController::class,
        ]);
    });
});

// Authentication Routes
require __DIR__.'/auth.php';
