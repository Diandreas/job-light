<?php

use App\Http\Controllers\{AddressController,
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
    PayPalController,
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
    UserProfessionsController};
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('language/{locale}', [LanguageController::class, 'switch'])->name('language.switch');

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

Route::post('/api/cv/analyze', [CareerAdvisorController::class, 'analyzeCV'])
    ->name('cv.analyze')
    ->middleware(['auth']);

Route::get('/payment', [PaymentController::class, 'index'])->name('payment.index');

Route::post('/api/paypal/capture-payment', [PayPalController::class, 'capturePayment'])
    ->middleware(['auth']);// Career Advisor Routes
Route::prefix('career-advisor')->group(function () {
    Route::get('/', [CareerAdvisorController::class, 'index'])->name('career-advisor.index');
    Route::get('/chats', [CareerAdvisorController::class, 'getUserChats'])->name('career-advisor.chats');
    Route::get('/chats/{contextId}', [CareerAdvisorController::class, 'getChat'])->name('career-advisor.chat.show');
    Route::post('/chat', [CareerAdvisorController::class, 'chat'])->name('career-advisor.chat');
    Route::post('/export', [CareerAdvisorController::class, 'export'])->name('career-advisor.export');
    Route::delete('/chats/{contextId}', [CareerAdvisorController::class, 'destroyChat'])->name('career-advisor.destroy');
});
Route::get('/cv/{id}/download', [CvInfosController::class, 'downloadPdf'])->name('cv.download');
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
    Route::post('/career-advisor/export', [CareerAdvisorController::class, 'export'])
        ->name('career-advisor.export');

        Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
    Route::get('/portfolio/edit', [PortfolioController::class, 'edit'])->name('portfolio.edit');
    Route::put('/portfolio', [PortfolioController::class, 'update'])->name('portfolio.update');
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
    Route::delete('/user-professions/{user}/{profession}', [UserProfessionsController::class, 'destroy'])->name('user-professions.destroy');

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


    // Sponsorship
    Route::get('/sponsorship', [SponsorshipController::class, 'index'])->name('sponsorship.index');
    Route::post('/sponsorship/generate-invitation', [SponsorshipController::class, 'generateInvitation']);
    Route::get('/sponsorship/progress', [SponsorshipController::class, 'getProgress']);
    Route::post('/sponsorship/support', [SponsorshipController::class, 'submitSupportTicket']);

    // Admin-only routes
    Route::middleware('can:access-admin')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Dashboard');
        })->name('dashboard');
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

require __DIR__.'/auth.php';
